import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface Agency {
    id: string;
    name: string;
    logo?: string;
}

export default function ComparisonBar() {
    const [selectedAgencies, setSelectedAgencies] = useState<Agency[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    // Load from LocalStorage on mount and listen for changes
    useEffect(() => {
        const loadSelection = () => {
            const stored = localStorage.getItem('relo_compare');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setSelectedAgencies(parsed);
                    setIsVisible(parsed.length > 0);
                } catch (e) {
                    console.error("Failed to parse comparison data", e);
                }
            }
        };

        loadSelection();

        // Listen for custom event 'relo_compare_update' to sync across components/vanilla JS
        window.addEventListener('relo_compare_update', loadSelection);
        // Also listen to storage events for cross-tab sync (optional but nice)
        window.addEventListener('storage', loadSelection);

        return () => {
            window.removeEventListener('relo_compare_update', loadSelection);
            window.removeEventListener('storage', loadSelection);
        };
    }, []);

    const removeAgency = (id: string) => {
        const updated = selectedAgencies.filter(a => a.id !== id);
        localStorage.setItem('relo_compare', JSON.stringify(updated));
        window.dispatchEvent(new Event('relo_compare_update'));
    };

    const clearAll = () => {
        localStorage.removeItem('relo_compare');
        setSelectedAgencies([]);
        setIsVisible(false);
        window.dispatchEvent(new Event('relo_compare_update'));
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="container mx-auto max-w-4xl">
                <div className="bg-slate-900/95 backdrop-blur shadow-2xl rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-6 border border-slate-800 text-white">

                    <div className="flex flex-1 items-center gap-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap hidden md:block">
                            Comparing {selectedAgencies.length}
                        </span>

                        <div className="flex items-center gap-3">
                            {selectedAgencies.map(agency => (
                                <div key={agency.id} className="relative group shrink-0">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                                        {agency.logo ? (
                                            <img src={agency.logo} alt={agency.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-slate-900 font-bold text-xs">{agency.name.substring(0, 2)}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeAgency(agency.id)}
                                        className="absolute -top-2 -right-2 bg-[#FF6F61]/50 text-white rounded-full p-0.5 hover:bg-[#ff5a4d] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}

                            {selectedAgencies.length < 3 && (
                                <div className="w-12 h-12 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-600 text-xs text-center shrink-0">
                                    Add +
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                        <button
                            onClick={clearAll}
                            className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
                        >
                            Clear
                        </button>
                        <a
                            href={`/search/results?compare_ids=${selectedAgencies.map(a => a.id).join(',')}`}
                            className="bg-[#FF6F61] hover:bg-[#ff5a4d] text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shadow-lg shadow-red-900/20"
                        >
                            Compare Agencies <ArrowRight size={16} />
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
}
