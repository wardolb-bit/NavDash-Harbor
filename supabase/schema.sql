-- NavDash Harbor domain schema
-- Phase 1 database foundation only. This defines future domain data without
-- implementing Phase 2+ application features.

do $$
begin
  create type public.user_role as enum ('admin', 'deck', 'engine');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.department as enum ('deck', 'engine', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.voyage_status as enum ('Draft', 'Active', 'Complete');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.voyage_phase as enum ('Planning', 'Pre-Departure', 'Underway', 'Pre-Arrival', 'Complete');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.route_file_type as enum ('RTZ', 'XML', 'CSV', 'GPX', 'KML');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.hazard_priority as enum ('Routine', 'Important', 'Urgent', 'Safety Critical');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.hazard_status as enum ('Active', 'Monitoring', 'Resolved');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_scope as enum ('shared', 'voyage');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.checklist_instance_status as enum ('Open', 'In Progress', 'Complete');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.pms_system as enum ('Navigation', 'Communications', 'Safety', 'Electrical', 'Propulsion', 'Auxiliary');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.pms_task_status as enum ('Scheduled', 'In Progress', 'Complete', 'Deferred', 'Unable to Complete');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_source as enum ('PMS', 'Checklist', 'Manual');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_priority as enum ('Routine', 'Important', 'Urgent', 'Safety Critical');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_status as enum ('Open', 'In Progress', 'Resolved', 'Closed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_kind as enum ('task', 'maintenance', 'voyage', 'issue', 'document', 'system');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text,
  role public.user_role not null default 'deck',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voyages (
  id uuid primary key default gen_random_uuid(),
  voyage_number text not null unique,
  vessel_name text not null,
  title text not null,
  origin text,
  destination text,
  etd timestamptz,
  eta timestamptz,
  status public.voyage_status not null default 'Draft',
  phase public.voyage_phase not null default 'Planning',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.voyage_assignments (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null,
  assigned_at timestamptz not null default now(),
  unique (voyage_id, user_id)
);

create table if not exists public.voyage_route_files (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  file_name text not null,
  file_type public.route_file_type not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  replaced_at timestamptz,
  is_current boolean not null default true
);

create table if not exists public.voyage_waypoints (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  route_file_id uuid not null references public.voyage_route_files(id) on delete cascade,
  sequence integer not null,
  name text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  remarks text,
  created_at timestamptz not null default now(),
  unique (route_file_id, sequence)
);

create table if not exists public.voyage_weather (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  summary text not null default '',
  source_reference text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (voyage_id)
);

create table if not exists public.voyage_hazards (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  title text not null,
  location text,
  description text,
  priority public.hazard_priority not null default 'Routine',
  status public.hazard_status not null default 'Active',
  source_reference text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.shared_documents(id) on delete cascade,
  version_number integer not null,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  unique (document_id, version_number)
);

create table if not exists public.voyage_documents (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  title text not null,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  tags text[] not null default '{}'
);

create table if not exists public.voyage_reports (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  report_type text not null default 'Voyage Brief PDF',
  file_name text not null,
  storage_path text not null,
  generated_by uuid references public.profiles(id) on delete set null,
  generated_at timestamptz not null default now(),
  is_current boolean not null default true
);

create table if not exists public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department public.department not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.checklist_templates(id) on delete cascade,
  sequence integer not null,
  label text not null,
  help_text text,
  requires_note boolean not null default false,
  requires_attachment boolean not null default false,
  unique (template_id, sequence)
);

create table if not exists public.checklist_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.checklist_templates(id) on delete set null,
  voyage_id uuid references public.voyages(id) on delete set null,
  title text not null,
  department public.department not null,
  status public.checklist_instance_status not null default 'Open',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  completed_by uuid references public.profiles(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_item_responses (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.checklist_instances(id) on delete cascade,
  template_item_id uuid references public.checklist_template_items(id) on delete set null,
  is_complete boolean not null default false,
  note text,
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.checklist_attachments (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.checklist_item_responses(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.pms_equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  system public.pms_system not null,
  description text,
  manufacturer text,
  model text,
  serial_number text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pms_tasks (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.pms_equipment(id) on delete cascade,
  title text not null,
  description text,
  interval_days integer,
  due_at timestamptz,
  assigned_to uuid references public.profiles(id) on delete set null,
  status public.pms_task_status not null default 'Scheduled',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pms_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.pms_tasks(id) on delete cascade,
  status public.pms_task_status not null,
  notes text,
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz not null default now(),
  next_due_at timestamptz
);

create table if not exists public.pms_attachments (
  id uuid primary key default gen_random_uuid(),
  completion_id uuid not null references public.pms_completions(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority public.issue_priority not null default 'Routine',
  status public.issue_status not null default 'Open',
  department public.department not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  source public.issue_source not null default 'Manual',
  voyage_id uuid references public.voyages(id) on delete set null,
  checklist_instance_id uuid references public.checklist_instances(id) on delete set null,
  pms_task_id uuid references public.pms_tasks(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  resolved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.issue_attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.notification_kind not null default 'system',
  title text not null,
  body text,
  related_table text,
  related_id uuid,
  is_read boolean not null default false,
  acknowledged_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  voyage_id uuid references public.voyages(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists voyages_status_phase_idx on public.voyages (status, phase);
create index if not exists voyage_assignments_user_idx on public.voyage_assignments (user_id);
create index if not exists voyage_waypoints_voyage_sequence_idx on public.voyage_waypoints (voyage_id, sequence);
create index if not exists voyage_hazards_voyage_status_idx on public.voyage_hazards (voyage_id, status);
create index if not exists checklist_instances_department_status_idx on public.checklist_instances (department, status);
create index if not exists pms_tasks_status_due_idx on public.pms_tasks (status, due_at);
create index if not exists issues_department_status_idx on public.issues (department, status);
create index if not exists notifications_user_active_idx on public.notifications (user_id, archived_at, is_read);
create index if not exists audit_log_entity_idx on public.audit_log (entity_table, entity_id);
create index if not exists audit_log_voyage_idx on public.audit_log (voyage_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.is_department_member(target_department public.department)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or (target_department = 'deck' and public.current_user_role() = 'deck')
    or (target_department = 'engine' and public.current_user_role() = 'engine')
    or (target_department = 'admin' and public.current_user_role() = 'admin')
$$;

create or replace function public.is_assigned_to_voyage(target_voyage_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.voyage_assignments
      where voyage_id = target_voyage_id
        and user_id = auth.uid()
    )
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'voyages',
    'voyage_assignments',
    'voyage_route_files',
    'voyage_waypoints',
    'voyage_weather',
    'voyage_hazards',
    'shared_documents',
    'shared_document_versions',
    'voyage_documents',
    'voyage_reports',
    'checklist_templates',
    'checklist_template_items',
    'checklist_instances',
    'checklist_item_responses',
    'checklist_attachments',
    'pms_equipment',
    'pms_tasks',
    'pms_completions',
    'pms_attachments',
    'issues',
    'issue_attachments',
    'notifications',
    'audit_log'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Profiles are readable by authenticated users"
on public.profiles for select to authenticated
using (true);
create policy "Admins manage profiles"
on public.profiles for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Voyages are readable by authenticated users" on public.voyages;
drop policy if exists "Admins manage voyages" on public.voyages;
drop policy if exists "Assigned users update voyages" on public.voyages;
create policy "Voyages are readable by authenticated users"
on public.voyages for select to authenticated
using (true);
create policy "Admins manage voyages"
on public.voyages for all to authenticated
using (public.is_admin())
with check (public.is_admin());
create policy "Assigned users update voyages"
on public.voyages for update to authenticated
using (public.is_assigned_to_voyage(id))
with check (public.is_assigned_to_voyage(id));

drop policy if exists "Voyage child records are readable by authenticated users" on public.voyage_assignments;
drop policy if exists "Admins manage voyage assignments" on public.voyage_assignments;
create policy "Voyage assignments are readable by authenticated users"
on public.voyage_assignments for select to authenticated
using (true);
create policy "Admins manage voyage assignments"
on public.voyage_assignments for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Voyage route files are readable by authenticated users" on public.voyage_route_files;
drop policy if exists "Assigned users manage voyage route files" on public.voyage_route_files;
create policy "Voyage route files are readable by authenticated users"
on public.voyage_route_files for select to authenticated
using (true);
create policy "Assigned users manage voyage route files"
on public.voyage_route_files for all to authenticated
using (public.is_assigned_to_voyage(voyage_id))
with check (public.is_assigned_to_voyage(voyage_id));

drop policy if exists "Voyage waypoints are readable by authenticated users" on public.voyage_waypoints;
drop policy if exists "Assigned users manage voyage waypoints" on public.voyage_waypoints;
create policy "Voyage waypoints are readable by authenticated users"
on public.voyage_waypoints for select to authenticated
using (true);
create policy "Assigned users manage voyage waypoints"
on public.voyage_waypoints for all to authenticated
using (public.is_assigned_to_voyage(voyage_id))
with check (public.is_assigned_to_voyage(voyage_id));

drop policy if exists "Voyage weather is readable by authenticated users" on public.voyage_weather;
drop policy if exists "Assigned users manage voyage weather" on public.voyage_weather;
create policy "Voyage weather is readable by authenticated users"
on public.voyage_weather for select to authenticated
using (true);
create policy "Assigned users manage voyage weather"
on public.voyage_weather for all to authenticated
using (public.is_assigned_to_voyage(voyage_id))
with check (public.is_assigned_to_voyage(voyage_id));

drop policy if exists "Voyage hazards are readable by authenticated users" on public.voyage_hazards;
drop policy if exists "Assigned users manage voyage hazards" on public.voyage_hazards;
create policy "Voyage hazards are readable by authenticated users"
on public.voyage_hazards for select to authenticated
using (true);
create policy "Assigned users manage voyage hazards"
on public.voyage_hazards for all to authenticated
using (public.is_assigned_to_voyage(voyage_id))
with check (public.is_assigned_to_voyage(voyage_id));

drop policy if exists "Shared documents are readable by authenticated users" on public.shared_documents;
drop policy if exists "Admins manage shared documents" on public.shared_documents;
create policy "Shared documents are readable by authenticated users"
on public.shared_documents for select to authenticated
using (true);
create policy "Admins manage shared documents"
on public.shared_documents for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Shared document versions are readable by authenticated users" on public.shared_document_versions;
drop policy if exists "Admins manage shared document versions" on public.shared_document_versions;
create policy "Shared document versions are readable by authenticated users"
on public.shared_document_versions for select to authenticated
using (true);
create policy "Admins manage shared document versions"
on public.shared_document_versions for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Voyage documents are readable by authenticated users" on public.voyage_documents;
drop policy if exists "Assigned users manage voyage documents" on public.voyage_documents;
create policy "Voyage documents are readable by authenticated users"
on public.voyage_documents for select to authenticated
using (true);
create policy "Assigned users manage voyage documents"
on public.voyage_documents for all to authenticated
using (public.is_assigned_to_voyage(voyage_id))
with check (public.is_assigned_to_voyage(voyage_id));

drop policy if exists "Voyage reports are readable by authenticated users" on public.voyage_reports;
drop policy if exists "Assigned users manage voyage reports" on public.voyage_reports;
create policy "Voyage reports are readable by authenticated users"
on public.voyage_reports for select to authenticated
using (true);
create policy "Assigned users manage voyage reports"
on public.voyage_reports for all to authenticated
using (public.is_assigned_to_voyage(voyage_id))
with check (public.is_assigned_to_voyage(voyage_id));

drop policy if exists "Checklist templates readable by department" on public.checklist_templates;
drop policy if exists "Admins manage checklist templates" on public.checklist_templates;
create policy "Checklist templates readable by department"
on public.checklist_templates for select to authenticated
using (public.is_department_member(department));
create policy "Admins manage checklist templates"
on public.checklist_templates for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Checklist template items readable by template department" on public.checklist_template_items;
drop policy if exists "Admins manage checklist template items" on public.checklist_template_items;
create policy "Checklist template items readable by template department"
on public.checklist_template_items for select to authenticated
using (
  exists (
    select 1 from public.checklist_templates
    where checklist_templates.id = checklist_template_items.template_id
      and public.is_department_member(checklist_templates.department)
  )
);
create policy "Admins manage checklist template items"
on public.checklist_template_items for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Checklist instances readable by department" on public.checklist_instances;
drop policy if exists "Department users manage checklist instances" on public.checklist_instances;
create policy "Checklist instances readable by department"
on public.checklist_instances for select to authenticated
using (public.is_department_member(department));
create policy "Department users manage checklist instances"
on public.checklist_instances for all to authenticated
using (public.is_department_member(department))
with check (public.is_department_member(department));

drop policy if exists "Checklist responses readable by instance department" on public.checklist_item_responses;
drop policy if exists "Department users manage checklist responses" on public.checklist_item_responses;
create policy "Checklist responses readable by instance department"
on public.checklist_item_responses for select to authenticated
using (
  exists (
    select 1 from public.checklist_instances
    where checklist_instances.id = checklist_item_responses.instance_id
      and public.is_department_member(checklist_instances.department)
  )
);
create policy "Department users manage checklist responses"
on public.checklist_item_responses for all to authenticated
using (
  exists (
    select 1 from public.checklist_instances
    where checklist_instances.id = checklist_item_responses.instance_id
      and public.is_department_member(checklist_instances.department)
  )
)
with check (
  exists (
    select 1 from public.checklist_instances
    where checklist_instances.id = checklist_item_responses.instance_id
      and public.is_department_member(checklist_instances.department)
  )
);

drop policy if exists "Checklist attachments readable by response department" on public.checklist_attachments;
drop policy if exists "Department users manage checklist attachments" on public.checklist_attachments;
create policy "Checklist attachments readable by response department"
on public.checklist_attachments for select to authenticated
using (
  exists (
    select 1
    from public.checklist_item_responses r
    join public.checklist_instances i on i.id = r.instance_id
    where r.id = checklist_attachments.response_id
      and public.is_department_member(i.department)
  )
);
create policy "Department users manage checklist attachments"
on public.checklist_attachments for all to authenticated
using (
  exists (
    select 1
    from public.checklist_item_responses r
    join public.checklist_instances i on i.id = r.instance_id
    where r.id = checklist_attachments.response_id
      and public.is_department_member(i.department)
  )
)
with check (
  exists (
    select 1
    from public.checklist_item_responses r
    join public.checklist_instances i on i.id = r.instance_id
    where r.id = checklist_attachments.response_id
      and public.is_department_member(i.department)
  )
);

drop policy if exists "PMS equipment readable by authenticated users" on public.pms_equipment;
drop policy if exists "Admins manage PMS equipment" on public.pms_equipment;
create policy "PMS equipment readable by authenticated users"
on public.pms_equipment for select to authenticated
using (true);
create policy "Admins manage PMS equipment"
on public.pms_equipment for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "PMS tasks readable by authenticated users" on public.pms_tasks;
drop policy if exists "Engine and admins manage PMS tasks" on public.pms_tasks;
create policy "PMS tasks readable by authenticated users"
on public.pms_tasks for select to authenticated
using (true);
create policy "Engine and admins manage PMS tasks"
on public.pms_tasks for all to authenticated
using (public.is_department_member('engine'))
with check (public.is_department_member('engine'));

drop policy if exists "PMS completions readable by authenticated users" on public.pms_completions;
drop policy if exists "Engine and admins manage PMS completions" on public.pms_completions;
create policy "PMS completions readable by authenticated users"
on public.pms_completions for select to authenticated
using (true);
create policy "Engine and admins manage PMS completions"
on public.pms_completions for all to authenticated
using (public.is_department_member('engine'))
with check (public.is_department_member('engine'));

drop policy if exists "PMS attachments readable by authenticated users" on public.pms_attachments;
drop policy if exists "Engine and admins manage PMS attachments" on public.pms_attachments;
create policy "PMS attachments readable by authenticated users"
on public.pms_attachments for select to authenticated
using (true);
create policy "Engine and admins manage PMS attachments"
on public.pms_attachments for all to authenticated
using (public.is_department_member('engine'))
with check (public.is_department_member('engine'));

drop policy if exists "Issues readable by department" on public.issues;
drop policy if exists "Department users manage issues" on public.issues;
create policy "Issues readable by department"
on public.issues for select to authenticated
using (public.is_department_member(department));
create policy "Department users manage issues"
on public.issues for all to authenticated
using (public.is_department_member(department))
with check (public.is_department_member(department));

drop policy if exists "Issue attachments readable by issue department" on public.issue_attachments;
drop policy if exists "Department users manage issue attachments" on public.issue_attachments;
create policy "Issue attachments readable by issue department"
on public.issue_attachments for select to authenticated
using (
  exists (
    select 1 from public.issues
    where issues.id = issue_attachments.issue_id
      and public.is_department_member(issues.department)
  )
);
create policy "Department users manage issue attachments"
on public.issue_attachments for all to authenticated
using (
  exists (
    select 1 from public.issues
    where issues.id = issue_attachments.issue_id
      and public.is_department_member(issues.department)
  )
)
with check (
  exists (
    select 1 from public.issues
    where issues.id = issue_attachments.issue_id
      and public.is_department_member(issues.department)
  )
);

drop policy if exists "Users read own notifications" on public.notifications;
drop policy if exists "Users update own notifications" on public.notifications;
drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Users read own notifications"
on public.notifications for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy "Users update own notifications"
on public.notifications for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());
create policy "Admins manage notifications"
on public.notifications for all to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read audit log" on public.audit_log;
drop policy if exists "Authenticated users insert audit log" on public.audit_log;
create policy "Admins read audit log"
on public.audit_log for select to authenticated
using (public.is_admin());
create policy "Authenticated users insert audit log"
on public.audit_log for insert to authenticated
with check (actor_id = auth.uid() or public.is_admin());

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists voyages_set_updated_at on public.voyages;
create trigger voyages_set_updated_at
before update on public.voyages
for each row execute function public.set_updated_at();

drop trigger if exists voyage_hazards_set_updated_at on public.voyage_hazards;
create trigger voyage_hazards_set_updated_at
before update on public.voyage_hazards
for each row execute function public.set_updated_at();

drop trigger if exists shared_documents_set_updated_at on public.shared_documents;
create trigger shared_documents_set_updated_at
before update on public.shared_documents
for each row execute function public.set_updated_at();

drop trigger if exists checklist_templates_set_updated_at on public.checklist_templates;
create trigger checklist_templates_set_updated_at
before update on public.checklist_templates
for each row execute function public.set_updated_at();

drop trigger if exists checklist_instances_set_updated_at on public.checklist_instances;
create trigger checklist_instances_set_updated_at
before update on public.checklist_instances
for each row execute function public.set_updated_at();

drop trigger if exists checklist_item_responses_set_updated_at on public.checklist_item_responses;
create trigger checklist_item_responses_set_updated_at
before update on public.checklist_item_responses
for each row execute function public.set_updated_at();

drop trigger if exists pms_equipment_set_updated_at on public.pms_equipment;
create trigger pms_equipment_set_updated_at
before update on public.pms_equipment
for each row execute function public.set_updated_at();

drop trigger if exists pms_tasks_set_updated_at on public.pms_tasks;
create trigger pms_tasks_set_updated_at
before update on public.pms_tasks
for each row execute function public.set_updated_at();

drop trigger if exists issues_set_updated_at on public.issues;
create trigger issues_set_updated_at
before update on public.issues
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), new.id::text),
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'deck')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values
  ('documents', 'documents', false),
  ('voyages', 'voyages', false),
  ('checklists', 'checklists', false),
  ('pms', 'pms', false),
  ('issues', 'issues', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users read storage objects" on storage.objects;
drop policy if exists "Authenticated users upload storage objects" on storage.objects;
drop policy if exists "Authenticated users update storage objects" on storage.objects;
drop policy if exists "Authenticated users delete storage objects" on storage.objects;
create policy "Authenticated users read storage objects"
on storage.objects for select to authenticated
using (bucket_id in ('documents', 'voyages', 'checklists', 'pms', 'issues'));
create policy "Authenticated users upload storage objects"
on storage.objects for insert to authenticated
with check (bucket_id in ('documents', 'voyages', 'checklists', 'pms', 'issues'));
create policy "Authenticated users update storage objects"
on storage.objects for update to authenticated
using (bucket_id in ('documents', 'voyages', 'checklists', 'pms', 'issues'))
with check (bucket_id in ('documents', 'voyages', 'checklists', 'pms', 'issues'));
create policy "Authenticated users delete storage objects"
on storage.objects for delete to authenticated
using (bucket_id in ('documents', 'voyages', 'checklists', 'pms', 'issues') and public.is_admin());

create table if not exists public.vessels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  created_at timestamp default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'voyages'
      and policyname = 'Deck users can create voyages'
  ) then
    create policy "Deck users can create voyages"
    on public.voyages for insert
    to authenticated
    with check (public.current_user_role() = 'deck');
  end if;
end $$;
