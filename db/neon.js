// db/neon.js
require('dotenv').config();

// Sistema de backup inteligente habilitado
// Para desabilitar, comente a linha abaixo e descomente a implementação original
const smartDb = require('../backup-system/smart-db');
module.exports = smartDb;

/* Implementação original (desabilitada)
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
module.exports = sql;
*/