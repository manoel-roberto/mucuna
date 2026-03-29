# PLAN-ui-ux-mucuna

Planejamento para a adequação visual da página de Classificação de Habilitados seguindo a identidade "Mucunã" (Segurança Orgânica).

## Objetivo
Transformar a interface atual em uma experiência premium, focada em segurança, clareza e conversão, utilizando vidro (glassmorphism), tipografia elegante (Lora/Raleway) e cores orgânicas (Emerald/Slate).

---

## 🛠️ Alterações Propostas

### 1. Sistema Global de Estilos
- **Tipografia**: Garantir importação das fontes **Lora** (Headings) e **Raleway** (Body).
- **Cores**: Definir variáveis CSS ou classes Tailwind consistentes para `emerald-600` (Ações Positivas) e `slate-900` (Texto/Primário).

### 2. Refatoração da Página Principal (`classificacao/page.tsx`)
- **Header**: Ajustar pesos de fonte e espaçamentos.
- **Cards de Estatísticas**:
  - Bordas mais arredondadas (`rounded-[24px]` ou `[32px]`).
  - Sombras suaves (`shadow-emerald-100/50`).
  - Progress bars com cores vibrantes.
- **Tabela de Habilitados**:
  - Cabeçalho com tipografia em caixa alta e tracking largo.
  - Linhas com efeito hover suave.
  - Badges de status com cores semânticas orgânicas.

### 3. Modais (Import, Novo, Vagas, Análise)
- **Overlay**: Aplicar `backdrop-blur-md` e `bg-slate-900/40`.
- **Container**: Border-radius exagerado (`rounded-[32px]`), padding amplo (`p-8` ou `p-10`).
- **Botões**:
  - Botão Primário: `bg-emerald-600` com sombra `shadow-emerald-100`.
  - Botão Secundário: `bg-slate-100` ou Outline elegante.
- **Inputs**: Estilo limpo, bordas finas, foco com anel de cor suave.

---

## 📅 Cronograma de Alterações

| Item | Componente | Descrição |
|------|------------|-----------|
| 1 | Estilos Base | Fontes e Tokens Globais |
| 2 | Modal Import | Novo layout conforme Imagem 1 |
| 3 | Modal Novo Habilitado | Novo layout conforme Imagem 2 |
| 4 | Modal Análise/Vagas | Novo layout conforme Imagens 3 e 4 |
| 5 | Tabela e Lista | Refinamento final conforme Imagem 5 |

---

## ✅ Plano de Verificação

### Testes Visuais (Browser)
1. Abrir cada modal e comparar com as capturas do usuário.
2. Validar responsividade em 375px e 1440px.
3. Verificar contraste das cores (A11y).
4. Testar animações de hover e transições de modal.

---

## 📝 Questões Socráticas
1. **Ícones**: Deseja usar uma biblioteca específica (ex: Lucide-React)? Nas imagens os ícones parecem ser delineados (outline).
2. **Branding**: O "Watermark" da Mucunã que aparece no fundo da tabela (Imagem 5) deve ser implementado como um background fixo ou um elemento flutuante?
