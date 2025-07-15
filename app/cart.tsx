import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const handleQuantityChange = (productId: number, currentQuantity: number, delta: number, size?: string) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity, size);
    }
  };

  const handleRemoveItem = (productId: number, size?: string) => {
    removeItem(productId, size);
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setShowDeliveryModal(true);
  };

  const handleDeliveryOption = (option: 'delivery' | 'pickup') => {
    setShowDeliveryModal(false);
    if (option === 'delivery') {
      router.push('/checkout/delivery');
    } else {
      router.push('/checkout/pickup');
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi carrito</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Button
            title="Continuar comprando"
            onPress={() => router.push('/(tabs)')}
            size="large"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi carrito</Text>
      </View>

      <Text style={styles.summaryTitle}>Resumen del carrito</Text>

      <ScrollView style={styles.content}>
        {items.map((item, index) => (
          <View key={`${item.product.id}-${item.size || 'default'}`} style={styles.cartItem}>
            <Image
              source={{ uri: item.product.image_url || 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100' }}
              style={styles.itemImage}
            />
            
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.product.name}
              </Text>
              {item.size && (
                <Text style={styles.itemSize}>Opciones: {item.size}</Text>
              )}
              <Text style={styles.itemSku}>{item.product.sku}</Text>
              <View style={styles.itemRating}>
                <Text style={styles.ratingText}>4.5 ⭐ (134)</Text>
                <Text style={styles.itemBrand}>KM MOTOS</Text>
              </View>
              <Text style={styles.itemPrice}>US$ {item.product.price}</Text>
            </View>

            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.product.id, item.size)}
              >
                <Trash2 size={16} color="#ff4444" />
                <Text style={styles.removeButtonText}>Eliminar</Text>
              </TouchableOpacity>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.product.id, item.quantity, -1, item.size)}
                >
                  <Minus size={16} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.product.id, item.quantity, 1, item.size)}
                >
                  <Plus size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>{getTotal().toFixed(2)} USD</Text>
        </View>
        <Button
          title="Realizar pedido"
          onPress={handleCheckout}
          size="large"
        />
      </View>

      {/* Delivery Options Modal */}
      <Modal
        visible={showDeliveryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeliveryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Cómo deseas adquirir tu producto?</Text>
            
            <Button
              title="Delivery"
              onPress={() => handleDeliveryOption('delivery')}
              size="large"
            />
            
            <Button
              title="Recoger en tienda"
              onPress={() => handleDeliveryOption('pickup')}
              variant="outline"
              size="large"
            />

            <Text style={styles.modalDescription}>
              Tenemos un método contra entrega exclusivo para delivery y tenemos la opción de reservar un producto de nuestro inventario pagándolo por adelantado.
            </Text>
          </View>
        </View>
      </Modal>
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
  summaryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSize: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  itemSku: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 8,
  },
  itemBrand: {
    color: '#888',
    fontSize: 12,
  },
  itemPrice: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  removeButtonText: {
    color: '#ff4444',
    fontSize: 12,
    marginLeft: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    gap: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});