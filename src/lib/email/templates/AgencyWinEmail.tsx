import React from 'react';

interface AgencyWinEmailProps {
    agencyName: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    price: number;
}

export const AgencyWinEmail: React.FC<AgencyWinEmailProps> = ({ agencyName, userName, userEmail, userPhone, price }) => (
    <div style={{ fontFamily: 'sans-serif', color: '#1a202c', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            NEW CLIENT CONFIRMED: {userName}
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
            Hi {agencyName},
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '24px' }}>
            The client accepted your proposal of <strong>CHF {price}</strong>. They are scheduling a call now.
        </p>
        <div style={{ backgroundColor: '#f7fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>Client Details:</h3>
            <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {userName}</p>
            <p style={{ margin: '0 0 8px 0' }}><strong>Email:</strong> {userEmail}</p>
            <p style={{ margin: '0 0 8px 0' }}><strong>Phone:</strong> {userPhone}</p>
        </div>

        <p style={{ fontSize: '14px', color: '#718096', marginTop: '32px', textAlign: 'center' }}>
            Relofinder Team
        </p>
    </div>
);

export default AgencyWinEmail;
