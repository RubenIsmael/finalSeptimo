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
const CAROUSEL_WIDTH = screenWidth * 0.9;
const CAROUSEL_HEIGHT = 200;

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Función para ir al siguiente slide
  const goToNextSlide = () => {
    const nextIndex = (currentIndex + 1) % carouselImages.length;
    setCurrentIndex(nextIndex);
    
    // Animación de fade suave
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true, // ✅ CORRECTO: useNativeDriver: true para opacity
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true, // ✅ CORRECTO: useNativeDriver: true para opacity
      }),
    ]).start();

    // Scroll al siguiente slide
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: nextIndex * CAROUSEL_WIDTH,
        animated: true,
      });
    }
  };

  // Effect para el auto-scroll
  useEffect(() => {
    // Limpiar interval anterior si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Crear nuevo interval
    intervalRef.current = setInterval(goToNextSlide, 4000);

    // Cleanup al desmontar o cambiar dependencias
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex]); // Dependencia en currentIndex para reiniciar el timer

  // Cleanup adicional al desmontar el componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    
    // Solo actualizar si el índice es diferente para evitar loops
    if (index !== currentIndex && index >= 0 && index < carouselImages.length) {
      setCurrentIndex(index);
    }
  };

  const handleScrollBeginDrag = () => {
    // Pausar auto-scroll cuando el usuario toca
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleScrollEndDrag = () => {
    // Reanudar auto-scroll después de que el usuario termine de tocar
    intervalRef.current = setInterval(goToNextSlide, 4000);
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
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          style={styles.scrollView}
          decelerationRate="fast"
        >
          {carouselImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.image}
                  resizeMode="cover"
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
    backgroundColor: '#f8f9fa',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  image: {
    width: CAROUSEL_WIDTH - 4,
    height: CAROUSEL_HEIGHT - 4,
    borderRadius: 14,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.10)',
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