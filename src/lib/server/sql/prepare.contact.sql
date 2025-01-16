CREATE TABLE
    if not EXISTS messages (
        id INTEGER PRIMARY KEY,
        name text,
        email text,
        type text,
        message text,
        date text
    );