import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    if (!productId) return;
    supabase
      .from('reviews')
      .select('*,user:profiles(full_name,avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setReviews(data || []));
  }, [productId]);

  const handleSubmit = async () => {
    let photo_url = '';
    if (file) {
      const { data, error } = await supabase.storage.from('reviews').upload(`${productId}/img-1.jpg`, file);
      if (!error && data?.path) {
        const { data: urlData } = supabase.storage.from('reviews').getPublicUrl(`${productId}/img-1.jpg`);
        photo_url = urlData?.publicUrl || '';
      }
    }
    try {
      await supabase.from('reviews').insert({ product_id: productId, photo_url, comment: text });
      setText('');
      setFile(null);
    } catch (error) {
      console.log('Error al crear reseña:', error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Reseñas</h2>
      <ul>
        {reviews.map((r, i) => (
          <li key={i}>
            <img src={r.user?.avatar_url} alt={r.user?.full_name} style={{ width: 32, borderRadius: '50%' }} />
            <strong>{r.user?.full_name}</strong>: {r.text}
            {r.photo_url && <img src={r.photo_url} alt="Foto reseña" style={{ width: 80 }} />}
          </li>
        ))}
      </ul>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Escribe tu reseña" />
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
  <Button title="Enviar reseña" onPress={handleSubmit} />
    </div>
  );
}
