"""Database connection helpers for db-users, db-content (primary), and db-content-replica."""

import os
from collections.abc import Generator

import psycopg
from psycopg.rows import dict_row


def _build_conninfo(host: str, dbname: str, user: str, password: str, port: str = "5432") -> str:
    """Builds a PostgreSQL connection string for psycopg."""
    return f"host={host} port={port} dbname={dbname} user={user} password={password}"


def users_db_conninfo() -> str:
    return _build_conninfo(
        host=os.getenv("USERS_DB_HOST", "db-users"),
        dbname=os.getenv("USERS_DB_NAME", "users"),
        user=os.getenv("USERS_DB_USER", "users_user"),
        password=os.getenv("USERS_DB_PASSWORD", "users_password"),
    )


def content_write_db_conninfo() -> str:
    return _build_conninfo(
        host=os.getenv("CONTENT_DB_HOST", "db-content"),
        dbname=os.getenv("CONTENT_DB_NAME", "content"),
        user=os.getenv("CONTENT_DB_USER", "content_user"),
        password=os.getenv("CONTENT_DB_PASSWORD", "content_password"),
    )


def activity_db_conninfo() -> str:
    return _build_conninfo(
        host=os.getenv("ACTIVITY_DB_HOST", "db-activity"),
        dbname=os.getenv("ACTIVITY_DB_NAME", "activity_db"),
        user=os.getenv("ACTIVITY_DB_USER", "activity_user"),
        password=os.getenv("ACTIVITY_DB_PASSWORD", "activity_password"),
    )


def get_users_db() -> Generator[psycopg.Connection, None, None]:
    """Yields a database connection to the primary db-users instance.

    Yields:
        psycopg.Connection: Active connection with dict_row factory.
    """
    with psycopg.connect(users_db_conninfo(), row_factory=dict_row) as conn:
        yield conn


def get_activity_db() -> Generator[psycopg.Connection, None, None]:
    """Yields a connection to the primary db-activity instance."""
    with psycopg.connect(activity_db_conninfo(), row_factory=dict_row) as conn:
        yield conn


def get_content_read_db() -> Generator[psycopg.Connection, None, None]:
    """Yields a read-only connection to db-content-replica for catalog queries.

    Yields:
        psycopg.Connection: Active connection to the streaming read replica.
    """
    conninfo = _build_conninfo(
        host=os.getenv("CONTENT_REPLICA_DB_HOST", "db-content-replica"),
        dbname=os.getenv("CONTENT_DB_NAME", "content_db"),
        user=os.getenv("CONTENT_DB_USER", "content_user"),
        password=os.getenv("CONTENT_DB_PASSWORD", "content_password"),
    )
    with psycopg.connect(conninfo, row_factory=dict_row) as conn:
        yield conn


def get_content_write_db() -> Generator[psycopg.Connection, None, None]:
    """Yields a read-write connection to the primary db-content instance.

    Yields:
        psycopg.Connection: Active connection to the primary content database.
    """
    with psycopg.connect(content_write_db_conninfo(), row_factory=dict_row) as conn:
        yield conn