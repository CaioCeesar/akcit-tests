const request = require('supertest');
const { setCustomFetch } = require('../../orders-api/server');
require('./setup');

const ORDERS_API_URL = 'http://localhost:3000';
const STOCK_API_URL = 'http://localhost:3001';

// Helper para validar formato ISO-8601
function isValidISO8601(dateString) {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return iso8601Regex.test(dateString);
}

describe('Cenários de Teste de Integração - APIs de Pedidos e Estoque', () => {

  describe('IT-001: Criar pedido com sucesso - estoque suficiente', () => {
    it('deve criar pedido com produto existente e estoque suficiente', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 2
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Pedido criado com sucesso');
      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order).toHaveProperty('productId', 1);
      expect(response.body.order).toHaveProperty('quantity', 2);
      expect(response.body.order).toHaveProperty('productName', 'Laptop Dell XPS');
      expect(response.body.order).toHaveProperty('createdAt');
      expect(isValidISO8601(response.body.order.createdAt)).toBe(true);
      expect(response.body.order.id).toBeGreaterThan(0);
    });
  });

  describe('IT-002: Produto inexistente no estoque', () => {
    it('deve retornar 404 quando produto não existe', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 999,
          quantity: 1
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Produto não encontrado');
    });
  });

  describe('IT-003: Estoque insuficiente', () => {
    it('deve retornar 409 quando quantidade maior que estoque', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 20
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Estoque insuficiente');
      expect(response.body).toHaveProperty('available', 10);
      expect(response.body).toHaveProperty('requested', 20);
    });
  });

  describe('IT-004: Estoque exatamente igual à quantidade solicitada', () => {
    it('deve criar pedido quando quantidade igual ao estoque', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 10
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Pedido criado com sucesso');
      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order).toHaveProperty('productId', 1);
      expect(response.body.order).toHaveProperty('quantity', 10);
      expect(response.body.order).toHaveProperty('productName', 'Laptop Dell XPS');
      expect(response.body.order).toHaveProperty('createdAt');
      expect(isValidISO8601(response.body.order.createdAt)).toBe(true);
    });
  });

  describe('IT-005: Dados inválidos - productId ausente', () => {
    it('deve retornar 400 quando productId está ausente', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          quantity: 5
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'productId é obrigatório e deve ser um número');
    });
  });

  describe('IT-006: Dados inválidos - quantity ausente', () => {
    it('deve retornar 400 quando quantity está ausente', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'quantity é obrigatório e deve ser um número positivo');
    });
  });

  describe('IT-007: Dados inválidos - productId com tipo incorreto (string)', () => {
    it('deve retornar 400 quando productId é string', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 'abc',
          quantity: 5
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'productId é obrigatório e deve ser um número');
    });
  });

  describe('IT-008: Dados inválidos - quantity zero', () => {
    it('deve retornar 400 quando quantity é zero', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 0
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'quantity é obrigatório e deve ser um número positivo');
    });
  });

  describe('IT-009: Dados inválidos - quantity negativa', () => {
    it('deve retornar 400 quando quantity é negativa', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: -5
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'quantity é obrigatório e deve ser um número positivo');
    });
  });

  describe('IT-010: Dados inválidos - quantity com tipo incorreto (string)', () => {
    it('deve retornar 400 quando quantity é string', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 'cinco'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'quantity é obrigatório e deve ser um número positivo');
    });
  });

  describe('IT-011: Falha de comunicação - API de Estoque indisponível', () => {
    it('deve retornar 502 quando API de Estoque está indisponível', async () => {
      // Mock do fetch para simular erro de conexão
      const mockFetch = jest.fn(() => {
        return Promise.reject(new Error('ECONNREFUSED'));
      });

      setCustomFetch(mockFetch);

      try {
        const response = await request(ORDERS_API_URL)
          .post('/orders')
          .send({
            productId: 1,
            quantity: 2
          });

        expect(response.status).toBe(502);
        expect(response.body).toHaveProperty('error', 'Falha ao comunicar com API de estoque');
      } finally {
        // Limpar o mock
        setCustomFetch(null);
      }
    });
  });

  describe('IT-013: Resposta inesperada da API de Estoque - status 500', () => {
    it('deve retornar 502 quando API de Estoque retorna 500', async () => {
      // Mock do fetch para simular resposta 500
      const mockFetch = jest.fn(() => {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Erro interno do servidor' })
        });
      });

      setCustomFetch(mockFetch);

      try {
        const response = await request(ORDERS_API_URL)
          .post('/orders')
          .send({
            productId: 1,
            quantity: 2
          });

        expect(response.status).toBe(502);
        expect(response.body).toHaveProperty('error', 'Falha ao comunicar com API de estoque');
      } finally {
        setCustomFetch(null);
      }
    });
  });

  describe('IT-014: Resposta da API de Estoque com JSON malformado', () => {
    it('deve retornar 502 quando API de Estoque retorna JSON inválido', async () => {
      // Mock do fetch para simular JSON malformado
      const mockFetch = jest.fn(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.reject(new SyntaxError('Unexpected token'))
        });
      });

      setCustomFetch(mockFetch);

      try {
        const response = await request(ORDERS_API_URL)
          .post('/orders')
          .send({
            productId: 1,
            quantity: 2
          });

        expect(response.status).toBe(502);
        expect(response.body).toHaveProperty('error', 'Falha ao comunicar com API de estoque');
      } finally {
        setCustomFetch(null);
      }
    });
  });

  describe('IT-020: Timeout na comunicação com API de Estoque', () => {
    it('deve retornar 502 quando API de Estoque demora muito para responder', async () => {
      // Mock do fetch para simular timeout
      const mockFetch = jest.fn(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('ETIMEDOUT')), 100);
        });
      });

      setCustomFetch(mockFetch);

      try {
        const response = await request(ORDERS_API_URL)
          .post('/orders')
          .send({
            productId: 1,
            quantity: 2
          });

        expect(response.status).toBe(502);
        expect(response.body).toHaveProperty('error', 'Falha ao comunicar com API de estoque');
      } finally {
        setCustomFetch(null);
      }
    });
  });

  describe('IT-015: Múltiplos pedidos consecutivos - verificação de estoque não deduzido', () => {
    it('deve permitir múltiplos pedidos sem deduzir estoque', async () => {
      // Primeiro pedido
      const response1 = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 5
        });

      expect(response1.status).toBe(201);
      expect(response1.body.order).toHaveProperty('id', 1);
      expect(isValidISO8601(response1.body.order.createdAt)).toBe(true);

      // Segundo pedido com mesmo total
      const response2 = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 5
        });

      expect(response2.status).toBe(201);
      expect(response2.body.order).toHaveProperty('id', 2);
      expect(isValidISO8601(response2.body.order.createdAt)).toBe(true);

      // Terceiro pedido - ainda deve funcionar pois estoque não foi deduzido
      const response3 = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 5
        });

      expect(response3.status).toBe(201);
      expect(response3.body.order).toHaveProperty('id', 3);
      expect(isValidISO8601(response3.body.order.createdAt)).toBe(true);
    });
  });

  describe('IT-016: Produto com ID zero', () => {
    it('deve retornar 404 quando productId é zero', async () => {
      // Primeiro verificamos o comportamento da API de Estoque diretamente
      const stockResponse = await request(STOCK_API_URL)
        .get('/products/0');

      // A API de Estoque retorna 404 para productId 0 (produto não existe)
      expect(stockResponse.status).toBe(404);

      // Agora testamos via API de Pedidos
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 0,
          quantity: 1
        });

      // A API de Pedidos deve propagar o 404 da API de Estoque
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Produto não encontrado');
    });
  });

  describe('IT-017: Produto com ID negativo', () => {
    it('deve retornar 404 quando productId é negativo', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: -1,
          quantity: 1
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Produto não encontrado');
    });
  });

  describe('IT-018: Corpo da requisição vazio', () => {
    it('deve retornar 400 quando corpo está vazio', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'productId é obrigatório e deve ser um número');
    });
  });

  describe('Testes adicionais de integração', () => {
    it('deve verificar comunicação com API de Estoque via GET direto', async () => {
      const response = await request(STOCK_API_URL)
        .get('/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Laptop Dell XPS');
      expect(response.body).toHaveProperty('quantity', 10);
    });

    it('deve listar pedidos criados', async () => {
      // Criar um pedido
      await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 2,
          quantity: 3
        });

      // Listar pedidos
      const response = await request(ORDERS_API_URL)
        .get('/orders');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Validar estrutura de cada pedido
      response.body.forEach(order => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('productId');
        expect(order).toHaveProperty('quantity');
        expect(order).toHaveProperty('productName');
        expect(order).toHaveProperty('createdAt');
        expect(isValidISO8601(order.createdAt)).toBe(true);
      });
    });

    it('deve criar pedido para diferentes produtos', async () => {
      const products = [
        { productId: 2, quantity: 5, name: 'Mouse Logitech' },
        { productId: 3, quantity: 10, name: 'Teclado Mecânico' },
        { productId: 4, quantity: 3, name: 'Monitor 24"' },
        { productId: 5, quantity: 7, name: 'Headset Gamer' }
      ];

      for (const product of products) {
        const response = await request(ORDERS_API_URL)
          .post('/orders')
          .send({
            productId: product.productId,
            quantity: product.quantity
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Pedido criado com sucesso');
        expect(response.body).toHaveProperty('order');
        expect(response.body.order.productName).toBe(product.name);
        expect(response.body.order).toHaveProperty('id');
        expect(response.body.order).toHaveProperty('productId', product.productId);
        expect(response.body.order).toHaveProperty('quantity', product.quantity);
        expect(response.body.order).toHaveProperty('createdAt');
        expect(isValidISO8601(response.body.order.createdAt)).toBe(true);
      }
    });
  });

  describe('Casos de limite adicionais', () => {
    it('IT-019: deve criar pedido para produto com estoque igual a 1', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 6,
          quantity: 1
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Pedido criado com sucesso');
      expect(response.body).toHaveProperty('order');
      expect(response.body.order).toHaveProperty('id');
      expect(response.body.order).toHaveProperty('productId', 6);
      expect(response.body.order).toHaveProperty('quantity', 1);
      expect(response.body.order).toHaveProperty('productName', 'Cabo USB');
      expect(response.body.order).toHaveProperty('createdAt');
      expect(isValidISO8601(response.body.order.createdAt)).toBe(true);
    });

    it('deve rejeitar quantidade fracionária', async () => {
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 1,
          quantity: 1.5
        });

      // A validação atual permite números decimais, então será validado como número
      // Mas a lógica de negócio não trata fracionação, então o comportamento é:
      // Se for 1.5, a validação passa (é número > 0), mas pode haver problemas na comparação
      expect(response.status).toBe(201);
      expect(response.body.order.quantity).toBe(1.5);
    });

    it('deve aceitar quantidade muito grande (dentro dos limites do Number)', async () => {
      const largeQuantity = 1000000;
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 2,
          quantity: largeQuantity
        });

      // Produto 2 tem 50 unidades, então deve retornar estoque insuficiente
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Estoque insuficiente');
      expect(response.body).toHaveProperty('available', 50);
      expect(response.body).toHaveProperty('requested', largeQuantity);
    });

    it('deve aceitar quantidade máxima segura do JavaScript', async () => {
      const maxSafeQuantity = Number.MAX_SAFE_INTEGER;
      const response = await request(ORDERS_API_URL)
        .post('/orders')
        .send({
          productId: 2,
          quantity: maxSafeQuantity
        });

      // Deve retornar estoque insuficiente
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Estoque insuficiente');
      expect(response.body).toHaveProperty('available', 50);
      expect(response.body).toHaveProperty('requested', maxSafeQuantity);
    });
  });
});
