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
          is_wholesaler: boolean;
          business_name: string | null;
          ruc: string | null;
          document_id: string | null;
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
          is_wholesaler?: boolean;
          business_name?: string | null;
          ruc?: string | null;
          document_id?: string | null;
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
          is_wholesaler?: boolean;
          business_name?: string | null;
          ruc?: string | null;
          document_id?: string | null;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string | null;
          postal_code: string | null;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          address: string;
          city: string;
          phone: string | null;
          latitude: number | null;
          longitude: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          city: string;
          phone?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          city?: string;
          phone?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      wholesaler_requests: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          ruc: string;
          business_address: string;
          city: string;
          reference: string | null;
          status: 'pending' | 'approved' | 'rejected';
          documents: any;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          ruc: string;
          business_address: string;
          city: string;
          reference?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          documents?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          ruc?: string;
          business_address?: string;
          city?: string;
          reference?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          documents?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wholesaler_pricing: {
        Row: {
          id: string;
          product_id: number;
          min_quantity: number;
          unit_price: number;
          discount_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: number;
          min_quantity?: number;
          unit_price: number;
          discount_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: number;
          min_quantity?: number;
          unit_price?: number;
          discount_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_order_amount: number;
          max_uses: number | null;
          used_count: number;
          valid_from: string;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type?: 'percentage' | 'fixed';
          discount_value: number;
          min_order_amount?: number;
          max_uses?: number | null;
          used_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          description?: string | null;
          discount_type?: 'percentage' | 'fixed';
          discount_value?: number;
          min_order_amount?: number;
          max_uses?: number | null;
          used_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          is_active?: boolean;
          created_at?: string;
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
          average_rating: number;
          review_count: number;
          sizes: any;
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
          average_rating?: number;
          review_count?: number;
          sizes?: any;
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
          average_rating?: number;
          review_count?: number;
          sizes?: any;
        };
      };
      product_reviews: {
        Row: {
          id: string;
          product_id: number;
          user_id: string;
          rating: number;
          title: string | null;
          comment: string | null;
          is_verified_purchase: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: number;
          user_id: string;
          rating: number;
          title?: string | null;
          comment?: string | null;
          is_verified_purchase?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: number;
          user_id?: string;
          rating?: number;
          title?: string | null;
          comment?: string | null;
          is_verified_purchase?: boolean;
          created_at?: string;
          updated_at?: string;
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
          delivery_address_id: string | null;
          delivery_option_id: string | null;
          payment_method: string;
          delivery_fee: number;
          coupon_code: string | null;
          discount_amount: number;
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
          delivery_address_id?: string | null;
          delivery_option_id?: string | null;
          payment_method?: string;
          delivery_fee?: number;
          coupon_code?: string | null;
          discount_amount?: number;
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
          delivery_address_id?: string | null;
          delivery_option_id?: string | null;
          payment_method?: string;
          delivery_fee?: number;
          coupon_code?: string | null;
          discount_amount?: number;
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
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: 'card' | 'paypal' | 'bank_transfer';
          provider: string | null;
          last_four: string | null;
          cardholder_name: string | null;
          expiry_month: number | null;
          expiry_year: number | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'card' | 'paypal' | 'bank_transfer';
          provider?: string | null;
          last_four?: string | null;
          cardholder_name?: string | null;
          expiry_month?: number | null;
          expiry_year?: number | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'card' | 'paypal' | 'bank_transfer';
          provider?: string | null;
          last_four?: string | null;
          cardholder_name?: string | null;
          expiry_month?: number | null;
          expiry_year?: number | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      delivery_options: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          estimated_days: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number;
          estimated_days?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          estimated_days?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          message: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          message?: string;
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}