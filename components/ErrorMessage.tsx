import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, fullPage = false }) => {
  const containerStyle: React.CSSProperties = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    zIndex: 9999,
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  };

  return (
    <div style={containerStyle}>
      <div style={{
        background: '#fee',
        border: '2px solid #fcc',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        textAlign: 'center',
      }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c33"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: '0 auto 16px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 style={{ color: '#c33', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>
          Something went wrong
        </h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: onRetry ? '16px' : 0 }}>
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#5568d3'}
            onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
