import { Text, Section, Button, Hr, Link } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, colors } from './components/EmailLayout';

interface RequestReceivedProps {
    userName: string;
    destination: string;
    isCorporate?: boolean;
}

export const RequestReceived: React.FC<RequestReceivedProps> = ({
    userName = 'Client',
    destination = 'Switzerland',
    isCorporate = false
}) => {
    return (
        <EmailLayout previewText={`We received your request for ${destination}`}>
            <Text style={h1}>Request Received</Text>

            <Text style={text}>
                Hi {userName},
            </Text>

            <Text style={text}>
                We have received your request for a move to <strong>{destination}</strong>.
                Our team is currently auditing the market to find the best relocation experts for your specific needs.
            </Text>

            <Text style={text}>
                You can expect to receive 3 competitive quotes within the next 24 hours.
            </Text>

            <Hr style={hr} />

            {/* Partner Spotlight Cross-Sell */}
            <Section style={spotlightSection}>
                <Text style={spotlightEyebrow}>PARTNER SPOTLIGHT</Text>
                <Text style={spotlightHeading}>Looking for off-market housing?</Text>
                <Text style={spotlightText}>
                    Get access to exclusive rental listings before they hit the major platforms.
                </Text>
                <Button href="https://offlist.ch" style={button}>
                    Explore Offlist.ch
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default RequestReceived;

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

const hr = {
    borderColor: colors.border,
    margin: '32px 0',
};

const spotlightSection = {
    backgroundColor: '#F3F4F6', // Gray-100
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
};

const spotlightEyebrow = {
    color: colors.muted,
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    marginBottom: '8px',
};

const spotlightHeading = {
    color: colors.text,
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    margin: '0 0 8px',
};

const spotlightText = {
    color: colors.text,
    fontSize: '14px',
    marginBottom: '16px',
};

const button = {
    backgroundColor: colors.text, // Dark button for offlist
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
};
