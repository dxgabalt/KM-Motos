import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Share, ShoppingCart, Star, Store, Minus, Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { toast } from 'sonner-native';

type Product = Database['public']['Tables']['products']['Row'];
type WholesalerPricing = Database['public']['Tables']['wholesaler_pricing']['Row'];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [wholesalerPricing, setWholesalerPricing] = useState<WholesalerPricing[]>([]);
  const [selectedSize, setSelectedSize] = useState('XS');
  const [quantity, setQuantity] = useState(1);
  const [showWholesalerPricing, setShowWholesalerPricing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch wholesaler pricing if user is wholesaler
      if (profile?.is_wholesaler) {
        const { data: pricingData, error: pricingError } = await supabase
          .from('wholesaler_pricing')
          .select('*')
          .eq('product_id', id);

        if (pricingError) throw pricingError;
        setWholesalerPricing(pricingData || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error al cargar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para añadir productos');
      return;
    }
    if (!product) return;

    addItem(product, quantity, selectedSize);
    toast.success('Producto añadido al carrito');
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading || !product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Share size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/cart')}
          >
            <ShoppingCart size={24} color="#1DB954" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.image_url || 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=400&h=400' }}
            style={styles.productImage}
          />
          <View style={styles.imageIndicators}>
            <View style={[styles.indicator, styles.indicatorActive]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productPrice}>US$ {product.price}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>4.5</Text>
            <Text style={styles.reviewCount}>({product.review_count || 134})</Text>
          </View>

          <View style={styles.brandContainer}>
            <Text style={styles.brandLabel}>Marca:</Text>
            <Text style={styles.brandName}>KM MOTOS</Text>
            <Text style={styles.skuLabel}>SKU:</Text>
            <Text style={styles.skuValue}>{product.sku}</Text>
          </View>

          <View style={styles.storeInfo}>
            <Store size={16} color="#1DB954" />
            <Text style={styles.storeText}>KM Motos Lima</Text>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>4 unidades disponibles</Text>
            </View>
          </View>

          {profile?.is_wholesaler && (
            <TouchableOpacity 
              style={styles.wholesalerButton}
              onPress={() => setShowWholesalerPricing(true)}
            >
              <Text style={styles.wholesalerButtonText}>Ver lista mayorista</Text>
            </TouchableOpacity>
          )}

          <View style={styles.sizeSection}>
            <Text style={styles.sectionTitle}>Tamaño: {selectedSize}</Text>
            <View style={styles.sizeOptions}>
              {SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      selectedSize === size && styles.sizeButtonTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.quantitySection}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Minus size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Añadir al carrito"
          onPress={handleAddToCart}
          size="large"
        />
      </View>

      {/* Wholesaler Pricing Modal */}
      <Modal
        visible={showWholesalerPricing}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWholesalerPricing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lista de precios mayoristas</Text>
              <TouchableOpacity onPress={() => setShowWholesalerPricing(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pricingTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Uni.</Text>
                <Text style={styles.tableHeaderText}>Precio</Text>
                <Text style={styles.tableHeaderText}>Descuento</Text>
              </View>
              
              {wholesalerPricing.map((pricing, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellText}>{pricing.min_quantity}</Text>
                  <Text style={styles.tableCellText}>{pricing.unit_price} USD</Text>
                  <Text style={styles.tableCellText}>{pricing.discount_percentage} USD</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalProductInfo}>
              <Text style={styles.modalProductPrice}>US$ {product.price}</Text>
              <View style={styles.modalRating}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.modalRatingText}>4.5 (134)</Text>
              </View>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#1DB954',
  },
  productInfo: {
    padding: 16,
  },
  productPrice: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 4,
  },
  reviewCount: {
    color: '#888',
    fontSize: 16,
    marginLeft: 4,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLabel: {
    color: '#888',
    fontSize: 14,
  },
  brandName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 16,
  },
  skuLabel: {
    color: '#888',
    fontSize: 14,
  },
  skuValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 12,
  },
  stockBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  wholesalerButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  wholesalerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  sizeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
  },
  sizeButtonActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  sizeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sizeButtonTextActive: {
    color: '#000',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 24,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalClose: {
    color: '#fff',
    fontSize: 20,
  },
  pricingTable: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  tableHeaderText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableCellText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  modalProductInfo: {
    alignItems: 'center',
  },
  modalProductPrice: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
});