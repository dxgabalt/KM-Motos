import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ShoppingCart, Search, User, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  showCart?: boolean;
  showSearch?: boolean;
  showProfile?: boolean;
  showLocation?: boolean;
  onCartPress?: () => void;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
  location?: string;
}

export function Header({
  showCart = true,
  showSearch = true,
  showProfile = true,
  showLocation = true,
  onCartPress,
  onSearchPress,
  onProfilePress,
  location = 'KM Motos Lima',
}: HeaderProps) {
  const { profile } = useAuth();
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1029624/pexels-photo-1029624.jpeg?auto=compress&cs=tinysrgb&w=100&h=100' }}
            style={styles.logo}
          />
          <Text style={styles.logoText}>KM MOTOS</Text>
        </View>
        <View style={styles.rightSection}>
          {showSearch && (
            <TouchableOpacity style={styles.iconButton} onPress={onSearchPress}>
              <Search size={24} color="#fff" />
            </TouchableOpacity>
          )}
          {showCart && (
            <TouchableOpacity style={styles.iconButton} onPress={onCartPress}>
              <ShoppingCart size={24} color="#1DB954" />
              {cartItemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {showProfile && (
            <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
              <User size={20} color="#fff" />
              <Text style={styles.profileText}>
                {profile?.full_name?.split(' ')[0] || 'Usuario'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {showLocation && (
        <View style={styles.locationRow}>
          <MapPin size={16} color="#1DB954" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  logoText: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  profileText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});