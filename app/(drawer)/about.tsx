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
import { ArrowLeft, Heart, Users, Award, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

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
          <Text style={styles.headerTitle}>Quiénes Somos</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/2893685/pexels-photo-2893685.jpeg?auto=compress&cs=tinysrgb&w=800' }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Cementerio Parroquial San Agustín</Text>
              <Text style={styles.heroSubtitle}>Más de 12 años sirviendo a la comunidad</Text>
            </View>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F8FF']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Heart size={28} color="#87A96B" />
                <Text style={styles.cardTitle}>Nuestra Misión</Text>
              </View>
              <Text style={styles.cardContent}>
                Brindar servicios funerarios con dignidad, respeto y profesionalismo, 
                ofreciendo a las familias de La Concordia y Santo Domingo un lugar 
                sagrado de descanso eterno para sus seres queridos, con instalaciones 
                adecuadas y atención personalizada en momentos difíciles.
              </Text>
            </LinearGradient>
          </View>

          {/* Vision Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#F0F8FF', '#FFFFFF']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Award size={28} color="#4682B4" />
                <Text style={styles.cardTitle}>Nuestra Visión</Text>
              </View>
              <Text style={styles.cardContent}>
                Ser el cementerio de referencia en la región, reconocido por la calidad 
                de nuestros servicios, la modernización de nuestros procesos mediante 
                tecnología innovadora, y el compromiso constante con el bienestar de 
                las familias que confían en nosotros.
              </Text>
            </LinearGradient>
          </View>

          {/* Values Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F5F5DC']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Users size={28} color="#DAA520" />
                <Text style={styles.cardTitle}>Nuestros Valores</Text>
              </View>
              <View style={styles.valuesList}>
                <View style={styles.valueItem}>
                  <Text style={styles.valueBullet}>•</Text>
                  <Text style={styles.valueText}>
                    <Text style={styles.valueBold}>Respeto:</Text> Tratamos a cada familia con dignidad y comprensión.
                  </Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueBullet}>•</Text>
                  <Text style={styles.valueText}>
                    <Text style={styles.valueBold}>Profesionalismo:</Text> Servicios de alta calidad con personal capacitado.
                  </Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueBullet}>•</Text>
                  <Text style={styles.valueText}>
                    <Text style={styles.valueBold}>Transparencia:</Text> Información clara y honesta en todos nuestros procesos.
                  </Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueBullet}>•</Text>
                  <Text style={styles.valueText}>
                    <Text style={styles.valueBold}>Innovación:</Text> Incorporamos tecnología para mejorar nuestros servicios.
                  </Text>
                </View>
                <View style={styles.valueItem}>
                  <Text style={styles.valueBullet}>•</Text>
                  <Text style={styles.valueText}>
                    <Text style={styles.valueBold}>Compromiso Social:</Text> Apoyamos a nuestra comunidad en momentos difíciles.
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* History Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Clock size={28} color="#4682B4" />
                <Text style={styles.cardTitle}>Nuestra Historia</Text>
              </View>
              <Text style={styles.cardContent}>
                Establecido hace más de 12 años, el Cementerio Parroquial San Agustín 
                ha sido testigo del crecimiento de La Concordia y ha acompañado a 
                cientos de familias en sus momentos más difíciles. Con el paso del 
                tiempo, hemos evolucionado para adaptarnos a las necesidades cambiantes 
                de nuestra comunidad, manteniendo siempre nuestros valores fundamentales 
                de respeto y servicio.
              </Text>
            </LinearGradient>
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F0F8FF']}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Nuestros Servicios</Text>
              </View>
              <View style={styles.servicesList}>
                <Text style={styles.serviceItem}>🏛️ Bóvedas familiares en diferentes sectores</Text>
                <Text style={styles.serviceItem}>💒 Servicios funerarios completos</Text>
                <Text style={styles.serviceItem}>🌸 Mantenimiento y cuidado de sepulturas</Text>
                <Text style={styles.serviceItem}>📋 Gestión administrativa digitalizada</Text>
                <Text style={styles.serviceItem}>🤖 Asistencia virtual las 24 horas</Text>
                <Text style={styles.serviceItem}>💳 Múltiples opciones de pago</Text>
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
    height: 200,
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
    fontSize: 22,
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
  valuesList: {
    gap: 12,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  valueBullet: {
    fontSize: 16,
    color: '#DAA520',
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  valueBold: {
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
  },
  servicesList: {
    gap: 10,
  },
  serviceItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 50,
  },
});