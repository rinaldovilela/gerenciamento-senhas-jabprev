# Plano de Implementação: Melhorias no Painel da TV e Funcionalidade "Chamar Novamente"

## 1. Melhorias Propostas para o Painel da TV (PublicDisplayScreen)
Com base na análise do projeto e no feedback, adicionaremos os seguintes elementos:

*   **Painel Lateral de Imagens:** Espaço para exibir imagens institucionais (utilizando as imagens disponíveis em `public/images/`, como fotos da fachada e instituição).
*   **Rodapé Informativo (Marquee/Ticker):** Um letreiro deslizante na parte inferior da tela para exibir avisos importantes.
*   **Histórico de Senhas:** Uma exibição clara das últimas senhas chamadas anteriormente, para facilitar a visualização de quem perdeu a chamada recente.
*   **QR Code Dinâmico (Opcional):** Um QR Code fixo ou rotativo na tela.

## 2. Implementação da Funcionalidade "Chamar Novamente"
Para permitir que o atendente dispare novamente o aviso visual e sonoro de uma senha que já está `in_progress`, implementaremos o seguinte fluxo:

### Fase 2.1: Lógica no Contexto (`TodayQueueContext.tsx`)
*   Criar uma nova função `recallTicket(ticketId: string)`.
*   A função utilizará o Supabase Realtime Channels (`supabase.channel('tickets-live-updates').send(...)`) para emitir um evento customizado de `broadcast` do tipo `ticket_recall`.

### Fase 2.2: Tela do Atendente (`AttendanceTrackingScreen.tsx`)
*   Na coluna "Ações", para senhas `Em Atendimento`, adicionar o botão **"Chamar Novamente"**.
*   Ao clicar no botão, chama a função `recallTicket`.

### Fase 2.3: Painel da TV (`PublicDisplayScreen.tsx`)
*   Inscrever-se no evento de broadcast `ticket_recall` usando o canal Supabase.
*   Ao receber o evento:
    *   Tocar o som de notificação e ativar a voz (SpeechSynthesis) novamente.
    *   Pulsar o quadro da senha chamada na tela para atrair atenção.

## Revisão do Usuário
- Você aprova as sugestões de design do painel da TV? Há alguma que gostaria de descartar ou focar primeiro?
- O comportamento técnico do botão "Chamar Novamente" está de acordo com a sua expectativa?
