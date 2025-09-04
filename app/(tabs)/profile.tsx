import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Edit, LogOut, User, MapPin, Settings, HelpCircle, ShoppingBag, Star, Crown, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Database } from '@/types/database';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

type WholesalerProfile = Database['public']['Tables']['wholesaler_requests']['Row'];

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [wholesalerProfile, setWholesalerProfile] = useState<WholesalerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Fetch wholesaler status
      const { data: wholesalerData, error: wholesalerError } = await supabase
        .from('wholesaler_requests')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (wholesalerError && wholesalerError.code !== 'PGRST116') {
        console.error('Error fetching wholesaler profile:', wholesalerError);
      } else if (wholesalerData) {
        setWholesalerProfile(wholesalerData);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              toast.error('Error al cerrar sesión');
            }
          },
        },
      ]
    );
  };



  if (!user) {
    return (
      <View style={styles.container}>
        <Header showCart={false} />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>
            Para continuar necesitas iniciar sesión
          </Text>
          <Text style={styles.authSubtitle}>
            Inicia sesión o regístrate para ver tu perfil y gestionar tu cuenta.
          </Text>
          
          <View style={styles.authButtons}>
            <Button
              title="Iniciar sesión"
              onPress={() => router.push('/auth/login')}
              size="large"
            />
            <Button
              title="Registrarse"
              onPress={() => router.push('/auth/register')}
              variant="outline"
              size="large"
            />
          </View>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        onCartPress={() => router.push('/cart')}
        onSearchPress={() => router.push('/search')}
        showProfile={false}
      />
      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#888" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.profileName}>
                {profile?.full_name || 'Usuario'}
              </Text>
              {profile?.is_wholesaler && (
                <View style={styles.wholesalerBadge}>
                  <Crown size={16} color="#FFD700" />
                  <Text style={styles.wholesalerText}>Mayorista</Text>
                </View>
              )}
            </View>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {wholesalerProfile && (
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: wholesalerProfile.status === 'approved' ? '#1DB954' : 
                    wholesalerProfile.status === 'pending' ? '#FFA500' : '#FF6B6B' }
                ]}>
                  <Text style={styles.statusText}>
                    {wholesalerProfile.status === 'approved' ? 'Aprobado' :
                     wholesalerProfile.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.profileDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Nombre completo</Text>
            <Text style={styles.detailValue}>
              {profile?.full_name || 'No especificado'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Correo electrónico</Text>
            <Text style={styles.detailValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Teléfono</Text>
            <Text style={styles.detailValue}>
              {profile?.phone_number || 'No especificado'}
            </Text>
          </View>

          {profile?.business_name && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Empresa</Text>
              <Text style={styles.detailValue}>{profile.business_name}</Text>
            </View>
          )}

          {profile?.ruc && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>RUC</Text>
              <Text style={styles.detailValue}>{profile.ruc}</Text>
            </View>
          )}
        </View>

        {/* Menu Actions */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Mi cuenta</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/edit')}
          >
            <Edit size={20} color="#1DB954" />
            <Text style={styles.menuText}>Editar perfil</Text>
            <ChevronRight size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/addresses')}
          >
            <MapPin size={20} color="#1DB954" />
            <Text style={styles.menuText}>Mis direcciones</Text>
            <ChevronRight size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile/store-selection')}
          >
            <ShoppingBag size={20} color="#1DB954" />
            <Text style={styles.menuText}>Seleccionar tienda</Text>
            <ChevronRight size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Pedidos y compras</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <ShoppingBag size={20} color="#1DB954" />
            <Text style={styles.menuText}>Mis pedidos</Text>
            <ChevronRight size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color="#1DB954" />
            <Text style={styles.menuText}>Ayuda y soporte</Text>
            <ChevronRight size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color="#1DB954" />
            <Text style={styles.menuText}>Configuración</Text>
            <ChevronRight size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.logoutItem} onPress={handleSignOut}>
            <LogOut size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1DB954',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#888',
    fontSize: 14,
  },
  editButton: {
    padding: 8,
  },
  editForm: {
    marginBottom: 32,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  profileDetails: {
    marginBottom: 32,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
  },
  actions: {
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    borderRadius: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  authSubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  wholesalerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  wholesalerText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});