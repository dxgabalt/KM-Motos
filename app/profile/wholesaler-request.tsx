import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { ArrowLeft, Camera, FileText, Upload } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';

export default function WholesalerRequestScreen() {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [ruc, setRuc] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [reference, setReference] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDocumentUpload = async (type: 'front' | 'back' | 'selfie') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.error('Se requieren permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // TODO: Upload to Supabase Storage
      toast.success(`Documento ${type} cargado`);
      setDocuments(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) return;
    
    if (!businessName || !ruc || !address || !city) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wholesaler_requests')
        .insert({
          user_id: user.id,
          business_name: businessName,
          ruc,
          business_address: address,
          city,
          reference: reference || null,
          documents: documents,
          status: 'pending',
        });

      if (error) throw error;
      
      toast.success('Solicitud enviada correctamente');
      router.push('/profile/wholesaler-confirmation');
    } catch (error) {
      toast.error('Error al enviar solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completa tu perfil de mayorista</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <FileText size={16} color="#000" />
            </View>
          </View>
          <View style={styles.progressStep}>
            <View style={styles.stepCircle}>
              <Camera size={16} color="#888" />
            </View>
          </View>
          <View style={styles.progressStep}>
            <View style={styles.stepCircle}>
              <Upload size={16} color="#888" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Completa tu perfil de mayorista</Text>
        <Text style={styles.subtitle}>
          Para solicitar tu perfil de mayorista necesitamos verificar tus documentos
        </Text>

        <View style={styles.form}>
          <Input
            label="Nombre de la tienda"
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Taller paolo"
          />

          <Input
            label="RUC"
            value={ruc}
            onChangeText={setRuc}
            placeholder="49302389"
          />

          <Input
            label="Dirección"
            value={address}
            onChangeText={setAddress}
            placeholder="Jr. Miguel Grau 129"
          />

          <Input
            label="Ciudad"
            value={city}
            onChangeText={setCity}
            placeholder="Santiago de chile"
          />

          <Input
            label="Referencia"
            value={reference}
            onChangeText={setReference}
            placeholder="ej. Casa Miguel Grau 129"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Documentos requeridos</Text>
          
          <TouchableOpacity 
            style={styles.documentButton}
            onPress={() => handleDocumentUpload('front')}
          >
            <Camera size={20} color="#fff" />
            <Text style={styles.documentButtonText}>Subir foto frontal del documento</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.documentButton}
            onPress={() => handleDocumentUpload('back')}
          >
            <Camera size={20} color="#fff" />
            <Text style={styles.documentButtonText}>Subir foto trasero del documento</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.documentButton}
            onPress={() => handleDocumentUpload('selfie')}
          >
            <Camera size={20} color="#fff" />
            <Text style={styles.documentButtonText}>Subir selfie con el documento</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continuar"
          onPress={handleSubmitRequest}
          loading={loading}
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
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressStep: {
    marginHorizontal: 16,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#1DB954',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  documentsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  documentButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
});