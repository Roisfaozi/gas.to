# Bio Shortlink
> Generated by [`prisma-markdown`](https://github.com/samchon/prisma-markdown)

- [default](#default)

## default
```mermaid
erDiagram
"bio_links" {
  String id PK
  String bio_page_id FK
  String title
  String url
  String icon "nullable"
  Int sort_order "nullable"
  Boolean is_active "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"bio_pages" {
  String id PK
  String username UK
  String title
  String description "nullable"
  String theme "nullable"
  String user_id FK
  String workspace_id FK "nullable"
  visibility_type visibility "nullable"
  String custom_domain "nullable"
  String seo_title "nullable"
  String seo_description "nullable"
  String social_image_url "nullable"
  String profile_image_url "nullable"
  Json theme_config "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
  BigInt archived_at "nullable"
}
"clicks" {
  String id PK
  String link_id FK
  String ip "nullable"
  String city "nullable"
  String country "nullable"
  String device "nullable"
  String browser "nullable"
  String os "nullable"
  String referer "nullable"
  String user_agent "nullable"
  String session_id "nullable"
  String utm_source "nullable"
  String utm_medium "nullable"
  String utm_campaign "nullable"
  String device_type "nullable"
  String screen_resolution "nullable"
  Boolean is_unique "nullable"
  Int visit_duration "nullable"
  String workspace_id FK "nullable"
  String visitor_session_id FK "nullable"
  String visitor_id "nullable"
  String screen_size "nullable"
  String language "nullable"
  String timezone "nullable"
  String platform "nullable"
  String fingerprint "nullable"
  BigInt created_at "nullable"
}
"daily_stats" {
  String id PK
  Int total_clicks "nullable"
  Int unique_clicks "nullable"
  Int new_links "nullable"
  BigInt date "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"link_metadata" {
  String link_id PK
  String title "nullable"
  String description "nullable"
  String image_url "nullable"
  String favicon_url "nullable"
  String domain "nullable"
  BigInt last_checked_at "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"link_tag_relations" {
  String link_id FK
  String tag_id FK
  DateTime created_at "nullable"
}
"link_tags" {
  String id PK
  String name
  String color "nullable"
  String workspace_id FK "nullable"
  DateTime created_at "nullable"
}
"links" {
  String id PK
  String short_code UK
  String original_url
  String title "nullable"
  String user_id FK
  String bio_page_id FK "nullable"
  Boolean is_active "nullable"
  String workspace_id FK "nullable"
  link_type type "nullable"
  link_status status "nullable"
  visibility_type visibility "nullable"
  String password_hash "nullable"
  String utm_source "nullable"
  String utm_medium "nullable"
  String utm_campaign "nullable"
  String custom_domain "nullable"
  Int click_limit "nullable"
  DateTime archived_at "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
  BigInt expires_at "nullable"
}
"social_links" {
  String id PK
  String bio_page_id FK
  String platform
  String url
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"user_settings" {
  String user_id PK
  String theme "nullable"
  String language "nullable"
  String timezone "nullable"
  Json notification_preferences "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"users" {
  String id PK
  String email UK
  String name "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"workspace_members" {
  String workspace_id FK
  String user_id FK
  String role
  DateTime created_at "nullable"
}
"workspaces" {
  String id PK
  String name
  String slug UK
  String description "nullable"
  String owner_id FK
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"geolocation_data" {
  String id PK
  String session_id FK "nullable"
  Float latitude "nullable"
  Float longitude "nullable"
  Float accuracy "nullable"
  String city "nullable"
  String region "nullable"
  String country "nullable"
  String postal_code "nullable"
  Boolean consent_given "nullable"
  BigInt created_at "nullable"
}
"visitor_data" {
  String id PK
  String visitor_id
  String name "nullable"
  String email "nullable"
  String phone "nullable"
  Boolean consent_given "nullable"
  BigInt consent_timestamp "nullable"
  BigInt created_at "nullable"
  BigInt updated_at "nullable"
}
"visitor_sessions" {
  String id PK
  String visitor_id
  String fingerprint "nullable"
  Int duration "nullable"
  Boolean is_returning "nullable"
  BigInt started_at "nullable"
  BigInt ended_at "nullable"
  BigInt created_at "nullable"
}
"bio_links" }o--|| "bio_pages" : bio_pages
"bio_pages" }o--|| "users" : users
"bio_pages" }o--o| "workspaces" : workspaces
"clicks" }o--|| "links" : links
"clicks" }o--o| "visitor_sessions" : visitor_sessions
"clicks" }o--o| "workspaces" : workspaces
"link_metadata" |o--|| "links" : links
"link_tag_relations" }o--|| "links" : links
"link_tag_relations" }o--|| "link_tags" : link_tags
"link_tags" }o--o| "workspaces" : workspaces
"links" }o--o| "bio_pages" : bio_pages
"links" }o--|| "users" : users
"links" }o--o| "workspaces" : workspaces
"social_links" }o--|| "bio_pages" : bio_pages
"user_settings" |o--|| "users" : users
"workspace_members" }o--|| "users" : users
"workspace_members" }o--|| "workspaces" : workspaces
"workspaces" }o--|| "users" : users
"geolocation_data" }o--o| "visitor_sessions" : visitor_sessions
```

### `bio_links`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `bio_page_id`: 
  - `title`: 
  - `url`: 
  - `icon`: 
  - `sort_order`: 
  - `is_active`: 
  - `created_at`: 
  - `updated_at`: 

### `bio_pages`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `username`: 
  - `title`: 
  - `description`: 
  - `theme`: 
  - `user_id`: 
  - `workspace_id`: 
  - `visibility`: 
  - `custom_domain`: 
  - `seo_title`: 
  - `seo_description`: 
  - `social_image_url`: 
  - `profile_image_url`: 
  - `theme_config`: 
  - `created_at`: 
  - `updated_at`: 
  - `archived_at`: 

### `clicks`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `link_id`: 
  - `ip`: 
  - `city`: 
  - `country`: 
  - `device`: 
  - `browser`: 
  - `os`: 
  - `referer`: 
  - `user_agent`: 
  - `session_id`: 
  - `utm_source`: 
  - `utm_medium`: 
  - `utm_campaign`: 
  - `device_type`: 
  - `screen_resolution`: 
  - `is_unique`: 
  - `visit_duration`: 
  - `workspace_id`: 
  - `visitor_session_id`: 
  - `visitor_id`: 
  - `screen_size`: 
  - `language`: 
  - `timezone`: 
  - `platform`: 
  - `fingerprint`: 
  - `created_at`: 

### `daily_stats`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `total_clicks`: 
  - `unique_clicks`: 
  - `new_links`: 
  - `date`: 
  - `created_at`: 
  - `updated_at`: 

### `link_metadata`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `link_id`: 
  - `title`: 
  - `description`: 
  - `image_url`: 
  - `favicon_url`: 
  - `domain`: 
  - `last_checked_at`: 
  - `created_at`: 
  - `updated_at`: 

### `link_tag_relations`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `link_id`: 
  - `tag_id`: 
  - `created_at`: 

### `link_tags`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `name`: 
  - `color`: 
  - `workspace_id`: 
  - `created_at`: 

### `links`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `short_code`: 
  - `original_url`: 
  - `title`: 
  - `user_id`: 
  - `bio_page_id`: 
  - `is_active`: 
  - `workspace_id`: 
  - `type`: 
  - `status`: 
  - `visibility`: 
  - `password_hash`: 
  - `utm_source`: 
  - `utm_medium`: 
  - `utm_campaign`: 
  - `custom_domain`: 
  - `click_limit`: 
  - `archived_at`: 
  - `created_at`: 
  - `updated_at`: 
  - `expires_at`: 

### `social_links`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `bio_page_id`: 
  - `platform`: 
  - `url`: 
  - `created_at`: 
  - `updated_at`: 

### `user_settings`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `user_id`: 
  - `theme`: 
  - `language`: 
  - `timezone`: 
  - `notification_preferences`: 
  - `created_at`: 
  - `updated_at`: 

### `users`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `email`: 
  - `name`: 
  - `created_at`: 
  - `updated_at`: 

### `workspace_members`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `workspace_id`: 
  - `user_id`: 
  - `role`: 
  - `created_at`: 

### `workspaces`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `name`: 
  - `slug`: 
  - `description`: 
  - `owner_id`: 
  - `created_at`: 
  - `updated_at`: 

### `geolocation_data`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `session_id`: 
  - `latitude`: 
  - `longitude`: 
  - `accuracy`: 
  - `city`: 
  - `region`: 
  - `country`: 
  - `postal_code`: 
  - `consent_given`: 
  - `created_at`: 

### `visitor_data`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `visitor_id`: 
  - `name`: 
  - `email`: 
  - `phone`: 
  - `consent_given`: 
  - `consent_timestamp`: 
  - `created_at`: 
  - `updated_at`: 

### `visitor_sessions`
This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.

**Properties**
  - `id`: 
  - `visitor_id`: 
  - `fingerprint`: 
  - `duration`: 
  - `is_returning`: 
  - `started_at`: 
  - `ended_at`: 
  - `created_at`: 