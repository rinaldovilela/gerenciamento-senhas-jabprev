-- 1. Create custom types (Enums)
create type public.user_type as enum ('aposentado', 'pensionista', 'servidor_ativo');
create type public.ticket_status as enum ('waiting', 'in_progress', 'completed', 'cancelled', 'no_show');

-- 2. Create services table
create table public.services (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  description text null,
  icon text null,
  created_at timestamp with time zone not null default now()
);
-- RLS for services
alter table public.services enable row level security;
create policy "Services are viewable by everyone." on public.services for select using (true);
create policy "Only service_role can manage services" on public.services for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');


-- 3. Create tickets table
create table public.tickets (
  id uuid not null default gen_random_uuid() primary key,
  number integer not null,
  formatted_number text not null,
  service_id uuid not null references public.services(id),
  user_type public.user_type not null,
  status public.ticket_status not null default 'waiting',
  is_priority boolean not null default false,
  created_at timestamp with time zone not null default now(),
  started_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  operator_id uuid null references auth.users(id)
);
-- RLS for tickets
alter table public.tickets enable row level security;
create policy "Tickets are viewable by everyone." on public.tickets for select using (true);
create policy "Users can create their own tickets." on public.tickets for insert with check (true);
create policy "Authenticated users (operators) can update tickets." on public.tickets for update using (auth.role() = 'authenticated');


-- 3.5. Create users table (operators and staff)
create table public.users (
  id uuid not null default gen_random_uuid() primary key,
  auth_id uuid null references auth.users(id),
  name text not null,
  email text not null unique,
  role text not null default 'operator', -- 'operator', 'admin', 'manager'
  status text not null default 'active', -- 'active', 'inactive'
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
-- RLS for users
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users for select using (auth.uid() = auth_id);
create policy "Admins can view all users" on public.users for select using (auth.role() = 'service_role');
create policy "Users can update their own profile" on public.users for update using (auth.uid() = auth_id);


-- 3.6. Create attendance_records table
create table public.attendance_records (
  id uuid not null default gen_random_uuid() primary key,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  operator_id uuid not null references public.users(id),
  start_time timestamp with time zone not null default now(),
  end_time timestamp with time zone null,
  duration_seconds integer null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
-- RLS for attendance_records
alter table public.attendance_records enable row level security;
create policy "Attendance records are viewable by authenticated users" on public.attendance_records for select using (auth.role() = 'authenticated');
create policy "Operators can create attendance records" on public.attendance_records for insert using (auth.role() = 'authenticated');
create policy "Operators can update their own records" on public.attendance_records for update using (auth.uid() = operator_id);

-- Create index for faster queries
create index attendance_records_ticket_id_idx on public.attendance_records(ticket_id);
create index attendance_records_operator_id_idx on public.attendance_records(operator_id);
create index tickets_status_idx on public.tickets(status);
create index tickets_service_id_idx on public.tickets(service_id);


-- 4. Function to create a new ticket securely and return it
create or replace function public.create_ticket(
    p_service_id uuid,
    p_user_type public.user_type,
    p_is_priority boolean
)
returns public.tickets
as $$
declare
    v_prefix text;
    v_next_number int;
    v_formatted_number text;
    v_new_ticket public.tickets;
begin
    -- Determine the prefix based on priority and user type
    if p_is_priority then
        v_prefix := 'PRIO';
    else
        case p_user_type
            when 'aposentado' then v_prefix := 'APO';
            when 'pensionista' then v_prefix := 'PEN';
            when 'servidor_ativo' then v_prefix := 'ATV';
        end case;
    end if;

    -- Get the next number for the given prefix for today (in UTC to be safe)
    select coalesce(max(number), 0) + 1
    into v_next_number
    from public.tickets
    where formatted_number like (v_prefix || '-%')
      and date(created_at at time zone 'utc') = date(now() at time zone 'utc');

    -- Format the ticket number (e.g., APO-001)
    v_formatted_number := v_prefix || '-' || lpad(v_next_number::text, 3, '0');

    -- Insert the new ticket record
    insert into public.tickets (
        number,
        formatted_number,
        service_id,
        user_type,
        is_priority,
        status
    ) values (
        v_next_number,
        v_formatted_number,
        p_service_id,
        p_user_type,
        p_is_priority,
        'waiting'
    ) returning * into v_new_ticket;

    return v_new_ticket;
end;
$$ language plpgsql volatile;



-- 5. Enable real-time on tables
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.services;


-- 6. Insert initial data for services
-- This data comes from your project's constants.tsx
INSERT INTO public.services (id, name, description, icon) VALUES
('a1b2c3d4-0001-4e5f-86a7-b8c9d0e1f2a3', 'Prova de Vida', 'Realização de prova de vida para aposentados e pensionistas.', 'fingerprint'),
('a1b2c3d4-0002-4e5f-86a7-b8c9d0e1f2a3', 'Recadastramento', 'Atualização de dados cadastrais.', 'person-add'),
('a1b2c3d4-0003-4e5f-86a7-b8c9d0e1f2a3', 'Pensão', 'Solicitação ou informações sobre pensão.', 'family-restroom'),
('a1b2c3d4-0004-4e5f-86a7-b8c9d0e1f2a3', 'Contracheque', 'Emissão ou consulta de contracheques.', 'receipt-long'),
('a1b2c3d4-0005-4e5f-86a7-b8c9d0e1f2a3', 'Aposentadoria', 'Informações sobre processos de aposentadoria.', 'elderly'),
('a1b2c3d4-0006-4e5f-86a7-b8c9d0e1f2a3', 'Outros Assuntos', 'Atendimento para outros serviços e informações.', 'help-circle');
