import React from 'react';
import { Button, Text, Section } from '@react-email/components';
import { EmailLayout, colors } from './components/EmailLayout';

interface MagicLinkEmailProps {
    magicLink: string;
}

export const MagicLinkEmail: React.FC<MagicLinkEmailProps> = ({ magicLink }) => {
    return (
        <EmailLayout previewText="Log in to your Relofinder Partner Dashboard">
            <Text style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: colors.text }}>
                Your Login Link
            </Text>

            <Text style={{ fontSize: '16px', lineHeight: '1.6', color: colors.text, marginBottom: '24px' }}>
                Click the button below to sign in to your Partner Dashboard. This link will expire in 24 hours.
            </Text>

            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Button
                    href={magicLink}
                    style={{
                        backgroundColor: colors.brand,
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        textDecoration: 'none',
                    }}
                >
                    Sign In to Dashboard
                </Button>
            </Section>

            <Text style={{ fontSize: '14px', lineHeight: '1.5', color: colors.muted }}>
                If you didn't request this link, you can safely ignore this email.
            </Text>
        </EmailLayout>
    );
};

export default MagicLinkEmail;
