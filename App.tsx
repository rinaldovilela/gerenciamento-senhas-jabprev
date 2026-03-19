
import React, { useState, useCallback } from 'react';
import { QueueProvider, useQueue } from './contexts/QueueContext';
import { AuthProvider } from './contexts/AuthContext';
import HomeScreen from './components/HomeScreen';
import ServiceSelectionScreen from './components/ServiceSelectionScreen';
import TicketScreen from './components/TicketScreen';
import LoginScreen from './components/LoginScreen';
import RestrictedArea from './components/RestrictedArea';
import UserTypeSelectionScreen from './components/UserTypeSelectionScreen';
import PrioritySelectionScreen from './components/PrioritySelectionScreen';
import PublicDisplayScreen from './components/PublicDisplayScreen';
import type { Ticket, Service, UserType } from './types';
import { Screen } from './types';

const AppContent: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
    const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
    const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
    const [isPriority, setIsPriority] = useState<boolean>(false);
    const { addTicket } = useQueue();

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
        setIsPriority(priority);
        setCurrentScreen(Screen.SERVICE_SELECTION);
    }, []);

    const handleServiceSelected = useCallback(async (service: Service) => {
        if (!selectedUserType) {
            setCurrentScreen(Screen.HOME);
            return;
        }
        
        try {
            const newTicket = await addTicket(service.id, selectedUserType, isPriority);
            if (newTicket) {
                setActiveTicket(newTicket);
                setCurrentScreen(Screen.TICKET);
            } else {
                alert('Erro ao gerar senha. Por favor, tente novamente.');
            }
        } catch (error) {
            console.error('Failed to create ticket:', error);
            alert('Erro de conexão. Verifique sua internet.');
        }
    }, [addTicket, selectedUserType, isPriority]);

    const handleNewTicketRequest = useCallback(() => {
        setActiveTicket(null);
        setSelectedUserType(null);
        setIsPriority(false);
        setCurrentScreen(Screen.HOME);
    }, []);

    const showLogin = useCallback(() => {
        setCurrentScreen(Screen.LOGIN);
    }, []);
    
    const showHome = useCallback(() => {
        setSelectedUserType(null);
        setIsPriority(false);
        setCurrentScreen(Screen.HOME);
    }, []);

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
        switch (currentScreen) {
            case Screen.HOME:
                return <HomeScreen onStart={handleStart} onAdminClick={showLogin} onPublicDisplayClick={showPublicDisplay} />;
            case Screen.USER_TYPE_SELECTION:
                return <UserTypeSelectionScreen onSelect={handleUserTypeSelected} onBack={showHome} />;
            case Screen.PRIORITY_SELECTION:
                return <PrioritySelectionScreen onSelect={handlePrioritySelected} onBack={showUserTypeSelection} />;
            case Screen.SERVICE_SELECTION:
                return <ServiceSelectionScreen onServiceSelected={handleServiceSelected} onBack={handleBackFromServiceSelection}/>;
            case Screen.TICKET:
                return activeTicket ? <TicketScreen ticket={activeTicket} onNewTicket={handleNewTicketRequest} /> : <HomeScreen onStart={handleStart} onAdminClick={showLogin} onPublicDisplayClick={showPublicDisplay} />;
            case Screen.LOGIN:
                return <LoginScreen onLoginSuccess={handleLoginSuccess} onBack={showHome} />;
            case Screen.RESTRICTED_AREA:
                return <RestrictedArea onExit={showHome} />;
            case Screen.PUBLIC_DISPLAY:
                return <PublicDisplayScreen onBack={showHome} />;
            default:
                return <HomeScreen onStart={handleStart} onAdminClick={showLogin} onPublicDisplayClick={showPublicDisplay} />;
        }
    };

    return (
        <div className="min-h-screen font-sans">
            {renderScreen()}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <QueueProvider>
                <AppContent />
            </QueueProvider>
        </AuthProvider>
    );
};

export default App;
