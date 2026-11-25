CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Time-range partitioned playback history table (partitioned by last_watched_at).
-- Composite primary key includes the partition key as required by PostgreSQL
CREATE TABLE IF NOT EXISTS watch_history (
    history_id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_watch_history_progress CHECK (progress >= 0),
    PRIMARY KEY (history_id, last_watched_at),
    CONSTRAINT uq_watch_history_user_content_time UNIQUE (user_id, content_id, last_watched_at)
) PARTITION BY RANGE (last_watched_at);

-- Monthly range partitions for October, November, and December 2026
CREATE TABLE IF NOT EXISTS watch_history_2026_10 PARTITION OF watch_history
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2026-11-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS watch_history_2026_11 PARTITION OF watch_history
    FOR VALUES FROM ('2026-11-01 00:00:00+00') TO ('2026-12-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS watch_history_2026_12 PARTITION OF watch_history
    FOR VALUES FROM ('2026-12-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- Fallback partition for timestamps outside defined monthly ranges
CREATE TABLE IF NOT EXISTS watch_history_default PARTITION OF watch_history DEFAULT;

-- Named user watchlists
CREATE TABLE IF NOT EXISTS watchlist (
    watchlist_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_watchlist_name CHECK (length(btrim(name)) > 0)
);
-- Join table mapping content items to watchlists
CREATE TABLE IF NOT EXISTS watchlist_item (
    watchlist_id UUID NOT NULL REFERENCES watchlist (watchlist_id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (watchlist_id, content_id)
);
-- User content ratings
CREATE TABLE IF NOT EXISTS rating (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    rating_value INTEGER NOT NULL,
    rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rating_value CHECK (rating_value BETWEEN 1 AND 5),
    CONSTRAINT uq_rating_user_content UNIQUE (user_id, content_id)
);
-- User content likes
CREATE TABLE IF NOT EXISTS content_like (
    like_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_like_user_content UNIQUE (user_id, content_id)
);

-- Indexes to speed up common user and content lookup patterns
CREATE INDEX IF NOT EXISTS idx_watch_history_user_last_watched
    ON watch_history (user_id, last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_content
    ON watch_history (user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_content_id
    ON watch_history (content_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id
    ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_item_content_id
    ON watchlist_item (content_id);
CREATE INDEX IF NOT EXISTS idx_rating_user_id
    ON rating (user_id);
CREATE INDEX IF NOT EXISTS idx_rating_content_id
    ON rating (content_id);
CREATE INDEX IF NOT EXISTS idx_content_like_user_id
    ON content_like (user_id);
CREATE INDEX IF NOT EXISTS idx_content_like_content_id
    ON content_like (content_id);