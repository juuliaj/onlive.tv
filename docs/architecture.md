# Architecture

Planned design (only the databases currently run in Docker):

```text
Angular frontend -> FastAPI backend -> db-users    (PostgreSQL)
                                    -> db-content  (PostgreSQL)
                                    -> db-activity (PostgreSQL)
```

| Component   | Purpose                              | Status          |
|-------------|--------------------------------------|-----------------|
| frontend    | Angular UI                           | implemented     |
| backend     | FastAPI REST API                     | implemented     |
| db-users    | accounts, roles                      | schema + seed   |
| db-content  | videos, creators, engagement data   | schema + seed   |
| db-activity | watchlists, playback and engagement | schema + seed   |

Each database is a separate PostgreSQL container with its own volume. Content and activity
databases use PostgreSQL replication; content is hash-partitioned and playback history is
range-partitioned.

Administrators can open `/admin` to monitor the users, content, and activity databases. The
backend's `GET /admin/dashboard` endpoint checks each database independently and returns
aggregate user, content-status, playback, and engagement metrics. The endpoint requires an
authenticated JWT with the `admin` role; the frontend route is protected by the same role.
Database status and metrics refresh every 30 seconds, and a failed database is reported
without preventing metrics from the other databases from loading.
