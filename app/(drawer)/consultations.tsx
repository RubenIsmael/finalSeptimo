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
import { ArrowLeft, Search, User, MapPin, DollarSign, Calendar, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DatabaseService } from '@/services/database';

export default function ConsultationsScreen() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'cedula' | 'name' | 'payment'>('cedula');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const searchOptions = [
    {
      type: 'cedula' as const,
      title: 'Buscar por Cédula',
      description: 'Encuentra información usando el número de cédula',
      icon: User,
      placeholder: 'Ingresa el número de cédula (10 dígitos)',
      color: '#4682B4',
    },
    {
      type: 'name' as const,
      title: 'Buscar por Nombre',
      description: 'Encuentra información usando nombres y apellidos',
      icon: Search,
      placeholder: 'Ingresa el nombre o apellido',
      color: '#87A96B',
    },
    {
      type: 'payment' as const,
      title: 'Estado de Pagos',
      description: 'Consulta deudas pendientes por cédula',
      icon: DollarSign,
      placeholder: 'Ingresa el número de cédula',
      color: '#DAA520',
    },
  ];

  const quickQuestions = [
    {
      question: '¿Cuántas bóvedas están disponibles?',
      icon: MapPin,
      type: 'availability',
    },
    {
      question: '¿Cuáles son los precios por sector?',
      icon: DollarSign,
      type: 'pricing',
    },
    {
      question: '¿Cuáles son los horarios de atención?',
      icon: Calendar,
      type: 'schedule',
    },
    {
      question: '¿Cómo puedo contactarlos?',
      icon: Phone,
      type: 'contact',
    },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Por favor ingresa un término de búsqueda');
      return;
    }

    setIsSearching(true);
    try {
      const dbService = DatabaseService.getInstance();
      let result = '';

      switch (searchType) {
        case 'cedula':
          result = await dbService.buscarFamiliarPorCedula(searchQuery.trim());
          break;
        case 'name':
          result = await dbService.buscarFamiliarPorNombre(searchQuery.trim());
          break;
        case 'payment':
          result = await dbService.consultarDeudasPorCedula(searchQuery.trim());
          break;
      }

      setSearchResult(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la consulta. Intenta nuevamente.');
      setSearchResult('');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickQuestion = async (type: string) => {
    setIsSearching(true);
    try {
      const dbService = DatabaseService.getInstance();
      let result = '';

      switch (type) {
        case 'availability':
          const bovedas = await dbService.getBovedasDisponibles();
          result = `Actualmente tenemos ${bovedas.length} bóvedas disponibles en los sectores: ${bovedas.map(b => b.Division).join(', ')}.`;
          break;
        case 'pricing':
          result = 'Nuestros precios son: Sector A (Premium) $2,000, Sector B (Estándar) $1,500, Sector C (Económico) $1,000.';
          break;
        case 'schedule':
          result = 'Horarios: Lunes a Viernes 8:00 AM - 5:00 PM, Sábados 8:00 AM - 2:00 PM, Domingos 9:00 AM - 1:00 PM.';
          break;
        case 'contact':
          result = 'Puedes contactarnos al +593 2 XXX-XXXX o visitarnos en La Concordia, Santo Domingo. También puedes usar nuestro chatbot para consultas rápidas.';
          break;
      }

      setSearchResult(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la información.');
    } finally {
      setIsSearching(false);
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
          <Text style={styles.headerTitle}>Consultas</Text>
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
                <Search size={28} color="#4682B4" />
                <Text style={styles.introTitle}>Sistema de Consultas</Text>
              </View>
              <Text style={styles.introText}>
                Encuentra información rápida y confiable sobre ubicaciones de familiares, 
                estado de pagos, disponibilidad de bóvedas y más. Nuestro sistema 
                digitalizado te permite obtener respuestas inmediatas las 24 horas.
              </Text>
            </LinearGradient>
          </View>

          {/* Search Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opciones de Búsqueda</Text>
            {searchOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionCard,
                  searchType === option.type && styles.optionCardSelected
                ]}
                onPress={() => {
                  setSearchType(option.type);
                  setSearchResult('');
                  setSearchQuery('');
                }}
              >
                <LinearGradient
                  colors={searchType === option.type 
                    ? [option.color, `${option.color}20`] 
                    : ['#FFFFFF', '#F0F8FF']
                  }
                  style={styles.optionGradient}
                >
                  <option.icon 
                    size={24} 
                    color={searchType === option.type ? '#FFFFFF' : option.color} 
                  />
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionTitle,
                      searchType === option.type && styles.optionTitleSelected
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      searchType === option.type && styles.optionDescriptionSelected
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search Input */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#FFFFFF', '#F5F5DC']}
              style={styles.searchCard}
            >
              <Text style={styles.searchTitle}>
                {searchOptions.find(opt => opt.type === searchType)?.title}
              </Text>
              
              <View style={styles.searchInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchOptions.find(opt => opt.type === searchType)?.placeholder}
                  placeholderTextColor="#999"
                  keyboardType={searchType === 'cedula' || searchType === 'payment' ? 'numeric' : 'default'}
                />
                <TouchableOpacity
                  style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
                  onPress={handleSearch}
                  disabled={isSearching}
                >
                  <LinearGradient
                    colors={isSearching ? ['#CCC', '#999'] : ['#4682B4', '#2F4F4F']}
                    style={styles.searchButtonGradient}
                  >
                    <Search size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {isSearching && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Buscando...</Text>
                </View>
              )}

              {searchResult && !isSearching && (
                <View style={styles.resultContainer}>
                  <Text style={styles.resultTitle}>Resultado:</Text>
                  <Text style={styles.resultText}>{searchResult}</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Quick Questions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consultas Rápidas</Text>
            <Text style={styles.sectionSubtitle}>
              Haz clic en cualquier pregunta para obtener una respuesta inmediata
            </Text>
            
            {quickQuestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.questionCard}
                onPress={() => handleQuickQuestion(item.type)}
                disabled={isSearching}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={[styles.questionGradient, isSearching && styles.questionGradientDisabled]}
                >
                  <item.icon size={22} color="#4682B4" />
                  <Text style={styles.questionText}>{item.question}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Help */}
          <View style={styles.section}>
            <LinearGradient
              colors={['#87CEEB', '#F5F5DC']}
              style={styles.helpCard}
            >
              <Text style={styles.helpTitle}>¿Necesitas más ayuda?</Text>
              <Text style={styles.helpText}>
                Si no encuentras la información que buscas, nuestro chatbot con 
                inteligencia artificial puede ayudarte con consultas más específicas 
                o complejas. También puedes contactar directamente con nuestro 
                personal especializado.
              </Text>
              <View style={styles.helpButtons}>
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => {
                    // El chatbot ya está disponible flotando
                    Alert.alert(
                      'Chatbot disponible',
                      'Puedes usar el botón de chat flotante en la esquina inferior derecha para hacer consultas con inteligencia artificial.'
                    );
                  }}
                >
                  <LinearGradient
                    colors={['#4682B4', '#2F4F4F']}
                    style={styles.helpButtonGradient}
                  >
                    <Text style={styles.helpButtonText}>Usar Chatbot IA</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => router.push('/contact')}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F8FF']}
                    style={styles.helpButtonGradient}
                  >
                    <Text style={[styles.helpButtonText, { color: '#4682B4' }]}>
                      Contactar Personal
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
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
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
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
  optionCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionCardSelected: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  optionDescriptionSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  searchCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  searchTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FAFAFA',
  },
  searchButton: {
    borderRadius: 10,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  resultContainer: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4682B4',
  },
  resultTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 20,
  },
  questionCard: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 12,
  },
  questionGradientDisabled: {
    opacity: 0.6,
  },
  questionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  helpCard: {
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  helpTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#4682B4',
    marginBottom: 12,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4682B4',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  helpButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  helpButton: {
    flex: 1,
    borderRadius: 10,
  },
  helpButtonGradient: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 50,
  },
});