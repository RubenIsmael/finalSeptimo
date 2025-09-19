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
              source={{ uri: 'https://th.bing.com/th/id/R.7c4dbe2d26b396233f56a2c0331c7831?rik=GrRtgcEBHCFiRA&riu=http%3a%2f%2f2.bp.blogspot.com%2f_EZ16vWYvHHg%2fS8oZ5dJ0ZWI%2fAAAAAAAAKgE%2fkSJmSc1W5zA%2fs1600%2fwww.BancodeImagenesGratuitas.com%2b-Flores-24.jpg&ehk=%2b7N%2bKBNgmkKG70m3itVOLFIK6c5WhS3fNzXBscxtJ58%3d&risl=&pid=ImgRaw&r=0' }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>Cementerio Parroquial San Agustín</Text>
              <Text style={styles.heroSubtitle}>Sirviendo con dignidad y respeto a las familias de La Concordia</Text>
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
                Brindar servicios funerarios integrales con dignidad, respeto y 
                profesionalismo, ofreciendo a las familias del cantón La Concordia 
                y la provincia de Santo Domingo de los Tsáchilas un espacio sagrado 
                de descanso eterno, con instalaciones dignas y atención compasiva, 
                respetando las tradiciones cristianas y culturales de nuestra comunidad.
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
                Ser reconocidos como el principal cementerio parroquial del cantón La 
                Concordia, destacando por la excelencia en nuestros servicios, la 
                preservación de la memoria histórica local, y nuestro compromiso con 
                la modernización tecnológica que facilite a las familias el acceso a 
                nuestros servicios, manteniendo siempre el respeto por las tradiciones 
                y valores espirituales de nuestra comunidad.
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
                El Cementerio Parroquial San Agustín ha sido parte fundamental de la 
                historia de La Concordia, acompañando a las familias de nuestra comunidad 
                a través de las generaciones. Desde la elevación de La Concordia a cantón 
                en 2007 y su posterior integración a la provincia de Santo Domingo de los 
                Tsáchilas en 2013, nuestro cementerio ha sido testigo del crecimiento y 
                desarrollo de esta tierra próspera. 
                {'\n\n'}
                Como institución parroquial católica, hemos mantenido viva la tradición 
                cristiana de dar sepultura digna a nuestros hermanos, adaptándonos a los 
                tiempos modernos sin perder nuestra esencia espiritual y comunitaria. 
                Nuestro compromiso es preservar la memoria de quienes descansan aquí y 
                brindar consuelo a sus familias con servicios que honren su legado.
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