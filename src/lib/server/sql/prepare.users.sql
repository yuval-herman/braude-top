CREATE TABLE
    if not exists user (
        id INTEGER PRIMARY KEY,
        google_id TEXT,
        role TEXT,
        name TEXT not NULL
    );

CREATE TABLE
    if not exists session (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES user (id),
        expires_at INTEGER NOT NULL
    );