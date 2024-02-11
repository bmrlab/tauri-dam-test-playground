use std::path::PathBuf;
use rspc::Rspc;

#[derive(Clone)]
pub struct Ctx {
    pub x_demo_header: Option<String>,
    pub local_data_dir: PathBuf,
    pub resources_dir: PathBuf,
}
pub const R: Rspc<Ctx> = Rspc::new();

pub mod routes;
pub mod router;
