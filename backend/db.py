"""Database connection helpers for db-users, db-content (primary), and db-content-replica."""

import os
from collections.abc import Generator

import psycopg
from psycopg.rows import dict_row


def _build_conninfo(host: str, dbname: str, user: str, password: str, port: str = "5432") -> str:
    """Builds a PostgreSQL connection string for psycopg."""
    return f"host={host} port={port} dbname={dbname} user={user} password={password}"


def get_users_db() -> Generator[psycopg.Connection, None, None]:
    """Yields a database connection to the primary db-users instance.

    Yields:
        psycopg.Connection: Active connection with dict_row factory.
    """
    conninfo = _build_conninfo(
        host=os.getenv("USERS_DB_HOST", "db-users"),
        dbname=os.getenv("USERS_DB_NAME", "users_db"),
        user=os.getenv("USERS_DB_USER", "users_user"),
        password=os.getenv("USERS_DB_PASSWORD", "users_password"),
    )
    with psycopg.connect(conninfo, row_factory=dict_row) as conn:
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
    conninfo = _build_conninfo(
        host=os.getenv("CONTENT_DB_HOST", "db-content"),
        dbname=os.getenv("CONTENT_DB_NAME", "content_db"),
        user=os.getenv("CONTENT_DB_USER", "content_user"),
        password=os.getenv("CONTENT_DB_PASSWORD", "content_password"),
    )
    with psycopg.connect(conninfo, row_factory=dict_row) as conn:
        yield conn