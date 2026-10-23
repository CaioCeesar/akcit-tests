# Implementação dos Testes de Integração

## Visão Geral

Foram implementados testes de integração automatizados usando **Jest** e **Supertest** para validar a comunicação entre a API de Pedidos e a API de Estoque.

## Estrutura de Arquivos

```
ufg-mod-13/
├── package.json                           # Configuração do projeto e scripts de teste
├── tests/
│   └── integration/
│       ├── setup.js                      # Setup dos servidores para testes
│       └── integration.test.js           # Suíte de testes de integração
├── stock-api/
│   ├── package.json
│   └── server.js                         # Modificado para exportar app
└── orders-api/
    ├── package.json
    └── server.js                         # Modificado para exportar app e função reset
```

## Dependências Adicionadas

### DevDependencies
- **jest**: ^29.7.0 - Framework de testes
- **supertest**: ^6.3.3 - Biblioteca para testar APIs HTTP

## Modificações no Código

### stock-api/server.js
- Adicionado `module.exports = app` para permitir importação nos testes
- Modificado `app.listen()` para iniciar apenas quando não estiver em modo de teste

### orders-api/server.js
- Adicionado `module.exports = { app, resetOrders }` para permitir importação nos testes
- Adicionado suporte a `process.env.STOCK_API_URL` para configurar URL da API de Estoque
- Adicionada função `resetOrders()` para limpar o estado entre testes
- Melhorada validação de `productId` para aceitar valor 0
- Modificado `app.listen()` para iniciar apenas quando não estiver em modo de teste

## Testes Implementados

### Cenários Testados (18 testes)

| ID | Cenário | Status |
|----|---------|--------|
| IT-001 | Criar pedido com sucesso - estoque suficiente | ✅ Passou |
| IT-002 | Produto inexistente no estoque | ✅ Passou |
| IT-003 | Estoque insuficiente | ✅ Passou |
| IT-004 | Estoque exatamente igual à quantidade solicitada | ✅ Passou |
| IT-005 | Dados inválidos - productId ausente | ✅ Passou |
| IT-006 | Dados inválidos - quantity ausente | ✅ Passou |
| IT-007 | Dados inválidos - productId com tipo incorreto (string) | ✅ Passou |
| IT-008 | Dados inválidos - quantity zero | ✅ Passou |
| IT-009 | Dados inválidos - quantity negativa | ✅ Passou |
| IT-010 | Dados inválidos - quantity com tipo incorreto (string) | ✅ Passou |
| IT-011 | Falha de comunicação - API de Estoque indisponível | ⚠️ Placeholder |
| IT-015 | Múltiplos pedidos consecutivos - estoque não deduzido | ✅ Passou |
| IT-016 | Produto com ID zero | ✅ Passou |
| IT-017 | Produto com ID negativo | ✅ Passou |
| IT-018 | Corpo da requisição vazio | ✅ Passou |
| - | Comunicação com API de Estoque via GET direto | ✅ Passou |
| - | Listar pedidos criados | ✅ Passou |
| - | Criar pedido para diferentes produtos | ✅ Passou |

## Scripts de Teste

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com coverage
```bash
npm run test:coverage
```

## Resultado da Execução

```
Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        3.061 s
```

## Observações

### IT-011: Falha de comunicação
O teste IT-011 foi implementado como placeholder porque a URL da API de Estoque é configurada na inicialização do app. Para testar este cenário adequadamente, seria necessário:
- Parar o servidor de estoque antes de executar o teste
- Ou implementar um mecanismo para reconfigurar a URL dinamicamente

### Cenários não implementados
Os seguintes cenários do documento de cenários não foram implementados pois requerem modificações temporárias no código:
- IT-012: Resposta inesperada da API de Estoque - status 400
- IT-013: Resposta inesperada da API de Estoque - status 500
- IT-014: Resposta da API de Estoque com JSON malformado
- IT-019: Produto com estoque igual a 1
- IT-020: Timeout na comunicação

Estes cenários podem ser implementados no futuro se necessário, usando técnicas como:
- Mocking de respostas HTTP
- Adição de endpoints de teste na API de Estoque
- Modificação temporária do código durante os testes

## Setup dos Testes

O arquivo `tests/integration/setup.js` realiza:
1. Inicialização do servidor de Estoque na porta 3001
2. Configuração da variável de ambiente `STOCK_API_URL`
3. Inicialização do servidor de Pedidos na porta 3000
4. Reset do estado dos pedidos antes de cada teste
5. Encerramento dos servidores após todos os testes

## Próximos Passos

Para melhorar a suíte de testes:
1. Implementar testes para os cenários que requerem modificações temporárias
2. Adicionar testes de performance
3. Implementar testes de carga
4. Adicionar métricas de coverage mais detalhadas
5. Implementar testes end-to-end com ferramentas como Cypress ou Playwright
