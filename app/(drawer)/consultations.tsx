import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
  Search, 
  User, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Phone,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DatabaseService } from '@/services/database';
import { Precio } from '@/types/database';
import { consultationStyles as styles } from '@/app/styles/consultations.styles';

type SearchType = 'cedula' | 'name' | 'payment';

interface SearchOption {
  type: SearchType;
  title: string;
  description: string;
  icon: typeof User;
  placeholder: string;
  color: string;
}

interface QuickQuestion {
  question: string;
  icon: typeof MapPin;
  type: string;
}

interface SearchResult {
  message: string;
  isError: boolean;
  data?: any;
}

export default function ConsultationsScreen() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<SearchType>('cedula');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [dbService] = useState(() => DatabaseService.getInstance());

  // Verificar conexión al cargar el componente
  useEffect(() => {
    checkConnection();
    loadPrecios();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await dbService.testConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadPrecios = async () => {
    try {
      const preciosData = await dbService.getPrecios();
      setPrecios(preciosData);
    } catch (error) {
      console.error('Error cargando precios:', error);
    }
  };

  const searchOptions: SearchOption[] = [
    {
      type: 'cedula',
      title: 'Buscar por Cédula',
      description: 'Encuentra información usando el número de cédula',
      icon: User,
      placeholder: 'Ingresa el número de cédula (10 dígitos)',
      color: '#4682B4',
    },
    {
      type: 'name',
      title: 'Buscar por Nombre',
      description: 'Encuentra información usando nombres y apellidos',
      icon: Search,
      placeholder: 'Ingresa el nombre o apellido',
      color: '#87A96B',
    },
    {
      type: 'payment',
      title: 'Estado de Pagos',
      description: 'Consulta deudas pendientes por cédula',
      icon: DollarSign,
      placeholder: 'Ingresa el número de cédula',
      color: '#DAA520',
    },
  ];

  const quickQuestions: QuickQuestion[] = [
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

  const validateInput = (query: string, type: SearchType): boolean => {
    if (!query.trim()) {
      Alert.alert('Error', 'Por favor ingresa un término de búsqueda');
      return false;
    }

    if ((type === 'cedula' || type === 'payment') && query.length !== 10) {
      Alert.alert('Error', 'El número de cédula debe tener exactamente 10 dígitos');
      return false;
    }

    if ((type === 'cedula' || type === 'payment') && !/^\d+$/.test(query)) {
      Alert.alert('Error', 'El número de cédula solo debe contener números');
      return false;
    }

    return true;
  };

  const handleSearch = async () => {
    if (!validateInput(searchQuery, searchType)) {
      return;
    }

    if (!isConnected) {
      Alert.alert(
        'Sin conexión',
        'No se puede conectar con el servidor. Verifica tu conexión e intenta nuevamente.',
        [
          { text: 'Reintentar', onPress: checkConnection },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
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

      setSearchResult({
        message: result,
        isError: false,
      });

    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResult({
        message: 'Error al conectar con el servidor. Verifica tu conexión e intenta nuevamente.',
        isError: true,
      });
      setIsConnected(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickQuestion = async (type: string) => {
    if (!isConnected) {
      Alert.alert('Sin conexión', 'No se puede conectar con el servidor.');
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      let result = '';

      switch (type) {
        case 'availability':
          const bovedas = await dbService.getBovedasDisponibles();
          result = bovedas.length > 0 
            ? `Actualmente tenemos ${bovedas.length} bóvedas disponibles en los sectores: ${bovedas.map(b => b.Division).join(', ')}.`
            : 'No hay información de bóvedas disponibles en este momento.';
          break;

        case 'pricing':
          if (precios.length > 0) {
            const preciosTexto = precios.map(p => `${p.Sector}: $${p.PrecioValor.toFixed(2)}`).join(', ');
            result = `Nuestros precios son: ${preciosTexto}.`;
          } else {
            result = 'No se pudo obtener información de precios. Intenta nuevamente.';
          }
          break;

        case 'schedule':
          result = 'Horarios de atención:\n• Lunes a Viernes: 8:00 AM - 5:00 PM\n• Sábados: 8:00 AM - 2:00 PM\n• Domingos: 9:00 AM - 1:00 PM\n\nPara consultas urgentes fuera de horario, contacta al número de emergencia.';
          break;

        case 'contact':
          result = 'Información de contacto:\n• Teléfono: +593 2 XXX-XXXX\n• Ubicación: La Concordia, Santo Domingo\n• Email: info@cementerio.com\n\nTambién puedes usar nuestro chatbot para consultas rápidas las 24 horas.';
          break;

        default:
          result = 'Consulta no reconocida.';
      }

      setSearchResult({
        message: result,
        isError: false,
      });

    } catch (error) {
      console.error('Error en consulta rápida:', error);
      setSearchResult({
        message: 'Error al obtener la información. Verifica tu conexión e intenta nuevamente.',
        isError: true,
      });
      setIsConnected(false);
    } finally {
      setIsSearching(false);
    }
  };

  const retryConnection = async () => {
    setIsSearching(true);
    await checkConnection();
    if (isConnected) {
      await loadPrecios();
    }
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
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
          <TouchableOpacity onPress={retryConnection} style={styles.backButton}>
            <RefreshCw size={24} color="#4682B4" />
          </TouchableOpacity>
        </View>

        {/* Connection Status */}
        <View style={[
          styles.connectionStatus,
          isConnected ? styles.connectionStatusOnline : styles.connectionStatusOffline
        ]}>
          {isConnected ? <Wifi size={14} color="#2E7D32" /> : <WifiOff size={14} color="#C62828" />}
          <Text style={[
            styles.connectionStatusText,
            isConnected ? styles.connectionStatusTextOnline : styles.connectionStatusTextOffline
          ]}>
            {isConnected ? 'Conectado al servidor' : 'Sin conexión al servidor'}
          </Text>
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
                Encuentra información en tiempo real sobre ubicaciones de familiares, 
                estado de pagos, disponibilidad de bóvedas y más. Nuestro sistema 
                digitalizado conecta directamente con nuestra base de datos para 
                brindarte respuestas precisas las 24 horas.
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
                  clearSearch();
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
                  maxLength={searchType === 'cedula' || searchType === 'payment' ? 10 : undefined}
                  editable={!isSearching}
                />
                <TouchableOpacity
                  style={[styles.searchButton, (isSearching || !isConnected) && styles.searchButtonDisabled]}
                  onPress={handleSearch}
                  disabled={isSearching || !isConnected}
                >
                  <LinearGradient
                    colors={(isSearching || !isConnected) ? ['#CCC', '#999'] : ['#4682B4', '#2F4F4F']}
                    style={styles.searchButtonGradient}
                  >
                    {isSearching ? (
                      <ActivityIndicator size={20} color="#FFFFFF" />
                    ) : (
                      <Search size={20} color="#FFFFFF" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {isSearching && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4682B4" />
                  <Text style={styles.loadingText}>Consultando base de datos...</Text>
                </View>
              )}

              {searchResult && !isSearching && (
                <View style={searchResult.isError ? styles.errorContainer : styles.resultContainer}>
                  <Text style={searchResult.isError ? styles.errorText : styles.resultTitle}>
                    {searchResult.isError ? 'Error:' : 'Resultado:'}
                  </Text>
                  <Text style={searchResult.isError ? styles.errorText : styles.resultText}>
                    {searchResult.message}
                  </Text>
                  {searchResult.isError && (
                    <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
                      <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Quick Questions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consultas Rápidas</Text>
            <Text style={styles.sectionSubtitle}>
              Obtén respuestas inmediatas desde nuestra base de datos
            </Text>
            
            {quickQuestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.questionCard}
                onPress={() => handleQuickQuestion(item.type)}
                disabled={isSearching || !isConnected}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F0F8FF']}
                  style={[
                    styles.questionGradient, 
                    (isSearching || !isConnected) && styles.questionGradientDisabled
                  ]}
                >
                  <item.icon size={22} color="#4682B4" />
                  <Text style={styles.questionText}>{item.question}</Text>
                  {isSearching && (
                    <ActivityIndicator size={16} color="#4682B4" />
                  )}
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