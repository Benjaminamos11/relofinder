import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, colors } from './components/EmailLayout';

interface AdminAlertProps {
    type: string;
    data: any;
}

export const AdminAlert: React.FC<AdminAlertProps> = ({
    type = 'New Lead',
    data = { id: '123', name: 'Test User' }
}) => {
    return (
        <EmailLayout previewText={`[Admin] ${type}`}>
            <Text style={h1}>🛎️ Admin Alert: {type}</Text>

            <Section style={codeBlock}>
                <pre style={{ margin: 0, ...code }}>{JSON.stringify(data, null, 2)}</pre>
            </Section>

            <Text style={footer}>
                System Notification | Relofinder
            </Text>
        </EmailLayout>
    );
};

export default AdminAlert;

const h1 = {
    color: colors.text,
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 0 16px',
};

const codeBlock = {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '16px',
    overflowX: 'auto' as const,
};

const code = {
    color: '#F8FAFC',
    fontSize: '12px',
    fontFamily: 'monospace',
};

const footer = {
    fontSize: '12px',
    color: colors.muted,
    marginTop: '24px',
};
