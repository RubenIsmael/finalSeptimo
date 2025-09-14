import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, CircleAlert as AlertCircle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Definir interfaces necesarias
interface Precio {
  Id: number;
  Sector: string;
  PrecioValor: number;
}

interface ReservationFormData {
  nombreCliente: string;
  apellidoCliente: string;
  cedulaCliente: string;
  correoCliente: string;
  nombreFamiliar: string;
  apellidoFamiliar: string;
  idPrecio: number;
  sector: string;
  precio: number;
}

interface SectorData {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  description: string;
  available: number;
  features: string[];
  modalidad: string; // Nueva propiedad para modalidad
}

// Servicio de base de datos simplificado
class DatabaseService {
  private static instance: DatabaseService;
  private API_BASE_URL = 'http://localhost:3000/api';

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
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

  async getPrecios(): Promise<Precio[]> {
    try {
      const precios = await this.apiRequest<Precio[]>('/precios');
      return precios;
    } catch (error) {
      console.error('Error obteniendo precios:', error);
      return [];
    }
  }

  async crearReserva(reserva: {
    nombreCliente: string;
    apellidoCliente: string;
    cedulaCliente: string;
    correoCliente: string;
    nombreFamiliar: string;
    apellidoFamiliar: string;
    idPrecio: number;
  }): Promise<{success: boolean; message: string}> {
    try {
      const response = await this.apiRequest<{success: boolean; message: string}>('/reservas', {
        method: 'POST',
        body: JSON.stringify(reserva),
      });
      
      return response;
    } catch (error) {
      console.error('Error creando reserva:', error);
      return {
        success: false,
        message: 'Error al conectar con el servidor'
      };
    }
  }
}

