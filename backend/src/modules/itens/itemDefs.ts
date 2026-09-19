// Os 18 elementos do PPAP (padrão AIAG). Fonte única da verdade para
// código e título, usada pelo backend (validação/seed) e exposta ao
// frontend via GET /api/itens/defs — evita duplicar essa lista em dois lugares.
export interface ItemDef {
  code: number;
  titulo: string;
}

export const ITEM_DEFS: ItemDef[] = [
  { code: 1, titulo: "Registros de Projeto (Design Records)" },
  { code: 2, titulo: "Documentos de Alteração de Engenharia" },
  { code: 3, titulo: "Aprovação de Engenharia do Cliente" },
  { code: 4, titulo: "DFMEA - Análise de Modos de Falha do Projeto" },
  { code: 5, titulo: "Fluxograma de Processo" },
  { code: 6, titulo: "PFMEA - Análise de Modos de Falha do Processo" },
  { code: 7, titulo: "Plano de Controle" },
  { code: 8, titulo: "MSA - Análise do Sistema de Medição" },
  { code: 9, titulo: "Resultados Dimensionais" },
  { code: 10, titulo: "Resultados de Testes de Material/Desempenho" },
  { code: 11, titulo: "Estudos Iniciais de Processo (Capabilidade)" },
  { code: 12, titulo: "Documentação de Laboratório Qualificado" },
  { code: 13, titulo: "Relatório de Aprovação de Aparência (AAR)" },
  { code: 14, titulo: "Peças de Amostra de Produção" },
  { code: 15, titulo: "Amostra Testemunha (Master Sample)" },
  { code: 16, titulo: "Dispositivos de Verificação (Checking Aids)" },
  { code: 17, titulo: "Requisitos Específicos do Cliente" },
  { code: 18, titulo: "PSW - Part Submission Warrant" },
];

export const ITEM_CODES = ITEM_DEFS.map((i) => i.code);

export function isValidItemCode(code: number): boolean {
  return ITEM_CODES.includes(code);
}
