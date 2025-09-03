import { router } from 'expo-router';
import { Button } from '../components/ui/Button';

export default function AuthRequired() {
  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>¡Necesitas iniciar sesión!</h2>
      <Button title="Iniciar sesión" onPress={() => router.push('/auth/login')} />
      <Button title="Registrarse" onPress={() => router.push('/auth/register')} variant="outline" />
    </div>
  );
}
