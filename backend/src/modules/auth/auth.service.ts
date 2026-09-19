import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { signToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/AppError.js";

export async function login(username: string, password: string) {
  const usuario = await prisma.usuario.findUnique({ where: { username } });

  // Mensagem genérica de propósito: não revelar se o problema foi o
  // usuário ou a senha (evita enumeração de usuários válidos).
  if (!usuario || !usuario.ativo) {
    throw AppError.unauthorized("Usuário ou senha inválidos");
  }

  const senhaOk = await bcrypt.compare(password, usuario.passwordHash);
  if (!senhaOk) {
    throw AppError.unauthorized("Usuário ou senha inválidos");
  }

  const token = signToken({
    sub: usuario.id,
    role: usuario.role,
    fornecedorId: usuario.fornecedorId,
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      username: usuario.username,
      role: usuario.role,
      fornecedorId: usuario.fornecedorId,
    },
  };
}

export async function getMe(userId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    include: { fornecedor: true },
  });
  if (!usuario) throw AppError.notFound("Usuário não encontrado");

  return {
    id: usuario.id,
    nome: usuario.nome,
    username: usuario.username,
    role: usuario.role,
    fornecedor: usuario.fornecedor
      ? { id: usuario.fornecedor.id, nome: usuario.fornecedor.nome }
      : null,
  };
}
