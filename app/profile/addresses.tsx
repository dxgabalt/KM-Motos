import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Plus, MapPin, Edit3, Trash2, Home, Building2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';

interface Address {
  id: string;
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_type: 'home' | 'work' | 'other';
  is_default: boolean;
  created_at: string;
}

export default function AddressesScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Error al cargar direcciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('api_upsert_address', {
        p_user_id: user.id,
        p_address_id: addressId,
        p_address_line: null,
        p_city: null,
        p_state: null,
        p_postal_code: null,
        p_country: null,
        p_address_type: null,
        p_is_default: true
      });

      if (error) throw error;

      toast.success('Dirección predeterminada actualizada');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Error al establecer dirección predeterminada');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;

    Alert.alert(
      'Eliminar dirección',
      '¿Estás seguro de que quieres eliminar esta dirección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(addressId);
              const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId)
                .eq('user_id', user.id);

              if (error) throw error;

              toast.success('Dirección eliminada');
              fetchAddresses();
            } catch (error) {
              console.error('Error deleting address:', error);
              toast.error('Error al eliminar dirección');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={20} color="#1DB954" />;
      case 'work':
        return <Building2 size={20} color="#1DB954" />;
      default:
        return <MapPin size={20} color="#1DB954" />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Casa';
      case 'work':
        return 'Trabajo';
      default:
        return 'Otro';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis direcciones</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Cargando direcciones...</Text>
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
        <Text style={styles.headerTitle}>Mis direcciones</Text>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#666" />
            <Text style={styles.emptyTitle}>No tienes direcciones guardadas</Text>
            <Text style={styles.emptySubtitle}>
              Agrega una dirección para facilitar tus pedidos
            </Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressTypeContainer}>
                    {getAddressIcon(address.address_type)}
                    <Text style={styles.addressType}>
                      {getAddressTypeLabel(address.address_type)}
                    </Text>
                    {address.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Predeterminada</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push(`/profile/add-address?id=${address.id}`)}
                    >
                      <Edit3 size={16} color="#1DB954" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteAddress(address.id)}
                      disabled={deletingId === address.id}
                    >
                      {deletingId === address.id ? (
                        <ActivityIndicator size={16} color="#ff4444" />
                      ) : (
                        <Trash2 size={16} color="#ff4444" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.addressLine}>{address.address_line}</Text>
                <Text style={styles.addressDetails}>
                  {address.city}, {address.state} {address.postal_code}
                </Text>
                <Text style={styles.addressCountry}>{address.country}</Text>

                {!address.is_default && (
                  <TouchableOpacity
                    style={styles.setDefaultButton}
                    onPress={() => handleSetDefault(address.id)}
                  >
                    <Text style={styles.setDefaultText}>Establecer como predeterminada</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Agregar nueva dirección"
            onPress={() => router.push('/profile/add-address')}
            size="large"
            icon={<Plus size={20} color="#000" />}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  addressList: {
    marginBottom: 24,
  },
  addressCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  defaultText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addressLine: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  addressDetails: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 2,
  },
  addressCountry: {
    color: '#888',
    fontSize: 14,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  setDefaultText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    paddingBottom: 32,
  },
});
