const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || 'San_Agustin',
    user: process.env.DB_USER || 'cementerio_user',
    password: process.env.DB_PASSWORD || 'Cementerio123!',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    connectionTimeout: 15000,
    requestTimeout: 15000
};

let poolPromise;

async function initializeDatabase() {
    try {
        console.log('Conectando a SQL Server...');
        console.log('Servidor:', `${dbConfig.server}:${dbConfig.port}`);
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

startServer();