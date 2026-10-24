// Database schema, as ordered migrations. Applied automatically at startup
// (see migrate.ts). Never edit a migration that has shipped; add a new one.
//
// Kept as TypeScript strings rather than .sql files so the standalone build
// always ships them (Next's file tracing does not follow runtime fs reads).
//
// Tenancy: every table that holds seller data carries tenant_id, and every
// query in src/server/repos filters on it.

export type Migration = { id: string; statements: string[] };

const T = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

export const migrations: Migration[] = [
  {
    id: "001_core",
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
        email         VARCHAR(190) NOT NULL,
        name          VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        last_login_at DATETIME(3)  NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_users_email (email)
      ) ${T}`,

      `CREATE TABLE IF NOT EXISTS tenants (
        id                     INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name                   VARCHAR(120) NOT NULL,
        plan                   VARCHAR(20)  NOT NULL DEFAULT 'trial',
        plan_status            VARCHAR(20)  NOT NULL DEFAULT 'trialing',
        trial_ends_at          DATETIME(3)  NULL,
        stripe_customer_id     VARCHAR(64)  NULL,
        stripe_subscription_id VARCHAR(64)  NULL,
        paused                 TINYINT(1)   NOT NULL DEFAULT 0,
        onboarded_at           DATETIME(3)  NULL,
        created_at             DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_tenants_stripe_customer (stripe_customer_id),
        CONSTRAINT ck_tenants_plan_status CHECK (plan_status IN ('trialing','active','past_due','canceled','expired'))
      ) ${T}`,

      `CREATE TABLE IF NOT EXISTS memberships (
        tenant_id  INT UNSIGNED NOT NULL,
        user_id    INT UNSIGNED NOT NULL,
        role       VARCHAR(10)  NOT NULL DEFAULT 'member',
        created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (tenant_id, user_id),
        KEY ix_memberships_user (user_id),
        CONSTRAINT fk_memberships_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT ck_memberships_role CHECK (role IN ('owner','admin','member'))
      ) ${T}`,

      `CREATE TABLE IF NOT EXISTS sessions (
        id           CHAR(64)     NOT NULL,
        user_id      INT UNSIGNED NOT NULL,
        tenant_id    INT UNSIGNED NULL,
        created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        last_seen_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        expires_at   DATETIME(3)  NOT NULL,
        ip           VARCHAR(45)  NOT NULL DEFAULT '',
        user_agent   VARCHAR(255) NOT NULL DEFAULT '',
        PRIMARY KEY (id),
        KEY ix_sessions_user (user_id),
        KEY ix_sessions_expires (expires_at),
        CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ${T}`,

      `CREATE TABLE IF NOT EXISTS rate_limits (
        k            VARCHAR(190) NOT NULL,
        hits         INT UNSIGNED NOT NULL DEFAULT 0,
        window_start DATETIME(3)  NOT NULL,
        PRIMARY KEY (k)
      ) ${T}`,

      `CREATE TABLE IF NOT EXISTS audit_log (
        id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id  INT UNSIGNED    NOT NULL,
        user_id    INT UNSIGNED    NULL,
        action     VARCHAR(64)     NOT NULL,
        detail     VARCHAR(500)    NOT NULL DEFAULT '',
        ip         VARCHAR(45)     NOT NULL DEFAULT '',
        created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY ix_audit_tenant (tenant_id, created_at),
        CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      ) ${T}`,
    ],
  },
  {
    id: "002_connections",
    statements: [
      // One proxy per workspace. The whole config (type, host, port, user,
      // password) is encrypted; host_hint is a masked copy for the UI.
      `CREATE TABLE IF NOT EXISTS proxies (
        tenant_id       INT UNSIGNED NOT NULL,
        config_enc      TEXT         NOT NULL,
        host_hint       VARCHAR(80)  NOT NULL DEFAULT '',
        status          VARCHAR(10)  NOT NULL DEFAULT 'untested',
        egress_ip       VARCHAR(45)  NULL,
        last_checked_at DATETIME(3)  NULL,
        last_error      VARCHAR(255) NULL,
        fail_streak     INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (tenant_id),
        CONSTRAINT fk_proxies_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT ck_proxies_status CHECK (status IN ('untested','ok','failing'))
      ) ${T}`,

      // Where products are sold: OnBuy today, eBay next.
      `CREATE TABLE IF NOT EXISTS marketplace_accounts (
        id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id        INT UNSIGNED NOT NULL,
        marketplace      VARCHAR(16)  NOT NULL,
        site_id          INT          NOT NULL DEFAULT 2000,
        credentials_enc  TEXT         NOT NULL,
        key_hint         VARCHAR(32)  NOT NULL DEFAULT '',
        token_enc        TEXT         NULL,
        token_expires_at DATETIME(3)  NULL,
        status           VARCHAR(12)  NOT NULL DEFAULT 'untested',
        last_error       VARCHAR(255) NULL,
        last_ok_at       DATETIME(3)  NULL,
        created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_marketplace_tenant (tenant_id, marketplace),
        CONSTRAINT fk_marketplace_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT ck_marketplace_name CHECK (marketplace IN ('onbuy','ebay')),
        CONSTRAINT ck_marketplace_status CHECK (status IN ('untested','connected','error'))
      ) ${T}`,

      // Where products are bought: Amazon today, AliExpress next. Each Amazon
      // row is one SP-API authorisation with its own rate budget, so several
      // rows act as shards of the seller's catalogue.
      `CREATE TABLE IF NOT EXISTS source_accounts (
        id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id          INT UNSIGNED NOT NULL,
        source             VARCHAR(16)  NOT NULL,
        label              VARCHAR(80)  NOT NULL,
        mode               VARCHAR(8)   NOT NULL,
        selling_partner_id VARCHAR(40)  NULL,
        marketplace_id     VARCHAR(20)  NOT NULL DEFAULT 'A1F83G8C2ARO7P',
        credentials_enc    TEXT         NOT NULL,
        key_hint           VARCHAR(32)  NOT NULL DEFAULT '',
        token_enc          TEXT         NULL,
        token_expires_at   DATETIME(3)  NULL,
        rate_interval_ms   INT UNSIGNED NOT NULL DEFAULT 10000,
        next_allowed_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        status             VARCHAR(12)  NOT NULL DEFAULT 'untested',
        last_error         VARCHAR(255) NULL,
        last_ok_at         DATETIME(3)  NULL,
        created_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY ix_source_tenant (tenant_id),
        CONSTRAINT fk_source_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT ck_source_name CHECK (source IN ('amazon','aliexpress')),
        CONSTRAINT ck_source_mode CHECK (mode IN ('oauth','self')),
        CONSTRAINT ck_source_status CHECK (status IN ('untested','connected','error'))
      ) ${T}`,

      // Amazon OAuth round trip: the state parameter, hashed, single use.
      `CREATE TABLE IF NOT EXISTS oauth_states (
        state_hash CHAR(64)     NOT NULL,
        tenant_id  INT UNSIGNED NOT NULL,
        user_id    INT UNSIGNED NOT NULL,
        purpose    VARCHAR(20)  NOT NULL,
        label      VARCHAR(80)  NOT NULL DEFAULT '',
        expires_at DATETIME(3)  NOT NULL,
        PRIMARY KEY (state_hash),
        CONSTRAINT fk_oauth_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      ) ${T}`,
    ],
  },
  {
    id: "003_repricer",
    statements: [
      // Per-workspace repricer settings. The fee names follow the pricing
      // formula: a1 marketplace %, a2 payment %, a3 payment fixed fee.
      `CREATE TABLE IF NOT EXISTS repricer_settings (
        tenant_id           INT UNSIGNED  NOT NULL,
        marketplace_fee_pct DECIMAL(6,3)  NOT NULL DEFAULT 18.000,
        payment_fee_pct     DECIMAL(6,3)  NOT NULL DEFAULT 0.000,
        payment_fixed_fee   DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
        in_stock_qty        INT UNSIGNED  NOT NULL DEFAULT 3,
        out_of_stock_price  DECIMAL(10,2) NOT NULL DEFAULT 999.00,
        boost_pct           TINYINT UNSIGNED NULL,
        sku_prefixes        VARCHAR(255)  NOT NULL DEFAULT '',
        prefixed_only       TINYINT(1)    NOT NULL DEFAULT 0,
        updated_at          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (tenant_id),
        CONSTRAINT fk_repricer_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      ) ${T}`,

      // Pricing bands: a band covers (previous up_to, up_to].
      `CREATE TABLE IF NOT EXISTS pricing_bands (
        id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
        tenant_id    INT UNSIGNED  NOT NULL,
        up_to        DECIMAL(10,2) NOT NULL,
        profit_pct   DECIMAL(6,2)  NOT NULL,
        fixed_profit DECIMAL(8,2)  NOT NULL,
        min_profit   DECIMAL(8,2)  NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_band_tenant_upto (tenant_id, up_to),
        CONSTRAINT fk_bands_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT ck_band_upto CHECK (up_to > 0)
      ) ${T}`,

      // The catalogue. One row per marketplace listing.
      //   price/stock          what the repricer wants on the marketplace
      //   pushed_price/stock   what the marketplace last confirmed
      // needs_push is derived, so nothing that writes prices has to remember
      // to flag the row, and a push can only clear it by recording exactly
      // what was confirmed. A price that changes mid-push stays pending.
      `CREATE TABLE IF NOT EXISTS products (
        id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id         INT UNSIGNED    NOT NULL,
        marketplace       VARCHAR(16)     NOT NULL DEFAULT 'onbuy',
        sku               VARCHAR(64)     NOT NULL,
        source            VARCHAR(16)     NOT NULL DEFAULT 'amazon',
        source_ref        VARCHAR(32)     NOT NULL,
        source_account_id INT UNSIGNED    NULL,
        opc               VARCHAR(32)     NULL,
        title             VARCHAR(255)    NULL,
        source_price      DECIMAL(10,2)   NULL,
        price             DECIMAL(10,2)   NULL,
        stock             INT             NULL,
        pushed_price      DECIMAL(10,2)   NULL,
        pushed_stock      INT             NULL,
        push_requested    TINYINT(1)      NOT NULL DEFAULT 0,
        needs_push        TINYINT(1) AS (
                            price IS NOT NULL AND stock IS NOT NULL AND (
                              push_requested = 1
                              OR NOT (price <=> pushed_price)
                              OR NOT (stock <=> pushed_stock)
                            )
                          ) STORED,
        priced_at         DATETIME(3)     NOT NULL DEFAULT '1970-01-01 00:00:01.000',
        pushed_at         DATETIME(3)     NULL,
        push_error        VARCHAR(255)    NULL,
        push_attempts     INT UNSIGNED    NOT NULL DEFAULT 0,
        source_fails      INT UNSIGNED    NOT NULL DEFAULT 0,
        source_error      VARCHAR(120)    NULL,
        created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_products_sku (tenant_id, marketplace, sku),
        KEY ix_products_push (tenant_id, marketplace, needs_push, id),
        KEY ix_products_reprice (source_account_id, priced_at),
        KEY ix_products_source_ref (tenant_id, source_ref),
        KEY ix_products_stock (tenant_id, stock),
        CONSTRAINT fk_products_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT fk_products_source FOREIGN KEY (source_account_id) REFERENCES source_accounts (id) ON DELETE SET NULL
      ) ${T}`,

      // SKUs the marketplace says do not exist. Moved out of products so they
      // stop looping through the push queue, and kept so a re-import doesn't
      // quietly bring them back unless the seller asks for it.
      `CREATE TABLE IF NOT EXISTS archived_skus (
        id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id   INT UNSIGNED    NOT NULL,
        marketplace VARCHAR(16)     NOT NULL,
        sku         VARCHAR(64)     NOT NULL,
        reason      VARCHAR(255)    NOT NULL,
        row_json    TEXT            NULL,
        archived_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY uq_archived_sku (tenant_id, marketplace, sku),
        CONSTRAINT fk_archived_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      ) ${T}`,

      // Every price or stock change the repricer makes, pruned after 30 days.
      `CREATE TABLE IF NOT EXISTS price_history (
        id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id    INT UNSIGNED    NOT NULL,
        product_id   BIGINT UNSIGNED NOT NULL,
        source_price DECIMAL(10,2)   NULL,
        old_price    DECIMAL(10,2)   NULL,
        new_price    DECIMAL(10,2)   NULL,
        old_stock    INT             NULL,
        new_stock    INT             NULL,
        created_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY ix_history_tenant (tenant_id, created_at),
        KEY ix_history_product (product_id, created_at),
        CONSTRAINT fk_history_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE
      ) ${T}`,
    ],
  },
  {
    id: "004_jobs",
    statements: [
      // Scheduled work per workspace. Replaces crontab + flock: the lease
      // columns stop two workers running the same job, and an expired lease
      // (crashed worker) frees it again.
      `CREATE TABLE IF NOT EXISTS jobs (
        id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id        INT UNSIGNED NOT NULL,
        kind             VARCHAR(16)  NOT NULL,
        target_id        INT UNSIGNED NOT NULL,
        enabled          TINYINT(1)   NOT NULL DEFAULT 1,
        interval_s       INT UNSIGNED NOT NULL DEFAULT 120,
        run_now          TINYINT(1)   NOT NULL DEFAULT 0,
        next_run_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        lease_owner      VARCHAR(64)  NULL,
        lease_until      DATETIME(3)  NULL,
        state_json       TEXT         NULL,
        last_started_at  DATETIME(3)  NULL,
        last_finished_at DATETIME(3)  NULL,
        last_ok          TINYINT(1)   NULL,
        last_msg         VARCHAR(255) NOT NULL DEFAULT '',
        prog_done        INT UNSIGNED NOT NULL DEFAULT 0,
        prog_total       INT UNSIGNED NOT NULL DEFAULT 0,
        prog_note        VARCHAR(255) NOT NULL DEFAULT '',
        runs             INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY uq_jobs_target (tenant_id, kind, target_id),
        KEY ix_jobs_due (enabled, next_run_at),
        CONSTRAINT fk_jobs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT ck_jobs_kind CHECK (kind IN ('reprice','push','import'))
      ) ${T}`,

      `CREATE TABLE IF NOT EXISTS job_runs (
        id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        job_id      INT UNSIGNED    NOT NULL,
        tenant_id   INT UNSIGNED    NOT NULL,
        started_at  DATETIME(3)     NOT NULL,
        finished_at DATETIME(3)     NOT NULL,
        ok          TINYINT(1)      NOT NULL,
        msg         VARCHAR(255)    NOT NULL DEFAULT '',
        via         VARCHAR(12)     NOT NULL DEFAULT '',
        PRIMARY KEY (id),
        KEY ix_runs_job (job_id, id),
        KEY ix_runs_tenant (tenant_id, started_at),
        CONSTRAINT fk_runs_job FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
      ) ${T}`,

      // Things the seller should know about: API errors, rejected SKUs,
      // archived SKUs, a proxy that stopped working.
      `CREATE TABLE IF NOT EXISTS events (
        id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        tenant_id  INT UNSIGNED    NOT NULL,
        level      VARCHAR(5)      NOT NULL,
        kind       VARCHAR(32)     NOT NULL,
        message    VARCHAR(500)    NOT NULL,
        created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY ix_events_tenant (tenant_id, created_at),
        CONSTRAINT fk_events_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (id) ON DELETE CASCADE,
        CONSTRAINT ck_events_level CHECK (level IN ('info','warn','error'))
      ) ${T}`,

      // Stripe webhook ids already handled, so a redelivery is a no-op.
      `CREATE TABLE IF NOT EXISTS stripe_events (
        id           VARCHAR(80) NOT NULL,
        processed_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id)
      ) ${T}`,
    ],
  },
];
