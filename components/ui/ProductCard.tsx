import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Database } from '@/types/database';
import { Star, ShoppingCart } from 'lucide-react-native';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
}

export function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: product.image_url || 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=300&h=300' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.sku}>{product.sku}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>US$ {product.price}</Text>
          {onAddToCart && (
            <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
              <ShoppingCart size={16} color="#000" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>4.5 (134)</Text>
        </View>
        <Text style={styles.stock}>
          {product.stock_quantity > 0 ? `${product.stock_quantity} unidades disponibles` : 'Sin stock'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#222',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sku: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1DB954',
    padding: 8,
    borderRadius: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  stock: {
    color: '#888',
    fontSize: 12,
  },
});