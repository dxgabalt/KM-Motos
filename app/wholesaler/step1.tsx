import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Camera, FileText, User, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

interface DocumentState {
  front: string | null;
  back: string | null;
  selfie: string | null;
}

export default function WholesalerStep1Screen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentState>({
    front: null,
    back: null,
    selfie: null,
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const handleImagePicker = async (type: keyof DocumentState) => {
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
        aspect: type === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setUploading(type);
        const asset = result.assets[0];
        const fileName = `${user.id}/${type}.jpg`;
        
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('kyc_docs')
          .upload(fileName, blob, { upsert: true });

        if (uploadError) {
          toast.error('Error al subir documento');
          return;
        }

        const { data: urlData } = supabase.storage
          .from('kyc_docs')
          .getPublicUrl(fileName);

        const fileUrl = urlData?.publicUrl || '';

        setDocuments(prev => ({ ...prev, [type]: fileUrl }));
        toast.success('Documento subido correctamente');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error al procesar imagen');
    } finally {
      setUploading(null);
    }
  };

  const handleCameraCapture = async (type: keyof DocumentState) => {
    if (!user) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Se requieren permisos para acceder a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setUploading(type);
        const asset = result.assets[0];
        const fileName = `${user.id}/${type}.jpg`;
        
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('kyc_docs')
          .upload(fileName, blob, { upsert: true });

        if (uploadError) {
          toast.error('Error al subir documento');
          return;
        }

        const { data: urlData } = supabase.storage
          .from('kyc_docs')
          .getPublicUrl(fileName);

        const fileUrl = urlData?.publicUrl || '';

        setDocuments(prev => ({ ...prev, [type]: fileUrl }));
        toast.success('Documento capturado correctamente');
      }
    } catch (error) {
      console.error('Error capturing document:', error);
      toast.error('Error al capturar imagen');
    } finally {
      setUploading(null);
    }
  };

  const showImageOptions = (type: keyof DocumentState) => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción para agregar tu documento',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => handleCameraCapture(type) },
        { text: 'Galería', onPress: () => handleImagePicker(type) },
      ]
    );
  };

  const handleContinue = () => {
    if (!documents.front || !documents.back || !documents.selfie) {
      toast.error('Por favor sube todos los documentos requeridos');
      return;
    }

    // Store documents in navigation state for next screen
    router.push({
      pathname: '/wholesaler/step2',
      params: {
        frontUrl: documents.front,
        backUrl: documents.back,
        selfieUrl: documents.selfie,
      }
    });
  };

  const documentItems = [
    {
      key: 'front' as keyof DocumentState,
      title: 'Sube foto frontal del documento',
      subtitle: 'Toma una foto clara del frente de tu DNI',
      icon: FileText,
    },
    {
      key: 'back' as keyof DocumentState,
      title: 'Sube foto trasera del documento',
      subtitle: 'Toma una foto clara del reverso de tu DNI',
      icon: FileText,
    },
    {
      key: 'selfie' as keyof DocumentState,
      title: 'Sube una selfie con el documento',
      subtitle: 'Tómate una selfie sosteniendo tu DNI junto a tu rostro',
      icon: User,
    },
  ];

  const allDocumentsUploaded = documents.front && documents.back && documents.selfie;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completa tu perfil de mayorista</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepActive}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepInactive}>
            <Text style={styles.stepNumberInactive}>2</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepInactive}>
            <Text style={styles.stepNumberInactive}>3</Text>
          </View>
        </View>

        <Text style={styles.title}>
          Para solicitar tu perfil de mayorista necesitamos verificar tu identidad
        </Text>

        <View style={styles.documentList}>
          {documentItems.map((item) => {
            const IconComponent = item.icon;
            const isUploaded = !!documents[item.key];
            const isUploading = uploading === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.documentCard, isUploaded && styles.documentCardCompleted]}
                onPress={() => showImageOptions(item.key)}
                disabled={isUploading}
              >
                <View style={styles.documentIcon}>
                  {isUploaded ? (
                    <CheckCircle size={24} color="#1DB954" />
                  ) : (
                    <IconComponent size={24} color="#888" />
                  )}
                </View>
                
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentTitle, isUploaded && styles.documentTitleCompleted]}>
                    {item.title}
                  </Text>
                  <Text style={styles.documentSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>

                <View style={styles.documentAction}>
                  {isUploading ? (
                    <View style={styles.uploadingIndicator}>
                      <Text style={styles.uploadingText}>Subiendo...</Text>
                    </View>
                  ) : isUploaded ? (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Completado</Text>
                    </View>
                  ) : (
                    <Camera size={20} color="#1DB954" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {allDocumentsUploaded && (
          <View style={styles.successMessage}>
            <CheckCircle size={24} color="#1DB954" />
            <Text style={styles.successText}>
              Todos los documentos han sido subidos correctamente
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Continuar"
            onPress={handleContinue}
            size="large"
            disabled={!allDocumentsUploaded}
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
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  stepNumberInactive: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  documentList: {
    marginBottom: 24,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  documentCardCompleted: {
    borderColor: '#1DB954',
    backgroundColor: '#0a1a0f',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentTitleCompleted: {
    color: '#1DB954',
  },
  documentSubtitle: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  documentAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 16,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1DB954',
    borderRadius: 16,
  },
  completedText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a1a0f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  successText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  actions: {
    paddingBottom: 32,
  },
});
