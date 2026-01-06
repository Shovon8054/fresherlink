import React from 'react';

export default function Card({ message, onClose, type = 'info' }) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      background: type === 'error' ? '#ffdddd' : '#e0f7fa',
      color: type === 'error' ? '#b71c1c' : '#006064',
      border: '1px solid',
      borderColor: type === 'error' ? '#b71c1c' : '#006064',
      borderRadius: 8,
      padding: '16px 24px',
      minWidth: 220,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        color: 'inherit',
        fontWeight: 'bold',
        fontSize: 18,
        cursor: 'pointer'
      }}>&times;</button>
    </div>
  );
}
