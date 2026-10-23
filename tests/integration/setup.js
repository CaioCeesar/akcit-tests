const stockApp = require('../../stock-api/server');
const { app: ordersApp, resetOrders } = require('../../orders-api/server');

let stockServer;
let ordersServer;

beforeAll(async () => {
  // Iniciar servidor de estoque
  stockServer = stockApp.listen(3001);
  await new Promise(resolve => {
    stockServer.on('listening', resolve);
  });

  // Configurar URL da API de estoque para testes
  process.env.STOCK_API_URL = 'http://localhost:3001';

  // Iniciar servidor de pedidos
  ordersServer = ordersApp.listen(3000);
  await new Promise(resolve => {
    ordersServer.on('listening', resolve);
  });
});

afterAll(async () => {
  // Fechar servidores
  if (ordersServer) {
    await new Promise(resolve => {
      ordersServer.close(resolve);
    });
  }

  if (stockServer) {
    await new Promise(resolve => {
      stockServer.close(resolve);
    });
  }
});

beforeEach(() => {
  // Resetar pedidos antes de cada teste
  resetOrders();
});

module.exports = {
  stockApp,
  ordersApp
};
