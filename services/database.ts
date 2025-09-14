import { Cliente, Bobeda, Reserva, HistorialPago, Precio, Mensaje } from '@/types/database';

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api'; // IP del servidor

// Interfaces específicas para pagos
export interface PaymentHistoryItem {
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

export interface ClientPaymentInfo {
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

// Interfaces para reservas
export interface ReservaRequest {
  nombreCliente: string;
  apellidoCliente: string;
  cedulaCliente: string;
  correoCliente: string;
  nombreFamiliar: string;
  apellidoFamiliar: string;
  idPrecio: number;
}

export interface ReservaResponse {
  success: boolean;
  message: string;
  reservaId?: number;
  clienteId?: number;
  sector?: string;
}

export interface ClienteRequest {
  Nombres: string;
  Apellidos: string;
  Clave: string;
  Correo: string;
}

export interface ClienteResponse {
  success: boolean;
  clienteId?: number;
  mensaje?: string;
  message?: string;
}

export interface ReservaInfo {
  ReservaId: number;
  NombreFamiliar: string;
  ApellidoFamiliar: string;
  EstadoPago: string;
  FechaReserva: string;
  Sector: string;
  PrecioValor: number;
  ClienteNombres: string;
  ClienteApellidos: string;
  ClienteCorreo: string;
}

// Servicio de conexión a la API real
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Método auxiliar para realizar peticiones HTTP
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

  // ========== MÉTODOS PARA RESERVAS ==========

  // Crear o verificar cliente existente
  async crearCliente(cliente: ClienteRequest): Promise<ClienteResponse> {
    try {
      const response = await this.apiRequest<ClienteResponse>('/clientes', {
        method: 'POST',
        body: JSON.stringify(cliente),
      });
      
      return response;
    } catch (error) {
      console.error('Error creando/verificando cliente:', error);
      return {
        success: false,
        message: 'Error al conectar con el servidor'
      };
    }
  }

