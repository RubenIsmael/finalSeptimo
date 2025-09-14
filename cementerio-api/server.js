const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    server: 'localhost',
    port: 1433,
    database: 'San_Agustin',
    user: 'cementerio_user',
    password: 'Cementerio123!',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

let poolPromise;

async function initializeDatabase() {
    try {
        console.log('Conectando a SQL Server...');
        console.log('Servidor:', dbConfig.server);
        console.log('Base de datos:', dbConfig.database);
        console.log('Usuario:', dbConfig.user);
        
        const pool = new sql.ConnectionPool(dbConfig);
        await pool.connect();
        
        const result = await pool.request().query(`
            SELECT 
                @@SERVERNAME as Servidor,
                DB_NAME() as BaseDatos,
                SUSER_NAME() as Usuario,
                GETDATE() as Fecha
        `);
        
        console.log('✅ Conectado exitosamente a SQL Server');
        console.log('Usuario conectado:', result.recordset[0].Usuario);
        
        poolPromise = Promise.resolve(pool);
        return pool;
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        throw error;
    }
}

async function checkConnection(req, res, next) {
    try {
        if (!poolPromise) {
            await initializeDatabase();
        }
        const pool = await poolPromise;
        req.dbPool = pool;
        next();
    } catch (error) {
        res.status(500).json({ 
            error: 'Error de conexión a la base de datos',
            message: error.message
        });
    }
}

// RUTAS
app.get('/api/test', (req, res) => {
    res.json({ 
        mensaje: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/test-db', checkConnection, async (req, res) => {
    try {
        const result = await req.dbPool.request().query(`
            SELECT 
                @@SERVERNAME as Servidor,
                DB_NAME() as BaseDatos,
                SUSER_NAME() as Usuario,
                GETDATE() as Fecha
        `);
        
        res.json({
            success: true,
            mensaje: 'Conexión exitosa',
            datos: result.recordset[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/bovedas/disponibles', checkConnection, async (req, res) => {
    try {
        const result = await req.dbPool.request()
            .query("SELECT * FROM Bobedas WHERE Estado = 'Disponible'");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al obtener bóvedas disponibles',
            message: err.message
        });
    }
});

app.get('/api/familiares/cedula/:cedula', checkConnection, async (req, res) => {
    try {
        const { cedula } = req.params;
        
        if (!/^\d{10}$/.test(cedula)) {
            return res.status(400).json({
                error: 'Cédula inválida',
                message: 'La cédula debe tener exactamente 10 dígitos'
            });
        }
        
        const result = await req.dbPool.request()
            .input('cedula', sql.NVarChar, cedula)
            .query(`
                SELECT c.Nombres, c.Apellidos, r.Nombre as NombreFamiliar, 
                       r.Apellido as ApellidoFamiliar, r.Id as ReservaId,
                       p.Sector, p.PrecioValor
                FROM Clientes c
                INNER JOIN Reservas r ON c.Id = r.IdCliente
                INNER JOIN Precios p ON r.IdPrecio = p.Id
                WHERE c.Clave = @cedula
            `);
        
        if (result.recordset.length > 0) {
            const data = result.recordset[0];
            res.json({
                mensaje: `${data.NombreFamiliar} ${data.ApellidoFamiliar} está ubicado en ${data.Sector}`,
                detalles: data
            });
        } else {
            res.json({ 
                mensaje: 'No se encontró ningún cliente con esa cédula.'
            });
        }
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al buscar familiar por cédula',
            message: err.message
        });
    }
});

app.get('/api/familiares/nombre/:nombre', checkConnection, async (req, res) => {
    try {
        const { nombre } = req.params;
        
        const result = await req.dbPool.request()
            .input('nombre', sql.NVarChar, `%${nombre}%`)
            .query(`
                SELECT r.Nombre, r.Apellido, r.Id as ReservaId,
                       p.Sector, c.Nombres as ClienteNombre, c.Apellidos as ClienteApellido
                FROM Reservas r
                INNER JOIN Clientes c ON r.IdCliente = c.Id
                INNER JOIN Precios p ON r.IdPrecio = p.Id
                WHERE r.Nombre LIKE @nombre OR r.Apellido LIKE @nombre
            `);
        
        if (result.recordset.length > 0) {
            res.json({
                mensaje: `Se encontraron ${result.recordset.length} resultado(s)`,
                resultados: result.recordset
            });
        } else {
            res.json({ 
                mensaje: `No se encontró ningún familiar con el nombre "${nombre}".`
            });
        }
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al buscar familiar por nombre',
            message: err.message
        });
    }
});

