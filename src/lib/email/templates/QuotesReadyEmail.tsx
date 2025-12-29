import React from 'react';

interface QuotesReadyEmailProps {
    userName: string;
    city: string;
    dashboardUrl: string;
}

export const QuotesReadyEmail: React.FC<QuotesReadyEmailProps> = ({ userName, city, dashboardUrl }) => (
    <div style={{ fontFamily: 'sans-serif', color: '#1a202c', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            3 Relocation Quotes are ready for your move to {city}.
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
            Hi {userName},
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '24px' }}>
            We have audited the market. Prime Relocation and Welcome Service have submitted proposals for your move. Compare prices and book your intro call.
        </p>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <a href={dashboardUrl} style={{
                backgroundColor: '#FF6F61',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px'
            }}>
                View My Dashboard
            </a>
        </div>
        <p style={{ fontSize: '14px', color: '#718096', marginTop: '32px', textAlign: 'center' }}>
            Relofinder Team
        </p>
    </div>
);

export default QuotesReadyEmail;
