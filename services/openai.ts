const OPENAI_API_KEY = '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';

export interface ChatMessage {
  role: 'user' | 'assistant';
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
      - Disponibilidad de bóvedas
      - Estado de pagos y deudas pendientes
      - Ubicación de familiares en el cementerio
      - Información sobre reservas y contratos
      - Precios y servicios
      
      Siempre responde de manera empática, respetuosa y con un tono cálido, considerando que las personas pueden estar pasando por momentos difíciles.
      
      ${context ? `Información actual de la base de datos: ${context}` : ''}`;

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

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu consulta en este momento.';
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return 'Disculpa, estoy experimentando dificultades técnicas. Por favor, intenta nuevamente o contacta directamente con nuestro personal.';
    }
  }
}