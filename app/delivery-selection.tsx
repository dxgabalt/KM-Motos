import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Truck, Store, Clock, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';

export default function DeliverySelectionScreen() {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'delivery' | 'pickup' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedOption) {
      toast.error('Por favor selecciona una opción de entrega');
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      // Update cart fulfillment preference
      const { error } = await supabase
        .from('carts')
        .update({ fulfillment: selectedOption })
        .eq('user_id', user.id);

      if (error) throw error;

      // Navigate to appropriate checkout screen
      if (selectedOption === 'delivery') {
        router.push('/checkout/delivery');
      } else {
        router.push('/checkout/pickup');
      }
    } catch (error) {
      console.error('Error updating fulfillment:', error);
      toast.error('Error al actualizar preferencia de entrega');
    } finally {
      setLoading(false);
    }
  };

  const deliveryOptions = [
    {
      id: 'delivery' as const,
      title: 'Delivery',
      subtitle: 'Entrega a domicilio',
      description: 'Recibe tu pedido en la comodidad de tu hogar',
      icon: Truck,
      details: [
        { icon: Clock, text: '2-5 días hábiles' },
        { icon: MapPin, text: 'Lima Metropolitana' },
      ],
      badge: 'Contra entrega disponible',
    },
    {
      id: 'pickup' as const,
      title: 'Recoger en tienda',
      subtitle: 'Pickup en tienda',
      description: 'Retira tu pedido en nuestra tienda física',
      icon: Store,
      details: [
        { icon: Clock, text: '1-2 días hábiles' },
        { icon: MapPin, text: 'Jr. Miguel Grau 129' },
      ],
      badge: 'Pago adelantado',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>¿Cómo deseas adquirir tu producto?</Text>
      </View>

      <View style={styles.content}>
        {deliveryOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = selectedOption === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
              onPress={() => setSelectedOption(option.id)}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                  <IconComponent size={32} color={isSelected ? "#000" : "#1DB954"} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionSubtitle, isSelected && styles.optionSubtitleSelected]}>
                    {option.subtitle}
                  </Text>
                </View>
                <View style={styles.optionBadge}>
                  <Text style={styles.badgeText}>{option.badge}</Text>
                </View>
              </View>

              <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                {option.description}
              </Text>

              <View style={styles.optionDetails}>
                {option.details.map((detail, index) => {
                  const DetailIcon = detail.icon;
                  return (
                    <View key={index} style={styles.detailItem}>
                      <DetailIcon size={16} color={isSelected ? "#000" : "#888"} />
                      <Text style={[styles.detailText, isSelected && styles.detailTextSelected]}>
                        {detail.text}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <View style={styles.selectedDot} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información importante</Text>
          <Text style={styles.infoText}>
            • Delivery: Método contra entrega exclusivo para Lima Metropolitana{'\n'}
            • Pickup: Reserva tu producto pagándolo por adelantado{'\n'}
            • Los tiempos de entrega pueden variar según disponibilidad
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continuar"
          onPress={handleContinue}
          loading={loading}
          size="large"
          disabled={!selectedOption}
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
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  optionCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
  },
  optionCardSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIcon: {
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
  optionIconSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#000',
  },
  optionSubtitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  optionSubtitleSelected: {
    color: '#000',
  },
  optionBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '600',
  },
  optionDescription: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionDescriptionSelected: {
    color: '#000',
  },
  optionDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 8,
  },
  detailTextSelected: {
    color: '#000',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1DB954',
  },
  infoCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
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
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});
