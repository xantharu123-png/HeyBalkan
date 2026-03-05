-- =============================================
-- HEY BALKAN APP – Supabase Schema
-- Fuehre dieses SQL im Supabase SQL Editor aus
-- =============================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text not null,
  birth_date date not null,
  origin_country text not null,
  spoken_languages text[] default '{}',
  city text,
  living_country text,
  religion text,
  relationship_goal text,
  bio text,
  photos text[] default '{}',
  gender text,
  looking_for text,
  onboarding_complete boolean default false,
  is_verified boolean default false,
  last_active timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. SWIPES
create table if not exists public.swipes (
  id bigint generated always as identity primary key,
  swiper_id uuid references public.profiles(id) on delete cascade not null,
  swiped_id uuid references public.profiles(id) on delete cascade not null,
  action text not null check (action in ('like', 'pass', 'super_like')),
  created_at timestamptz default now(),
  unique(swiper_id, swiped_id)
);

-- 3. MATCHES
create table if not exists public.matches (
  id bigint generated always as identity primary key,
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user1_id, user2_id)
);

-- 4. MESSAGES
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  match_id bigint references public.matches(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- 5. BLOCKS
create table if not exists public.blocks (
  id bigint generated always as identity primary key,
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

-- 6. FAMILY RELATIONS (Porodica-Modus)
create table if not exists public.family_relations (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  family_member_id uuid references public.profiles(id) on delete cascade not null,
  relation_type text default 'parent',
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  unique(user_id, family_member_id)
);

-- 7. PORODICA SUGGESTIONS
create table if not exists public.porodica_suggestions (
  id bigint generated always as identity primary key,
  suggester_id uuid references public.profiles(id) on delete cascade not null,
  for_user_id uuid references public.profiles(id) on delete cascade not null,
  suggested_profile_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  status text default 'pending' check (status in ('pending', 'seen', 'liked', 'passed')),
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES fuer Performance
-- =============================================
create index if not exists idx_swipes_swiper on public.swipes(swiper_id);
create index if not exists idx_swipes_swiped on public.swipes(swiped_id);
create index if not exists idx_matches_user1 on public.matches(user1_id);
create index if not exists idx_matches_user2 on public.matches(user2_id);
create index if not exists idx_messages_match on public.messages(match_id);
create index if not exists idx_messages_created on public.messages(created_at);
create index if not exists idx_profiles_origin on public.profiles(origin_country);
create index if not exists idx_profiles_country on public.profiles(living_country);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.family_relations enable row level security;
alter table public.porodica_suggestions enable row level security;

-- PROFILES: Anyone can read, users can update their own
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- SWIPES: Users can create their own swipes, read their own
create policy "Users can insert their own swipes"
  on public.swipes for insert
  to authenticated
  with check (auth.uid() = swiper_id);

create policy "Users can view their own swipes"
  on public.swipes for select
  to authenticated
  using (auth.uid() = swiper_id or auth.uid() = swiped_id);

-- MATCHES: Users can read their own matches
create policy "Users can view their own matches"
  on public.matches for select
  to authenticated
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can create matches"
  on public.matches for insert
  to authenticated
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- MESSAGES: Users can read/write messages in their matches
create policy "Users can view messages in their matches"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.matches
      where matches.id = messages.match_id
      and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

create policy "Users can send messages in their matches"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches
      where matches.id = match_id
      and (matches.user1_id = auth.uid() or matches.user2_id = auth.uid())
    )
  );

-- BLOCKS: Users can manage their own blocks
create policy "Users can view their blocks"
  on public.blocks for select
  to authenticated
  using (auth.uid() = blocker_id);

create policy "Users can create blocks"
  on public.blocks for insert
  to authenticated
  with check (auth.uid() = blocker_id);

create policy "Users can delete their blocks"
  on public.blocks for delete
  to authenticated
  using (auth.uid() = blocker_id);

-- FAMILY RELATIONS
create policy "Users can view their family relations"
  on public.family_relations for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = family_member_id);

create policy "Users can create family relations"
  on public.family_relations for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Family members can update status"
  on public.family_relations for update
  to authenticated
  using (auth.uid() = family_member_id);

-- PORODICA SUGGESTIONS
create policy "Users can view their suggestions"
  on public.porodica_suggestions for select
  to authenticated
  using (auth.uid() = for_user_id or auth.uid() = suggester_id);

create policy "Family can create suggestions"
  on public.porodica_suggestions for insert
  to authenticated
  with check (auth.uid() = suggester_id);

create policy "Users can update suggestion status"
  on public.porodica_suggestions for update
  to authenticated
  using (auth.uid() = for_user_id);

-- =============================================
-- STORAGE BUCKET fuer Fotos
-- =============================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'photos');

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

create policy "Users can update their own photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos');

create policy "Users can delete their own photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');

-- =============================================
-- REALTIME aktivieren fuer Messages
-- =============================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;
