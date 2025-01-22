CREATE TABLE
    if not exists user (
        id INTEGER PRIMARY KEY,
        google_id TEXT,
        role TEXT,
        name TEXT not NULL
    );

CREATE INDEX if not exists user_google_id ON user (google_id);

CREATE TABLE
    if not exists session (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES user (id),
        expires_at INTEGER NOT NULL
    );

CREATE TABLE
    if not exists user_data (
        user_id INTEGER PRIMARY KEY REFERENCES user (id),
        saved_timetables TEXT, -- json array of all made timetables
        settings TEXT -- json object of settings
    );