-- Add attendee name to tickets and extend create_ticket function.

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS attendee_name text;

DROP FUNCTION IF EXISTS public.create_ticket(uuid, public.user_type, boolean);

CREATE OR REPLACE FUNCTION public.create_ticket(
    p_service_id uuid,
    p_user_type public.user_type,
    p_is_priority boolean,
    p_attendee_name text DEFAULT NULL
)
RETURNS public.tickets
AS $$
DECLARE
    v_prefix text;
    v_next_number int;
    v_formatted_number text;
    v_attendee_name text;
    v_new_ticket public.tickets;
BEGIN
    IF p_is_priority THEN
        v_prefix := 'PRIO';
    ELSE
        CASE p_user_type
            WHEN 'aposentado' THEN v_prefix := 'APO';
            WHEN 'pensionista' THEN v_prefix := 'PEN';
            WHEN 'servidor_ativo' THEN v_prefix := 'ATV';
        END CASE;
    END IF;

    SELECT COALESCE(MAX(number), 0) + 1
    INTO v_next_number
    FROM public.tickets
    WHERE formatted_number LIKE (v_prefix || '-%')
      AND DATE(created_at AT TIME ZONE 'utc') = DATE(NOW() AT TIME ZONE 'utc');

    v_formatted_number := v_prefix || '-' || LPAD(v_next_number::text, 3, '0');
    v_attendee_name := NULLIF(TRIM(p_attendee_name), '');

    INSERT INTO public.tickets (
        number,
        formatted_number,
        service_id,
        user_type,
        is_priority,
        attendee_name,
        status
    ) VALUES (
        v_next_number,
        v_formatted_number,
        p_service_id,
        p_user_type,
        p_is_priority,
        v_attendee_name,
        'waiting'
    ) RETURNING * INTO v_new_ticket;

    RETURN v_new_ticket;
END;
$$ LANGUAGE plpgsql VOLATILE;
