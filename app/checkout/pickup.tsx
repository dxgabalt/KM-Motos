import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Store, Clock, CreditCard } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Store = Database['public']['Tables']['stores']['Row'];

const PAYMENT_METHODS = [
  { id: 'visa', name: 'VISA', limit: '$10000.00' },
  { id: 'mastercard', name: 'Mastercard', limit: '$10000.00' },
  { id: 'paypal', name: 'Paypal', limit: '$10000.00' },
];

export default function PickupCheckoutScreen() {
  const { items, getTotal } = useCart();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('visa');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setStores(data || []);
      if (data && data.length > 0) {
        setSelectedStore(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handlePayment = () => {
    // TODO: Process payment
    router.push('/checkout/success');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contra entrega</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Tienda seleccionada</Text>
        
        <View style={styles.storeSelector}>
          {stores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={[
                styles.storeOption,
                selectedStore === store.id && styles.storeOptionSelected,
              ]}
              onPress={() => setSelectedStore(store.id)}
            >
              <Store size={20} color="#1DB954" />
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={styles.storeDetails}>
                <Text style={styles.storeAddress}>{store.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Método de pago</Text>
        
        <View style={styles.paymentMethods}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPayment === method.id && styles.paymentMethodSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentLimit}>Límite de pago de de {method.limit}</Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedPayment === method.id && styles.radioButtonSelected,
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.paymentForm}>
          <Input
            label="Titular de la tarjeta"
            value={cardHolder}
            onChangeText={setCardHolder}
            placeholder="Santiago de chile"
          />

          <Input
            label="Número de tarjeta"
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="Taller paolo"
            keyboardType="numeric"
          />

          <View style={styles.formRow}>
            <View style={styles.formHalf}>
              <Input
                label="MM/YY"
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="49302389"
              />
            </View>
            <View style={styles.formHalf}>
              <Input
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                placeholder="Jr. Miguel Grau 129"
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
          </View>
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
          title="Pagar ahora"
          onPress={handlePayment}
          size="large"
        />

        <Button
          title="Salir y cancelar pedido"
          onPress={() => router.push('/(tabs)')}
          variant="outline"
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
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  storeSelector: {
    marginBottom: 32,
  },
  storeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  storeOptionSelected: {
    borderColor: '#1DB954',
  },
  storeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  storeDetails: {
    alignItems: 'flex-end',
  },
  storeAddress: {
    color: '#888',
    fontSize: 12,
  },
  paymentMethods: {
    marginBottom: 32,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentMethodSelected: {
    backgroundColor: '#1DB954',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentLimit: {
    color: '#888',
    fontSize: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
  },
  radioButtonSelected: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  paymentForm: {
    marginBottom: 32,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formHalf: {
    flex: 1,
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