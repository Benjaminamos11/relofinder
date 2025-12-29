import { Text, Section, Button, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, colors } from './components/EmailLayout';

interface AgencyWinProps {
    agencyName: string;
    clientDetails: {
        name: string;
        email: string;
        phone: string;
        moveDate: string;
    };
}

export const AgencyWin: React.FC<AgencyWinProps> = ({
    agencyName = 'Partner',
    clientDetails = { name: 'Sarah Smith', email: 'sarah@example.com', phone: '+41 79 000 00 00', moveDate: '01.03.2025' }
}) => {
    return (
        <EmailLayout previewText={`Congrats! You won the client ${clientDetails.name}`}>
            <Text style={h1}>🎉 Deal Confirmed!</Text>

            <Text style={text}>
                Hi {agencyName},
            </Text>

            <Text style={text}>
                Excellent news. The client has accepted your proposal and is eager to start working with you.
            </Text>

            <Text style={importantText}>
                They have been prompted to book a call via your Calendly, but you should reach out immediately to confirm.
            </Text>

            <Section style={detailsContainer}>
                <Text style={detailRow}><strong>Name:</strong> {clientDetails.name}</Text>
                <Text style={detailRow}><strong>Email:</strong> <a href={`mailto:${clientDetails.email}`} style={{ color: colors.brand }}>{clientDetails.email}</a></Text>
                <Text style={detailRow}><strong>Phone:</strong> {clientDetails.phone}</Text>
                <Text style={detailRow}><strong>Move Date:</strong> {clientDetails.moveDate}</Text>
            </Section>

            <Section style={btnContainer}>
                <Button href={`mailto:${clientDetails.email}`} style={mainButton}>
                    Email Client Now
                </Button>
            </Section>
        </EmailLayout>
    );
};

export default AgencyWin;

const h1 = {
    color: colors.brand,
    fontSize: '28px',
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

const importantText = {
    ...text,
    fontWeight: 'bold',
};

const detailsContainer = {
    backgroundColor: '#FFF1F2', // Light Red/Pink bg
    border: '1px solid #FECDD3',
    borderRadius: '8px',
    padding: '24px',
    margin: '24px 0',
};

const detailRow = {
    fontSize: '16px',
    color: colors.text,
    margin: '8px 0',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const mainButton = {
    backgroundColor: colors.brand,
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'inline-block',
};
