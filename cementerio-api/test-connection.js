const sql = require('mssql');

const config = {
    server: 'DESKTOP-KCIE6KA\\RUBEN',
    database: 'San_Agustin',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: 'RUBEN'
    },
    authentication: {
        type: 'ntlm',
        options: {
            domain: 'DESKTOP-KCIE6KA',
            userName: 'HP',
            password: ''
        }
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

async function testConnection() {
    try {
        console.log('Probando conexión...');
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT 1 as test');
        console.log('✅ Conexión exitosa:', result.recordset);
        await pool.close();
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testConnection();