app.get('/api/deudas/cedula/:cedula', checkConnection, async (req, res) => {
    try {
        const { cedula } = req.params;
        
        if (!/^\d{10}$/.test(cedula)) {
            return res.status(400).json({
                error: 'Cédula inválida',
                message: 'La cédula debe tener exactamente 10 dígitos'
            });
        }
        
        const result = await req.dbPool.request()
            .input('cedula', sql.NVarChar, cedula)
            .query(`
                SELECT c.Nombres, c.Apellidos, r.EstadoPago, 
                       r.Id as ReservaId, p.PrecioValor,
                       r.FechaReserva, p.Sector
                FROM Clientes c
                INNER JOIN Reservas r ON c.Id = r.IdCliente
                INNER JOIN Precios p ON r.IdPrecio = p.Id
                WHERE c.Clave = @cedula
            `);
        
        if (result.recordset.length > 0) {
            const data = result.recordset[0];
            if (data.EstadoPago === 'Pagado') {
                res.json({
                    mensaje: `${data.Nombres} ${data.Apellidos} no tiene deudas pendientes.`,
                    deuda: 0
                });
            } else {
                res.json({
                    mensaje: `${data.Nombres} ${data.Apellidos} tiene una deuda pendiente de $${data.PrecioValor.toFixed(2)}`,
                    deuda: data.PrecioValor,
                    detalles: data
                });
            }
        } else {
            res.json({ 
                mensaje: 'No se encontró ningún cliente con esa cédula.'
            });
        }
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al consultar deudas',
            message: err.message
        });
    }
});

app.get('/api/precios', checkConnection, async (req, res) => {
    try {
        const result = await req.dbPool.request()
            .query('SELECT * FROM Precios ORDER BY PrecioValor');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al obtener precios',
            message: err.message
        });
    }
});

app.post('/api/mensajes', checkConnection, async (req, res) => {
    try {
        const { NombreCompleto, CorreoElectronico, Telefono, Mensaje } = req.body;
        
        if (!NombreCompleto || !CorreoElectronico || !Telefono || !Mensaje) {
            return res.status(400).json({
                error: 'Todos los campos son obligatorios'
            });
        }
        
        const result = await req.dbPool.request()
            .input('nombreCompleto', sql.NVarChar, NombreCompleto)
            .input('correo', sql.NVarChar, CorreoElectronico)
            .input('telefono', sql.NVarChar, Telefono)
            .input('mensaje', sql.NVarChar, Mensaje)
            .input('fechaCreacion', sql.DateTime2, new Date())
            .input('leido', sql.Bit, false)
            .query(`
                INSERT INTO Mensajes (NombreCompleto, CorreoElectronico, Telefono, Mensaje, FechaCreacion, Leido)
                OUTPUT INSERTED.Id
                VALUES (@nombreCompleto, @correo, @telefono, @mensaje, @fechaCreacion, @leido)
            `);
        
        res.json({ 
            success: true, 
            mensaje: 'Mensaje guardado exitosamente',
            id: result.recordset[0].Id
        });
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al guardar mensaje',
            message: err.message
        });
    }
});

app.get('/api/contexto', checkConnection, async (req, res) => {
    try {
        const bovedasResult = await req.dbPool.request()
            .query(`
                SELECT 
                    COUNT(*) as Total,
                    SUM(CASE WHEN Estado = 'Ocupada' THEN 1 ELSE 0 END) as Ocupadas,
                    SUM(CASE WHEN Estado = 'Disponible' THEN 1 ELSE 0 END) as Disponibles
                FROM Bobedas
            `);
        
        const preciosResult = await req.dbPool.request()
            .query('SELECT Sector, PrecioValor FROM Precios');
        
        const disponiblesResult = await req.dbPool.request()
            .query("SELECT Division FROM Bobedas WHERE Estado = 'Disponible'");
        
        const stats = bovedasResult.recordset[0];
        
        res.json({
            contexto: `
            Información del cementerio San Agustín:
            - Total de bóvedas: ${stats.Total}
            - Bóvedas ocupadas: ${stats.Ocupadas}
            - Bóvedas disponibles: ${stats.Disponibles}
            - Sectores disponibles: ${disponiblesResult.recordset.map(b => b.Division).join(', ')}
            - Precios por sector: ${preciosResult.recordset.map(p => `${p.Sector}: $${p.PrecioValor}`).join(', ')}
            `,
            estadisticas: stats,
            precios: preciosResult.recordset,
            disponibles: disponiblesResult.recordset
        });
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al obtener contexto',
            message: err.message
        });
    }
});

