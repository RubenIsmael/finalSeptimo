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
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ReservationsScreen() {
  const router = useRouter();

  const sectors = [
    {
      name: 'Sector A - Premium',
      price: '$2,000.00',
      description: 'Área privilegiada con jardines y fácil acceso',
      available: 3,
      features: ['Vista panorámica', 'Área ajardinada', 'Acceso vehicular'],
    },
    {
      name: 'Sector B - Estándar',
      price: '$1,500.00',
      description: 'Zona tranquila con buena accesibilidad',
      available: 8,
      features: ['Ambiente tranquilo', 'Senderos peatonales', 'Iluminación nocturna'],
    },
    {
      name: 'Sector C - Económico',
      price: '$1,000.00',
      description: 'Opción accesible con servicios básicos',
      available: 12,
      features: ['Servicios básicos', 'Mantenimiento incluido', 'Seguridad 24/7'],
    },
  ];

  const requirements = [
    'Cédula de identidad del solicitante',
    'Certificado de defunción (si aplica)',
    'Comprobante de ingresos o capacidad de pago',
    'Formulario de reserva completado',
    'Pago inicial del 30% del valor total',
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
          <Text style={styles.headerTitle}>Reservas de Bóvedas</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F8F8FF']}
              style={styles.introCard}
            >
              <View style={styles.introHeader}>
                <Calendar size={28} color="#4682B4" />
                <Text style={styles.introTitle}>Sistema de Reservas</Text>
              </View>
              <Text style={styles.introText}>
                Reserva una bóveda de manera sencilla y transparente. Nuestro sistema 
                digitalizado te permite conocer disponibilidad, precios y realizar 
                el proceso de reserva de forma eficiente y segura.
              </Text>
            </LinearGradient>
          </View>

          {/* Available Sectors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sectores Disponibles</Text>
            {sectors.map((sector, index) => (
              <View key={index} style={styles.sectorCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={styles.sectorGradient}
                >
                  <View style={styles.sectorHeader}>
                    <View style={styles.sectorTitleContainer}>
                      <Text style={styles.sectorName}>{sector.name}</Text>
                      <Text style={styles.sectorPrice}>{sector.price}</Text>
                    </View>
                    <View style={styles.availabilityBadge}>
                      <Text style={styles.availabilityText}>{sector.available} disponibles</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.sectorDescription}>{sector.description}</Text>
                  
                  <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>Características:</Text>
                    {sector.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Text style={styles.featureBullet}>•</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.reserveButton}>
                    <LinearGradient
                      colors={['#87A96B', '#5F7F3F']}
                      style={styles.reserveButtonGradient}
                    >
                      <MapPin size={18} color="#FFFFFF" />
                      <Text style={styles.reserveButtonText}>Reservar Ahora</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F5F5DC']}
              style={styles.requirementsCard}
            >
              <View style={styles.requirementsHeader}>
                <AlertCircle size={24} color="#DAA520" />
                <Text style={styles.requirementsTitle}>Requisitos para Reserva</Text>
              </View>
              {requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Text style={styles.requirementNumber}>{index + 1}.</Text>
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Process Steps */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.processCard}
            >
              <Text style={styles.processTitle}>Proceso de Reserva</Text>
              
              <View style={styles.processSteps}>
                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Consulta de Disponibilidad</Text>
                    <Text style={styles.stepDescription}>
                      Revisa los sectores disponibles y selecciona el que mejor se adapte a tus necesidades
                    </Text>
                  </View>
                </View>

                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Documentación</Text>
                    <Text style={styles.stepDescription}>
                      Presenta los documentos requeridos y completa el formulario de reserva
                    </Text>
                  </View>
                </View>

                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Pago Inicial</Text>
                    <Text style={styles.stepDescription}>
                      Realiza el pago del 30% del valor total para confirmar tu reserva
                    </Text>
                  </View>
                </View>

                <View style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Confirmación</Text>
                    <Text style={styles.stepDescription}>
                      Recibe tu contrato y documentación oficial de la reserva
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Contact CTA */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#4682B4', '#2F4F4F']}
              style={styles.ctaCard}
            >
              <Text style={styles.ctaTitle}>¿Necesitas más información?</Text>
              <Text style={styles.ctaText}>
                Nuestro equipo está disponible para asesorarte en la selección 
                de la bóveda que mejor se adapte a tus necesidades y presupuesto.
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/contact')}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8F8FF']}
                  style={styles.ctaButtonGradient}
                >
                  <Text style={styles.ctaButtonText}>Contactar Ahora</Text>
                </LinearGradient>
              </TouchableOpacity>
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
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 15,
  },
  introCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginTop: 10,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  introTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  introText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  sectorCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectorGradient: {
    padding: 18,
    borderRadius: 12,
  },
  sectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectorTitleContainer: {
    flex: 1,
  },
  sectorName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  sectorPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#87A96B',
  },
  availabilityBadge: {
    backgroundColor: '#87CEEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  sectorDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featuresTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  featureBullet: {
    fontSize: 14,
    color: '#87A96B',
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
  },
  reserveButton: {
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reserveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  reserveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  requirementsCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  requirementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  requirementsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  requirementNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#DAA520',
    minWidth: 20,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  processCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  processTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 20,
    textAlign: 'center',
  },
  processSteps: {
    gap: 20,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4682B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
  },
  ctaCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 10,
  },
  ctaButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  ctaButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  bottomPadding: {
    height: 50,
  },
});