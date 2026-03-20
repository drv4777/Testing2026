-- Create the table for structured transaction data
create table transactions (
   id         serial primary key,
   user_id    int not null,
   amount     decimal(10,2) not null,
   currency   varchar(3) default 'USD',
   status     varchar(20) default 'Pending',
   created_at timestamp default current_timestamp
);

-- Create table for user authentication
create table users (
   id                 serial primary key,
   username           varchar(50) unique not null,
   password_hash      text not null,
   two_factor_enabled boolean default false
);