use chrono::DateTime;
use entity::article::ActiveModel;
use nanohtml2text::html2text;
use opml::OPML;
use reqwest::{Client, Url};
use rss::Channel;
use sea_orm::{Database, DatabaseConnection, EntityTrait, Set};
use std::error::Error;
use std::fs;
use std::time::Duration;
use tokio::task::JoinSet;

const MAX_FEEDS_PER_CATEGORY: usize = 7;
const MAX_ARTICLES_PER_FEED: usize = 4;

const BANNED_DOMAINS: &[&str] =
    &["bbc.pdn.tritondigital.com", "open.live.bbc.co.uk"];

fn is_banned_url(url: &str) -> bool {
    BANNED_DOMAINS.iter().any(|domain| url.contains(domain))
}

pub async fn aggregate_feeds(db_url: &str) -> Result<(), Box<dyn Error>> {
    let db = Database::connect(db_url).await?;
    let client = Client::builder().timeout(Duration::from_secs(1)).build()?;

    let mut set = JoinSet::new();
    let paths = fs::read_dir("awesome-rss-feeds/recommended/with_category")?;

    for path in paths {
        let path = path?.path();
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();
        let category =
            file_name.split('.').next().unwrap_or("unknown").to_uppercase();
        let content = fs::read_to_string(&path)?;
        let opml = OPML::from_str(&content)?;

        for outline in opml
            .body
            .outlines
            .into_iter()
            .flat_map(|o| o.outlines)
            .take(MAX_FEEDS_PER_CATEGORY)
        {
            let Some(xml_url) = outline.xml_url else { continue };
            // if is_banned_url(&xml_url) {
            //     continue;
            // }
            let publisher = outline.title.unwrap_or_else(|| "Unknown".into());
            let db = db.clone();
            let client = client.clone();
            let category = category.clone();

            set.spawn(async move {
                if let Err(e) = collect_rss_data(
                    &db, &client, &xml_url, &category, &publisher,
                )
                .await
                {
                    tracing::debug!(
                        "Failed to process {} ({}): {}",
                        publisher,
                        xml_url,
                        e
                    );
                }
            });
        }
    }

    while let Some(res) = set.join_next().await {
        res?;
    }
    Ok(())
}

async fn validate_image(url: &str, client: &Client) -> bool {
    if is_banned_url(url) {
        return false;
    }

    let Ok(parsed) = Url::parse(url) else { return false };
    if !["http", "https"].contains(&parsed.scheme()) {
        return false;
    }

    let Ok(result) = tokio::time::timeout(
        Duration::from_millis(800),
        client.head(url).send(),
    )
    .await
    else {
        return false;
    };

    match result {
        Ok(res) => {
            res.status().is_success()
                && res
                    .headers()
                    .get("content-type")
                    .and_then(|v| v.to_str().ok())
                    .is_some_and(|v| v.starts_with("image/"))
        },
        Err(_) => false,
    }
}

async fn collect_rss_data(
    db: &DatabaseConnection, client: &Client, xml_url: &str, category: &str,
    publisher: &str,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let content = tokio::time::timeout(Duration::from_secs(2), async {
        client.get(xml_url).send().await?.bytes().await
    })
    .await??;
    let channel = Channel::read_from(&content[..])?;

    let mut articles = Vec::new();
    for item in channel.items() {
        if articles.len() >= MAX_ARTICLES_PER_FEED {
            break;
        }
        let Some(link) = item.link() else { continue };

        let Some(pub_date) =
            item.pub_date().and_then(|d| DateTime::parse_from_rfc2822(d).ok())
        else {
            continue;
        };

        let mut image_url = String::new();
        if let Some(media) = item.extensions().get("media") {
            if let Some(content) = media.get("content") {
                let mut checked = 0;
                for c in content {
                    if checked >= 2 {
                        break;
                    }
                    if let Some(url) = c.attrs.get("url") {
                        if is_banned_url(url) {
                            continue;
                        }
                        checked += 1;
                        if validate_image(url, client).await {
                            image_url = url.to_string();
                            break;
                        }
                    }
                }
            }
        }

        if image_url.is_empty() {
            continue;
        }

        let description = item.description().unwrap_or_default();
        let content = item.content().unwrap_or(description);

        articles.push(ActiveModel {
            title: Set(item.title().unwrap_or("No title").to_string()),
            authors: Set(item.author().unwrap_or("Unknown").to_string()),
            publishers: Set(publisher.to_string()),
            description: Set(html2text(description)),
            content: Set(html2text(content)),
            original_url: Set(link.to_string()),
            tag: Set(category.to_string()),
            image_url: Set(image_url),
            published_at: Set(pub_date.with_timezone(&chrono::Utc).naive_utc()),
            created_at: Set(chrono::Utc::now().naive_utc()),
            ..Default::default()
        });
    }

    if !articles.is_empty() {
        entity::article::Entity::insert_many(articles)
            .on_conflict(
                sea_orm::sea_query::OnConflict::columns([
                    entity::article::Column::OriginalUrl,
                ])
                .do_nothing()
                .to_owned(),
            )
            .exec(db)
            .await?;
    }
    Ok(())
}
