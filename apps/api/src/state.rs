use lettre::transport::smtp::AsyncSmtpTransport;
use lettre::Tokio1Executor;
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: PgPool,
    pub mailer: Arc<AsyncSmtpTransport<Tokio1Executor>>,
    pub jwt_secret: String,
}