import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Send,
  CheckCircle,
  Instagram,
  Facebook,
} from 'lucide-react';
import { useState } from 'react';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
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

    // Required field validation
    if (!formState.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formState.email.trim()) {
      errors.email = 'Email is required';
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formState.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!formState.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formState.message.trim()) {
      errors.message = 'Message is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
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
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
        setSubmitMessage('');
      }, 5000);
    }
  };

  return (
    <>
      <section id="contact" className="relative py-20 bg-stone-50">
        {/* Decorative corner image - positioned on the left side */}
        <img
          src="/icons/corner.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-0 left-0 z-0 pointer-events-none w-44 md:w-64 lg:w-72 md:block"
        />
        {/* Decorative corner image - positioned on the right side, horizontally flipped */}
        <img
          src="/icons/corner.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-0 right-0 z-0  pointer-events-none w-44 md:w-64 lg:w-72 md:block scale-x-[-1]"
        />
        {/* Decorative carton images - positioned symmetrically */}
        {/* Bulky vine decorations - positioned at bottom */}
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
              className="mb-6 text-4xl font-bold md:text-5xl text-amber-800"
              style={{
                fontFamily: 'Prata, serif',
              }}
            >
              Visit Us
            </h2>
            <div className="w-24 h-1 mx-auto mb-6 bg-amber-600"></div>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-gray-600">
              Come experience the warmth and community that makes The Shiplap
              Shop & Coffee House special. We're located in the heart of Yelm
              and can't wait to welcome you.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid items-start gap-16 lg:grid-cols-2">
            {/* Contact Information - Left Side */}
            <div className="space-y-8 lg:order-1">
              <div className="p-8 border shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl border-amber-200/50">
                <h3 className="mb-6 text-2xl font-bold text-amber-800">
                  Contact Information
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="flex-shrink-0 w-6 h-6 mt-1 text-amber-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Address</h4>
                      <p className="text-gray-600">
                        112 Yelm Ave E
                        <br />
                        Yelm, WA 98597, USA
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="flex-shrink-0 w-6 h-6 mt-1 text-amber-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone</h4>
                      <p className="text-gray-600">+1 (360) 200-0262</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="flex-shrink-0 w-6 h-6 mt-1 text-amber-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">cyndie@theshiplapshop.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="flex-shrink-0 w-6 h-6 mt-1 text-amber-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Hours</h4>
                      <div className="space-y-1 text-gray-600">
                        <p>Monday - Thursday: 6:00 AM - 5:00 PM</p>
                        <p>Friday: 6:00 AM - 5:30 PM</p>
                        <p>Saturday: 7:00 AM - 5:30 PM</p>
                        <p>Sunday: 7:00 AM - 3:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Section - Call, Directions & Social */}
                <div className="mt-8">
                  <div className="p-6 text-white shadow-lg bg-gradient-to-r from-amber-800 to-orange-800 rounded-xl">
                    <h4 className="mb-3 text-xl font-bold text-center">
                      Connect With Us
                    </h4>
                    <p className="mb-6 text-sm text-center text-amber-100">
                      Call us, visit our location, or follow us on social media
                      for latest updates
                    </p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
                      <a
                        href="tel:+13602000262"
                        className="flex items-center justify-center px-4 py-2.5 bg-white text-amber-800 font-semibold rounded-lg hover:bg-amber-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Us Today
                      </a>

                      <a
                        href="https://maps.google.com/?q=112+Yelm+Ave+E,+Yelm,+WA+98597"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-2.5 bg-white text-amber-800 font-semibold rounded-lg hover:bg-amber-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:order-2">
              <div className="p-8 border shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl border-amber-200/50">
                <h3 className="mb-6 text-2xl font-bold text-amber-800">
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <div>
                        <div className="text-base font-semibold text-red-800">
                          Error sending message
                        </div>
                        <div className="text-sm text-red-700">
                          {submitMessage ||
                            'Please try again later or contact us directly.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Name */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formState.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        required
                        className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
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
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formState.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
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
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Phone{' '}
                      <span className="text-sm text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formState.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 transition-all duration-200 bg-white border border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formState.subject}
                      onChange={handleInputChange}
                      placeholder="What's this about?"
                      required
                      className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
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
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formState.message}
                      onChange={handleInputChange}
                      placeholder="Tell us what's on your mind..."
                      rows={6}
                      required
                      className={`w-full px-4 py-3 text-gray-900 transition-all duration-200 border rounded-lg bg-white border-gray-300 placeholder-gray-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-vertical ${
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
                    className="flex items-center justify-center w-full gap-2 px-6 py-4 text-base font-semibold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-amber-800 to-orange-800 hover:from-amber-700 hover:to-orange-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
