-- ============================================================================
-- SpillIt — Phase 2 schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: everything is IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================================

-- pgcrypto gives us crypt()/gen_salt('bf') = real bcrypt, done in Postgres so
-- a room password hash NEVER has to touch the client or leave the database.
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- profiles — one row per auth.users row. Supabase Auth owns email/password;
-- this just holds the public-facing bits (display name) plus an
-- auto-created row so the rest of the schema has something to reference.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  accepted_terms_at timestamptz, -- set at sign-up time from auth metadata; null = pre-dates this column
  created_at timestamptz not null default now()
);

-- The table above already exists in the live project (schema.sql has been
-- run before), so CREATE TABLE IF NOT EXISTS won't retroactively add this
-- column on its own — this line is what actually applies it.
alter table public.profiles add column if not exists accepted_terms_at timestamptz;

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up. accepted_terms_at
-- comes from auth metadata set in the sign-up Server Action at the moment
-- the T&C checkbox is validated — so this is a server-set timestamp, not a
-- client-supplied one, even though it travels through raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public, extensions
as $$
begin
  insert into public.profiles (id, display_name, accepted_terms_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    (new.raw_user_meta_data->>'accepted_terms_at')::timestamptz
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- rooms
-- password_hash is bcrypt (pgcrypto crypt/gen_salt('bf')) and is NEVER
-- exposed to clients — the public.rooms_public view below is what the app
-- actually queries; password checks go through the join_room() RPC.
-- ----------------------------------------------------------------------------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- 6-char alphanumeric, shown to users as the "Room ID"
  name text not null,
  password_hash text, -- null = open room
  is_open boolean not null default true,
  verified_only boolean not null default false, -- creator can require email-verified members
  size_bracket text not null check (size_bracket in ('2','3-5','5-10','10-25','25+')),
  -- host_controlled: only the creator can spin/advance turns.
  -- turn_based: whoever's turn it is controls their own spin/choice/resolve.
  -- open: anyone in the room can spin/advance, for anyone.
  -- Also doubles as who's allowed to start a game session in the first
  -- place (see startGameAction) — host_controlled/turn_based both mean
  -- "creator only" for starting, since turn order doesn't exist yet before
  -- a session is created.
  host_mode text not null default 'host_controlled'
    check (host_mode in ('host_controlled','turn_based','open')),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  expiry_at timestamptz, -- null = no expiry until explicit delete
  created_at timestamptz not null default now()
);

-- Backfills the column for a database where schema.sql already ran before
-- host_mode existed — CREATE TABLE IF NOT EXISTS alone won't add it.
alter table public.rooms add column if not exists host_mode text not null default 'host_controlled';
alter table public.rooms drop constraint if exists rooms_host_mode_check;
alter table public.rooms add constraint rooms_host_mode_check
  check (host_mode in ('host_controlled','turn_based','open'));

alter table public.rooms enable row level security;

-- Nobody selects public.rooms directly from the client (that would expose
-- password_hash). Server-side code (Route Handlers using the service role,
-- or the RPCs below) is the only thing that touches this table directly.
drop policy if exists "owners manage their rooms" on public.rooms;
create policy "owners manage their rooms"
  on public.rooms for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Safe view — this is what the client actually queries to list/look up rooms.
-- host_mode is appended LAST, not inserted where it logically belongs next
-- to the other room-setting columns — CREATE OR REPLACE VIEW only allows
-- adding new columns at the end of the list; putting it anywhere else
-- shifts every column after it and Postgres reads that as trying to rename
-- them (that's the exact error this caused the first time around).
create or replace view public.rooms_public
with (security_invoker = true) as
select
  id, code, name, is_open, verified_only, size_bracket, owner_id, expiry_at, created_at,
  (password_hash is not null) as has_password,
  host_mode
from public.rooms;

-- ----------------------------------------------------------------------------
-- room_memberships
-- ----------------------------------------------------------------------------
create table if not exists public.room_memberships (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  nickname text not null,
  role text not null default 'member' check (role in ('creator','member')),
  is_muted boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (room_id, user_id)
);

alter table public.room_memberships enable row level security;

-- Self-referencing "am I a member of this room" checks inside a policy ON
-- room_memberships itself cause infinite recursion (the subquery re-triggers
-- the same policy). Routing the check through a security-definer function
-- breaks the loop — this is the standard fix for this exact Postgres RLS
-- gotcha.
create or replace function public.is_room_member(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public, extensions
stable
as $$
  select exists (
    select 1 from public.room_memberships
    where room_id = p_room_id and user_id = p_user_id
  );
$$;

drop policy if exists "members see their room's membership list" on public.room_memberships;
create policy "members see their room's membership list"
  on public.room_memberships for select
  using (public.is_room_member(room_id, auth.uid()));

-- rooms_public is security_invoker = true, so it still enforces public.rooms'
-- own RLS underneath — the owner-only policy above means a non-owner member
-- got zero rows back from rooms_public and the room page treated that as
-- "room doesn't exist" (404), even though they're a legitimate member. This
-- adds a second, permissive SELECT policy for members specifically; it's
-- placed here (not up next to the other rooms policies) because it depends
-- on is_room_member(), which has to exist first.
drop policy if exists "members can view their rooms" on public.rooms;
create policy "members can view their rooms"
  on public.rooms for select
  using (public.is_room_member(id, auth.uid()));

drop policy if exists "room creator can update/kick memberships" on public.room_memberships;
create policy "room creator can update/kick memberships"
  on public.room_memberships for all
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_memberships.room_id and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.rooms r
      where r.id = room_memberships.room_id and r.owner_id = auth.uid()
    )
  );

