import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Star, Camera, X, Send } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner-native';
import { Database } from '@/types/database';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
};

export default function ProductReviewsScreen() {
  const { id: productId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = async () => {
    if (reviewImages.length >= 3) {
      toast.error('Máximo 3 imágenes por reseña');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setReviewImages([...reviewImages, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  const uploadReviewImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const imageUri of reviewImages) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const fileExt = imageUri.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('reviews')
          .upload(fileName, blob, {
            contentType: `image/${fileExt}`,
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('reviews')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const handleSubmitReview = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    if (reviewText.trim().length < 10) {
      toast.error('La reseña debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (reviewImages.length > 0) {
        imageUrls = await uploadReviewImages();
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: reviewText.trim(),
          images: imageUrls.length > 0 ? imageUrls : null,
          is_approved: false // Reviews need approval
        });

      if (error) throw error;

      toast.success('Reseña enviada para revisión');
      setShowWriteReview(false);
      setRating(0);
      setReviewText('');
      setReviewImages([]);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al enviar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress?.(star)}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 32 : 16}
              color={star <= rating ? "#FFD700" : "#333"}
              fill={star <= rating ? "#FFD700" : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando reseñas...</Text>
      </View>
    );
  }

  const averageRating = getAverageRating();
  const distribution = getRatingDistribution();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reseñas del Producto</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.ratingOverview}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            {renderStars(Math.round(averageRating))}
            <Text style={styles.reviewCount}>
              {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
            </Text>
          </View>

          <View style={styles.ratingDistribution}>
            {[5, 4, 3, 2, 1].map((stars) => (
              <View key={stars} style={styles.distributionRow}>
                <Text style={styles.distributionStars}>{stars}</Text>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <View style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.distributionFill,
                      { width: `${reviews.length > 0 ? (distribution[stars as keyof typeof distribution] / reviews.length) * 100 : 0}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.distributionCount}>
                  {distribution[stars as keyof typeof distribution]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Todas las reseñas</Text>
            <Button
              title="Escribir reseña"
              onPress={() => setShowWriteReview(true)}
              size="small"
            />
          </View>

          {reviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No hay reseñas aún</Text>
              <Text style={styles.emptyText}>
                Sé el primero en escribir una reseña sobre este producto
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      {review.profiles.avatar_url ? (
                        <Image source={{ uri: review.profiles.avatar_url }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarText}>
                          {review.profiles.full_name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.userName}>{review.profiles.full_name}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('es-PE')}
                      </Text>
                    </View>
                  </View>
                  {renderStars(review.rating)}
                </View>

                <Text style={styles.reviewComment}>{review.comment}</Text>

                {review.images && review.images.length > 0 && (
                  <ScrollView horizontal style={styles.reviewImages} showsHorizontalScrollIndicator={false}>
                    {review.images.map((imageUrl, index) => (
                      <Image key={index} source={{ uri: imageUrl }} style={styles.reviewImage} />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showWriteReview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowWriteReview(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Escribir Reseña</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Calificación</Text>
              {renderStars(rating, true, setRating)}
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Tu reseña</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Comparte tu experiencia con este producto..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
                value={reviewText}
                onChangeText={setReviewText}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {reviewText.length}/500 caracteres
              </Text>
            </View>

            <View style={styles.imagesSection}>
              <Text style={styles.imagesLabel}>Fotos (opcional)</Text>
              <ScrollView horizontal style={styles.imagesList} showsHorizontalScrollIndicator={false}>
                {reviewImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {reviewImages.length < 3 && (
                  <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
                    <Camera size={24} color="#888" />
                    <Text style={styles.addImageText}>Agregar foto</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={submitting ? "Enviando..." : "Enviar reseña"}
              onPress={handleSubmitReview}
              loading={submitting}
              size="large"
              disabled={rating === 0 || reviewText.trim().length < 10}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#111',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  ratingOverview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRating: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  reviewCount: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  ratingDistribution: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionStars: {
    color: '#fff',
    fontSize: 14,
    width: 12,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  distributionFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  distributionCount: {
    color: '#888',
    fontSize: 14,
    width: 20,
    textAlign: 'right',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  reviewCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewDate: {
    color: '#888',
    fontSize: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewComment: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    marginTop: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
  },
  characterCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  imagesSection: {
    marginBottom: 24,
  },
  imagesLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imagesList: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  modalFooter: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});
