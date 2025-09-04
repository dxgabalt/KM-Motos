import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { X, Package, TrendingDown, Users, ShoppingCart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/Button';

type WholesalerPricing = Database['public']['Tables']['wholesaler_pricing']['Row'];

interface WholesalerPricingModalProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  regularPrice: number;
}

export function WholesalerPricingModal({ 
  visible, 
  onClose, 
  productId, 
  productName, 
  regularPrice 
}: WholesalerPricingModalProps) {
  const [pricingTiers, setPricingTiers] = useState<WholesalerPricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && productId) {
      fetchWholesalerPricing();
    }
  }, [visible, productId]);

  const fetchWholesalerPricing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wholesaler_pricing')
        .select('*')
        .eq('product_id', productId)
        .order('min_quantity', { ascending: true });

      if (error) throw error;
      setPricingTiers(data || []);
    } catch (error) {
      console.error('Error fetching wholesaler pricing:', error);
      setPricingTiers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const calculateDiscount = (wholesalePrice: number) => {
    const discount = ((regularPrice - wholesalePrice) / regularPrice) * 100;
    return Math.round(discount);
  };

  const handleRequestWholesaler = () => {
    onClose();
    // Navigate to wholesaler request flow
    // router.push('/wholesaler/step1');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Precios Mayoristas</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.productInfo}>
              <Package size={24} color="#1DB954" />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{productName}</Text>
                <Text style={styles.regularPriceLabel}>
                  Precio regular: <Text style={styles.regularPrice}>{formatPrice(regularPrice)}</Text>
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={styles.loadingText}>Cargando precios mayoristas...</Text>
              </View>
            ) : pricingTiers.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Descuentos por volumen</Text>
                <View style={styles.pricingList}>
                  {pricingTiers.map((tier, index) => {
                    const discount = calculateDiscount(tier.price);
                    
                    return (
                      <View key={tier.id} style={styles.pricingTier}>
                        <View style={styles.tierHeader}>
                          <View style={styles.quantityBadge}>
                            <Users size={16} color="#1DB954" />
                            <Text style={styles.quantityText}>
                              {tier.min_quantity}+ unidades
                            </Text>
                          </View>
                          <View style={styles.discountBadge}>
                            <TrendingDown size={14} color="#fff" />
                            <Text style={styles.discountText}>-{discount}%</Text>
                          </View>
                        </View>
                        
                        <View style={styles.tierPricing}>
                          <Text style={styles.wholesalePrice}>
                            {formatPrice(tier.price)}
                          </Text>
                          <Text style={styles.priceUnit}>por unidad</Text>
                        </View>
                        
                        <View style={styles.savings}>
                          <Text style={styles.savingsText}>
                            Ahorras {formatPrice(regularPrice - tier.price)} por unidad
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.benefitsCard}>
                  <Text style={styles.benefitsTitle}>Beneficios mayoristas</Text>
                  <View style={styles.benefitsList}>
                    <View style={styles.benefitItem}>
                      <TrendingDown size={16} color="#1DB954" />
                      <Text style={styles.benefitText}>Precios preferenciales por volumen</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Package size={16} color="#1DB954" />
                      <Text style={styles.benefitText}>Acceso a productos exclusivos</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Users size={16} color="#1DB954" />
                      <Text style={styles.benefitText}>Soporte especializado</Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noPricingContainer}>
                <ShoppingCart size={48} color="#666" />
                <Text style={styles.noPricingTitle}>Sin precios mayoristas</Text>
                <Text style={styles.noPricingText}>
                  Este producto no tiene precios mayoristas disponibles en este momento.
                </Text>
              </View>
            )}

            <View style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>¿Quieres acceder a precios mayoristas?</Text>
              <Text style={styles.ctaText}>
                Solicita tu perfil de mayorista y obtén acceso a descuentos especiales 
                en compras por volumen.
              </Text>
              <Button
                title="Solicitar perfil mayorista"
                onPress={handleRequestWholesaler}
                size="large"
                style={styles.ctaButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  regularPriceLabel: {
    color: '#888',
    fontSize: 14,
  },
  regularPrice: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pricingList: {
    marginBottom: 24,
  },
  pricingTier: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a1a0f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  quantityText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  tierPricing: {
    alignItems: 'center',
    marginBottom: 8,
  },
  wholesalePrice: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: '700',
  },
  priceUnit: {
    color: '#888',
    fontSize: 14,
  },
  savings: {
    alignItems: 'center',
  },
  savingsText: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  benefitsCard: {
    backgroundColor: '#0a1a0f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  benefitsTitle: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 8,
  },
  noPricingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noPricingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noPricingText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    width: '100%',
  },
});
