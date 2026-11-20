-- 007: full product page (2026-11) – brand, key features, stock, price display mode,
-- SEO fields, extra documents, quote requests (Árajánlatkérés)

ALTER TABLE products
  ADD COLUMN brand            VARCHAR(120) NOT NULL DEFAULT '' AFTER name,
  ADD COLUMN packaging        VARCHAR(200) NOT NULL DEFAULT '',
  ADD COLUMN highlights       TEXT         NULL,
  ADD COLUMN stock_status     VARCHAR(20)  NOT NULL DEFAULT 'in_stock',
  ADD COLUMN price_mode       VARCHAR(20)  NOT NULL DEFAULT 'ask',
  ADD COLUMN price_note       VARCHAR(300) NOT NULL DEFAULT '',
  ADD COLUMN seo_title        VARCHAR(200) NOT NULL DEFAULT '',
  ADD COLUMN meta_description VARCHAR(300) NOT NULL DEFAULT '',
  ADD COLUMN keywords         VARCHAR(300) NOT NULL DEFAULT '',
  ADD COLUMN image_alt        VARCHAR(200) NOT NULL DEFAULT '';

-- products that already have a price keep showing it
UPDATE products SET price_mode = 'public' WHERE price IS NOT NULL OR sale_price IS NOT NULL;

-- Downloadable documents besides the Műszaki adatlap (products.datasheet_path)
CREATE TABLE IF NOT EXISTS product_documents (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  product_id CHAR(36)     NOT NULL,
  kind       VARCHAR(20)  NOT NULL DEFAULT 'other',
  title      VARCHAR(200) NOT NULL DEFAULT '',
  path       VARCHAR(191) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY product_documents_product_idx (product_id, sort_order),
  CONSTRAINT product_documents_product_fk FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quote requests sent from the website (also e-mailed; kept here so nothing gets lost)
CREATE TABLE IF NOT EXISTS quote_requests (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  product_id   CHAR(36)     NULL,
  product_name VARCHAR(250) NOT NULL DEFAULT '',
  product_url  VARCHAR(300) NOT NULL DEFAULT '',
  quantity     VARCHAR(40)  NOT NULL DEFAULT '',
  unit         VARCHAR(40)  NOT NULL DEFAULT '',
  delivery     VARCHAR(20)  NOT NULL DEFAULT '',
  zip          VARCHAR(10)  NOT NULL DEFAULT '',
  city         VARCHAR(120) NOT NULL DEFAULT '',
  installation VARCHAR(20)  NOT NULL DEFAULT '',
  name         VARCHAR(160) NOT NULL,
  company      VARCHAR(160) NOT NULL DEFAULT '',
  email        VARCHAR(191) NOT NULL,
  phone        VARCHAR(40)  NOT NULL DEFAULT '',
  message      TEXT         NULL,
  mail_sent    TINYINT(1)   NOT NULL DEFAULT 0,
  status       VARCHAR(20)  NOT NULL DEFAULT 'new',
  KEY quote_requests_created_idx (created_at),
  KEY quote_requests_status_idx (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
