import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Calendar, CreditCard, Search, Clock, MapPin, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import ImageCarousel from '@/components/ImageCarousel';
import ActionButton from '@/components/ActionButton';
import FloatingChatBot from '@/components/FloatingChatBot';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const actionButtons = [
    {
      title: 'Reservas',
      colors: ['#87A96B', '#5F7F3F'] as const,
      icon: <Calendar size={22} color="#333333" />,
      route: '/reservations',
    },
    {
      title: 'Pagos',
      colors: ['#DAA520', '#B8860B'] as const,
      icon: <CreditCard size={22} color="#333333" />,
      route: '/payments',
    },
    {
      title: 'Consultas',
      colors: ['#4682B4', '#2F4F4F'] as const,
      icon: <Search size={22} color="#333333" />,
      route: '/consultations',
    },
  ];

  const scheduleInfo = [
    { day: 'Lunes - Viernes', hours: '8:00 AM - 5:00 PM' },
    { day: 'Sábados', hours: '8:00 AM - 2:00 PM' },
    { day: 'Domingos', hours: '9:00 AM - 1:00 PM' },
    { day: 'Feriados', hours: 'Cerrado' },
  ];

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

          {/* Action Buttons - Horizontal Layout */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalButtonContainer}
              style={styles.buttonScrollView}
            >
              {actionButtons.map((button, index) => (
                <ActionButton
                  key={index}
                  title={button.title}
                  colors={button.colors}
                  icon={button.icon}
                  onPress={() => router.push(button.route as any)}
                  style={styles.horizontalActionButton}
                />
              ))}
            </ScrollView>
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

          {/* Contact Information */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.contactCard}
            >
              <Text style={styles.contactTitle}>Información de Contacto</Text>
              <View style={styles.contactItem}>
                <MapPin size={20} color="#4682B4" />
                <Text style={styles.contactText}>La Concordia, Santo Domingo, Ecuador</Text>
              </View>
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
  // Estilos para los botones horizontales
  buttonScrollView: {
    marginVertical: 10,
  },
  horizontalButtonContainer: {
    paddingHorizontal: 5,
    gap: 15,
  },
  horizontalActionButton: {
    width: 140,
    marginHorizontal: 5,
  },
  // Estilos existentes que mantienes
  buttonGrid: {
    gap: 15,
  },
  actionButton: {
    marginVertical: 5,
  },
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
  bottomPadding: {
    height: 100,
  },
});