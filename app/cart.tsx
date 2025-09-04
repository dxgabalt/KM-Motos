import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { toast } from 'sonner-native';

type Cart = Database['public']['Tables']['carts']['Row'];
type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  product: Database['public']['Tables']['products']['Row'];
};

export default function CartScreen() {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('carts')
        .select(`
          *,
          items:cart_items(
            *,
            product:products(
              name,
              price,
              image_url,
              sku
            )
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCart(data);
        setCartItems(data.items || []);
      } else {
        // Create new cart if none exists
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setCart(newCart);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error al cargar carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    try {
      setUpdatingItem(itemId);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      toast.success('Cantidad actualizada');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar cantidad');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItem(itemId);
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Producto eliminado del carrito');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error al eliminar producto');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setShowDeliveryModal(true);
  };

  const handleDeliveryOption = async (option: 'delivery' | 'pickup') => {
    if (!cart) return;

    try {
      // Update cart fulfillment preference
      const { error } = await supabase
        .from('carts')
        .update({ fulfillment: option })
        .eq('id', cart.id);

      if (error) throw error;

      setShowDeliveryModal(false);
      
      if (option === 'delivery') {
        router.push('/checkout/delivery');
      } else {
        router.push('/checkout/pickup');
      }
    } catch (error) {
      console.error('Error updating fulfillment:', error);
      toast.error('Error al actualizar preferencia de entrega');
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi carrito</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Cargando carrito...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi carrito</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ShoppingCart size={64} color="#666" />
          <Text style={styles.emptyTitle}>Inicia sesión para ver tu carrito</Text>
          <Text style={styles.emptyText}>Necesitas una cuenta para guardar productos en tu carrito</Text>
          <Button
            title="Iniciar sesión"
            onPress={() => router.push('/auth/login')}
            size="large"
          />
        </View>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi carrito</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <ShoppingCart size={64} color="#666" />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>Agrega productos para comenzar tu compra</Text>
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
        {cartItems.map((item) => {
          const isUpdating = updatingItem === item.id;
          
          return (
            <View key={item.id} style={[styles.cartItem, isUpdating && styles.cartItemUpdating]}>
              <Image
                source={{ 
                  uri: item.product.image_url || 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100' 
                }}
                style={styles.itemImage}
              />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                {item.variant && (
                  <Text style={styles.itemVariant}>Variante: {item.variant}</Text>
                )}
                <Text style={styles.itemSku}>{item.product.sku}</Text>
                <View style={styles.itemRating}>
                  <Text style={styles.ratingText}>4.5 ⭐ (134)</Text>
                  <Text style={styles.itemBrand}>KM MOTOS</Text>
                </View>
                <Text style={styles.itemPrice}>US$ {item.product.price.toFixed(2)}</Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size={16} color="#ff4444" />
                  ) : (
                    <Trash2 size={16} color="#ff4444" />
                  )}
                  <Text style={styles.removeButtonText}>Eliminar</Text>
                </TouchableOpacity>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={isUpdating || item.quantity <= 1}
                  >
                    <Minus size={16} color={isUpdating || item.quantity <= 1 ? "#666" : "#fff"} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
                    onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={isUpdating}
                  >
                    <Plus size={16} color={isUpdating ? "#666" : "#fff"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
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
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  cartItemUpdating: {
    opacity: 0.6,
  },
  itemVariant: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  totalLabel: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
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