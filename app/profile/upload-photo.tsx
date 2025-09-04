import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner-native';

export default function UploadPhoto() {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos permisos para acceder a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Necesitamos permisos para usar la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri || !user) {
      toast.error('Selecciona una foto primero');
      return;
    }

    setLoading(true);
    try {
      // Crear FormData para subir imagen
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `${user.id}.jpg`,
      } as any);

      // Subir foto al bucket avatars
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}.jpg`, formData, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        toast.error('Error al subir foto: ' + uploadError.message);
        return;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id}.jpg`);
      
      const avatar_url = urlData?.publicUrl || '';

      // Actualizar perfil con avatar_url
      const { error: patchError } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', user.id);

      if (patchError) {
        toast.error('Error al actualizar perfil: ' + patchError.message);
        return;
      }

      toast.success('Foto subida correctamente');
      router.replace('/(tabs)');
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KM MOTOS</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Sube tu foto de perfil</Text>
        <Text style={styles.subtitle}>
          Sube una foto de perfil para que podamos reconocerte fácilmente al momento de tu compra.
        </Text>

        <View style={styles.photoContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.photoOption} onPress={pickImage}>
            <Text style={styles.photoOptionText}>📱 Subir una foto del perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.photoOption} onPress={takePhoto}>
            <Text style={styles.photoOptionText}>📸 Completar foto de perfil</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.skipText}>Guardar foto y continuar</Text>

        <Button
          title="Guardar foto y continuar"
          onPress={handleUpload}
          loading={loading}
          disabled={!imageUri}
          size="large"
        />

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Saltar por ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    color: '#3CB043',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 300,
  },
  photoContainer: {
    marginBottom: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#3CB043',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#555555',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 40,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  photoOption: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  photoOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  skipText: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 20,
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
});
