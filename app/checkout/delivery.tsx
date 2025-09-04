import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, CheckCircle, Plus, Home, Building } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import { Database } from '@/types/database';

type UserAddress = Database['public']['Tables']['user_addresses']['Row'];
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

export default function CheckoutDeliveryScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
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
      // Fetch user addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (addressesError) throw addressesError;
      setAddresses(addressesData || []);

      // Set default address as selected
      const defaultAddress = addressesData?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (addressesData && addressesData.length > 0) {
        setSelectedAddress(addressesData[0]);
      }

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

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const deliveryFee = 15.00;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Por favor selecciona una dirección');
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setPlacing(true);
    try {
      const { data, error } = await supabase.rpc('api_place_order', {
        p_fulfillment: 'delivery',
        p_store_id: null,
        p_address_id: selectedAddress.id,
        p_payment_method: 'cash_on_delivery',
        p_notes: `Entrega a domicilio: ${selectedAddress.address}, ${selectedAddress.district}`
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

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home': return 'Casa';
      case 'work': return 'Trabajo';
      case 'other': return 'Otro';
      default: return 'Dirección';
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Building;
      case 'other': return MapPin;
      default: return MapPin;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout - Delivery</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dirección de entrega</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/profile/add-address')}
            >
              <Plus size={20} color="#1DB954" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View style={styles.emptyAddresses}>
              <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
              <Button
                title="Agregar dirección"
                onPress={() => router.push('/profile/add-address')}
                size="small"
              />
            </View>
          ) : (
            addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressCard,
                  selectedAddress?.id === address.id && styles.addressCardSelected
                ]}
                onPress={() => setSelectedAddress(address)}
              >
                <View style={styles.addressHeader}>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressTypeRow}>
                      <View style={styles.addressTypeContainer}>
                        {React.createElement(getAddressIcon(address.type), {
                          size: 16,
                          color: selectedAddress?.id === address.id ? "#000" : "#1DB954"
                        })}
                        <Text style={[
                          styles.addressType,
                          selectedAddress?.id === address.id && styles.addressTypeSelected
                        ]}>
                          {getAddressTypeLabel(address.type)}
                        </Text>
                      </View>
                      {address.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Principal</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.addressText,
                      selectedAddress?.id === address.id && styles.addressTextSelected
                    ]}>
                      {address.address}
                    </Text>
                    <Text style={[
                      styles.addressDistrict,
                      selectedAddress?.id === address.id && styles.addressDistrictSelected
                    ]}>
                      {address.district}, {address.city}
                    </Text>
                    {address.reference && (
                      <Text style={[
                        styles.addressReference,
                        selectedAddress?.id === address.id && styles.addressReferenceSelected
                      ]}>
                        Ref: {address.reference}
                      </Text>
                    )}
                  </View>
                  {selectedAddress?.id === address.id && (
                    <CheckCircle size={24} color="#000" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
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

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>S/ {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Costo de envío:</Text>
              <Text style={styles.summaryValue}>S/ {deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>S/ {total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.paymentMethod}>
            <Text style={styles.paymentText}>💰 Pago contra entrega</Text>
            <Text style={styles.paymentNote}>
              Paga en efectivo al recibir tu pedido
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información de entrega</Text>
          <Text style={styles.infoText}>
            • Tiempo de entrega: 2-5 días hábiles{'\n'}
            • Horario de entrega: 9:00 AM - 6:00 PM{'\n'}
            • Te contactaremos antes de la entrega{'\n'}
            • Asegúrate de estar disponible en la dirección indicada
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={placing ? "Procesando..." : "Confirmar pedido"}
          onPress={handlePlaceOrder}
          loading={placing}
          size="large"
          disabled={!selectedAddress || addresses.length === 0}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyAddresses: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  addressCardSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
  },
  addressTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressType: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
  },
  addressTypeSelected: {
    color: '#000',
  },
  defaultBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  addressTextSelected: {
    color: '#000',
  },
  addressDistrict: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  addressDistrictSelected: {
    color: '#000',
  },
  addressReference: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  addressReferenceSelected: {
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
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#888',
    fontSize: 16,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
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
