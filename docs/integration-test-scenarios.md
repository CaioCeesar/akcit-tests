# Cenários de Testes de Integração - APIs de Pedidos e Estoque

Documento de cenários de testes de integração para validar a comunicação entre a API de Pedidos e a API de Estoque.

## Produtos Disponíveis no Estoque (Dados Fictícios)

| ID | Nome                | Quantidade |
|----|---------------------|------------|
| 1  | Laptop Dell XPS     | 10         |
| 2  | Mouse Logitech      | 50         |
| 3  | Teclado Mecânico    | 25         |
| 4  | Monitor 24"         | 15         |
| 5  | Headset Gamer       | 30         |

---

## Cenários de Teste

### IT-001: Criar pedido com sucesso - estoque suficiente

**Identificador**: IT-001
**Nome**: Criar pedido com produto existente e estoque suficiente

**Objetivo**: Validar que a API de Pedidos consegue consultar a API de Estoque, verificar a disponibilidade e criar um pedido com sucesso.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000
- Produto 1 (Laptop Dell XPS) com 10 unidades disponíveis

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 201 Created
- Corpo da resposta:
```json
{
  "message": "Pedido criado com sucesso",
  "order": {
    "id": 1,
    "productId": 1,
    "quantity": 2,
    "productName": "Laptop Dell XPS",
    "createdAt": "ISO-8601 timestamp"
  }
}
```

**Comportamento validado**:
- Comunicação HTTP entre API de Pedidos e API de Estoque
- Requisição GET para `/products/:id` na API de Estoque
- Parse correto da resposta JSON da API de Estoque
- Extração do campo `productName` da resposta
- Criação do pedido com dados integrados do estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-002: Produto inexistente no estoque

**Identificador**: IT-002
**Nome**: Tentar criar pedido com produto que não existe

**Objetivo**: Validar que a API de Pedidos propaga corretamente o erro 404 da API de Estoque quando o produto não é encontrado.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 999,
  "quantity": 1
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 404 Not Found
- Corpo da resposta:
```json
{
  "error": "Produto não encontrado"
}
```

**Comportamento validado**:
- Tratamento do status 404 retornado pela API de Estoque
- Propagação correta do erro sem criar pedido
- Comunicação foi realizada, mas produto não encontrado

**Status do cenário**: ✅ Pode ser testado

---

### IT-003: Estoque insuficiente

**Identificador**: IT-003
**Nome**: Tentar criar pedido com quantidade maior que o estoque disponível

**Objetivo**: Validar que a API de Pedidos verifica corretamente a disponibilidade de estoque e retorna erro de conflito.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000
- Produto 1 (Laptop Dell XPS) com 10 unidades disponíveis

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 20
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 409 Conflict
- Corpo da resposta:
```json
{
  "error": "Estoque insuficiente",
  "available": 10,
  "requested": 20
}
```

**Comportamento validado**:
- Recebimento dos dados de estoque da API de Estoque
- Comparação correta entre `product.quantity` e `quantity` solicitada
- Retorno de informações de estoque disponível e solicitado
- Não criação do pedido quando estoque insuficiente

**Status do cenário**: ✅ Pode ser testado

---

### IT-004: Estoque exatamente igual à quantidade solicitada

**Identificador**: IT-004
**Nome**: Criar pedido com quantidade igual ao estoque disponível (caso de limite)

**Objetivo**: Validar o comportamento quando a quantidade solicitada é exatamente igual ao estoque disponível (caso de borda).

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000
- Produto 1 (Laptop Dell XPS) com 10 unidades disponíveis

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 10
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 201 Created
- Corpo da resposta:
```json
{
  "message": "Pedido criado com sucesso",
  "order": {
    "id": 1,
    "productId": 1,
    "quantity": 10,
    "productName": "Laptop Dell XPS",
    "createdAt": "ISO-8601 timestamp"
  }
}
```

**Comportamento validado**:
- Lógica de comparação `product.quantity < quantity` (estrita, não <=)
- Pedido deve ser criado quando quantidade exatamente igual ao estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-005: Dados inválidos - productId ausente

**Identificador**: IT-005
**Nome**: Enviar pedido sem o campo productId

**Objetivo**: Validar que a API de Pedidos rejeita requisições sem o campo productId antes de consultar a API de Estoque.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "quantity": 5
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "productId é obrigatório e deve ser um número"
}
```

**Comportamento validado**:
- Validação local antes de consultar API de Estoque
- Nenhuma requisição é feita à API de Estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-006: Dados inválidos - quantity ausente

**Identificador**: IT-006
**Nome**: Enviar pedido sem o campo quantity

**Objetivo**: Validar que a API de Pedidos rejeita requisições sem o campo quantity antes de consultar a API de Estoque.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "quantity é obrigatório e deve ser um número positivo"
}
```

