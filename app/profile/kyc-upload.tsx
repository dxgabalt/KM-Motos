import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function KycUpload() {
  const { user } = useAuth();
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!user || !front || !back || !selfie) return;
    setLoading(true);
    // Subir documentos al bucket kyc_docs
    try {
      await supabase.storage.from('kyc_docs').upload(`${user.id}/front.jpg`, front);
      await supabase.storage.from('kyc_docs').upload(`${user.id}/back.jpg`, back);
      await supabase.storage.from('kyc_docs').upload(`${user.id}/selfie.jpg`, selfie);
      // Guardar URLs en wholesaler_documents
      await supabase.from('wholesaler_documents').insert([
        { user_id: user.id, type: 'front', file_url: `${user.id}/front.jpg` },
        { user_id: user.id, type: 'back', file_url: `${user.id}/back.jpg` },
        { user_id: user.id, type: 'selfie', file_url: `${user.id}/selfie.jpg` },
      ]);
      alert('Documentos subidos');
    } catch (error) {
      console.log('Error al subir documentos KYC:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Sube tus documentos KYC</h2>
      <input type="file" accept="image/*" onChange={e => setFront(e.target.files?.[0] || null)} />
      <input type="file" accept="image/*" onChange={e => setBack(e.target.files?.[0] || null)} />
      <input type="file" accept="image/*" onChange={e => setSelfie(e.target.files?.[0] || null)} />
  <Button title="Subir documentos" onPress={handleUpload} disabled={loading || !front || !back || !selfie} />
    </div>
  );
}
