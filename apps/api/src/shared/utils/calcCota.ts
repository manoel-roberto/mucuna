/**
 * Função centralizada de arredondamento legislativo (UEFS)
 * 
 * Regras:
 * 1. Multiplica o total pelo percentual.
 * 2. Se a fração for >= 0.5, arredonda para cima. Caso contrário, para baixo.
 * 3. Se tipo for 'negro' e total >= 5, o mínimo é 1 vaga.
 * 4. Se tipo for 'pcd' e total >= 20, o mínimo é 1 vaga.
 */
export function calcCota(
  total: number,
  percentual: number,
  tipo: 'negro' | 'pcd',
): number {
  if (total <= 0) return 0;
  
  const resultado = total * (percentual / 100);
  const inteiro = Math.floor(resultado);
  const fracao = resultado - inteiro;

  // Arredondamento Legislativo: 0.5 para cima
  let final = fracao >= 0.5 ? Math.ceil(resultado) : Math.floor(resultado);

  // Regra de Mínimo Obrigatório
  if (tipo === 'negro' && total >= 5 && final < 1) final = 1;
  if (tipo === 'pcd' && total >= 20 && final < 1) final = 1;

  return final;
}
