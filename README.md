# Integração de APIs REST - Pedidos e Estoque

Projeto simples em Node.js simulando integração entre dois serviços REST: API de Pedidos e API de Estoque.

## Estrutura de Diretórios

```
ufg-mod-13/
├── stock-api/
│   ├── package.json
│   └── server.js
├── orders-api/
│   ├── package.json
│   └── server.js
└── README.md
```

## Dependências

- **express**: ^4.18.2 (para ambas as APIs)

## Instalação

### Instalar dependências da API de Estoque
```bash
cd stock-api
npm install
```

### Instalar dependências da API de Pedidos
```bash
cd orders-api
npm install
```

## Execução

### Iniciar a API de Estoque (porta 3001)
```bash
cd stock-api
npm start
```

### Iniciar a API de Pedidos (porta 3000)
```bash
cd orders-api
npm start
```

**Importante**: Inicie primeiro a API de Estoque, pois a API de Pedidos depende dela.

## Endpoints

### API de Estoque (Porta 3001)

- `GET /products/:id` - Retorna dados de um produto
- `GET /health` - Health check

### API de Pedidos (Porta 3000)

- `POST /orders` - Cria um novo pedido
  - Body: `{ "productId": number, "quantity": number }`
- `GET /orders` - Lista todos os pedidos (para verificação)
- `GET /health` - Health check

## Produtos Disponíveis (Fictícios)

| ID | Nome                | Quantidade |
|----|---------------------|------------|
| 1  | Laptop Dell XPS     | 10         |
| 2  | Mouse Logitech      | 50         |
| 3  | Teclado Mecânico    | 25         |
| 4  | Monitor 24"         | 15         |
| 5  | Headset Gamer       | 30         |

## Testes Manuais

### 1. Criar pedido com sucesso (estoque suficiente)
```bash
curl -X POST http://localhost:3000/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"productId\": 1, \"quantity\": 2}"
```
**Resposta esperada**: HTTP 201

### 2. Tentar criar pedido com produto inexistente
```bash
curl -X POST http://localhost:3000/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"productId\": 999, \"quantity\": 1}"
```
**Resposta esperada**: HTTP 404

### 3. Tentar criar pedido com estoque insuficiente
```bash
curl -X POST http://localhost:3000/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"productId\": 1, \"quantity\": 20}"
```
**Resposta esperada**: HTTP 409

### 4. Enviar dados inválidos
```bash
curl -X POST http://localhost:3000/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"productId\": \"abc\", \"quantity\": -1}"
```
**Resposta esperada**: HTTP 400

### 5. Testar falha de comunicação (pare a API de Estoque)
```bash
# Pare a API de Estoque e tente criar um pedido
curl -X POST http://localhost:3000/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"productId\": 1, \"quantity\": 1}"
```
**Resposta esperada**: HTTP 502

### 6. Listar pedidos criados
```bash
curl http://localhost:3000/orders
```

### 7. Consultar produto na API de Estoque
```bash
curl http://localhost:3001/products/1
```

## Códigos de Status HTTP

- **201 Created**: Pedido criado com sucesso
- **400 Bad Request**: Dados inválidos
- **404 Not Found**: Produto não encontrado
- **409 Conflict**: Estoque insuficiente
- **502 Bad Gateway**: Falha na comunicação com API de Estoque
