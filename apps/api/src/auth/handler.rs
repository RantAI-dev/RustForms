// File: apps/api/src/auth/handler.rs

use crate::auth::password::{hash_password, verify_password};
use crate::models::{Claims, LoginPayload, SignupPayload, LoginResponse};
use crate::state::AppState;
use axum::{
    extract::{State, Json},
    http::StatusCode,
    response::IntoResponse,
};
use chrono::Utc;
use jsonwebtoken::{encode, Header, EncodingKey};
use utoipa;

#[utoipa::path(
    post,
    path = "/api/auth/signup",
    request_body = SignupPayload,
    responses(
        (status = 201, description = "User created successfully"),
        (status = 409, description = "Email already exists"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Authentication"
)]
pub async fn handle_signup(
    State(state): State<AppState>,
    Json(payload): Json<SignupPayload>,
) -> impl IntoResponse {
    let password_hash = match hash_password(&payload.password) {
        Ok(hash) => hash,
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to hash password",
            )
                .into_response()
        }
    };

    let result = sqlx::query!(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
        payload.email,
        password_hash
    )
    .execute(&state.db_pool)
    .await;

    match result {
        Ok(_) => (StatusCode::CREATED, "User created successfully").into_response(),
        Err(sqlx::Error::Database(db_err)) if db_err.is_unique_violation() => {
            (StatusCode::CONFLICT, "Email already exists").into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to create user").into_response(),
    }
}

#[utoipa::path(
    post,
    path = "/api/auth/login",
    request_body = LoginPayload,
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 401, description = "Invalid credentials"),
        (status = 500, description = "Internal server error")
    ),
    tag = "Authentication"
)]
pub async fn handle_login(
    State(state): State<AppState>,
    Json(payload): Json<LoginPayload>,
) -> impl IntoResponse {
    let user = match sqlx::query!(
        "SELECT id, password_hash FROM users WHERE email = $1",
        payload.email
    )
    .fetch_optional(&state.db_pool)
    .await
    {
        Ok(Some(user)) => user,
        _ => return (StatusCode::UNAUTHORIZED, "Invalid credentials").into_response(),
    };

    if !verify_password(&payload.password, &user.password_hash).unwrap_or(false) {
        return (StatusCode::UNAUTHORIZED, "Invalid credentials").into_response();
    }

    let claims = Claims {
        sub: user.id.to_string(), // .to_string() works on UUIDs
        exp: (Utc::now() + chrono::Duration::hours(24)).timestamp() as usize,
    };
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    )
    .unwrap();

    let response = LoginResponse { token };
    (StatusCode::OK, axum::Json(response)).into_response()
}