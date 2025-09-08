import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  CreditCard, 
  DollarSign, 
  Clock, 
  Search,
  CircleCheck as CheckCircle, 
  TriangleAlert as AlertTriangle, 
  Calendar,
  User,
  Building,
  Smartphone
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface DebtInfo {
  clientName: string;
  cedula: string;
  totalDebt: number;
  nextPayment: number;
  dueDate: string;
  installments: Array<{
    number: number;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
  }>;
}

export default function PaymentsScreen() {
  const router = useRouter();
  const [cedula, setCedula] = useState('');
  const [debtInfo, setDebtInfo] = useState<DebtInfo | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Simulación de consulta a base de datos
  const consultarDeuda = async () => {
    if (!cedula || cedula.length < 10) {
      Alert.alert('Error', 'Por favor ingresa un número de cédula válido');
      return;
    }

    setLoading(true);
    
    // Simulación de delay de API
    setTimeout(() => {
      // Datos simulados - en producción esto vendría de tu API
      const mockData: DebtInfo = {
        clientName: 'Tarupi Zambrano Marlene',
        cedula: '1803985504',
        totalDebt: 255.00,
        nextPayment: 85.00,
        dueDate: '2025-04-11',
        installments: [
          { number: 1, amount: 85.00, dueDate: '2025-01-11', status: 'paid' },
          { number: 2, amount: 85.00, dueDate: '2025-02-11', status: 'paid' },
          { number: 3, amount: 85.00, dueDate: '2025-03-11', status: 'paid' },
          { number: 4, amount: 85.00, dueDate: '2025-04-11', status: 'pending' },
          { number: 5, amount: 85.00, dueDate: '2025-05-11', status: 'pending' },
        ]
      };
      
      setDebtInfo(mockData);
      setLoading(false);
    }, 1500);
  };

  const paymentMethods = [
    {
      id: 'transfer',
      method: 'Transferencia Bancaria',
      description: 'Banco Pichincha, Banco del Pacífico, Banco Guayaquil',
      icon: <Building size={24} color="#4682B4" />,
      available: true,
    },
    {
      id: 'card',
      method: 'Tarjeta de Crédito/Débito',
      description: 'Visa, MasterCard, American Express',
      icon: <CreditCard size={24} color="#4682B4" />,
      available: true,
    },
    {
      id: 'deuna',
      method: 'Pago con DEUNA',
      description: 'Plataforma de pagos segura y rápida',
      icon: <Smartphone size={24} color="#4682B4" />,
      available: true,
    },
  ];

  const handlePaymentSelect = (installmentNumber: number) => {
    setSelectedPayment(installmentNumber);
    setShowPaymentMethods(true);
  };

  const processPayment = (methodId: string) => {
    Alert.alert(
      'Procesar Pago',
      `¿Confirmas el pago de $${debtInfo?.nextPayment} mediante ${paymentMethods.find(m => m.id === methodId)?.method}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            // Aquí iría la lógica de procesamiento de pago
            Alert.alert('Éxito', 'Pago procesado correctamente');
            setShowPaymentMethods(false);
            setSelectedPayment(null);
          }
        }
      ]
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={28} color="#4682B4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión de Pagos</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.searchCard}
            >
              <View style={styles.searchHeader}>
                <User size={24} color="#4682B4" />
                <Text style={styles.searchTitle}>Consulta tu Estado de Cuenta</Text>
              </View>
              
              <Text style={styles.searchDescription}>
                Ingresa tu número de cédula para consultar tus pagos pendientes
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.cedulaInput}
                  placeholder="Número de cédula (ej: 1234567890)"
                  value={cedula}
                  onChangeText={setCedula}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={consultarDeuda}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#4682B4', '#2F4F4F']}
                    style={styles.searchButtonGradient}
                  >
                    <Search size={18} color="#FFFFFF" />
                    <Text style={styles.searchButtonText}>
                      {loading ? 'Consultando...' : 'Consultar'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Debt Information */}
          {debtInfo && (
            <View style={styles.section}>
              <LinearGradient
                colors={['#FFFFFF', '#F8F8FF']}
                style={styles.debtCard}
              >
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>Hola, {debtInfo.clientName}</Text>
                  <Text style={styles.clientRole}>Cliente</Text>
                </View>

                {/* Payment Summary */}
                <View style={styles.paymentSummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Último pago</Text>
                    <Text style={styles.summaryAmount}>$85.00</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Próximo pago</Text>
                    <Text style={[styles.summaryAmount, styles.nextPayment]}>
                      ${debtInfo.nextPayment.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Saldo</Text>
                    <Text style={styles.summaryAmount}>$0.00</Text>
                  </View>
                </View>

                {/* Payment Details */}
                <View style={styles.paymentDetails}>
                  <TouchableOpacity style={styles.detailsHeader}>
                    <Text style={styles.detailsTitle}>Detalle de facturación</Text>
                  </TouchableOpacity>

                  <View style={styles.detailsContent}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.tableHeaderText}>Facturas</Text>
                      <Text style={styles.tableHeaderText}>Total</Text>
                      <Text style={styles.tableHeaderText}>Por cobrar</Text>
                    </View>

                    {debtInfo.installments.map((installment, index) => (
                      <View key={index} style={styles.installmentRow}>
                        <View style={styles.installmentInfo}>
                          <Text style={styles.installmentTitle}>
                            Cuota {installment.number} - {installment.dueDate}
                          </Text>
                          <Text style={styles.installmentDate}>
                            📅 {installment.dueDate}
                          </Text>
                        </View>
                        <Text style={styles.installmentAmount}>
                          ${installment.amount.toFixed(2)}
                        </Text>
                        <View style={styles.paymentActions}>
                          {installment.status === 'paid' ? (
                            <Text style={styles.paidStatus}>Pagado</Text>
                          ) : (
                            <TouchableOpacity
                              style={styles.payButton}
                              onPress={() => handlePaymentSelect(installment.number)}
                            >
                              <Text style={styles.payButtonText}>Pagar</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Payment Methods Modal */}
          {showPaymentMethods && (
            <View style={styles.section}>
              <LinearGradient
                colors={['#FFFFFF', '#F0F8FF']}
                style={styles.paymentMethodsCard}
              >
                <Text style={styles.sectionTitle}>Métodos de Pago Disponibles</Text>
                <Text style={styles.paymentMethodsSubtitle}>
                  Selecciona tu método de pago preferido para la cuota {selectedPayment}
                </Text>
                
                {paymentMethods.map((method, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.methodCard}
                    onPress={() => processPayment(method.id)}
                  >
                    <LinearGradient
                      colors={['#FFFFFF', '#F8F8FF']}
                      style={styles.methodGradient}
                    >
                      <View style={styles.methodHeader}>
                        {method.icon}
                        <View style={styles.methodInfo}>
                          <Text style={styles.methodTitle}>{method.method}</Text>
                          <Text style={styles.methodDescription}>{method.description}</Text>
                        </View>
                        <View style={styles.statusAvailable}>
                          <Text style={styles.statusTextAvailable}>Disponible</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPaymentMethods(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

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
                    Conserva el comprobante de pago hasta completar todas las cuotas
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    El procesamiento del pago puede tomar hasta 24 horas hábiles
                  </Text>
                </View>
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
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 15,
  },
  
  // Search Section
  searchCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginTop: 10,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  searchTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  searchDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4682B4',
    marginBottom: 20,
  },
  inputContainer: {
    gap: 15,
  },
  cedulaInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: 'Inter-Regular',
  },
  searchButton: {
    borderRadius: 10,
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  
  // Debt Information
  debtCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  clientInfo: {
    marginBottom: 20,
  },
  clientName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  clientRole: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  paymentSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  nextPayment: {
    color: '#87A96B',
  },
  paymentDetails: {
    marginTop: 20,
  },
  detailsHeader: {
    marginBottom: 15,
  },
  detailsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  detailsContent: {
    gap: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    textAlign: 'center',
  },
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  installmentInfo: {
    flex: 1,
  },
  installmentTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  installmentDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  installmentAmount: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    textAlign: 'center',
  },
  paymentActions: {
    flex: 1,
    alignItems: 'center',
  },
  payButton: {
    backgroundColor: '#87A96B',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  paidStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#87A96B',
  },
  
  // Payment Methods
  paymentMethodsCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  paymentMethodsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
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
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  statusAvailable: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#87A96B',
  },
  statusTextAvailable: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  
  // Info Section
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
  bottomPadding: {
    height: 50,
  },
});