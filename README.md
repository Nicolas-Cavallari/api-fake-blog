# API Fake Blog

Base original por [Diego Candido](https://diegocandido.com), atualizada com:

- Categorias funcionando de verdade (antes só existia uma rota fixa e quebrada para "games")
- Rota para editar postagens (PUT)
- Rota para criar e deletar postagens
- Persistência em banco de dados real usando **Supabase** (Postgres), no lugar dos arrays fixos em `models/articles.js` e `models/games.js`

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo do arquivo `schema.sql` deste projeto. Isso cria a tabela `posts` e já insere alguns dados de exemplo.
3. Vá em **Project Settings > API** e copie a **Project URL** e a **anon public key** (ou a `service_role` key, se for usar só no back-end).
4. Copie `.env.example` para `.env` e preencha:

```
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_KEY=SUA_CHAVE
```

## Instalando e rodando

```
npm install
npm start
```

## Rotas disponíveis

### Listar todas as postagens
```
GET /postagens
```

### Buscar uma postagem pelo id
```
GET /postagem/:id
```

### Listar todas as categorias existentes
```
GET /categorias
```

### Listar postagens de uma categoria
```
GET /categoria/:nome
```
Exemplo: `/categoria/games`

### Criar uma nova postagem
```
POST /postagem
Content-Type: application/json

{
  "titulo": "Meu novo post",
  "descricao": "Texto do post",
  "categoria": "games",
  "thumbImage": "https://...",
  "thumbImageAltText": "Descrição da imagem",
  "profileThumbImage": "/images/profile-1.jpg",
  "profileName": "Seu Nome",
  "postDate": "2026-09-14"
}
```
Apenas `titulo` e `descricao` são obrigatórios; os demais campos são opcionais.

### Editar uma postagem existente
```
PUT /postagem/:id
Content-Type: application/json

{
  "titulo": "Título atualizado",
  "categoria": "tecnologia"
}
```
Envie apenas os campos que quer alterar — os demais permanecem como estavam.

### Deletar uma postagem
```
DELETE /postagem/:id
```

## Estrutura do projeto

```
app.js                      -> rotas da API
config/supabaseClient.js    -> conexão com o Supabase
models/posts.js             -> todas as consultas/operações na tabela "posts"
schema.sql                  -> script para criar a tabela no Supabase
public/images               -> imagens estáticas servidas em /img
```

## Clonando o repositório

Com o Git e o Node.js instalados, e a **URL** do projeto em mãos:
```
git clone <url-do-repositorio>
cd api-fake-blog
npm install
cp .env.example .env
# preencha o .env com os dados do seu projeto Supabase
npm start
```