async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(port, () => {
            console.log(`\n🚀 Servidor ejecutándose en http://localhost:${port}`);
            console.log(`✅ Base de datos conectada exitosamente`);
            console.log(`🔗 Prueba: http://localhost:${port}/api/test-db`);
        });
    } catch (error) {
        app.listen(port, () => {
            console.log(`🚀 Servidor en http://localhost:${port} (sin BD)`);
        });
    }
}

process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    try {
        if (poolPromise) {
            const pool = await poolPromise;
            await pool.close();
        }
    } catch (error) {
        console.error('Error cerrando conexión:', error);
    }
    process.exit(0);
});

// Obtener información completa de pagos de un cliente por cédula
app.get('/api/pagos/cliente/:cedula', checkConnection, async (req, res) => {
    try {
        const { cedula } = req.params;
        
        if (!/^\d{10}$/.test(cedula)) {
            return res.status(400).json({
                success: false,
                message: 'Cédula inválida. Debe tener exactamente 10 dígitos'
            });
        }
        
        // Obtener información del cliente y su reserva
        const clienteResult = await req.dbPool.request()
            .input('cedula', sql.NVarChar, cedula)
            .query(`
                SELECT 
                    c.Nombres, 
                    c.Apellidos, 
                    c.Clave,
                    r.Id as ReservaId,
                    r.Nombre as NombreFamiliar,
                    r.Apellido as ApellidoFamiliar,
                    r.EstadoPago,
                    r.FechaReserva,
                    p.Sector,
                    p.PrecioValor
                FROM Clientes c
                INNER JOIN Reservas r ON c.Id = r.IdCliente
                INNER JOIN Precios p ON r.IdPrecio = p.Id
                WHERE c.Clave = @cedula
            `);
        
        if (clienteResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró ningún cliente con esa cédula.'
            });
        }
        
        const clienteData = clienteResult.recordset[0];
        
        // Obtener historial de pagos
        const pagosResult = await req.dbPool.request()
            .input('idReserva', sql.Int, clienteData.ReservaId)
            .query(`
                SELECT 
                    hp.Id,
                    hp.IdReserva,
                    hp.Monto,
                    hp.FechaPago
                FROM HistorialPagos hp
                WHERE hp.IdReserva = @idReserva
                ORDER BY hp.FechaPago DESC
            `);
        
        // Calcular totales
        const totalPagado = pagosResult.recordset.reduce((sum, pago) => sum + parseFloat(pago.Monto), 0);
        const saldoPendiente = Math.max(0, clienteData.PrecioValor - totalPagado);
        
        const clientPaymentInfo = {
            clientName: `${clienteData.Nombres} ${clienteData.Apellidos}`,
            cedula: clienteData.Clave,
            totalPaid: totalPagado,
            pendingAmount: saldoPendiente,
            paymentHistory: pagosResult.recordset.map(pago => ({
                Id: pago.Id,
                IdReserva: pago.IdReserva,
                Monto: parseFloat(pago.Monto),
                FechaPago: pago.FechaPago,
                ReservaInfo: {
                    NombreFamiliar: clienteData.NombreFamiliar,
                    ApellidoFamiliar: clienteData.ApellidoFamiliar,
                    Sector: clienteData.Sector
                }
            })),
            reservaInfo: {
                Id: clienteData.ReservaId,
                EstadoPago: clienteData.EstadoPago,
                FechaReserva: clienteData.FechaReserva,
                Sector: clienteData.Sector,
                PrecioValor: parseFloat(clienteData.PrecioValor)
            }
        };
        
        res.json({
            success: true,
            data: clientPaymentInfo,
            message: 'Información de pagos obtenida exitosamente'
        });
        
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener información de pagos del cliente',
            error: err.message
        });
    }
});

