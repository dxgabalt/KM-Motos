import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !phone) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${firstName} ${lastName}`;
      
      // Registro con Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        phone: phone,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        toast.error(error.message || 'Error al registrarse');
        return;
      }

      if (data.user) {
        // Crear perfil automáticamente
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone,
            role: 'customer'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        toast.success('Registro exitoso');
        router.replace('/profile/upload-photo');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      
      if (error) {
        toast.error('Error con Google: ' + error.message);
      }
    } catch (error: any) {
      toast.error('Error al conectar con Google');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Logo width={180} height={60} />
        <Text style={styles.title}>Registrarse</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Nombre(s)"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Nombre"
        />
        
        <Input
          label="Apellidos"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Apellidos"
        />
        
        <Input
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
        />
        
        <Input
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        
        <Input
          label="📱 +504 (Número)"
          value={phone}
          onChangeText={setPhone}
          placeholder="0000-0000"
          keyboardType="phone-pad"
        />

        <Button
          title="Registrarse"
          onPress={handleRegister}
          loading={loading}
          size="large"
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
            <Text style={styles.socialButtonText}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleRegister}>
            <Text style={styles.socialButtonText}>G</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Ya tienes una cuenta con nosotros?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.linkText}>Inicia sesión aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 60,
  },
  logo: {
    color: '#3CB043',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 60,
    letterSpacing: 2,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#888',
    paddingHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  linkText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
});