import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, Clock, Phone, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import { Database } from '@/types/database';

type Store = Database['public']['Tables']['stores']['Row'];
type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
};

export default function CheckoutPickupScreen() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch stores
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (storesError) throw storesError;
      setStores(storesData || []);

      // Fetch cart items
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select(`
          id,
          cart_items (
            id,
            quantity,
            products (
              id,
              name,
              price,
              image_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (cartError) throw cartError;

      const items = cartData?.cart_items?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: item.products
      })) || [];

      setCartItems(items);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar información');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = async () => {
    if (!selectedStore) {
      toast.error('Por favor selecciona una tienda');
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setPlacing(true);
    try {
      const { data, error } = await supabase.rpc('api_place_order', {
        p_fulfillment: 'pickup',
        p_store_id: selectedStore.id,
        p_address_id: null,
        p_payment_method: 'cash',
        p_notes: `Recoger en tienda: ${selectedStore.name}`
      });

      if (error) throw error;

      toast.success('Pedido realizado exitosamente');
      router.replace('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Error al realizar pedido');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  const total = calculateTotal();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout - Pickup</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona una tienda</Text>
          <Text style={styles.sectionSubtitle}>
            Elige la tienda donde deseas recoger tu pedido
          </Text>

          {stores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={[
                styles.storeCard,
                selectedStore?.id === store.id && styles.storeCardSelected
              ]}
              onPress={() => setSelectedStore(store)}
            >
              <View style={styles.storeHeader}>
                <View style={styles.storeInfo}>
                  <Text style={[
                    styles.storeName,
                    selectedStore?.id === store.id && styles.storeNameSelected
                  ]}>
                    {store.name}
                  </Text>
                  <View style={styles.storeDetail}>
                    <MapPin size={16} color={selectedStore?.id === store.id ? "#000" : "#888"} />
                    <Text style={[
                      styles.storeAddress,
                      selectedStore?.id === store.id && styles.storeAddressSelected
                    ]}>
                      {store.address}
                    </Text>
                  </View>
                  <View style={styles.storeDetail}>
                    <Clock size={16} color={selectedStore?.id === store.id ? "#000" : "#888"} />
                    <Text style={[
                      styles.storeHours,
                      selectedStore?.id === store.id && styles.storeHoursSelected
                    ]}>
                      {store.hours || 'Lun - Sáb: 9:00 AM - 6:00 PM'}
                    </Text>
                  </View>
                  <View style={styles.storeDetail}>
                    <Phone size={16} color={selectedStore?.id === store.id ? "#000" : "#888"} />
                    <Text style={[
                      styles.storePhone,
                      selectedStore?.id === store.id && styles.storePhoneSelected
                    ]}>
                      {store.phone || '(01) 234-5678'}
                    </Text>
                  </View>
                </View>
                {selectedStore?.id === store.id && (
                  <CheckCircle size={24} color="#000" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          
          {cartItems.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  S/ {(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalAmount}>S/ {total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentText}>💰 Pago en efectivo en tienda</Text>
            <Text style={styles.paymentNote}>
              Realiza el pago al momento de recoger tu pedido
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información importante</Text>
          <Text style={styles.infoText}>
            • Tu pedido estará listo para recoger en 1-2 días hábiles{'\n'}
            • Te notificaremos por SMS cuando esté disponible{'\n'}
            • Presenta tu DNI al momento de recoger{'\n'}
            • El pedido se reservará por 7 días calendario
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={placing ? "Procesando..." : "Confirmar pedido"}
          onPress={handlePlaceOrder}
          loading={placing}
          size="large"
          disabled={!selectedStore}
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
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  storeCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  storeCardSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  storeNameSelected: {
    color: '#000',
  },
  storeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeAddress: {
    color: '#888',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  storeAddressSelected: {
    color: '#000',
  },
  storeHours: {
    color: '#888',
    fontSize: 14,
    marginLeft: 8,
  },
  storeHoursSelected: {
    color: '#000',
  },
  storePhone: {
    color: '#888',
    fontSize: 14,
    marginLeft: 8,
  },
  storePhoneSelected: {
    color: '#000',
  },
  orderItem: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    color: '#888',
    fontSize: 14,
  },
  itemPrice: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: '700',
  },
  paymentMethod: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  paymentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentNote: {
    color: '#888',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});
