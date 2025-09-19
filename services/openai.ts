// services/openai.ts
const OPENAI_API_KEY = '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';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;

  private constructor() {
    this.apiKey = OPENAI_API_KEY;
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async sendMessage(message: string, context?: string): Promise<string> {
    try {
      const systemPrompt = `Eres un asistente virtual del Cementerio Parroquial San Agustín en La Concordia. 
      Tu función es ayudar a las familias con información sobre:
      - Disponibilidad de bóvedas y sus precios
      - Estado de pagos y deudas pendientes
      - Ubicación de familiares en el cementerio
      - Información sobre reservas y contratos
      - Precios por sector
      
      IMPORTANTE: Cuando te proporcione información de la base de datos, debes usarla para responder de manera precisa.
      Siempre responde de manera empática, respetuosa y con un tono cálido.
      
      ${context ? `INFORMACIÓN ACTUAL DE LA BASE DE DATOS:\n${context}` : ''}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error(errorData.error?.message || 'Error en OpenAI API');
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('OpenAI Error:', data.error);
        throw new Error(data.error.message);
      }
      
      return data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta en este momento.';
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      
      // Si OpenAI falla, devolver la información de la BD directamente
      if (context && context.length > 0) {
        return `Información del sistema:\n${context}`;
      }
      
      return 'Disculpa, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente o contacta directamente con nuestro personal.';
    }
  }
}