-- 002: new menu structure (2026) – product details, gallery, reviews, blog

-- Product details: URL slug, prices, technical data (JSON), datasheet, featured/published
ALTER TABLE products
  ADD COLUMN slug              VARCHAR(191) NULL AFTER id,
  ADD COLUMN short_description VARCHAR(300) NOT NULL DEFAULT '' AFTER name,
  ADD COLUMN price             INT UNSIGNED NULL,
  ADD COLUMN sale_price        INT UNSIGNED NULL,
  ADD COLUMN price_unit        VARCHAR(40)  NOT NULL DEFAULT '',
  ADD COLUMN specs             TEXT         NULL,
  ADD COLUMN datasheet_path    VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN featured          TINYINT(1)   NOT NULL DEFAULT 0,
  ADD COLUMN published         TINYINT(1)   NOT NULL DEFAULT 1,
  ADD COLUMN sort_order        INT          NOT NULL DEFAULT 0,
  ADD COLUMN updated_at        DATETIME(3)  NULL,
  ADD UNIQUE KEY products_slug_unique (slug),
  ADD KEY products_featured_idx (featured, published);

-- Move existing products to the new menu (check them in the admin afterwards)
UPDATE products SET area = 'futoanyagok',       category = 'fa-pellet'          WHERE area = 'biomassza' AND category = 'pellet';
UPDATE products SET area = 'kalyhak-kandallok', category = 'pellet-kalyhak'     WHERE area = 'biomassza' AND category = 'kazanok';
UPDATE products SET area = 'kiegeszitok',       category = 'tisztito-eszkozok'  WHERE area = 'biomassza' AND category = 'porszivok';
UPDATE products SET area = 'kiegeszitok',       category = 'fustcsovek'         WHERE area = 'biomassza' AND category = 'fustgaz-elvezetes';
UPDATE products SET area = 'kiegeszitok',       category = 'pellet-tartalyok'   WHERE area = 'biomassza' AND category = 'tartozekok';
UPDATE products SET area = 'takarmanyok',       category = 'lo-takarmany'       WHERE area = 'takarmany' AND category = 'takarmanypellet';
UPDATE products SET area = 'takarmanyok',       category = 'nyul-es-egyeb'      WHERE area = 'takarmany' AND category IN ('alom', 'vitaminok');
UPDATE products SET area = 'kiegeszitok',       category = 'alkatreszek'        WHERE area = 'takarmany' AND category = 'kiegeszitok';
UPDATE products SET area = 'futoanyagok',       category = 'fa-pellet'          WHERE area = 'biomassza';
UPDATE products SET area = 'takarmanyok',       category = 'nyul-es-egyeb'      WHERE area = 'takarmany';

-- Extra product photos (gallery); products.image_path stays the main photo
CREATE TABLE IF NOT EXISTS product_images (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  product_id CHAR(36)     NOT NULL,
  path       VARCHAR(191) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY product_images_product_idx (product_id, sort_order),
  CONSTRAINT product_images_product_fk FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer reviews (entered by the admins from real sources, e.g. Google)
CREATE TABLE IF NOT EXISTS reviews (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  author      VARCHAR(120) NOT NULL,
  location    VARCHAR(120) NOT NULL DEFAULT '',
  rating      TINYINT      NOT NULL DEFAULT 5,
  body        TEXT         NOT NULL,
  source      VARCHAR(80)  NOT NULL DEFAULT '',
  review_date DATE         NULL,
  published   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY reviews_published_idx (published, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog / Tudástár
CREATE TABLE IF NOT EXISTS blog_posts (
  id               CHAR(36)     NOT NULL PRIMARY KEY,
  slug             VARCHAR(191) NOT NULL,
  title            VARCHAR(200) NOT NULL,
  excerpt          VARCHAR(500) NOT NULL DEFAULT '',
  body             MEDIUMTEXT   NOT NULL,
  cover_path       VARCHAR(191) NOT NULL DEFAULT '',
  meta_description VARCHAR(300) NOT NULL DEFAULT '',
  status           ENUM('draft','published') NOT NULL DEFAULT 'draft',
  published_at     DATETIME(3)  NULL,
  created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)  NULL,
  UNIQUE KEY blog_posts_slug_unique (slug),
  KEY blog_posts_status_idx (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