**Comportamento validado**:
- Validação local antes de consultar API de Estoque
- Nenhuma requisição é feita à API de Estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-007: Dados inválidos - productId com tipo incorreto (string)

**Identificador**: IT-007
**Nome**: Enviar pedido com productId como string

**Objetivo**: Validar que a API de Pedidos rejeita productId com tipo incorreto.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": "abc",
  "quantity": 5
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "productId é obrigatório e deve ser um número"
}
```

**Comportamento validado**:
- Validação de tipo de dados
- Nenhuma requisição é feita à API de Estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-008: Dados inválidos - quantity zero

**Identificador**: IT-008
**Nome**: Enviar pedido com quantity igual a zero

**Objetivo**: Validar que a API de Pedidos rejeita quantidade zero.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 0
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "quantity é obrigatório e deve ser um número positivo"
}
```

**Comportamento validado**:
- Validação de valor positivo (quantity > 0)
- Nenhuma requisição é feita à API de Estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-009: Dados inválidos - quantity negativa

**Identificador**: IT-009
**Nome**: Enviar pedido com quantity negativa

**Objetivo**: Validar que a API de Pedidos rejeita quantidade negativa.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": -5
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "quantity é obrigatório e deve ser um número positivo"
}
```

**Comportamento validado**:
- Validação de valor positivo
- Nenhuma requisição é feita à API de Estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-010: Dados inválidos - quantity com tipo incorreto (string)

**Identificador**: IT-010
**Nome**: Enviar pedido com quantity como string

**Objetivo**: Validar que a API de Pedidos rejeita quantity com tipo incorreto.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": "cinco"
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "quantity é obrigatório e deve ser um número positivo"
}
```

**Comportamento validado**:
- Validação de tipo de dados
- Nenhuma requisição é feita à API de Estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-011: Falha de comunicação - API de Estoque indisponível

**Identificador**: IT-011
**Nome**: Tentar criar pedido com API de Estoque parada

**Objetivo**: Validar que a API de Pedidos retorna erro 502 quando não consegue comunicar com a API de Estoque.

**Pré-condições**:
- API de Estoque **NÃO** rodando
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Passos para executar**:
1. Garantir que a API de Estoque está parada
2. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
3. Verificar o código de status HTTP
4. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 502 Bad Gateway
- Corpo da resposta:
```json
{
  "error": "Falha ao comunicar com API de estoque"
}
```

**Comportamento validado**:
- Tratamento de erro de conexão no fetch
- Captura de exceção no bloco try/catch
- Retorno de 502 quando serviço downstream indisponível

**Status do cenário**: ✅ Pode ser testado

---

### IT-012: Resposta inesperada da API de Estoque - status 400

**Identificador**: IT-012
**Nome**: API de Estoque retorna status 400 para um ID de produto

**Objetivo**: Validar como a API de Pedidos trata respostas não-200 e não-404 da API de Estoque.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": "abc",
  "quantity": 2
}
```

**Passos para executar**:
1. Este cenário requer uma modificação: enviar productId como string "abc"
2. A API de Pedidos deve validar e rejeitar (400)
3. Para testar a comunicação, seria necessário modificar a validação da API de Pedidos para aceitar string e passar para API de Estoque
4. Ou testar via requisição direta à API de Estoque: `GET /products/abc`

**Resultado esperado** (requisição direta à API de Estoque):
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "ID inválido"
}
```

**Resultado esperado** (via API de Pedidos - **requer ajuste**):
- Código HTTP: 502 Bad Gateway (pois não é 404 e stockResponse.ok será false)
- Corpo da resposta:
```json
{
  "error": "Falha ao comunicar com API de estoque"
}
```

**Comportamento validado**:
- Se a API de Estoque retornar 400, a API de Pedidos trata como erro de comunicação (502)
- Tratamento genérico para status não esperados (!stockResponse.ok)

**Status do cenário**: ⚠️ Requer ajuste no projeto para teste completo via API de Pedidos

**Dúvida/Necessidade de ajuste**: A API de Pedidos atualmente valida `productId` como número antes de consultar a API de Estoque. Para testar a comunicação com status 400 da API de Estoque, seria necessário:
- Remover ou relaxar a validação de tipo na API de Pedidos, ou
- Adicionar um endpoint na API de Estoque que retorne 400 para um productId válido numérico

---

### IT-013: Resposta inesperada da API de Estoque - status 500

**Identificador**: IT-013
**Nome**: API de Estoque retorna erro interno do servidor

**Objetivo**: Validar como a API de Pedidos trata erros 500 da API de Estoque.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Passos para executar**:
1. Modificar temporariamente o código da API de Estoque para retornar 500
2. Enviar requisição POST para `http://localhost:3000/orders`
3. Verificar o código de status HTTP
4. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 502 Bad Gateway
- Corpo da resposta:
```json
{
  "error": "Falha ao comunicar com API de estoque"
}
```

