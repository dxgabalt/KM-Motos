import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Building2, MapPin, Hash } from 'lucide-react-native';
import { toast } from 'sonner-native';

interface BusinessForm {
  storeName: string;
  ruc: string;
  address: string;
  city: string;
}

export default function WholesalerStep2Screen() {
  const { user } = useAuth();
  const { frontUrl, backUrl, selfieUrl } = useLocalSearchParams<{
    frontUrl: string;
    backUrl: string;
    selfieUrl: string;
  }>();

  const [form, setForm] = useState<BusinessForm>({
    storeName: '',
    ruc: '',
    address: '',
    city: '',
  });

  const updateForm = (field: keyof BusinessForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateRuc = (ruc: string) => {
    // Basic RUC validation for Peru (11 digits)
    const rucPattern = /^\d{11}$/;
    return rucPattern.test(ruc);
  };

  const handleContinue = () => {
    if (!form.storeName.trim()) {
      toast.error('El nombre de la tienda es requerido');
      return;
    }

    if (!form.ruc.trim()) {
      toast.error('El RUC es requerido');
      return;
    }

    if (!validateRuc(form.ruc.trim())) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }

    if (!form.address.trim()) {
      toast.error('La dirección es requerida');
      return;
    }

    if (!form.city.trim()) {
      toast.error('La ciudad es requerida');
      return;
    }

    // Navigate to step 3 with all data
    router.push({
      pathname: '/wholesaler/step3',
      params: {
        frontUrl,
        backUrl,
        selfieUrl,
        storeName: form.storeName.trim(),
        ruc: form.ruc.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
      }
    });
  };

  const formFields = [
    {
      key: 'storeName' as keyof BusinessForm,
      label: 'Nombre de la tienda',
      placeholder: 'Ej: Motos del Norte SAC',
      icon: Building2,
      keyboardType: 'default' as const,
    },
    {
      key: 'ruc' as keyof BusinessForm,
      label: 'RUC',
      placeholder: '20123456789',
      icon: Hash,
      keyboardType: 'numeric' as const,
      maxLength: 11,
    },
    {
      key: 'address' as keyof BusinessForm,
      label: 'Dirección',
      placeholder: 'Av. Javier Prado 123, San Isidro',
      icon: MapPin,
      keyboardType: 'default' as const,
      multiline: true,
    },
    {
      key: 'city' as keyof BusinessForm,
      label: 'Ciudad',
      placeholder: 'Lima',
      icon: MapPin,
      keyboardType: 'default' as const,
    },
  ];

  const isFormValid = form.storeName.trim() && 
                     validateRuc(form.ruc.trim()) && 
                     form.address.trim() && 
                     form.city.trim();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completa la información de tu negocio</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stepIndicator}>
          <View style={styles.stepCompleted}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepLineActive} />
          <View style={styles.stepActive}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepInactive}>
            <Text style={styles.stepNumberInactive}>3</Text>
          </View>
        </View>

        <Text style={styles.title}>
          Para solicitar tu perfil de mayorista necesitamos algunos datos de tu negocio
        </Text>

        <View style={styles.form}>
          {formFields.map((field) => {
            const IconComponent = field.icon;
            
            return (
              <View key={field.key} style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <IconComponent size={20} color="#888" />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      field.multiline && styles.inputMultiline
                    ]}
                    value={form[field.key]}
                    onChangeText={(value) => updateForm(field.key, value)}
                    placeholder={field.placeholder}
                    placeholderTextColor="#888"
                    keyboardType={field.keyboardType}
                    maxLength={field.maxLength}
                    multiline={field.multiline}
                    textAlignVertical={field.multiline ? 'top' : 'center'}
                  />
                </View>
                {field.key === 'ruc' && form.ruc && !validateRuc(form.ruc) && (
                  <Text style={styles.errorText}>
                    El RUC debe tener exactamente 11 dígitos
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <Building2 size={24} color="#1DB954" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Información importante</Text>
            <Text style={styles.infoText}>
              Los datos que proporciones serán verificados por nuestro equipo. 
              Asegúrate de que toda la información sea correcta y coincida con 
              tus documentos oficiales.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Continuar"
            onPress={handleContinue}
            size="large"
            disabled={!isFormValid}
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
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#222',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  inputIcon: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
    paddingRight: 16,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#0a1a0f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    paddingBottom: 32,
  },
});
