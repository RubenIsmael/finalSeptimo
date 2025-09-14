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
  ActivityIndicator,
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

// Interfaces para los datos de la base de datos
interface PaymentHistoryItem {
  Id: number;
  IdReserva: number;
  Monto: number;
  FechaPago: string;
  ReservaInfo?: {
    NombreFamiliar: string;
    ApellidoFamiliar: string;
    Sector: string;
  };
}

interface ClientPaymentInfo {
  clientName: string;
  cedula: string;
  totalPaid: number;
  pendingAmount: number;
  paymentHistory: PaymentHistoryItem[];
  reservaInfo?: {
    Id: number;
    EstadoPago: string;
    FechaReserva: string;
    Sector: string;
    PrecioValor: number;
  };
}

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Servicio de base de datos simplificado
class PaymentService {
  private async apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error);
      throw error;
    }
  }

  async getClientPaymentInfo(cedula: string): Promise<ClientPaymentInfo | null> {
    try {
      if (!/^\d{10}$/.test(cedula)) {
        throw new Error('Cédula inválida. Debe tener exactamente 10 dígitos');
      }

      const response = await this.apiRequest<{
        success: boolean;
        data?: ClientPaymentInfo;
        message: string;
      }>(`/pagos/cliente/${cedula}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo información de pagos del cliente:', error);
      throw error;
    }
  }

  async registrarPago(pago: {
    IdReserva: number;
    Monto: number;
    MetodoPago?: string;
  }): Promise<{success: boolean; message: string; pagoId?: number}> {
    try {
      const response = await this.apiRequest<{
        success: boolean;
        message: string;
        pagoId?: number;
      }>('/pagos', {
        method: 'POST',
        body: JSON.stringify({
          IdReserva: pago.IdReserva,
          Monto: pago.Monto,
          FechaPago: new Date().toISOString(),
          MetodoPago: pago.MetodoPago || 'No especificado'
        }),
      });
      
      return response;
    } catch (error) {
      console.error('Error registrando pago:', error);
      return {
        success: false,
        message: 'Error al conectar con el servidor'
      };
    }
  }
}

export default function PaymentsScreen() {
  const router = useRouter();
  const paymentService = new PaymentService();
  
  // Estados
  const [cedula, setCedula] = useState('');
  const [clientPaymentInfo, setClientPaymentInfo] = useState<ClientPaymentInfo | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Métodos de pago disponibles
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

  // Consultar información de pagos del cliente desde la base de datos
  const consultarPagos = async () => {
    if (!cedula || cedula.length < 10) {
      Alert.alert('Error', 'Por favor ingresa un número de cédula válido');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const paymentInfo = await paymentService.getClientPaymentInfo(cedula);
      
      if (paymentInfo) {
        setClientPaymentInfo(paymentInfo);
      } else {
        setError('No se encontró información de pagos para esta cédula');
        setClientPaymentInfo(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al consultar información de pagos';
      setError(errorMessage);
      setClientPaymentInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Manejar selección de pago
  const handlePaymentSelect = (amount: number) => {
    setSelectedAmount(amount);
    setShowPaymentMethods(true);
  };

  // Procesar pago
  const processPayment = async (methodId: string) => {
    if (!clientPaymentInfo || !selectedAmount) return;

    const methodName = paymentMethods.find(m => m.id === methodId)?.method;
    
    Alert.alert(
      'Procesar Pago',
      `¿Confirmas el pago de $${selectedAmount.toFixed(2)} mediante ${methodName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              setLoading(true);
              
              const result = await paymentService.registrarPago({
                IdReserva: clientPaymentInfo.reservaInfo!.Id,
                Monto: selectedAmount,
                MetodoPago: methodName
              });
              
              if (result.success) {
                Alert.alert('Éxito', 'Pago procesado correctamente');
                setShowPaymentMethods(false);
                setSelectedAmount(null);
                // Refrescar información de pagos
                await consultarPagos();
              } else {
                Alert.alert('Error', result.message || 'Error al procesar el pago');
              }
            } catch (err) {
              Alert.alert('Error', 'Error al procesar el pago');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Reintentar consulta
  const retryConsulta = () => {
    setError(null);
    consultarPagos();
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
                Ingresa tu número de cédula para consultar tu historial de pagos
              </Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.cedulaInput}
                  placeholder="Número de cédula (ej: 1234567890)"
                  value={cedula}
                  onChangeText={setCedula}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={!loading}
                />
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={consultarPagos}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#4682B4', '#2F4F4F']}
                    style={styles.searchButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size={18} color="#FFFFFF" />
                    ) : (
                      <Search size={18} color="#FFFFFF" />
                    )}
                    <Text style={styles.searchButtonText}>
                      {loading ? 'Consultando...' : 'Consultar'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Loading State */}
          {loading && !clientPaymentInfo && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4682B4" />
              <Text style={styles.loadingText}>Consultando información...</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.section}>
              <LinearGradient
                colors={['#FFFFFF', '#FFF0F0']}
                style={styles.errorContainer}
              >
                <AlertTriangle size={24} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={retryConsulta}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* Client Payment Information */}
          {clientPaymentInfo && (
            <View style={styles.section}>
              <LinearGradient
                colors={['#FFFFFF', '#F8F8FF']}
                style={styles.debtCard}
              >
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>Hola, {clientPaymentInfo.clientName}</Text>
                  <Text style={styles.clientRole}>Cliente</Text>
                </View>

                {/* Payment Summary */}
                <View style={styles.paymentSummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Pagado</Text>
                    <Text style={styles.summaryAmount}>
                      ${clientPaymentInfo.totalPaid.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Saldo Pendiente</Text>
                    <Text style={[styles.summaryAmount, styles.nextPayment]}>
                      ${clientPaymentInfo.pendingAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Estado</Text>
                    <Text style={styles.summaryAmount}>
                      {clientPaymentInfo.reservaInfo?.EstadoPago || 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Payment History */}
                <View style={styles.paymentDetails}>
                  <View style={styles.detailsHeader}>
                    <Text style={styles.detailsTitle}>Historial de Pagos</Text>
                  </View>

                  <View style={styles.detailsContent}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.tableHeaderText}>Fecha</Text>
                      <Text style={styles.tableHeaderText}>Monto</Text>
                      <Text style={styles.tableHeaderText}>Estado</Text>
                    </View>

                    {clientPaymentInfo.paymentHistory.length > 0 ? (
                      clientPaymentInfo.paymentHistory.map((payment) => (
                        <View key={payment.Id} style={styles.installmentRow}>
                          <View style={styles.installmentInfo}>
                            <Text style={styles.installmentTitle}>
                              Pago #{payment.Id}
                            </Text>
                            <Text style={styles.installmentDate}>
                              📅 {formatDate(payment.FechaPago)}
                            </Text>
                          </View>
                          <Text style={styles.installmentAmount}>
                            ${payment.Monto.toFixed(2)}
                          </Text>
                          <View style={styles.paymentActions}>
                            <Text style={styles.paidStatus}>Pagado</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                          No hay pagos registrados
                        </Text>
                      </View>
                    )}

                    {/* Opción para nuevo pago si hay saldo pendiente */}
                    {clientPaymentInfo.pendingAmount > 0 && (
                      <View style={styles.installmentRow}>
                        <View style={styles.installmentInfo}>
                          <Text style={styles.installmentTitle}>
                            Realizar Pago
                          </Text>
                          <Text style={styles.installmentDate}>
                            Saldo pendiente disponible
                          </Text>
                        </View>
                        <Text style={styles.installmentAmount}>
                          ${clientPaymentInfo.pendingAmount.toFixed(2)}
                        </Text>
                        <View style={styles.paymentActions}>
                          <TouchableOpacity
                            style={styles.payButton}
                            onPress={() => handlePaymentSelect(clientPaymentInfo.pendingAmount)}
                          >
                            <Text style={styles.payButtonText}>Pagar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
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
                  Selecciona tu método de pago preferido para ${selectedAmount?.toFixed(2)}
                </Text>
                
                {paymentMethods.map((method, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.methodCard}
                    onPress={() => processPayment(method.id)}
                    disabled={loading}
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
                  disabled={loading}
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
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Para consultas adicionales, contacta al cementerio San Agustín
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
  
  // Loading and Error States
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D32F2F',
    textAlign: 'center',
    marginVertical: 10,
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#4682B4',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
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
    fontFamily: 'Inter-SemiBold',
    color: '#87A96B',
    backgroundColor: '#F0F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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