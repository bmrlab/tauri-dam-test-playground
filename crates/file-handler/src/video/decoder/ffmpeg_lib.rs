use std::path::Path;
use ffmpeg_next::ffi::*;
use tracing::error;
use super::{transcode::transcoder, utils};


fn save_video_frames(
    video_path: impl AsRef<Path>,
    frames_dir: impl AsRef<Path>,
) -> anyhow::Result<()> {
    let mut video = ffmpeg_next::format::input(&video_path.as_ref().to_path_buf())?;
    let video_stream = &video
        .streams()
        .best(ffmpeg_next::media::Type::Video)
        .ok_or(anyhow::anyhow!("no video stream found"))?;
    let video_stream_index = video_stream.index();

    let decoder_context = ffmpeg_next::codec::Context::from_parameters(video_stream.parameters())?;
    let mut decoder = decoder_context.decoder().video()?;

    let (target_width, target_height) = if decoder.width() > decoder.height() {
        (
            768,
            (768.0 * decoder.height() as f32 / decoder.width() as f32) as u32,
        )
    } else {
        (
            (768.0 * decoder.width() as f32 / decoder.height() as f32) as u32,
            768,
        )
    };

    let mut scaler = ffmpeg_next::software::scaling::context::Context::get(
        decoder.format(),
        decoder.width(),
        decoder.height(),
        AVPixelFormat::AV_PIX_FMT_RGB24.into(),
        target_width,
        target_height,
        ffmpeg_next::software::scaling::flag::Flags::BICUBIC,
    )?;

    let time_base: f64 = video_stream.time_base().into();
    let mut last_timestamp = 0;

    let mut receive_and_process_decoded_frames =
        |decoder: &mut ffmpeg_next::decoder::Video| -> Result<(), ffmpeg_next::Error> {
            let mut frame = ffmpeg_next::frame::Video::empty();
            while decoder.receive_frame(&mut frame).is_ok() {
                // get timestamp in milliseconds
                let current_timestamp =
                    (frame.timestamp().unwrap() as f64 * time_base * 1000.0) as i64;

                // extract frame every 1 seconds
                if current_timestamp == 0 || current_timestamp - last_timestamp >= 1_000 {
                    let mut scaled_frame = ffmpeg_next::frame::Video::empty();
                    scaler.run(&mut frame, &mut scaled_frame).unwrap();
                    let frames_dir = frames_dir.as_ref().to_path_buf().clone();

                    let array = utils::convert_frame_to_ndarray_rgb24(&mut scaled_frame).expect("");
                    let image = utils::array_to_image(array);

                    if let Err(e) =
                        image.save(frames_dir.join(format!("{}.png", current_timestamp)))
                    {
                        error!("Failed to save frame: {}", e);
                    }

                    last_timestamp = current_timestamp;
                }
            }
            Ok(())
        };

    for (stream, packet) in video.packets() {
        if stream.index() == video_stream_index {
            if decoder.send_packet(&packet).is_ok() {
                receive_and_process_decoded_frames(&mut decoder)?;
            }
        }
    }

    decoder.send_eof()?;
    receive_and_process_decoded_frames(&mut decoder)?;

    Ok(())
}

fn save_video_audio(
    video_path: impl AsRef<Path>,
    audio_path: impl AsRef<Path>,
) -> anyhow::Result<()> {
    let mut video = ffmpeg_next::format::input(&video_path.as_ref().to_path_buf())?;
    let mut inner_output = ffmpeg_next::format::output(&audio_path)?;

    let audio_stream = video
        .streams()
        .best(ffmpeg_next::media::Type::Audio)
        .ok_or(anyhow::anyhow!("no audio found in video"))?;
    let audio_stream_index = audio_stream.index();

    let mut transcoder = transcoder(&mut video, &mut inner_output, &audio_path, "anull")?;

    inner_output.set_metadata(video.metadata().to_owned());
    inner_output.write_header()?;

    for (stream, mut packet) in video.packets() {
        if stream.index() == audio_stream_index {
            packet.rescale_ts(stream.time_base(), transcoder.in_time_base);
            transcoder.send_packet_to_decoder(&packet);
            transcoder.receive_and_process_decoded_frames(&mut inner_output);
        }
    }

    transcoder.send_eof_to_decoder();
    transcoder.receive_and_process_decoded_frames(&mut inner_output);

    transcoder.flush_filter();
    transcoder.get_and_process_filtered_frames(&mut inner_output);

    transcoder.send_eof_to_encoder();
    transcoder.receive_and_process_encoded_packets(&mut inner_output);

    inner_output.write_trailer().unwrap();

    Ok(())
}
