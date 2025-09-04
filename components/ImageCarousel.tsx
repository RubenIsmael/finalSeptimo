import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Dimensiones del carousel
const CAROUSEL_WIDTH = screenWidth * 0.9; // 90% del ancho de pantalla
const CAROUSEL_HEIGHT = 200; // Altura ligeramente aumentada para mejor proporción

const carouselImages = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdq5yrgjen9UNizUysBN7orwfi4glNEouo6Q&s',
  'https://www.radiobicentenario.com.ar/radiobicentenario/fotos/cache/notas/2019/10/31/926x0_5309_20191031165113.jpg',
  'https://www.parquesanagustin.com.ar/upload/pagina/17/17_20220705101031.jpg',
  'https://live.staticflickr.com/5518/11954400773_9f3806b847_b.jpg',
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const nextIndex = (currentIndex + 1) % carouselImages.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * CAROUSEL_WIDTH, 
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, fadeAnim]);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.carouselContainer, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {carouselImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.image}
                  onError={(error) => {
                    console.log('Error cargando imagen:', error);
                  }}
                />
              </View>
              <View style={styles.overlay} />
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      <View style={styles.pagination}>
        {carouselImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    backgroundColor: '#fff',
  },
  carouselContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
    backgroundColor: '#f8f9fa', // Fondo de respaldo
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2, // Pequeño padding para evitar que la imagen toque los bordes
  },
  image: {
    width: CAROUSEL_WIDTH - 4, // Ligeramente menor para el padding
    height: CAROUSEL_HEIGHT - 4,
    resizeMode: 'cover', // Volvemos a cover pero con mejor estructura
    borderRadius: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.10)', // Overlay más sutil
    borderRadius: 16,
  },
  pagination: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(46, 125, 50, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#2E7D32',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
  },
});