-- Prevent duplicate ticket numbers per day/prefix under concurrent requests.

-- Clean historical duplicates first, keeping the oldest row per (day, formatted_number).
with ranked as (
    select
        id,
        row_number() over (
            partition by date(created_at at time zone 'utc'), formatted_number
            order by created_at asc, id asc
        ) as rn
    from public.tickets
),
to_delete as (
    select id
    from ranked
    where rn > 1
)
delete from public.tickets t
using to_delete d
where t.id = d.id;

-- Enforce daily uniqueness for formatted numbers.
create unique index if not exists tickets_unique_daily_formatted_number_idx
on public.tickets ((date(created_at at time zone 'utc')), formatted_number);

-- Recreate function with an advisory transaction lock per prefix/day.
create or replace function public.create_ticket(
    p_service_id uuid,
    p_user_type public.user_type,
    p_is_priority boolean,
    p_attendee_name text default null
)
returns public.tickets
as $$
declare
    v_prefix text;
    v_next_number int;
    v_formatted_number text;
    v_attendee_name text;
    v_day_utc date;
    v_lock_key text;
    v_new_ticket public.tickets;
begin
    if p_is_priority then
        v_prefix := 'PRIO';
    else
        case p_user_type
            when 'aposentado' then v_prefix := 'APO';
            when 'pensionista' then v_prefix := 'PEN';
            when 'servidor_ativo' then v_prefix := 'ATV';
        end case;
    end if;

    v_day_utc := date(now() at time zone 'utc');
    v_lock_key := v_prefix || '-' || to_char(v_day_utc, 'YYYYMMDD');

    -- Serialize ticket number generation for the same prefix/day.
    perform pg_advisory_xact_lock(hashtext(v_lock_key));

    select coalesce(max(number), 0) + 1
    into v_next_number
    from public.tickets
    where formatted_number like (v_prefix || '-%')
      and date(created_at at time zone 'utc') = v_day_utc;

    v_formatted_number := v_prefix || '-' || lpad(v_next_number::text, 3, '0');
    v_attendee_name := nullif(trim(p_attendee_name), '');

    insert into public.tickets (
        number,
        formatted_number,
        service_id,
        user_type,
        is_priority,
        attendee_name,
        status
    ) values (
        v_next_number,
        v_formatted_number,
        p_service_id,
        p_user_type,
        p_is_priority,
        v_attendee_name,
        'waiting'
    ) returning * into v_new_ticket;

    return v_new_ticket;
end;
$$ language plpgsql volatile;
