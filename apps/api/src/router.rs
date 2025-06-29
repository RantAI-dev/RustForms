// File: src/router.rs
use crate::{
    auth::{handler as auth_handler, middleware as auth_middleware},
    forms::handler as forms_handler,
    state::AppState,
};
use axum::{
    middleware,
    routing::{delete, get, post},
    Router,
};

/// Creates a router for the application's API endpoints.
/// Note that the "/api" prefix is no longer here; it will be added when nesting this router.
pub fn create_api_router(state: AppState) -> Router {
    let protected_routes = Router::new()
        .route("/forms", get(forms_handler::get_user_forms))
        .route("/forms", post(forms_handler::create_form))
        .route("/forms/:id", get(forms_handler::get_form_by_id))
        .route("/forms/:id", delete(forms_handler::delete_form))
        .route("/forms/:id/submissions", get(forms_handler::get_form_submissions))
        .route("/submissions/:id", delete(forms_handler::delete_submission))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            auth_middleware::auth_middleware,
        ));

    Router::new()
        .route("/submit/:secret", post(forms_handler::handle_form_submission))
        .route("/auth/signup", post(auth_handler::handle_signup))
        .route("/auth/login", post(auth_handler::handle_login))
        .merge(protected_routes)
        .with_state(state)
}