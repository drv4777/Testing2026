-- PostgreSQL init script that mirrors the MongoDB schema used by the app.
-- This file is not wired into the current backend, but it can be used to
-- initialize a relational version of the same data model.

create table if not exists users (
   id bigserial primary key,
   username varchar(100) not null unique,
   password_hash text not null,
   role varchar(20) not null default 'customer'
      check (role in ('admin', 'merchant', 'customer')),
   status varchar(20) not null default 'active'
      check (status in ('active', 'disabled')),
   email varchar(255),
   phone varchar(50),
   two_factor_enabled boolean not null default false,
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now()
);

create table if not exists merchants (
   id bigserial primary key,
   name varchar(255) not null,
   api_key text not null unique,
   owner_user_id bigint references users(id) on delete set null,
   status varchar(20) not null default 'active'
      check (status in ('active', 'disabled')),
   webhook_url text,
   settings jsonb not null default '{}'::jsonb,
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now()
);

create table if not exists transactions (
   id bigserial primary key,
   user_id bigint not null references users(id) on delete cascade,
   merchant_id bigint not null references merchants(id) on delete restrict,
   amount numeric(12,2) not null check (amount >= 0),
   currency char(3) not null default 'USD',
   payment_method varchar(50) not null,
   status varchar(20) not null default 'pending'
      check (status in ('pending', 'completed', 'failed', 'refunded')),
   gateway_reference varchar(255),
   failure_reason text,
   refund_reason text,
   processed_at timestamptz,
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_created_at
   on transactions (user_id, created_at desc);

create index if not exists idx_transactions_merchant_created_at
   on transactions (merchant_id, created_at desc);

create index if not exists idx_transactions_status
   on transactions (status);

create table if not exists fraud_alerts (
   id bigserial primary key,
   transaction_id bigint not null references transactions(id) on delete cascade,
   user_id bigint references users(id) on delete set null,
   merchant_id bigint references merchants(id) on delete set null,
   reason text not null,
   severity varchar(20) not null default 'medium'
      check (severity in ('low', 'medium', 'high')),
   status varchar(20) not null default 'open'
      check (status in ('open', 'resolved')),
   resolved_by bigint references users(id) on delete set null,
   resolved_at timestamptz,
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
   id bigserial primary key,
   actor_user_id bigint references users(id) on delete set null,
   action varchar(100) not null,
   entity_type varchar(50) not null,
   entity_id varchar(100) not null,
   details jsonb not null default '{}'::jsonb,
   created_at timestamptz not null default now()
);

create index if not exists idx_fraud_alerts_status
   on fraud_alerts (status);

create index if not exists idx_audit_logs_entity
   on audit_logs (entity_type, entity_id);

create or replace function set_updated_at()
returns trigger as $$
begin
   new.updated_at = now();
   return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row
execute function set_updated_at();

drop trigger if exists trg_merchants_updated_at on merchants;
create trigger trg_merchants_updated_at
before update on merchants
for each row
execute function set_updated_at();

drop trigger if exists trg_transactions_updated_at on transactions;
create trigger trg_transactions_updated_at
before update on transactions
for each row
execute function set_updated_at();

drop trigger if exists trg_fraud_alerts_updated_at on fraud_alerts;
create trigger trg_fraud_alerts_updated_at
before update on fraud_alerts
for each row
execute function set_updated_at();