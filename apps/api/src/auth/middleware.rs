// File: apps/api/src/auth/middleware.rs

use crate::models::Claims;
use crate::state::AppState;
use axum::{
    async_trait,
    body::Body,
    extract::{FromRequestParts, State},
    http::{header, request::Parts, Request, StatusCode},
    middleware::Next, // <-- Note: Next is imported here
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};


pub async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request<Body>,
    next: Next, // <-- THE FIX: It's just `Next`, not `Next<Body>`
) -> Result<Response, StatusCode> {
    let token = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|auth_header| auth_header.to_str().ok())
        .and_then(|auth_value| auth_value.strip_prefix("Bearer "));

    let Some(token) = token else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|_| StatusCode::UNAUTHORIZED)?
    .claims;

    request.extensions_mut().insert(claims.sub);

    // This line now works, because next.run() expects the Request<Body>
    Ok(next.run(request).await)
}


// This part is unchanged and correct
pub struct UserId(pub String);

#[async_trait]
impl<S> FromRequestParts<S> for UserId
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<String>()
            .cloned()
            .map(UserId)
            .ok_or(StatusCode::INTERNAL_SERVER_ERROR)
    }
}