export interface Database {
  users: {
    Row: {
      id: string;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      status: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      email: string;
      name: string;
      password_hash: string;
      role?: string;
      status?: string;
    };
    Update: {
      email?: string;
      name?: string;
      role?: string;
      status?: string;
    };
  };

  tickets: {
    Row: {
      id: string;
      user_id: string;
      service: string;
      priority: string;
      status: string;
      description?: string;
      attendant_id?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
      updated_by?: string;
    };
    Insert: {
      user_id: string;
      service: string;
      priority: string;
      description?: string;
      status?: string;
    };
    Update: {
      status?: string;
      attendant_id?: string;
      notes?: string;
      updated_by?: string;
    };
  };

  attendance_records: {
    Row: {
      id: string;
      ticket_id: string;
      attendant_id: string;
      start_time: string;
      end_time?: string;
    };
    Insert: {
      ticket_id: string;
      attendant_id: string;
    };
    Update: {
      end_time?: string;
    };
  };
}
