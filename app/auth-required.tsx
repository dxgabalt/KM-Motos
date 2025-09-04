import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { UserX, Lock, ShoppingBag } from 'lucide-react-native';

export default function AuthRequiredScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <Lock size={48} color="#1DB954" />
          </View>
        </View>

        <Text style={styles.title}>Acceso restringido</Text>
        <Text style={styles.subtitle}>
          Para acceder a esta función necesitas iniciar sesión en tu cuenta de KM Motos
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <ShoppingBag size={20} color="#1DB954" />
            <Text style={styles.featureText}>Realizar pedidos</Text>
          </View>
          <View style={styles.featureItem}>
            <UserX size={20} color="#1DB954" />
            <Text style={styles.featureText}>Gestionar perfil</Text>
          </View>
          <View style={styles.featureItem}>
            <Lock size={20} color="#1DB954" />
            <Text style={styles.featureText}>Acceso a precios especiales</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Iniciar sesión"
            onPress={() => router.push('/auth/login')}
            size="large"
          />
          <Button
            title="Crear cuenta"
            onPress={() => router.push('/auth/register')}
            variant="outline"
            size="large"
          />
        </View>

        <Button
          title="Continuar sin cuenta"
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1DB954',
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
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
});
