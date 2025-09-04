import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Store, Check } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { toast } from 'sonner-native';

type Store = Database['public']['Tables']['stores']['Row'];

export default function StoreSelectionScreen() {
  const { user, profile } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStores();
      setSelectedStore(profile?.default_store_id || null);
    }
  }, [user, profile]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error al cargar tiendas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedStore) {
      toast.error('Por favor selecciona una tienda');
      return;
    }

    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('api_set_default_store', {
        p_user_id: user.id,
        p_store_id: selectedStore
      });

      if (error) throw error;

      toast.success('Tienda predeterminada actualizada');
      router.back();
    } catch (error) {
      console.error('Error setting default store:', error);
      toast.error('Error al actualizar tienda predeterminada');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escoger tienda predeterminada</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loadingText}>Cargando tiendas...</Text>
          </View>
        ) : stores.length === 0 ? (
          <View style={styles.emptyState}>
            <Store size={48} color="#666" />
            <Text style={styles.emptyTitle}>No hay tiendas disponibles</Text>
            <Text style={styles.emptySubtitle}>
              No se encontraron tiendas activas en este momento
            </Text>
          </View>
        ) : (
          stores.map((store) => {
            const isSelected = selectedStore === store.id;
            const isCurrentDefault = profile?.default_store_id === store.id;

            return (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.storeCard,
                  isSelected && styles.storeCardSelected,
                ]}
                onPress={() => setSelectedStore(store.id)}
              >
                <View style={[styles.storeIcon, isSelected && styles.storeIconSelected]}>
                  <Store size={24} color={isSelected ? "#000" : "#1DB954"} />
                </View>
                <View style={styles.storeInfo}>
                  <View style={styles.storeHeader}>
                    <Text style={[styles.storeName, isSelected && styles.storeNameSelected]}>
                      {store.name}
                    </Text>
                    {isCurrentDefault && !isSelected && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentText}>Actual</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.storeLocation}>
                    <MapPin size={14} color={isSelected ? "#000" : "#888"} />
                    <Text style={[styles.storeAddress, isSelected && styles.storeAddressSelected]}>
                      {store.address}, {store.city}
                    </Text>
                  </View>
                  {store.phone && (
                    <Text style={[styles.storePhone, isSelected && styles.storePhoneSelected]}>
                      {store.phone}
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Check size={16} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {!loading && stores.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Guardar cambios"
            onPress={handleSaveChanges}
            loading={saving}
            size="large"
            disabled={!selectedStore || selectedStore === profile?.default_store_id}
          />
        </View>
      )}
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
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  storeCardSelected: {
    borderColor: '#1DB954',
    backgroundColor: '#1DB954',
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeAddress: {
    color: '#888',
    fontSize: 14,
    marginLeft: 4,
  },
  storePhone: {
    color: '#888',
    fontSize: 14,
  },
  selectedIndicator: {
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
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  storeIconSelected: {
    backgroundColor: '#fff',
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  storeNameSelected: {
    color: '#000',
  },
  currentBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: '600',
  },
  storeAddressSelected: {
    color: '#000',
  },
  storePhoneSelected: {
    color: '#000',
  },
});