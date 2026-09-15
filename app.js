require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

const port = process.env.PORT || 8080

const postsModel = require('./models/posts')

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

app.use('/img', express.static(__dirname + '/public/images'))

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

// CRIAR UMA NOVA POSTAGEM
app.post('/postagem', async (req, res) => {
  try {
    const { titulo, descricao } = req.body

    if (!titulo || !descricao) {
      return res.status(400).json({ erro: 'Os campos "titulo" e "descricao" são obrigatórios' })
    }

    const novaPostagem = await postsModel.create(req.body)
    res.status(201).json(novaPostagem)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar postagem', detalhes: error.message })
  }
})

// EDITAR UMA POSTAGEM EXISTENTE
app.put('/postagem/:id', async (req, res) => {
  try {
    const { id } = req.params

    const existente = await postsModel.getById(id)
    if (!existente) {
      return res.status(404).json({ erro: 'Postagem não encontrada' })
    }

    const postagemAtualizada = await postsModel.update(id, req.body)
    res.json(postagemAtualizada)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao editar postagem', detalhes: error.message })
  }
})

// DELETAR UMA POSTAGEM
app.delete('/postagem/:id', async (req, res) => {
  try {
    const { id } = req.params

    const existente = await postsModel.getById(id)
    if (!existente) {
      return res.status(404).json({ erro: 'Postagem não encontrada' })
    }

    await postsModel.remove(id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar postagem', detalhes: error.message })
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
