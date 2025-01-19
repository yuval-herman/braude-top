CREATE TABLE
    if not exists comments (
        id integer primary key,
        course_id integer not null,
        course_year integer not null,
        user_id integer not null,
        content text not null,
        created_at text not null default current_timestamp,
        updated_at text,
        is_anon boolean not null,
        is_flagged boolean default 0 -- Moderation flag, default is not flagged
    );

CREATE INDEX if not exists comments_year_course_id_user_id ON comments (course_id, course_year, user_id);