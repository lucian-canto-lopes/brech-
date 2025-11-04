# Brechó – Site simples (Node + Vanilla JS)

Este projeto cria um site de brechó com catálogo, busca, detalhes dos produtos e carrinho (offline) usando Node.js (servidor HTTP nativo) e frontend estático em HTML/CSS/JS.

## Estrutura

```
backend/
  server.js            # Servidor HTTP (API + estáticos)
  data/
    products.json      # Seed de produtos
frontend/
  index.html           # Página principal (SPA simples)
  styles.css           # Estilos
  app.js               # Lógica do catálogo e carrinho
```

## Como executar

Pré-requisitos: Node.js 16+ instalado.

```powershell
# Iniciar o servidor
node backend/server.js

# Abra no navegador
# http://localhost:3000/
```

## API

- GET `/api/products` – Lista todos os produtos. Aceita query `term` e `category`.
- GET `/api/products/:id` – Detalhes de um produto por id.
- GET `/api/health` – Status do servidor.

## Personalização

- Edite `backend/data/products.json` para alterar os produtos (id, name, price, category, sizes, condition, description, image).
- Atualize contatos e redes sociais em `frontend/index.html`.
- Ajuste cores/tipografia em `frontend/styles.css`.

## Próximos passos (opcionais)

- Integração de pagamento (Stripe, PagSeguro) e fluxo de checkout real.
- Painel administrativo para cadastrar/editar produtos.
- Paginação, filtros avançados e ordenação.
- Migração para React/Tailwind e build com Vite.

## Licença

Uso educacional/demonstrativo. Substitua imagens placeholder por fotos próprias.
