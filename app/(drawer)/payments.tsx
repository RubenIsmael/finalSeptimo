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
  Modal,
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
  Smartphone,
  Upload,
  QrCode,
  FileText,
  Camera,
  X,
  Home,
  RefreshCw
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

interface BankInfo {
  name: string;
  accountNumber: string;
  accountType: string;
}

interface CreditCardInfo {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
}

interface PaymentPlan {
  monthlyAmount: number;
  months: number;
  totalAmount: number;
}

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Configuración de pagos
const PAYMENT_CONFIG = {
  MIN_PAYMENT_AMOUNT: 50, // Monto mínimo de pago
  MAX_MONTHS_TO_DEFER: 12, // Máximo 12 meses para diferir
  MIN_MONTHLY_PAYMENT: 25, // Cuota mínima mensual
};

// Servicio de base de datos expandido
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
    TipoAbono?: string;
    ComprobanteRuta?: string;
    EstadoAprobacion?: string;
  }): Promise<{success: boolean; message: string; pagoId?: number; newStatus?: string}> {
    try {
      const response = await this.apiRequest<{
        success: boolean;
        message: string;
        pagoId?: number;
        newStatus?: string;
      }>('/pagos', {
        method: 'POST',
        body: JSON.stringify({
          IdReserva: pago.IdReserva,
          Monto: pago.Monto,
          FechaPago: new Date().toISOString(),
          MetodoPago: pago.MetodoPago || 'No especificado',
          TipoAbono: pago.TipoAbono || 'Abono',
          ComprobanteRuta: pago.ComprobanteRuta || null,
          EstadoAprobacion: pago.EstadoAprobacion || 'Pendiente'
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

  async actualizarEstadoReserva(idReserva: number, nuevoEstado: string): Promise<{success: boolean; message: string}> {
    try {
      const response = await this.apiRequest<{
        success: boolean;
        message: string;
      }>(`/reservas/${idReserva}/estado`, {
        method: 'PUT',
        body: JSON.stringify({
          EstadoPago: nuevoEstado
        }),
      });
      
      return response;
    } catch (error) {
      console.error('Error actualizando estado de reserva:', error);
      return {
        success: false,
        message: 'Error al actualizar estado'
      };
    }
  }

  async procesarTarjetaCredito(tarjeta: CreditCardInfo, monto: number): Promise<{success: boolean; message: string}> {
    // Simulación de procesamiento de tarjeta de crédito
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay de procesamiento
      
      // Validación básica de tarjeta (simulada)
      if (tarjeta.number.length < 16 || tarjeta.cvv.length < 3) {
        return {
          success: false,
          message: 'Datos de tarjeta inválidos'
        };
      }

      // Simular aprobación (90% de probabilidad de éxito)
      const isApproved = Math.random() > 0.1;
      
      if (isApproved) {
        return {
          success: true,
          message: 'Pago procesado exitosamente'
        };
      } else {
        return {
          success: false,
          message: 'Transacción rechazada por el banco'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error en el procesamiento'
      };
    }
  }
}

export default function PaymentsScreen() {
  const router = useRouter();
  const paymentService = new PaymentService();
  
  // Estados existentes
  const [cedula, setCedula] = useState('');
  const [clientPaymentInfo, setClientPaymentInfo] = useState<ClientPaymentInfo | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nuevos estados para las funcionalidades expandidas
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [showCreditCard, setShowCreditCard] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [creditCardData, setCreditCardData] = useState<CreditCardInfo>({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Información de bancos
  const banksInfo: BankInfo[] = [
    {
      name: 'Banco Pichincha',
      accountNumber: '2100123456',
      accountType: 'Cuenta Corriente'
    },
    {
      name: 'Produbanco',
      accountNumber: '0210987654',
      accountType: 'Cuenta de Ahorros'
    },
    {
      name: 'Banco del Pacífico',
      accountNumber: '1500567890',
      accountType: 'Cuenta Corriente'
    },
    {
      name: 'Banco Guayaquil',
      accountNumber: '0120345678',
      accountType: 'Cuenta de Ahorros'
    }
  ];

  // Métodos de pago actualizados
  const paymentMethods = [
    {
      id: 'transfer',
      method: 'Transferencia Bancaria',
      description: 'Banco Pichincha, Produbanco, Pacífico, Guayaquil',
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
      id: 'qr',
      method: 'QR Banco Pichincha',
      description: 'Escanea el código QR para pagar',
      icon: <QrCode size={24} color="#4682B4" />,
      available: true,
    },
    {
      id: 'receipt',
      method: 'Subir Comprobante',
      description: 'Sube tu comprobante de pago',
      icon: <Upload size={24} color="#4682B4" />,
      available: true,
    },
  ];

  // Función para calcular plan de pagos
  const calculatePaymentPlan = (totalAmount: number, months: number): PaymentPlan => {
    const monthlyAmount = Math.ceil(totalAmount / months);
    return {
      monthlyAmount,
      months,
      totalAmount: monthlyAmount * months
    };
  };

  // Función para validar monto de pago
  const validatePaymentAmount = (amount: number): { isValid: boolean; message?: string } => {
    if (amount < PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT) {
      return {
        isValid: false,
        message: `El monto mínimo de pago es $${PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT}`
      };
    }

    if (clientPaymentInfo && amount > clientPaymentInfo.pendingAmount) {
      return {
        isValid: false,
        message: `El monto no puede ser mayor al saldo pendiente ($${clientPaymentInfo.pendingAmount.toFixed(2)})`
      };
    }

    return { isValid: true };
  };

  // Función para regresar al inicio y refrescar
  const returnToHome = () => {
    resetModals();
    setCedula('');
    setClientPaymentInfo(null);
    setError(null);
    router.replace('/'); // Regresar a la página inicial
  };

  // Función para refrescar consulta actual
  const refreshCurrentConsultation = async () => {
    if (cedula) {
      await consultarPagos();
    }
  };

  // Funciones existentes
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

  const handlePaymentSelect = (amount: number) => {
    setSelectedAmount(amount);
    setShowPaymentMethods(true);
  };

  const retryConsulta = () => {
    setError(null);
    consultarPagos();
  };

  // Estados para controlar el método seleccionado
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Nuevas funciones para las funcionalidades expandidas
  const handleMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setShowPaymentMethods(false);
    setShowPaymentPlan(true);
  };

  const handlePaymentPlanConfirm = () => {
    if (!paymentPlan || !selectedPaymentMethod) {
      Alert.alert('Error', 'Por favor configure el monto y seleccione los meses');
      return;
    }

    setShowPaymentPlan(false);
    
    switch (selectedPaymentMethod) {
      case 'transfer':
        setShowBankTransfer(true);
        break;
      case 'card':
        setShowCreditCard(true);
        break;
      case 'qr':
        setShowQRCode(true);
        break;
      case 'receipt':
        setShowReceiptUpload(true);
        break;
    }
  };

  const processBankTransfer = async () => {
    if (!selectedBank || !customAmount) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const amount = parseFloat(customAmount);
    const validation = validatePaymentAmount(amount);
    
    if (!validation.isValid) {
      Alert.alert('Error', validation.message!);
      return;
    }

    Alert.alert(
      'Transferencia Bancaria',
      `Se procesará tu abono temporal de $${amount.toFixed(2)} a ${selectedBank.name}. El pago se actualizará una vez que nuestros administradores verifiquen la transferencia (máximo 4 horas hábiles).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          onPress: async () => {
            try {
              setProcessingPayment(true);
              
              const result = await paymentService.registrarPago({
                IdReserva: clientPaymentInfo!.reservaInfo!.Id,
                Monto: amount,
                MetodoPago: `Transferencia - ${selectedBank.name}`,
                TipoAbono: 'Abono Temporal',
                EstadoAprobacion: 'Pendiente'
              });
              
              if (result.success) {
                // Verificar si se completó el pago total
                const newPendingAmount = clientPaymentInfo!.pendingAmount - amount;
                if (newPendingAmount <= 0) {
                  await paymentService.actualizarEstadoReserva(
                    clientPaymentInfo!.reservaInfo!.Id, 
                    'Pago Completo'
                  );
                }

                Alert.alert(
                  'Abono Registrado', 
                  'Tu abono temporal ha sido registrado. Se actualizará tu saldo una vez verificada la transferencia.',
                  [
                    {
                      text: 'Ver Estado Actualizado',
                      onPress: () => {
                        resetModals();
                        refreshCurrentConsultation();
                      }
                    },
                    {
                      text: 'Volver al Inicio',
                      onPress: returnToHome
                    }
                  ]
                );
              } else {
                Alert.alert('Error', result.message || 'Error al procesar el abono');
              }
            } catch (err) {
              Alert.alert('Error', 'Error al procesar el abono');
            } finally {
              setProcessingPayment(false);
            }
          }
        }
      ]
    );
  };

  const processCreditCard = async () => {
    if (!creditCardData.number || !creditCardData.expiry || !creditCardData.cvv || !creditCardData.name || !customAmount) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const amount = parseFloat(customAmount);
    const validation = validatePaymentAmount(amount);
    
    if (!validation.isValid) {
      Alert.alert('Error', validation.message!);
      return;
    }

    try {
      setProcessingPayment(true);
      
      const cardResult = await paymentService.procesarTarjetaCredito(creditCardData, amount);
      
      if (cardResult.success) {
        const result = await paymentService.registrarPago({
          IdReserva: clientPaymentInfo!.reservaInfo!.Id,
          Monto: amount,
          MetodoPago: 'Tarjeta de Crédito',
          TipoAbono: 'Pago Directo',
          EstadoAprobacion: 'Aprobado'
        });
        
        if (result.success) {
          // Verificar si se completó el pago total
          const newPendingAmount = clientPaymentInfo!.pendingAmount - amount;
          if (newPendingAmount <= 0) {
            await paymentService.actualizarEstadoReserva(
              clientPaymentInfo!.reservaInfo!.Id, 
              'Sin Deuda'
            );
          }

          Alert.alert(
            'Pago Exitoso', 
            'Tu pago con tarjeta de crédito ha sido procesado exitosamente.',
            [
              {
                text: 'Ver Estado Actualizado',
                onPress: () => {
                  resetModals();
                  refreshCurrentConsultation();
                }
              },
              {
                text: 'Volver al Inicio',
                onPress: returnToHome
              }
            ]
          );
        }
      } else {
        Alert.alert('Error', cardResult.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Error al procesar el pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  const processQRPayment = async () => {
    if (!customAmount) {
      Alert.alert('Error', 'Por favor ingresa el monto a pagar');
      return;
    }

    const amount = parseFloat(customAmount);
    const validation = validatePaymentAmount(amount);
    
    if (!validation.isValid) {
      Alert.alert('Error', validation.message!);
      return;
    }

    Alert.alert(
      'Pago con QR',
      `Una vez realizado el pago por $${amount.toFixed(2)}, tu abono será registrado temporalmente hasta la verificación por nuestros administradores (máximo 4 horas hábiles).`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar Pago', 
          onPress: async () => {
            try {
              setProcessingPayment(true);
              
              const result = await paymentService.registrarPago({
                IdReserva: clientPaymentInfo!.reservaInfo!.Id,
                Monto: amount,
                MetodoPago: 'QR Banco Pichincha',
                TipoAbono: 'Abono Temporal',
                EstadoAprobacion: 'Pendiente'
              });
              
              if (result.success) {
                Alert.alert(
                  'Abono Registrado', 
                  'Tu abono temporal ha sido registrado. Se actualizará tu saldo una vez verificado el pago.',
                  [
                    {
                      text: 'Ver Estado Actualizado',
                      onPress: () => {
                        resetModals();
                        refreshCurrentConsultation();
                      }
                    },
                    {
                      text: 'Volver al Inicio',
                      onPress: returnToHome
                    }
                  ]
                );
              }
            } catch (err) {
              Alert.alert('Error', 'Error al procesar el abono');
            } finally {
              setProcessingPayment(false);
            }
          }
        }
      ]
    );
  };

  const pickReceipt = async () => {
    try {
      // Simulación de selección de imagen - sin dependencias externas
      Alert.alert(
        'Seleccionar Comprobante',
        'Selecciona una opción:',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Cámara',
            onPress: () => {
              // Simular imagen de cámara
              setSelectedReceipt({
                uri: 'simulated_camera_image',
                type: 'image',
                name: 'comprobante_camara.jpg'
              });
            }
          },
          {
            text: 'Galería',
            onPress: () => {
              // Simular imagen de galería
              setSelectedReceipt({
                uri: 'simulated_gallery_image',
                type: 'image',
                name: 'comprobante_galeria.jpg'
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const uploadReceipt = async () => {
    if (!selectedReceipt || !customAmount) {
      Alert.alert('Error', 'Por favor selecciona un comprobante e ingresa el monto');
      return;
    }

    const amount = parseFloat(customAmount);
    const validation = validatePaymentAmount(amount);
    
    if (!validation.isValid) {
      Alert.alert('Error', validation.message!);
      return;
    }

    try {
      setProcessingPayment(true);
      
      // Simular guardado del comprobante en la ruta especificada
      const receiptPath = `C:\\projecto_septimoFinal\\Capturas\\comprobante_${Date.now()}.jpg`;
      
      const result = await paymentService.registrarPago({
        IdReserva: clientPaymentInfo!.reservaInfo!.Id,
        Monto: amount,
        MetodoPago: 'Comprobante Subido',
        TipoAbono: 'Abono Temporal',
        ComprobanteRuta: receiptPath,
        EstadoAprobacion: 'Pendiente'
      });
      
      if (result.success) {
        Alert.alert(
          'Comprobante Subido', 
          'Tu comprobante ha sido subido exitosamente. Se actualizará tu pago al momento de que uno de nuestros administradores realice la comprobación (máximo 4 horas hábiles).',
          [
            {
              text: 'Ver Estado Actualizado',
              onPress: () => {
                resetModals();
                refreshCurrentConsultation();
              }
            },
            {
              text: 'Volver al Inicio',
              onPress: returnToHome
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Error al subir el comprobante');
    } finally {
      setProcessingPayment(false);
    }
  };

  const resetModals = () => {
    setShowPaymentMethods(false);
    setShowPaymentPlan(false);
    setShowBankTransfer(false);
    setShowCreditCard(false);
    setShowQRCode(false);
    setShowReceiptUpload(false);
    setCustomAmount('');
    setSelectedMonths(1);
    setPaymentPlan(null);
    setSelectedBank(null);
    setSelectedPaymentMethod('');
    setCreditCardData({
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    });
    setSelectedReceipt(null);
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
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={refreshCurrentConsultation} style={styles.refreshButton}>
              <RefreshCw size={24} color="#4682B4" />
            </TouchableOpacity>
            <TouchableOpacity onPress={returnToHome} style={styles.homeButton}>
              <Home size={24} color="#4682B4" />
            </TouchableOpacity>
          </View>
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

                {/* Payment Policy Info */}
                <View style={styles.policyInfo}>
                  <Text style={styles.policyTitle}>Política de Pagos</Text>
                  <Text style={styles.policyText}>
                    • Monto mínimo de pago: ${PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT}
                  </Text>
                  <Text style={styles.policyText}>
                    • Máximo de meses a diferir: {PAYMENT_CONFIG.MAX_MONTHS_TO_DEFER} meses
                  </Text>
                  <Text style={styles.policyText}>
                    • Cuota mínima mensual: ${PAYMENT_CONFIG.MIN_MONTHLY_PAYMENT}
                  </Text>
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
          <Modal
            visible={showPaymentMethods}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPaymentMethods(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={styles.paymentMethodsCard}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.sectionTitle}>Métodos de Pago Disponibles</Text>
                    <TouchableOpacity 
                      onPress={() => setShowPaymentMethods(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.paymentMethodsSubtitle}>
                    Selecciona tu método de pago preferido para ${selectedAmount?.toFixed(2)}
                  </Text>
                  
                  {paymentMethods.map((method, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.methodCard}
                      onPress={() => handleMethodSelect(method.id)}
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
                </LinearGradient>
              </View>
            </View>
          </Modal>

          {/* Payment Plan Modal */}
          <Modal
            visible={showPaymentPlan}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowPaymentPlan(false)}
          >
            <View style={styles.modalOverlay}>
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F0F8FF']}
                    style={styles.planCard}
                  >
                    <View style={styles.modalHeader}>
                      <Text style={styles.sectionTitle}>Plan de Pagos</Text>
                      <TouchableOpacity 
                        onPress={() => setShowPaymentPlan(false)}
                        style={styles.closeButton}
                      >
                        <X size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.planSubtitle}>
                      Configura el monto y plazo para tu pago
                    </Text>

                    <View style={styles.amountInput}>
                      <Text style={styles.inputLabel}>Monto a pagar:</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={`Mínimo $${PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT}`}
                        value={customAmount}
                        onChangeText={(text) => {
                          setCustomAmount(text);
                          const amount = parseFloat(text);
                          if (!isNaN(amount) && amount >= PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT) {
                            const plan = calculatePaymentPlan(amount, selectedMonths);
                            setPaymentPlan(plan);
                          } else {
                            setPaymentPlan(null);
                          }
                        }}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.monthsSection}>
                      <Text style={styles.inputLabel}>Meses a diferir (máximo {PAYMENT_CONFIG.MAX_MONTHS_TO_DEFER}):</Text>
                      <View style={styles.monthsContainer}>
                        {Array.from({length: PAYMENT_CONFIG.MAX_MONTHS_TO_DEFER}, (_, i) => i + 1).map((month) => (
                          <TouchableOpacity
                            key={month}
                            style={[
                              styles.monthButton,
                              selectedMonths === month && styles.selectedMonthButton
                            ]}
                            onPress={() => {
                              setSelectedMonths(month);
                              const amount = parseFloat(customAmount);
                              if (!isNaN(amount) && amount >= PAYMENT_CONFIG.MIN_PAYMENT_AMOUNT) {
                                const plan = calculatePaymentPlan(amount, month);
                                setPaymentPlan(plan);
                              }
                            }}
                          >
                            <Text style={[
                              styles.monthButtonText,
                              selectedMonths === month && styles.selectedMonthButtonText
                            ]}>
                              {month}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {paymentPlan && (
                      <View style={styles.planSummary}>
                        <Text style={styles.planSummaryTitle}>Resumen del Plan:</Text>
                        <Text style={styles.planSummaryText}>
                          Monto total: ${paymentPlan.totalAmount.toFixed(2)}
                        </Text>
                        <Text style={styles.planSummaryText}>
                          Cuota mensual: ${paymentPlan.monthlyAmount.toFixed(2)}
                        </Text>
                        <Text style={styles.planSummaryText}>
                          Duración: {paymentPlan.months} meses
                        </Text>
                      </View>
                    )}

                    <View style={styles.planButtons}>
                      <TouchableOpacity
                        style={[styles.processButton, {marginBottom: 10}]}
                        onPress={handlePaymentPlanConfirm}
                        disabled={!paymentPlan}
                      >
                        <LinearGradient
                          colors={['#4682B4', '#2F4F4F']}
                          style={styles.processButtonGradient}
                        >
                          <Text style={styles.processButtonText}>
                            Continuar con {selectedPaymentMethod === 'transfer' ? 'Transferencia' : 
                                         selectedPaymentMethod === 'card' ? 'Tarjeta' :
                                         selectedPaymentMethod === 'qr' ? 'QR' : 'Comprobante'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* Bank Transfer Modal */}
          <Modal
            visible={showBankTransfer}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowBankTransfer(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={styles.transferCard}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.sectionTitle}>Transferencia Bancaria</Text>
                    <TouchableOpacity 
                      onPress={() => setShowBankTransfer(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.transferSubtitle}>
                    Selecciona el banco para realizar tu transferencia por ${customAmount}
                  </Text>

                  <Text style={styles.bankSectionTitle}>Selecciona el banco:</Text>
                  
                  {banksInfo.map((bank, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.bankCard,
                        selectedBank?.name === bank.name && styles.selectedBankCard
                      ]}
                      onPress={() => setSelectedBank(bank)}
                    >
                      <View style={styles.bankInfo}>
                        <Text style={styles.bankName}>{bank.name}</Text>
                        <Text style={styles.accountInfo}>
                          {bank.accountType}: {bank.accountNumber}
                        </Text>
                        <Text style={styles.beneficiaryInfo}>
                          Beneficiario: Cementerio San Agustín
                        </Text>
                        <Text style={styles.referenceInfo}>
                          Referencia: Pago Cementerio - Cédula {cedula}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.processButton}
                    onPress={processBankTransfer}
                    disabled={processingPayment}
                  >
                    <LinearGradient
                      colors={['#4682B4', '#2F4F4F']}
                      style={styles.processButtonGradient}
                    >
                      {processingPayment ? (
                        <ActivityIndicator size={18} color="#FFFFFF" />
                      ) : (
                        <Building size={18} color="#FFFFFF" />
                      )}
                      <Text style={styles.processButtonText}>
                        {processingPayment ? 'Procesando...' : 'Registrar Transferencia'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </Modal>

          {/* Credit Card Modal */}
          <Modal
            visible={showCreditCard}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCreditCard(false)}
          >
            <View style={styles.modalOverlay}>
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F0F8FF']}
                    style={styles.cardPaymentCard}
                  >
                    <View style={styles.modalHeader}>
                      <Text style={styles.sectionTitle}>Pago con Tarjeta</Text>
                      <TouchableOpacity 
                        onPress={() => setShowCreditCard(false)}
                        style={styles.closeButton}
                      >
                        <X size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.cardSubtitle}>
                      Monto a pagar: ${customAmount}
                    </Text>

                    <View style={styles.cardForm}>
                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Número de tarjeta:</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="1234 5678 9012 3456"
                          value={creditCardData.number}
                          onChangeText={(text) => setCreditCardData({...creditCardData, number: text})}
                          keyboardType="numeric"
                          maxLength={19}
                        />
                      </View>

                      <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                          <Text style={styles.inputLabel}>Fecha de vencimiento:</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="MM/AA"
                            value={creditCardData.expiry}
                            onChangeText={(text) => setCreditCardData({...creditCardData, expiry: text})}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                        </View>

                        <View style={styles.formGroupHalf}>
                          <Text style={styles.inputLabel}>CVV:</Text>
                          <TextInput
                            style={styles.textInput}
                            placeholder="123"
                            value={creditCardData.cvv}
                            onChangeText={(text) => setCreditCardData({...creditCardData, cvv: text})}
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Nombre del titular:</Text>
                        <TextInput
                          style={styles.textInput}
                          placeholder="NOMBRE COMPLETO"
                          value={creditCardData.name}
                          onChangeText={(text) => setCreditCardData({...creditCardData, name: text.toUpperCase()})}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.processButton}
                      onPress={processCreditCard}
                      disabled={processingPayment}
                    >
                      <LinearGradient
                        colors={['#4682B4', '#2F4F4F']}
                        style={styles.processButtonGradient}
                      >
                        {processingPayment ? (
                          <ActivityIndicator size={18} color="#FFFFFF" />
                        ) : (
                          <CreditCard size={18} color="#FFFFFF" />
                        )}
                        <Text style={styles.processButtonText}>
                          {processingPayment ? 'Procesando...' : 'Procesar Pago'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* QR Code Modal */}
          <Modal
            visible={showQRCode}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowQRCode(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={styles.qrCard}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.sectionTitle}>QR Banco Pichincha</Text>
                    <TouchableOpacity 
                      onPress={() => setShowQRCode(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.qrSubtitle}>
                    Monto a pagar: ${customAmount}
                  </Text>

                  <View style={styles.qrContainer}>
                    <View style={styles.qrCodePlaceholder}>
                      <QrCode size={120} color="#4682B4" />
                      <Text style={styles.qrText}>Código QR Banco Pichincha</Text>
                      <Text style={styles.qrSubtext}>
                        Escanea este código con la app de Banco Pichincha
                      </Text>
                    </View>
                  </View>

                  <View style={styles.qrInstructions}>
                    <Text style={styles.instructionTitle}>Instrucciones:</Text>
                    <Text style={styles.instructionText}>
                      1. Abre la aplicación de Banco Pichincha
                    </Text>
                    <Text style={styles.instructionText}>
                      2. Selecciona "Pagar con QR"
                    </Text>
                    <Text style={styles.instructionText}>
                      3. Escanea el código QR mostrado arriba
                    </Text>
                    <Text style={styles.instructionText}>
                      4. Confirma el pago por ${customAmount || '0.00'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.processButton}
                    onPress={processQRPayment}
                    disabled={processingPayment}
                  >
                    <LinearGradient
                      colors={['#4682B4', '#2F4F4F']}
                      style={styles.processButtonGradient}
                    >
                      {processingPayment ? (
                        <ActivityIndicator size={18} color="#FFFFFF" />
                      ) : (
                        <QrCode size={18} color="#FFFFFF" />
                      )}
                      <Text style={styles.processButtonText}>
                        {processingPayment ? 'Procesando...' : 'Confirmar Pago QR'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </Modal>

          {/* Receipt Upload Modal */}
          <Modal
            visible={showReceiptUpload}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowReceiptUpload(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={styles.receiptCard}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.sectionTitle}>Subir Comprobante</Text>
                    <TouchableOpacity 
                      onPress={() => setShowReceiptUpload(false)}
                      style={styles.closeButton}
                    >
                      <X size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.receiptSubtitle}>
                    Monto del abono: ${customAmount}
                  </Text>

                  <View style={styles.uploadSection}>
                    <Text style={styles.uploadLabel}>Comprobante de pago:</Text>
                    
                    {selectedReceipt ? (
                      <View style={styles.selectedReceiptContainer}>
                        <View style={styles.receiptPreview}>
                          <FileText size={40} color="#4682B4" />
                        </View>
                        <Text style={styles.receiptName}>{selectedReceipt.name || 'Comprobante seleccionado'}</Text>
                        <TouchableOpacity onPress={() => setSelectedReceipt(null)} style={styles.removeReceiptButton}>
                          <Text style={styles.removeReceiptText}>Remover</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.uploadButton} onPress={pickReceipt}>
                        <Upload size={24} color="#4682B4" />
                        <Text style={styles.uploadButtonText}>Seleccionar Comprobante</Text>
                        <Text style={styles.uploadButtonSubtext}>JPG, PNG o PDF</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.uploadInfo}>
                    <Text style={styles.infoText}>
                      El comprobante se guardará en: C:\projecto_septimoFinal\Capturas
                    </Text>
                    <Text style={styles.infoText}>
                      Tu pago se actualizará al momento de que uno de nuestros administradores realice la comprobación (máximo 4 horas hábiles).
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.processButton}
                    onPress={uploadReceipt}
                    disabled={processingPayment || !selectedReceipt}
                  >
                    <LinearGradient
                      colors={['#4682B4', '#2F4F4F']}
                      style={styles.processButtonGradient}
                    >
                      {processingPayment ? (
                        <ActivityIndicator size={18} color="#FFFFFF" />
                      ) : (
                        <Upload size={18} color="#FFFFFF" />
                      )}
                      <Text style={styles.processButtonText}>
                        {processingPayment ? 'Subiendo...' : 'Subir Comprobante'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </Modal>

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
                    Los abonos temporales se actualizan una vez verificados por administradores
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoBullet}>•</Text>
                  <Text style={styles.infoText}>
                    Máximo de {PAYMENT_CONFIG.MAX_MONTHS_TO_DEFER} meses para diferir pagos
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
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    padding: 5,
  },
  homeButton: {
    padding: 5,
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
  policyInfo: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  policyTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 8,
  },
  policyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
    width: '100%',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginVertical: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
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
  
  // Payment Plan Styles
  planCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  planSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  amountInput: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: 'Inter-Regular',
  },
  monthsSection: {
    marginBottom: 20,
  },
  monthsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  selectedMonthButton: {
    backgroundColor: '#4682B4',
    borderColor: '#4682B4',
  },
  monthButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  selectedMonthButtonText: {
    color: '#FFFFFF',
  },
  planSummary: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  planSummaryTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 10,
  },
  planSummaryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  planButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickPayButton: {
    backgroundColor: '#87A96B',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  quickPayButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  
  // Bank Transfer Styles
  transferCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  transferSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  bankSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 15,
  },
  bankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedBankCard: {
    borderColor: '#4682B4',
    backgroundColor: '#F0F8FF',
  },
  bankInfo: {
    gap: 4,
  },
  bankName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  accountInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  beneficiaryInfo: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#87A96B',
  },
  referenceInfo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#DAA520',
  },
  processButton: {
    marginTop: 20,
    borderRadius: 10,
  },
  processButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    gap: 8,
  },
  processButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  
  // Credit Card Styles
  cardPaymentCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardForm: {
    gap: 15,
  },
  formGroup: {
    gap: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 15,
  },
  formGroupHalf: {
    flex: 1,
    gap: 8,
  },
  
  // QR Code Styles
  qrCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  qrSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8FF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4682B4',
    borderStyle: 'dashed',
  },
  qrText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginTop: 10,
  },
  qrSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  qrInstructions: {
    backgroundColor: '#F8F8FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 5,
  },
  
  // Receipt Upload Styles
  receiptCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  receiptSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: '#F8F8FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4682B4',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    marginTop: 8,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
  },
  selectedReceiptContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
    padding: 15,
    borderRadius: 12,
  },
  receiptPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4682B4',
  },
  receiptName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    marginBottom: 8,
  },
  removeReceiptButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeReceiptText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  uploadInfo: {
    backgroundColor: '#FFF8DC',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
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
  bottomPadding: {
    height: 50,
  },
});