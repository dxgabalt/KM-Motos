import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Megaphone, Truck, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Lorem ipsum',
    description: 'Lorem ipsum dolor sit amet consectetur. Mollis integer neque nec risus id. Orci morbi tincidunt eros pharetra vitae. Purus porttitor imperdiet quis.',
    icon: Megaphone,
  },
  {
    id: 2,
    title: 'Pago contraentrega',
    description: 'Lorem ipsum dolor sit amet consectetur. Mollis integer neque nec risus id. Orci morbi tincidunt eros pharetra vitae. Purus porttitor imperdiet quis.',
    icon: Truck,
  },
  {
    id: 3,
    title: 'Compra fácil',
    description: 'Lorem ipsum dolor sit amet consectetur. Mollis integer neque nec risus id. Orci morbi tincidunt eros pharetra vitae. Purus porttitor imperdiet quis.',
    icon: ShoppingBag,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/auth/login');
    }
  };

  const renderItem = (item: typeof onboardingData[0]) => {
    const Icon = item.icon;
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <Icon size={80} color="#1DB954" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={styles.scrollView}
      >
        {onboardingData.map((item) => (
          <View key={item.id} style={[styles.slide, { width }]}>
            {renderItem(item)}
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
        
        <Button
          title="Continuar"
          onPress={handleNext}
          size="large"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#1DB954',
    width: 20,
  },
});