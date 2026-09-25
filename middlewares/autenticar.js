const jwt = require('jsonwebtoken')

// Exige um token válido (Authorization: Bearer <token>).
// Em caso de sucesso, preenche req.usuario com { id, nome, email }.
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const [tipo, token] = authHeader.split(' ')

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Você precisa estar logado para fazer isso' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = { id: payload.id, nome: payload.nome, email: payload.email }
    next()
  } catch (error) {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada, faça login novamente' })
  }
}

module.exports = { autenticar }
