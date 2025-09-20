import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  CheckCircle,
  User,
  MessageSquare
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DatabaseService } from '@/services/database';

export default function ContactScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingrese un correo electrónico válido';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono es obligatorio';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'El mensaje es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dbService = DatabaseService.getInstance();
      
      // Preparar los datos para el envío
      const mensajeData = {
        NombreCompleto: formData.name.trim(),
        CorreoElectronico: formData.email.trim(),
        Telefono: formData.phone.trim(),
        Mensaje: formData.message.trim(),
      };
      
      console.log('Enviando mensaje:', mensajeData);
      const success = await dbService.guardarMensaje(mensajeData);

      if (success) {
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
        
        // Mostrar modal de éxito
        setShowSuccessModal(true);
        
        // Ocultar modal después de 4 segundos
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 4000);
        
      } else {
        // Si falla, mostrar error específico
        setFormErrors({
          general: 'Error al enviar el mensaje. Verifique su conexión e intente nuevamente.'
        });
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setFormErrors({
        general: 'Error de conexión. Por favor intente nuevamente más tarde.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Dirección',
      content: 'La Concordia, Santo Domingo\nEcuador',
      color: '#3B82F6',
    },
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+593 2 XXX-XXXX\n+593 9X XXX-XXXX',
      color: '#10B981',
    },
    {
      icon: Mail,
      title: 'Correo Electrónico',
      content: 'info@cementeriosanagustin.ec\nayuda@cementeriosanagustin.ec',
      color: '#F59E0B',
    },
    {
      icon: Clock,
      title: 'Horarios de Atención',
      content: 'Lun-Vie: 8:00 AM - 5:00 PM\nSáb: 8:00 AM - 2:00 PM\nDom: 9:00 AM - 1:00 PM',
      color: '#8B5CF6',
    },
  ];

  const SuccessModal = () => (
    <Modal
      transparent={true}
      visible={showSuccessModal}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={styles.modalContent}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.modalGradient}
          >
            <CheckCircle size={60} color="#FFFFFF" />
            <Text style={styles.modalTitle}>¡Mensaje Enviado!</Text>
            <Text style={styles.modalMessage}>
              Su mensaje ha sido enviado de forma correcta. Por favor en el transcurso del día recibirá su respuesta. Gracias por la espera.
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F8FAFC', '#FFFFFF']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contáctanos</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.heroGradient}
              >
                <Text style={styles.heroTitle}>Estamos aquí para ayudarte</Text>
                <Text style={styles.heroSubtitle}>
                  Nuestro equipo está disponible para responder tus consultas y brindarte el apoyo que necesitas.
                </Text>
              </LinearGradient>
            </View>

            {/* Contact Information Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de Contacto</Text>
              <View style={styles.contactGrid}>
                {contactInfo.map((info, index) => (
                  <TouchableOpacity key={index} style={styles.contactCard} activeOpacity={0.8}>
                    <LinearGradient
                      colors={[`${info.color}15`, `${info.color}08`]}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardPattern} />
                      <View style={styles.cardContent}>
                        <View style={[styles.iconContainer, { backgroundColor: info.color }]}>
                          <info.icon size={22} color="#FFFFFF" />
                        </View>
                        <Text style={styles.contactTitle}>{info.title}</Text>
                        <Text style={styles.contactContent}>{info.content}</Text>
                      </View>
                      <View style={[styles.cardAccent, { backgroundColor: info.color }]} />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modern Contact Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Envíanos un Mensaje</Text>
              
              {formErrors.general && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{formErrors.general}</Text>
                </View>
              )}

              <View style={styles.formContainer}>
                {/* Name Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <User size={20} color="#6B7280" />
                    <Text style={styles.inputLabel}>Nombre Completo</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.modernInput,
                      focusedField === 'name' && styles.inputFocused,
                      formErrors.name && styles.inputError
                    ]}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ingresa tu nombre completo"
                    placeholderTextColor="#9CA3AF"
                  />
                  {formErrors.name && (
                    <Text style={styles.fieldError}>{formErrors.name}</Text>
                  )}
                </View>

                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Mail size={20} color="#6B7280" />
                    <Text style={styles.inputLabel}>Correo Electrónico</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.modernInput,
                      focusedField === 'email' && styles.inputFocused,
                      formErrors.email && styles.inputError
                    ]}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {formErrors.email && (
                    <Text style={styles.fieldError}>{formErrors.email}</Text>
                  )}
                </View>

                {/* Phone Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Phone size={20} color="#6B7280" />
                    <Text style={styles.inputLabel}>Teléfono</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.modernInput,
                      focusedField === 'phone' && styles.inputFocused,
                      formErrors.phone && styles.inputError
                    ]}
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+593 9X XXX-XXXX"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                  {formErrors.phone && (
                    <Text style={styles.fieldError}>{formErrors.phone}</Text>
                  )}
                </View>

                {/* Message Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <MessageSquare size={20} color="#6B7280" />
                    <Text style={styles.inputLabel}>Mensaje</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.modernInput,
                      styles.textArea,
                      focusedField === 'message' && styles.inputFocused,
                      formErrors.message && styles.inputError
                    ]}
                    value={formData.message}
                    onChangeText={(text) => handleInputChange('message', text)}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Escribe tu mensaje o consulta aquí..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {formErrors.message && (
                    <Text style={styles.fieldError}>{formErrors.message}</Text>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={isSubmitting ? ['#9CA3AF', '#6B7280'] : ['#3B82F6', '#1D4ED8']}
                    style={styles.submitGradient}
                  >
                    <Send size={20} color="#FFFFFF" />
                    <Text style={styles.submitText}>
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.formNote}>
                  Todos los campos son obligatorios. Nos comprometemos a responder tu mensaje dentro de las próximas 24 horas.
                </Text>
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>

        <SuccessModal />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  contactCard: {
    width: '48%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardGradient: {
    flex: 1,
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    margin: 8,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.8,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  contactContent: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modernInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    fontWeight: '400',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 50,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 20,
    overflow: 'hidden',
    maxWidth: 340,
    width: '100%',
  },
  modalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.95,
  },
});