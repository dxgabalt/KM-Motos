import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';

const PAYMENT_METHODS = [
  { 
    id: 'cod', 
    name: 'Contra entrega', 
    limit: '$10000.00',
    selected: true 
  },
  { 
    id: 'card', 
    name: 'Tarjeta Crédito/Débito', 
    limit: '$10000.00',
    selected: false 
  },
  { 
    id: 'paypal', 
    name: 'Paypal', 
    limit: '$10000.00',
    selected: false 
  },
];

export default function PaymentMethodScreen() {
  const { getTotal } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const handleConfirmPayment = () => {
    router.push('/checkout/success');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar método de pago</Text>
      </View>

      <ScrollView style={styles.content}>
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
              <Text style={[
                styles.paymentName,
                selectedPayment === method.id && styles.paymentNameSelected,
              ]}>
                {method.name}
              </Text>
              <Text style={[
                styles.paymentLimit,
                selectedPayment === method.id && styles.paymentLimitSelected,
              ]}>
                Límite de pago de de {method.limit}
              </Text>
            </View>
            <View style={[
              styles.radioButton,
              selectedPayment === method.id && styles.radioButtonSelected,
            ]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Confirmar pedido"
          onPress={handleConfirmPayment}
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentMethodSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
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
  paymentNameSelected: {
    color: '#000',
  },
  paymentLimit: {
    color: '#888',
    fontSize: 12,
  },
  paymentLimitSelected: {
    color: '#000',
    opacity: 0.7,
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
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});