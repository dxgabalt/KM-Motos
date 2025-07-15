import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Store } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { toast } from 'sonner-native';

type Store = Database['public']['Tables']['stores']['Row'];

export default function StoreSelectionScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = () => {
    if (!selectedStore) {
      toast.error('Por favor selecciona una tienda');
      return;
    }
    
    toast.success('Tienda predeterminada actualizada');
    router.back();
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
        {stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.storeCard,
              selectedStore === store.id && styles.storeCardSelected,
            ]}
            onPress={() => setSelectedStore(store.id)}
          >
            <View style={styles.storeIcon}>
              <Store size={24} color="#fff" />
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={styles.storeLocation}>
                <MapPin size={14} color="#888" />
                <Text style={styles.storeAddress}>{store.address}, {store.city}</Text>
              </View>
              {store.phone && (
                <Text style={styles.storePhone}>{store.phone}</Text>
              )}
            </View>
            {selectedStore === store.id && (
              <View style={styles.selectedIndicator}>
                <View style={styles.selectedDot} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Guardar cambios"
          onPress={handleSaveChanges}
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
});