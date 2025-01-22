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
        settings TEXT -- json object of settings
    );

CREATE TABLE
    if not exists saved_timetables (
        user_id INTEGER REFERENCES user (id),
        year INTEGER,
        semester TEXT,
        saved_timetable TEXT, -- json object of settingsת
        PRIMARY KEY (user_id, year, semester)
    );