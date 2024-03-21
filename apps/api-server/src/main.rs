extern crate api_server; // 引入 lib.rs 里面的内容
use api_server::{
    ctx::default::{Ctx, Store},
    CtxStore,
};
use axum::routing::get;
use content_library::{load_library, upgrade_library_schemas, Library};
use dotenvy::dotenv;
use rspc::integrations::httpz::Request;
use std::{
    env,
    net::SocketAddr,
    path::Path,
    sync::{Arc, Mutex},
};
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};
use tracing::{debug, info, error};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    match dotenv() {
        Ok(path) => println!(".env read successfully from {}", path.display()),
        Err(e) => println!("Could not load .env file: {e}"),
    };
    init_tracing(); // should be after dotenv() so RUST_LOG in .env file will be loaded
                    // debug!("test debug output");
    let local_data_root = match env::var("LOCAL_DATA_DIR") {
        Ok(path) => Path::new(&path).to_path_buf(),
        Err(_e) => {
            // #[cfg(not(debug_assertions))]
            // {}
            panic!("'$LOCAL_DATA_DIR' is not set ({})", _e)
        }
    };
    std::fs::create_dir_all(&local_data_root).unwrap();

    let resources_dir = match env::var("LOCAL_RESOURCES_DIR") {
        Ok(path) => Path::new(&path).to_path_buf(),
        Err(_e) => {
            panic!("'$LOCAL_RESOURCES_DIR' is not set ({})", _e)
        }
    };

    upgrade_library_schemas(&local_data_root).await;

    let current_library = Arc::new(Mutex::<Option<Library>>::new(None));

    let mut default_store = Store::new(local_data_root.join("settings.json"));
    if let Err(e) = default_store.load() {
        tracing::error!("Failed to load store: {:?}", e);
        return;
    }

    if let Some(library_id) = default_store.get("current-library-id") {
        let library = match load_library(&local_data_root, &library_id).await {
            Ok(library) => library,
            Err(e) => {
                error!("Failed to load library: {:?}", e);
                return;
            }
        };
        current_library.lock().unwrap().replace(library);
    }

    let cors = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any)
        .allow_origin(Any);

    let store = Arc::new(Mutex::new(default_store));
    let router = api_server::router::get_router::<Ctx<Store>>();
    let ctx = Ctx::<Store>::new(local_data_root, resources_dir, store, current_library);

    let app: axum::Router = axum::Router::new()
        .route("/", get(|| async { "Hello 'rspc'!" }))
        .nest( "/rspc", {
            router.clone().endpoint({
                move |req: Request| {
                    info!("Client requested operation '{}'", req.uri().path());
                    // 不能每次 new 而应该是 clone，这样会保证 ctx 里面的每个元素每次只是新建了引用
                    ctx.clone()
                }
            }).axum()
        })
        // .nest_service("/artifacts", ServeDir::new(local_data_dir.clone()))
        .nest_service("/file/localhost", ServeDir::new("/"))
        .layer(cors);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3001));
    debug!("Listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}

fn init_tracing() {
    tracing_subscriber::registry()
        .with(
            // load filters from the `RUST_LOG` environment variable.
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "api_server=debug".into())
        )
        .with(tracing_subscriber::fmt::layer().with_ansi(true))
        .init();
}
