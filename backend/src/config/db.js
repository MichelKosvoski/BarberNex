// Importa biblioteca mysql2 para conectar no MySQL
const mysql = require("mysql2");

// Cria um pool de conexões
// Pool melhora performance quando muitos usuários acessam
const pool = mysql.createPool({
  host: "localhost", // endereço do banco
  user: "root", // usuário do MySQL
  password: "Minhasenha1384$", // senha do banco
  database: "nexbarber", // banco que criamos
  waitForConnections: true, // aguarda conexão disponível
  connectionLimit: 10, // máximo de conexões simultâneas
  queueLimit: 0,
});

// Exporta conexão usando Promise (async/await)
module.exports = pool.promise();
