import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Users,
    Baby,
    Dog,
    Check,
    ChevronRight,
    ArrowLeft,
    ShieldCheck,
    Handshake,
    Lightbulb,
    Loader2,
    Building2,
    Briefcase,
    GraduationCap,
    Globe,
    MapPin,
    Home,
    Waves,
    TreePine,
    Wallet,
    Clock,
    Heart,
    Truck,
    Package,
    Plane,
    Coins,
    Gem,
    Calculator,
    Search,
    Star,
    Zap,
    Coffee
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDestination: string;
    selectedService: string;
}

type StepType =
    | 'household'
    | 'area'
    | 'budget'
    | 'engagement'
    | 'citizenship'
    | 'purpose'
    | 'employment'
    | 'ages'
    | 'system'
    | 'priority'
    | 'temp_housing'
    | 'vip_budget'
    | 'funding'
    | 'illusion'
    | 'lead';

interface AssessmentData {
    householdType: string;
    complexity: 'normal' | 'high';
    area?: string;
    budget?: string;
    engagementModel?: string;
    citizenship?: string;
    purpose?: string;
    employmentStatus?: string;
    ages?: string;
    educationSystem?: string;
    vipPriority?: string;
    needsTempHousing?: string;
    vipBudgetCategory?: string;
    funding: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName?: string;
}

