import { Text, Section, Button, Img, Row, Column } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, colors } from './components/EmailLayout';

interface QuotesReadyProps {
    userName: string;
    dashboardLink: string;
    agencyCount: number;
}

export const QuotesReady: React.FC<QuotesReadyProps> = ({
    userName = 'Client',
    dashboardLink = 'https://relofinder.ch/my-move',
    agencyCount = 3
}) => {
    return (
        <EmailLayout previewText={`${agencyCount} quotes are ready for your review`}>
            <Text style={h1}>Your Quotes Are Ready</Text>

            <Text style={text}>
                Hi {userName},
            </Text>

            <Text style={text}>
                Great news! We have negotiated with top-rated agencies and have <strong>{agencyCount} proposals</strong> ready for your review.
            </Text>

            {/* Visual Preview Card - "Blurred" Effect Simulation */}
            <Section style={previewContainer}>
                <div style={blurredCard}>
                    <div style={blurRow}>
                        <div style={skeletonLogo}></div>
                        <div style={skeletonLine}></div>
                    </div>
                    <div style={blurRow}>
                        <div style={skeletonPrice}></div>
                        <div style={skeletonButton}></div>
                    </div>
                </div>
                <div style={{ ...blurredCard, opacity: 0.7, transform: 'scale(0.95)', marginTop: '-10px' }}>
                    <div style={blurRow}>
                        <div style={skeletonLogo}></div>
                        <div style={skeletonLine}></div>
                    </div>
                </div>
                <div style={overlay}>
                    <Text style={overlayText}>
                        {agencyCount} Proposals Unlocked
                    </Text>
                </div>
            </Section>

            <Section style={btnContainer}>
                <Button href={dashboardLink} style={mainButton}>
                    View My Quotes
                </Button>
            </Section>

            <Text style={subtext}>
                Compare prices, read personal messages, and schedule a call with your favorite.
            </Text>
        </EmailLayout>
    );
};

export default QuotesReady;

const h1 = {
    color: colors.text,
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 24px',
};

const text = {
    color: colors.text,
    fontSize: '16px',
    lineHeight: '26px',
    margin: '0 0 16px',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '32px',
    marginBottom: '24px',
};

const mainButton = {
    backgroundColor: colors.red,
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 0 #cc3c3c', // 3D effect matching brand vibe
};

const subtext = {
    color: colors.muted,
    fontSize: '14px',
    textAlign: 'center' as const,
};

// CSS-in-JS for "Blurred" Graphic
const previewContainer = {
    position: 'relative' as const,
    backgroundColor: '#f3f4f6',
    padding: '30px',
    borderRadius: '12px',
    overflow: 'hidden',
    margin: '24px 0',
    textAlign: 'center' as const,
};

const blurredCard = {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    filter: 'blur(3px)',
};

const blurRow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
};

const skeletonLogo = {
    width: '40px',
    height: '40px',
    backgroundColor: '#e5e7eb',
    borderRadius: '8px',
};

const skeletonLine = {
    width: '120px',
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
};

const skeletonPrice = {
    width: '80px',
    height: '24px',
    backgroundColor: '#d1d5db',
    borderRadius: '4px',
};

const skeletonButton = {
    width: '100px',
    height: '30px',
    backgroundColor: colors.brand,
    opacity: 0.3,
    borderRadius: '6px',
};

const overlay = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(2px)',
};

const overlayText = {
    backgroundColor: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    color: colors.text,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
};
