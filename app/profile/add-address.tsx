import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Home, Building2, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';

interface AddressForm {
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: 'home' | 'work' | 'other';
  is_default: boolean;
}

export default function AddAddressScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [form, setForm] = useState<AddressForm>({
    address_line: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Perú',
    address_type: 'home',
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchAddress();
    }
  }, [id, isEditing]);

  const fetchAddress = async () => {
    if (!user || !id) return;

    try {
      setLoadingAddress(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setForm({
          address_line: data.address_line,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
          address_type: data.address_type,
          is_default: data.is_default,
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error('Error al cargar dirección');
      router.back();
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!form.address_line.trim() || !form.city.trim() || !form.state.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('api_upsert_address', {
        p_user_id: user.id,
        p_address_id: isEditing ? id : null,
        p_address_line: form.address_line.trim(),
        p_city: form.city.trim(),
        p_state: form.state.trim(),
        p_postal_code: form.postal_code.trim() || null,
        p_country: form.country.trim(),
        p_address_type: form.address_type,
        p_is_default: form.is_default
      });

      if (error) throw error;

      toast.success(isEditing ? 'Dirección actualizada' : 'Dirección agregada');
      router.back();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error al guardar dirección');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof AddressForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addressTypes = [
    { key: 'home', label: 'Casa', icon: Home },
    { key: 'work', label: 'Trabajo', icon: Building2 },
    { key: 'other', label: 'Otro', icon: MapPin },
  ];

  if (loadingAddress) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar dirección' : 'Nueva dirección'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Tipo de dirección</Text>
          <View style={styles.typeSelector}>
            {addressTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = form.address_type === type.key;
              
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                  onPress={() => updateForm('address_type', type.key)}
                >
                  <IconComponent 
                    size={20} 
                    color={isSelected ? '#000' : '#1DB954'} 
                  />
                  <Text style={[
                    styles.typeLabel,
                    isSelected && styles.typeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Dirección completa *</Text>
          <TextInput
            style={styles.input}
            value={form.address_line}
            onChangeText={(value) => updateForm('address_line', value)}
            placeholder="Ej: Av. Javier Prado 123, San Isidro"
            placeholderTextColor="#888"
            multiline
          />

          <Text style={styles.sectionTitle}>Ciudad *</Text>
          <TextInput
            style={styles.input}
            value={form.city}
            onChangeText={(value) => updateForm('city', value)}
            placeholder="Ej: Lima"
            placeholderTextColor="#888"
          />

          <Text style={styles.sectionTitle}>Departamento/Estado *</Text>
          <TextInput
            style={styles.input}
            value={form.state}
            onChangeText={(value) => updateForm('state', value)}
            placeholder="Ej: Lima"
            placeholderTextColor="#888"
          />

          <Text style={styles.sectionTitle}>Código postal</Text>
          <TextInput
            style={styles.input}
            value={form.postal_code}
            onChangeText={(value) => updateForm('postal_code', value)}
            placeholder="Ej: 15036"
            placeholderTextColor="#888"
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>País</Text>
          <TextInput
            style={styles.input}
            value={form.country}
            onChangeText={(value) => updateForm('country', value)}
            placeholder="País"
            placeholderTextColor="#888"
          />

          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchTitle}>Dirección predeterminada</Text>
              <Text style={styles.switchSubtitle}>
                Usar esta dirección por defecto para entregas
              </Text>
            </View>
            <Switch
              value={form.is_default}
              onValueChange={(value) => updateForm('is_default', value)}
              trackColor={{ false: '#333', true: '#1DB954' }}
              thumbColor={form.is_default ? '#fff' : '#ccc'}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={isEditing ? 'Actualizar dirección' : 'Guardar dirección'}
            onPress={handleSaveAddress}
            loading={loading}
            size="large"
          />
        </View>
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
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1DB954',
    marginRight: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  typeLabel: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  typeLabelSelected: {
    color: '#000',
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
    marginBottom: 8,
    minHeight: 48,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 16,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  actions: {
    paddingBottom: 32,
  },
});
