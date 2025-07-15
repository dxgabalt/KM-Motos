import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { toast } from 'sonner-native';

export default function EditProfileScreen() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [documentId, setDocumentId] = useState(profile?.document_id || '');
  const [loading, setLoading] = useState(false);

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
        document_id: documentId.trim() || null,
      });
      toast.success('Perfil actualizado correctamente');
      router.back();
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
      toast.success('Imagen seleccionada');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleImagePicker} style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300' }}
              style={styles.avatar}
            />
            <View style={styles.cameraOverlay}>
              <Camera size={24} color="#000" />
            </View>
          </TouchableOpacity>
          <Button
            title="Cambiar foto de perfil"
            onPress={handleImagePicker}
            variant="outline"
            size="medium"
          />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Nombre(s)</Text>
          <Input
            value={fullName}
            onChangeText={setFullName}
            placeholder="PAOLO CESAR"
          />
          
          <Text style={styles.sectionTitle}>Apellidos</Text>
          <Input
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="FERNANDEZ COSTA"
          />
          
          <Text style={styles.sectionTitle}>Documento de identidad</Text>
          <Input
            value={documentId}
            onChangeText={setDocumentId}
            placeholder="49302389"
          />
        </View>

        <View style={styles.actions}>
          <Button
            title="Guardar cambios"
            onPress={handleUpdateProfile}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1DB954',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  actions: {
    paddingBottom: 32,
  },
});