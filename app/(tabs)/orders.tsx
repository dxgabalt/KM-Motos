import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X } from 'lucide-react-native';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  product: Database['public']['Tables']['products']['Row'];
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setShowAuthModal(true);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'confirmed':
        return '#1DB954';
      case 'shipped':
        return '#00BFFF';
      case 'completed':
        return '#32CD32';
      case 'cancelled':
        return '#FF6B6B';
      default:
        return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'shipped':
        return 'Enviado';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'confirmed', 'shipped'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => handleOrderPress(order)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>
          Entregado el {format(new Date(order.created_at), 'dd \'de\' MMMM yyyy', { locale: es })}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderContent}>
        <View style={styles.orderItems}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100' }}
            style={styles.orderImage}
          />
          <View style={styles.orderInfo}>
            <Text style={styles.orderTitle}>Pedido #{order.id.slice(-6)}</Text>
            <Text style={styles.orderTotal}>Total: US$ {order.total_amount}</Text>
          </View>
        </View>
        
        <View style={styles.orderActions}>
          <Button
            title="Reportar"
            onPress={() => {}}
            variant="outline"
            size="small"
          />
          <Button
            title="Dejar reseña"
            onPress={() => {}}
            variant="secondary"
            size="small"
          />
          <Button
            title="Rehacer"
            onPress={() => {}}
            size="small"
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (showAuthModal) {
    return (
      <View style={styles.container}>
        <Header showCart={false} />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>
            Para continuar necesitas iniciar sesión
          </Text>
          <Text style={styles.authSubtitle}>
            Inicia sesión o regístrate para añadir productos al carrito, recibir promociones exclusivas y disfrutar de una mejor experiencia.
          </Text>
          
          <View style={styles.authButtons}>
            <Button
              title="Iniciar sesión"
              onPress={() => router.push('/auth/login')}
              size="large"
            />
            <Button
              title="Registrarse"
              onPress={() => router.push('/auth/register')}
              variant="outline"
              size="large"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        onCartPress={() => router.push('/cart')}
        onSearchPress={() => router.push('/search')}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>Mis pedidos</Text>
        
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
              Pendiente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
              Entregado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <ScrollView style={styles.ordersList}>
          {filteredOrders.map(renderOrderCard)}
        </ScrollView>
      </View>

      {/* Order Detail Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedOrder(null)}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>
                  Pedido #{selectedOrder.id.slice(-6)}
                </Text>
                
                <View style={styles.modalOrderInfo}>
                  <Text style={styles.modalOrderDate}>
                    {format(new Date(selectedOrder.created_at), 'dd \'de\' MMMM yyyy', { locale: es })}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedOrder.status)}</Text>
                  </View>
                </View>

                <ScrollView style={styles.orderItemsList}>
                  {orderItems.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                      <Image
                        source={{ uri: item.product.image_url || 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100' }}
                        style={styles.itemImage}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemPrice}>US$ {item.unit_price}</Text>
                        <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.modalTotal}>
                  <Text style={styles.totalText}>
                    Total: US$ {selectedOrder.total_amount}
                  </Text>
                </View>
              </>
            )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#1DB954',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderDate: {
    color: '#888',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderContent: {
    gap: 16,
  },
  orderItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderTotal: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  authSubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  authButtons: {
    width: '100%',
    gap: 12,
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
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalOrderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalOrderDate: {
    color: '#888',
    fontSize: 14,
  },
  orderItemsList: {
    flex: 1,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '600',
  },
  itemQuantity: {
    color: '#888',
    fontSize: 12,
  },
  modalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
  },
  totalText: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});