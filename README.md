# API Fake Blog

Base original por [Diego Candido](https://diegocandido.com), atualizada com:

- Categorias funcionando de verdade (antes só existia uma rota fixa e quebrada para "games")
- Rota para editar postagens (PUT)
- Rota para criar e deletar postagens
- Persistência em banco de dados real usando **Supabase** (Postgres), no lugar dos arrays fixos em `models/articles.js` e `models/games.js`
- **Autenticação (cadastro e login) com JWT**
- **Comentários nas postagens**, com exclusão restrita a quem comentou ou a quem criou a postagem
- **Criar/editar/apagar postagem agora exige login, e só o autor pode editar ou apagar a própria postagem**

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo do arquivo `schema.sql` deste projeto. Isso cria as tabelas `posts`, `usuarios` e `comentarios`, e já insere alguns dados de exemplo.
   - **Se você já tinha rodado uma versão anterior deste `schema.sql`** (ou seja, a tabela `posts` já existe e já tem dados), rode só o bloco novo — da seção `-- Usuários (cadastro/login) e comentários` até antes de `-- Dados de exemplo` — em vez do arquivo inteiro, pra não duplicar as postagens de exemplo.
3. Vá em **Project Settings > API** e copie a **Project URL** e a **anon public key** (ou a `service_role` key, se for usar só no back-end).
4. Copie `.env.example` para `.env` e preencha:

```
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_KEY=SUA_CHAVE
JWT_SECRET=uma-chave-secreta-bem-grande-e-aleatoria
```

`JWT_SECRET` pode ser qualquer string longa e aleatória — é ela que assina os tokens de login. Não reutilize a mesma chave de outro projeto e não a compartilhe.

## Instalando e rodando

```
npm install
npm start
```

## Rotas disponíveis

### Autenticação

#### Cadastrar
```
POST /auth/registro
Content-Type: application/json

{ "nome": "Seu Nome", "email": "voce@email.com", "senha": "algosecreto" }
```
Resposta: `{ "token": "...", "usuario": { "id": 1, "nome": "...", "email": "..." } }`

#### Login
```
POST /auth/login
Content-Type: application/json

{ "email": "voce@email.com", "senha": "algosecreto" }
```
Resposta igual à do cadastro. Guarde o `token` e envie em toda rota protegida como:
```
Authorization: Bearer <token>
```

### Postagens

#### Listar todas
```
GET /postagens
```

#### Buscar uma pelo id
```
GET /postagem/:id
```

#### Listar todas as categorias existentes
```
GET /categorias
```

#### Listar postagens de uma categoria
```
GET /categoria/:nome
```
Exemplo: `/categoria/games`

#### Criar uma nova postagem — **exige login**
```
POST /postagem
Authorization: Bearer <token>
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
Apenas `titulo` e `descricao` são obrigatórios; os demais campos são opcionais. A postagem criada fica automaticamente associada a quem estava logado (`autor_id`).

#### Editar uma postagem existente — **exige login e ser o autor**
```
PUT /postagem/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "titulo": "Título atualizado", "categoria": "tecnologia" }
```
Envie apenas os campos que quer alterar — os demais permanecem como estavam. Retorna `403` se quem está logado não for o autor da postagem.

#### Deletar uma postagem — **exige login e ser o autor**
```
DELETE /postagem/:id
Authorization: Bearer <token>
```

### Comentários

#### Listar comentários de uma postagem
```
GET /postagem/:id/comentarios
```
Cada comentário já vem com o nome de quem comentou em `usuario.nome`.

#### Comentar — **exige login**
```
POST /postagem/:id/comentarios
Authorization: Bearer <token>
Content-Type: application/json

{ "texto": "Muito bom esse post!" }
```

#### Apagar um comentário — **exige login, e ser o autor do comentário OU o autor da postagem**
```
DELETE /comentario/:id
Authorization: Bearer <token>
```
Retorna `403` se quem está logado não tiver permissão.

## Estrutura do projeto

```
app.js                      -> rotas da API
config/supabaseClient.js    -> conexão com o Supabase
middlewares/autenticar.js   -> valida o token JWT das rotas protegidas
models/posts.js             -> consultas/operações na tabela "posts"
models/usuarios.js          -> cadastro, login e busca de usuários
models/comentarios.js       -> consultas/operações na tabela "comentarios"
schema.sql                  -> script para criar/atualizar as tabelas no Supabase
public/images                -> imagens estáticas servidas em /img
```

## Clonando o repositório

Com o Git e o Node.js instalados, e a **URL** do projeto em mãos:
```
git clone <url-do-repositorio>
cd api-fake-blog
npm install
cp .env.example .env
# preencha o .env com os dados do seu projeto Supabase e um JWT_SECRET
npm start
```