export default function ReservationsScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [sectorsData, setSectorsData] = useState<SectorData[]>([]);
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState<ReservationFormData>({
    nombreCliente: '',
    apellidoCliente: '',
    cedulaCliente: '',
    correoCliente: '',
    nombreFamiliar: '',
    apellidoFamiliar: '',
    idPrecio: 0,
    sector: '',
    precio: 0,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadPrecios();
  }, []);

  const loadPrecios = async () => {
    try {
      setIsLoading(true);
      const dbService = DatabaseService.getInstance();
      const preciosData = await dbService.getPrecios();
      setPrecios(preciosData);
      
      console.log('Precios cargados:', preciosData); // Debug
      
      // Convertir precios a formato de sectores con validación clara
      const sectors: SectorData[] = preciosData.map((precio) => {
        const isRental = precio.PrecioValor <= 100;
        
        console.log(`Sector: ${precio.Sector}, Precio: ${precio.PrecioValor}, Es arriendo: ${isRental}`); // Debug
        
        return {
          id: precio.Id,
          name: precio.Sector,
          price: `$${precio.PrecioValor.toFixed(2)}`,
          priceValue: precio.PrecioValor,
          modalidad: isRental ? 'Arriendo anual' : 'Compra de bóveda/nicho',
          description: isRental 
            ? 'Modalidad de arriendo anual renovable con servicios incluidos'
            : 'Compra definitiva de bóveda/nicho con título de propiedad',
          available: Math.floor(Math.random() * 10) + 3,
          features: isRental 
            ? ['Contrato anual renovable', 'Pago anual anticipado', 'Mantenimiento incluido', 'Seguridad 24/7']
            : ['Propiedad definitiva', 'Título de propiedad', 'Herencia familiar', 'Mantenimiento incluido', 'Seguridad 24/7'],
        };
      });
      
      console.log('Sectores procesados:', sectors); // Debug
      
      setSectorsData(sectors);
      setTotalPages(Math.ceil(sectors.length / itemsPerPage));
    } catch (error) {
      console.error('Error cargando precios:', error);
      Alert.alert('Error', 'No se pudieron cargar los sectores disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  const requirements = [
    'Cédula de identidad del solicitante',
    'Certificado de defunción (si aplica)',
    'Comprobante de ingresos o capacidad de pago',
    'Formulario de reserva completado',
    'Pago inicial del 30% del valor total',
  ];

  // Validación de cédula ecuatoriana
  const validateEcuadorianCedula = (cedula: string): boolean => {
    if (!/^\d{10}$/.test(cedula)) return false;
    
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    
    const tercerDigito = parseInt(cedula.charAt(2));
    if (tercerDigito > 6) return false;
    
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
      if (valor > 9) valor -= 9;
      suma += valor;
    }
    
    const digitoVerificador = parseInt(cedula.charAt(9));
    const modulo = suma % 10;
    const resultado = modulo === 0 ? 0 : 10 - modulo;
    
    return resultado === digitoVerificador;
  };

  // Validación de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nombreCliente.trim()) {
      newErrors.nombreCliente = 'El nombre del cliente es obligatorio';
    } else if (formData.nombreCliente.trim().length < 2) {
      newErrors.nombreCliente = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellidoCliente.trim()) {
      newErrors.apellidoCliente = 'El apellido del cliente es obligatorio';
    } else if (formData.apellidoCliente.trim().length < 2) {
      newErrors.apellidoCliente = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.cedulaCliente.trim()) {
      newErrors.cedulaCliente = 'La cédula es obligatoria';
    } else if (!validateEcuadorianCedula(formData.cedulaCliente)) {
      newErrors.cedulaCliente = 'La cédula ecuatoriana no es válida';
    }

    if (!formData.correoCliente.trim()) {
      newErrors.correoCliente = 'El correo electrónico es obligatorio';
    } else if (!validateEmail(formData.correoCliente)) {
      newErrors.correoCliente = 'El formato del correo electrónico no es válido';
    }

    if (!formData.nombreFamiliar.trim()) {
      newErrors.nombreFamiliar = 'El nombre del familiar es obligatorio';
    } else if (formData.nombreFamiliar.trim().length < 2) {
      newErrors.nombreFamiliar = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellidoFamiliar.trim()) {
      newErrors.apellidoFamiliar = 'El apellido del familiar es obligatorio';
    } else if (formData.apellidoFamiliar.trim().length < 2) {
      newErrors.apellidoFamiliar = 'El apellido debe tener al menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openReservationModal = (sector: SectorData) => {
    setSelectedSector(sector);
    setFormData(prev => ({
      ...prev,
      idPrecio: sector.id,
      sector: sector.name,
      precio: sector.priceValue,
    }));
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedSector(null);
    setFormData({
      nombreCliente: '',
      apellidoCliente: '',
      cedulaCliente: '',
      correoCliente: '',
      nombreFamiliar: '',
      apellidoFamiliar: '',
      idPrecio: 0,
      sector: '',
      precio: 0,
    });
    setErrors({});
  };

  const handleInputChange = (field: keyof ReservationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const submitReservation = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setIsLoading(true);
      
      const dbService = DatabaseService.getInstance();
      
      const result = await dbService.crearReserva({
        nombreCliente: formData.nombreCliente.trim(),
        apellidoCliente: formData.apellidoCliente.trim(),
        cedulaCliente: formData.cedulaCliente,
        correoCliente: formData.correoCliente.trim(),
        nombreFamiliar: formData.nombreFamiliar.trim(),
        apellidoFamiliar: formData.apellidoFamiliar.trim(),
        idPrecio: formData.idPrecio,
      });
      
      if (result.success) {
        const isRental = formData.precio <= 100;
        const modalityText = isRental ? 'Arriendo anual' : 'Compra de bóveda/nicho';
        
        Alert.alert(
          'Reserva Exitosa',
          `Se ha registrado la reserva para ${formData.nombreFamiliar} ${formData.apellidoFamiliar} en ${formData.sector}. \n\nPrecio: $${formData.precio.toFixed(2)}\nModalidad: ${modalityText}\nEstado: Pendiente de pago\n\nEn breve nos contactaremos contigo para coordinar el pago inicial.`,
          [
            {
              text: 'Aceptar',
              onPress: () => {
                closeModal();
                router.push('/contact');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo procesar la reserva');
      }
      
    } catch (error) {
      console.error('Error creando reserva:', error);
      Alert.alert('Error', 'No se pudo procesar la reserva. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de paginación
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sectorsData.slice(startIndex, endIndex);
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <View style={styles.pageNumbersContainer}>
          {pageNumbers.map((pageNum) => (
            <TouchableOpacity
              key={pageNum}
              style={[
                styles.pageNumberButton,
                currentPage === pageNum && styles.pageNumberButtonActive
              ]}
              onPress={() => goToPage(pageNum)}
            >
              <Text style={[
                styles.pageNumberText,
                currentPage === pageNum && styles.pageNumberTextActive
              ]}>
                {pageNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={goToNextPage}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
            Siguiente
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading && sectorsData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4682B4" />
            <Text style={styles.loadingText}>Cargando sectores...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.gradient}>
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
            <LinearGradient colors={['#FFFFFF', '#F8F8FF']} style={styles.introCard}>
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
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionTitle}>Sectores Disponibles</Text>
              <Text style={styles.paginationInfo}>
                Página {currentPage} de {totalPages} ({sectorsData.length} sectores)
              </Text>
            </View>
            
            {getCurrentPageItems().map((sector) => (
              <View key={sector.id} style={styles.sectorCard}>
                <LinearGradient colors={['#FFFFFF', '#F0F8FF']} style={styles.sectorGradient}>
                  <View style={styles.sectorHeader}>
                    <View style={styles.sectorTitleContainer}>
                      <Text style={styles.sectorName}>{sector.name}</Text>
                      <Text style={styles.sectorPrice}>{sector.price}</Text>
                      <Text style={styles.sectorModalidad}>{sector.modalidad}</Text>
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

                  <TouchableOpacity 
                    style={styles.reserveButton}
                    onPress={() => openReservationModal(sector)}
                  >
                    <LinearGradient colors={['#87A96B', '#5F7F3F']} style={styles.reserveButtonGradient}>
                      <MapPin size={18} color="#FFFFFF" />
                      <Text style={styles.reserveButtonText}>Reservar Ahora</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}

            {/* Controles de paginación */}
            {renderPaginationControls()}
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <LinearGradient colors={['#FFFFFF', '#F5F5DC']} style={styles.requirementsCard}>
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
            <LinearGradient colors={['#87CEEB', '#F5F5DC']} style={styles.processCard}>
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
            <LinearGradient colors={['#4682B4', '#2F4F4F']} style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>¿Necesitas más información?</Text>
              <Text style={styles.ctaText}>
                Nuestro equipo está disponible para asesorarte en la selección 
                de la bóveda que mejor se adapte a tus necesidades y presupuesto.
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/contact')}
              >
                <LinearGradient colors={['#FFFFFF', '#F8F8FF']} style={styles.ctaButtonGradient}>
                  <Text style={styles.ctaButtonText}>Contactar Ahora</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Modal de Reserva */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closeModal}
        >
          <SafeAreaView style={styles.modalContainer}>
            <LinearGradient colors={['#F5F5DC', '#FFFFFF']} style={styles.modalGradient}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nueva Reserva</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <X size={24} color="#4682B4" />
                </TouchableOpacity>
              </View>

              {selectedSector && (
                <View style={styles.selectedSectorInfo}>
                  <View>
                    <Text style={styles.selectedSectorTitle}>{selectedSector.name}</Text>
                    <Text style={styles.selectedSectorModalidad}>{selectedSector.modalidad}</Text>
                  </View>
                  <Text style={styles.selectedSectorPrice}>{selectedSector.price}</Text>
                </View>
              )}

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Datos del Cliente */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Datos del Cliente</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nombre *</Text>
                    <TextInput
                      style={[styles.textInput, errors.nombreCliente && styles.inputError]}
                      value={formData.nombreCliente}
                      onChangeText={(text) => handleInputChange('nombreCliente', text)}
                      placeholder="Ingresa tu nombre"
                      placeholderTextColor="#999"
                    />
                    {errors.nombreCliente && (
                      <Text style={styles.errorText}>{errors.nombreCliente}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Apellido *</Text>
                    <TextInput
                      style={[styles.textInput, errors.apellidoCliente && styles.inputError]}
                      value={formData.apellidoCliente}
                      onChangeText={(text) => handleInputChange('apellidoCliente', text)}
                      placeholder="Ingresa tu apellido"
                      placeholderTextColor="#999"
                    />
                    {errors.apellidoCliente && (
                      <Text style={styles.errorText}>{errors.apellidoCliente}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Cédula de Identidad *</Text>
                    <TextInput
                      style={[styles.textInput, errors.cedulaCliente && styles.inputError]}
                      value={formData.cedulaCliente}
                      onChangeText={(text) => handleInputChange('cedulaCliente', text)}
                      placeholder="1234567890"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={10}
                    />
                    {errors.cedulaCliente && (
                      <Text style={styles.errorText}>{errors.cedulaCliente}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Correo Electrónico *</Text>
                    <TextInput
                      style={[styles.textInput, errors.correoCliente && styles.inputError]}
                      value={formData.correoCliente}
                      onChangeText={(text) => handleInputChange('correoCliente', text)}
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {errors.correoCliente && (
                      <Text style={styles.errorText}>{errors.correoCliente}</Text>
                    )}
                  </View>
                </View>

                {/* Datos del Familiar */}
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Datos del Familiar</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nombre del Familiar *</Text>
                    <TextInput
                      style={[styles.textInput, errors.nombreFamiliar && styles.inputError]}
                      value={formData.nombreFamiliar}
                      onChangeText={(text) => handleInputChange('nombreFamiliar', text)}
                      placeholder="Nombre del familiar"
                      placeholderTextColor="#999"
                    />
                    {errors.nombreFamiliar && (
                      <Text style={styles.errorText}>{errors.nombreFamiliar}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Apellido del Familiar *</Text>
                    <TextInput
                      style={[styles.textInput, errors.apellidoFamiliar && styles.inputError]}
                      value={formData.apellidoFamiliar}
                      onChangeText={(text) => handleInputChange('apellidoFamiliar', text)}
                      placeholder="Apellido del familiar"
                      placeholderTextColor="#999"
                    />
                    {errors.apellidoFamiliar && (
                      <Text style={styles.errorText}>{errors.apellidoFamiliar}</Text>
                    )}
                  </View>
                </View>

                {/* Botones */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={submitReservation}
                    disabled={isLoading}
                  >
                    <LinearGradient colors={['#87A96B', '#5F7F3F']} style={styles.submitButtonGradient}>
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitButtonText}>Confirmar Reserva</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBottomPadding} />
              </ScrollView>
            </LinearGradient>
          </SafeAreaView>
        </Modal>
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
    fontWeight: 'bold',
    color: '#4682B4',
  },
  placeholder: {
    width: 38,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4682B4',
    fontWeight: '500',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#4682B4',
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  paginationInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
    fontWeight: 'bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  sectorPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#87A96B',
    marginBottom: 4,
  },
  sectorModalidad: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DAA520',
    fontStyle: 'italic',
  },
  availabilityBadge: {
    backgroundColor: '#87CEEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectorDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    gap: 10,
  },
  paginationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4682B4',
    minWidth: 80,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#CCC',
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paginationButtonTextDisabled: {
    color: '#999',
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  pageNumberButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  pageNumberButtonActive: {
    backgroundColor: '#4682B4',
    borderColor: '#4682B4',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4682B4',
  },
  pageNumberTextActive: {
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#DAA520',
    minWidth: 20,
  },
  requirementText: {
    fontSize: 14,
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
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
    fontWeight: 'bold',
    color: '#4682B4',
  },
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4682B4',
  },
  closeButton: {
    padding: 5,
  },
  selectedSectorInfo: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4682B4',
  },
  selectedSectorModalidad: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DAA520',
    fontStyle: 'italic',
    marginTop: 2,
  },
  selectedSectorPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#87A96B',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginVertical: 15,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4682B4',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333',
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 5,
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginVertical: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4682B4',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4682B4',
  },
  submitButton: {
    flex: 2,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonGradient: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 50,
  },
  modalBottomPadding: {
    height: 30,
  },
});