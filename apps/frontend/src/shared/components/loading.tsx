import React from 'react';

export interface LoadingProps {
  isLoading: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ isLoading, message = 'Carregando...' }) => {
  if (!isLoading) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>⏳</div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export const LoadingOverlay: React.FC<LoadingProps> = ({ isLoading, message = 'Processando...' }) => {
  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
        <p>{message}</p>
      </div>
    </div>
  );
};
