import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, Package, MapPin } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';

interface StockItem {
  store_name: string;
  city: string;
  quantity: number;
  store_id: string;
}

export default function InventoryByCityScreen() {
  const [productId, setProductId] = useState('');
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStock = async () => {
    if (!productId.trim()) {
      toast.error('Ingresa un ID de producto');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('api_get_stock_by_product', { 
        _product_id: parseInt(productId) 
      });
      
      if (error) {
        console.error('Error fetching stock:', error);
        toast.error('Error al consultar inventario');
        return;
      }
      
      setStock(data || []);
      if (!data || data.length === 0) {
        toast.info('No se encontró inventario para este producto');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al consultar inventario');
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stock.filter(item =>
    item.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStockItem = ({ item }: { item: StockItem }) => (
    <View style={styles.stockItem}>
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <MapPin size={16} color="#1DB954" />
          <Text style={styles.storeName}>{item.store_name}</Text>
        </View>
        <Text style={styles.cityName}>{item.city}</Text>
      </View>
      <View style={styles.stockInfo}>
        <Package size={16} color="#fff" />
        <Text style={styles.stockQuantity}>{item.quantity}</Text>
        <Text style={styles.stockLabel}>unidades</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventario por Ciudad</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Consultar Inventario</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={productId}
              onChangeText={setProductId}
              placeholder="ID del producto"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
          </View>
          <Button
            title={loading ? "Consultando..." : "Consultar Inventario"}
            onPress={fetchStock}
            disabled={loading || !productId.trim()}
            size="large"
          />
        </View>

        {stock.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Resultados</Text>
            <View style={styles.searchContainer}>
              <Search size={20} color="#888" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por tienda o ciudad"
                placeholderTextColor="#888"
              />
            </View>
            
            <FlatList
              data={filteredStock}
              renderItem={renderStockItem}
              keyExtractor={(item, index) => `${item.store_id}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stockList}
            />
          </View>
        )}
      </ScrollView>
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
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  resultsSection: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  stockList: {
    paddingBottom: 20,
  },
  stockItem: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  storeInfo: {
    flex: 1,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cityName: {
    color: '#888',
    fontSize: 14,
    marginLeft: 24,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stockQuantity: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  stockLabel: {
    color: '#000',
    fontSize: 12,
    marginLeft: 4,
  },
});
