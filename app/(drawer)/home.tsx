import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Calendar, CreditCard, Search, Clock, MapPin, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import ImageCarousel from '@/components/ImageCarousel';
import FloatingChatBot from '@/components/FloatingChatBot';
import ActionButton from '@/components/ActionButton'; // Importamos el componente

// Solo importar WebView en móvil
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    const WebViewModule = require('react-native-webview');
    WebView = WebViewModule.WebView;
  } catch (error) {
    console.log('react-native-webview no disponible');
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // Coordenadas extraídas de tu iframe de Google Maps
  const coordenadas = {
    latitude: -0.007048294397032805,
    longitude: -79.38854164621887,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Función para abrir el mapa en la app nativa
  const abrirMapaNativo = () => {
    const latitude = coordenadas.latitude;
    const longitude = coordenadas.longitude;
    const label = "Campo santo San Agustín";
    
    if (Platform.OS === 'web') {
      // En web, abrir Google Maps directamente
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(mapUrl, '_blank');
      return;
    }

    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}(${label})`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback a Google Maps web
          const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          Linking.openURL(fallbackUrl);
        }
      }).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el mapa');
      });
    }
  };

  // Configuración de botones de acción con ActionButton
  const actionButtons = [
    {
      title: 'Reservas',
      colors: ['#87A96B', '#5F7F3F'] as const,
      icon: <Calendar size={22} color="#4682B4" />,
      route: '/reservations',
    },
    {
      title: 'Pagos',
      colors: ['#DAA520', '#B8860B'] as const,
      icon: <CreditCard size={22} color="#4682B4" />,
      route: '/payments',
    },
    {
      title: 'Consultas',
      colors: ['#4682B4', '#2F4F4F'] as const,
      icon: <Search size={22} color="#4682B4" />,
      route: '/consultations',
    },
  ];

  const scheduleInfo = [
    { day: 'Lunes - Viernes', hours: '8:00 AM - 5:00 PM' },
    { day: 'Sábados', hours: '8:00 AM - 2:00 PM' },
    { day: 'Domingos', hours: '9:00 AM - 1:00 PM' },
    { day: 'Feriados', hours: 'Cerrado' },
  ];

  // HTML para WebView (funciona en web y móvil)
  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; }
        iframe { width: 100%; height: 100%; border: 0; }
      </style>
    </head>
    <body>
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10595.75149880489!2d-79.38854164621887!3d-0.007048294397032805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902aaaae9f05796f%3A0xf8934d42d2080719!2sCampo%20santo%20San%20Agust%C3%ADn!5e0!3m2!1ses-419!2sec!4v1757087693866!5m2!1ses-419!2sec" 
        allowfullscreen="" 
        loading="lazy" 
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </body>
    </html>
  `;

  // Componente de mapa mejorado
  const renderMap = () => {
    // En web, usar iframe directo sin WebView
    if (Platform.OS === 'web') {
      return (
        <div 
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '10px',
            overflow: 'hidden'
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10595.75149880489!2d-79.38854164621887!3d-0.007048294397032805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902aaaae9f05796f%3A0xf8934d42d2080719!2sCampo%20santo%20San%20Agust%C3%ADn!5e0!3m2!1ses-419!2sec!4v1757087693866!5m2!1ses-419!2sec"
                style="width: 100%; height: 100%; border: 0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            `
          }}
        />
      );
    }

    // En móvil, intentar WebView
    if (WebView) {
      return (
        <WebView
          source={{ html: mapHTML }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          onError={() => console.log('WebView error')}
          onHttpError={() => console.log('WebView HTTP error')}
        />
      );
    }

    // Fallback final - botón para abrir Maps
    return (
      <TouchableOpacity 
        style={styles.mapFallback}
        onPress={abrirMapaNativo}
        activeOpacity={0.8}
      >
        <MapPin size={40} color="#4682B4" />
        <Text style={styles.mapFallbackText}>
          Toca para ver en Google Maps
        </Text>
        <Text style={styles.mapFallbackSubtext}>
          Campo santo San Agustín
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5DC', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Menu size={28} color="#4682B4" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cementerio San Agustín</Text>
            <Text style={styles.headerSubtitle}>La Concordia</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Carousel */}
          <View style={styles.section}>
            <ImageCarousel />
          </View>

          {/* Cemetery Description */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F8FF']}
              style={styles.descriptionCard}
            >
              <Text style={styles.sectionTitle}>Nuestro Cementerio</Text>
              <Text style={styles.description}>
                El Cementerio Parroquial San Agustín, ubicado en La Concordia, Santo Domingo, 
                ha servido a nuestra comunidad por más de 12 años. Ofrecemos servicios de 
                entierro y cuidado de tumbas con respeto, dignidad y profesionalismo, 
                brindando un lugar de paz y tranquilidad para el descanso eterno de sus seres queridos.
              </Text>
            </LinearGradient>
          </View>

          {/* Action Buttons - Usando ActionButton component */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
            <View style={styles.actionButtonsContainer}>
              {actionButtons.map((button, index) => (
                <ActionButton
                  key={index}
                  title={button.title}
                  colors={button.colors}
                  icon={button.icon}
                  onPress={() => router.push(button.route as any)}
                  style={styles.actionButtonStyle}
                />
              ))}
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F8FF']}
              style={styles.scheduleCard}
            >
              <View style={styles.scheduleHeader}>
                <Clock size={24} color="#4682B4" />
                <Text style={styles.sectionTitle}>Horarios de Atención</Text>
              </View>
              {scheduleInfo.map((item, index) => (
                <View key={index} style={styles.scheduleItem}>
                  <Text style={styles.scheduleDay}>{item.day}</Text>
                  <Text style={styles.scheduleHours}>{item.hours}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Contact Information CON MAPA */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.contactCard}
            >
              <Text style={styles.contactTitle}>Información de Contacto</Text>
              
              {/* Mapa adaptativo */}
              <View style={styles.mapContainer}>
                {renderMap()}
                <TouchableOpacity 
                  style={styles.openMapButton}
                  onPress={abrirMapaNativo}
                  activeOpacity={0.8}
                >
                  <Text style={styles.openMapText}>
                    {Platform.OS === 'web' ? 'Ver en Google Maps' : 'Abrir en Maps'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.contactItem}
                onPress={abrirMapaNativo}
                activeOpacity={0.7}
              >
                <MapPin size={20} color="#4682B4" />
                <Text style={styles.contactText}>La Concordia, Santo Domingo, Ecuador</Text>
                <Text style={styles.tapHint}>📍 Toca para navegar</Text>
              </TouchableOpacity>
              
              <View style={styles.contactItem}>
                <Phone size={20} color="#4682B4" />
                <Text style={styles.contactText}>+593 2 XXX-XXXX</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <FloatingChatBot />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  descriptionCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  
  // ===== ESTILOS PARA ACTION BUTTONS =====
  actionButtonsContainer: {
    gap: 15,
    marginVertical: 10,
  },
  actionButtonStyle: {
    width: '100%',
  },
  
  // Estilos de horarios
  scheduleCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scheduleDay: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  scheduleHours: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  contactCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 15,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4682B4',
    flex: 1,
  },
  tapHint: {
    fontSize: 11,
    color: '#4682B4',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 100,
  },
  
  // ===== ESTILOS PARA EL MAPA =====
  mapContainer: {
    height: 200,
    marginVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
  },
  mapFallbackText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4682B4',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  mapFallbackSubtext: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  openMapButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(70, 130, 180, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openMapText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
});