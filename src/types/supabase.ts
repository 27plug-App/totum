export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: 'admin' | 'employee' | 'parent';
          status: 'active' | 'inactive';
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          status: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          provider_id: string;
          start_time: string;
          end_time: string;
          type: string;
          status: string;
          notes: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
    };
  };
}