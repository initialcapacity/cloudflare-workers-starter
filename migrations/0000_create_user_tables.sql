-- Migration number: 0000 	 2024-02-13T03:45:01.307Z

create table users
(
    id         integer primary key,
    email      text not null check ( email != '' ),
    created_at integer default current_timestamp
);

create index users_unique_email on users (email);

create table accounts
(
    id         integer primary key,
    name       text not null check ( name != '' ),
    created_at integer default current_timestamp
);


create table memberships
(
    id         integer primary key,
    user_id    integer not null,
    account_id integer not null,
    owner      boolean not null,
    created_at integer default current_timestamp,
    foreign key (user_id) references users (id),
    foreign key (account_id) references accounts (id)
);

create unique index memberships_unique_user_and_account on memberships (user_id, account_id);
