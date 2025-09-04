import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Search, Filter, X, ShoppingCart } from 'lucide-react-native';
import { ProductCard } from '@/components/ui/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { toast } from 'sonner-native';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

const PRICE_RANGES = [
  { label: 'Los más comprados', value: 'popular' },
  { label: 'Precios más bajos', value: 'low' },
  { label: 'Todos los precios', value: 'all' },
];

const BRANDS_FILTER = ['TODOS', 'HS2', 'KMS', 'LUBRO'];

export default function SearchScreen() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('TODOS');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchProducts();
    } else {
      fetchData();
    }
  }, [searchQuery, selectedBrand, selectedPriceRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products
      let query = supabase.from('products').select('*');
      
      if (selectedBrand !== 'TODOS') {
        const brand = brands.find(b => b.name === selectedBrand);
        if (brand) {
          query = query.eq('brand_id', brand.id);
        }
      }

      if (selectedPriceRange === 'low') {
        query = query.order('price', { ascending: true });
      } else if (selectedPriceRange === 'popular') {
        query = query.order('review_count', { ascending: false });
      }

      const { data: productsData, error: productsError } = await query.limit(20);
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*');
      if (brandsError) throw brandsError;
      setBrands(brandsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    setLoading(true);
    try {
      // Usar búsqueda avanzada RPC
      const { data, error } = await supabase.rpc('api_search_products', {
        q: searchQuery,
        category: null,
        brand: selectedBrand !== 'TODOS' ? selectedBrand : null,
        sort: selectedPriceRange === 'low' ? 'price_asc' : 
              selectedPriceRange === 'popular' ? 'rating_desc' : 'name_asc',
        limit_: 24,
        offset_: 0
      });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
      // Fallback a búsqueda básica
      const { data: basicData } = await supabase
        .from('products')
        .select(`
          id, sku, name, price, rating, reviews_count, image_url,
          brand:brands(name),
          category:categories(name)
        `)
        .or(`name.ilike.*${searchQuery}*,description.ilike.*${searchQuery}*`)
        .limit(24);
      
      setProducts(basicData || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error('Debes iniciar sesión para añadir productos');
      return;
    }
    addItem(product, 1);
    toast.success('Producto añadido al carrito');
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cascos"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => router.push('/cart')}>
          <ShoppingCart size={24} color="#1DB954" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} color="#fff" />
          <Text style={styles.filterButtonText}>Filtros</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {BRANDS_FILTER.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[
                styles.brandFilter,
                selectedBrand === brand && styles.brandFilterActive,
              ]}
              onPress={() => setSelectedBrand(brand)}
            >
              <Text
                style={[
                  styles.brandFilterText,
                  selectedBrand === brand && styles.brandFilterTextActive,
                ]}
              >
                {brand}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showFilters && (
        <View style={styles.expandedFilters}>
          <Text style={styles.filterTitle}>Ordenar por:</Text>
          {PRICE_RANGES.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={styles.filterOption}
              onPress={() => setSelectedPriceRange(range.value)}
            >
              <View style={[
                styles.radioButton,
                selectedPriceRange === range.value && styles.radioButtonActive,
              ]} />
              <Text style={styles.filterOptionText}>{range.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Cascos</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
            onAddToCart={() => handleAddToCart(item)}
          />
        )}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  brandFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  brandFilterActive: {
    backgroundColor: '#1DB954',
  },
  brandFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  brandFilterTextActive: {
    color: '#000',
  },
  expandedFilters: {
    backgroundColor: '#222',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
  },
  radioButtonActive: {
    borderColor: '#1DB954',
    backgroundColor: '#1DB954',
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});