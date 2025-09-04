import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Lorem ipsum',
    description: 'Lorem ipsum dolor sit amet consectetur. Mollis integer neque nec risus id. Orci morbi tincidunt eros pharetra vitae. Purus porttitor imperdiet quis.',
    icon: '📱',
    bgColor: '#1A1A1A',
  },
  {
    id: 2,
    title: 'Lorem ipsum',
    description: 'Lorem ipsum dolor sit amet consectetur. Mollis integer neque nec risus id. Orci morbi tincidunt eros pharetra vitae. Purus porttitor imperdiet quis.',
    icon: '📢',
    bgColor: '#1A1A1A',
  },
  {
    id: 3,
    title: 'Pago contraentrega',
    description: 'Lorem ipsum dolor sit amet consectetur. Mollis integer neque nec risus id. Orci morbi tincidunt eros pharetra vitae. Purus porttitor imperdiet quis.',
    icon: '🚚',
    bgColor: '#1A1A1A',
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
    return (
      <View style={[styles.slide, { backgroundColor: item.bgColor }]}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>KM</Text>
            <Text style={styles.logoSubtext}>MOTOS</Text>
          </View>
        </View>
        
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>{item.icon}</Text>
          </View>
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
  iconEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
  },
  logoBox: {
    backgroundColor: '#3CB043',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoSubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
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