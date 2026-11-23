INSERT INTO content (
    content_id,
    content_owner_id,
    title,
    description,
    type,
    release_date,
    status,
    storage_url,
    format,
    resolution
) VALUES
    (
        '11111111-1111-4111-8111-111111111101',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        'Nordic Aurora Live Session',
        'Live studio session recorded in northern Finland.',
        'live_vod',
        '2026-10-15',
        'published',
        's3://onlive-content-bucket/videos/11111111-1111-4111-8111-111111111101/master.m3u8',
        'hls',
        '1080p'
    ),
    (
        '11111111-1111-4111-8111-111111111102',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        'Distributed Systems Explained',
        'Deep dive into partitioning, replication, and fault tolerance.',
        'video',
        '2026-11-01',
        'published',
        's3://onlive-content-bucket/videos/11111111-1111-4111-8111-111111111102/master.m3u8',
        'mp4',
        '4K'
    ),
    (
        '11111111-1111-4111-8111-111111111103',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
        'Indie Documentary Pilot',
        'Transcoding job in progress before public release.',
        'movie',
        NULL,
        'processing',
        's3://onlive-content-bucket/raw/11111111-1111-4111-8111-111111111103/source.mov',
        'mov',
        '1080p'
    ),
    (
        '11111111-1111-4111-8111-111111111104',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
        'Archived Season 1 Recap',
        'Older season recap moved out of active catalog.',
        'series',
        '2025-05-20',
        'archived',
        's3://onlive-content-bucket/videos/11111111-1111-4111-8111-111111111104/master.m3u8',
        'mp4',
        '1080p'
    )
    ON CONFLICT (content_id) DO NOTHING;

INSERT INTO watchlist (watchlist_id, user_id, name)
    VALUES
        (
        '22222222-2222-4222-8222-222222222201',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        'Watch Later'
    ),
    (
        '22222222-2222-4222-8222-222222222202',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
        'Tech & Architecture'
    )
    ON CONFLICT (watchlist_id) DO NOTHING;

INSERT INTO watchlist_item (watchlist_id, content_id)
    VALUES
        ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101'),
        ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111102'),
        ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111102')
ON CONFLICT (watchlist_id, content_id) DO NOTHING;

INSERT INTO watch_history (history_id, user_id, content_id, progress)
VALUES
    (
        '33333333-3333-4333-8333-333333333301',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        '11111111-1111-4111-8111-111111111101',
        420
    ),
    (
        '33333333-3333-4333-8333-333333333302',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
        '11111111-1111-4111-8111-111111111102',
        1250
    )
ON CONFLICT DO NOTHING;

INSERT INTO rating (rating_id, user_id, content_id, rating_value)
VALUES
    (
        '44444444-4444-4444-8444-444444444401',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        '11111111-1111-4111-8111-111111111101',
        5
    ),
    (
        '44444444-4444-4444-8444-444444444402',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
        '11111111-1111-4111-8111-111111111102',
        4
    )
ON CONFLICT (user_id, content_id) DO NOTHING;

INSERT INTO content_like (like_id, user_id, content_id)
VALUES
    (
        '55555555-5555-4555-8555-555555555501',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
        '11111111-1111-4111-8111-111111111101'
    ),
    (
        '55555555-5555-4555-8555-555555555502',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
        '11111111-1111-4111-8111-111111111102'
    )
ON CONFLICT (user_id, content_id) DO NOTHING;