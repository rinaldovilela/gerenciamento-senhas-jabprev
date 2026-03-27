
import React, { useState, useCallback, useEffect } from 'react';
import { QueueProvider } from '@features/queue/contexts/QueueContext';
import { TodayQueueProvider, useTodayQueue } from '@features/queue/contexts/TodayQueueContext';
import { AuthProvider } from '@features/auth/contexts/AuthContext';
import { HomeScreen } from '@features/queue/components';
import { ServiceSelectionScreen } from '@features/queue/components';
import { TicketScreen } from '@features/queue/components';
import { LoginScreen } from '@features/auth/components';
import { RestrictedArea } from '@features/queue/components';
import { UserTypeSelectionScreen } from '@features/queue/components';
import { PrioritySelectionScreen } from '@features/queue/components';
import { PublicDisplayScreen } from '@features/queue/components';
import { NameInputScreen } from '@features/queue/components';
import Toast from '@shared/components/Toast';
import type { Ticket, Service, UserType } from '@shared/types';
import { Screen } from '@shared/types';

const AppContent: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [isPriority, setIsPriority] = useState<boolean>(false);
    const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);
    const [isGeneratingTicket, setIsGeneratingTicket] = useState<boolean>(false);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'info',
    });
    const { addTicket } = useTodayQueue();

    // Detectar se entrou em fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
            setFullscreenMode(isFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const requestFullscreen = useCallback(async () => {
        try {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if ((element as any).webkitRequestFullscreen) {
                await (element as any).webkitRequestFullscreen();
            }
            setCurrentScreen(Screen.USER_TYPE_SELECTION);
        } catch (error) {
            console.error('Erro ao entrar em fullscreen:', error);
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        try {
            if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                }
            }
            setCurrentScreen(Screen.HOME);
            setActiveTicket(null);
            setSelectedService(null);
            setSelectedUserType(null);
            setIsPriority(false);
        } catch (error) {
            console.error('Erro ao sair de fullscreen:', error);
        }
    }, []);

    const handleStart = useCallback(() => {
        setCurrentScreen(Screen.USER_TYPE_SELECTION);
    }, []);

    const handleUserTypeSelected = useCallback((userType: UserType) => {
        setSelectedUserType(userType);
        if (userType === 'servidor_ativo') {
            setCurrentScreen(Screen.PRIORITY_SELECTION);
        } else {
            setIsPriority(false); 
            setCurrentScreen(Screen.SERVICE_SELECTION);
        }
    }, []);
    
    const handlePrioritySelected = useCallback((priority: boolean) => {
        if (!priority) {
            // Ao selecionar "Não", volta para seleção de tipo de atendimento
            setSelectedUserType(null);
            setIsPriority(false);
            setCurrentScreen(Screen.USER_TYPE_SELECTION);
        } else {
            // Ao selecionar "Sim", continua para seleção de serviço
            setIsPriority(true);
            setCurrentScreen(Screen.SERVICE_SELECTION);
        }
    }, []);

    const handleServiceSelected = useCallback(async (service: Service) => {
        setSelectedService(service);

        if (!selectedUserType) {
            setCurrentScreen(Screen.HOME);
            return;
        }

        setCurrentScreen(Screen.NAME_INPUT);
    }, [selectedUserType]);

    const handleAttendeeNameSubmitted = useCallback(async (attendeeName: string) => {
        if (isGeneratingTicket) {
            return;
        }

        if (!selectedUserType) {
            setCurrentScreen(Screen.HOME);
            return;
        }

        if (!selectedService) {
            setCurrentScreen(Screen.SERVICE_SELECTION);
            return;
        }
        
        try {
            setIsGeneratingTicket(true);
            const newTicket = await addTicket(selectedService.id, selectedUserType, isPriority, attendeeName);
            if (newTicket) {
                setActiveTicket(newTicket);
                setCurrentScreen(Screen.TICKET);
            } else {
                setToast({ show: true, message: 'Erro ao gerar senha. Por favor, tente novamente.', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to create ticket:', error);
            setToast({ show: true, message: 'Erro de conexão. Verifique sua internet.', type: 'error' });
        } finally {
            setIsGeneratingTicket(false);
        }
    }, [addTicket, selectedService, selectedUserType, isPriority, isGeneratingTicket]);

    const handleNewTicketRequest = useCallback(() => {
        setActiveTicket(null);
        setSelectedService(null);
        setSelectedUserType(null);
        setIsPriority(false);
        // Em fullscreen, retorna para selecionar tipo de atendimento
        // Fora de fullscreen, retorna para home
        setCurrentScreen(fullscreenMode ? Screen.USER_TYPE_SELECTION : Screen.HOME);
    }, [fullscreenMode]);

    const showLogin = useCallback(() => {
        setCurrentScreen(Screen.LOGIN);
    }, []);
    
    const showHome = useCallback(() => {
        setSelectedUserType(null);
        setSelectedService(null);
        setIsPriority(false);
        setCurrentScreen(fullscreenMode ? Screen.USER_TYPE_SELECTION : Screen.HOME);
    }, [fullscreenMode]);

    const showUserTypeSelection = useCallback(() => {
        setCurrentScreen(Screen.USER_TYPE_SELECTION);
    }, []);

    const showPublicDisplay = useCallback(() => {
        setCurrentScreen(Screen.PUBLIC_DISPLAY);
    }, []);

    const handleLoginSuccess = useCallback(() => {
        setCurrentScreen(Screen.RESTRICTED_AREA);
    }, []);

    const handleBackFromServiceSelection = useCallback(() => {
        if (selectedUserType === 'servidor_ativo') {
            setCurrentScreen(Screen.PRIORITY_SELECTION);
        } else {
            setCurrentScreen(Screen.USER_TYPE_SELECTION);
        }
    }, [selectedUserType]);


    const renderScreen = () => {
        // Em fullscreen, nunca mostra Home - vai direto para UserTypeSelection
        if (fullscreenMode && currentScreen === Screen.HOME) {
            return <UserTypeSelectionScreen onSelect={handleUserTypeSelected} onBack={exitFullscreen} />;
        }

        switch (currentScreen) {
            case Screen.HOME:
                return <HomeScreen onStart={handleStart} onAdminClick={showLogin} onPublicDisplayClick={showPublicDisplay} onFullscreenMode={requestFullscreen} />;
            case Screen.USER_TYPE_SELECTION:
                return <UserTypeSelectionScreen onSelect={handleUserTypeSelected} onBack={fullscreenMode ? exitFullscreen : showHome} fullscreenMode={fullscreenMode} />;
            case Screen.PRIORITY_SELECTION:
                return <PrioritySelectionScreen onSelect={handlePrioritySelected} onBack={showUserTypeSelection} fullscreenMode={fullscreenMode} />;
            case Screen.SERVICE_SELECTION:
                return <ServiceSelectionScreen onServiceSelected={handleServiceSelected} onBack={handleBackFromServiceSelection} fullscreenMode={fullscreenMode} />;
            case Screen.NAME_INPUT:
                return selectedService
                    ? <NameInputScreen service={selectedService} onSubmit={handleAttendeeNameSubmitted} onBack={() => setCurrentScreen(Screen.SERVICE_SELECTION)} fullscreenMode={fullscreenMode} />
                    : <ServiceSelectionScreen onServiceSelected={handleServiceSelected} onBack={handleBackFromServiceSelection} fullscreenMode={fullscreenMode} />;
            case Screen.TICKET:
                return activeTicket ? <TicketScreen ticket={activeTicket} onNewTicket={handleNewTicketRequest} onExit={fullscreenMode ? exitFullscreen : undefined} fullscreenMode={fullscreenMode} /> : <HomeScreen onStart={handleStart} onAdminClick={showLogin} onPublicDisplayClick={showPublicDisplay} onFullscreenMode={requestFullscreen} />;
            case Screen.LOGIN:
                return <LoginScreen onLoginSuccess={handleLoginSuccess} onBack={showHome} />;
            case Screen.RESTRICTED_AREA:
                return <RestrictedArea onExit={showHome} />;
            case Screen.PUBLIC_DISPLAY:
                return <PublicDisplayScreen onBack={showHome} />;
            default:
                return <HomeScreen onStart={handleStart} onAdminClick={showLogin} onPublicDisplayClick={showPublicDisplay} onFullscreenMode={requestFullscreen} />;
        }
    };

    return (
        <div className="min-h-screen font-sans">
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((prev) => ({ ...prev, show: false }))}
            />
            {renderScreen()}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <QueueProvider>
                <TodayQueueProvider>
                    <AppContent />
                </TodayQueueProvider>
            </QueueProvider>
        </AuthProvider>
    );
};

export default App;
