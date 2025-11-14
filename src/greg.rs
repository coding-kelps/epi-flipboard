use chrono::DateTime;
use entity::article::ActiveModel;
use rss::Channel;
use sea_orm::Set;
use sea_orm::{Database, EntityTrait};
use std::error::Error;

pub async fn aggregate_feeds(db_url: &str) -> Result<(), Box<dyn Error>> {
    let db = Database::connect(db_url).await?;

    let content =
        reqwest::get("https://rss.nytimes.com/services/xml/rss/nyt/World.xml")
            .await?
            .bytes()
            .await?;
    let channel = Channel::read_from(&content[..])?;

    for item in channel.items() {
        let title = item.title().unwrap_or("No title").to_string();
        let link = item.link().unwrap_or("").to_string();
        let description = item.description().unwrap_or("").to_string();
        let authors = item.author().unwrap_or("Unknown author").to_string();

        let published_at = item.pub_date().and_then(|date_str| {
            DateTime::parse_from_rfc2822(date_str)
                .ok()
                .map(|dt| dt.with_timezone(&chrono::Utc).naive_utc())
        });

        let mut image_url = String::from("https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop");

        if let Some(media_extensions) = item.extensions().get("media") {
            if let Some(content_list) = media_extensions.get("content") {
                for content in content_list {
                    if let Some(url) = content.attrs.get("url") {
                        image_url = url.clone();
                        break;
                    }
                }
            }
        }

        let article = ActiveModel {
            title: Set(title),
            authors: Set(authors),
            publishers: Set("New YORK TIMES".to_string()),
            description: Set(description),
            content: Set(String::new()),
            original_url: Set(link),
            tag: Set("WORLD".to_string()),
            image_url: Set(image_url),
            published_at: Set(published_at),
            created_at: Set(chrono::Utc::now().naive_utc()),
            ..Default::default()
        };

        entity::article::Entity::insert(article).exec(&db).await?;
    }
    Ok(())
}
