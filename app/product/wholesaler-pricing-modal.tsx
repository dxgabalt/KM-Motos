import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function WholesalerPricingModal({ productId }: { productId: string }) {
  const [pricing, setPricing] = useState<any[]>([]);
  useEffect(() => {
    if (!productId) return;
    supabase
      .from('wholesaler_pricing')
      .select('*')
      .eq('product_id', productId)
      .then(({ data }) => setPricing(data || []));
  }, [productId]);
  return (
    <div style={{ padding: 24 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Precios mayoristas</h2>
      <ul>
        {pricing.map((p, i) => (
          <li key={i}>Cantidad mínima: {p.min_quantity} - Precio: L {Number(p.unit_price).toLocaleString('es-HN', { minimumFractionDigits: 2 })} - Descuento: {p.discount_percentage}%</li>
        ))}
      </ul>
    </div>
  );
}
