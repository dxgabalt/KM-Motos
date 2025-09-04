import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, CheckCircle, Building2, Hash, MapPin, FileText, User, Send } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';

export default function WholesalerStep3Screen() {
  const { user } = useAuth();
  const { 
    frontUrl, 
    backUrl, 
    selfieUrl, 
    storeName, 
    ruc, 
    address, 
    city 
  } = useLocalSearchParams<{
    frontUrl: string;
    backUrl: string;
    selfieUrl: string;
    storeName: string;
    ruc: string;
    address: string;
    city: string;
  }>();

  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user) {
      toast.error('Usuario no autenticado');
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: Submit wholesaler request via RPC
      const { error: rpcError } = await supabase.rpc('api_request_wholesaler', {
        _store_name: storeName,
        _ruc: ruc,
        _address: address,
        _city: city
      });

      if (rpcError) throw rpcError;

      // Step 2: Save document URLs to wholesaler_documents table
      const documentInserts = [
        { user_id: user.id, type: 'front', file_url: frontUrl },
        { user_id: user.id, type: 'back', file_url: backUrl },
        { user_id: user.id, type: 'selfie', file_url: selfieUrl },
      ];

      const { error: documentsError } = await supabase
        .from('wholesaler_documents')
        .insert(documentInserts);

      if (documentsError) throw documentsError;

      toast.success('Solicitud enviada correctamente');
      
      // Navigate to success screen or back to profile
      router.replace('/(tabs)/profile');
    } catch (error) {
      console.error('Error submitting wholesaler request:', error);
      toast.error('Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const documentItems = [
    { type: 'front', label: 'Documento frontal', url: frontUrl, icon: FileText },
    { type: 'back', label: 'Documento trasero', url: backUrl, icon: FileText },
    { type: 'selfie', label: 'Selfie con documento', url: selfieUrl, icon: User },
  ];

  const businessInfo = [
    { label: 'Nombre de la tienda', value: storeName, icon: Building2 },
    { label: 'RUC', value: ruc, icon: Hash },
    { label: 'Dirección', value: address, icon: MapPin },
    { label: 'Ciudad', value: city, icon: MapPin },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nos estaremos comunicando contigo</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepCompleted}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepCompleted}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepActive}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
        </View>

        <Text style={styles.title}>
          En un plazo de hasta 3 días hábiles validaremos tu información y nos comunicaremos contigo. Recuerda que una vez que tengas el perfil de mayorista, podrás hacer compras mínimas de 10UDS para poder acceder a nuestros precios especiales para mayoristas.
        </Text>

        <Text style={styles.subtitle}>
          Recuerda que una vez que tengas el perfil de mayorista, podrás hacer compras mínimas de 10UDS para poder acceder a nuestros precios especiales para mayoristas.
        </Text>

        {/* Documents Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos subidos</Text>
          <View style={styles.documentGrid}>
            {documentItems.map((doc) => {
              const IconComponent = doc.icon;
              return (
                <View key={doc.type} style={styles.documentPreview}>
                  <Image source={{ uri: doc.url }} style={styles.documentImage} />
                  <View style={styles.documentOverlay}>
                    <IconComponent size={16} color="#fff" />
                    <Text style={styles.documentLabel}>{doc.label}</Text>
                  </View>
                  <View style={styles.documentCheck}>
                    <CheckCircle size={20} color="#1DB954" />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Business Information Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del negocio</Text>
          <View style={styles.infoList}>
            {businessInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <View key={index} style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <IconComponent size={20} color="#1DB954" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{info.label}</Text>
                    <Text style={styles.infoValue}>{info.value}</Text>
                  </View>
                  <CheckCircle size={20} color="#1DB954" />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.warningCard}>
          <Send size={24} color="#ff9500" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>¿Todo está correcto?</Text>
            <Text style={styles.warningText}>
              Una vez enviada la solicitud, no podrás modificar la información. 
              Nuestro equipo revisará todos los datos y documentos proporcionados.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title={submitting ? "Enviando solicitud..." : "Enviar mi solicitud"}
            onPress={handleSubmitRequest}
            loading={submitting}
            size="large"
            disabled={submitting}
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
  stepCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  stepLineActive: {
    width: 40,
    height: 2,
    backgroundColor: '#1DB954',
    marginHorizontal: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  documentPreview: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  documentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    alignItems: 'center',
  },
  documentLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  documentCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 2,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a1a0f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1200',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ff9500',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    color: '#ff9500',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    paddingBottom: 32,
  },
});
