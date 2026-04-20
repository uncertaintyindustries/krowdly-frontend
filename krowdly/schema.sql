-- ============================================================
-- KROWDLY - Supabase SQL Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. PROFILES (extends Supabase auth.users) ───────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz default now()
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. COMMUNITIES ──────────────────────────────────────────
create table if not exists public.communities (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  slug        text unique not null,
  description text,
  icon        text default '💬',
  creator_id  uuid references public.profiles(id) on delete set null,
  member_count int default 1,
  created_at  timestamptz default now()
);

create index if not exists communities_slug_idx on public.communities(slug);
create index if not exists communities_created_idx on public.communities(created_at desc);

-- ── 3. COMMUNITY MEMBERS ────────────────────────────────────
create table if not exists public.community_members (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  community_id uuid not null references public.communities(id) on delete cascade,
  joined_at    timestamptz default now(),
  unique(user_id, community_id)
);

create index if not exists cm_user_idx      on public.community_members(user_id);
create index if not exists cm_community_idx on public.community_members(community_id);

-- ── 4. POSTS ────────────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  content      text,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  community_id uuid not null references public.communities(id) on delete cascade,
  vote_count   int default 0,
  comment_count int default 0,
  is_pinned    boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists posts_community_idx   on public.posts(community_id, created_at desc);
create index if not exists posts_user_idx        on public.posts(user_id);
create index if not exists posts_votes_idx       on public.posts(vote_count desc);
create index if not exists posts_created_idx     on public.posts(created_at desc);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.update_updated_at();

-- ── 5. COMMENTS ─────────────────────────────────────────────
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  parent_id  uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists comments_post_idx    on public.comments(post_id, created_at asc);
create index if not exists comments_user_idx    on public.comments(user_id);
create index if not exists comments_parent_idx  on public.comments(parent_id);

-- Increment comment_count on post when a comment is added
create or replace function public.handle_comment_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_comment_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger on_comment_insert after insert on public.comments
  for each row execute procedure public.handle_comment_insert();
create trigger on_comment_delete after delete on public.comments
  for each row execute procedure public.handle_comment_delete();

-- ── 6. VOTES ────────────────────────────────────────────────
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  post_id    uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

create index if not exists votes_post_idx on public.votes(post_id);
create index if not exists votes_user_idx on public.votes(user_id);

-- Keep vote_count in sync via triggers
create or replace function public.handle_vote_insert()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set vote_count = vote_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_vote_delete()
returns trigger language plpgsql security definer as $$
begin
  update public.posts set vote_count = greatest(vote_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger on_vote_insert after insert on public.votes
  for each row execute procedure public.handle_vote_insert();
create trigger on_vote_delete after delete on public.votes
  for each row execute procedure public.handle_vote_delete();

-- ── 7. ROW LEVEL SECURITY (RLS) ─────────────────────────────
alter table public.profiles          enable row level security;
alter table public.communities       enable row level security;
alter table public.community_members enable row level security;
alter table public.posts             enable row level security;
alter table public.comments          enable row level security;
alter table public.votes             enable row level security;

-- Profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Communities
create policy "Communities are public"
  on public.communities for select using (true);
create policy "Authenticated users can create communities"
  on public.communities for insert with check (auth.uid() = creator_id);
create policy "Creators can update their communities"
  on public.communities for update using (auth.uid() = creator_id);

-- Community members
create policy "Memberships are viewable"
  on public.community_members for select using (true);
create policy "Users can join communities"
  on public.community_members for insert with check (auth.uid() = user_id);
create policy "Users can leave communities"
  on public.community_members for delete using (auth.uid() = user_id);

-- Posts
create policy "Posts are public"
  on public.posts for select using (true);
create policy "Authenticated users can post"
  on public.posts for insert with check (auth.uid() = user_id);
create policy "Authors can update their posts"
  on public.posts for update using (auth.uid() = user_id);
create policy "Authors can delete their posts"
  on public.posts for delete using (auth.uid() = user_id);

-- Comments
create policy "Comments are public"
  on public.comments for select using (true);
create policy "Authenticated users can comment"
  on public.comments for insert with check (auth.uid() = user_id);
create policy "Authors can delete their comments"
  on public.comments for delete using (auth.uid() = user_id);

-- Votes
create policy "Votes are public"
  on public.votes for select using (true);
create policy "Authenticated users can vote"
  on public.votes for insert with check (auth.uid() = user_id);
create policy "Users can remove their votes"
  on public.votes for delete using (auth.uid() = user_id);

-- ── 8. SEED DATA ─────────────────────────────────────────────
-- Run after creating your first user to seed communities
-- Replace 'YOUR-USER-ID' with your actual user UUID from auth.users

insert into public.communities (name, slug, description, icon, creator_id, member_count)
values
  ('Lagos General',      'lagos-general',     'Everything happening in Lagos — news, gist, and vibes',           '🌍', null, 0),
  ('Tech & Startups',    'tech-startups',     'Nigerian tech ecosystem, startups, and software development',      '💻', null, 0),
  ('Politics',           'politics',          'Nigerian politics, elections, and governance discussions',         '🏛️', null, 0),
  ('Business & Finance', 'business-finance',  'Investing, entrepreneurship, and financial discussions',          '💰', null, 0),
  ('Entertainment',      'entertainment',     'Music, movies, celebrities, and pop culture',                     '🎵', null, 0),
  ('Education',          'education',         'Schools, scholarships, exams, and academic opportunities',        '📚', null, 0),
  ('Sports',             'sports',            'Football, athletics, and all sports discussion',                  '⚽', null, 0),
  ('Relationships',      'relationships',     'Dating, marriage, family, and relationship advice',               '❤️', null, 0)
on conflict (slug) do nothing;
