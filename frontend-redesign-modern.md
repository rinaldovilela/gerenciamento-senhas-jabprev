# Plano de Redesenho Visual: JaboatãoPrev High-Tech Frontend

Este plano define a estratégia de design e implementação para transformar o sistema de gerenciamento de senhas do JaboatãoPrev em uma interface moderna, tecnológica, com layout fora da curva, mantendo a acessibilidade essencial para o público-alvo de aposentados e pensionistas.

---

## 🎨 Direção de Design: Corporativo Premium Premium

Adotaremos o estilo **Corporativo Premium Premium**, que combina a sobriedade institucional do JaboatãoPrev com toques modernos de interfaces SaaS de ponta:

*   **Física de Micro-Interações:** Transições suaves entre telas, escala de resposta física ao clique/toque (efeitos elásticos `active:scale-98` ou `active:scale-[0.97]`).
*   **Cards Flutuantes e Sombras Dinâmicas:** Cards premium com bordas finas (`border border-slate-100` ou `border-white/10`) e sombras suaves que reagem dinamicamente ao mouse (`hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`).
*   **Vidro Acrílico (Glassmorphism de Alto Nível):** Efeitos de desfoque de fundo (`backdrop-blur-md bg-white/70` ou `bg-slate-900/60` para temas escuros) com bordas sólidas, evitando o visual genérico.
*   **Paleta Institucional Elevada:** Utilização do Azul Jaboatão (`#204FA1`), Verde Prev (`#2E8B57`) e Destaque Amarelo (`#FFC000`) de forma harmônica (regra 60-30-10), criando alto contraste e sofisticação.
*   **Tipografia Refinada:** Montserrat para títulos corporativos expressivos e Open Sans/Poppins para corpos de texto legíveis.

---

## 🗺️ Mapa de Telas e Disposições de Layout

### 1. Tela de Login (`LoginScreen.tsx`)
*   **Nova Disposição:** Design assimétrico com um painel esquerdo institucional com grafismo tecnológico e o brasão/bandeira desfocado de forma sutil, e no lado direito o formulário de login flutuante em vidro acrílico, com inputs animados e botão de login com efeito de escala físico.

### 2. Área Restrita / Administrativa (`RestrictedArea.tsx` e sub-telas)
*   **Nova Disposição:** Dashboard estilo centro de controle financeiro. Barra lateral flutuante moderna com ícones animados no hover, cards de estatísticas interativos com elevação ao passar o mouse e cabeçalho refinado com informações do operador logado.

### 3. Outras Telas (Totem e Painel TV)
*   *Ficou acordado que estas telas serão redesenhadas após a entrega e aprovação do Login e Área Restrita.*

---

## 📋 Cronograma de Implementação (Passo a Passo)

### Fase 1: Redesenho da Tela de Login
*   [ ] Reestruturar `LoginScreen.tsx` com layout de duas colunas (Esquerda: Institucional Premium / Direita: Formulário Interativo).
*   [ ] Adicionar animações de foco e preenchimento nos inputs (sublinhados brilhantes e labels flutuantes).
*   [ ] Implementar efeito de escala elástico no botão de login.

### Fase 2: Redesenho da Área Restrita (Painel Geral)
*   [ ] Reestruturar `RestrictedArea.tsx` com uma barra lateral estilizada (`sidebar`) suspensa e com efeito de vidro acrílico.
*   [ ] Adicionar transições suaves entre as sub-telas (Atendimento, Serviços, Usuários, Métricas).
*   [ ] Redesenhar a listagem de chamadas de senhas ativas para os operadores com cards interativos.

### Fase 3: Validação de Estilo e Animações
*   [ ] Verificar legibilidade e contraste nos cartões e campos de texto.
*   [ ] Validar interatividade de hover/click em navegadores reais.


---

## 🧪 Critérios de Aceitação e Verificação
1.  **Acessibilidade:** Contraste mínimo de 4.5:1 para elementos de texto (verificado via script de acessibilidade).
2.  **Responsividade:** Adaptabilidade perfeita tanto para telas de Totem vertical quanto para TVs widescreen.
3.  **Execução de Auditoria:**
    *   `python .agents/skills/frontend-design/scripts/ux_audit.py apps/frontend`
    *   `python .agents/skills/frontend-design/scripts/accessibility_checker.py apps/frontend`
    *   `python .agents/skills/lint-and-validate/scripts/lint_runner.py apps/frontend`
