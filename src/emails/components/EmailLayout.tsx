import { Html, Head, Preview, Body, Container, Section, Text, Link, Img, Font } from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
    previewText: string;
    children: React.ReactNode;
}

// Design Tokens
export const colors = {
    bg: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
    brand: '#FF6F61', // Coral from UserDashboard / Homepage
    red: '#FF4B4B', // Requested Button Color
    border: '#E5E7EB',
};

export const EmailLayout: React.FC<EmailLayoutProps> = ({ previewText, children }) => {
    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="sans-serif"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Text style={logo}>Relofinder</Text>
                    </Section>

                    {/* Card Content */}
                    <Section style={card}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            &copy; {new Date().getFullYear()} Relofinder. All rights reserved. <br />
                            <Link href="https://relofinder.ch" style={link}>relofinder.ch</Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: colors.bg,
    fontFamily: '"Inter", sans-serif',
    padding: '40px 0',
};

const container = {
    margin: '0 auto',
    maxWidth: '600px',
    width: '100%',
};

const header = {
    textAlign: 'center' as const,
    marginBottom: '32px',
};

const logo = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.brand,
    fontFamily: '"Playfair Display", serif', // Matching branding
    margin: '0',
};

const card = {
    backgroundColor: colors.card,
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
};

const footer = {
    marginTop: '32px',
    textAlign: 'center' as const,
};

const footerText = {
    fontSize: '12px',
    color: colors.muted,
    lineHeight: '1.5',
};

const link = {
    color: colors.muted,
    textDecoration: 'underline',
};
