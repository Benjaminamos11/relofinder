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
    School,
    Wallet,
    Clock,
    Heart,
    Truck,
    Package,
    Plane,
    Coins,
    Gem,
    Calculator
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDestination: string;
    selectedService: string;
}

// Logic Paths:
// Housing Search: 1 (Household) -> 2 (Area) -> 3 (Budget) -> 4 (Funding) -> 5 (Fee) -> 6 (Illusion) -> 7 (Lead)
// Visa: 1 -> 2 (Citizenship) -> 3 (Purpose) -> 4 (Employment) -> 5 (Funding) -> 6 (Fee) -> 7 -> 8
// School: 1 -> 2 (Ages) -> 3 (System) -> 4 (Funding) -> 5 (Fee) -> 6 -> 7
// VIP: 1 -> 2 (Priority) -> 3 (Temp Housing) -> 4 (VIP Budget) -> 5 (Funding) -> 6 (Fee) -> 7 -> 8
// Moving: 1 -> 2 (Volume) -> 3 (Origin) -> 4 (Funding) -> 5 (Fee) -> 6 -> 7

type StepType =
    | 'household'
    | 'area'
    | 'budget'
    | 'citizenship'
    | 'purpose'
    | 'employment'
    | 'ages'
    | 'system'
    | 'priority'
    | 'temp_housing'
    | 'vip_budget'
    | 'volume'
    | 'origin'
    | 'funding'
    | 'fee'
    | 'illusion'
    | 'lead';

