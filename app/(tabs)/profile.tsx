import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Edit, LogOut, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [loading, setLoading] = useState(false);

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

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || null,
      });
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Se requieren permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // TODO: Upload image to Supabase Storage
      toast.success('Imagen seleccionada');
    }
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

  return (
    <View style={styles.container}>
      <Header
        onCartPress={() => router.push('/cart')}
        onSearchPress={() => router.push('/search')}
        showProfile={false}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePicker}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#888" />
                </View>
              )}
              <View style={styles.cameraButton}>
                <Camera size={16} color="#000" />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.full_name || 'Usuario'}
            </Text>
            <Text style={styles.profileEmail}>
              {user.email}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Edit size={20} color="#1DB954" />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <Input
              label="Nombre completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Ingresa tu nombre completo"
            />
            
            <Input
              label="Número de teléfono"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Ingresa tu número de teléfono"
              keyboardType="phone-pad"
            />
            
            <View style={styles.editActions}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setIsEditing(false);
                  setFullName(profile?.full_name || '');
                  setPhoneNumber(profile?.phone_number || '');
                }}
                variant="outline"
              />
              <Button
                title="Guardar"
                onPress={handleUpdateProfile}
                loading={loading}
              />
            </View>
          </View>
        ) : (
          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Nombre completo</Text>
              <Text style={styles.detailValue}>
                {profile?.full_name || 'No especificado'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Correo electrónico</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Número de teléfono</Text>
              <Text style={styles.detailValue}>
                {profile?.phone_number || 'No especificado'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>Mis pedidos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>Configuración</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionText}>Ayuda y soporte</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
            <LogOut size={20} color="#ff4444" />
            <Text style={[styles.actionText, { color: '#ff4444' }]}>
              Cerrar sesión
            </Text>
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
});