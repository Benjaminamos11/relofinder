import { Building2, Lock, Menu, X, ArrowRight } from 'lucide-react';
import React from 'react';

export const IconLock = ({ className }: { className?: string }) => <Lock className={className} />;
export const IconBuilding = ({ className }: { className?: string }) => <Building2 className={className} />;
export const IconMenu = ({ className }: { className?: string }) => <Menu className={className} />;
export const IconX = ({ className }: { className?: string }) => <X className={className} />;
export const IconArrowRight = ({ className }: { className?: string }) => <ArrowRight className={className} />;
