-- 005: slides (image carousel) – managed in the admin, shown on the home page / Termékek page

CREATE TABLE IF NOT EXISTS slides (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  page         VARCHAR(40)  NOT NULL DEFAULT 'home',
  title        VARCHAR(160) NOT NULL DEFAULT '',
  subtitle     VARCHAR(300) NOT NULL DEFAULT '',
  button_label VARCHAR(60)  NOT NULL DEFAULT '',
  link_url     VARCHAR(300) NOT NULL DEFAULT '',
  image_path   VARCHAR(191) NOT NULL,
  published    TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order   INT          NOT NULL DEFAULT 0,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY slides_page_idx (page, published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
