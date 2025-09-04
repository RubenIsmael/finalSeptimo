export interface Cliente {
  Id: number;
  Nombres: string;
  Apellidos: string;
  Clave: string;
  Correo: string;
}

export interface Bobeda {
  Id: number;
  Division: string;
  Estado: string;
}

export interface Reserva {
  Id: number;
  IdCliente: number;
  Nombre: string;
  Apellido: string;
  IdPrecio: number;
  EstadoPago: string;
  FechaReserva: string;
}

export interface HistorialPago {
  Id: number;
  IdReserva: number;
  Monto: number;
  FechaPago: string;
}

export interface Precio {
  Id: number;
  Sector: string;
  PrecioValor: number;
}

export interface Mensaje {
  Id: number;
  NombreCompleto: string;
  CorreoElectronico: string;
  Telefono: string;
  Mensaje: string;
  FechaCreacion: string;
  Leido: boolean;
}

export interface TipoBobeda {
  Id: number;
  Nombre: string;
  Descripcion: string;
}