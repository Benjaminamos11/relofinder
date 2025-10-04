/**
 * Reviews List Component
 * Display reviews with agency replies and voting
 */

interface Review {
  id: string;
  rating: number;
  title?: string;
  text?: string;
  created_at: string;
  status: string;
  user_id?: string;
  reply?: {
    id: string;
    author_name: string;
    body: string;
    created_at: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  canReply?: boolean;
}

export default function ReviewsList({ reviews, canReply = false }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium text-lg">No reviews yet</p>
        <p className="text-gray-500 text-sm mt-1">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Review Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {review.status === 'approved' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Date */}
              <p className="text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Review Content */}
          {review.title && (
            <h4 className="font-bold text-gray-900 text-lg mb-2">
              {review.title}
            </h4>
          )}
          {review.text && (
            <p className="text-gray-700 leading-relaxed mb-4">
              {review.text}
            </p>
          )}

          {/* Agency Reply */}
          {review.reply && (
            <div className="mt-4 ml-4 pl-4 border-l-4 border-blue-200 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-900">
                  {review.reply.author_name}
                </span>
                <span className="text-sm text-blue-700">
                  • {new Date(review.reply.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-blue-900 text-sm leading-relaxed">
                {review.reply.body}
              </p>
            </div>
          )}

          {/* Reply Button (for agency admins) */}
          {canReply && !review.reply && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply to this review
              </button>
            </div>
          )}

          {/* Helpful Button */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>Helpful</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
