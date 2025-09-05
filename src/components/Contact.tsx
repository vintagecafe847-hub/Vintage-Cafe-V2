import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Send,
  CheckCircle,
  Star,
  Heart,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ReviewFormState {
  email: string;
  comments: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface ReviewFormErrors {
  email?: string;
  comments?: string;
}

const Contact = () => {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [submitMessage, setSubmitMessage] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Review system state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showHighRatingModal, setShowHighRatingModal] = useState(false);
  const [showLowRatingModal, setShowLowRatingModal] = useState(false);
  const [reviewFormState, setReviewFormState] = useState<ReviewFormState>({
    email: '',
    comments: '',
  });
  const [reviewFormErrors, setReviewFormErrors] = useState<ReviewFormErrors>(
    {}
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<
    'success' | 'error' | null
  >(null);

  // Review URLs
  const GOOGLE_REVIEW_URL =
    'https://search.google.com/local/writereview?placeid=ChIJi6rB1c4mDogRJzjgHcQnFT8';
  const YELP_REVIEW_URL = 'https://www.yelp.com/biz/vintage-cafe-schaumburg';

  // Review system handlers
  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);

    if (selectedRating >= 4) {
      setShowHighRatingModal(true);
    } else {
      setShowLowRatingModal(true);
    }
  };

  const handleExternalReview = (platform: 'google' | 'yelp') => {
    const url = platform === 'google' ? GOOGLE_REVIEW_URL : YELP_REVIEW_URL;
    window.open(url, '_blank');
    setShowHighRatingModal(false);
    setTimeout(() => setRating(0), 1000);
  };

  const handleReviewInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (reviewFormErrors[name as keyof ReviewFormErrors]) {
      setReviewFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateReviewForm = (): boolean => {
    const errors: ReviewFormErrors = {};

    // Email is only required for ratings 4 and 5
    if (rating >= 4) {
      if (!reviewFormState.email.trim()) {
        errors.email = 'Email is required for ratings of 4 stars and above';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(reviewFormState.email)) {
          errors.email = 'Please enter a valid email address';
        }
      }
    }

    if (!reviewFormState.comments.trim()) {
      errors.comments = 'Please share your feedback with us';
    } else if (reviewFormState.comments.length > 2000) {
      errors.comments = 'Comments must be less than 2000 characters';
    }

    setReviewFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateReviewForm()) {
      return;
    }

    setIsSubmittingReview(true);
    setReviewSubmitStatus(null);

    try {
      const response = await fetch('/api/send-review-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          email: reviewFormState.email,
          comments: reviewFormState.comments,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReviewSubmitStatus('success');
        setShowLowRatingModal(false);
        setReviewFormState({ email: '', comments: '' });
        setReviewFormErrors({});
        setRating(0);
      } else {
        setReviewSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setReviewSubmitStatus('error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const closeModals = () => {
    setShowHighRatingModal(false);
    setShowLowRatingModal(false);
    setRating(0);
    setReviewFormState({ email: '', comments: '' });
    setReviewFormErrors({});
    setReviewSubmitStatus(null);
  };

  // Contact form handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formState.name.trim()) {
      errors.name = 'Name is required';
    } else if (formState.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }

    if (!formState.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formState.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formState.subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (formState.subject.length > 200) {
      errors.subject = 'Subject must be less than 200 characters';
    }

    if (!formState.message.trim()) {
      errors.message = 'Message is required';
    } else if (formState.message.length > 5000) {
      errors.message = 'Message must be less than 5000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setSubmitMessage(result.message || 'Message sent successfully!');
        setFormState({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setFormErrors({});
      } else {
        setSubmitStatus('error');
        setSubmitMessage(
          result.message || 'An error occurred while sending your message.'
        );
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setSubmitMessage(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus(null);
        setSubmitMessage('');
      }, 5000);
    }
  };

  return (
    <>
      {/* Backdrop for modals */}
      {(showHighRatingModal || showLowRatingModal) && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={closeModals}
        />
      )}

      {/* High Rating Modal */}
      {showHighRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md p-6 bg-white rounded-2xl">
            <button
              onClick={closeModals}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="mb-4">
                <div className="flex justify-center mb-4 space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-[#D8A24A] fill-[#D8A24A]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-[#3B2A20] mb-2">
                  Thank you for the great rating!
                </h3>
                <p className="mb-6 text-gray-600">
                  Would you like to share your experience publicly to help
                  others discover us?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleExternalReview('google')}
                  className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-[#4285F4] font-semibold rounded-xl hover:bg-[#f1f3f4] transition-colors duration-300 ease-in-out shadow-sm"
                  style={{ boxShadow: '0 1px 2px rgba(60,64,67,.08)' }}
                >
                  <img
                    src="/icons/google-icon.svg"
                    alt="Google"
                    className="w-5 h-5 mr-2"
                  />
                  Review on Google
                </button>

                <button
                  onClick={() => handleExternalReview('yelp')}
                  className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-200 text-[#d32323] font-semibold rounded-xl hover:bg-[#f1f3f4] transition-colors duration-300 ease-in-out shadow-sm"
                  style={{ boxShadow: '0 1px 2px rgba(60,64,67,.08)' }}
                >
                  <img
                    src="/icons/yelp.svg"
                    alt="Yelp"
                    className="w-5 h-5 mr-2"
                  />
                  Review on Yelp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Rating Modal */}
      {showLowRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModals}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6 text-center">
              <div className="flex justify-center mb-4 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'text-[#D8A24A] fill-[#D8A24A]'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <h3 className="text-xl font-bold text-[#3B2A20] mb-2">
                Help us improve your experience
              </h3>
              <p className="text-gray-600">
                We'd love to hear how we can make your next visit even better
              </p>
            </div>

            {reviewSubmitStatus === 'success' && (
              <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="text-sm text-green-800">
                    Thank you for your feedback! We'll use it to improve our
                    service.
                  </div>
                </div>
              </div>
            )}

            {reviewSubmitStatus === 'error' && (
              <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
                <div className="text-sm text-red-800">
                  Sorry, there was an error sending your feedback. Please try
                  again.
                </div>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Email {rating >= 4 && <span className="text-red-500">*</span>}
                  {rating <= 3 && (
                    <span className="text-sm text-gray-500">(optional)</span>
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  value={reviewFormState.email}
                  onChange={handleReviewInputChange}
                  placeholder="your@email.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D8A24A] focus:border-[#D8A24A] transition-all duration-200 ${
                    reviewFormErrors.email
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {reviewFormErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {reviewFormErrors.email}
                  </p>
                )}
                {rating <= 3 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email is optional for ratings of 3 stars and below. We use
                    it only to follow up on your feedback if needed.
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="comments"
                  value={reviewFormState.comments}
                  onChange={handleReviewInputChange}
                  rows={4}
                  maxLength={2000}
                  placeholder="Please tell us about your experience and how we can improve..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D8A24A] focus:border-[#D8A24A] transition-all duration-200 resize-none ${
                    reviewFormErrors.comments
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {reviewFormErrors.comments && (
                  <p className="mt-1 text-sm text-red-600">
                    {reviewFormErrors.comments}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 text-gray-600 transition-colors duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-[#D8A24A] transition-colors duration-300 ease-in-out disabled:opacity-50"
                >
                  {isSubmittingReview ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section id="contact" className="relative py-20 bg-stone-50">
        {/* Decorative corner images */}
        <img
          src="/icons/corner.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-0 left-0 z-0 pointer-events-none w-36 md:w-64 lg:w-72 md:block"
        />
        <img
          src="/icons/corner.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-0 right-0 z-0 pointer-events-none w-36 md:w-64 lg:w-72 md:block scale-x-[-1]"
        />
        <img
          src="/icons/bulky-green.svg"
          alt=""
          aria-hidden="true"
          className="absolute z-0 hidden pointer-events-none sm:w-8 md:w-12 lg:w-16 left-2 -bottom-2 md:block"
        />
        <img
          src="/icons/bulky-green.svg"
          alt=""
          aria-hidden="true"
          className="absolute z-0 hidden w-16 pointer-events-none right-2 -bottom-2 md:block scale-x-[-1]"
        />

        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 text-center">
            <h2
              className="mb-6 text-4xl font-bold md:text-5xl text-[#3B2A20]"
              style={{ fontFamily: 'Prata, serif' }}
            >
              Vintage Cafe Schaumburg
            </h2>
            <div className="w-24 h-1 mx-auto mb-6 bg-[#D8A24A]"></div>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-800">
              Come experience the warmth and community at Vintage Cafe in
              Schaumburg. We're woman-owned and proud to be a neighborhood spot
              for coffee, pastries, music, and creative events.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid items-start gap-16 lg:grid-cols-2">
            {/* Left Side - Rate Your Experience, Contact Information, and Connect With Us */}
            <div className="space-y-8 lg:order-1">
              {/* Rate Your Experience - Moved to top */}
              <div className="p-8 bg-white border border-gray-200 rounded-2xl">
                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto mb-4 text-[#D8A24A]" />
                  <h3 className="mb-4 text-xl font-bold text-[#3B2A20]">
                    Rate Your Experience
                  </h3>
                  <p className="mb-6 text-[#6b4f3d]">
                    How was your visit to Vintage Cafe?
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center justify-center mb-6 space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="transition-all duration-200 transform cursor-pointer hover:scale-110"
                        onClick={() => handleRatingSelect(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star
                          className={`w-8 h-8 transition-all duration-200 ${
                            star <= (hoverRating || rating)
                              ? 'text-[#D8A24A] fill-[#D8A24A]'
                              : 'text-gray-400 hover:text-[#D8A24A]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600">
                    Click the stars to share your feedback
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-8 border border-gray-200 bg-white/90 rounded-2xl">
                <h3 className="mb-6 text-2xl font-bold text-[#3B2A20]">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Left column */}
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="flex-shrink-0 w-6 h-6 mt-1 text-[#D8A24A]" />
                      <div>
                        <h4 className="font-semibold text-[#3B2A20]">
                          Address
                        </h4>
                        <p className="text-gray-800">
                          105 E Schaumburg Rd
                          <br />
                          Schaumburg, IL 60194, USA
                        </p>
                      </div>
                    </div>

                    {/* Email item - match other contact items so the address shows under the title */}
                    <div className="flex items-start space-x-4">
                      <Mail className="flex-shrink-0 w-6 h-6 mt-1 text-[#D8A24A]" />
                      <div>
                        <h4 className="font-semibold text-[#3B2A20]">Email</h4>
                        <p className="max-w-full text-gray-800 break-words whitespace-normal">
                          <a
                            href="mailto:vintagecafeschaumburg@gmail.com"
                            className="block max-w-full break-words break-all underline-offset-2 hover:underline"
                          >
                            vintagecafeschaumburg@gmail.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Phone className="flex-shrink-0 w-6 h-6 mt-1 text-[#D8A24A]" />
                      <div>
                        <h4 className="font-semibold text-[#3B2A20]">Phone</h4>
                        <p className="text-gray-800">+1 (630) 400-5155</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Clock className="flex-shrink-0 w-6 h-6 mt-1 text-[#D8A24A]" />
                      <div>
                        <h4 className="font-semibold text-[#3B2A20]">Hours</h4>
                        <div className="space-y-1 text-gray-800">
                          <p>Mon–Fri: 8:00 AM – 3:00 PM</p>
                          <p>Sat: 8:00 AM – 4:00 PM</p>
                          <p>Sun: 9:00 AM – 5:00 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connect With Us - Inside contact info */}
                <div className="pt-6 mt-8 border-t border-gray-200">
                  <h4 className="mb-4 text-lg font-bold text-center text-[#3B2A20]">
                    Connect With Us
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <a
                      href="tel:+16304005155"
                      className="flex items-center justify-center px-4 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-[#D8A24A] transition-colors duration-300 ease-in-out"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Us Today
                    </a>

                    <a
                      href="https://maps.google.com/?q=105+E+Schaumburg+Rd,+Schaumburg,+IL+60194"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-[#D8A24A] transition-colors duration-300 ease-in-out"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form Only */}
            <div className="lg:order-2">
              {/* Contact Form */}
              <div className="p-8 border border-gray-200 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl">
                <h3 className="mb-6 text-2xl font-bold text-[#3B2A20]">
                  Send us a Message
                </h3>

                {submitStatus === 'success' && (
                  <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="text-base font-semibold text-green-800">
                          {submitMessage || 'Message sent successfully!'}
                        </div>
                        <div className="text-sm text-green-700">
                          We'll get back to you as soon as possible.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 mb-6 border border-yellow-300 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-yellow-600"
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
                        <div className="text-base font-semibold text-yellow-800">
                          this feature is under construction
                        </div>
                        <div className="text-sm text-yellow-700">
                          this feature is under construction, pls try again
                          later or contact the developer
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        maxLength={100}
                        required
                        className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-[#D8A24A] focus:outline-none focus:ring-2 focus:ring-[#D8A24A]/20 ${
                          formErrors.name
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : ''
                        }`}
                      />
                      {formErrors.name && (
                        <p className="mt-2 text-sm text-red-600">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-[#D8A24A] focus:outline-none focus:ring-2 focus:ring-[#D8A24A]/20 ${
                          formErrors.email
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : ''
                        }`}
                      />
                      {formErrors.email && (
                        <p className="mt-2 text-sm text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone - Full Width */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Phone{' '}
                      <span className="text-sm text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formState.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 transition-all duration-200 bg-white border border-gray-300 rounded-lg focus:border-[#D8A24A] focus:outline-none focus:ring-2 focus:ring-[#D8A24A]/20"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formState.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      maxLength={200}
                      required
                      className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-[#D8A24A] focus:outline-none focus:ring-2 focus:ring-[#D8A24A]/20 ${
                        formErrors.subject
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : ''
                      }`}
                    />
                    {formErrors.subject && (
                      <p className="mt-2 text-sm text-red-600">
                        {formErrors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formState.message}
                      onChange={handleInputChange}
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      maxLength={5000}
                      required
                      className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-[#D8A24A] focus:outline-none focus:ring-2 focus:ring-[#D8A24A]/20 resize-vertical ${
                        formErrors.message
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          : ''
                      }`}
                    />
                    {formErrors.message && (
                      <p className="mt-2 text-sm text-red-600">
                        {formErrors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center justify-center w-full gap-2 px-6 py-4 text-base font-semibold text-white rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D8A24A]/30 disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        isSubmitting
                          ? 'bg-[#D8A24A]'
                          : 'bg-black hover:bg-[#D8A24A]'
                      }
                    `}
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