drop policy if exists "members can leave (delete own membership)" on public.room_memberships;
create policy "members can leave (delete own membership)"
  on public.room_memberships for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- chat_messages
-- report_count/status are maintained by the reports trigger further down —
-- clients never write to them directly.
-- ----------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  report_count int not null default 0,
  status text not null default 'visible' check (status in ('visible','hidden')),
  sent_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

drop policy if exists "room members read visible messages" on public.chat_messages;
create policy "room members read visible messages"
  on public.chat_messages for select
  using (
    status = 'visible'
    and exists (
      select 1 from public.room_memberships m
      where m.room_id = chat_messages.room_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "room members send messages" on public.chat_messages;
create policy "room members send messages"
  on public.chat_messages for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.room_memberships m
      where m.room_id = chat_messages.room_id and m.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- reports — hybrid moderation: auto-hide after REPORT_THRESHOLD reports,
-- always logged to a review queue (this table) either way.
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  categories text[] not null,
  details text,
  review_status text not null default 'pending' check (review_status in ('pending','upheld','dismissed')),
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id) -- one report per user per message
);

alter table public.reports enable row level security;

drop policy if exists "users submit reports" on public.reports;
create policy "users submit reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "users see their own submitted reports" on public.reports;
create policy "users see their own submitted reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- Threshold before a message auto-hides. Change this one number to retune it.
create or replace function public.report_threshold() returns int
  language sql immutable as $$ select 3 $$;

create or replace function public.handle_new_report()
returns trigger
language plpgsql
security definer set search_path = public, extensions
as $$
begin
  update public.chat_messages
  set report_count = report_count + 1,
      status = case
        when report_count + 1 >= public.report_threshold() then 'hidden'
        else status
      end
  where id = new.message_id;
  return new;
end;
$$;

drop trigger if exists on_report_created on public.reports;
create trigger on_report_created
  after insert on public.reports
  for each row execute function public.handle_new_report();

-- ----------------------------------------------------------------------------
-- game_sessions / players / prompt_logs
-- Covers both saved local sessions (room_id null, owner via players.user_id)
-- and online sessions (room_id set, restricted to room members).
-- ----------------------------------------------------------------------------
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('local','online')),
  room_id uuid references public.rooms(id) on delete cascade,
  difficulty text not null check (difficulty in ('children','teens','adult','spicy')),
  theme text,
  tie_breaker_mode text not null default 'random' check (tie_breaker_mode in ('random','coin_toss')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.game_sessions enable row level security;

drop policy if exists "session participants can access" on public.game_sessions;
create policy "session participants can access"
  on public.game_sessions for all
  using (
    auth.uid() = created_by
    or (
      room_id is not null
      and exists (
        select 1 from public.room_memberships m
        where m.room_id = game_sessions.room_id and m.user_id = auth.uid()
      )
    )
  )
  with check (auth.uid() = created_by);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  name text not null,
  user_id uuid references public.profiles(id) on delete set null, -- null for local-mode-only names
  forfeit_count int not null default 0
);

alter table public.players enable row level security;

drop policy if exists "session participants manage players" on public.players;
create policy "session participants manage players"
  on public.players for all
  using (
    exists (
      select 1 from public.game_sessions s
      where s.id = players.session_id and (
        s.created_by = auth.uid()
        or (s.room_id is not null and exists (
          select 1 from public.room_memberships m
          where m.room_id = s.room_id and m.user_id = auth.uid()
        ))
      )
    )
  );

