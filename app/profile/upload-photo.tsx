import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';

export default function UploadPhoto() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file || !user) return;
    setLoading(true);
    setError('');
    try {
      // Subir foto al bucket avatars
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}.jpg`, file);
      if (uploadError) {
        console.log('Error al subir foto:', uploadError);
        setError(uploadError.message);
        setLoading(false);
        return;
      }
      // Obtener URL pública
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(`${user.id}.jpg`);
      const avatar_url = urlData?.publicUrl || '';
      // Actualizar perfil con avatar_url
      const { error: patchError } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', user.id);
      if (patchError) {
        console.log('Error al actualizar perfil:', patchError);
        setError(patchError.message);
        setLoading(false);
        return;
      }
      alert('Foto subida correctamente');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Sube tu foto de perfil</h2>
  <input type="file" accept="image/*" onChange={e => setFile((e.target as HTMLInputElement).files?.[0] || null)} />
  <Button title="Subir foto" onPress={handleUpload} disabled={loading || !file} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