  // Crear nueva reserva
  async crearReserva(reserva: ReservaRequest): Promise<ReservaResponse> {
    try {
      const response = await this.apiRequest<ReservaResponse>('/reservas', {
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

  // Obtener reservas de un cliente por cédula
  async getReservasPorCedula(cedula: string): Promise<ReservaInfo[]> {
    try {
      if (!/^\d{10}$/.test(cedula)) {
        throw new Error('Cédula inválida. Debe tener exactamente 10 dígitos');
      }

      const response = await this.apiRequest<{
        success: boolean;
        reservas: ReservaInfo[];
      }>(`/reservas/cliente/${cedula}`);
      
      if (response.success) {
        return response.reservas;
      }
      
      return [];
    } catch (error) {
      console.error('Error obteniendo reservas por cédula:', error);
      return [];
    }
  }

  // Actualizar estado de una reserva
  async actualizarEstadoReserva(reservaId: number, estado: string): Promise<{success: boolean; message: string}> {
    try {
      const validEstados = ['Pendiente', 'Parcial', 'Pagado', 'Cancelado'];
      if (!validEstados.includes(estado)) {
        return {
          success: false,
          message: 'Estado no válido'
        };
      }

      const response = await this.apiRequest<{success: boolean; message: string}>(`/reservas/${reservaId}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado }),
      });
      
      return response;
    } catch (error) {
      console.error('Error actualizando estado de reserva:', error);
      return {
        success: false,
        message: 'Error al conectar con el servidor'
      };
    }
  }

  // ========== MÉTODOS ESPECÍFICOS PARA PAGOS ==========

  // Obtener información completa de pagos por cédula
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

  // Obtener historial de pagos de una reserva específica
  async getPaymentHistory(idReserva: number): Promise<PaymentHistoryItem[]> {
    try {
      const historial = await this.apiRequest<PaymentHistoryItem[]>(`/pagos/reserva/${idReserva}`);
      return historial;
    } catch (error) {
      console.error('Error obteniendo historial de pagos:', error);
      return [];
    }
  }

  // Registrar un nuevo pago
  async registrarPago(pago: {
    IdReserva: number;
    Monto: number;
    FechaPago?: string;
    MetodoPago?: string;
  }): Promise<{success: boolean; message: string; pagoId?: number}> {
    try {
      const response = await this.apiRequest<{
        success: boolean;
        message: string;
        pagoId?: number;
      }>('/pagos', {
        method: 'POST',
        body: JSON.stringify({
          IdReserva: pago.IdReserva,
          Monto: pago.Monto,
          FechaPago: pago.FechaPago || new Date().toISOString(),
          MetodoPago: pago.MetodoPago || 'No especificado'
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

  // Verificar estado de pago de una reserva
  async verificarEstadoPago(idReserva: number): Promise<{
    estadoPago: string;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
  }> {
    try {
      const response = await this.apiRequest<{
        estadoPago: string;
        montoTotal: number;
        montoPagado: number;
        saldoPendiente: number;
      }>(`/pagos/estado/${idReserva}`);
      
      return response;
    } catch (error) {
      console.error('Error verificando estado de pago:', error);
      return {
        estadoPago: 'Error',
        montoTotal: 0,
        montoPagado: 0,
        saldoPendiente: 0
      };
    }
  }

  // Obtener resumen de pagos (para dashboard administrativo)
  async getResumenPagos(): Promise<{
    TotalReservas: number;
    ReservasPagadas: number;
    ReservasPendientes: number;
    TotalRecaudado: number;
    TotalPagos: number;
  }> {
    try {
      const response = await this.apiRequest<{
        TotalReservas: number;
        ReservasPagadas: number;
        ReservasPendientes: number;
        TotalRecaudado: number;
        TotalPagos: number;
      }>('/pagos/resumen');
      
      return response;
    } catch (error) {
      console.error('Error obteniendo resumen de pagos:', error);
      return {
        TotalReservas: 0,
        ReservasPagadas: 0,
        ReservasPendientes: 0,
        TotalRecaudado: 0,
        TotalPagos: 0
      };
    }
  }

  // ========== MÉTODOS EXISTENTES ==========

  // Obtener bóvedas disponibles desde la API
  async getBovedasDisponibles(): Promise<Bobeda[]> {
    try {
      const bóvedas = await this.apiRequest<Bobeda[]>('/bovedas/disponibles');
      return bóvedas;
    } catch (error) {
      console.error('Error obteniendo bóvedas disponibles:', error);
      return [];
    }
  }

  // Buscar familiar por cédula
  async buscarFamiliarPorCedula(cedula: string): Promise<string> {
    try {
      const response = await this.apiRequest<{
        mensaje: string;
        detalles?: any;
      }>(`/familiares/cedula/${cedula}`);
      
      return response.mensaje;
    } catch (error) {
      console.error('Error buscando familiar por cédula:', error);
      return 'Error al conectar con el servidor. Intente nuevamente.';
    }
  }

  // Buscar familiar por nombre
  async buscarFamiliarPorNombre(nombre: string): Promise<string> {
    try {
      const response = await this.apiRequest<{
        mensaje: string;
        resultados?: any[];
      }>(`/familiares/nombre/${encodeURIComponent(nombre)}`);
      
      if (response.resultados && response.resultados.length > 0) {
        const resultados = response.resultados.map(r => 
          `${r.Nombre} ${r.Apellido} - ${r.Sector} (Reserva #${r.ReservaId})`
        ).join('\n');
        
        return `${response.mensaje}:\n${resultados}`;
      }
      
      return response.mensaje;
    } catch (error) {
      console.error('Error buscando familiar por nombre:', error);
      return 'Error al conectar con el servidor. Intente nuevamente.';
    }
  }

  // Consultar deudas por cédula
  async consultarDeudasPorCedula(cedula: string): Promise<string> {
    try {
      const response = await this.apiRequest<{
        mensaje: string;
        deuda?: number;
        detalles?: any;
      }>(`/deudas/cedula/${cedula}`);
      
      return response.mensaje;
    } catch (error) {
      console.error('Error consultando deudas:', error);
      return 'Error al conectar con el servidor. Intente nuevamente.';
    }
  }

  // Guardar mensaje
  async guardarMensaje(mensaje: Omit<Mensaje, 'Id' | 'FechaCreacion' | 'Leido'>): Promise<boolean> {
    try {
      const response = await this.apiRequest<{
        success: boolean;
        mensaje: string;
      }>('/mensajes', {
        method: 'POST',
        body: JSON.stringify({
          NombreCompleto: mensaje.NombreCompleto,
          CorreoElectronico: mensaje.CorreoElectronico,
          Telefono: mensaje.Telefono,
          Mensaje: mensaje.Mensaje,
        }),
      });
      
      return response.success;
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      return false;
    }
  }

  // Obtener precios
  async getPrecios(): Promise<Precio[]> {
    try {
      const precios = await this.apiRequest<Precio[]>('/precios');
      return precios;
    } catch (error) {
      console.error('Error obteniendo precios:', error);
      return [];
    }
  }

  // Obtener contexto para AI (estadísticas y datos generales)
  async getContextForAI(): Promise<string> {
    try {
      const response = await this.apiRequest<{
        contexto: string;
        estadisticas: any;
        precios: Precio[];
        disponibles: any[];
      }>('/contexto');
      
      return response.contexto;
    } catch (error) {
      console.error('Error obteniendo contexto:', error);
      return 'Error al obtener información del cementerio.';
    }
  }

  // Método para probar la conexión con la API
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.apiRequest<{ mensaje: string }>('/test');
      console.log('Conexión exitosa:', response.mensaje);
      return true;
    } catch (error) {
      console.error('Error de conexión:', error);
      return false;
    }
  }

  // Método para probar la conexión con la base de datos
  async testDatabaseConnection(): Promise<boolean> {
    try {
      const response = await this.apiRequest<{ 
        success: boolean; 
        mensaje: string; 
        datos: any 
      }>('/test-db');
      
      console.log('Conexión BD exitosa:', response.mensaje);
      return response.success;
    } catch (error) {
      console.error('Error de conexión a BD:', error);
      return false;
    }
  }
}