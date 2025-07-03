import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { ProductCard } from '@/components/ui/ProductCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { X } from 'lucide-react-native';
import { toast } from 'sonner-native';

type Category = Database['public']['Tables']['categories']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export default function HomeScreen() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*');

      if (brandsError) throw brandsError;
      setBrands(brandsData || []);

      // Fetch featured products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(10);

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    addItem(product, 1);
    toast.success('Producto añadido al carrito');
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleCategoryPress = (category: Category) => {
    router.push(`/products?category=${category.id}`);
  };

  const renderPromotion = () => (
    <View style={styles.promotionCard}>
      <View style={styles.promotionContent}>
        <Text style={styles.promotionTitle}>ABASTECE TU TALLER</Text>
        <Text style={styles.promotionSubtitle}>CON NUESTRAS MARCAS</Text>
        <Text style={styles.promotionHighlight}>EXCLUSIVAS</Text>
        <Text style={styles.promotionPhone}>9400-1163</Text>
      </View>
      <Image
        source={{ uri: 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=200&h=200' }}
        style={styles.promotionImage}
      />
    </View>
  );

  const renderBrands = () => (
    <View style={styles.brandsSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {brands.map((brand) => (
          <TouchableOpacity key={brand.id} style={styles.brandCard}>
            <Image
              source={{ uri: brand.logo_url || 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100' }}
              style={styles.brandLogo}
            />
            <Text style={styles.brandName}>{brand.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        onCartPress={() => router.push('/cart')}
        onSearchPress={() => router.push('/search')}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />
      
      <ScrollView style={styles.content}>
        {/* Promotion Card */}
        {renderPromotion()}

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Brands */}
        {renderBrands()}

        {/* Featured Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todos los productos</Text>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => handleProductPress(product)}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Auth Modal */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAuthModal(false)}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              Para continuar necesitas iniciar sesión
            </Text>
            <Text style={styles.modalSubtitle}>
              Inicia sesión o regístrate para añadir productos al carrito, recibir promociones exclusivas y disfrutar de una mejor experiencia.
            </Text>
            
            <View style={styles.modalButtons}>
              <Button
                title="Iniciar sesión"
                onPress={() => {
                  setShowAuthModal(false);
                  router.push('/auth/login');
                }}
                size="large"
              />
              <Button
                title="Registrarse"
                onPress={() => {
                  setShowAuthModal(false);
                  router.push('/auth/register');
                }}
                variant="outline"
                size="large"
              />
            </View>
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
  promotionCard: {
    backgroundColor: '#1DB954',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  promotionContent: {
    flex: 1,
  },
  promotionTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  promotionSubtitle: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  promotionHighlight: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  promotionPhone: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  promotionImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  brandsSection: {
    marginBottom: 24,
  },
  brandCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  brandName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
    textAlign: 'center',
    marginBottom: 16,
  },
  modalSubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  modalButtons: {
    gap: 12,
  },
});