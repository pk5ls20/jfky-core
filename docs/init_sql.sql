CREATE TABLE IF NOT EXISTS items
(
    id               serial            NOT NULL,
    self_name        character varying,
    self_id          character varying NOT NULL,
    author           character varying NOT NULL,
    time             integer           NOT NULL,
    prompt           text              NOT NULL,
    info             text              NOT NULL,
    pic              text[]            NOT NULL,
    last_modify_user integer,
    PRIMARY KEY (id)
);

CREATE TABLE users
(
    id        serial                 NOT NULL,
    qq        character varying(255) NOT NULL,
    username  character varying(255) NOT NULL,
    password  character varying(255) NOT NULL,
    userlevel integer DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE TABLE items_audit
(
    audit_id    SERIAL PRIMARY KEY,
    operation   TEXT      NOT NULL,
    executed_by INTEGER,
    timestamp   TIMESTAMP NOT NULL DEFAULT NOW(),
    old_data    TEXT,
    new_data    TEXT
);

CREATE OR REPLACE FUNCTION items_audit_func() RETURNS TRIGGER AS
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO items_audit(operation, executed_by, old_data)
        VALUES ('D', OLD.last_modify_user::VARCHAR, ROW (OLD.*));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO items_audit(operation, executed_by, old_data, new_data)
        VALUES ('U', NEW.last_modify_user::VARCHAR, ROW (OLD.*), ROW (NEW.*));
        RETURN NEW;
    END IF;
    RETURN NULL; -- This should never be reached
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER items_audit_trigger
    AFTER UPDATE OR DELETE
    ON items
    FOR EACH ROW
EXECUTE FUNCTION items_audit_func();


