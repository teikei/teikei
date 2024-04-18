exports.up = async (knex) => {
  await knex.raw(`
create extension if not exists hstore;

create table audit (
    audit_id serial primary key,
    table_name text not null,
    user_name text not null,
    action_timestamp timestamp not null default (now() at time zone 'utc'),
    action text not null check (action in ('i','d','u')),
    old_values hstore,
    new_values hstore,
    updated_cols text[],
    query text
);

create or replace function if_modified_func() returns trigger as $body$
begin
    if tg_op = 'UPDATE' then
        insert into audit (table_name, user_name, action, old_values, new_values, updated_cols, query)
        values (tg_table_name::text, current_user::text, 'u', hstore(old.*), hstore(new.*),
               akeys(hstore(new.*) - hstore(old.*)), current_query());
        return new;
    elsif tg_op = 'DELETE' then
        insert into audit (table_name, user_name, action, old_values, query)
        values (tg_table_name::text, current_user::text, 'd', hstore(old.*), current_query());
        return old;
    elsif tg_op = 'INSERT' then
        insert into audit (table_name, user_name, action, new_values, query)
        values (tg_table_name::text, current_user::text, 'i', hstore(new.*), current_query());
        return new;
    end if;
end;
$body$
language plpgsql;

create trigger farms_badges_audit after insert or update or delete on farms_badges for each row execute procedure if_modified_func();`);
};

exports.down = async (knex) => {};
