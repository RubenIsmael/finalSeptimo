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
import { ArrowLeft, CreditCard, DollarSign, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PaymentsScreen() {
  const router = useRouter();

  const paymentMethods = [
    {
      method: 'Efectivo',
      description: 'Pago en nuestras oficinas durante horarios de atención',
      icon: '💵',
      available: true,
    },
    {
      method: 'Transferencia Bancaria',
      description: 'Banco Pichincha, Banco del Pacífico, Banco Guayaquil',
      icon: '🏦',
      available: true,
    },
    {
      method: 'Tarjeta de Crédito/Débito',
      description: 'Visa, MasterCard, American Express',
      icon: '💳',
      available: true,
    },
    {
      method: 'Pago Móvil',
      description: 'Disponible próximamente a través de la app',
      icon: '📱',
      available: false,
    },
  ];

  const paymentPlans = [
    {
      title: 'Pago Único',
      discount: '10% de descuento',
      description: 'Pago completo al momento de la reserva',
      benefits: ['Mayor descuento', 'Sin intereses', 'Proceso más rápido'],
      color: '#87A96B',
    },
    {
      title: 'Plan 3 Meses',
      discount: '5% de descuento',
      description: '30% inicial + 2 cuotas mensuales',
      benefits: ['Descuento moderado', 'Flexibilidad de pago', 'Sin intereses'],
      color: '#4682B4',
    },
    {
      title: 'Plan 6 Meses',
      discount: 'Sin descuento',
      description: '30% inicial + 5 cuotas mensuales',
      benefits: ['Mayor flexibilidad', 'Cuotas más bajas', 'Interés preferencial 2%'],
      color: '#DAA520',
    },
    {
      title: 'Plan 12 Meses',
      discount: 'Interés 5%',
      description: '30% inicial + 11 cuotas mensuales',
      benefits: ['Máxima flexibilidad', 'Cuotas muy bajas', 'Plan extendido'],
      color: '#CD853F',
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
          <Text style={styles.headerTitle}>Gestión de Pagos</Text>
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
                <CreditCard size={28} color="#4682B4" />
                <Text style={styles.introTitle}>Sistema de Pagos</Text>
              </View>
              <Text style={styles.introText}>
                Ofrecemos múltiples opciones de pago y planes flexibles para que 
                puedas cumplir con tus compromisos de manera cómoda y segura. 
                Nuestro sistema te permite realizar consultas, pagos y llevar 
                un historial completo de tus transacciones.
              </Text>
            </LinearGradient>
          </View>

          {/* Payment Status Check */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.checkCard}
            >
              <Text style={styles.checkTitle}>Consulta tu Estado de Pagos</Text>
              <Text style={styles.checkDescription}>
                Ingresa tu número de cédula para consultar el estado de tus pagos
              </Text>
              <TouchableOpacity style={styles.checkButton}>
                <LinearGradient
                  colors={['#4682B4', '#2F4F4F']}
                  style={styles.checkButtonGradient}
                >
                  <Text style={styles.checkButtonText}>Consultar Estado</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métodos de Pago Disponibles</Text>
            {paymentMethods.map((method, index) => (
              <View key={index} style={styles.methodCard}>
                <LinearGradient
                  colors={method.available ? ['#FFFFFF', '#F0F8FF'] : ['#F5F5F5', '#E5E5E5']}
                  style={styles.methodGradient}
                >
                  <View style={styles.methodHeader}>
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <View style={styles.methodInfo}>
                      <Text style={[
                        styles.methodTitle,
                        !method.available && styles.methodTitleDisabled
                      ]}>
                        {method.method}
                      </Text>
                      <Text style={[
                        styles.methodDescription,
                        !method.available && styles.methodDescriptionDisabled
                      ]}>
                        {method.description}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      method.available ? styles.statusAvailable : styles.statusUnavailable
                    ]}>
                      <Text style={[
                        styles.statusText,
                        method.available ? styles.statusTextAvailable : styles.statusTextUnavailable
                      ]}>
                        {method.available ? 'Disponible' : 'Próximamente'}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Payment Plans */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planes de Pago</Text>
            {paymentPlans.map((plan, index) => (
              <View key={index} style={styles.planCard}>
                <LinearGradient
                  colors={['#FFFFFF', '#F8F8FF']}
                  style={styles.planGradient}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planTitleContainer}>
                      <Text style={styles.planTitle}>{plan.title}</Text>
                      <Text style={[styles.planDiscount, { color: plan.color }]}>
                        {plan.discount}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  
                  <View style={styles.benefitsContainer}>
                    <Text style={styles.benefitsTitle}>Beneficios:</Text>
                    {plan.benefits.map((benefit, idx) => (
                      <View key={idx} style={styles.benefitItem}>
                        <CheckCircle size={16} color={plan.color} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Important Information */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#FFF8DC']}
              style={styles.infoCard}
            >
              <View style={styles.infoHeader}>
                <AlertTriangle size={24} color="#DAA520" />
                <Text style={styles.infoTitle}>Información Importante</Text>
              </View>
              
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Los pagos vencidos generan un recargo del 2% mensual
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    El pago inicial del 30% debe realizarse dentro de 5 días hábiles
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Todos los pagos incluyen mantenimiento por 2 años
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Los comprobantes deben conservarse hasta completar el pago total
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Payment History */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#F0F8FF', '#FFFFFF']}
              style={styles.historyCard}
            >
              <View style={styles.historyHeader}>
                <Calendar size={24} color="#4682B4" />
                <Text style={styles.historyTitle}>Historial de Pagos</Text>
              </View>
              <Text style={styles.historyDescription}>
                Consulta tu historial completo de pagos realizados, fechas de vencimiento 
                y estado actual de tu cuenta.
              </Text>
              <TouchableOpacity style={styles.historyButton}>
                <LinearGradient
                  colors={['#4682B4', '#2F4F4F']}
                  style={styles.historyButtonGradient}
                >
                  <Clock size={18} color="#FFFFFF" />
                  <Text style={styles.historyButtonText}>Ver Historial</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Contact CTA */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87A96B', '#5F7F3F']}
              style={styles.ctaCard}
            >
              <Text style={styles.ctaTitle}>¿Tienes dudas sobre pagos?</Text>
              <Text style={styles.ctaText}>
                Nuestro equipo financiero está disponible para ayudarte con 
                consultas sobre métodos de pago, planes disponibles y resolución 
                de cualquier inconveniente.
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/contact')}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8F8FF']}
                  style={styles.ctaButtonGradient}
                >
                  <Text style={styles.ctaButtonText}>Contactar Soporte</Text>
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
  checkCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  checkTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 10,
    textAlign: 'center',
  },
  checkDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4682B4',
    textAlign: 'center',
    marginBottom: 20,
  },
  checkButton: {
    borderRadius: 10,
  },
  checkButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  checkButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  methodCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  methodGradient: {
    padding: 15,
    borderRadius: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  methodTitleDisabled: {
    color: '#999',
  },
  methodDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  methodDescriptionDisabled: {
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: '#87A96B',
  },
  statusUnavailable: {
    backgroundColor: '#CCC',
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  statusTextAvailable: {
    color: '#FFFFFF',
  },
  statusTextUnavailable: {
    color: '#666',
  },
  planCard: {
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planGradient: {
    padding: 18,
    borderRadius: 12,
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  planDiscount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  planDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 15,
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    marginBottom: 5,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
  },
  infoCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoBullet: {
    fontSize: 14,
    color: '#DAA520',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  historyCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  historyDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  historyButton: {
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  historyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    color: '#87A96B',
  },
  bottomPadding: {
    height: 50,
  },
});