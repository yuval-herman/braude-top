CREATE TABLE
    if not EXISTS messages (
        id INTEGER PRIMARY KEY,
        name text,
        email text,
        type text not NULL,
        message text not NULL,
        date text not NULL
    );

CREATE TABLE
    if not EXISTS spam_messages (
        id INTEGER PRIMARY KEY,
        name text,
        email text,
        type text,
        message text,
        additional text,
        date text not NULL
    );