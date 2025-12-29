import { useState, useEffect } from 'react';
import {
    CheckCircle,
    ArrowRight,
    Building2,
    Briefcase,
    Globe,
    AlertCircle,
    Mail,
    Lock,
    Shield,
    Home,
    Key,
    GraduationCap,
    Truck,
    FileText,
    Users
} from 'lucide-react';

interface RFPFormProps {
    initialData?: {
        company?: string;
        volume?: string;
        where?: string;
    };
    selectedAgencies?: string[];
    onComplete?: () => void;
    lang: 'en' | 'de' | 'fr';
    translations: any;
}

export default function RFPForm({ initialData, selectedAgencies, onComplete, lang, translations: t }: RFPFormProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        companyName: initialData?.company || '',
        hrName: '',
        hrTitle: '',
        hrEmail: '',
        movesPerYear: initialData?.volume || '5-20',
        painPoints: [] as string[],
        destinations: initialData?.where ? [initialData.where.charAt(0).toUpperCase() + initialData.where.slice(1)] : [] as string[],
        specificRequest: '',
        services: [] as string[],
        lang: lang // Pass lang to server
    });

    // Pre-fill from URL params (Secondary fallback)
    useEffect(() => {
        if (initialData) return; // Skip if props already provided

        const params = new URLSearchParams(window.location.search);
        const company = params.get('company');
        const volume = params.get('volume');
        const where = params.get('where');

        if (company || volume || where) {
            setFormData(prev => ({
                ...prev,
                companyName: company || prev.companyName,
                movesPerYear: volume || prev.movesPerYear,
                destinations: where ? [where.charAt(0).toUpperCase() + where.slice(1)] : prev.destinations
            }));
        }
    }, [initialData]);

    // Options
    const MOVES_OPTIONS = ['1-5', '5-20', '20-50', '50+'];

    // Services Config
    const SERVICES = [
        { id: 'full_service', label: 'Full Service Relocation', icon: Globe }, // New
        { id: 'home_search', label: 'Home Search', icon: Home },
        { id: 'visa', label: 'Visa & Immigration', icon: Key },
        { id: 'school', label: 'School Search', icon: GraduationCap },
        { id: 'settling', label: 'Settling-In', icon: FileText },
        { id: 'moving', label: 'Moving Logistics', icon: Truck },
    ];

    const PAIN_POINTS = [
        'Costs too high',
        'Service inconsistency',
        'Low housing success rate',
        'Visa application delays',
        'Admin burden on HR',
        'Lack of transparency'
    ];
    const DESTINATIONS = ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Zug', 'Other'];

    const validateEmail = (email: string) => {
        // Basic block for free domains
        const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
        const domain = email.split('@')[1];
        if (freeDomains.includes(domain)) {
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.companyName || !formData.hrName || !formData.hrEmail) return;
            if (!validateEmail(formData.hrEmail)) {
                setErrorMsg("Please use a corporate email address (no Gmail/Hotmail).");
                return;
            }
            setErrorMsg(null);
            setStep(2);
        }
    };

    const handleToggle = (list: string[], item: string, field: 'painPoints' | 'destinations' | 'services') => {
        const newList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            const res = await fetch('/api/corporate/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');
            setStep(3);
        } catch (err: any) {
            setErrorMsg(err.message || "An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 1: Company Profile
    const renderStep1 = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
                {t.title}
            </h2>

            {errorMsg && (
                <div className="bg-[#FF6F61]/5 text-[#FF6F61] p-3 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.company}</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#FF6F61] outline-none"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.hrName}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#FF6F61] outline-none"
                        value={formData.hrName}
                        onChange={e => setFormData({ ...formData, hrName: e.target.value })}
                        placeholder="Your Name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.hrTitle}</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#FF6F61] outline-none"
                        value={formData.hrTitle}
                        onChange={e => setFormData({ ...formData, hrTitle: e.target.value })}
                        placeholder="e.g. HR Manager"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">{t.email}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#FF6F61] outline-none"
                            value={formData.hrEmail}
                            onChange={e => setFormData({ ...formData, hrEmail: e.target.value })}
                            placeholder="name@company.com"
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{t.emailHint}</p>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t.moves}</label>
                    <div className="flex flex-wrap gap-2">
                        {MOVES_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => setFormData({ ...formData, movesPerYear: opt })}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${formData.movesPerYear === opt
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#FF6F61] text-white font-bold rounded-lg hover:bg-[#e85a4d] transition-colors flex items-center gap-2"
                >
                    {t.next} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    // Step 2: Scope
    const renderStep2 = () => (
        <div className="space-y-6 animate-slideUp">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
                {t.step2Title}
            </h2>

            {/* Services Section */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">{t.assist}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICES.map(svc => (
                        <button
                            key={svc.id}
                            onClick={() => handleToggle(formData.services, svc.label, 'services')}
                            className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 text-center transition-all ${formData.services.includes(svc.label)
                                ? 'bg-[#FF6F61]/5 border-[#FF6F61] text-[#FF6F61]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            <svc.icon className={`w-6 h-6 ${formData.services.includes(svc.label) ? 'text-[#FF6F61]' : 'text-slate-400'}`} />
                            {svc.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">{t.painPoints}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PAIN_POINTS.map(point => (
                        <button
                            key={point}
                            onClick={() => handleToggle(formData.painPoints, point, 'painPoints')}
                            className={`p-3 text-left rounded-lg text-sm border flex items-center justify-between transition-all ${formData.painPoints.includes(point)
                                ? 'bg-[#FF6F61]/5 border-red-200 text-[#FF6F61]'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            {point}
                            {formData.painPoints.includes(point) && <CheckCircle className="w-4 h-4 text-[#FF6F61]" />}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">{t.destinations}</label>
                <div className="flex flex-wrap gap-2">
                    {DESTINATIONS.map(city => (
                        <button
                            key={city}
                            onClick={() => handleToggle(formData.destinations, city, 'destinations')}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${formData.destinations.includes(city)
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t.specific}</label>
                <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#FF6F61] outline-none"
                    placeholder={t.specificPlaceholder}
                    value={formData.specificRequest}
                    onChange={e => setFormData({ ...formData, specificRequest: e.target.value })}
                />
            </div>

            {errorMsg && (
                <div className="bg-[#FF6F61]/5 text-[#FF6F61] p-3 rounded-lg flex items-center gap-2 text-sm justify-center">
                    <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
            )}

            <div className="pt-4 flex items-center justify-between">
                <button
                    onClick={() => setStep(1)}
                    className="text-slate-500 hover:text-slate-800 font-medium px-4"
                >
                    {t.back}
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#FF6F61] text-white font-bold rounded-lg hover:bg-[#e85a4d] transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2 disabled:opacity-70"
                >
                    {isSubmitting ? t.submitting : t.submit}
                </button>
            </div>
        </div>
    );

    // Step 3: Success
    const renderSuccess = () => (
        <div className="text-center py-12 animate-fadeIn bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.success.title}</h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.success.desc.replace('{email}', formData.hrEmail) }}>
            </p>

            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 flex items-center gap-3 text-left">
                <Lock className="w-8 h-8 text-slate-400 flex-shrink-0" />
                <p>{t.success.discrete}</p>
            </div>

            <div className="mt-8">
                {onComplete ? (
                    <button onClick={onComplete} className="text-[#FF6F61] font-bold hover:underline">
                        {t.success.close}
                    </button>
                ) : (
                    <a href="/" className="text-[#FF6F61] font-bold hover:underline">{t.success.return}</a>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar (Only step 1 & 2) */}
            {step < 3 && (
                <div className="mb-8 flex items-center gap-2">
                    <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#FF6F61]' : 'bg-slate-100'}`} />
                    <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#FF6F61]' : 'bg-slate-100'}`} />
                </div>
            )}

            {/* Main Form Box */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                {/* Header with Title and Selected Agents Badge */}
                <div className="px-6 md:px-8 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.header.title}</h2>
                        <p className="text-slate-500 text-sm">{t.header.subtitle}</p>
                    </div>
                    {selectedAgencies && selectedAgencies.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6F61]/10 border border-[#FF6F61]/20 rounded-lg shrink-0">
                            <Users className="w-4 h-4 text-[#FF6F61]" />
                            <span className="text-[11px] font-black text-[#FF6F61] uppercase tracking-wider">
                                {selectedAgencies.length} {t.header.selected}
                            </span>
                        </div>
                    )}
                </div>

                {/* Privacy Banner */}
                <div className="bg-slate-50 border-b border-slate-100 py-3 px-4 flex items-center justify-center gap-2 text-[#FF6F61] text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    {t.privacy}
                </div>

                <div className="p-6 md:p-8">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderSuccess()}
                </div>
            </div>
        </div>
    );
}
