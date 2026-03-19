
import React from 'react';
import type { Service, Translations } from './types';

// --- Icon Components ---

const CalculatorIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="8" y1="6" x2="16" y2="6"></line>
    <line x1="16" y1="14" x2="16" y2="18"></line>
    <line x1="12" y1="10" x2="12" y2="18"></line>
    <line x1="8" y1="10" x2="8" y2="18"></line>
    <line x1="8" y1="14" x2="12" y2="14"></line>
  </svg>
);

const FileCheckIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

const FileSearchIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <circle cx="11.5" cy="14.5" r="2.5" />
    <path d="M13.25 16.25 15 18" />
  </svg>
);

const ReceiptIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </svg>
);

const FileTextIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const UsersIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const InfoIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const TvIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
        <polyline points="17 2 12 7 7 2"/>
    </svg>
);


// --- Services ---

export const SERVICES: Service[] = [
    // Gerência de Benefícios
    { id: 'simulacao', name: 'Simulação de Aposentadoria', description: 'Calcule e planeje seus benefícios', category: 'Gerência de Benefícios', prefix: 'B', icon: <CalculatorIcon className="w-12 h-12 text-jaboatao-blue" /> },
    { id: 'solicitacao', name: 'Solicitação de Benefício', description: 'Aposentadoria ou pensão', category: 'Gerência de Benefícios', prefix: 'B', icon: <FileCheckIcon className="w-12 h-12 text-jaboatao-blue" /> },
    { id: 'ctc', name: 'Certidão (CTC)', description: 'Solicite sua Certidão de Tempo de Contribuição', category: 'Gerência de Benefícios', prefix: 'B', icon: <FileTextIcon className="w-12 h-12 text-jaboatao-blue" /> },
    
    // Gerência Jurídica
    { id: 'revisao', name: 'Revisão de Benefícios', description: 'Processos e recursos administrativos', category: 'Gerência Jurídica', prefix: 'J', icon: <FileSearchIcon className="w-12 h-12 text-jaboatao-blue" /> },
    
    // Gerência de Folha de Pagamento
    { id: 'folha', name: 'Descontos em Folha', description: 'Dúvidas sobre seu pagamento', category: 'Gerência de Folha de Pagamento', prefix: 'F', icon: <ReceiptIcon className="w-12 h-12 text-jaboatao-blue" /> },

    // Geral
    { id: 'outros', name: 'Outros Serviços', description: 'Orientações gerais e informações', category: 'Geral', prefix: 'G', icon: <InfoIcon className="w-12 h-12 text-jaboatao-blue" /> },
];

export const PANEL_CONFIG = {
  atualizacaoAutomatica: 5000, // ms
  mostrarEmAtendimento: 4,
  mostrarProximas: 5,
  mostrarSons: true,
  mostrarMensagensInstitucionais: true,
};

export const TRANSLATIONS: Translations = {
    startService: { pt: 'Iniciar Atendimento', en: 'Start Service' },
    selectService: { pt: 'Selecione o Serviço Desejado', en: 'Select the Desired Service' },
    searchService: { pt: 'Buscar serviço...', en: 'Search for a service...' },
    yourTicket: { pt: 'Sua Senha', en: 'Your Ticket' },
    goToCounter: { pt: 'Dirija-se ao guichê', en: 'Please go to counter' },
    peopleAhead: { pt: 'pessoas na sua frente', en: 'people ahead of you' },
    waitTime: { pt: 'Tempo de espera estimado', en: 'Estimated wait time' },
    minutes: { pt: 'minutos', en: 'minutes' },
    reprintTicket: { pt: 'Reimprimir Senha', en: 'Reprint Ticket' },
    returnNow: { pt: 'Voltar Agora', en: 'Return Now' },
    ticketGeneratedSuccess: { pt: 'Sua senha foi gerada com sucesso!', en: 'Your ticket was generated successfully!' },
    autoReturnMessage: { pt: 'Você será redirecionado à tela inicial em {countdown} segundos.', en: 'You will be returned to the home screen in {countdown} seconds.' },
    adminPanel: { pt: 'Painel do Atendente', en: 'Admin Panel' },
    waitingQueue: { pt: 'Fila de Espera', en: 'Waiting Queue' },
    callNext: { pt: 'Chamar Próximo', en: 'Call Next' },
    currentlyServing: { pt: 'Atendendo Agora', en: 'Currently Serving' },
    noOneServing: { pt: 'Ninguém sendo atendido.', en: 'No one is being served.'},
    exit: { pt: 'Sair', en: 'Exit' },
    back: { pt: 'Voltar', en: 'Back' },
    ticketCalled: { pt: 'Sua senha foi chamada!', en: 'Your ticket has been called!' },
    restrictedAccess: { pt: 'Acesso Restrito', en: 'Restricted Access' },
    email: { pt: 'E-mail Institucional', en: 'Institutional E-mail' },
    password: { pt: 'Senha', en: 'Password' },
    login: { pt: 'Entrar', en: 'Login' },
    loginError: { pt: 'Credenciais inválidas. Tente novamente.', en: 'Invalid credentials. Please try again.' },
    metricsDashboard: { pt: 'Painel de Métricas', en: 'Metrics Dashboard' },
    logout: { pt: 'Sair (Logout)', en: 'Logout' },
    loggedInAs: { pt: 'Logado como', en: 'Logged in as' },
    totalTickets: { pt: 'Total de Senhas', en: 'Total Tickets' },
    avgWaitTime: { pt: 'Tempo Médio de Espera', en: 'Avg. Wait Time' },
    completedServices: { pt: 'Atendimentos Finalizados', en: 'Completed Services' },
    ticketsByService: { pt: 'Senhas por Serviço', en: 'Tickets by Service' },
};