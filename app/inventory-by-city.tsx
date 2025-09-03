import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function InventoryByCity() {
  const [productId, setProductId] = useState('');
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStock = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('api_get_stock_by_product', { _product_id: productId });
    if (error) {
      console.log('Error al consultar inventario:', error);
    }
    setStock(data || []);
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <img src="https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500" alt="Logo KM MOTOS" style={{ width: 120, marginBottom: 24 }} />
      <h2>Inventario por ciudad</h2>
  <input value={productId} onChange={e => setProductId((e.target as HTMLInputElement).value)} placeholder="ID del producto" />
  <Button title="Consultar" onPress={fetchStock} disabled={loading || !productId} />
      <ul>
        {stock.map((sucursal, i) => (
          <li key={i}>{sucursal.store_name} ({sucursal.city}): {sucursal.quantity} unidades</li>
        ))}
      </ul>
    </div>
  );
}
