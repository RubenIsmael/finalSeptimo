import React, { useEffect, useState } from 'react';
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
import { 
  Menu, 
  Calendar, 
  CreditCard, 
  Search, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle,
  Heart,
  Shield,
  Users
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import ImageCarousel from '@/components/ImageCarousel';
import FloatingChatBot from '@/components/FloatingChatBot';

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

// Mantener la pantalla de splash mientras cargan las fuentes
SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Cargar las fuentes personalizadas
  const [fontsLoaded] = useFonts({
    'TituloPrincipal': require('../assets/fonts/Titulo_Principal.ttf'),
    'TextoGeneral': require('../assets/fonts/Texto_General.ttf'),
    'Titulos': require('../assets/fonts/Titulos.ttf'),
  });

  // Estado para controlar cuando las fuentes están listas
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Esperar a que las fuentes se carguen
        if (fontsLoaded) {
          setAppIsReady(true);
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, [fontsLoaded]);

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

  // Función para abrir WhatsApp
  const abrirWhatsApp = () => {
    const phoneNumber = '593996344075'; // Sin el +
    const message = 'Hola, me interesa obtener información sobre los servicios del Cementerio San Agustín';
    
    const whatsappUrl = Platform.select({
      ios: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      android: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
      web: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    });
    
    if (Platform.OS === 'web') {
      window.open(whatsappUrl, '_blank');
    } else {
      Linking.canOpenURL(whatsappUrl!).then(supported => {
        if (supported) {
          Linking.openURL(whatsappUrl!);
        } else {
          // Fallback para web WhatsApp
          const webWhatsapp = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          Linking.openURL(webWhatsapp);
        }
      });
    }
  };

  // Configuración de servicios modernos con diseño 2x2
  const services = [
    {
      title: 'Reservas',
      subtitle: 'Espacios de descanso',
      icon: Calendar,
      colors: ['#8B7355', '#6B5B47'],
      route: '/reservations',
      description: 'Reserva de espacios'
    },
    {
      title: 'Pagos',
      subtitle: 'Gestión financiera',
      icon: CreditCard,
      colors: ['#9C8B6B', '#7D6B4F'],
      route: '/payments',
      description: 'Consulta de pagos'
    },
    {
      title: 'Consultas',
      subtitle: 'Información general',
      icon: Search,
      colors: ['#6B7B7B', '#4F5F5F'],
      route: '/consultations',
      description: 'Búsquedas y consultas'
    },
    {
      title: 'Contáctanos',
      subtitle: 'Soporte y ayuda',
      icon: MessageCircle,
      colors: ['#7B8B7B', '#5F6F5F'],
      route: '/contact',
      description: 'Atención personalizada'
    },
  ];

  const scheduleInfo = [
    { day: 'Lunes - Viernes', hours: '8:00 AM - 6:00 PM' },
    { day: 'Sábados', hours: '8:00 AM - 5:00 PM' },
    { day: 'Domingos', hours: '9:00 AM - 5:00 PM' },
    { day: 'Feriados', hours: '10:00 AM - 5:00 PM' },
  ];

  // Información de valores institucionales
  const valuesInfo = [
    {
      icon: Heart,
      title: 'Respeto',
      description: 'Honramos la memoria de quienes descansan aquí'
    },
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Protegemos el descanso eterno con vigilancia constante'
    },
    {
      icon: Users,
      title: 'Familia',
      description: 'Acompañamos a las familias en momentos difíciles'
    }
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10595.75149880489!2d-79.38854164621887!3d-0.007048294397032805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902aaaae9f05796f%3A0xf8934d42d2080719!2eCampo%20santo%20San%20Agust%C3%ADn!5e0!3m2!1ses-419!2sec!4v1757087693866!5m2!1ses-419!2sec"
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
        <MapPin size={40} color="#8B7355" />
        <Text style={styles.mapFallbackText}>
          Toca para ver en Google Maps
        </Text>
        <Text style={styles.mapFallbackSubtext}>
          Campo santo San Agustín
        </Text>
      </TouchableOpacity>
    );
  };

  // Mostrar loading mientras se cargan las fuentes
  if (!appIsReady) {
    return null; // O un componente de loading personalizado
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5DC', '#FAF9F6']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Menu size={28} color="#8B7355" />
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
              colors={['#FFFFFF', '#F8F8F5']}
              style={styles.descriptionCard}
            >
              <Text style={styles.sectionTitle}>Nuestro Cementerio</Text>
              <Text style={styles.description}>
                Como institución parroquial católica, hemos mantenido viva la tradición 
                cristiana de dar sepultura digna a nuestros hermanos, adaptándonos a los 
                tiempos modernos sin perder nuestra esencia espiritual y comunitaria. 
                Nuestro compromiso es preservar la memoria de quienes descansan aquí y 
                brindar consuelo a sus familias con servicios que honren su legado.
              </Text>
            </LinearGradient>
          </View>

          {/* Valores Institucionales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nuestros Valores</Text>
            <View style={styles.valuesContainer}>
              {valuesInfo.map((value, index) => (
                <View key={index} style={styles.valueCard}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F5F5F0']}
                    style={styles.valueGradient}
                  >
                    <View style={styles.valueIconContainer}>
                      <value.icon size={24} color="#8B7355" />
                    </View>
                    <Text style={styles.valueTitle}>{value.title}</Text>
                    <Text style={styles.valueDescription}>{value.description}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>

          {/* Modern Services Grid 2x2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.serviceCard} 
                  onPress={() => router.push(service.route as any)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[`${service.colors[0]}15`, `${service.colors[1]}08`]}
                    style={styles.serviceGradient}
                  >
                    <View style={styles.servicePattern} />
                    <View style={styles.serviceContent}>
                      <View style={[styles.serviceIconContainer, { backgroundColor: service.colors[0] }]}>
                        <service.icon size={22} color="#FFFFFF" />
                      </View>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                    </View>
                    <View style={[styles.serviceAccent, { backgroundColor: service.colors[0] }]} />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F8F5']}
              style={styles.scheduleCard}
            >
              <View style={styles.scheduleHeader}>
                <Clock size={24} color="#8B7355" />
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
              colors={['#E8E5E0', '#F5F5DC']}
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
                <MapPin size={20} color="#8B7355" />
                <Text style={styles.contactText}>La Concordia, Santo Domingo, Ecuador</Text>
                <Text style={styles.tapHint}>Toca para navegar</Text>
              </TouchableOpacity>
              
              {/* Botón de WhatsApp mejorado */}
              <TouchableOpacity 
                style={styles.whatsappButton}
                onPress={abrirWhatsApp}
                activeOpacity={0.8}
              >
                <View style={styles.whatsappIconContainer}>
                  <Text style={styles.whatsappIcon}>💬</Text>
                </View>
                <View style={styles.whatsappTextContainer}>
                  <Text style={styles.whatsappNumber}>+593 996344075</Text>
                  <Text style={styles.whatsappHint}>Toca para escribir por WhatsApp</Text>
                </View>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E2DB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#F5F5F0',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'TituloPrincipal',
    color: '#8B7355',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'TextoGeneral',
    color: '#9C8B6B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  descriptionCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0ECE6',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Titulos',
    color: '#8B7355',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    fontFamily: 'TextoGeneral',
    color: '#6B5B47',
    lineHeight: 24,
    textAlign: 'justify',
  },
  
  // ===== ESTILOS PARA VALORES =====
  valuesContainer: {
    gap: 12,
  },
  valueCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  valueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  valueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#8B735520',
  },
  valueTitle: {
    fontSize: 16,
    fontFamily: 'Titulos',
    color: '#8B7355',
    fontWeight: '600',
    marginBottom: 4,
    flex: 1,
  },
  valueDescription: {
    fontSize: 13,
    fontFamily: 'TextoGeneral',
    color: '#9C8B6B',
    lineHeight: 18,
    flex: 2,
  },

  // ===== ESTILOS PARA SERVICIOS GRID 2x2 =====
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  serviceGradient: {
    flex: 1,
    position: 'relative',
  },
  servicePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8B7355',
    borderStyle: 'dashed',
    margin: 8,
    borderRadius: 12,
  },
  serviceContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  serviceAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.8,
  },
  serviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  serviceTitle: {
    fontSize: 14,
    fontFamily: 'Titulos',
    color: '#3D3427',
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  serviceSubtitle: {
    fontSize: 11,
    fontFamily: 'TextoGeneral',
    color: '#6B5B47',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  serviceDescription: {
    fontSize: 10,
    fontFamily: 'TextoGeneral',
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  
  // Estilos de horarios
  scheduleCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F5E8',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E8',
  },
  scheduleDay: {
    fontSize: 16,
    fontFamily: 'TextoGeneral',
    color: '#4F5F4F',
    fontWeight: '600',
  },
  scheduleHours: {
    fontSize: 15,
    fontFamily: 'Titulos',
    color: '#6B7B6B',
  },
  contactCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E0DDD6',
  },
  contactTitle: {
    fontSize: 24,
    fontFamily: 'Titulos',
    color: '#5D4E37',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  contactText: {
    fontSize: 16,
    fontFamily: 'TextoGeneral',
    color: '#8B7355',
    flex: 1,
  },
  tapHint: {
    fontSize: 12,
    fontFamily: 'TextoGeneral',
    color: '#8B7355',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 100,
  },
  
  // ===== ESTILOS PARA EL MAPA =====
  mapContainer: {
    height: 200,
    marginVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#D2C5B0',
  },
  webView: {
    flex: 1,
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F0',
    borderRadius: 10,
  },
  mapFallbackText: {
    marginTop: 10,
    fontSize: 18,
    color: '#8B7355',
    textAlign: 'center',
    fontFamily: 'Titulos',
    fontWeight: '600',
  },
  mapFallbackSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#9C8B6B',
    textAlign: 'center',
    fontFamily: 'TextoGeneral',
  },
  openMapButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(139, 115, 85, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openMapText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'TextoGeneral',
    fontWeight: '600',
  },
  
  // ===== ESTILOS PARA WHATSAPP =====
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#25D366',
    elevation: 3,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  whatsappIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  whatsappIcon: {
    fontSize: 18,
  },
  whatsappTextContainer: {
    flex: 1,
  },
  whatsappNumber: {
    fontSize: 16,
    fontFamily: 'TextoGeneral',
    color: '#25D366',
    fontWeight: '600',
  },
  whatsappHint: {
    fontSize: 11,
    fontFamily: 'TextoGeneral',
    color: '#25D366',
    fontStyle: 'italic',
    marginTop: 2,
  },
});