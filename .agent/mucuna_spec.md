# 🌿 Spec de Identidade Visual: Sistema Mucunã (v1.0)

Este documento define as diretrizes visuais e técnicas para o desenvolvimento do **Sistema Mucunã**. O objetivo é garantir que toda a interface e comunicação gerada pelo **Gemini 3 Flash** mantenha a consistência entre o conceito orgânico (semente) e o tecnológico (rede de dados).

---

## 🎨 1. Paleta de Cores (Hex Codes)
O modelo deve referenciar estas cores em todos os componentes de UI, gráficos e estilos:

| Elemento | Cor | Hex Code | Aplicação Sugerida |
| :--- | :--- | :--- | :--- |
| **Primária** | Verde Profundo | `#1A432F` | Headers, textos principais, botões de ação. |
| **Secundária** | Marrom Mucunã | `#6D432A` | Ícones orgânicos, detalhes de marca. |
| **Destaque** | Bronze/Cobre | `#B07D4E` | Alertas, estados de 'hover', detalhes de luxo. |
| **Suporte** | Verde Musgo | `#4F7942` | Status de sucesso, conexões ativas. |
| **Superfície** | Off-White | `#F8F9F9` | Fundos de tela, cards e áreas de leitura. |

---

## 🔡 2. Tipografia e Estilo
Para manter a força visual da logo:
* **Títulos (Headings):** Família **Montserrat** (Bold/Black). Uso preferencial em *Uppercase* para títulos de seções.
* **Corpo (Body):** Família **Inter** ou **Open Sans**. Foco em legibilidade técnica e limpeza.
* **Peso Visual:** Design robusto, com bordas levemente arredondadas (`border-radius: 8px`).

---

## 🕸️ 3. Linguagem Visual (UI/UX)
* **Conceito Central:** "Segurança Orgânica".
* **Elementos Gráficos:** Uso de círculos concêntricos e linhas de conexão que remetam tanto a sistemas de rede quanto às fibras naturais.
* **Iconografia:** Traços limpos (Line Art). Evitar ícones muito coloridos ou infantis.
* **Contrastes:** Priorizar o fundo claro (`#F8F9F9`) com textos no verde profundo (`#1A432F`) para evitar fadiga ocular.

---

## 🤖 4. Skill / Prompt de Sistema para Gemini 3 Flash
Ao atuar como o arquiteto do projeto Mucunã, siga estas diretrizes de comportamento:

> "Você é o especialista em design do Sistema Mucunã. Suas sugestões de interface, código CSS ou descrições visuais devem sempre refletir solidez, proteção e conexão. Substitua o padrão 'azul tecnológico' pelos tons de **Verde Profundo** e **Bronze**. Sempre que criar um componente, aplique a filosofia de que o sistema é resistente como a casca da semente e conectado como uma raiz."

---

## 🛠️ 5. Exemplo de Implementação Quick-CSS
```css
:root {
  --primary-mucuna: #1A432F;
  --secondary-mucuna: #6D432A;
  --accent-mucuna: #B07D4E;
  --bg-mucuna: #F8F9F9;
}

.button-primary {
  background-color: var(--primary-mucuna);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  border-radius: 8px;
  border: none;
}