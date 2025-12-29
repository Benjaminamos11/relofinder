import React, { useState } from 'react';
import WriteReviewModal from './WriteReviewModal';
import { Quote } from 'lucide-react';

interface ReviewSubmissionWrapperProps {
    companyName: string;
    companyId: string;
}

export default function ReviewSubmissionWrapper({ companyName, companyId }: ReviewSubmissionWrapperProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="break-inside-avoid bg-[#FF6F61] p-8 rounded-3xl text-white text-center flex flex-col items-center justify-center min-h-[300px] mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                    <Quote className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Worked with {companyName}?</h3>
                <p className="text-white/80 mb-8 text-sm leading-relaxed">
                    Share your experience with the community. Your feedback helps others make informed decisions.
                </p>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-white text-[#FF6F61] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg w-full"
                >
                    Write a Review
                </button>
            </div>

            <WriteReviewModal
                companyName={companyName}
                companyId={companyId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
