import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Heart, Users, Hand as Hands, Gift, Calendar, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function CommunityScreen() {
  const router = useRouter();

  const programs = [
    {
      title: 'Apoyo a Familias en Duelo',
      description: 'Acompañamiento emocional y espiritual para familias que han perdido un ser querido.',
      icon: '💙',
      schedule: 'Disponible las 24 horas',
    },
    {
      title: 'Servicios Gratuitos para Personas de Escasos Recursos',
      description: 'Programa de asistencia social para familias con limitaciones económicas.',
      icon: '🤝',
      schedule: 'Previa evaluación social',
    },
    {
      title: 'Mantenimiento Comunitario',
      description: 'Jornadas de limpieza y mantenimiento con participación de la comunidad.',
      icon: '🌱',
      schedule: 'Primer sábado de cada mes',
    },
    {
      title: 'Eventos Conmemorativos',
      description: 'Ceremonias especiales en fechas importantes como Día de los Difuntos.',
      icon: '🕯️',
      schedule: 'Fechas especiales del calendario',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F5F5DC', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#4682B4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayuda Comunitaria</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800' }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Compromiso con la Comunidad</Text>
              <Text style={styles.heroSubtitle}>Juntos construimos un espacio de paz y solidaridad</Text>
            </View>
          </View>

          {/* Introduction */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F8FF']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Heart size={28} color="#87A96B" />
                <Text style={styles.cardTitle}>Nuestra Misión Social</Text>
              </View>
              <Text style={styles.cardContent}>
                En el Cementerio San Agustín creemos que el apoyo a la comunidad va más allá 
                de nuestros servicios funerarios. Nos comprometemos a ser un pilar de solidaridad 
                y esperanza para todas las familias de La Concordia, especialmente en momentos 
                de dificultad y pérdida.
              </Text>
            </LinearGradient>
          </View>

          {/* Programs Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Programas de Ayuda</Text>
            {programs.map((program, index) => (
              <View key={index} style={styles.programContainer}>
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={styles.programCard}
                >
                  <View style={styles.programHeader}>
                    <Text style={styles.programIcon}>{program.icon}</Text>
                    <View style={styles.programTitleContainer}>
                      <Text style={styles.programTitle}>{program.title}</Text>
                      <View style={styles.scheduleContainer}>
                        <Calendar size={14} color="#666" />
                        <Text style={styles.programSchedule}>{program.schedule}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.programDescription}>{program.description}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* How to Help Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Hands size={28} color="#4682B4" />
                <Text style={styles.cardTitle}>Cómo Puedes Ayudar</Text>
              </View>
              <View style={styles.helpList}>
                <View style={styles.helpItem}>
                  <Text style={styles.helpBullet}>🌟</Text>
                  <Text style={styles.helpText}>
                    Participa en nuestras jornadas de mantenimiento comunitario
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Text style={styles.helpBullet}>💐</Text>
                  <Text style={styles.helpText}>
                    Dona flores o plantas para embellecer nuestros espacios
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Text style={styles.helpBullet}>🤲</Text>
                  <Text style={styles.helpText}>
                    Colabora con nuestro fondo de ayuda para familias necesitadas
                  </Text>
                </View>
                <View style={styles.helpItem}>
                  <Text style={styles.helpBullet}>📢</Text>
                  <Text style={styles.helpText}>
                    Comparte información sobre nuestros programas con otros
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Testimonials Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F5F5DC']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Users size={28} color="#DAA520" />
                <Text style={styles.cardTitle}>Testimonios</Text>
              </View>
              
              <View style={styles.testimonial}>
                <Text style={styles.testimonialText}>
                  "Gracias al programa de apoyo del cementerio, pudimos darle una despedida 
                  digna a nuestra abuela. Su ayuda fue fundamental en nuestro momento más difícil."
                </Text>
                <Text style={styles.testimonialAuthor}>- Familia González</Text>
              </View>

              <View style={styles.testimonial}>
                <Text style={styles.testimonialText}>
                  "Las jornadas comunitarias nos han permitido mantener este lugar como un 
                  espacio hermoso y tranquilo para nuestros seres queridos."
                </Text>
                <Text style={styles.testimonialAuthor}>- María Rodríguez, Voluntaria</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Contact for Help */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87A96B', '#5F7F3F']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Gift size={28} color="#FFFFFF" />
                <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>
                  ¿Necesitas Ayuda?
                </Text>
              </View>
              <Text style={[styles.cardContent, { color: '#FFFFFF' }]}>
                Si tu familia está pasando por dificultades económicas o necesita 
                apoyo emocional, no dudes en contactarnos. Estamos aquí para ayudarte 
                con discreción y respeto.
              </Text>
              <View style={styles.contactButton}>
                <TouchableOpacity
                  style={styles.contactButtonTouchable}
                  onPress={() => router.push('/contact')}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F8FF']}
                    style={styles.contactButtonGradient}
                  >
                    <Text style={styles.contactButtonText}>Contactar Ahora</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  placeholder: {
    width: 38,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroContainer: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 10,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  cardContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  programContainer: {
    marginBottom: 15,
  },
  programCard: {
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  programIcon: {
    fontSize: 24,
  },
  programTitleContainer: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  programSchedule: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  programDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  helpList: {
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  helpBullet: {
    fontSize: 16,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4682B4',
    flex: 1,
    lineHeight: 20,
  },
  testimonial: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#DAA520',
  },
  testimonialText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 8,
  },
  testimonialAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    textAlign: 'right',
  },
  contactButton: {
    marginTop: 15,
  },
  contactButtonTouchable: {
    borderRadius: 10,
  },
  contactButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  bottomPadding: {
    height: 50,
  },
});