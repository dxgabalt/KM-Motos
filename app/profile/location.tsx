import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Search, X } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { toast } from 'sonner-native';

type Address = Database['public']['Tables']['addresses']['Row'];

export default function LocationScreen() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user) return;

    try {
      // Remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      toast.success('Dirección predeterminada actualizada');
      fetchAddresses();
    } catch (error) {
      toast.error('Error al actualizar dirección');
    }
  };

  const filteredAddresses = addresses.filter(address =>
    address.address_line_1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    address.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agrega o escoge dirección</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Ingresa una dirección"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.currentLocationButton}>
          <MapPin size={20} color="#1DB954" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Usar ubicación actual</Text>
            <Text style={styles.locationSubtitle}>Jr. Miguel Grau 129 - Santiago de chile</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.savedAddresses}>
          {filteredAddresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={styles.addressItem}
              onPress={() => setDefaultAddress(address.id)}
            >
              <View style={styles.addressIcon}>
                <MapPin size={16} color="#fff" />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressTitle}>{address.address_line_1}</Text>
                <Text style={styles.addressSubtitle}>{address.label}</Text>
              </View>
              {address.is_default && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Predeterminada</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addAddressButton}
          onPress={() => router.push('/profile/add-address')}
        >
          <Text style={styles.addAddressText}>+ Agregar nueva dirección</Text>
        </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  savedAddresses: {
    marginBottom: 24,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  defaultBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  addAddressButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  addAddressText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
  },
});