import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Send, X } from 'lucide-react-native';
import { DatabaseService } from '@/services/database';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  waitingFor?: 'cedula' | 'nombre' | 'datos_reserva';
}

export default function FloatingChatBot() {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Bienvenido al Cementerio San Agustín! 👋\n\nSoy tu asistente virtual. Puedo ayudarte con:\n\n📋 Consultas de deudas y pagos\n🔍 Ubicación de familiares\n💵 Precios por sector\n🏛️ Bóvedas disponibles\n📝 Información para reservas\n\n¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<{
    waitingFor?: 'cedula' | 'nombre' | 'datos_reserva' | 'confirmar_reserva';
    intentType?: string;
    tempData?: any;
  }>({});
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Detectar intención del usuario
  const detectIntent = (message: string) => {
    const lower = message.toLowerCase();
    
    // Detectar cédula
    const cedula = message.match(/\b\d{10}\b/)?.[0];
    
    return {
      cedula,
      quiereSaldos: lower.includes('sald') || lower.includes('deud') || 
                   lower.includes('pag') || lower.includes('deb') ||
                   lower.includes('pendiente'),
      quiereBuscarFamiliar: lower.includes('familiar') || lower.includes('donde') || 
                          lower.includes('ubicac') || lower.includes('buscar') ||
                          lower.includes('sector') || lower.includes('está'),
      quiereBovedas: lower.includes('bóveda') || lower.includes('boveda') || 
                    lower.includes('disponib') || lower.includes('cuant'),
      quierePrecios: lower.includes('precio') || lower.includes('cost') || 
                    lower.includes('valor') || lower.includes('cuanto cuesta'),
      quiereReservar: lower.includes('reserv') || lower.includes('apartar') ||
                     lower.includes('contrat') || lower.includes('adquirir'),
      saludo: lower.includes('hola') || lower.includes('buen') || 
             lower.includes('ayuda') || lower === 'hi',
      confirmacion: lower === 'si' || lower === 'sí' || lower === 'ok' || 
                   lower === 'dale' || lower === 'confirmo',
      negacion: lower === 'no' || lower.includes('cancel') || lower.includes('mejor no')
    };
  };

  // Procesar respuesta basada en contexto
  const processContextualResponse = async (message: string) => {
    const dbService = DatabaseService.getInstance();
    const intent = detectIntent(message);
    
    // Si estamos esperando algo específico
    if (conversationContext.waitingFor === 'cedula') {
      if (intent.cedula) {
        // Tenemos la cédula, procesar según el tipo de consulta original
        if (conversationContext.intentType === 'saldos') {
          const deudaInfo = await dbService.consultarDeudasPorCedula(intent.cedula);
          
          if (deudaInfo.includes('no se encontró')) {
            setConversationContext({});
            return `No encontré registros para la cédula ${intent.cedula}.\n\n¿Deseas intentar con otra cédula o necesitas ayuda con algo más?`;
          }
          
          // Intentar obtener más información
          try {
            const paymentInfo = await dbService.getClientPaymentInfo(intent.cedula);
            if (paymentInfo) {
              let response = `📊 **Información de cuenta**\n\n`;
              response += `Cliente: ${paymentInfo.clientName}\n`;
              response += `Cédula: ${intent.cedula}\n\n`;
              
              if (paymentInfo.pendingAmount > 0) {
                response += `💰 **Saldo pendiente:** $${paymentInfo.pendingAmount.toFixed(2)}\n`;
                response += `✅ Total pagado: $${paymentInfo.totalPaid.toFixed(2)}\n`;
                
                if (paymentInfo.reservaInfo) {
                  response += `📍 Sector: ${paymentInfo.reservaInfo.Sector}\n`;
                  response += `💵 Precio total: $${paymentInfo.reservaInfo.PrecioValor.toFixed(2)}\n`;
                }
                
                if (paymentInfo.paymentHistory.length > 0) {
                  response += `\n📅 Últimos pagos:\n`;
                  paymentInfo.paymentHistory.slice(0, 3).forEach(pago => {
                    response += `• $${pago.Monto.toFixed(2)} - ${new Date(pago.FechaPago).toLocaleDateString()}\n`;
                  });
                }
              } else {
                response += `✅ **No tiene deudas pendientes**\n`;
                response += `Cuenta al día`;
              }
              
              setConversationContext({});
              return response + '\n\n¿Necesitas algo más?';
            }
          } catch (error) {
            console.log('Error obteniendo detalles de pago');
          }
          
          setConversationContext({});
          return deudaInfo + '\n\n¿Necesitas consultar algo más?';
        } 
        else if (conversationContext.intentType === 'buscarFamiliar') {
          const familiarInfo = await dbService.buscarFamiliarPorCedula(intent.cedula);
          setConversationContext({});
          return familiarInfo + '\n\n¿Hay algo más en lo que pueda ayudarte?';
        }
      } else if (intent.negacion) {
        setConversationContext({});
        return 'Entendido. ¿En qué más puedo ayudarte?';
      } else {
        return 'Por favor, proporciona una cédula de 10 dígitos para continuar.\n\nEjemplo: 1234567890';
      }
    }
    
    else if (conversationContext.waitingFor === 'nombre') {
      if (intent.negacion) {
        setConversationContext({});
        return 'Entendido. ¿En qué más puedo ayudarte?';
      }
      
      // Extraer el nombre (quitar palabras comunes)
      const palabrasComunes = ['buscar', 'a', 'el', 'la', 'mi', 'familiar'];
      const palabras = message.split(' ').filter(p => 
        !palabrasComunes.includes(p.toLowerCase()) && p.length > 2
      );
      
      if (palabras.length > 0) {
        const nombre = palabras.join(' ');
        const resultado = await dbService.buscarFamiliarPorNombre(nombre);
        
        setConversationContext({});
        
        if (resultado.includes('no se encontró')) {
          return `No encontré registros para "${nombre}".\n\n` +
                 `Puedes intentar con:\n` +
                 `• Solo el apellido\n` +
                 `• Nombre completo\n` +
                 `• O proporcionar la cédula del responsable\n\n` +
                 `¿Deseas intentar de otra forma?`;
        }
        
        return resultado + '\n\n¿Necesitas algo más?';
      } else {
        return 'Por favor, proporciona el nombre completo del familiar que buscas.';
      }
    }
    
    else if (conversationContext.waitingFor === 'datos_reserva') {
      if (intent.negacion) {
        setConversationContext({});
        return 'Entendido. Si cambias de opinión, estoy aquí para ayudarte.\n\n¿Hay algo más que necesites?';
      }
      
      // Aquí explicar el proceso de reserva
      setConversationContext({});
      return `📝 **Proceso para realizar una reserva:**\n\n` +
             `Para hacer una reserva necesitas:\n\n` +
             `1️⃣ **Documentos requeridos:**\n` +
             `   • Cédula del solicitante\n` +
             `   • Datos del familiar fallecido\n` +
             `   • Comprobante de domicilio\n\n` +
             `2️⃣ **Información necesaria:**\n` +
             `   • Sector de preferencia\n` +
             `   • Forma de pago (contado/crédito)\n\n` +
             `3️⃣ **Pasos a seguir:**\n` +
             `   • Visitar nuestras oficinas\n` +
             `   • Seleccionar la bóveda disponible\n` +
             `   • Firmar contrato\n` +
             `   • Realizar primer pago\n\n` +
             `📍 **Horario de atención:**\n` +
             `Lunes a Viernes: 8:00 AM - 5:00 PM\n` +
             `Sábados: 8:00 AM - 2:00 PM\n\n` +
             `¿Te gustaría información sobre precios o bóvedas disponibles?`;
    }
    
    return null;
  };

  // Procesar mensaje principal
  const processMessage = async (message: string) => {
    const dbService = DatabaseService.getInstance();
    const intent = detectIntent(message);
    
    console.log('Intención detectada:', intent);
    console.log('Contexto actual:', conversationContext);
    
    // Primero verificar si hay respuesta contextual
    const contextualResponse = await processContextualResponse(message);
    if (contextualResponse) {
      return contextualResponse;
    }
    
    // CONSULTA DE SALDOS/DEUDAS
    if (intent.quiereSaldos) {
      if (intent.cedula) {
        // Tiene cédula, buscar directamente
        const deudaInfo = await dbService.consultarDeudasPorCedula(intent.cedula);
        
        if (!deudaInfo.includes('no se encontró')) {
          try {
            const paymentInfo = await dbService.getClientPaymentInfo(intent.cedula);
            if (paymentInfo) {
              let response = `📊 **Información de cuenta**\n\n`;
              response += `Cliente: ${paymentInfo.clientName}\n`;
              
              if (paymentInfo.pendingAmount > 0) {
                response += `\n💰 **Saldo pendiente:** $${paymentInfo.pendingAmount.toFixed(2)}\n`;
                response += `✅ Total pagado: $${paymentInfo.totalPaid.toFixed(2)}\n`;
                
                if (paymentInfo.reservaInfo) {
                  response += `📍 Sector: ${paymentInfo.reservaInfo.Sector}\n`;
                }
              } else {
                response += `\n✅ **No tiene deudas pendientes**`;
              }
              
              return response + '\n\n¿Necesitas algo más?';
            }
          } catch (error) {
            console.log('Error obteniendo detalles');
          }
        }
        
        return deudaInfo + '\n\n¿Deseas consultar algo más?';
      } else {
        // No tiene cédula, pedirla
        setConversationContext({ waitingFor: 'cedula', intentType: 'saldos' });
        return '📋 Para consultar tus saldos pendientes, necesito tu número de cédula.\n\n' +
               'Por favor, proporciona tu cédula de 10 dígitos:';
      }
    }
    
    // BUSCAR FAMILIAR
    else if (intent.quiereBuscarFamiliar) {
      if (intent.cedula) {
        const resultado = await dbService.buscarFamiliarPorCedula(intent.cedula);
        return resultado + '\n\n¿Hay algo más en lo que pueda ayudarte?';
      } else {
        // Verificar si hay un nombre en el mensaje
        const palabrasComunes = ['donde', 'esta', 'está', 'mi', 'familiar', 'buscar', 'encuentro'];
        const palabras = message.split(' ').filter(p => 
          !palabrasComunes.includes(p.toLowerCase()) && p.length > 2
        );
        
        if (palabras.length >= 2) {
          // Parece que hay un nombre
          const nombre = palabras.join(' ');
          const resultado = await dbService.buscarFamiliarPorNombre(nombre);
          
          if (resultado.includes('no se encontró')) {
            setConversationContext({ waitingFor: 'nombre', intentType: 'buscarFamiliar' });
            return `No encontré registros para "${nombre}".\n\n` +
                   `¿Podrías proporcionarme:\n` +
                   `• El nombre completo del familiar\n` +
                   `• O la cédula del responsable (10 dígitos)?`;
          }
          
          return resultado + '\n\n¿Necesitas algo más?';
        } else {
          setConversationContext({ waitingFor: 'nombre', intentType: 'buscarFamiliar' });
          return '🔍 Para buscar a tu familiar, necesito más información.\n\n' +
                 'Por favor proporciona:\n' +
                 '• El nombre completo del familiar\n' +
                 '• O la cédula del responsable (10 dígitos)';
        }
      }
    }
    
    // CONSULTA DE BÓVEDAS
    else if (intent.quiereBovedas) {
      const bovedas = await dbService.getBovedasDisponibles();
      
      if (bovedas.length > 0) {
        const sectores = [...new Set(bovedas.map(b => b.Division))];
        
        let response = '🏛️ **BÓVEDAS DISPONIBLES**\n\n';
        response += `✅ Tenemos ${bovedas.length} bóvedas disponibles\n\n`;
        response += '📍 **Distribución por sectores:**\n';
        
        sectores.forEach(sector => {
          const cantidad = bovedas.filter(b => b.Division === sector).length;
          response += `• ${sector}: ${cantidad} ${cantidad === 1 ? 'bóveda' : 'bóvedas'}\n`;
        });
        
        response += '\n¿Te gustaría información sobre precios o hacer una reserva?';
        return response;
      } else {
        return '❌ En este momento no hay bóvedas disponibles.\n\n' +
               'Te sugiero:\n' +
               '• Contactar con nuestras oficinas para lista de espera\n' +
               '• Llamar al: +593 2 XXX-XXXX\n\n' +
               '¿Necesitas algo más?';
      }
    }
    
    // CONSULTA DE PRECIOS
    else if (intent.quierePrecios) {
      const precios = await dbService.getPrecios();
      
      if (precios.length > 0) {
        let response = '💵 **LISTA DE PRECIOS POR SECTOR**\n\n';
        
        const preciosBajos = precios.filter(p => p.PrecioValor <= 100);
        const preciosMedios = precios.filter(p => p.PrecioValor > 100 && p.PrecioValor <= 500);
        const preciosAltos = precios.filter(p => p.PrecioValor > 500);
        
        if (preciosBajos.length > 0) {
          response += '🟢 **Económicos** (hasta $100):\n';
          preciosBajos.forEach(p => {
            response += `• ${p.Sector}: $${p.PrecioValor.toFixed(2)}\n`;
          });
        }
        
        if (preciosMedios.length > 0) {
          response += '\n🟡 **Estándar** ($100-$500):\n';
          preciosMedios.forEach(p => {
            response += `• ${p.Sector}: $${p.PrecioValor.toFixed(2)}\n`;
          });
        }
        
        if (preciosAltos.length > 0) {
          response += '\n🔴 **Premium** (más de $500):\n';
          preciosAltos.forEach(p => {
            response += `• ${p.Sector}: $${p.PrecioValor.toFixed(2)}\n`;
          });
        }
        
        response += '\n¿Te interesa algún sector en particular?';
        return response;
      } else {
        return 'No pude obtener la lista de precios.\n' +
               'Por favor contacta a nuestras oficinas:\n' +
               '📞 +593 2 XXX-XXXX';
      }
    }
    
    // QUIERE HACER RESERVA
    else if (intent.quiereReservar) {
      setConversationContext({ waitingFor: 'datos_reserva', intentType: 'reservar' });
      return '📝 Me alegra que quieras hacer una reserva.\n\n' +
             'Las reservas se realizan presencialmente en nuestras oficinas.\n\n' +
             '¿Te gustaría conocer:\n' +
             '• Los requisitos necesarios\n' +
             '• El proceso de reserva\n' +
             '• Los horarios de atención?\n\n' +
             'Responde "Sí" para ver esta información.';
    }
    
    // SALUDO
    else if (intent.saludo) {
      return '¡Hola! 👋 Bienvenido al asistente del Cementerio San Agustín.\n\n' +
             'Puedo ayudarte con:\n' +
             '• 💰 Consultar saldos y deudas\n' +
             '• 🔍 Ubicar familiares\n' +
             '• 🏛️ Ver bóvedas disponibles\n' +
             '• 💵 Lista de precios\n' +
             '• 📝 Información para reservas\n\n' +
             '¿Qué necesitas hoy?';
    }
    
    // SI HAY CÉDULA SOLA
    else if (intent.cedula) {
      const familiarInfo = await dbService.buscarFamiliarPorCedula(intent.cedula);
      const deudaInfo = await dbService.consultarDeudasPorCedula(intent.cedula);
      
      let response = `📊 Información para cédula ${intent.cedula}:\n\n`;
      response += familiarInfo;
      
      if (!deudaInfo.includes('no tiene deudas')) {
        response += '\n\n' + deudaInfo;
      }
      
      return response + '\n\n¿Necesitas información adicional?';
    }
    
    // NO SE ENTIENDE LA CONSULTA
    return '❓ No entendí bien tu consulta.\n\n' +
           'Puedo ayudarte si me dices:\n' +
           '• "Necesito saber mis saldos"\n' +
           '• "¿Dónde está [nombre del familiar]?"\n' +
           '• "¿Hay bóvedas disponibles?"\n' +
           '• "¿Cuáles son los precios?"\n' +
           '• "Quiero hacer una reserva"\n\n' +
           'O proporciona una cédula de 10 dígitos para consultas específicas.';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await processMessage(userMessage.text);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '❌ Hubo un problema al procesar tu consulta.\n\nPor favor intenta de nuevo o contacta nuestras oficinas.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <>
      <Animated.View style={[styles.floatingButton, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={() => {
            animateButton();
            setIsVisible(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#87CEEB', '#4682B4']}
            style={styles.gradientButton}
          >
            <MessageCircle size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.chatContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Asistente Virtual</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
                <X size={24} color="#4682B4" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              style={styles.messagesContainer} 
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageWrapper,
                    message.isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      message.isUser ? styles.userMessage : styles.botMessage,
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      message.isUser ? styles.userMessageText : styles.botMessageText,
                    ]}>
                      {message.text}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Escribiendo...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Escribe tu consulta..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                disabled={!inputText.trim() || isLoading}
              >
                <LinearGradient
                  colors={(!inputText.trim() || isLoading) ? ['#CCC', '#999'] : ['#87A96B', '#5F7F3F']}
                  style={styles.sendButtonGradient}
                >
                  <Send size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4682B4',
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageWrapper: {
    marginBottom: 15,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 5,
  },
  userMessage: {
    backgroundColor: '#4682B4',
  },
  botMessage: {
    backgroundColor: '#F5F5DC',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 5,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  sendButton: {
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});