// File: apps/api/src/main.rs
use api::run; // Use the run function from our library

#[tokio::main]
async fn main() {
    run().await;
}