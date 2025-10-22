const jsonServer = require('json-server');
const path = require('path');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// Garante coleções necessárias no banco
try {
  const db = router.db;
  if (!db.get('invitations').value()) {
    db.set('invitations', []).write();
  }
} catch {}

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

// Utilitário simples para IDs e tokens
function nextIdOf(db, collection) {
  const arr = db.get(collection).value() || [];
  return arr.reduce((m, it) => Math.max(m, it.id || 0), 0) + 1;
}
function token() { return Math.random().toString(36).slice(2) + Date.now().toString(36) }

// Enviar convite para instrutor
server.post('/invitations', (req, res) => {
  try {
    const { course_id, email, inviter_id } = req.body || {};
    if (!course_id || !email || !inviter_id) {
      return res.status(400).json({ message: 'course_id, email e inviter_id são obrigatórios' });
    }
    const db = router.db;
    const course = db.get('courses').find({ id: Number(course_id) }).value();
    if (!course) return res.status(404).json({ message: 'Curso não encontrado' });
    if (course.creator_id !== Number(inviter_id)) return res.status(403).json({ message: 'Apenas o criador pode convidar' });
    const user = db.get('users').find({ email }).value();
    if (!user) return res.status(404).json({ message: 'E-mail não registrado' });
    if ((course.instructors || []).includes(user.id)) return res.status(409).json({ message: 'Usuário já é instrutor' });
    const pending = db.get('invitations').find({ course_id: Number(course_id), email, status: 'pending' }).value();
    if (pending) return res.status(409).json({ message: 'Convite pendente já existe para este e-mail' });
    const inv = { id: nextIdOf(db, 'invitations'), course_id: Number(course_id), email, inviter_id: Number(inviter_id), status: 'pending', token: token(), created_at: new Date().toISOString() };
    db.get('invitations').push(inv).write();
    return res.json(inv);
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao criar convite' });
  }
});

// Aceitar convite
server.post('/invitations/:id/accept', (req, res) => {
  try {
    const id = Number(req.params.id);
    const { email, token: tkn } = req.body || {};
    const db = router.db;
    const inv = db.get('invitations').find({ id }).value();
    if (!inv) return res.status(404).json({ message: 'Convite não encontrado' });
    if (inv.status !== 'pending') return res.status(409).json({ message: 'Convite não está pendente' });
    if (email !== inv.email && tkn !== inv.token) return res.status(403).json({ message: 'Convite não pertence a este e-mail' });
    const user = db.get('users').find({ email: inv.email }).value();
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado para este e-mail' });
    const course = db.get('courses').find({ id: Number(inv.course_id) }).value();
    if (!course) return res.status(404).json({ message: 'Curso não encontrado' });
    const instructors = Array.from(new Set([...(course.instructors || []), user.id]));
    db.get('courses').find({ id: course.id }).assign({ instructors }).write();
    db.get('invitations').find({ id }).assign({ status: 'accepted', accepted_at: new Date().toISOString() }).write();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao aceitar convite' });
  }
});

// Recusar convite
server.post('/invitations/:id/decline', (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = router.db;
    const inv = db.get('invitations').find({ id }).value();
    if (!inv) return res.status(404).json({ message: 'Convite não encontrado' });
    if (inv.status !== 'pending') return res.status(409).json({ message: 'Convite não está pendente' });
    db.get('invitations').find({ id }).assign({ status: 'declined' }).write();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao recusar convite' });
  }
});

// Guard simples para endpoints protegidos
server.use((req, res, next) => {
  if (req.path.startsWith('/courses') || req.path.startsWith('/lessons') || req.path.startsWith('/invitations')) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
});

server.use(router);

const port = process.env.PORT || 3333;
server.listen(port, () => console.log(`JSON Server on http://localhost:${port}`));
