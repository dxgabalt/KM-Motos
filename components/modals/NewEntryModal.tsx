import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { X, ExternalLink } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Banner = Database['public']['Tables']['banners']['Row'];

interface NewEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function NewEntryModal({ visible, onClose }: NewEntryModalProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchNewEntryBanner();
    }
  }, [visible]);

  const fetchNewEntryBanner = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('type', 'new_in')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBanner(data || null);
    } catch (error) {
      console.error('Error fetching new entry banner:', error);
      setBanner(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerPress = () => {
    if (banner?.link_url) {
      // Handle banner link navigation
      console.log('Navigate to:', banner.link_url);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : banner ? (
            <TouchableOpacity 
              style={styles.bannerContainer}
              onPress={handleBannerPress}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: banner.image_url }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                {banner.description && (
                  <Text style={styles.bannerDescription}>{banner.description}</Text>
                )}
                
                {banner.link_url && (
                  <View style={styles.linkContainer}>
                    <ExternalLink size={16} color="#1DB954" />
                    <Text style={styles.linkText}>Ver más detalles</Text>
                  </View>
                )}
              </View>

              {banner.badge_text && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{banner.badge_text}</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>¡Bienvenido a KM Motos!</Text>
              <Text style={styles.emptyDescription}>
                Descubre nuestros productos de alta calidad y encuentra 
                todo lo que necesitas para tu motocicleta.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#111',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  bannerContainer: {
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#222',
  },
  bannerContent: {
    padding: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 26,
  },
  bannerDescription: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyDescription: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
