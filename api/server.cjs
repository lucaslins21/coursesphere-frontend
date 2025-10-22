const jsonServer = require('json-server');
const path = require('path');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// Login mock simples
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db; // lowdb
  const user = db.get('users').find({ email, password }).value();
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });
  return res.json({
    token: 'fake-jwt-token',
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// Cadastro simples de usuário (retorna token + user)
server.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Preencha nome, e-mail e senha' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ message: 'E-mail inválido' });
    }
    const db = router.db;
    const exists = db.get('users').find({ email }).value();
    if (exists) return res.status(409).json({ message: 'E-mail já cadastrado' });
    const users = db.get('users').value();
    const maxId = users.reduce((m, u) => Math.max(m, u.id || 0), 0);
    const newUser = { id: maxId + 1, name, email, password, role: 'instructor' };
    db.get('users').push(newUser).write();
    return res.json({ token: 'fake-jwt-token', user: { id: newUser.id, name, email, role: newUser.role } });
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

// Garantir unicidade de e-mail ao criar usuário
server.post('/users', (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'E-mail é obrigatório' });
    const db = router.db;
    const exists = db.get('users').find({ email }).value();
    if (exists) return res.status(409).json({ message: 'E-mail já cadastrado' });
    return next();
  } catch {
    return res.status(500).json({ message: 'Erro ao validar e-mail' });
  }
});

// Guard simples para endpoints protegidos
server.use((req, res, next) => {
  if (req.path.startsWith('/courses') || req.path.startsWith('/lessons')) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
});

server.use(router);

const port = process.env.PORT || 3333;
server.listen(port, () => console.log(`JSON Server on http://localhost:${port}`));
