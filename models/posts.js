const { supabase } = require('../config/supabaseClient')

const TABELA = 'posts'

// LISTAR TODAS AS POSTAGENS
async function getAll() {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .order('id', { ascending: true })

  if (error) throw error
  return data
}

// BUSCAR UMA POSTAGEM PELO ID
async function getById(id) {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

// LISTAR TODAS AS CATEGORIAS DISPONÍVEIS (sem repetir)
async function getCategorias() {
  const { data, error } = await supabase.from(TABELA).select('categoria')

  if (error) throw error
  const categorias = [...new Set(data.map((post) => post.categoria))]
  return categorias
}

// LISTAR POSTAGENS DE UMA CATEGORIA ESPECÍFICA
async function getByCategoria(categoria) {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .ilike('categoria', categoria)
    .order('id', { ascending: true })

  if (error) throw error
  return data
}

// CRIAR UMA NOVA POSTAGEM
async function create(post) {
  const {
    titulo,
    descricao,
    categoria,
    thumbImage,
    thumbImageAltText,
    profileThumbImage,
    profileName,
    postDate,
  } = post

  const { data, error } = await supabase
    .from(TABELA)
    .insert([
      {
        titulo,
        descricao,
        categoria: categoria || 'geral',
        thumb_image: thumbImage,
        thumb_image_alt_text: thumbImageAltText,
        profile_thumb_image: profileThumbImage,
        profile_name: profileName,
        post_date: postDate,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// EDITAR UMA POSTAGEM EXISTENTE
async function update(id, post) {
  const camposPermitidos = {
    titulo: post.titulo,
    descricao: post.descricao,
    categoria: post.categoria,
    thumb_image: post.thumbImage,
    thumb_image_alt_text: post.thumbImageAltText,
    profile_thumb_image: post.profileThumbImage,
    profile_name: post.profileName,
    post_date: post.postDate,
  }

  // Remove campos que não vieram no corpo da requisição,
  // assim o PUT/PATCH só atualiza o que foi enviado
  Object.keys(camposPermitidos).forEach((chave) => {
    if (camposPermitidos[chave] === undefined) delete camposPermitidos[chave]
  })

  const { data, error } = await supabase
    .from(TABELA)
    .update(camposPermitidos)
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw error
  return data
}

// DELETAR UMA POSTAGEM
async function remove(id) {
  const { error } = await supabase.from(TABELA).delete().eq('id', id)
  if (error) throw error
}

module.exports = {
  getAll,
  getById,
  getCategorias,
  getByCategoria,
  create,
  update,
  remove,
}
