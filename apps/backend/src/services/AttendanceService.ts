import { AppError } from '../middleware/errorHandler';
import { supabase } from '../config/database';

export interface Attendance {
  id: string;
  ticketId: string;
  attendantId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export async function recordAttendance(payload: {
  ticketId: string;
  attendantId: string;
}): Promise<Attendance> {
  const { data: record, error } = await supabase
    .from('attendance_records')
    .insert([
      {
        ticket_id: payload.ticketId,
        attendant_id: payload.attendantId,
        start_time: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Failed to record attendance');
  }

  return mapToAttendance(record);
}

export async function finishAttendance(recordId: string): Promise<Attendance> {
  const { data: record, error } = await supabase
    .from('attendance_records')
    .update({
      end_time: new Date().toISOString(),
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Failed to finish attendance');
  }

  return mapToAttendance(record);
}

export async function getAttendanceStats(attendantId: string) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('attendant_id', attendantId);

  if (error) {
    throw new AppError(500, 'Failed to get attendance stats');
  }

  const records = (data || []).map(mapToAttendance);
  const totalServed = records.length;
  const avgDuration =
    totalServed > 0
      ? records.reduce((sum, r) => sum + (r.duration || 0), 0) / totalServed
      : 0;

  return { totalServed, avgDuration, records };
}

function mapToAttendance(data: any): Attendance {
  const start = new Date(data.start_time);
  const end = data.end_time ? new Date(data.end_time) : null;
  const duration = end ? (end.getTime() - start.getTime()) / 1000 : undefined;

  return {
    id: data.id,
    ticketId: data.ticket_id,
    attendantId: data.attendant_id,
    startTime: data.start_time,
    endTime: data.end_time,
    duration: duration,
  };
}
