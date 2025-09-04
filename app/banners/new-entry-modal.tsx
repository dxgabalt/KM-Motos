import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ImageBackground } from 'react-native';
import { X } from 'lucide-react-native';

interface NewEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NewEntryModal({ visible, onClose }: NewEntryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
            }}
            style={styles.backgroundImage}
            imageStyle={styles.imageStyle}
          >
            <View style={styles.overlay}>
              <View style={styles.content}>
                <View style={styles.titleContainer}>
                  <Text style={styles.newText}>NUEVO</Text>
                  <Text style={styles.ingresoText}>INGRESO</Text>
                </View>
                
                <View style={styles.logoContainer}>
                  <View style={styles.logoBox}>
                    <Text style={styles.logoText}>KM</Text>
                    <Text style={styles.logoSubtext}>MOTOS</Text>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    borderRadius: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  newText: {
    color: '#FF4444',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  ingresoText: {
    color: '#FF4444',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  logoContainer: {
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