interface AssessmentData {
    householdType: string;
    complexity: 'normal' | 'high';
    area?: string;
    budget?: string;
    citizenship?: string;
    purpose?: string;
    employmentStatus?: string;
    ages?: string;
    educationSystem?: string;
    vipPriority?: string;
    needsTempHousing?: boolean;
    vipBudgetQualified?: boolean;
    volume?: string;
    origin?: string;
    funding: string;
    feePreference: string;
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
        feePreference: '',
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
        switch (selectedService.toLowerCase()) {
            case 'housing-search':
            case 'housing':
                if (current === 'household') navigateTo('area');
                else if (current === 'area') navigateTo('budget');
                else if (current === 'budget') navigateTo('funding');
                else if (current === 'funding') navigateTo('fee');
                else if (current === 'fee') navigateTo('illusion');
                break;

            case 'visa-immigration':
            case 'immigration':
                if (current === 'household') navigateTo('citizenship');
                else if (current === 'citizenship') navigateTo('purpose');
                else if (current === 'purpose') navigateTo('employment');
                else if (current === 'employment') navigateTo('funding');
                else if (current === 'funding') navigateTo('fee');
                else if (current === 'fee') navigateTo('illusion');
                break;

            case 'education':
            case 'school-search':
                if (current === 'household') navigateTo('ages');
                else if (current === 'ages') navigateTo('system');
                else if (current === 'system') navigateTo('funding');
                else if (current === 'funding') navigateTo('fee');
                else if (current === 'fee') navigateTo('illusion');
                break;

            case 'full-package':
            case 'vip-package':
            case 'settling-in':
                if (current === 'household') navigateTo('priority');
                else if (current === 'priority') navigateTo('temp_housing');
                else if (current === 'temp_housing') navigateTo('vip_budget');
                else if (current === 'vip_budget') navigateTo('funding');
                else if (current === 'funding') navigateTo('fee');
                else if (current === 'fee') navigateTo('illusion');
                break;

            case 'moving-logistics':
            case 'moving':
                if (current === 'household') navigateTo('volume');
                else if (current === 'volume') navigateTo('origin');
                else if (current === 'origin') navigateTo('funding');
                else if (current === 'funding') navigateTo('fee');
                else if (current === 'fee') navigateTo('illusion');
                break;

            default:
                // Fallback/Generic
                if (current === 'household') navigateTo('funding');
                else if (current === 'funding') navigateTo('fee');
                else if (current === 'fee') navigateTo('illusion');
                break;
        }
    };

    const handleStepCompletion = (updatedData: Partial<AssessmentData>) => {
        setData(prev => ({ ...prev, ...updatedData }));
        handleNextLogic(currentStep);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('leads').insert([
                {
                    name: `${data.firstName} ${data.lastName}`,
                    email: data.email,
                    phone: data.phone,
                    service_interest: selectedService,
                    region_interest: selectedDestination,
                    household_type: data.householdType,
                    funding_type: data.funding,
                    fee_preference: data.feePreference,
                    citizenship_status: data.citizenship,
                    company_name: data.companyName,
                    budget_range: data.budget,
                    metadata: {
                        ...data,
                        complexity: data.complexity,
                        source: 'concierge_assessment'
                    },
                    status: 'initial_submitted'
                }
            ]);

            if (error) throw error;
            setSubmissionComplete(true);
        } catch (error) {
            console.error('Error submitting lead:', error);
            alert('There was an error submitting your request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Progress logic (estimated based on path length)
    const getProgress = () => {
        if (currentStep === 'illusion') return 90;
        if (currentStep === 'lead') return 100;
        const historyLen = history.length;
        return (historyLen / 7) * 100; // Average path length is ~7 steps
    };

    const progressWidth = `${getProgress()}%`;

    const getResultHeadline = () => {
        switch (selectedService.toLowerCase()) {
            case 'housing-search':
            case 'housing':
                return `We found 2 Housing Specialists in ${data.area || selectedDestination}...`;
            case 'visa-immigration':
            case 'immigration':
                return `We found a Legal Immigration Expert for ${data.citizenship || 'your'} cases...`;
            case 'education':
            case 'school-search':
                return `We found an Education Consultant specializing in ${data.educationSystem || 'Swiss'} systems...`;
            case 'full-package':
            case 'settling-in':
                return `VIP Selection Verified. Dedicated Relocation Concierge ready.`;
            case 'moving-logistics':
            case 'moving':
                return `Logistics Route Optimized. 3 Partners identified for ${data.volume || 'your'} move.`;
            default:
                return 'Expert Match Found. Personal Intro Verified.';
        }
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

            <div className="w-full flex-1 overflow-y-auto px-6 py-24 flex items-center justify-center">
                <div className="w-full max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        {currentStep === 'household' && (
                            <motion.div key="household" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Who is relocating with you to {selectedDestination}?</h2>
                                    <p className="text-slate-400 text-lg md:text-xl">Help us understand the scale of your move.</p>
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

                        {currentStep === 'area' && (
                            <motion.div key="area" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Which area in {selectedDestination} <br /> do you prefer?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'city', label: 'City Center', icon: Building2 },
                                        { id: 'lake', label: 'Lake Side', icon: Waves },
                                        { id: 'suburban', label: 'Green / Suburban', icon: TreePine },
                                        { id: 'schools', label: 'Close to International Schools', icon: GraduationCap }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ area: option.label })}
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

                        {currentStep === 'budget' && (
                            <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">What is your max <br /> monthly rental budget?</h2>
                                </div>
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {["CHF 2'000 – 3'500", "CHF 3'500 – 5'500", "CHF 5'500 – 8'000", "CHF 8'000+"].map((label) => (
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

                        {currentStep === 'citizenship' && (
                            <motion.div key="citizenship" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">What is your current<br />citizenship status?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'eu', label: "EU / EFTA Citizen", icon: Globe },
                                        { id: 'non-eu', label: "Non-EU / Third Country", icon: Globe, complexity: 'high' }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ citizenship: option.label, complexity: (option.complexity as any) || data.complexity })}
                                            className="flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer"
                                        >
                                            <Globe className="w-8 h-8 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl md:text-2xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'purpose' && (
                            <motion.div key="purpose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Purpose of Stay?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'emp', label: 'Local Employment', icon: Briefcase },
                                        { id: 'sec', label: 'Secondment / Transfer', icon: Plane },
                                        { id: 'inv', label: 'Investment / Tax Deal', icon: Wallet },
                                        { id: 'ret', label: 'Retirement', icon: Heart }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ purpose: option.label })}
                                            className="flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer"
                                        >
                                            <option.icon className="w-8 h-8 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl md:text-2xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'employment' && (
                            <motion.div key="employment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Employment Status?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'signed', label: 'Contract Signed', icon: Check },
                                        { id: 'seeker', label: 'Currently Job Seeking', icon: Briefcase }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ employmentStatus: option.label })}
                                            className="flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer"
                                        >
                                            <option.icon className="w-8 h-8 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl md:text-2xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'ages' && (
                            <motion.div key="ages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Ages of Children?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['0-4 years (Early)', '5-11 years (Primary)', '12+ years (Secondary)'].map((label) => (
                                        <button key={label} onClick={() => handleStepCompletion({ ages: label })}
                                            className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <Users className="w-10 h-10 text-slate-200 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-lg">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'system' && (
                            <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Preferred System?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'intl', label: 'International (IB/UK/US)', icon: Globe },
                                        { id: 'swiss', label: 'Local Swiss (Public)', icon: MapPin },
                                        { id: 'bil', label: 'Bilingual Private', icon: Home }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ educationSystem: option.label })}
                                            className="flex flex-col items-center gap-4 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-10 h-10 text-slate-200 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-lg">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'priority' && (
                            <motion.div key="priority" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">What is your main priority?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'speed', label: 'Speed / Urgency', icon: Clock },
                                        { id: 'comfort', label: 'Zero Admin / Comfort', icon: Gem },
                                        { id: 'budget', label: 'Budget Control', icon: Wallet }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ vipPriority: option.label })}
                                            className="flex flex-col items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
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
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Do you need temporary <br /> housing on arrival?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                                    <button onClick={() => handleStepCompletion({ needsTempHousing: true })} className="p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all font-bold text-2xl cursor-pointer">Yes</button>
                                    <button onClick={() => handleStepCompletion({ needsTempHousing: false })} className="p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all font-bold text-2xl cursor-pointer">No</button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'vip_budget' && (
                            <motion.div key="vip_budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Are you looking for a <br /> premium service experience?</h2>
                                    <p className="text-slate-400">Premium packages typically start at 5k+ CHF for full relocation support.</p>
                                </div>
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    <button onClick={() => handleStepCompletion({ vipBudgetQualified: true })} className="w-full flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer">
                                        <Gem className="w-8 h-8 text-[#FF5A5F]" />
                                        <div className="text-left">
                                            <div className="font-bold text-2xl">Premium / Executive</div>
                                            <div className="text-slate-400">Total comfort, white-glove support</div>
                                        </div>
                                    </button>
                                    <button onClick={() => handleStepCompletion({ vipBudgetQualified: false })} className="w-full flex items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer">
                                        <Calculator className="w-8 h-8 text-slate-300" />
                                        <div className="text-left">
                                            <div className="font-bold text-2xl">Standard / Budget Conscious</div>
                                            <div className="text-slate-400">Essential support only</div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'volume' && (
                            <motion.div key="volume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Volume of Goods?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'boxes', label: 'Small (Just Boxes)', icon: Package },
                                        { id: 'apt', label: 'Medium (Apartment)', icon: Home },
                                        { id: 'villa', label: 'Large (House / Villa)', icon: Building2 }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ volume: option.label })}
                                            className="flex flex-col items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-12 h-12 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'origin' && (
                            <motion.div key="origin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">Moving from?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'ch', label: 'Within Switzerland', icon: MapPin },
                                        { id: 'eu', label: 'From EU / EFTA', icon: Truck },
                                        { id: 'overseas', label: 'Overseas / Customs', icon: Plane }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ origin: option.label })}
                                            className="flex flex-col items-center gap-6 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group cursor-pointer text-center"
                                        >
                                            <option.icon className="w-12 h-12 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            <span className="font-bold text-xl">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'funding' && (
                            <motion.div key="funding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight text-balance">Is this relocation sponsored <br className="hidden md:block" /> by your employer?</h2>
                                </div>
                                <div className="space-y-4 max-w-2xl mx-auto">
                                    {[
                                        { id: 'corporate_sponsored', label: "Yes, Full Corporate Sponsorship", sub: "Direct billing to company", icon: Building2 },
                                        { id: 'lump_sum', label: "Lump Sum Allowance", sub: "I manage, company reimburses", icon: Wallet },
                                        { id: 'self_funded', label: "No, Self-Funded", sub: "Private relocation budget", icon: User }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ funding: option.id })}
                                            className="w-full flex items-center justify-between p-8 bg-white border-2 border-slate-100 rounded-2xl md:rounded-3xl hover:border-[#FF5A5F] hover:shadow-[0_20px_40px_-15px_rgba(255,111,97,0.1)] transition-all group cursor-pointer"
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

                        {currentStep === 'fee' && (
                            <motion.div key="fee" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight text-balance">How would you prefer <br className="hidden md:block" /> to engage with the expert?</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { id: 'fixed_package', icon: ShieldCheck, label: "Fixed Package", sub: "Peace of Mind", details: "Guaranteed service, dedicated search, & premium support." },
                                        { id: 'success_fee', icon: Handshake, label: "Success-Fee", sub: "Performance", details: "Lower starting fee. Commission only upon signing a lease." },
                                        { id: 'hourly', icon: Lightbulb, label: "Hourly Rate", sub: "Consultation", details: "I just need support with specific contracts or viewings." }
                                    ].map((option) => (
                                        <button key={option.id} onClick={() => handleStepCompletion({ feePreference: option.id })}
                                            className="text-left p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-[#FF5A5F] transition-all group h-full flex flex-col cursor-pointer"
                                        >
                                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-[#FF5A5F]/10 w-fit mb-6 transition-colors">
                                                <option.icon className="w-8 h-8 text-slate-400 group-hover:text-[#FF5A5F]" />
                                            </div>
                                            <div className="mb-4">
                                                <div className="font-bold text-xl text-slate-800">{option.label}</div>
                                                <div className="text-[#FF5A5F] text-xs font-bold uppercase tracking-widest mt-1">{option.sub}</div>
                                            </div>
                                            <p className="text-slate-500 text-sm leading-relaxed mt-auto">{option.details}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'illusion' && (
                            <motion.div key="illusion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16 py-12 text-center">
                                <div className="space-y-8">
                                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter">Identifying your match...</h2>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-xl mx-auto">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 4, ease: "easeInOut" }} onAnimationComplete={() => navigateTo('lead')} className="h-full bg-[#FF5A5F]" />
                                    </div>
                                    <div className="h-10 md:h-12 overflow-hidden flex items-center justify-center">
                                        <motion.div animate={{ y: [0, -40, -80, -120] }} transition={{ duration: 4, times: [0, 0.33, 0.66, 1], ease: "linear" }} className="text-slate-400 font-medium text-lg md:text-2xl">
                                            <div className="h-10 md:h-12 flex items-center justify-center">Analyzing market availability in {selectedDestination}...</div>
                                            <div className="h-10 md:h-12 flex items-center justify-center">Filtering specialists for {data.householdType} segments...</div>
                                            <div className="h-10 md:h-12 flex items-center justify-center">Verifying availability for {selectedService.replace('-', ' ')}...</div>
                                            <div className="h-10 md:h-12 flex items-center justify-center font-bold text-[#FF5A5F]">Expert Match Found.</div>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 'lead' && (
                            <motion.div key="lead" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl mx-auto space-y-12">
                                {!submissionComplete ? (
                                    <>
                                        <div className="text-center space-y-6">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-2 mx-auto">
                                                <Check className="w-3.5 h-3.5" /> Selection Verified
                                            </div>
                                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">{getResultHeadline()}</h2>
                                            <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto">Receive your personal introduction & service quote. 100% Confidential.</p>
                                        </div>
                                        <form onSubmit={handleSubmit} className="space-y-6 bg-white md:p-10 md:rounded-[2.5rem] md:border md:border-slate-100 md:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">First Name</label>
                                                    <input required type="text" placeholder="John" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg" value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Last Name</label>
                                                    <input required type="text" placeholder="Doe" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg" value={data.lastName} onChange={(e) => setData({ ...data, lastName: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Email</label>
                                                <input required type="email" placeholder="john@company.com" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Phone</label>
                                                <input required type="tel" placeholder="+41 79 ..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                                            </div>
                                            {data.funding === 'corporate_sponsored' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text_slate-300 uppercase tracking-widest ml-1">Company</label>
                                                    <input type="text" placeholder="Employer Name" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-lg" value={data.companyName} onChange={(e) => setData({ ...data, companyName: e.target.value })} />
                                                </div>
                                            )}
                                            <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-[#FF5A5F] hover:bg-[#ff454a] text-white font-black rounded-3xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 cursor-pointer text-xl tracking-wide uppercase">
                                                {isSubmitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <>REQUEST INTRODUCTION <ChevronRight className="w-6 h-6" /></>}
                                            </button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center space-y-10 py-12 max-w-md mx-auto">
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-32 h-32 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-16 h-16" /></motion.div>
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
