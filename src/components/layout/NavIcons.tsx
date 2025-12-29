import { Building2, Lock, Menu, X, ArrowRight, Linkedin, Heart } from 'lucide-react';
import React from 'react';

export const IconLock = ({ className }: { className?: string }) => <Lock className={className} />;
export const IconBuilding = ({ className }: { className?: string }) => <Building2 className={className} />;
export const IconMenu = ({ className }: { className?: string }) => <Menu className={className} />;
export const IconX = ({ className }: { className?: string }) => <X className={className} />;
export const IconArrowRight = ({ className }: { className?: string }) => <ArrowRight className={className} />;
export const IconLinkedin = ({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) => <Linkedin className={className} {...props} />;
export const IconHeart = ({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) => <Heart className={className} {...props} />;
export const IconLinkedinSvg = ({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);
export const IconHeartSvg = ({ className, ...props }: { className?: string } & React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);
