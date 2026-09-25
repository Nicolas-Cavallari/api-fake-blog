require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()

app.use(cors())

const port = process.env.PORT || 8080

const postsModel = require('./models/posts')
const usuariosModel = require('./models/usuarios')
const comentariosModel = require('./models/comentarios')
const { autenticar } = require('./middlewares/autenticar')

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

app.use('/img', express.static(__dirname + '/public/images'))

// CADASTRAR UM NOVO USUÁRIO
app.post('/auth/registro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Os campos "nome", "email" e "senha" são obrigatórios' })
    }

    const usuario = await usuariosModel.criar({ nome, email, senha })
    const token = gerarToken(usuario)
    res.status(201).json({ token, usuario })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado' })
    }
    res.status(500).json({ erro: 'Erro ao cadastrar usuário', detalhes: error.message })
  }
})

// LOGIN
app.post('/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Os campos "email" e "senha" são obrigatórios' })
    }

    const usuarioComHash = await usuariosModel.buscarPorEmail(email)
    const senhaValida = usuarioComHash && (await usuariosModel.verificarSenha(usuarioComHash, senha))

    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' })
    }

    const usuario = { id: usuarioComHash.id, nome: usuarioComHash.nome, email: usuarioComHash.email }
    const token = gerarToken(usuario)
    res.json({ token, usuario })
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login', detalhes: error.message })
  }
})

// LISTAR TODAS AS POSTAGENS
app.get('/postagens', async (req, res) => {
  try {
    const postagens = await postsModel.getAll()
    res.json(postagens)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar postagens', detalhes: error.message })
  }
})

// LISTAR UMA POSTAGEM PELO ID
app.get('/postagem/:id', async (req, res) => {
  try {
    const { id } = req.params
    const postagem = await postsModel.getById(id)

    if (!postagem) {
      return res.status(404).json({ erro: 'Postagem não encontrada' })
    }

    res.json(postagem)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar postagem', detalhes: error.message })
  }
})

// LISTAR TODAS AS CATEGORIAS DISPONÍVEIS
app.get('/categorias', async (req, res) => {
  try {
    const categorias = await postsModel.getCategorias()
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar categorias', detalhes: error.message })
  }
})

// LISTAR POSTAGENS DE UMA CATEGORIA ESPECÍFICA (ex: /categoria/games)
app.get('/categoria/:nome', async (req, res) => {
  try {
    const { nome } = req.params
    const postagens = await postsModel.getByCategoria(nome)
    res.json(postagens)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar categoria', detalhes: error.message })
  }
})

// CRIAR UMA NOVA POSTAGEM (exige login — o autor vira o dono da postagem)
app.post('/postagem', autenticar, async (req, res) => {
  try {
    const { titulo, descricao } = req.body

    if (!titulo || !descricao) {
      return res.status(400).json({ erro: 'Os campos "titulo" e "descricao" são obrigatórios' })
    }

    const novaPostagem = await postsModel.create({ ...req.body, autorId: req.usuario.id })
    res.status(201).json(novaPostagem)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar postagem', detalhes: error.message })
  }
})

// EDITAR UMA POSTAGEM EXISTENTE (só quem criou pode editar)
app.put('/postagem/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params

    const existente = await postsModel.getById(id)
    if (!existente) {
      return res.status(404).json({ erro: 'Postagem não encontrada' })
    }
    if (existente.autor_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode editar postagens que você mesmo criou' })
    }

    const postagemAtualizada = await postsModel.update(id, req.body)
    res.json(postagemAtualizada)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao editar postagem', detalhes: error.message })
  }
})

// DELETAR UMA POSTAGEM (só quem criou pode deletar)
app.delete('/postagem/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params

    const existente = await postsModel.getById(id)
    if (!existente) {
      return res.status(404).json({ erro: 'Postagem não encontrada' })
    }
    if (existente.autor_id !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode apagar postagens que você mesmo criou' })
    }

    await postsModel.remove(id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar postagem', detalhes: error.message })
  }
})

// LISTAR COMENTÁRIOS DE UMA POSTAGEM
app.get('/postagem/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params
    const comentarios = await comentariosModel.getByPostagem(id)
    res.json(comentarios)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar comentários', detalhes: error.message })
  }
})

// COMENTAR EM UMA POSTAGEM (exige login)
app.post('/postagem/:id/comentarios', autenticar, async (req, res) => {
  try {
    const { id } = req.params
    const { texto } = req.body

    if (!texto || !texto.trim()) {
      return res.status(400).json({ erro: 'O campo "texto" é obrigatório' })
    }

    const postagem = await postsModel.getById(id)
    if (!postagem) {
      return res.status(404).json({ erro: 'Postagem não encontrada' })
    }

    const comentario = await comentariosModel.create({
      postagemId: id,
      autorId: req.usuario.id,
      texto,
    })
    res.status(201).json(comentario)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar comentário', detalhes: error.message })
  }
})

// APAGAR UM COMENTÁRIO (autor do comentário OU autor da postagem)
app.delete('/comentario/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params

    const comentario = await comentariosModel.getById(id)
    if (!comentario) {
      return res.status(404).json({ erro: 'Comentário não encontrado' })
    }

    const postagem = await postsModel.getById(comentario.postagem_id)
    const ehAutorDoComentario = comentario.autor_id === req.usuario.id
    const ehAutorDaPostagem = !!postagem && postagem.autor_id === req.usuario.id

    if (!ehAutorDoComentario && !ehAutorDaPostagem) {
      return res.status(403).json({ erro: 'Você não tem permissão para apagar este comentário' })
    }

    await comentariosModel.remove(id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao apagar comentário', detalhes: error.message })
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
