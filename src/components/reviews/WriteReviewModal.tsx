import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Star, X, Loader2, Quote } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface WriteReviewModalProps {
    companyName: string;
    companyId: string; // This expects the Relocator UUID (UUID from Supabase)
    isOpen: boolean;
    onClose: () => void;
}

export default function WriteReviewModal({ companyName, companyId, isOpen, onClose }: WriteReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Basic validation
            if (!name || !email || !review) {
                throw new Error('All fields are required');
            }

            // Submit to Supabase
            // Assuming 'reviews' table structure based on usage in companies/[id].astro
            const { error: submitError } = await supabase
                .from('reviews')
                .insert([
                    {
                        relocator_id: companyId,
                        author_name: name,
                        author_email: email,
                        rating: rating,
                        text: review,
                        status: 'pending', // Pending approval
                        source: 'relofinder_web'
                    }
                ]);

            if (submitError) throw submitError;

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                // meaningful delay to show success message before closing, 
                // resetting state after close could be done via useEffect on isOpen
                setIsSuccess(false);
                setRating(0);
                setName('');
                setEmail('');
                setReview('');
            }, 2000);

        } catch (err: any) {
            console.error('Error submitting review:', err);
            setError(err.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all relative">

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {isSuccess ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Quote className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
                                        <p className="text-gray-500">Your review has been submitted for approval.</p>
                                    </div>
                                ) : (
                                    <>
                                        <Dialog.Title as="h3" className="text-2xl font-serif font-bold text-gray-900 mb-2 text-center">
                                            Write a Review
                                        </Dialog.Title>
                                        <p className="text-center text-gray-500 mb-8">
                                            Share your experience with {companyName}
                                        </p>

                                        <form onSubmit={handleSubmit} className="space-y-6">

                                            {/* Star Rating */}
                                            <div className="flex justify-center gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className="focus:outline-none transition-transform hover:scale-110"
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRating(star)}
                                                    >
                                                        <Star
                                                            className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                                                    ? 'fill-[#FF6F61] text-[#FF6F61]'
                                                                    : 'text-gray-200'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="text-center text-sm font-medium text-gray-500 mb-6 h-5">
                                                {hoverRating > 0 ? (
                                                    ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][hoverRating - 1]
                                                ) : rating > 0 ? (
                                                    ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][rating - 1]
                                                ) : 'Select a rating'}
                                            </div>

                                            {/* Info Fields */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] outline-none transition-all"
                                                        placeholder="Your Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] outline-none transition-all"
                                                        placeholder="your@email.com"
                                                    />
                                                </div>
                                            </div>

                                            {/* Review Text */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Your Experience</label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    value={review}
                                                    onChange={(e) => setReview(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#FF6F61] focus:ring-1 focus:ring-[#FF6F61] outline-none transition-all resize-none"
                                                    placeholder="Tell us about the service quality, communication, and overall result..."
                                                ></textarea>
                                            </div>

                                            {/* Error Message */}
                                            {error && (
                                                <div className="text-red-500 text-sm text-center font-medium bg-[#FF6F61]/5 p-3 rounded-lg">
                                                    {error}
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-[#FF6F61] text-white py-4 rounded-xl font-bold hover:bg-[#ff5a4d] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Review'
                                                )}
                                            </button>

                                            <p className="text-xs text-center text-gray-400">
                                                Reviews are verified before publishing. Your email will not be shared publicly.
                                            </p>

                                        </form>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
