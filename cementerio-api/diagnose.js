const sql = require('mssql');
const { execSync } = require('child_process');

async function diagnose() {
    console.log('=== DIAGNÓSTICO SQL SERVER ===\n');
    
    // 1. Verificar servicios
    console.log('1. Verificando servicios SQL Server...');
    try {
        const services = execSync('sc query "MSSQL$RUBEN"', { encoding: 'utf8' });
        console.log('Servicio SQL Server (RUBEN):', services.includes('RUNNING') ? 'EJECUTÁNDOSE' : 'DETENIDO');
    } catch (error) {
        console.log('Error verificando servicio:', error.message);
    }
    
    try {
        const browser = execSync('sc query "SQLBrowser"', { encoding: 'utf8' });
        console.log('SQL Server Browser:', browser.includes('RUNNING') ? 'EJECUTÁNDOSE' : 'DETENIDO');
    } catch (error) {
        console.log('SQL Browser no encontrado o detenido');
    }
    
    // 2. Verificar puertos
    console.log('\n2. Verificando puertos...');
    try {
        const netstat = execSync('netstat -an | findstr 1433', { encoding: 'utf8' });
        if (netstat) {
            console.log('Puerto 1433 está abierto:');
            console.log(netstat);
        } else {
            console.log('Puerto 1433 NO está abierto');
        }
    } catch (error) {
        console.log('Puerto 1433 NO está abierto');
    }
    
    // 3. Probar diferentes configuraciones
    console.log('\n3. Probando configuraciones de conexión...');
    
    const configs = [
        {
            name: 'Pipe nombrado local',
            server: '(local)\\RUBEN',
            database: 'San_Agustin',
            options: {
                encrypt: false,
                trustServerCertificate: true,
                integratedSecurity: true
            }
        },
        {
            name: 'TCP/IP localhost',
            server: 'localhost,1433\\RUBEN',
            database: 'San_Agustin',
            options: {
                encrypt: false,
                trustServerCertificate: true,
                integratedSecurity: true
            }
        },
        {
            name: 'Instancia directa',
            server: '.\\RUBEN',
            database: 'San_Agustin',
            options: {
                encrypt: false,
                trustServerCertificate: true,
                integratedSecurity: true
            }
        },
        {
            name: 'IP local con puerto',
            server: '127.0.0.1',
            port: 1433,
            database: 'San_Agustin',
            options: {
                encrypt: false,
                trustServerCertificate: true,
                instanceName: 'RUBEN',
                integratedSecurity: true
            }
        }
    ];
    
    for (const config of configs) {
        try {
            console.log(`\nProbando: ${config.name}`);
            console.log(`Servidor: ${config.server}`);
            
            const pool = await sql.connect(config);
            const result = await pool.request().query('SELECT @@VERSION as Version, GETDATE() as Fecha');
            
            console.log('✅ CONEXIÓN EXITOSA!');
            console.log('Versión SQL Server:', result.recordset[0].Version.substring(0, 50) + '...');
            console.log('Fecha servidor:', result.recordset[0].Fecha);
            
            await pool.close();
            
            console.log('\n🎯 CONFIGURACIÓN FUNCIONAL ENCONTRADA:');
            console.log(JSON.stringify(config, null, 2));
            return config;
            
        } catch (error) {
            console.log('❌ Falló:', error.message);
        }
    }
    
    console.log('\n💡 SOLUCIONES SUGERIDAS:');
    console.log('1. Ejecuta como administrador: net start "MSSQL$RUBEN"');
    console.log('2. Ejecuta como administrador: net start "SQLBrowser"');
    console.log('3. En SQL Server Configuration Manager:');
    console.log('   - Habilita TCP/IP para RUBEN');
    console.log('   - Configura puerto 1433 en TCP/IP');
    console.log('   - Reinicia servicio SQL Server');
    console.log('4. En Windows Firewall:');
    console.log('   - Permite aplicación sqlservr.exe');
    console.log('   - Permite puerto 1433');
}

diagnose().catch(console.error);