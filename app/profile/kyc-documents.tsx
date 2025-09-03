import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export default function KycDocuments() {
  const [docs, setDocs] = useState<any[]>([]);
  const [newDoc, setNewDoc] = useState('');
  useEffect(() => {
    supabase
      .from('wholesaler_documents')
      .select('*')
      .then(({ data }) => setDocs(data || []));
  }, []);

  const handleAdd = async () => {
    try {
      await supabase.from('wholesaler_documents').insert({ type: 'other', file_url: newDoc });
      setNewDoc('');
    } catch (error) {
      console.log('Error al agregar documento KYC:', error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Documentos KYC</h2>
      <ul>
        {docs.map((d, i) => (
          <li key={i}>{d.name}</li>
        ))}
      </ul>
      <input value={newDoc} onChange={e => setNewDoc(e.target.value)} placeholder="Nuevo documento" />
  <Button title="Agregar documento" onPress={handleAdd} />
    </div>
  );
}
