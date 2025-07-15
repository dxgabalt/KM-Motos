import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Home, Clock, CreditCard, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Address = Database['public']['Tables']['addresses']['Row'];
type DeliveryOption = Database['public']['Tables']['delivery_options']['Row'];

export default function DeliveryCheckoutScreen() {
  const { user } = useAuth();
  const { items, getTotal } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchDeliveryOptions();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
      if (data && data.length > 0) {
        setSelectedAddress(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const fetchDeliveryOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setDeliveryOptions(data || []);
      if (data && data.length > 0) {
        setSelectedDelivery(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching delivery options:', error);
    }
  };

  const selectedDeliveryOption = deliveryOptions.find(d => d.id === selectedDelivery);
  const deliveryFee = selectedDeliveryOption?.price || 0;
  const total = getTotal() + deliveryFee;

  const handleConfirmOrder = () => {
    router.push('/checkout/payment');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.addressSection}
          onPress={() => router.push('/profile/location')}
        >
          <Home size={20} color="#fff" />
          <View style={styles.addressInfo}>
            <Text style={styles.addressTitle}>Jr. Miguel Grau 129</Text>
            <Text style={styles.addressSubtitle}>Casa</Text>
          </View>
          <ChevronRight size={20} color="#888" />
        </TouchableOpacity>

        <View style={styles.deliverySection}>
          <Clock size={20} color="#fff" />
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>5 días hábiles</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.paymentSection}
          onPress={() => router.push('/checkout/payment')}
        >
          <CreditCard size={20} color="#fff" />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Contra entrega</Text>
          </View>
          <ChevronRight size={20} color="#888" />
        </TouchableOpacity>

        <View style={styles.storeSection}>
          <Text style={styles.storeTitle}>KM Motos Lima</Text>
          <Text style={styles.storeSubtitle}>19 artículo(s)</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tarifa en artículos</Text>
            <Text style={styles.totalValue}>${getTotal().toFixed(2)} USD</Text>
          </View>
          <Text style={styles.totalSubtext}>Total en artículos</Text>
        </View>

        <Button
          title="Confirmar pedido"
          onPress={handleConfirmOrder}
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  deliveryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  storeSection: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  storeTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  totalSection: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 16,
  },
  totalValue: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalSubtext: {
    color: '#888',
    fontSize: 12,
  },
});