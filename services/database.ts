import { Cliente, Bobeda, Reserva, HistorialPago, Precio, Mensaje } from '@/types/database';

// Simulación de conexión a SQL Server
// En una implementación real, esto se conectaría a tu base de datos SQL Server
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Simulación de datos para demostración
  private clientes: Cliente[] = [
    { Id: 1, Nombres: 'María', Apellidos: 'González', Clave: '1234567890', Correo: 'maria@email.com' },
    { Id: 2, Nombres: 'José', Apellidos: 'Rodríguez', Clave: '0987654321', Correo: 'jose@email.com' },
  ];

  private bobedas: Bobeda[] = [
    { Id: 1, Division: 'A-1', Estado: 'Ocupada' },
    { Id: 2, Division: 'A-2', Estado: 'Disponible' },
    { Id: 3, Division: 'B-1', Estado: 'Disponible' },
    { Id: 4, Division: 'B-2', Estado: 'Ocupada' },
    { Id: 5, Division: 'C-1', Estado: 'Disponible' },
  ];

  private reservas: Reserva[] = [
    { Id: 1, IdCliente: 1, Nombre: 'Pedro', Apellido: 'González', IdPrecio: 1, EstadoPago: 'Pendiente', FechaReserva: '2025-01-15' },
    { Id: 2, IdCliente: 2, Nombre: 'Ana', Apellido: 'Rodríguez', IdPrecio: 2, EstadoPago: 'Pagado', FechaReserva: '2025-01-10' },
  ];

  private historialPagos: HistorialPago[] = [
    { Id: 1, IdReserva: 2, Monto: 1500.00, FechaPago: '2025-01-10' },
  ];

  private precios: Precio[] = [
    { Id: 1, Sector: 'Sector A', PrecioValor: 2000.00 },
    { Id: 2, Sector: 'Sector B', PrecioValor: 1500.00 },
    { Id: 3, Sector: 'Sector C', PrecioValor: 1000.00 },
  ];

  async getBovedasDisponibles(): Promise<Bobeda[]> {
    return this.bobedas.filter(b => b.Estado === 'Disponible');
  }

  async buscarFamiliarPorCedula(cedula: string): Promise<string> {
    const cliente = this.clientes.find(c => c.Clave === cedula);
    if (!cliente) {
      return 'No se encontró ningún cliente con esa cédula.';
    }

    const reserva = this.reservas.find(r => r.IdCliente === cliente.Id);
    if (!reserva) {
      return `${cliente.Nombres} ${cliente.Apellidos} no tiene reservas registradas.`;
    }

    // Buscar la bóveda asignada (esto requeriría una tabla de relación en la base real)
    return `${reserva.Nombre} ${reserva.Apellido} está ubicado en el Sector relacionado con la reserva #${reserva.Id}.`;
  }

  async buscarFamiliarPorNombre(nombre: string): Promise<string> {
    const reserva = this.reservas.find(r => 
      r.Nombre.toLowerCase().includes(nombre.toLowerCase()) || 
      r.Apellido.toLowerCase().includes(nombre.toLowerCase())
    );
    
    if (!reserva) {
      return `No se encontró ningún familiar con el nombre "${nombre}".`;
    }

    return `${reserva.Nombre} ${reserva.Apellido} está registrado en la reserva #${reserva.Id}.`;
  }

  async consultarDeudasPorCedula(cedula: string): Promise<string> {
    const cliente = this.clientes.find(c => c.Clave === cedula);
    if (!cliente) {
      return 'No se encontró ningún cliente con esa cédula.';
    }

    const reserva = this.reservas.find(r => r.IdCliente === cliente.Id);
    if (!reserva) {
      return `${cliente.Nombres} ${cliente.Apellidos} no tiene reservas registradas.`;
    }

    if (reserva.EstadoPago === 'Pagado') {
      return `${cliente.Nombres} ${cliente.Apellidos} no tiene deudas pendientes.`;
    }

    const precio = this.precios.find(p => p.Id === reserva.IdPrecio);
    const montoDeuda = precio ? precio.PrecioValor : 0;
    
    return `${cliente.Nombres} ${cliente.Apellidos} tiene una deuda pendiente de $${montoDeuda.toFixed(2)} por la reserva #${reserva.Id}.`;
  }

  async guardarMensaje(mensaje: Omit<Mensaje, 'Id' | 'FechaCreacion' | 'Leido'>): Promise<boolean> {
    try {
      // En una implementación real, esto insertaría en la base de datos
      const nuevoMensaje: Mensaje = {
        ...mensaje,
        Id: Date.now(), // ID temporal
        FechaCreacion: new Date().toISOString(),
        Leido: false
      };
      
      console.log('Mensaje guardado:', nuevoMensaje);
      return true;
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      return false;
    }
  }

  async getContextForAI(): Promise<string> {
    const bovedasDisponibles = await this.getBovedasDisponibles();
    const totalBobedas = this.bobedas.length;
    const bovedasOcupadas = this.bobedas.filter(b => b.Estado === 'Ocupada').length;
    
    return `
    Información del cementerio:
    - Total de bóvedas: ${totalBobedas}
    - Bóvedas ocupadas: ${bovedasOcupadas}
    - Bóvedas disponibles: ${bovedasDisponibles.length}
    - Sectores disponibles: ${bovedasDisponibles.map(b => b.Division).join(', ')}
    - Precios por sector: ${this.precios.map(p => `${p.Sector}: $${p.PrecioValor}`).join(', ')}
    `;
  }
}