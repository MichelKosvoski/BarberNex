const db = require("../config/db");

async function ensureProdutosTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      barbearia_id INT NOT NULL,
      nome VARCHAR(120) NOT NULL,
      descricao TEXT NULL,
      preco DECIMAL(10,2) NOT NULL DEFAULT 0,
      estoque INT NOT NULL DEFAULT 0,
      categoria VARCHAR(80) NULL,
      status ENUM('ativo','inativo') DEFAULT 'ativo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_produtos_barbearia
        FOREIGN KEY (barbearia_id) REFERENCES barbearias(id)
        ON DELETE CASCADE
    )
  `);
}

async function ensureUsuariosTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      barbearia_id INT NULL,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      tipo ENUM('cliente','dono','funcionario') NOT NULL,
      status ENUM('ativo','inativo') DEFAULT 'ativo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_usuarios_barbearia
        FOREIGN KEY (barbearia_id) REFERENCES barbearias(id)
        ON DELETE SET NULL
    )
  `);

  const [columns] = await db.query("SHOW COLUMNS FROM usuarios");
  const columnNames = new Set(columns.map((column) => column.Field));

  if (!columnNames.has("telefone")) {
    await db.query("ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20) NULL AFTER email");
  }

  if (!columnNames.has("cpf")) {
    await db.query("ALTER TABLE usuarios ADD COLUMN cpf VARCHAR(20) NULL AFTER telefone");
  }
}

async function ensureBarbeariasCustomizationColumns() {
  const [columns] = await db.query("SHOW COLUMNS FROM barbearias");
  const columnNames = new Set(columns.map((column) => column.Field));

  if (!columnNames.has("cor_primaria")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN cor_primaria VARCHAR(20) NULL AFTER plano",
    );
  }

  if (!columnNames.has("cor_secundaria")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN cor_secundaria VARCHAR(20) NULL AFTER cor_primaria",
    );
  }

  if (!columnNames.has("cor_fundo")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN cor_fundo VARCHAR(20) NULL AFTER cor_secundaria",
    );
  }

  if (!columnNames.has("texto_hero")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN texto_hero VARCHAR(255) NULL AFTER cor_fundo",
    );
  }

  if (!columnNames.has("subtitulo_hero")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN subtitulo_hero VARCHAR(255) NULL AFTER texto_hero",
    );
  }

  if (!columnNames.has("horario_funcionamento")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN horario_funcionamento VARCHAR(120) NULL AFTER subtitulo_hero",
    );
  }

  if (!columnNames.has("exibir_planos_publico")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN exibir_planos_publico TINYINT(1) NOT NULL DEFAULT 1 AFTER horario_funcionamento",
    );
  }

  if (!columnNames.has("titulo_planos_publico")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN titulo_planos_publico VARCHAR(160) NULL AFTER exibir_planos_publico",
    );
  }

  if (!columnNames.has("subtitulo_planos_publico")) {
    await db.query(
      "ALTER TABLE barbearias ADD COLUMN subtitulo_planos_publico VARCHAR(255) NULL AFTER titulo_planos_publico",
    );
  }
}

async function ensurePlanosAssinaturaTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS planos_assinatura (
      id INT AUTO_INCREMENT PRIMARY KEY,
      barbearia_id INT NOT NULL,
      nome VARCHAR(120) NOT NULL,
      descricao TEXT NULL,
      preco DECIMAL(10,2) NOT NULL DEFAULT 0,
      cortes_inclusos INT NOT NULL DEFAULT 0,
      barbas_inclusas INT NOT NULL DEFAULT 0,
      beneficios TEXT NULL,
      recorrencia VARCHAR(30) NOT NULL DEFAULT 'mensal',
      status ENUM('ativo','inativo') DEFAULT 'ativo',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_planos_barbearia
        FOREIGN KEY (barbearia_id) REFERENCES barbearias(id)
        ON DELETE CASCADE
    )
  `);
}

async function ensureClientesAssinaturasTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS clientes_assinaturas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      barbearia_id INT NOT NULL,
      cliente_id INT NOT NULL,
      plano_id INT NOT NULL,
      status ENUM('ativa','pausada','cancelada','vencida') DEFAULT 'ativa',
      cortes_utilizados INT NOT NULL DEFAULT 0,
      barbas_utilizadas INT NOT NULL DEFAULT 0,
      data_inicio DATE NULL,
      data_vencimento DATE NULL,
      observacoes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_clientes_assinaturas_barbearia
        FOREIGN KEY (barbearia_id) REFERENCES barbearias(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_clientes_assinaturas_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_clientes_assinaturas_plano
        FOREIGN KEY (plano_id) REFERENCES planos_assinatura(id)
        ON DELETE CASCADE
    )
  `);
}

async function ensurePdvVendasTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS pdv_vendas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      barbearia_id INT NOT NULL,
      cliente_id INT NULL,
      subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
      desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      forma_pagamento VARCHAR(50) NULL,
      observacoes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pdv_vendas_barbearia
        FOREIGN KEY (barbearia_id) REFERENCES barbearias(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_pdv_vendas_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON DELETE SET NULL
    )
  `);
}

async function ensurePdvVendaItensTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS pdv_venda_itens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      venda_id INT NOT NULL,
      tipo ENUM('servico','produto') NOT NULL,
      referencia_id INT NOT NULL,
      nome VARCHAR(120) NOT NULL,
      quantidade INT NOT NULL DEFAULT 1,
      preco_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
      total_item DECIMAL(10,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pdv_itens_venda
        FOREIGN KEY (venda_id) REFERENCES pdv_vendas(id)
        ON DELETE CASCADE
    )
  `);
}

async function ensureServicosCustomizationColumns() {
  const [columns] = await db.query("SHOW COLUMNS FROM servicos");
  const columnNames = new Set(columns.map((column) => column.Field));

  if (!columnNames.has("imagem")) {
    await db.query(
      "ALTER TABLE servicos ADD COLUMN imagem VARCHAR(120) NULL AFTER categoria",
    );
  }

  await db.query("ALTER TABLE servicos MODIFY COLUMN imagem LONGTEXT NULL");
}

async function ensureMediaColumns() {
  await db.query("ALTER TABLE barbearias MODIFY COLUMN logo LONGTEXT NULL");
  await db.query("ALTER TABLE barbearias MODIFY COLUMN banner LONGTEXT NULL");
  await db.query("ALTER TABLE barbeiros MODIFY COLUMN foto LONGTEXT NULL");
}

async function ensureSchema() {
  await ensureProdutosTable();
  await ensureUsuariosTable();
  await ensureBarbeariasCustomizationColumns();
  await ensureServicosCustomizationColumns();
  await ensureMediaColumns();
  await ensurePlanosAssinaturaTable();
  await ensureClientesAssinaturasTable();
  await ensurePdvVendasTable();
  await ensurePdvVendaItensTable();
}

module.exports = ensureSchema;
