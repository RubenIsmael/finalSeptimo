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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Send, Phone, MapPin, Clock, Mail } from 'lucide-react-native';
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre completo');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu teléfono');
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu mensaje');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dbService = DatabaseService.getInstance();
      const success = await dbService.guardarMensaje({
        NombreCompleto: formData.name,
        CorreoElectronico: formData.email,
        Telefono: formData.phone,
        Mensaje: formData.message,
      });

      if (success) {
        Alert.alert(
          'Mensaje Enviado',
          'Gracias por contactarnos. Tu mensaje ha sido recibido y nos pondremos en contacto contigo pronto.',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  message: '',
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo enviar el mensaje. Por favor intenta nuevamente.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema al enviar el mensaje.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Dirección',
      content: 'La Concordia, Santo Domingo\nEcuador',
      color: '#4682B4',
    },
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+593 2 XXX-XXXX\n+593 9X XXX-XXXX',
      color: '#87A96B',
    },
    {
      icon: Mail,
      title: 'Correo Electrónico',
      content: 'info@cementeriosanagustin.ec\nayuda@cementeriosanagustin.ec',
      color: '#DAA520',
    },
    {
      icon: Clock,
      title: 'Horarios de Atención',
      content: 'Lun-Vie: 8:00 AM - 5:00 PM\nSáb: 8:00 AM - 2:00 PM\nDom: 9:00 AM - 1:00 PM',
      color: '#4682B4',
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
          <Text style={styles.headerTitle}>Contáctanos</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Introduction */}
            <View style={styles.section}>
              <LinearGradient
                colors={['#FFFFFF', '#F8F8FF']}
                style={styles.introCard}
              >
                <Text style={styles.introTitle}>Estamos aquí para ayudarte</Text>
                <Text style={styles.introText}>
                  Nuestro equipo está disponible para responder tus consultas, 
                  brindarte información sobre nuestros servicios, o apoyarte en 
                  cualquier necesidad relacionada con el cementerio. No dudes en 
                  contactarnos, estamos para servirte con respeto y profesionalismo.
                </Text>
              </LinearGradient>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de Contacto</Text>
              <View style={styles.contactGrid}>
                {contactInfo.map((info, index) => (
                  <View key={index} style={styles.contactCard}>
                    <LinearGradient
                      colors={['#FFFFFF', '#F0F8FF']}
                      style={styles.contactCardGradient}
                    >
                      <info.icon size={24} color={info.color} />
                      <Text style={styles.contactCardTitle}>{info.title}</Text>
                      <Text style={styles.contactCardContent}>{info.content}</Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </View>

            {/* Contact Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Envíanos un Mensaje</Text>
              <LinearGradient
                colors={['#FFFFFF', '#F5F5DC']}
                style={styles.formCard}
              >
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nombre Completo *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="Ingresa tu nombre completo"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Correo Electrónico *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Teléfono *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    placeholder="+593 9X XXX-XXXX"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mensaje *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.message}
                    onChangeText={(text) => handleInputChange('message', text)}
                    placeholder="Escribe tu mensaje o consulta aquí..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={isSubmitting ? ['#CCC', '#999'] : ['#4682B4', '#2F4F4F']}
                    style={styles.submitButtonGradient}
                  >
                    <Send size={20} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.formNote}>
                  * Campos obligatorios. Nos comprometemos a responder tu mensaje 
                  dentro de las próximas 24 horas.
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardContainer: {
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
  introTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 10,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  contactGrid: {
    gap: 15,
  },
  contactCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactCardGradient: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactCardTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginTop: 8,
    marginBottom: 5,
    textAlign: 'center',
  },
  contactCardContent: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  formCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4682B4',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 15,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  formNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 50,
  },
});