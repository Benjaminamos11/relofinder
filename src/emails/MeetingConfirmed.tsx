import { Text, Section, Button, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, colors } from './components/EmailLayout';

interface MeetingConfirmedProps {
    userName: string;
    agencyName: string;
    calendlyLink: string;
}

export const MeetingConfirmed: React.FC<MeetingConfirmedProps> = ({
    userName = 'Client',
    agencyName = 'Prime Relocation',
    calendlyLink = 'https://calendly.com'
}) => {
    return (
        <EmailLayout previewText={`Schedule your call with ${agencyName}`}>
            <Text style={h1}>It's a Match! 🎉</Text>

            <Text style={text}>
                Hi {userName},
            </Text>

            <Text style={text}>
                You have successfully accepted the proposal from <strong>{agencyName}</strong>.
                The next step is to schedule your introduction call to discuss the details of your move.
            </Text>

            <Section style={btnContainer}>
                <Button href={calendlyLink} style={calButton}>
                    Schedule Call with {agencyName}
                </Button>
            </Section>

            <Text style={text}>
                If the link above doesn't work, they will contact you directly within 24 hours via email.
            </Text>

            <Hr style={hr} />

            {/* Cross-Sell */}
            <Section style={crossSellSection}>
                <Text style={crossSellHeading}>BEFORE YOU MOVE</Text>
                <Text style={text}>
                    Don't forget mandatory Swiss health insurance. You must sign up within 3 months of arrival.
                </Text>
                <Button href="https://expat-savvy.ch" style={linkButton}>
                    Compare Insurance →
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default MeetingConfirmed;

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
    margin: '32px 0',
};

const calButton = {
    backgroundColor: colors.brand, // Coral for scheduling
    color: '#ffffff',
    padding: '16px 32px',
    borderRadius: '50px', // Pill shape
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
};

const hr = {
    borderColor: colors.border,
    margin: '32px 0',
};

const crossSellSection = {
    color: colors.muted,
};

const crossSellHeading = {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '8px',
};

const linkButton = {
    color: colors.brand,
    fontWeight: 'bold',
    textDecoration: 'none',
};
