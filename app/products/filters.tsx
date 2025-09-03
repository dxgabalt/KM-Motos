import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';

export default function ProductsFilters() {
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState('best');

  const fetchProducts = async () => {
    let query = supabase.from('products').select('*');
    if (filter === 'best') query = query.order('monthly_sales', { ascending: false }).limit(20);
    if (filter === 'low') query = query.order('price', { ascending: true }).limit(20);
    if (filter === 'discount') query = query.gt('discount_pct', 0).order('discount_pct', { ascending: false }).limit(20);
    const { data } = await query;
    setProducts(data || []);
  };

  return (
    <div style={{ padding: 24 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Filtrar productos</h2>
      <Button onClick={() => { setFilter('best'); fetchProducts(); }}>Más vendidos</Button>
      <Button onClick={() => { setFilter('low'); fetchProducts(); }}>Precios bajos</Button>
      <Button onClick={() => { setFilter('discount'); fetchProducts(); }}>Descuentos</Button>
      <ul>
        {products.map((p, i) => (
          <li key={i}>{p.name} - L {Number(p.price).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</li>
        ))}
      </ul>
    </div>
  );
}
