const { supabase } = require('../config/supabaseClient')

const TABELA = 'comentarios'

// Campos retornados em toda consulta, já com o nome do autor do comentário
// embutido (join com "usuarios", exposto como "usuario" na resposta)
const CAMPOS = 'id, texto, created_at, autor_id, postagem_id, usuario:usuarios(id, nome)'

// LISTAR COMENTÁRIOS DE UMA POSTAGEM (mais antigos primeiro)
async function getByPostagem(postagemId) {
  const { data, error } = await supabase
    .from(TABELA)
    .select(CAMPOS)
    .eq('postagem_id', postagemId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// BUSCAR UM COMENTÁRIO PELO ID (uso interno, para checar permissão de exclusão)
async function getById(id) {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

// CRIAR UM COMENTÁRIO EM UMA POSTAGEM
async function create({ postagemId, autorId, texto }) {
  const { data, error } = await supabase
    .from(TABELA)
    .insert([{ postagem_id: postagemId, autor_id: autorId, texto }])
    .select(CAMPOS)
    .single()

  if (error) throw error
  return data
}

// APAGAR UM COMENTÁRIO
async function remove(id) {
  const { error } = await supabase.from(TABELA).delete().eq('id', id)
  if (error) throw error
}

module.exports = {
  getByPostagem,
  getById,
  create,
  remove,
}
