INSERT INTO users (user_id, name, email, password_hash, role) VALUES
    ('11111111-1111-4111-8111-111111111101', 'Juulia Admin', 'juulia.admin@onlive.tv', '$2b$12$mockhashforadmin0123456789012345678901234567890123456', 'admin'),
    ('11111111-1111-4111-8111-111111111102', 'Oskari Uploader', 'oskari.uploader@onlive.tv', '$2b$12$mockhashforuploader01234567890123456789012345678901234', 'uploader'),
    ('11111111-1111-4111-8111-111111111103', 'Aino Uploader', 'aino.uploader@onlive.tv', '$2b$12$mockhashforuploader02234567890123456789012345678901234', 'uploader'),
    ('11111111-1111-4111-8111-111111111104', 'Atte Viewer', 'atte.viewer@onlive.tv', '$2b$12$mockhashforviewer0123456789012345678901234567890123456', 'viewer'),
    ('11111111-1111-4111-8111-111111111105', 'Abu Viewer', 'abu.viewer@onlive.tv', '$2b$12$mockhashforviewer0223456789012345678901234567890123456', 'viewer'),
    ('11111111-1111-4111-8111-111111111106', 'Sofia Viewer', 'sofia.viewer@onlive.tv', '$2b$12$mockhashforviewer0323456789012345678901234567890123456', 'viewer')
--if email is already registered do not insert that row
ON CONFLICT (email) DO NOTHING;