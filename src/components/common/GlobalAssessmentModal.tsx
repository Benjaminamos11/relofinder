import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isAssessmentOpen, assessmentContext } from '../../stores/modal';
import AssessmentModal from '../individual/AssessmentModal';

export const GlobalAssessmentModal: React.FC = () => {
    const isOpen = useStore(isAssessmentOpen);
    const context = useStore(assessmentContext);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Expose to window for global shims
            // @ts-ignore
            window.relofinderModalStores = window.relofinderModalStores || {};
            // @ts-ignore
            window.relofinderModalStores.setAssessmentContext = (ctx: any) => assessmentContext.set(ctx);
            // @ts-ignore
            window.relofinderModalStores.setAssessmentOpen = (open: boolean) => isAssessmentOpen.set(open);

            // @ts-ignore
            window.openAssessmentModal = (mode: 'full-package' | 'corporate' | 'service', initialCanton?: string, initialService?: string) => {
                assessmentContext.set({
                    mode,
                    initialCanton,
                    initialService
                });
                isAssessmentOpen.set(true);
            };
        }
    }, []);

    if (!isOpen) return null;

    return (
        <AssessmentModal
            isOpen={isOpen}
            onClose={() => isAssessmentOpen.set(false)}
            selectedDestination={context.initialCanton || 'Switzerland'}
            selectedService={context.initialService || (context.mode === 'corporate' ? 'corporate' : 'full-package')}
        />
    );
};

export default GlobalAssessmentModal;