**Comportamento validado**:
- Tratamento de status 500 como erro de comunicação
- Lógica `!stockResponse.ok` captura qualquer status não-2xx exceto 404 tratado especificamente

**Status do cenário**: ⚠️ Requer ajuste temporário no código da API de Estoque

---

### IT-014: Resposta da API de Estoque com JSON malformado

**Identificador**: IT-014
**Nome**: API de Estoque retorna JSON inválido

**Objetivo**: Validar como a API de Pedidos trata respostas com JSON malformado da API de Estoque.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Passos para executar**:
1. Modificar temporariamente o código da API de Estoque para retornar texto inválido em vez de JSON
2. Enviar requisição POST para `http://localhost:3000/orders`
3. Verificar o código de status HTTP
4. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 502 Bad Gateway
- Corpo da resposta:
```json
{
  "error": "Falha ao comunicar com API de estoque"
}
```

**Comportamento validado**:
- Captura de erro ao tentar parsear JSON (`await stockResponse.json()`)
- Tratamento no bloco catch

**Status do cenário**: ⚠️ Requer ajuste temporário no código da API de Estoque

---

### IT-015: Múltiplos pedidos consecutivos - verificação de estoque não deduzido

**Identificador**: IT-015
**Nome**: Criar múltiplos pedidos sem dedução do estoque

**Objetivo**: Validar o comportamento atual do sistema que não deduz o estoque após criar pedido (comportamento documentado, não um bug).

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000
- Produto 1 (Laptop Dell XPS) com 10 unidades disponíveis

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 5
}
```

**Passos para executar**:
1. Enviar primeiro pedido POST para `http://localhost:3000/orders` com quantity 5
2. Verificar que o pedido foi criado (201)
3. Enviar segundo pedido POST para `http://localhost:3000/orders` com quantity 5
4. Verificar o código de status HTTP
5. Enviar terceiro pedido POST para `http://localhost:3000/orders` com quantity 5
6. Verificar o código de status HTTP

**Resultado esperado**:
- Primeiro pedido: 201 Created
- Segundo pedido: 201 Created (estoque ainda mostra 10, não foi deduzido)
- Terceiro pedido: 201 Created (estoque ainda mostra 10, não foi deduzido)

**Comportamento validado**:
- O sistema atual não deduz o estoque após criar pedido
- Cada pedido verifica o estoque atual (estático) independentemente de pedidos anteriores
- **Observação**: Este é o comportamento atual definido. Se a intenção fosse deduzir estoque, seria necessário ajuste.

**Status do cenário**: ✅ Pode ser testado

**Dúvida/Necessidade de ajuste**: Os requisitos não especificam se o estoque deve ser deduzido após criar um pedido. O comportamento atual (estoque estático) atende aos requisitos definidos, mas pode não ser o desejado em produção.

---

### IT-016: Produto com ID zero

**Identificador**: IT-016
**Nome**: Tentar criar pedido com productId igual a zero

**Objetivo**: Validar o comportamento ao usar productId 0 (caso de borda).

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 0,
  "quantity": 1
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 404 Not Found
- Corpo da resposta:
```json
{
  "error": "Produto não encontrado"
}
```

**Comportamento validado**:
- API de Estoque retorna 404 para productId 0 (não existe no objeto products)
- API de Pedidos propaga o 404 corretamente

**Status do cenário**: ✅ Pode ser testado

---

### IT-017: Produto com ID negativo

**Identificador**: IT-017
**Nome**: Tentar criar pedido com productId negativo

**Objetivo**: Validar o comportamento ao usar productId negativo (caso de borda).

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": -1,
  "quantity": 1
}
```

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` com o payload acima
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 404 Not Found
- Corpo da resposta:
```json
{
  "error": "Produto não encontrado"
}
```

**Comportamento validado**:
- API de Estoque retorna 404 para productId negativo (não existe no objeto products)
- API de Pedidos propaga o 404 corretamente

**Status do cenário**: ✅ Pode ser testado

---

### IT-018: Corpo da requisição vazio

**Identificador**: IT-018
**Nome**: Enviar pedido sem corpo da requisição

**Objetivo**: Validar que a API de Pedidos trata requisições sem corpo.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
(Nenhum - corpo vazio)

**Passos para executar**:
1. Enviar requisição POST para `http://localhost:3000/orders` sem corpo
2. Verificar o código de status HTTP
3. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 400 Bad Request
- Corpo da resposta:
```json
{
  "error": "productId é obrigatório e deve ser um número"
}
```

**Comportamento validado**:
- Validação com req.body vazio ou undefined
- Nenhuma requisição é feita à API de Estoque

**Status do cenário**: ✅ Pode ser testado

---

### IT-019: Produto com estoque igual a 1 (valor mínimo)

