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
          default_store_id: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
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
          phone?: string | null;
          role?: string;
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
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          label: string;
          address: string;
          address_line_1: string;
          address_line_2: string | null;
          district: string;
          city: string;
          state: string | null;
          postal_code: string | null;
          country: string;
          reference: string | null;
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
    Functions: {
      api_search_products: {
        Args: {
          q: string;
          category: string | null;
          brand: string | null;
          sort: string;
          limit_: number;
          offset_: number;
        };
        Returns: any[];
      };
      api_product_detail: {
        Args: {
          _product_id: number;
          _store_id: string;
        };
        Returns: any;
      };
      api_get_stock_by_product: {
        Args: {
          _product_id: number;
        };
        Returns: any[];
      };
      api_place_order: {
        Args: {
          p_fulfillment: string;
          p_store_id: string | null;
          p_address_id: string | null;
          p_payment_method: string;
          p_notes: string;
        };
        Returns: any;
      };
      api_upsert_address: {
        Args: {
          p_id: string | null;
          p_type: string;
          p_label: string;
          p_address: string;
          p_district: string;
          p_city: string;
          p_reference: string | null;
          p_is_default: boolean;
        };
        Returns: any;
      };
      api_set_default_store: {
        Args: {
          p_store_id: string;
        };
        Returns: any;
      };
      api_request_wholesaler: {
        Args: {
          p_business_name: string;
          p_ruc: string;
          p_business_address: string;
          p_city: string;
          p_reference: string | null;
        };
        Returns: any;
      };
    };
  };
}