export default function AssessmentModal({ isOpen, onClose, selectedDestination, selectedService }: AssessmentModalProps) {
    const [currentStep, setCurrentStep] = useState<StepType>('household');
    const [history, setHistory] = useState<StepType[]>([]);
    const [data, setData] = useState<AssessmentData>({
        householdType: '',
        complexity: 'normal',
        funding: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionComplete, setSubmissionComplete] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentStep('household');
            setHistory([]);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const navigateTo = (nextStep: StepType) => {
        setHistory(prev => [...prev, currentStep]);
        setCurrentStep(nextStep);
    };

    const handleBack = () => {
        if (history.length > 0) {
            const prev = history[history.length - 1];
            setHistory(prevHistory => prevHistory.slice(0, -1));
            setCurrentStep(prev);
        }
    };

    const handleNextLogic = (current: StepType) => {
        const service = selectedService.toLowerCase();

        // BRANCH 1: Housing Search
        if (service.includes('housing')) {
            if (current === 'household') return navigateTo('area');
            if (current === 'area') return navigateTo('budget');
            if (current === 'budget') return navigateTo('engagement');
            if (current === 'engagement') return navigateTo('funding');
        }

        // BRANCH 2: Visa & Immigration
        if (service.includes('visa') || service.includes('immigration')) {
            if (current === 'household') return navigateTo('citizenship');
            if (current === 'citizenship') return navigateTo('purpose');
            if (current === 'purpose') return navigateTo('employment');
            if (current === 'employment') return navigateTo('funding');
        }

        // BRANCH 3: Full Package (VIP)
        if (service.includes('full') || service.includes('vip') || service.includes('settling')) {
            if (current === 'household') return navigateTo('priority');
            if (current === 'priority') return navigateTo('temp_housing');
            if (current === 'temp_housing') return navigateTo('vip_budget');
            if (current === 'vip_budget') return navigateTo('funding');
        }

        // BRANCH 4: School Search
        if (service.includes('school') || service.includes('education')) {
            if (current === 'household') return navigateTo('ages');
            if (current === 'ages') return navigateTo('system');
            if (current === 'system') return navigateTo('funding');
        }

        // FINAL GLOBAL STEPS
        if (current === 'funding') return navigateTo('illusion');

        // Fallback for unknown services
        if (current === 'household') return navigateTo('funding');
    };

    const handleStepCompletion = (updatedData: Partial<AssessmentData>) => {
        setData(prev => ({ ...prev, ...updatedData }));
        handleNextLogic(currentStep);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/leads/assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedService,
                    selectedDestination,
                    data
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit request');
            }

            setSubmissionComplete(true);
        } catch (error: any) {
            console.error('Error submitting lead:', error);
            alert(error.message || 'There was an error submitting your request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const getProgress = () => {
        if (currentStep === 'illusion') return 90;
        if (currentStep === 'lead') return 100;
        // Map current step to a sequence for better visual progress
        const steps: StepType[] = ['household', 'area', 'budget', 'engagement', 'citizenship', 'purpose', 'employment', 'ages', 'system', 'priority', 'temp_housing', 'vip_budget', 'funding'];
        const idx = steps.indexOf(currentStep);
        return ((idx + 1) / (steps.length)) * 100;
    };

    const progressWidth = `${getProgress()}%`;

    const getResultHeadline = () => {
        const s = selectedService.toLowerCase();
        if (s.includes('full') || s.includes('vip')) return 'We have identified a Premium Relocation Partner.';
        if (s.includes('housing')) return `We found a Housing Specialist for ${selectedDestination}.`;
        if (s.includes('visa') || s.includes('immigration')) return 'We found an Immigration Expert for your permit type.';
        return 'Expert Identification Verified.';
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden">
            <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-[10000]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: progressWidth }}
                    className="h-full bg-[#FF5A5F] transition-all duration-500 ease-out"
                />
            </div>

            <div className="fixed top-0 left-0 right-0 p-6 md:px-12 flex justify-between items-center z-[10000]">
                <div className="flex items-center">
                    <span className="font-serif text-2xl md:text-3xl font-bold text-[#FF5A5F] tracking-tight">relofinder.ch</span>
                </div>

                <div className="flex items-center gap-4">
                    {history.length > 0 && currentStep !== 'illusion' && currentStep !== 'lead' && !submissionComplete && (
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-1 px-4 py-2 text-slate-400 hover:text-slate-900 transition-colors font-medium text-sm md:text-base cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-full transition-colors group cursor-pointer"
                    >
                        <X className="w-8 h-8 text-slate-300 group-hover:text-slate-900" />
                    </button>
                </div>
            </div>

            <div className="w-full flex-1 overflow-y-auto px-6 py-32 md:py-24 flex items-start md:items-center justify-center">
                <div className="w-full max-w-4xl mx-auto mt-8 md:mt-0">
                    <AnimatePresence mode="wait">

                        {/* STEP: Household (All) */}
                        {currentStep === 'household' && (
                            <motion.div key="household" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Who is relocating with you to {selectedDestination}?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'solo', label: 'Just me', icon: User },
                                        { id: 'couple', label: 'Couple', icon: Users },
                                        { id: 'family', label: 'Family with Children', icon: Baby },
                                        { id: 'pets', label: 'Moving with Pets', icon: Dog, complexity: 'high' }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ householdType: option.id, complexity: option.complexity as any || 'normal' })}
                                            className="flex items-center gap-6 p-6 md:p-8 bg-white border-2 border-slate-100 rounded-2xl md:rounded-3xl hover:border-[#FF5A5F] hover:shadow-[0_20px_40px_-15px_rgba(255,111,97,0.1)] transition-all group min-h-[80px] cursor-pointer"
                                        >
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#FF5A5F]/10 transition-colors">
                                                <option.icon className="w-6 h-6 md:w-8 md:h-8 text-slate-400 group-hover:text-[#FF5A5F] transition-colors" />
                                            </div>
                                            <span className="font-bold text-slate-800 text-xl md:text-2xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* BRANCH 1: HOUSING SEARCH */}
                        {currentStep === 'area' && (
                            <motion.div key="area" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Which area in {selectedDestination} do you prefer?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: 'City Center', icon: Building2 },
                                        { label: 'Lake Side', icon: Waves },
                                        { label: 'Green/Suburban', icon: TreePine },
                                        { label: 'Close to International Schools', icon: GraduationCap },
                                        { label: 'No Preference', icon: Search }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ area: option.label })}
                                            className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-10 h-10 text-slate-300 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-lg text-slate-800">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'budget' && (
                            <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">What is your maximum<br />monthly rental budget?</h2>
                                </div>
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {["< CHF 2'500", "CHF 2'500 – 4'000", "CHF 4'000 – 6'000", "CHF 6'000+ (Luxury)"].map((label) => (
                                        <button key={label} onClick={() => handleStepCompletion({ budget: label })}
                                            className="w-full flex items-center justify-between p-8 bg-white border-2 border-slate-100 rounded-2xl md:rounded-3xl hover:border-[#FF5A5F] hover:shadow-[0_20px_40px_-15px_rgba(255,111,97,0.1)] transition-all group cursor-pointer"
                                        >
                                            <span className="font-bold text-xl md:text-3xl text-slate-800">{label}</span>
                                            <ChevronRight className="w-8 h-8 text-slate-200 group-hover:text-[#FF5A5F] group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'engagement' && (
                            <motion.div key="engagement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Preferred Engagement Model?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                    {[
                                        { id: 'fixed', label: 'Fixed Package', icon: ShieldCheck, sub: 'Guaranteed search & support' },
                                        { id: 'success', label: 'Success Fee', icon: Handshake, sub: 'Pay commission upon signing' }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ engagementModel: option.label })}
                                            className="flex flex-col items-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-16 h-16 text-slate-200 group-hover:text-[#FF5A5F]" />
                                            <div>
                                                <div className="font-bold text-2xl mb-2">{option.label}</div>
                                                <div className="text-slate-400 font-medium">{option.sub}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* BRANCH 2: VISA & IMMIGRATION */}
                        {currentStep === 'citizenship' && (
                            <motion.div key="citizenship" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">What is your current<br />citizenship status?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: "EU/EFTA Citizen", icon: Globe },
                                        { label: "UK/USA/Canada", icon: Globe },
                                        { label: "Third Country (Non-EU)", icon: Globe, complexity: 'high' }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ citizenship: option.label, complexity: (option.complexity as any) || data.complexity })}
                                            className="flex flex-col items-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-12 h-12 text-slate-300 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'purpose' && (
                            <motion.div key="purpose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">What is the purpose of your stay?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: 'Employment (Local Contract)', icon: Briefcase },
                                        { label: 'Posted Worker', icon: Truck },
                                        { label: 'Lump Sum Tax / Investment', icon: Wallet },
                                        { label: 'Retirement', icon: Heart }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ purpose: option.label })}
                                            className="flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer"
                                        >
                                            <option.icon className="w-8 h-8 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'employment' && (
                            <motion.div key="employment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Current Employment Status?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Contract Signed', icon: Check },
                                        { label: 'Job Seeker', icon: Search },
                                        { label: 'Self-Employed', icon: User }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ employmentStatus: option.label })}
                                            className="flex flex-col items-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-12 h-12 text-slate-200 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* BRANCH 3: FULL PACKAGE (VIP) */}
                        {currentStep === 'priority' && (
                            <motion.div key="priority" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">What is your main priority for this move?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Speed (Urgent)', icon: Zap },
                                        { label: 'Zero Admin (Comfort)', icon: Gem },
                                        { label: 'Value (Budget-focused)', icon: Calculator }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ vipPriority: option.label })}
                                            className="flex flex-col items-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-12 h-12 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'temp_housing' && (
                            <motion.div key="temp_housing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Do you need temporary <br /> housing upon arrival?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                    {[
                                        { label: 'Yes (Serviced Apt)', icon: Building2 },
                                        { label: 'No (Hotel/Private)', icon: Home },
                                        { label: 'Not sure', icon: Search }
                                    ].map((opt) => (
                                        <button key={opt.label} onClick={() => handleStepCompletion({ needsTempHousing: opt.label })} className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all font-bold text-xl cursor-pointer">
                                            <opt.icon className="w-8 h-8 text-slate-300" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'vip_budget' && (
                            <motion.div key="vip_budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Estimated budget for professional agency support?</h2>
                                    <p className="text-slate-400 font-medium">Helping us identify the right level of service for you.</p>
                                </div>
                                <div className="space-y-4 max-w-3xl mx-auto">
                                    {[
                                        { label: "Essential Support (< CHF 3'000)", sub: "Basic coordination & finding", icon: Coffee },
                                        { label: "Standard Full Service (CHF 3'000 – 6'000)", sub: "Complete home search & admin", icon: Star },
                                        { label: "Premium / VIP Concierge (CHF 6'000+)", sub: "Hands-off, white-glove service", icon: Gem }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ vipBudgetCategory: option.label })}
                                            className="w-full flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer"
                                        >
                                            <option.icon className="w-10 h-10 text-slate-200 group-hover:text-[#FF5A5F]" />
                                            <div className="text-left">
                                                <div className="font-bold text-xl md:text-2xl text-slate-800">{option.label}</div>
                                                <div className="text-slate-400 font-medium mt-1">{option.sub}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* BRANCH 4: SCHOOL SEARCH */}
                        {currentStep === 'ages' && (
                            <motion.div key="ages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">What are the ages of the children?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: '0-4 (Nursery)', icon: Baby },
                                        { label: '5-11 (Primary)', icon: Users },
                                        { label: '12+ (Secondary)', icon: GraduationCap }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ ages: option.label })}
                                            className="flex flex-col items-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-12 h-12 text-slate-200 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'system' && (
                            <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Preferred Education System?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { label: 'International (IB/US/UK)', icon: Globe },
                                        { label: 'Local Swiss System', icon: MapPin },
                                        { label: 'Bilingual', icon: Home }
                                    ].map((option) => (
                                        <button key={option.label} onClick={() => handleStepCompletion({ educationSystem: option.label })}
                                            className="flex flex-col items-center gap-6 p-10 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-12 h-12 text-slate-200 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP: FUNDING (Final Logic Check) */}
                        {currentStep === 'funding' && (
                            <motion.div key="funding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Is this relocation sponsored <br className="hidden md:block" /> by your employer?</h2>
                                </div>
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {[
                                        { id: 'corporate_sponsored', label: "Yes, Full Corporate Sponsorship", sub: "Direct billing to company", icon: Building2 },
                                        { id: 'lump_sum', label: "Lump Sum Allowance", sub: "I manage, company reimburses", icon: Wallet },
                                        { id: 'self_funded', label: "No, Self-Funded", sub: "Private relocation budget", icon: User }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ funding: option.id })}
                                            className="w-full flex items-center justify-between p-8 bg-white border-2 border-slate-100 rounded-2xl md:rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-6">
                                                <option.icon className="w-10 h-10 text-slate-200 group-hover:text-[#FF5A5F]" />
                                                <div className="text-left">
                                                    <div className="font-bold text-xl md:text-2xl text-slate-800">{option.label}</div>
                                                    <div className="text-slate-400 font-medium text-sm md:text-base mt-1">{option.sub}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-8 h-8 text-slate-200 group-hover:text-[#FF5A5F] group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP: LABOR ILLUSION */}
                        {currentStep === 'illusion' && (
                            <motion.div key="illusion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16 py-12 text-center">
                                <div className="space-y-8">
                                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter">Analyzing your move profile...</h2>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xl mx-auto">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, ease: "easeInOut" }} onAnimationComplete={() => navigateTo('lead')} className="h-full bg-[#FF5A5F]" />
                                    </div>
                                    <div className="h-10 md:h-12 overflow-hidden flex items-center justify-center">
                                        <motion.div animate={{ y: [0, -40, -80] }} transition={{ duration: 3, times: [0, 0.5, 1], ease: "linear" }} className="text-slate-400 font-medium text-lg md:text-2xl">
                                            <div className="h-10 md:h-12 flex items-center justify-center">Filtering {selectedService.replace('-', ' ')} specialists in {selectedDestination}...</div>
                                            <div className="h-10 md:h-12 flex items-center justify-center">Matching your budget profile...</div>
                                            <div className="h-10 md:h-12 flex items-center justify-center font-bold text-[#FF5A5F]">Expert Identified.</div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP: LEAD CAPTURE (Result) */}
                        {currentStep === 'lead' && (
                            <motion.div key="lead" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl mx-auto space-y-12">
                                {!submissionComplete ? (
                                    <>
                                        <div className="text-center space-y-6">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-2 mx-auto">
                                                <Check className="w-3.5 h-3.5" /> Selection Verified
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">{getResultHeadline()}</h2>
                                            <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto">Receive your personal introduction and quote within 24 hours.</p>
                                        </div>
                                        <form onSubmit={handleSubmit} className="space-y-6 bg-white md:p-10 md:rounded-[2.5rem] md:border md:border-slate-100 md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                                    <input required type="text" placeholder="John" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg focus:border-[#FF5A5F] transition-colors" value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                                    <input required type="text" placeholder="Doe" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg focus:border-[#FF5A5F] transition-colors" value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                                <input required type="email" placeholder="john@company.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg focus:border-[#FF5A5F] transition-colors" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                                <input required type="tel" placeholder="+41 ..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg focus:border-[#FF5A5F] transition-colors" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                                            </div>
                                            <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black rounded-3xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 cursor-pointer text-xl tracking-wide uppercase mt-4">
                                                {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <>REQUEST INTRODUCTION <ChevronRight className="w-6 h-6" /></>}
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center space-y-10 py-12 max-w-md mx-auto">
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="w-32 h-32 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-16 h-16" />
                                        </motion.div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-bold text-slate-900">Request Received</h2>
                                            <p className="text-slate-500 text-xl leading-relaxed">Our concierge is reviewing your move details. You will receive a personal introduction via email within 24 hours.</p>
                                        </div>
                                        <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all text-lg cursor-pointer">Return to Homepage</button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
