import { Text, Section, Button, Row, Column } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, colors } from './components/EmailLayout';

interface AgencyOpportunityProps {
    leadSummary: {
        origin: string;
        destination: string;
        familySize: string;
        moveDate: string;
    };
    quoteLink: string;
}

export const AgencyOpportunity: React.FC<AgencyOpportunityProps> = ({
    leadSummary = { origin: 'London', destination: 'Zurich', familySize: 'Couple + 1 Child', moveDate: 'ASAP' },
    quoteLink = 'https://relofinder.ch/agency/quote'
}) => {
    return (
        <EmailLayout previewText={`New Lead: Move to ${leadSummary.destination}`}>
            <Section style={alertHeader}>
                <Text style={alertText}>BUSINESS ALERT</Text>
            </Section>

            <Text style={h1}>New Relocation Opportunity</Text>

            <Text style={text}>
                A new high-intent lead matches your service area. Submit a proposal to win this client.
            </Text>

            {/* Data Box */}
            <Section style={dataBox}>
                <Row style={row}>
                    <Column><Text style={label}>FROM</Text></Column>
                    <Column><Text style={value}>{leadSummary.origin}</Text></Column>
                </Row>
                <Row style={row}>
                    <Column><Text style={label}>TO</Text></Column>
                    <Column><Text style={value}>{leadSummary.destination}</Text></Column>
                </Row>
                <Row style={row}>
                    <Column><Text style={label}>WHO</Text></Column>
                    <Column><Text style={value}>{leadSummary.familySize}</Text></Column>
                </Row>
                <Row style={row}>
                    <Column><Text style={label}>WHEN</Text></Column>
                    <Column><Text style={value}>{leadSummary.moveDate}</Text></Column>
                </Row>
            </Section>

            <Section style={btnContainer}>
                <Button href={quoteLink} style={mainButton}>
                    Submit Proposal
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default AgencyOpportunity;

const alertHeader = {
    backgroundColor: '#EFF6FF', // Blue-50
    padding: '8px',
    borderRadius: '4px',
    textAlign: 'center' as const,
    marginBottom: '24px',
    border: '1px solid #BFDBFE',
};

const alertText = {
    color: '#1E40AF', // Blue-800
    fontSize: '12px',
    fontWeight: 'bold',
    margin: 0,
    letterSpacing: '0.05em',
};

const h1 = {
    color: colors.text,
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '0 0 16px',
};

const text = {
    color: colors.text,
    fontSize: '16px',
    textAlign: 'center' as const,
    margin: '0 0 24px',
};

const dataBox = {
    backgroundColor: '#F9FAFB',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '16px',
};

const row = {
    marginBottom: '8px',
};

const label = {
    fontSize: '12px',
    color: colors.muted,
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    margin: 0,
};

const value = {
    fontSize: '16px',
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'right' as const,
    margin: 0,
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '24px',
};

const mainButton = {
    backgroundColor: colors.text, // Professional dark button
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
};
