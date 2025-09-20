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
  Image,
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

// Interfaces
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
  type?: string;
  isValid?: boolean;
}

interface PaymentPlan {
  monthlyAmount: number;
  months: number;
  totalAmount: number;
}

// Configuración
const API_BASE_URL = 'http://localhost:3000/api';
const PAYMENT_CONFIG = {
  MIN_PAYMENT_AMOUNT: 50,
  MAX_MONTHS_TO_DEFER: 12,
  MIN_MONTHLY_PAYMENT: 25,
};

// Servicio de pagos
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
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (tarjeta.number.length < 16 || tarjeta.cvv.length < 3) {
        return {
          success: false,
          message: 'Datos de tarjeta inválidos'
        };
      }

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

  async guardarComprobante(imagen: any, monto: number, idReserva: number): Promise<{success: boolean; rutaArchivo?: string; message: string}> {
    try {
      const timestamp = Date.now();
      const rutaArchivo = `C:\\projecto_septimoFinal\\Capturas\\comprobante_${idReserva}_${timestamp}.jpg`;
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        rutaArchivo,
        message: 'Comprobante guardado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al guardar el comprobante'
      };
    }
  }
}

export default function PaymentsScreen() {
  const router = useRouter();
  const paymentService = new PaymentService();
  
  // Estados principales
  const [cedula, setCedula] = useState('');
  const [clientPaymentInfo, setClientPaymentInfo] = useState<ClientPaymentInfo | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Estados de modales
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [showCreditCard, setShowCreditCard] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showReceiptUploadForTransfer, setShowReceiptUploadForTransfer] = useState(false);
  
  // Estados de formularios
  const [customAmount, setCustomAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [creditCardData, setCreditCardData] = useState<CreditCardInfo>({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    type: '',
    isValid: false
  });

  // Estados de transferencia
  const [transferRegistered, setTransferRegistered] = useState(false);
  const [currentTransferPaymentId, setCurrentTransferPaymentId] = useState<number | null>(null);

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

  // Métodos de pago
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
      method: 'QR DeUna - Banco Pichincha',
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

  // Funciones utilitarias para tarjetas
  const detectCardType = (number: string): string => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return 'MasterCard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^3[0689]/.test(cleanNumber)) return 'Diners Club';
    if (/^6/.test(cleanNumber)) return 'Discover';
    return '';
  };

  const formatCardNumber = (value: string): string => {
    const cleanValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleanValue.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return cleanValue;
    }
  };

  const formatExpiryDate = (value: string): string => {
    const cleanValue = value.replace(/\D+/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
    }
    return cleanValue;
  };

  const validateCreditCard = (cardData: CreditCardInfo): boolean => {
    const cleanNumber = cardData.number.replace(/\s+/g, '');
    
    let validLength = false;
    switch (cardData.type) {
      case 'Visa':
      case 'MasterCard':
        validLength = cleanNumber.length === 16;
        break;
      case 'American Express':
        validLength = cleanNumber.length === 15;
        break;
      case 'Diners Club':
        validLength = cleanNumber.length === 14;
        break;
      default:
        validLength = cleanNumber.length >= 13 && cleanNumber.length <= 19;
    }

    const validExpiry = /^\d{2}\/\d{2}$/.test(cardData.expiry);
    const validCVV = cardData.cvv.length >= 3 && cardData.cvv.length <= 4;
    const validName = cardData.name.trim().length >= 2;

    return validLength && validExpiry && validCVV && validName;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    const cardType = detectCardType(formatted);
    
    const updatedCard = {
      ...creditCardData,
      number: formatted,
      type: cardType
    };
    
    updatedCard.isValid = validateCreditCard(updatedCard);
    setCreditCardData(updatedCard);
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    const updatedCard = {
      ...creditCardData,
      expiry: formatted
    };
    
    updatedCard.isValid = validateCreditCard(updatedCard);
    setCreditCardData(updatedCard);
  };

  const handleCVVChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const updatedCard = {
      ...creditCardData,
      cvv: cleanText
    };
    
    updatedCard.isValid = validateCreditCard(updatedCard);
    setCreditCardData(updatedCard);
  };

  const handleNameChange = (text: string) => {
    const updatedCard = {
      ...creditCardData,
      name: text.toUpperCase()
    };
    
    updatedCard.isValid = validateCreditCard(updatedCard);
    setCreditCardData(updatedCard);
  };

  const getCardIcon = (type: string) => {
    return '💳';
  };

  // Funciones de validación
  const calculatePaymentPlan = (totalAmount: number, months: number): PaymentPlan => {
    const monthlyAmount = Math.ceil(totalAmount / months);
    return {
      monthlyAmount,
      months,
      totalAmount: monthlyAmount * months
    };
  };

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

  const validateTransferAmount = (amount: number): { isValid: boolean; message?: string } => {
    if (amount < 80) {
      return {
        isValid: false,
        message: 'El monto mínimo para transferencia es $80.00'
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

  // Funciones de control de modales
  const resetModals = () => {
    setShowPaymentMethods(false);
    setShowPaymentPlan(false);
    setShowBankTransfer(false);
    setShowCreditCard(false);
    setShowQRPayment(false);
    setShowReceiptUpload(false);
    setShowReceiptUploadForTransfer(false);
    setCustomAmount('');
    setTransferAmount('');
    setSelectedMonths(1);
    setPaymentPlan(null);
    setSelectedBank(null);
    setTransferRegistered(false);
    setCurrentTransferPaymentId(null);
    setCreditCardData({
      number: '',
      expiry: '',
      cvv: '',
      name: '',
      type: '',
      isValid: false
    });
    setSelectedReceipt(null);
  };

  const returnToHome = () => {
    resetModals();
    setCedula('');
    setClientPaymentInfo(null);
    setError(null);
    router.replace('/');
  };

  const refreshCurrentConsultation = async () => {
    if (cedula) {
      await consultarPagos();
    }
  };

  // Funciones principales
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

  const handleMethodSelect = (methodId: string) => {
    setShowPaymentMethods(false);
    
    switch (methodId) {
      case 'transfer':
        setTransferAmount(selectedAmount?.toString() || '');
        setTransferRegistered(false);
        setShowReceiptUploadForTransfer(false);
        setShowBankTransfer(true);
        break;
      case 'card':
        setCustomAmount(selectedAmount?.toString() || '');
        setShowPaymentPlan(true);
        break;
      case 'qr':
        setCustomAmount(selectedAmount?.toString() || '');
        setShowQRPayment(true);
        break;
      case 'receipt':
        setCustomAmount(selectedAmount?.toString() || '');
        setShowReceiptUpload(true);
        break;
    }
  };

  const handlePaymentPlanConfirm = () => {
    if (!paymentPlan) {
      Alert.alert('Error', 'Por favor configure el monto y seleccione los meses');
      return;
    }
    setShowPaymentPlan(false);
    setShowCreditCard(true);
  };

  const processBankTransfer = async () => {
    if (!selectedBank || !transferAmount) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const amount = parseFloat(transferAmount);
    const validation = validateTransferAmount(amount);
    
    if (!validation.isValid) {
      Alert.alert('Error', validation.message!);
      return;
    }

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
        setCurrentTransferPaymentId(result.pagoId || null);
        setTransferRegistered(true);
        
        Alert.alert(
          'Transferencia Registrada',
          `Su transferencia por $${amount.toFixed(2)} ha sido registrada exitosamente.\n\nBanco: ${selectedBank.name}\nMonto: $${amount.toFixed(2)}\n\nAhora debe subir el comprobante de la transferencia para completar el proceso.`,
          [
            {
              text: 'Subir Comprobante',
              onPress: () => {
                setShowBankTransfer(false);
                setShowReceiptUploadForTransfer(true);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Error al registrar la transferencia');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al procesar la transferencia');
    } finally {
      setProcessingPayment(false);
    }
  };

  const processCreditCard = async () => {
    if (!creditCardData.isValid || !paymentPlan) {
      Alert.alert('Error', 'Por favor completa correctamente todos los datos de la tarjeta');
      return;
    }

    try {
      setProcessingPayment(true);
      
      const cardResult = await paymentService.procesarTarjetaCredito(creditCardData, paymentPlan.monthlyAmount);
      
      if (cardResult.success) {
        const result = await paymentService.registrarPago({
          IdReserva: clientPaymentInfo!.reservaInfo!.Id,
          Monto: paymentPlan.monthlyAmount,
          MetodoPago: `Tarjeta ${creditCardData.type} - ****${creditCardData.number.slice(-4)}`,
          TipoAbono: 'Pago Directo',
          EstadoAprobacion: 'Aprobado'
        });
        
        if (result.success) {
          const newPendingAmount = clientPaymentInfo!.pendingAmount - paymentPlan.monthlyAmount;
          if (newPendingAmount <= 0) {
            await paymentService.actualizarEstadoReserva(
              clientPaymentInfo!.reservaInfo!.Id, 
              'Sin Deuda'
            );
          } else {
            await paymentService.actualizarEstadoReserva(
              clientPaymentInfo!.reservaInfo!.Id, 
              'Pago Parcial'
            );
          }

          Alert.alert(
            'Pago Exitoso',
            `Estimado/a ${clientPaymentInfo!.clientName},\n\nSu pago ha sido procesado exitosamente\n\nTarjeta: ${creditCardData.type} ****${creditCardData.number.slice(-4)}\nMonto: $${paymentPlan.monthlyAmount.toFixed(2)}\nPlan: ${paymentPlan.months} cuotas\nTransacción: #${result.pagoId || Date.now()}\n\nSu cuenta ha sido actualizada automáticamente.\nConserve este comprobante para sus registros.\n\nGracias por su confianza!\n\nCementerio San Agustín - La Concordia\nLínea de atención: (02) 123-4567`,
            [
              {
                text: 'Descargar Comprobante',
                onPress: () => {
                  Alert.alert('Comprobante', 'Comprobante guardado en descargas');
                }
              },
              {
                text: 'Ver Estado Actualizado',
                onPress: () => {
                  resetModals();
                  refreshCurrentConsultation();
                }
              },
              {
                text: 'Finalizar',
                style: 'default',
                onPress: returnToHome
              }
            ]
          );
        }
      } else {
        Alert.alert('Error en el Pago', cardResult.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Error al procesar el pago con tarjeta');
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

    try {
      setProcessingPayment(true);
      
      const result = await paymentService.registrarPago({
        IdReserva: clientPaymentInfo!.reservaInfo!.Id,
        Monto: amount,
        MetodoPago: 'QR DeUna - Banco Pichincha',
        TipoAbono: 'Abono Temporal',
        EstadoAprobacion: 'Pendiente'
      });
      
      if (result.success) {
        Alert.alert(
          'Pago QR Registrado',
          `Perfecto! Tu pago por $${amount.toFixed(2)} ha sido registrado exitosamente.\n\nNuestro equipo administrativo revisará que el pago coincida con el valor solicitado.\n\nPor el momento se ha descontado temporalmente el valor ingresado de tu cuenta.\n\nSi hubiera alguna inconsistencia, nos pondremos en contacto contigo.\n\nGracias por usar nuestros servicios!\n\nCementerio San Agustín - La Concordia`,
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
      Alert.alert('Error', 'Error al procesar el pago QR');
    } finally {
      setProcessingPayment(false);
    }
  };

  const pickReceipt = async () => {
    try {
      Alert.alert(
        'Seleccionar Comprobante',
        'Elige cómo quieres agregar tu comprobante:',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Tomar Foto',
            onPress: () => {
              setSelectedReceipt({
                uri: 'simulated_camera_image',
                type: 'image',
                name: `comprobante_camara_${Date.now()}.jpg`
              });
            }
          },
          {
            text: 'Elegir de Galería',
            onPress: () => {
              setSelectedReceipt({
                uri: 'simulated_gallery_image',
                type: 'image',
                name: `comprobante_galeria_${Date.now()}.jpg`
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
      
      const guardarResult = await paymentService.guardarComprobante(
        selectedReceipt, 
        amount, 
        clientPaymentInfo!.reservaInfo!.Id
      );
      
      if (guardarResult.success) {
        const result = await paymentService.registrarPago({
          IdReserva: clientPaymentInfo!.reservaInfo!.Id,
          Monto: amount,
          MetodoPago: 'Comprobante Subido',
          TipoAbono: 'Abono Temporal',
          ComprobanteRuta: guardarResult.rutaArchivo,
          EstadoAprobacion: 'Pendiente'
        });
        
        if (result.success) {
          Alert.alert(
            'Comprobante Subido', 
            `Excelente! Tu comprobante por $${amount.toFixed(2)} ha sido subido exitosamente.\n\nGuardado en: ${guardarResult.rutaArchivo}\n\nNuestro equipo administrativo revisará que el pago coincida con el valor solicitado.\n\nPor el momento se ha descontado temporalmente el valor ingresado de tu cuenta.\n\nSi hubiera alguna inconsistencia, nos pondremos en contacto contigo.\n\nGracias por tu pago!\n\nCementerio San Agustín - La Concordia`,
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
        Alert.alert('Error', guardarResult.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Error al subir el comprobante');
    } finally {
      setProcessingPayment(false);
    }
  };

  const uploadTransferReceipt = async () => {
    if (!selectedReceipt) {
      Alert.alert('Error', 'Por favor seleccione un comprobante de transferencia');
      return;
    }

    try {
      setProcessingPayment(true);
      
      const guardarResult = await paymentService.guardarComprobante(
        selectedReceipt, 
        parseFloat(transferAmount),
        clientPaymentInfo!.reservaInfo!.Id
      );
      
      if (guardarResult.success) {
        Alert.alert(
          'Transferencia Completada',
          `Excelente! Su transferencia ha sido procesada exitosamente.\n\nMonto: $${parseFloat(transferAmount).toFixed(2)}\nBanco: ${selectedBank?.name}\nComprobante guardado en:\n${guardarResult.rutaArchivo}\n\nNuestro equipo administrativo revisará que el pago coincida con el valor solicitado.\n\nPor el momento se ha descontado temporalmente el valor ingresado de su cuenta.\n\nSi hubiera alguna inconsistencia, nos pondremos en contacto con usted.\n\nGracias por su confianza!\n\nCementerio San Agustín - La Concordia`,
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
        Alert.alert('Error', guardarResult.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Error al subir el comprobante de transferencia');
    } finally {
      setProcessingPayment(false);
    }
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
                      <Text style={styles.sectionTitle}>Plan de Pagos - Tarjeta de Crédito</Text>
                      <TouchableOpacity 
                        onPress={() => setShowPaymentPlan(false)}
                        style={styles.closeButton}
                      >
                        <X size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.planSubtitle}>
                      Configura el monto y plazo para tu pago con tarjeta
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

                    <TouchableOpacity
                      style={styles.processButton}
                      onPress={handlePaymentPlanConfirm}
                      disabled={!paymentPlan}
                    >
                      <LinearGradient
                        colors={['#4682B4', '#2F4F4F']}
                        style={styles.processButtonGradient}
                      >
                        <Text style={styles.processButtonText}>
                          Continuar con Tarjeta de Crédito
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
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
              <ScrollView style={styles.modalScrollView}>
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

                    {/* Campo para editar monto */}
                    <View style={styles.amountInputSection}>
                      <Text style={styles.inputLabel}>💰 Monto a transferir:</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <TextInput
                          style={[
                            styles.amountInput,
                            transferAmount && parseFloat(transferAmount) < 80 && styles.invalidInput
                          ]}
                          placeholder="80.00"
                          value={transferAmount}
                          onChangeText={setTransferAmount}
                          keyboardType="numeric"
                          placeholderTextColor="#999"
                        />
                      </View>
                      {transferAmount && parseFloat(transferAmount) < 80 && (
                        <Text style={styles.errorText}>El monto mínimo es $80.00</Text>
                      )}
                      {clientPaymentInfo && transferAmount && parseFloat(transferAmount) > clientPaymentInfo.pendingAmount && (
                        <Text style={styles.errorText}>
                          No puede exceder el saldo pendiente: ${clientPaymentInfo.pendingAmount.toFixed(2)}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.bankSectionTitle}>🏦 Selecciona el banco de destino:</Text>
                    
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
                          <View style={styles.bankHeader}>
                            <Text style={styles.bankName}>{bank.name}</Text>
                            {selectedBank?.name === bank.name && (
                              <Text style={styles.selectedIndicator}>✅</Text>
                            )}
                          </View>
                          <Text style={styles.accountInfo}>
                            📋 {bank.accountType}: {bank.accountNumber}
                          </Text>
                          <Text style={styles.beneficiaryInfo}>
                            👤 Beneficiario: Cementerio San Agustín
                          </Text>
                          <Text style={styles.referenceInfo}>
                            🏷️ Referencia: Pago Cementerio - Cédula {cedula}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      style={[
                        styles.processButton,
                        (!selectedBank || !transferAmount || parseFloat(transferAmount) < 80) && styles.disabledButton
                      ]}
                      onPress={processBankTransfer}
                      disabled={processingPayment || !selectedBank || !transferAmount || parseFloat(transferAmount) < 80}
                    >
                      <LinearGradient
                        colors={(selectedBank && transferAmount && parseFloat(transferAmount) >= 80) 
                          ? ['#4682B4', '#2F4F4F'] 
                          : ['#cccccc', '#999999']}
                        style={styles.processButtonGradient}
                      >
                        {processingPayment ? (
                          <>
                            <ActivityIndicator size={18} color="#FFFFFF" />
                            <Text style={styles.processButtonText}>Registrando...</Text>
                          </>
                        ) : (
                          <>
                            <Building size={18} color="#FFFFFF" />
                            <Text style={styles.processButtonText}>
                              Registrar Transferencia
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* Receipt Upload for Transfer Modal */}
          <Modal
            visible={showReceiptUploadForTransfer}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowReceiptUploadForTransfer(false)}
          >
            <View style={styles.modalOverlay}>
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F0F8FF']}
                    style={styles.receiptCard}
                  >
                    <View style={styles.modalHeader}>
                      <Text style={styles.sectionTitle}>📄 Subir Comprobante de Transferencia</Text>
                      <TouchableOpacity 
                        onPress={() => setShowReceiptUploadForTransfer(false)}
                        style={styles.closeButton}
                      >
                        <X size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.uploadSection}>
                      <Text style={styles.uploadLabel}>📸 Comprobante de transferencia:</Text>
                      
                      {selectedReceipt ? (
                        <View style={styles.selectedReceiptContainer}>
                          <View style={styles.receiptPreview}>
                            <FileText size={40} color="#4682B4" />
                          </View>
                          <Text style={styles.receiptName}>
                            {selectedReceipt.name || 'Comprobante de transferencia'}
                          </Text>
                          <TouchableOpacity 
                            onPress={() => setSelectedReceipt(null)} 
                            style={styles.removeReceiptButton}
                          >
                            <Text style={styles.removeReceiptText}>❌ Remover</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.uploadButton} onPress={pickReceipt}>
                          <Upload size={32} color="#4682B4" />
                          <Text style={styles.uploadButtonText}>📷 Seleccionar Comprobante</Text>
                          <Text style={styles.uploadButtonSubtext}>JPG, PNG o PDF</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.processButton,
                        !selectedReceipt && styles.disabledButton
                      ]}
                      onPress={uploadTransferReceipt}
                      disabled={processingPayment || !selectedReceipt}
                    >
                      <LinearGradient
                        colors={selectedReceipt ? ['#4682B4', '#2F4F4F'] : ['#cccccc', '#999999']}
                        style={styles.processButtonGradient}
                      >
                        {processingPayment ? (
                          <>
                            <ActivityIndicator size={18} color="#FFFFFF" />
                            <Text style={styles.processButtonText}>Subiendo comprobante...</Text>
                          </>
                        ) : (
                          <>
                            <Upload size={18} color="#FFFFFF" />
                            <Text style={styles.processButtonText}>
                              Completar Transferencia
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </ScrollView>
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

                    {/* Vista previa de la tarjeta */}
                    <View style={styles.cardPreview}>
                      <LinearGradient
                        colors={creditCardData.type ? ['#1e3c72', '#2a5298'] : ['#cccccc', '#999999']}
                        style={styles.cardPreviewGradient}
                      >
                        <View style={styles.cardPreviewContent}>
                          <View style={styles.cardPreviewHeader}>
                            <Text style={styles.cardTypeText}>
                              {creditCardData.type || 'Tipo de Tarjeta'}
                            </Text>
                            <Text style={styles.cardIconText}>
                              {getCardIcon(creditCardData.type)}
                            </Text>
                          </View>
                          <Text style={styles.cardNumberPreview}>
                            {creditCardData.number || '**** **** **** ****'}
                          </Text>
                          <View style={styles.cardPreviewFooter}>
                            <View>
                              <Text style={styles.cardLabelText}>TITULAR</Text>
                              <Text style={styles.cardHolderText}>
                                {creditCardData.name || 'NOMBRE COMPLETO'}
                              </Text>
                            </View>
                            <View style={styles.cardExpiryContainer}>
                              <Text style={styles.cardLabelText}>VENCE</Text>
                              <Text style={styles.cardExpiryText}>
                                {creditCardData.expiry || 'MM/AA'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>

                    {/* Formulario de la tarjeta */}
                    <View style={styles.cardForm}>
                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Número de tarjeta *</Text>
                        <View style={[
                          styles.cardInputContainer,
                          creditCardData.number && !creditCardData.type && styles.invalidInput
                        ]}>
                          <TextInput
                            style={styles.cardInput}
                            placeholder="1234 5678 9012 3456"
                            value={creditCardData.number}
                            onChangeText={handleCardNumberChange}
                            keyboardType="numeric"
                            maxLength={23}
                            placeholderTextColor="#999"
                          />
                          {creditCardData.type && (
                            <View style={styles.cardTypeIndicator}>
                              <Text style={styles.cardTypeIndicatorText}>{creditCardData.type}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.formRow}>
                        <View style={styles.formGroupHalf}>
                          <Text style={styles.inputLabel}>Fecha de vencimiento *</Text>
                          <TextInput
                            style={styles.cardInput}
                            placeholder="MM/AA"
                            value={creditCardData.expiry}
                            onChangeText={handleExpiryChange}
                            keyboardType="numeric"
                            maxLength={5}
                            placeholderTextColor="#999"
                          />
                        </View>

                        <View style={styles.formGroupHalf}>
                          <Text style={styles.inputLabel}>CVV *</Text>
                          <TextInput
                            style={styles.cardInput}
                            placeholder="123"
                            value={creditCardData.cvv}
                            onChangeText={handleCVVChange}
                            keyboardType="numeric"
                            maxLength={creditCardData.type === 'American Express' ? 4 : 3}
                            secureTextEntry
                            placeholderTextColor="#999"
                          />
                        </View>
                      </View>

                      <View style={styles.formGroup}>
                        <Text style={styles.inputLabel}>Nombre del titular *</Text>
                        <TextInput
                          style={styles.cardInput}
                          placeholder="NOMBRE COMPLETO COMO APARECE EN LA TARJETA"
                          value={creditCardData.name}
                          onChangeText={handleNameChange}
                          autoCapitalize="characters"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.processButton,
                        !creditCardData.isValid && styles.disabledButton
                      ]}
                      onPress={processCreditCard}
                      disabled={processingPayment || !creditCardData.isValid}
                    >
                      <LinearGradient
                        colors={creditCardData.isValid ? ['#4682B4', '#2F4F4F'] : ['#cccccc', '#999999']}
                        style={styles.processButtonGradient}
                      >
                        {processingPayment ? (
                          <>
                            <ActivityIndicator size={18} color="#FFFFFF" />
                            <Text style={styles.processButtonText}>Procesando pago...</Text>
                          </>
                        ) : (
                          <>
                            <CreditCard size={18} color="#FFFFFF" />
                            <Text style={styles.processButtonText}>
                              Procesar Pago - ${paymentPlan?.monthlyAmount.toFixed(2) || '0.00'}
                            </Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </ScrollView>
            </View>
          </Modal>

          {/* QR Payment Modal */}
          <Modal
            visible={showQRPayment}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowQRPayment(false)}
          >
            <View style={styles.modalOverlay}>
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F0F8FF']}
                    style={styles.qrCard}
                  >
                    <View style={styles.modalHeader}>
                      <Text style={styles.sectionTitle}>Pago QR DeUna</Text>
                      <TouchableOpacity 
                        onPress={() => setShowQRPayment(false)}
                        style={styles.closeButton}
                      >
                        <X size={24} color="#666" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.amountDisplay}>
                      <Text style={styles.amountLabel}>Monto a pagar:</Text>
                      <Text style={styles.amountValue}>${parseFloat(customAmount || '0').toFixed(2)}</Text>
                    </View>

                    <View style={styles.qrContainer}>
                      <View style={styles.qrImageContainer}>
                        <Image 
                          source={{uri: 'https://megaorganik.com/wp-content/uploads/2023/07/Codigo_QR_DeUna_MEGA-724x1024.jpg'}}
                          style={styles.qrImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.qrText}>Código QR DeUna - Banco Pichincha</Text>
                      </View>
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
                          {processingPayment ? 'Registrando...' : 'Confirmar Pago QR'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </ScrollView>
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
              <ScrollView style={styles.modalScrollView}>
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

                    <View style={styles.uploadSection}>
                      <Text style={styles.uploadLabel}>📄 Comprobante de pago:</Text>
                      
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
              </ScrollView>
            </View>
          </Modal>

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
    maxHeight: '85%',
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
  amountDisplay: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
  },
  transferCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  amountInputSection: {
    marginBottom: 25,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginRight: 8,
  },

  invalidInput: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF5F5',
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
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedBankCard: {
    borderColor: '#4682B4',
    backgroundColor: '#F0F8FF',
  },
  bankInfo: {
    gap: 6,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    flex: 1,
  },
  selectedIndicator: {
    fontSize: 18,
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
  disabledButton: {
    opacity: 0.6,
  },
  receiptCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    width: 80,
    height: 80,
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
    textAlign: 'center',
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
  cardPaymentCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardPreview: {
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardPreviewGradient: {
    borderRadius: 15,
    padding: 20,
    minHeight: 180,
  },
  cardPreviewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardTypeText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardNumberPreview: {
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabelText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#CCCCCC',
    marginBottom: 2,
  },
  cardHolderText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardExpiryContainer: {
    alignItems: 'flex-end',
  },
  cardExpiryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardForm: {
    gap: 20,
    marginBottom: 20,
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
  cardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cardInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  cardTypeIndicator: {
    backgroundColor: '#4682B4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginRight: 2,
  },
  cardTypeIndicatorText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  qrCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrImageContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8FF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4682B4',
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  qrText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginTop: 10,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 50,
  },
});