// Obtener historial de pagos de una reserva específica
app.get('/api/pagos/reserva/:idReserva', checkConnection, async (req, res) => {
    try {
        const { idReserva } = req.params;
        
        const result = await req.dbPool.request()
            .input('idReserva', sql.Int, parseInt(idReserva))
            .query(`
                SELECT 
                    hp.Id,
                    hp.IdReserva,
                    hp.Monto,
                    hp.FechaPago,
                    r.Nombre as NombreFamiliar,
                    r.Apellido as ApellidoFamiliar,
                    p.Sector
                FROM HistorialPagos hp
                INNER JOIN Reservas r ON hp.IdReserva = r.Id
                INNER JOIN Precios pr ON r.IdPrecio = pr.Id
                WHERE hp.IdReserva = @idReserva
                ORDER BY hp.FechaPago DESC
            `);
        
        const paymentHistory = result.recordset.map(pago => ({
            Id: pago.Id,
            IdReserva: pago.IdReserva,
            Monto: parseFloat(pago.Monto),
            FechaPago: pago.FechaPago,
            ReservaInfo: {
                NombreFamiliar: pago.NombreFamiliar,
                ApellidoFamiliar: pago.ApellidoFamiliar,
                Sector: pago.Sector
            }
        }));
        
        res.json(paymentHistory);
        
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al obtener historial de pagos',
            message: err.message
        });
    }
});

// Registrar un nuevo pago
app.post('/api/pagos', checkConnection, async (req, res) => {
    try {
        const { IdReserva, Monto, FechaPago, MetodoPago } = req.body;
        
        if (!IdReserva || !Monto) {
            return res.status(400).json({
                success: false,
                message: 'IdReserva y Monto son campos obligatorios'
            });
        }
        
        // Verificar que la reserva existe
        const reservaResult = await req.dbPool.request()
            .input('idReserva', sql.Int, IdReserva)
            .query('SELECT Id, EstadoPago FROM Reservas WHERE Id = @idReserva');
        
        if (reservaResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la reserva especificada'
            });
        }
        
        // Insertar el pago
        const result = await req.dbPool.request()
            .input('idReserva', sql.Int, IdReserva)
            .input('monto', sql.Decimal(10, 2), parseFloat(Monto))
            .input('fechaPago', sql.DateTime2, FechaPago ? new Date(FechaPago) : new Date())
            .query(`
                INSERT INTO HistorialPagos (IdReserva, Monto, FechaPago)
                OUTPUT INSERTED.Id
                VALUES (@idReserva, @monto, @fechaPago)
            `);
        
        const pagoId = result.recordset[0].Id;
        
        // Verificar si se completó el pago total
        const totalPagosResult = await req.dbPool.request()
            .input('idReserva', sql.Int, IdReserva)
            .query(`
                SELECT 
                    SUM(hp.Monto) as TotalPagado,
                    p.PrecioValor as MontoTotal
                FROM HistorialPagos hp
                INNER JOIN Reservas r ON hp.IdReserva = r.Id
                INNER JOIN Precios p ON r.IdPrecio = p.Id
                WHERE hp.IdReserva = @idReserva
                GROUP BY p.PrecioValor
            `);
        
        // Actualizar estado de pago si es necesario
        if (totalPagosResult.recordset.length > 0) {
            const { TotalPagado, MontoTotal } = totalPagosResult.recordset[0];
            
            if (parseFloat(TotalPagado) >= parseFloat(MontoTotal)) {
                await req.dbPool.request()
                    .input('idReserva', sql.Int, IdReserva)
                    .query(`UPDATE Reservas SET EstadoPago = 'Pagado' WHERE Id = @idReserva`);
            } else {
                await req.dbPool.request()
                    .input('idReserva', sql.Int, IdReserva)
                    .query(`UPDATE Reservas SET EstadoPago = 'Parcial' WHERE Id = @idReserva`);
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Pago registrado exitosamente',
            pagoId: pagoId
        });
        
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: 'Error al registrar el pago',
            error: err.message
        });
    }
});

