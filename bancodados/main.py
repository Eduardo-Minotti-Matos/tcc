import sqlite3

conexao = sqlite3.connect("bancodados/banco.db")
cursor = conexao.cursor()

cursor.execute("""CREATE TABLE IF NOT EXISTS user (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                senha_hash TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                cpf TEXT NOT NULL UNIQUE,
                telefone TEXT,
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP               
               ) """)

cursor.execute("""CREATE TABLE IF NOT EXISTS produto (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descricao TEXT,
                preco INTEGER NOT NULL,
                estoque INTEGER DEFAULT 0,
                data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
               )""")

cursor.execute("""CREATE TABLE IF NOT EXISTS carrinho (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                produto_id INTEGER NOT NULL,
                quantidade INTEGER NOT NULL DEFAULT 1,
                data_adicionado DATETIME DEFAULT CURRENT_TIMESTAMP,
    
                FOREIGN KEY (usuario_id) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
)""")


conexao.commit()