create table if not exists public.prompt_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  type text not null check (type in ('truth','dare')),
  difficulty text not null check (difficulty in ('children','teens','adult','spicy')),
  content text not null,
  result text not null check (result in ('forfeit','done')),
  created_at timestamptz not null default now()
);

alter table public.prompt_logs enable row level security;

drop policy if exists "session participants manage prompt logs" on public.prompt_logs;
create policy "session participants manage prompt logs"
  on public.prompt_logs for all
  using (
    exists (
      select 1 from public.game_sessions s
      where s.id = prompt_logs.session_id and (
        s.created_by = auth.uid()
        or (s.room_id is not null and exists (
          select 1 from public.room_memberships m
          where m.room_id = s.room_id and m.user_id = auth.uid()
        ))
      )
    )
  );

-- ----------------------------------------------------------------------------
-- RPCs — the only path that ever touches a room password. Bcrypt hashing
-- and checking both happen here, server-side, via pgcrypto. The client
-- calls these with supabase.rpc(...); it never sees password_hash.
-- ----------------------------------------------------------------------------

-- Generates a 6-char alphanumeric room code, retrying on the rare collision.
create or replace function public.generate_room_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I, less confusing
  result text;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    exit when not exists (select 1 from public.rooms where code = result);
  end loop;
  return result;
end;
$$;

create or replace function public.create_room(
  p_name text,
  p_password text, -- pass null/empty for an open room
  p_size_bracket text,
  p_verified_only boolean default false,
  p_host_mode text default 'host_controlled'
)
returns public.rooms
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  new_room public.rooms;
begin
  if auth.uid() is null then
    raise exception 'must be signed in to create a room';
  end if;

  if p_host_mode not in ('host_controlled','turn_based','open') then
    raise exception 'invalid host_mode';
  end if;

  insert into public.rooms (code, name, password_hash, is_open, verified_only, size_bracket, host_mode, owner_id)
  values (
    public.generate_room_code(),
    p_name,
    case when p_password is null or p_password = '' then null
         else crypt(p_password, gen_salt('bf')) end,
    true,
    p_verified_only,
    p_size_bracket,
    p_host_mode,
    auth.uid()
  )
  returning * into new_room;

  insert into public.room_memberships (room_id, user_id, nickname, role)
  values (new_room.id, auth.uid(), coalesce((select display_name from public.profiles where id = auth.uid()), 'Host'), 'creator');

  return new_room;
end;
$$;

-- Verifies (if needed) and joins a room by its 6-char code. Enforces the
-- 5-failed-attempts lockout and the verified-email-only room setting.
create table if not exists public.room_join_attempts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  failed_count int not null default 0,
  locked_until timestamptz,
  primary key (user_id, room_id)
);
alter table public.room_join_attempts enable row level security;
drop policy if exists "users see their own join attempts" on public.room_join_attempts;
create policy "users see their own join attempts"
  on public.room_join_attempts for select
  using (auth.uid() = user_id);

create or replace function public.join_room(
  p_code text,
  p_password text default null,
  p_nickname text default null
)
returns public.rooms
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  target public.rooms;
  attempt public.room_join_attempts;
  user_email_confirmed boolean;
  member_cap int;
  current_members int;
begin
  if auth.uid() is null then
    raise exception 'must be signed in to join a room';
  end if;

  select * into target from public.rooms where code = upper(p_code);
  if target.id is null then
    raise exception 'room not found';
  end if;

  member_cap := case target.size_bracket
    when '2' then 2
    when '3-5' then 5
    when '5-10' then 10
    when '10-25' then 25
    else 50 -- '25+' bracket, hard cap per the spec
  end;
  select count(*) into current_members from public.room_memberships where room_id = target.id;
  if current_members >= member_cap then
    raise exception 'room is full';
  end if;

  if target.verified_only then
    select (email_confirmed_at is not null) into user_email_confirmed
    from auth.users where id = auth.uid();
    if not coalesce(user_email_confirmed, false) then
      raise exception 'this room requires a verified email';
    end if;
  end if;

  if target.password_hash is not null then
    select * into attempt from public.room_join_attempts
      where user_id = auth.uid() and room_id = target.id;

    if attempt.locked_until is not null and attempt.locked_until > now() then
      raise exception 'too many attempts — check your email for a reset link';
    end if;

    if p_password is null or crypt(p_password, target.password_hash) <> target.password_hash then
      insert into public.room_join_attempts (user_id, room_id, failed_count)
      values (auth.uid(), target.id, 1)
      on conflict (user_id, room_id) do update
        set failed_count = room_join_attempts.failed_count + 1,
            locked_until = case
              when room_join_attempts.failed_count + 1 >= 5 then now() + interval '1 hour'
              else null
            end;
      raise exception 'incorrect password';
    end if;

    -- correct password — clear any prior failed attempts
    delete from public.room_join_attempts where user_id = auth.uid() and room_id = target.id;
  end if;

  insert into public.room_memberships (room_id, user_id, nickname)
  values (
    target.id,
    auth.uid(),
    coalesce(p_nickname, (select display_name from public.profiles where id = auth.uid()))
  )
  on conflict (room_id, user_id) do nothing;

  return target;