**Identificador**: IT-019
**Nome**: Criar pedido para produto com estoque igual a 1

**Objetivo**: Validar o comportamento com o menor valor de estoque possível (caso de borda).

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000
- **Dúvida**: Não há produto com estoque 1 nos dados fictícios atuais

**Dados de entrada**:
```json
{
  "productId": [ID do produto com estoque 1],
  "quantity": 1
}
```

**Passos para executar**:
1. Este cenário requer adicionar um produto com estoque 1 nos dados fictícios
2. Enviar requisição POST para `http://localhost:3000/orders` com quantity 1
3. Verificar o código de status HTTP

**Resultado esperado**:
- Código HTTP: 201 Created
- Corpo da resposta:
```json
{
  "message": "Pedido criado com sucesso",
  "order": {
    "id": 1,
    "productId": [ID],
    "quantity": 1,
    "productName": "[Nome do produto]",
    "createdAt": "ISO-8601 timestamp"
  }
}
```

**Comportamento validado**:
- Pedido criado com sucesso quando estoque mínimo
- Lógica de comparação funciona corretamente com valor 1

**Status do cenário**: ⚠️ Requer ajuste nos dados fictícios (adicionar produto com estoque 1)

---

### IT-020: Timeout na comunicação com API de Estoque

**Identificador**: IT-020
**Nome**: API de Estoque demora muito para responder

**Objetivo**: Validar o comportamento quando a API de Estoque não responde dentro do timeout padrão do fetch.

**Pré-condições**:
- API de Estoque rodando na porta 3001
- API de Pedidos rodando na porta 3000

**Dados de entrada**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Passos para executar**:
1. Modificar temporariamente o código da API de Estoque para adicionar um delay maior que o timeout do fetch
2. Enviar requisição POST para `http://localhost:3000/orders`
3. Verificar o código de status HTTP
4. Verificar o corpo da resposta

**Resultado esperado**:
- Código HTTP: 502 Bad Gateway
- Corpo da resposta:
```json
{
  "error": "Falha ao comunicar com API de estoque"
}
```

**Comportamento validado**:
- Tratamento de timeout na requisição fetch
- Captura de erro no bloco catch

**Status do cenário**: ⚠️ Requer ajuste temporário no código da API de Estoque

**Dúvida**: Não está definido um timeout explícito no código atual. O fetch usa o timeout padrão do Node.js. Seria necessário adicionar um delay artificial na API de Estoque para simular este cenário.

---

## Resumo dos Cenários

### Cenários que podem ser testados sem ajustes (13)
- IT-001: Criar pedido com sucesso
- IT-002: Produto inexistente
- IT-003: Estoque insuficiente
- IT-004: Estoque exatamente igual à quantidade solicitada
- IT-005: Dados inválidos - productId ausente
- IT-006: Dados inválidos - quantity ausente
- IT-007: Dados inválidos - productId com tipo incorreto
- IT-008: Dados inválidos - quantity zero
- IT-009: Dados inválidos - quantity negativa
- IT-010: Dados inválidos - quantity com tipo incorreto
- IT-011: Falha de comunicação - API de Estoque indisponível
- IT-015: Múltiplos pedidos consecutivos
- IT-016: Produto com ID zero
- IT-017: Produto com ID negativo
- IT-018: Corpo da requisição vazio

### Cenários que requerem ajustes no projeto (7)
- IT-012: Resposta inesperada da API de Estoque - status 400 (requer ajuste na validação da API de Pedidos)
- IT-013: Resposta inesperada da API de Estoque - status 500 (requer ajuste temporário na API de Estoque)
- IT-014: Resposta da API de Estoque com JSON malformado (requer ajuste temporário na API de Estoque)
- IT-019: Produto com estoque igual a 1 (requer adicionar produto com estoque 1 nos dados fictícios)
- IT-020: Timeout na comunicação (requer ajuste temporário na API de Estoque)

## Dúvidas e Observações

1. **Dedução de estoque**: O sistema atual não deduz o estoque após criar um pedido. Os requisitos não especificam se isso deve ser implementado. Se necessário, seria uma alteração futura.

2. **Validação de tipo na API de Pedidos**: A API de Pedidos valida `productId` como número antes de consultar a API de Estoque. Isso impede testar cenários onde a API de Estoque retornaria 400 para IDs inválidos.

3. **Timeout não configurado**: Não há um timeout explícito configurado no fetch. O comportamento depende do timeout padrão do Node.js.

4. **Produtos com estoque 1**: Não há produto com estoque igual a 1 nos dados fictícios atuais, o que impede testar este caso de borde específico.

5. **Tratamento genérico de erros**: A API de Pedidos trata qualquer status não-ok (exceto 404) como 502. Isso é adequado para os requisitos atuais, mas pode não diferenciar tipos de erro.
