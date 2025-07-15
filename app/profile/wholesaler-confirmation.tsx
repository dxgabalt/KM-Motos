import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';

export default function WholesalerConfirmationScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color="#1DB954" />
        </View>
        
        <Text style={styles.title}>Nos estaremos comunicando contigo</Text>
        
        <Text style={styles.description}>
          La verificación tarda 2 días para validar la información, apenas terminemos este proceso nos comunicaremos contigo por medio del número registrado aquí en la aplicación.
        </Text>
        
        <Text style={styles.note}>
          Recuerda, una vez tengas el perfil de mayorista, debes de hacer una compra mínima de 700LP para poder activar tu cuenta.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Terminar de registrar"
          onPress={() => router.replace('/(tabs)')}
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  note: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 32,
  },
});