// Verificar estado de pago de una reserva
app.get('/api/pagos/estado/:idReserva', checkConnection, async (req, res) => {
    try {
        const { idReserva } = req.params;
        
        const result = await req.dbPool.request()
            .input('idReserva', sql.Int, parseInt(idReserva))
            .query(`
                SELECT 
                    r.EstadoPago,
                    p.PrecioValor as MontoTotal,
                    ISNULL(SUM(hp.Monto), 0) as MontoPagado
                FROM Reservas r
                INNER JOIN Precios p ON r.IdPrecio = p.Id
                LEFT JOIN HistorialPagos hp ON r.Id = hp.IdReserva
                WHERE r.Id = @idReserva
                GROUP BY r.EstadoPago, p.PrecioValor
            `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({
                error: 'No se encontró la reserva especificada'
            });
        }
        
        const data = result.recordset[0];
        const montoTotal = parseFloat(data.MontoTotal);
        const montoPagado = parseFloat(data.MontoPagado);
        const saldoPendiente = Math.max(0, montoTotal - montoPagado);
        
        res.json({
            estadoPago: data.EstadoPago,
            montoTotal: montoTotal,
            montoPagado: montoPagado,
            saldoPendiente: saldoPendiente
        });
        
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al verificar estado de pago',
            message: err.message
        });
    }
});

// Obtener resumen de pagos (para dashboard administrativo)
app.get('/api/pagos/resumen', checkConnection, async (req, res) => {
    try {
        const result = await req.dbPool.request()
            .query(`
                SELECT 
                    COUNT(DISTINCT r.Id) as TotalReservas,
                    COUNT(DISTINCT CASE WHEN r.EstadoPago = 'Pagado' THEN r.Id END) as ReservasPagadas,
                    COUNT(DISTINCT CASE WHEN r.EstadoPago = 'Pendiente' OR r.EstadoPago = 'Parcial' THEN r.Id END) as ReservasPendientes,
                    SUM(hp.Monto) as TotalRecaudado,
                    COUNT(hp.Id) as TotalPagos
                FROM Reservas r
                LEFT JOIN HistorialPagos hp ON r.Id = hp.IdReserva
            `);
        
        res.json(result.recordset[0]);
        
    } catch (err) {
        res.status(500).json({ 
            error: 'Error al obtener resumen de pagos',
            message: err.message
        });
    }
});
// Crear o verificar cliente existente
app.post('/api/clientes', checkConnection, async (req, res) => {
    try {
        const { Nombres, Apellidos, Clave, Correo } = req.body;
        
        if (!Nombres || !Apellidos || !Clave || !Correo) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar formato de cédula ecuatoriana
        if (!/^\d{10}$/.test(Clave)) {
            return res.status(400).json({
                success: false,
                message: 'Cédula inválida. Debe tener exactamente 10 dígitos'
            });
        }

        // Verificar si el cliente ya existe
        const existingClient = await req.dbPool.request()
            .input('clave', sql.NVarChar, Clave)
            .query('SELECT Id FROM Clientes WHERE Clave = @clave');

        if (existingClient.recordset.length > 0) {
            // Cliente ya existe, retornar su ID
            res.json({
                success: true,
                clienteId: existingClient.recordset[0].Id,
                mensaje: 'Cliente existente encontrado'
            });
        } else {
            // Crear nuevo cliente
            const result = await req.dbPool.request()
                .input('nombres', sql.NVarChar, Nombres.trim())
                .input('apellidos', sql.NVarChar, Apellidos.trim())
                .input('clave', sql.NVarChar, Clave)
                .input('correo', sql.NVarChar, Correo.trim())
                .query(`
                    INSERT INTO Clientes (Nombres, Apellidos, Clave, Correo)
                    OUTPUT INSERTED.Id
                    VALUES (@nombres, @apellidos, @clave, @correo)
                `);

            res.json({
                success: true,
                clienteId: result.recordset[0].Id,
                mensaje: 'Cliente creado exitosamente'
            });
        }

    } catch (err) {
        console.error('Error en /api/clientes:', err);
        res.status(500).json({
            success: false,
            message: 'Error al procesar cliente',
            error: err.message
        });
    }
});

