CREATE TABLE
    if not exists user (id INTEGER NOT NULL PRIMARY KEY);

CREATE TABLE
    if not exists session (
        id TEXT NOT NULL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES user (id),
        expires_at INTEGER NOT NULL
    );