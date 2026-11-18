# Architecture

Planned design (only the databases currently run in Docker):

```text
Angular frontend -> FastAPI backend -> db-users    (PostgreSQL)
                                    -> db-content  (PostgreSQL)
                                    -> db-activity (PostgreSQL)
```

| Component   | Purpose                              | Status          |
|-------------|--------------------------------------|-----------------|
| frontend    | Angular UI                           | not implemented |
| backend     | FastAPI REST API                     | not implemented |
| db-users    | accounts, roles                      | empty server    |
| db-content  | videos, creators                     | empty server    |
| db-activity | watchlists, progress, ratings, likes | empty server    |

Each database is a separate PostgreSQL container with its own volume. Schemas, replication and partitioning are to be designed later.
