import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, CreditCard, Smartphone, Banknote, CheckCircle, Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import { Database } from '@/types/database';

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export default function PaymentMethodsScreen() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPaymentMethods(data || []);

      // Set default selected method
      const defaultMethod = data?.find(method => method.is_default);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod);
      } else if (data && data.length > 0) {
        setSelectedMethod(data[0]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSelection = async () => {
    if (!selectedMethod) {
      toast.error('Por favor selecciona un método de pago');
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setSaving(true);
    try {
      // Save user's preferred payment method
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_payment_method: selectedMethod.id })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Método de pago guardado exitosamente');
      router.back();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Error al guardar método de pago');
    } finally {
      setSaving(false);
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card':
        return CreditCard;
      case 'digital_wallet':
        return Smartphone;
      case 'cash':
        return Banknote;
      default:
        return CreditCard;
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'card':
        return 'Tarjeta';
      case 'digital_wallet':
        return 'Billetera Digital';
      case 'cash':
        return 'Efectivo';
      default:
        return 'Pago';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando métodos de pago...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.paymentMethod}>
          <View style={styles.paymentMethodHeader}>
            <Banknote size={20} color="#1DB954" />
            <Text style={styles.paymentText}>Pago en efectivo en tienda</Text>
          </View>
          <Text style={styles.paymentNote}>
            Realiza el pago al momento de recoger tu pedido
          </Text>
              const IconComponent = getPaymentIcon(method.type);
              const isSelected = selectedMethod?.id === method.id;

              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentCard,
                    isSelected && styles.paymentCardSelected
                  ]}
                  onPress={() => setSelectedMethod(method)}
                >
                  <View style={styles.paymentHeader}>
                    <View style={[styles.paymentIcon, isSelected && styles.paymentIconSelected]}>
                      <IconComponent size={32} color={isSelected ? "#000" : "#1DB954"} />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={[
                        styles.paymentName,
                        isSelected && styles.paymentNameSelected
                      ]}>
                        {method.name}
                      </Text>
                      <Text style={[
                        styles.paymentType,
                        isSelected && styles.paymentTypeSelected
                      ]}>
                        {getPaymentTypeLabel(method.type)}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckCircle size={24} color="#000" />
                    )}
                  </View>

                  <Text style={[
                    styles.paymentDescription,
                    isSelected && styles.paymentDescriptionSelected
                  ]}>
                    {method.description}
                  </Text>

                  {method.fees && method.fees > 0 && (
                    <View style={styles.feeContainer}>
                      <Text style={[
                        styles.feeText,
                        isSelected && styles.feeTextSelected
                      ]}>
                        Comisión: S/ {method.fees.toFixed(2)}
                      </Text>
                    </View>
                  )}

                  {method.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Recomendado</Text>
                    </View>
                  )}

                  {method.type === 'card' && (
                    <View style={styles.cardLogos}>
                      <Text style={[
                        styles.cardLogosText,
                        isSelected && styles.cardLogosTextSelected
                      ]}>
                        💳 Visa, Mastercard, American Express
                      </Text>
                    </View>
                  )}

                  {method.type === 'digital_wallet' && (
                    <View style={styles.walletInfo}>
                      <Text style={[
                        styles.walletInfoText,
                        isSelected && styles.walletInfoTextSelected
                      ]}>
                        📱 Yape, Plin, BIM
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información sobre pagos</Text>
          <Text style={styles.infoText}>
            • Todos los pagos son procesados de forma segura{'\n'}
            • Las tarjetas de crédito/débito tienen protección adicional{'\n'}
            • Los pagos digitales son instantáneos{'\n'}
            • El pago contra entrega solo está disponible para delivery{'\n'}
            • Puedes cambiar tu método de pago en cualquier momento
          </Text>
        </View>

        <View style={styles.securityCard}>
          <Text style={styles.securityTitle}>🔒 Seguridad garantizada</Text>
          <Text style={styles.securityText}>
            Todos nuestros pagos están protegidos con encriptación SSL de 256 bits y cumplen con los estándares PCI DSS.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={saving ? "Guardando..." : "Guardar selección"}
          onPress={handleSaveSelection}
          loading={saving}
          size="large"
          disabled={!selectedMethod}
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
  },
  paymentCardSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0a1a0f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#1DB954',
  },
  paymentIconSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentNameSelected: {
    color: '#000',
  },
  paymentType: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentTypeSelected: {
    color: '#000',
  },
  paymentDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  paymentDescriptionSelected: {
    color: '#000',
  },
  feeContainer: {
    marginBottom: 8,
  },
  feeText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  feeTextSelected: {
    color: '#000',
  },
  defaultBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  cardLogos: {
    marginTop: 8,
  },
  cardLogosText: {
    color: '#888',
    fontSize: 14,
  },
  cardLogosTextSelected: {
    color: '#000',
  },
  walletInfo: {
    marginTop: 8,
  },
  walletInfoText: {
    color: '#888',
    fontSize: 14,
  },
  walletInfoTextSelected: {
    color: '#000',
  },
  infoCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#333',
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
  securityCard: {
    backgroundColor: '#0a1a0f',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  securityTitle: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  securityText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});
