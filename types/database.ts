export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: number;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone_number: string | null;
          role_id: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          avatar_url?: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          phone_number?: string | null;
          role_id: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone_number?: string | null;
          role_id?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          display_order: number | null;
          image_url: string | null;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          display_order?: number | null;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          display_order?: number | null;
          image_url?: string | null;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
        };
        Insert: {
          id: string;
          name: string;
          logo_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          sku: string;
          description: string | null;
          price: number;
          category_id: string | null;
          brand_id: string | null;
          image_url: string | null;
          stock_quantity: number;
        };
        Insert: {
          name: string;
          sku: string;
          description?: string | null;
          price: number;
          category_id?: string | null;
          brand_id?: string | null;
          image_url?: string | null;
          stock_quantity?: number;
        };
        Update: {
          id?: number;
          name?: string;
          sku?: string;
          description?: string | null;
          price?: number;
          category_id?: string | null;
          brand_id?: string | null;
          image_url?: string | null;
          stock_quantity?: number;
        };
      };
      clients: {
        Row: {
          id: string;
          full_name: string;
          company_name: string | null;
          phone_number: string | null;
          email: string | null;
          address: string | null;
          sales_advisor_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          company_name?: string | null;
          phone_number?: string | null;
          email?: string | null;
          address?: string | null;
          sales_advisor_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          company_name?: string | null;
          phone_number?: string | null;
          email?: string | null;
          address?: string | null;
          sales_advisor_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          client_id: string;
          user_id: string;
          order_date: string;
          status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          user_id: string;
          order_date?: string;
          status?: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          user_id?: string;
          order_date?: string;
          status?: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: number;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
    };
  };
}