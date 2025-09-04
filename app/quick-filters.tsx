import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, TrendingUp, DollarSign, Percent, Clock, Filter } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import { Database } from '@/types/database';
import { Image } from 'react-native';

type Product = Database['public']['Tables']['products']['Row'];

type FilterOption = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  orderBy: string;
  ascending: boolean;
  color: string;
};

export default function QuickFiltersScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);

  const filterOptions: FilterOption[] = [
    {
      id: 'trending',
      title: 'Más Vendidos',
      subtitle: 'Productos con mayor demanda',
      icon: TrendingUp,
      orderBy: 'sales_count',
      ascending: false,
      color: '#ff6b6b',
    },
    {
      id: 'price_low',
      title: 'Menor Precio',
      subtitle: 'De menor a mayor precio',
      icon: DollarSign,
      orderBy: 'price',
      ascending: true,
      color: '#1DB954',
    },
    {
      id: 'price_high',
      title: 'Mayor Precio',
      subtitle: 'De mayor a menor precio',
      icon: DollarSign,
      orderBy: 'price',
      ascending: false,
      color: '#ffd93d',
    },
    {
      id: 'discount',
      title: 'Mayor Descuento',
      subtitle: 'Productos con mejores ofertas',
      icon: Percent,
      orderBy: 'discount_percentage',
      ascending: false,
      color: '#ff9500',
    },
    {
      id: 'newest',
      title: 'Más Recientes',
      subtitle: 'Productos recién agregados',
      icon: Clock,
      orderBy: 'created_at',
      ascending: false,
      color: '#007aff',
    },
  ];

  const fetchProducts = async (filter: FilterOption) => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(50);

      // Apply ordering based on filter
      query = query.order(filter.orderBy, { ascending: filter.ascending });

      // Add additional filters for specific cases
      if (filter.id === 'discount') {
        query = query.gt('discount_percentage', 0);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSelect = (filter: FilterOption) => {
    setSelectedFilter(filter);
    fetchProducts(filter);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        
        <View style={styles.priceContainer}>
          {item.discount_percentage > 0 ? (
            <>
              <Text style={styles.originalPrice}>
                S/ {item.price.toFixed(2)}
              </Text>
              <Text style={styles.discountPrice}>
                S/ {(item.price * (1 - item.discount_percentage / 100)).toFixed(2)}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  -{item.discount_percentage}%
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.price}>S/ {item.price.toFixed(2)}</Text>
          )}
        </View>

        <View style={styles.productMeta}>
          {selectedFilter?.id === 'trending' && item.sales_count && (
            <Text style={styles.metaText}>
              🔥 {item.sales_count} vendidos
            </Text>
          )}
          {selectedFilter?.id === 'newest' && (
            <Text style={styles.metaText}>
              ✨ Nuevo
            </Text>
          )}
          {item.stock_quantity !== undefined && (
            <Text style={[
              styles.stockText,
              item.stock_quantity > 0 ? styles.inStock : styles.outOfStock
            ]}>
              {item.stock_quantity > 0 ? `${item.stock_quantity} disponibles` : 'Agotado'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtros Rápidos</Text>
      </View>

      <View style={styles.content}>
        {!selectedFilter ? (
          <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Ordenar productos por:</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona cómo quieres ver los productos
            </Text>

            {filterOptions.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={styles.filterCard}
                  onPress={() => handleFilterSelect(filter)}
                >
                  <View style={[styles.filterIcon, { backgroundColor: `${filter.color}20` }]}>
                    <IconComponent size={32} color={filter.color} />
                  </View>
                  <View style={styles.filterInfo}>
                    <Text style={styles.filterTitle}>{filter.title}</Text>
                    <Text style={styles.filterSubtitle}>{filter.subtitle}</Text>
                  </View>
                  <View style={styles.filterArrow}>
                    <Text style={styles.arrowText}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>💡 Tip</Text>
              <Text style={styles.infoText}>
                Los filtros rápidos te ayudan a encontrar exactamente lo que buscas. 
                Prueba diferentes opciones para descubrir productos que se adapten a tus necesidades.
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <View style={styles.activeFilter}>
                <View style={[styles.activeFilterIcon, { backgroundColor: selectedFilter.color }]}>
                  <selectedFilter.icon size={20} color="#fff" />
                </View>
                <View style={styles.activeFilterInfo}>
                  <Text style={styles.activeFilterTitle}>{selectedFilter.title}</Text>
                  <Text style={styles.activeFilterSubtitle}>{selectedFilter.subtitle}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeFilterButton}
                onPress={() => {
                  setSelectedFilter(null);
                  setProducts([]);
                }}
              >
                <Filter size={20} color="#1DB954" />
                <Text style={styles.changeFilterText}>Cambiar</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando productos...</Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No se encontraron productos</Text>
                <Text style={styles.emptyText}>
                  No hay productos disponibles con este filtro
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultsCount}>
                  {products.length} productos encontrados
                </Text>
                <FlatList
                  data={products}
                  renderItem={renderProduct}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.row}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.productsList}
                />
              </>
            )}
          </View>
        )}
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
  filtersContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  filterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  filterInfo: {
    flex: 1,
  },
  filterTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  filterSubtitle: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  filterArrow: {
    marginLeft: 12,
  },
  arrowText: {
    color: '#888',
    fontSize: 24,
    fontWeight: '300',
  },
  infoCard: {
    backgroundColor: '#0a1a0f',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1DB954',
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
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeFilterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeFilterInfo: {
    flex: 1,
  },
  activeFilterTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activeFilterSubtitle: {
    color: '#888',
    fontSize: 12,
  },
  changeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  changeFilterText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  resultsCount: {
    color: '#888',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#333',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  productBrand: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 8,
  },
  price: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    color: '#888',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  productMeta: {
    gap: 4,
  },
  metaText: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '600',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inStock: {
    color: '#1DB954',
  },
  outOfStock: {
    color: '#ff6b6b',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