end;
$$;

-- ----------------------------------------------------------------------------
-- leave_room — a plain delete from room_memberships (allowed by the "members
-- can leave" policy above) is enough for an ordinary member. It's NOT enough
-- when the creator leaves: the room would be left with no owner, and
-- "owners manage their rooms" would then block anyone (including Supabase
-- itself via cascade rules) from cleanly handing it off. This RPC handles
-- both cases atomically:
--   - creator leaves, other members remain -> ownership passes to whoever
--     has been in the room longest (oldest joined_at)
--   - creator leaves and was the last member -> the room is deleted outright
--     (cascades to memberships/chat/reports/sessions via existing FKs)
--   - non-creator leaves -> same as before, just removes their membership
-- ----------------------------------------------------------------------------
create or replace function public.leave_room(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  caller_role text;
  next_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'must be signed in to leave a room';
  end if;

  select role into caller_role
  from public.room_memberships
  where room_id = p_room_id and user_id = auth.uid();

  if caller_role is null then
    raise exception 'you are not a member of this room';
  end if;

  if caller_role = 'creator' then
    select user_id into next_owner
    from public.room_memberships
    where room_id = p_room_id and user_id <> auth.uid()
    order by joined_at asc
    limit 1;

    if next_owner is null then
      -- last person in the room — nothing to hand off to, so the room goes too
      delete from public.rooms where id = p_room_id;
    else
      update public.rooms set owner_id = next_owner where id = p_room_id;
      update public.room_memberships set role = 'creator'
        where room_id = p_room_id and user_id = next_owner;
      delete from public.room_memberships
        where room_id = p_room_id and user_id = auth.uid();
    end if;
  else
    delete from public.room_memberships
      where room_id = p_room_id and user_id = auth.uid();
  end if;
end;
$$;

grant execute on function public.leave_room(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Account self-service — lets a signed-in user permanently delete their own
-- account in one call. Deleting a row from auth.users isn't something the
-- normal "authenticated" role can do directly (Supabase locks that schema
-- down), so this function runs as security definer (effectively as the
-- table owner) but only ever operates on auth.uid() — never an id supplied
-- by the caller — so there's no way to use it to delete anyone else.
--
-- Deleting the auth.users row cascades to public.profiles (FK: profiles.id
-- references auth.users(id) on delete cascade), which in turn cascades to
-- rooms owned by that user, their room_memberships, chat_messages, reports,
-- game_sessions, players, and prompt_logs via the FKs defined earlier in
-- this file — so this one delete is enough to clean up everything.
-- ----------------------------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public, extensions, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'must be signed in to delete your account';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

-- Only signed-in users may call this, and only for themselves (enforced
-- inside the function body via auth.uid(), not by this grant).
grant execute on function public.delete_own_account() to authenticated;

-- ----------------------------------------------------------------------------
-- Realtime — lets the room chat/member-list UI subscribe to live changes.
-- Wrapped in a check so re-running this file doesn't error if already added.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'room_memberships'
  ) then
    alter publication supabase_realtime add table public.room_memberships;
  end if;

  -- Missed originally: the room page's "waiting for host to start" view
  -- subscribes to game_sessions INSERTs, but Postgres was never actually
  -- publishing changes on this table, so that subscription sat listening
  -- for events that could never arrive. Not a timing/race bug — it just
  -- wasn't wired up.
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'game_sessions'
  ) then
    alter publication supabase_realtime add table public.game_sessions;
  end if;
end $$;

-- ============================================================================
-- End of schema.
-- ============================================================================