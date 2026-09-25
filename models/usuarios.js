const { supabase } = require('../config/supabaseClient')
const bcrypt = require('bcryptjs')

const TABELA = 'usuarios'

// CRIAR UM NOVO USUÁRIO (senha já sai como hash, nunca em texto puro)
async function criar({ nome, email, senha }) {
  const senha_hash = await bcrypt.hash(senha, 10)

  const { data, error } = await supabase
    .from(TABELA)
    .insert([{ nome, email, senha_hash }])
    .select('id, nome, email, created_at')
    .single()

  if (error) throw error
  return data
}

// BUSCAR USUÁRIO PELO E-MAIL (inclui o hash da senha, usado só no login)
async function buscarPorEmail(email) {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .eq('email', email)
    .maybeSingle()

  if (error) throw error
  return data
}

// BUSCAR USUÁRIO PELO ID (sem o hash da senha)
async function buscarPorId(id) {
  const { data, error } = await supabase
    .from(TABELA)
    .select('id, nome, email, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

// COMPARAR A SENHA INFORMADA NO LOGIN COM O HASH SALVO
async function verificarSenha(usuarioComHash, senha) {
  return bcrypt.compare(senha, usuarioComHash.senha_hash)
}

module.exports = {
  criar,
  buscarPorEmail,
  buscarPorId,
  verificarSenha,
}
