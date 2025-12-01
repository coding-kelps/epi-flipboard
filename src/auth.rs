use crate::{error::AppError, state::AppState};
use askama::Template;
use axum::response::{Html, IntoResponse, Redirect};
use axum::{extract::State, Form};
use entity::user::ActiveModel;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::Deserialize;
use tower_cookies::{Cookie, Cookies};

#[derive(Template)]
#[template(path = "signup.html")]
struct SignupTemplate;

#[derive(Template)]
#[template(path = "login.html")]
struct LoginTemplate;

#[derive(Deserialize)]
pub struct SignupForm {
    email: String,
    password: String,
    username: String,
}

#[derive(Deserialize)]
pub struct LoginForm {
    email: String,
    password: String,
}

pub async fn get_signup() -> Result<Html<String>, AppError> {
    let template = SignupTemplate;
    let html = template.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;
    Ok(Html(html))
}

pub async fn get_login() -> Result<Html<String>, AppError> {
    let template = LoginTemplate;
    let html = template.render().map_err(|_| {
        AppError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Template error",
        ))
    })?;
    Ok(Html(html))
}

pub async fn logout(cookies: Cookies) -> Redirect {
    cookies.remove(Cookie::new("user_id", ""));
    cookies.remove(Cookie::new("username", ""));
    Redirect::to("/home")
}

pub async fn post_signup(
    State(state): State<AppState>,
    cookies: Cookies,
    Form(form): Form<SignupForm>,
) -> Result<impl IntoResponse, AppError> {
    let existing_email = entity::user::Entity::find()
        .filter(entity::user::Column::Email.eq(&form.email))
        .one(&state.db)
        .await?;

    if existing_email.is_some() {
        return Ok(Html(
            r#"<script>Toast.error('This email is already registered', 'Email exists');</script>"#.to_string()
        ));
    }

    let existing_username = entity::user::Entity::find()
        .filter(entity::user::Column::Username.eq(&form.username))
        .one(&state.db)
        .await?;

    if existing_username.is_some() {
        return Ok(Html(
            r#"<script>Toast.error('This username is already taken', 'Username exists');</script>"#.to_string()
        ));
    }

    let password_hash = bcrypt::hash(&form.password, bcrypt::DEFAULT_COST)
        .map_err(|_| AppError::HashError)?;

    let user = ActiveModel {
        email: Set(form.email.clone()),
        password_hash: Set(password_hash),
        username: Set(form.username.clone()),
        ..Default::default()
    }
    .insert(&state.db)
    .await?;

    cookies.add(Cookie::new("user_id", user.id.to_string()));
    cookies.add(Cookie::new("username", form.username.clone()));

    let nav = format!(
        "<nav id='header-nav' hx-swap-oob='true'><button>Newsletters</button><a href='#search' class='search-icon-mobile'>🔍</a><span style='color: var(--color-text); margin: 0 1rem;'>Welcome, {}</span><a href='/logout'>Log out</a></nav>",
        form.username
    );

    Ok(Html(format!(
        r#"<script>
        Toast.success('Welcome to EpiFlipBoard!');
        document.querySelector('.modal-overlay').remove();
        </script>{}"#,
        nav
    )))
}

pub async fn post_login(
    State(state): State<AppState>,
    cookies: Cookies,
    Form(form): Form<LoginForm>,
) -> Result<impl IntoResponse, AppError> {
    let user = entity::user::Entity::find()
        .filter(entity::user::Column::Email.eq(&form.email))
        .one(&state.db)
        .await?;

    let Some(user) = user else {
        return Ok(Html(
            r#"<script>Toast.error('Invalid email or password', 'Login failed');</script>"#.to_string()
        ));
    };

    let valid = bcrypt::verify(&form.password, &user.password_hash)
        .map_err(|_| AppError::HashError)?;

    if !valid {
        return Ok(Html(
            r#"<script>Toast.error('Invalid email or password', 'Login failed');</script>"#.to_string()
        ));
    }

    cookies.add(Cookie::new("user_id", user.id.to_string()));
    cookies.add(Cookie::new("username", user.username.clone()));

    let nav = format!(
        "<nav id='header-nav' hx-swap-oob='true'><button>Newsletters</button><a href='#search' class='search-icon-mobile'>🔍</a><span style='color: var(--color-text); margin: 0 1rem;'>Welcome, {}</span><a href='/logout'>Log out</a></nav>",
        user.username
    );

    Ok(Html(format!(
        r#"<script>
        Toast.success('Welcome back, {}!');
        document.querySelector('.modal-overlay').remove();
        </script>{}"#,
        user.username, nav
    )))
}
