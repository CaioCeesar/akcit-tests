const express = require('express');
const app = express();

const PORT = 3001;

// Dados fictícios de produtos em memória
const products = {
  1: { id: 1, name: 'Laptop Dell XPS', quantity: 10 },
  2: { id: 2, name: 'Mouse Logitech', quantity: 50 },
  3: { id: 3, name: 'Teclado Mecânico', quantity: 25 },
  4: { id: 4, name: 'Monitor 24"', quantity: 15 },
  5: { id: 5, name: 'Headset Gamer', quantity: 30 },
  6: { id: 6, name: 'Cabo USB', quantity: 1 }
};

// Endpoint para buscar produto por ID
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const product = products[productId];

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  res.json(product);
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'stock-api' });
});

// Exportar app para testes
module.exports = app;

// Iniciar servidor apenas se não estiver em modo de teste
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API de Estoque rodando na porta ${PORT}`);
  });
}
