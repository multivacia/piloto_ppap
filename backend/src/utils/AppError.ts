// Erro de aplicação com status HTTP embutido. Lançado dentro dos services
// e traduzido para JSON pelo middleware de erro central (nenhum controller
// precisa montar response de erro manualmente).
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }

  static notFound(message = "Recurso não encontrado") {
    return new AppError(message, 404);
  }

  static forbidden(message = "Acesso não permitido") {
    return new AppError(message, 403);
  }

  static unauthorized(message = "Não autenticado") {
    return new AppError(message, 401);
  }

  static badRequest(message = "Requisição inválida") {
    return new AppError(message, 400);
  }
}
