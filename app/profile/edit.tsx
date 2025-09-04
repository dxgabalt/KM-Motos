import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, ArrowLeft, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [documentId, setDocumentId] = useState(profile?.document_id || '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim() || null,
          document_id: documentId.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil actualizado correctamente');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    if (!user) return;

    try {
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

      if (!result.canceled && result.assets?.length > 0) {
        setUploadingImage(true);
        const asset = result.assets[0];
        const fileName = `${user.id}.jpg`;
        
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, { upsert: true });

        if (uploadError) {
          toast.error('Error al subir imagen');
          return;
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const avatar_url = urlData?.publicUrl || '';

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url })
          .eq('id', user.id);

        if (updateError) {
          toast.error('Error al actualizar avatar');
          return;
        }

        toast.success('Foto actualizada correctamente');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Error al procesar imagen');
    } finally {
      setUploadingImage(false);
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
          <TouchableOpacity onPress={handleImagePicker} style={styles.avatarContainer} disabled={uploadingImage}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#888" />
              </View>
            )}
            <View style={styles.cameraOverlay}>
              {uploadingImage ? (
                <ActivityIndicator size={20} color="#000" />
              ) : (
                <Camera size={20} color="#000" />
              )}
            </View>
          </TouchableOpacity>
          <Button
            title={uploadingImage ? "Subiendo..." : "Cambiar foto de perfil"}
            onPress={handleImagePicker}
            variant="outline"
            size="medium"
            disabled={uploadingImage}
          />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ingresa tu nombre completo"
            placeholderTextColor="#888"
          />
          
          <Text style={styles.sectionTitle}>Número de teléfono</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Ingresa tu teléfono"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
          />
          
          <Text style={styles.sectionTitle}>DNI</Text>
          <TextInput
            style={styles.input}
            value={documentId}
            onChangeText={setDocumentId}
            placeholder="Ingresa tu DNI"
            placeholderTextColor="#888"
            keyboardType="numeric"
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
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});