import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function NewInModal() {
  const [banner, setBanner] = useState<any>(null);
  useEffect(() => {
    supabase
      .from('banners')
      .select('*')
      .eq('type', 'new_in')
      .eq('is_active', true)
      .limit(1)
      .then(({ data }) => setBanner(data?.[0]));
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Novedades</h2>
      {banner ? (
        <div>
          <img src={banner.image_url} alt={banner.title} style={{ width: '100%', maxWidth: 400 }} />
          <h3>{banner.title}</h3>
          <p>{banner.description}</p>
        </div>
      ) : <p>No hay novedades activas.</p>}
    </div>
  );
}
