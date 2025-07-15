import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutSuccessScreen() {
  const { clearCart } = useCart();

  const handleContinueShopping = () => {
    clearCart();
    router.replace('/(tabs)');
  };

  const handleViewOrders = () => {
    clearCart();
    router.replace('/(tabs)/orders');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color="#1DB954" />
        </View>
        
        <Text style={styles.title}>¡Pedido realizado con éxito!</Text>
        
        <Text style={styles.description}>
          Tu pedido ha sido procesado correctamente. Recibirás una confirmación por correo electrónico y podrás seguir el estado de tu pedido en la sección "Mis pedidos".
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Ver mis pedidos"
          onPress={handleViewOrders}
          size="large"
        />
        
        <Button
          title="Continuar comprando"
          onPress={handleContinueShopping}
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 32,
    gap: 16,
  },
});