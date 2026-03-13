import React, { useState } from 'react'
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane,
  FaGlobe,
  FaFacebook,
  FaWhatsapp
} from 'react-icons/fa'

interface FormData {
  fullName: string
  email: string
  phone: string
  destination: string
  notes: string
  source: 'website' | 'meta' | 'whatsapp' | 'other'
  campaignId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

const PublicLeadCapturePage: React.FC = () => {
  const [status, setStatus] = useState<
    'idle' | 'success' | 'duplicate' | 'error'
  >('idle')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    destination: '',
    notes: '',
    source: 'website',
    utmSource: '',
    utmMedium: '',
    utmCampaign: ''
  })

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: ''
  })

  const sources = [
    { value: 'website', label: 'Website', icon: FaGlobe },
    { value: 'meta', label: 'Meta (Facebook/Instagram)', icon: FaFacebook },
    { value: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp },
    { value: 'other', label: 'Other', icon: null }
  ]

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: ''
    }
    let isValid = true

    // At least one identifier must be present (fullName, email, or phone)
    const hasIdentifier =
      formData.fullName.trim() || formData.email.trim() || formData.phone.trim()

    if (!hasIdentifier) {
      newErrors.fullName =
        'At least one identifier (name, email, or phone) is required'
      isValid = false
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
      isValid = false
    }

    if (formData.phone && !/^[\d\s\+\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Randomly decide success or duplicate for demo
      const random = Math.random()
      if (random < 0.7) {
        setStatus('success')
      } else if (random < 0.9) {
        setStatus('duplicate')
      } else {
        setStatus('error')
      }
      setLoading(false)
    }, 1500)
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSourceChange = (
    source: 'website' | 'meta' | 'whatsapp' | 'other'
  ) => {
    setFormData(prev => ({ ...prev, source }))
  }

  return (
    <main className='flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full'>
      <div className='w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-screen'>
        <div className='w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800'>
          {/* Header with gradient */}
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 px-6 sm:px-8 py-6'>
            <div className='flex items-center justify-center gap-2 text-white mb-2'>
              <FaGlobe className='text-2xl' />
              <span className='text-sm font-medium uppercase tracking-wider'>
                Public Lead Capture
              </span>
            </div>
            <h1 className='text-2xl sm:text-3xl font-bold text-white text-center'>
              Plan Your Dream Trip
            </h1>
            <p className='text-blue-100 text-center mt-2 text-sm'>
              Share your travel preferences and we'll get back to you within 24
              hours
            </p>
          </div>

          {/* Form Section */}
          <div className='p-6 sm:p-8 space-y-6'>
            {/* Source Selection */}
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                How did you hear about us?
              </label>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {sources.map(source => (
                  <button
                    key={source.value}
                    type='button'
                    onClick={() => handleSourceChange(source.value as any)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.source === source.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {source.icon && <source.icon className='text-sm' />}
                    <span className='hidden sm:inline'>{source.label}</span>
                    <span className='sm:hidden'>{source.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* Main Fields */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Full Name */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Full Name
                  </label>
                  <input
                    type='text'
                    name='fullName'
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${
                      errors.fullName
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='John Doe'
                  />
                  {errors.fullName && (
                    <p className='mt-1 text-xs text-red-500 dark:text-red-400'>
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${
                      errors.email
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='john@example.com'
                  />
                  {errors.email && (
                    <p className='mt-1 text-xs text-red-500 dark:text-red-400'>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 ${
                      errors.phone
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder='+1 234 567 8900'
                  />
                  {errors.phone && (
                    <p className='mt-1 text-xs text-red-500 dark:text-red-400'>
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Preferred Destination
                  </label>
                  <input
                    type='text'
                    name='destination'
                    value={formData.destination}
                    onChange={handleChange}
                    className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100'
                    placeholder='e.g., Maldives, Dubai, Paris'
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Tell us about your trip
                </label>
                <textarea
                  name='notes'
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className='w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100'
                  placeholder='Share your travel preferences, dates, budget, special requirements...'
                />
              </div>

              {/* UTM Fields (Hidden but available for tracking) */}
              <div className='hidden'>
                <input
                  type='hidden'
                  name='utmSource'
                  value={formData.utmSource}
                />
                <input
                  type='hidden'
                  name='utmMedium'
                  value={formData.utmMedium}
                />
                <input
                  type='hidden'
                  name='utmCampaign'
                  value={formData.utmCampaign}
                />
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading}
                className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none'
              >
                {loading ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Submit Enquiry
                  </>
                )}
              </button>
            </form>

            {/* Status Messages */}
            {status === 'success' && (
              <div className='p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm flex items-center gap-3'>
                <FaCheckCircle className='text-lg flex-shrink-0' />
                <div>
                  <p className='font-medium'>Thank you for your interest!</p>
                  <p className='text-xs mt-1'>
                    Your enquiry has been captured successfully. Our team will
                    contact you within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {status === 'duplicate' && (
              <div className='p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm flex items-center gap-3'>
                <FaExclamationTriangle className='text-lg flex-shrink-0' />
                <div>
                  <p className='font-medium'>We already have your enquiry!</p>
                  <p className='text-xs mt-1'>
                    A lead with similar details already exists. Our team will
                    follow up on the existing record.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className='p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-3'>
                <FaExclamationTriangle className='text-lg flex-shrink-0' />
                <div>
                  <p className='font-medium'>Something went wrong!</p>
                  <p className='text-xs mt-1'>
                    Please try again or contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Helper Text */}
            <p className='text-xs text-gray-400 dark:text-gray-500 text-center'>
              By submitting this form, you agree to our privacy policy and terms
              of service.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PublicLeadCapturePage
