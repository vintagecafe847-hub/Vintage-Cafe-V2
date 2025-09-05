import React, { useState } from 'react';
import { Star, Send, CheckCircle, Heart, Coffee } from 'lucide-react';

interface FormState {
  email: string;
  comments: string;
}

interface FormErrors {
  email?: string;
  comments?: string;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  readonly?: boolean;
}> = ({ rating, onRatingChange, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center justify-center space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-all duration-200 transform ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => !readonly && onRatingChange(star)}
        >
          <Star
            className={`w-8 h-8 md:w-10 md:h-10 transition-all duration-200 ${
              star <= (hoverRating || rating)
                ? 'text-[#D8A24A] fill-[#D8A24A]'
                : 'text-gray-300 hover:text-[#D8A24A]'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const SmartReviewSystem: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<
    'rating' | 'feedback' | 'redirect' | 'thank-you'
  >('rating');
  const [rating, setRating] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    email: '',
    comments: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [submitMessage, setSubmitMessage] = useState('');

  // Your Google Business Profile review URL
  const GOOGLE_REVIEW_URL =
    'https://search.google.com/local/writereview?placeid=ChIJi6rB1c4mDogRJzjgHcQnFT8';

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);

    if (selectedRating >= 4) {
      // High rating - redirect to Google
      setCurrentStep('redirect');
      setTimeout(() => {
        window.open(GOOGLE_REVIEW_URL, '_blank');
        setCurrentStep('thank-you');
      }, 1500);
    } else {
      // Low rating - show feedback form
      setCurrentStep('feedback');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formState.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formState.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formState.comments.trim()) {
      errors.comments = 'Please share your feedback with us';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/send-review-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          email: formState.email,
          comments: formState.comments,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Thank you for your feedback!');
        setCurrentStep('thank-you');
      } else {
        setSubmitStatus('error');
        setSubmitMessage(
          result.message || 'An error occurred while sending your feedback.'
        );
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
      setSubmitMessage(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetReviewSystem = () => {
    setCurrentStep('rating');
    setRating(0);
    setFormState({ email: '', comments: '' });
    setFormErrors({});
    setSubmitStatus(null);
    setSubmitMessage('');
  };

  return (
    <section
      id="reviews"
      className="relative py-20 bg-gradient-to-br from-[#FEF7F3] to-stone-50"
    >
      {/* Decorative elements */}
      <img
        src="/icons/coffee-beans.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-8 left-8 w-12 h-12 opacity-20 pointer-events-none"
      />
      <img
        src="/icons/flower.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-12 right-12 w-16 h-16 opacity-15 pointer-events-none"
      />
      <img
        src="/icons/green-leafs.svg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-8 left-12 w-20 h-20 opacity-10 pointer-events-none"
      />

      <div className="relative z-10 px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Coffee className="w-12 h-12 mx-auto mb-4 text-[#D8A24A]" />
          <h2
            className="mb-6 text-4xl font-bold md:text-5xl text-[#3B2A20]"
            style={{ fontFamily: 'Prata, serif' }}
          >
            Share Your Experience
          </h2>
          <div className="w-24 h-1 mx-auto mb-6 bg-[#D8A24A]"></div>
          <p className="max-w-2xl mx-auto text-xl leading-relaxed text-gray-800">
            Your feedback helps us create an even better experience for our
            community
          </p>
        </div>

        <div className="p-8 md:p-12 border border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
          {/* Rating Step */}
          {currentStep === 'rating' && (
            <div className="text-center">
              <h3 className="mb-8 text-2xl md:text-3xl font-bold text-[#3B2A20]">
                How was your experience at Vintage Cafe?
              </h3>
              <StarRating rating={rating} onRatingChange={handleRatingSelect} />
              <p className="mt-6 text-gray-600">
                Click the stars to rate your experience
              </p>
            </div>
          )}

          {/* Redirect Step */}
          {currentStep === 'redirect' && (
            <div className="text-center">
              <div className="mb-6">
                <StarRating
                  rating={rating}
                  onRatingChange={() => {}}
                  readonly
                />
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="mb-4 text-2xl font-bold text-green-800">
                  Thank you for the great rating!
                </h3>
                <p className="mb-6 text-green-700">
                  We're redirecting you to Google to share your experience with
                  others...
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Form Step */}
          {currentStep === 'feedback' && (
            <div>
              <div className="mb-8 text-center">
                <StarRating
                  rating={rating}
                  onRatingChange={() => {}}
                  readonly
                />
                <h3 className="mt-6 mb-4 text-2xl font-bold text-[#3B2A20]">
                  Help us improve your experience
                </h3>
                <p className="text-gray-600">
                  We'd love to hear how we can make your next visit even better
                </p>
              </div>

              {submitStatus === 'error' && (
                <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M12 5a7 7 0 110 14 7 7 0 010-14z"
                      />
                    </svg>
                    <div>
                      <div className="text-base font-semibold text-red-800">
                        {submitMessage}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#D8A24A] focus:border-[#D8A24A] transition-all duration-200 ${
                      formErrors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="comments"
                    value={formState.comments}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Please tell us about your experience and how we can improve..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#D8A24A] focus:border-[#D8A24A] transition-all duration-200 resize-none ${
                      formErrors.comments
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                  />
                  {formErrors.comments && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.comments}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={resetReviewSystem}
                    className="flex-1 px-6 py-3 text-[#3B2A20] border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    Back to Rating
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#D8A24A] to-[#c9a876] text-white font-semibold rounded-xl hover:from-[#c9a876] hover:to-[#D8A24A] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Thank You Step */}
          {currentStep === 'thank-you' && (
            <div className="text-center">
              <div className="p-8 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <Heart className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="mb-4 text-2xl md:text-3xl font-bold text-[#3B2A20]">
                  Thank You!
                </h3>
                <p className="mb-6 text-lg text-gray-700">
                  {rating >= 4
                    ? 'We appreciate you taking the time to share your experience!'
                    : "Thank you for your feedback. We'll use it to improve our service."}
                </p>
                <div className="mb-6">
                  <StarRating
                    rating={rating}
                    onRatingChange={() => {}}
                    readonly
                  />
                </div>
                <button
                  onClick={resetReviewSystem}
                  className="px-8 py-3 bg-gradient-to-r from-[#D8A24A] to-[#c9a876] text-white font-semibold rounded-xl hover:from-[#c9a876] hover:to-[#D8A24A] transition-all duration-200"
                >
                  Leave Another Review
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Additional call-to-action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Follow us on social media for updates and special offers
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <a
              href="https://www.instagram.com/vintagecafeschaumburg/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <svg
                className="w-6 h-6 text-pink-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/vintagecafeschaumburg"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartReviewSystem;
