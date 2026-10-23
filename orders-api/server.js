const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3000;
const STOCK_API_URL = process.env.STOCK_API_URL || 'http://localhost:3001';

// Armazenamento de pedidos em memória
let orders = [];
let orderIdCounter = 1;

// Fetch customizável para testes
let customFetch = null;

// Função para definir fetch customizado (para testes)
function setCustomFetch(fetchFn) {
  customFetch = fetchFn;
}

// Função para resetar o estado (para testes)
function resetOrders() {
  orders = [];
  orderIdCounter = 1;
  customFetch = null;
}

// Validação dos dados do pedido
function validateOrderData(data) {
  if (data.productId === undefined || data.productId === null || typeof data.productId !== 'number') {
    return { valid: false, error: 'productId é obrigatório e deve ser um número' };
  }
  if (!data.quantity || typeof data.quantity !== 'number' || data.quantity <= 0) {
    return { valid: false, error: 'quantity é obrigatório e deve ser um número positivo' };
  }
  return { valid: true };
}

// Endpoint para criar pedido
app.post('/orders', async (req, res) => {
  const validation = validateOrderData(req.body);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  const { productId, quantity } = req.body;

  try {
    // Consultar API de estoque (usando fetch customizado se definido para testes)
    const fetchFn = customFetch || fetch;
    const stockResponse = await fetchFn(`${STOCK_API_URL}/products/${productId}`);

    if (stockResponse.status === 404) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (!stockResponse.ok) {
      return res.status(502).json({ error: 'Falha ao comunicar com API de estoque' });
    }

    const product = await stockResponse.json();

    // Verificar estoque
    if (product.quantity < quantity) {
      return res.status(409).json({
        error: 'Estoque insuficiente',
        available: product.quantity,
        requested: quantity
      });
    }

    // Criar pedido
    const order = {
      id: orderIdCounter++,
      productId,
      quantity,
      productName: product.name,
      createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json({
      message: 'Pedido criado com sucesso',
      order
    });

  } catch (error) {
    console.error('Erro ao processar pedido:', error);
    res.status(502).json({ error: 'Falha ao comunicar com API de estoque' });
  }
});

// Endpoint para listar pedidos (opcional, para verificação)
app.get('/orders', (req, res) => {
  res.json(orders);
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'orders-api' });
});

// Exportar app e funções auxiliares para testes
module.exports = { app, resetOrders, setCustomFetch };

// Iniciar servidor apenas se não estiver em modo de teste
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API de Pedidos rodando na porta ${PORT}`);
  });
}