// Crear nueva reserva
app.post('/api/reservas', checkConnection, async (req, res) => {
    try {
        const { 
            nombreCliente, 
            apellidoCliente, 
            cedulaCliente, 
            correoCliente,
            nombreFamiliar, 
            apellidoFamiliar, 
            idPrecio 
        } = req.body;
        
        // Validaciones
        if (!nombreCliente || !apellidoCliente || !cedulaCliente || !correoCliente || 
            !nombreFamiliar || !apellidoFamiliar || !idPrecio) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Crear o obtener cliente
        const clienteResponse = await fetch(`http://localhost:${port}/api/clientes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Nombres: nombreCliente,
                Apellidos: apellidoCliente,
                Clave: cedulaCliente,
                Correo: correoCliente
            })
        });

        const clienteData = await clienteResponse.json();
        
        if (!clienteData.success) {
            return res.status(400).json({
                success: false,
                message: clienteData.message
            });
        }

        // Verificar que el precio existe
        const precioResult = await req.dbPool.request()
            .input('idPrecio', sql.Int, idPrecio)
            .query('SELECT Id, Sector FROM Precios WHERE Id = @idPrecio');

        if (precioResult.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Precio/Sector no válido'
            });
        }

        // Crear la reserva
        const reservaResult = await req.dbPool.request()
            .input('idCliente', sql.Int, clienteData.clienteId)
            .input('nombre', sql.NVarChar, nombreFamiliar.trim())
            .input('apellido', sql.NVarChar, apellidoFamiliar.trim())
            .input('idPrecio', sql.Int, idPrecio)
            .input('estadoPago', sql.NVarChar, 'Pendiente')
            .input('fechaReserva', sql.DateTime2, new Date())
            .query(`
                INSERT INTO Reservas (IdCliente, Nombre, Apellido, IdPrecio, EstadoPago, FechaReserva)
                OUTPUT INSERTED.Id
                VALUES (@idCliente, @nombre, @apellido, @idPrecio, @estadoPago, @fechaReserva)
            `);

        const reservaId = reservaResult.recordset[0].Id;

        res.json({
            success: true,
            message: 'Reserva creada exitosamente',
            reservaId: reservaId,
            clienteId: clienteData.clienteId,
            sector: precioResult.recordset[0].Sector
        });

    } catch (err) {
        console.error('Error en /api/reservas:', err);
        res.status(500).json({
            success: false,
            message: 'Error al crear la reserva',
            error: err.message
        });
    }
});

// Obtener reservas de un cliente
app.get('/api/reservas/cliente/:cedula', checkConnection, async (req, res) => {
    try {
        const { cedula } = req.params;
        
        if (!/^\d{10}$/.test(cedula)) {
            return res.status(400).json({
                success: false,
                message: 'Cédula inválida'
            });
        }

        const result = await req.dbPool.request()
            .input('cedula', sql.NVarChar, cedula)
            .query(`
                SELECT 
                    r.Id as ReservaId,
                    r.Nombre as NombreFamiliar,
                    r.Apellido as ApellidoFamiliar,
                    r.EstadoPago,
                    r.FechaReserva,
                    p.Sector,
                    p.PrecioValor,
                    c.Nombres as ClienteNombres,
                    c.Apellidos as ClienteApellidos,
                    c.Correo as ClienteCorreo
                FROM Reservas r
                INNER JOIN Clientes c ON r.IdCliente = c.Id
                INNER JOIN Precios p ON r.IdPrecio = p.Id
                WHERE c.Clave = @cedula
                ORDER BY r.FechaReserva DESC
            `);

        res.json({
            success: true,
            reservas: result.recordset
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservas',
            error: err.message
        });
    }
});

// Actualizar estado de reserva
app.put('/api/reservas/:id/estado', checkConnection, async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const validEstados = ['Pendiente', 'Parcial', 'Pagado', 'Cancelado'];
        if (!validEstados.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        const result = await req.dbPool.request()
            .input('id', sql.Int, parseInt(id))
            .input('estado', sql.NVarChar, estado)
            .query(`
                UPDATE Reservas 
                SET EstadoPago = @estado 
                WHERE Id = @id
            `);

        if (result.rowsAffected[0] > 0) {
            res.json({
                success: true,
                message: 'Estado actualizado exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado',
            error: err.message
        });
    }
});
startServer();