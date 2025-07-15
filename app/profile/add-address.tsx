import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';

const ADDRESS_LABELS = ['Casa', 'Taller', 'Oficina', 'Novie', 'Otro'];

export default function AddAddressScreen() {
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [details, setDetails] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('Casa');
  const [loading, setLoading] = useState(false);

  const handleSaveAddress = async () => {
    if (!user) return;
    
    if (!address.trim() || !city.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          address_line_1: address.trim(),
          address_line_2: details.trim() || null,
          city: city.trim(),
          label: selectedLabel,
          country: 'Honduras',
        });

      if (error) throw error;
      
      toast.success('Dirección guardada correctamente');
      router.back();
    } catch (error) {
      toast.error('Error al guardar dirección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirma tu dirección</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={40} color="#1DB954" />
          <Text style={styles.mapText}>Mapa interactivo aquí</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Dirección</Text>
          <Input
            value={address}
            onChangeText={setAddress}
            placeholder="Jr. Miguel Grau 129"
          />

          <Text style={styles.sectionTitle}>Ciudad</Text>
          <Input
            value={city}
            onChangeText={setCity}
            placeholder="Santiago de chile"
          />

          <Text style={styles.sectionTitle}>Detalle de la dirección</Text>
          <Input
            value={details}
            onChangeText={setDetails}
            placeholder="ej. Casa Miguel Grau 129"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.sectionTitle}>Etiqueta</Text>
          <View style={styles.labelContainer}>
            {ADDRESS_LABELS.map((label) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.labelButton,
                  selectedLabel === label && styles.labelButtonActive,
                ]}
                onPress={() => setSelectedLabel(label)}
              >
                <Text
                  style={[
                    styles.labelText,
                    selectedLabel === label && styles.labelTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Guardar dirección"
          onPress={handleSaveAddress}
          loading={loading}
          size="large"
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
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mapText: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  labelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#444',
  },
  labelButtonActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  labelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  labelTextActive: {
    color: '#000',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});