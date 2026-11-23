CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS content (
    content_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_owner_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    release_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    -- Reference to the media object in external storage
    storage_url VARCHAR(1024) NOT NULL,
    format VARCHAR(50),
    resolution VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_content_status CHECK (
        status IN ('draft', 'processing', 'published', 'archived', 'restricted')
    ),
    -- content_storage_url validation
    CONSTRAINT chk_content_storage_url CHECK (
        length(btrim(storage_url)) > 0
    )
) PARTITION BY HASH (content_id);

CREATE TABLE IF NOT EXISTS content_p0 PARTITION OF content FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE IF NOT EXISTS content_p1 PARTITION OF content FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE IF NOT EXISTS content_p2 PARTITION OF content FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE IF NOT EXISTS content_p3 PARTITION OF content FOR VALUES WITH (MODULUS 4, REMAINDER 3);

CREATE TABLE IF NOT EXISTS watchlist (
    watchlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist_item (
    watchlist_id UUID NOT NULL REFERENCES watchlist (watchlist_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content (content_id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (watchlist_id, content_id)
);

CREATE TABLE IF NOT EXISTS watch_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL REFERENCES content (content_id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_watch_history_progress CHECK (progress >= 0)
);

CREATE TABLE IF NOT EXISTS rating (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL REFERENCES content (content_id) ON DELETE CASCADE,
    rating_value INTEGER NOT NULL,
    rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rating_value CHECK (rating_value BETWEEN 1 AND 5),
    CONSTRAINT uq_rating_user_content UNIQUE (user_id, content_id)
);

CREATE TABLE IF NOT EXISTS content_like (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL REFERENCES content (content_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_like_user_content UNIQUE (user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_owner_id ON content (content_owner_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content (status);
CREATE INDEX IF NOT EXISTS idx_content_release_date ON content (release_date);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_item_content_id ON watchlist_item (content_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_content ON watch_history (user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_rating_content_id ON rating (content_id);
CREATE INDEX IF NOT EXISTS idx_content_like_content_id ON content_like (content_id);