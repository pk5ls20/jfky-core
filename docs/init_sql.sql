CREATE TABLE IF NOT EXISTS items
(
    id     VARCHAR PRIMARY KEY,
    name   VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    time   INTEGER NOT NULL,
    prompt TEXT    NOT NULL,
    info   TEXT    NOT NULL,
    pic    TEXT[]  NOT NULL
);

CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    qq       VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);