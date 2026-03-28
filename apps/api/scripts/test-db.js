const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Erro: DATABASE_URL não encontrada nem passada como argumento.');
  console.log('Uso: node scripts/test-db.js "sua_url_aqui"');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

async function test() {
  console.log('--- 🛡️ Teste de Conexão Mucunã ---');
  console.log(`Conectando a: ${connectionString.split('@')[1] || 'URL Inválida'}`);
  
  try {
    const start = Date.now();
    const client = await pool.connect();
    const duration = Date.now() - start;
    
    console.log(`✅ Conexão estabelecida com sucesso! (${duration}ms)`);
    
    const res = await client.query('SELECT current_database(), current_user, version()');
    console.log('--- 📊 Estatísticas ---');
    console.log('Banco:', res.rows[0].current_database);
    console.log('Usuário:', res.rows[0].current_user);
    console.log('SGBD:', res.rows[0].version.split(',')[0]);
    
    client.release();
  } catch (err) {
    console.error('❌ FALHA NA CONEXÃO:', err.message);
    console.log('--- 🔍 Dicas de Diagnóstico ---');
    if (err.message.includes('ECONNREFUSED')) {
      console.log('1. Verifique se a porta (5432) está correta.');
      console.log('2. Verifique se o Firewall do banco permite seu IP.');
    } else if (err.message.includes('authentication failed')) {
      console.log('1. A senha ou usuário estão incorretos.');
      console.log('2. Verifique se existem caracteres especiais na senha (use %40 para @).');
    }
  } finally {
    await pool.end();
    console.log('--- 🏁 Fim do Teste ---');
  }
}

test();
