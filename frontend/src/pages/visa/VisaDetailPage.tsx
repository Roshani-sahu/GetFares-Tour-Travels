import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaListCheck,
  FaPassport,
  FaUpload,
  FaCheck,
  FaXmark,
  FaEye,
  FaDownload,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaTrash,
  FaArrowLeft
} from 'react-icons/fa6'
import { DateInput, TextInput } from '../../components/form'
import AuditMeta from '../../components/ui/AuditMeta'
import StatusBadge from '../../components/ui/StatusBadge'
import SurfaceCard from '../../components/ui/SurfaceCard'
import Timeline from '../../components/ui/Timeline'
import EmptyState from '../../components/ui/EmptyState'
import { validateVisaTransition } from '../../utils/workflowValidation'

// Types
interface Document {
  id: string
  name: string
  type: 'pdf' | 'image' | 'doc' | 'other'
  size: string
  uploadedAt: string
  uploadedBy: string
  verified: boolean
  verifiedAt?: string
  verifiedBy?: string
  url: string
}

interface ChecklistItem {
  id: string
  label: string
  required: boolean
  completed: boolean
  documentId?: string
}

interface TimelineItem {
  id: string
  title: string
  meta: string
  time: string
  icon: JSX.Element
  description?: string
}

const VisaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Status state
  const [status, setStatus] = useState<
    'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  >('SUBMITTED')
  const [rejectionReason, setRejectionReason] = useState('')
  const [visaValidUntil, setVisaValidUntil] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'doc1',
      name: 'passport_front.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedAt: '2026-03-10T10:30:00Z',
      uploadedBy: 'Alex Morgan',
      verified: true,
      verifiedAt: '2026-03-11T14:20:00Z',
      verifiedBy: 'Sarah Lee',
      url: '#'
    },
    {
      id: 'doc2',
      name: 'passport_back.jpg',
      type: 'image',
      size: '1.8 MB',
      uploadedAt: '2026-03-10T10:31:00Z',
      uploadedBy: 'Alex Morgan',
      verified: true,
      verifiedAt: '2026-03-11T14:21:00Z',
      verifiedBy: 'Sarah Lee',
      url: '#'
    },
    {
      id: 'doc3',
      name: 'bank_statement.pdf',
      type: 'pdf',
      size: '3.2 MB',
      uploadedAt: '2026-03-11T09:15:00Z',
      uploadedBy: 'Alex Morgan',
      verified: false,
      url: '#'
    },
    {
      id: 'doc4',
      name: 'travel_insurance.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadedAt: '2026-03-12T11:20:00Z',
      uploadedBy: 'Alex Morgan',
      verified: false,
      url: '#'
    }
  ])

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'passport', label: 'Passport Copy', required: true, completed: true },
    {
      id: 'photo',
      label: 'Passport Size Photo',
      required: true,
      completed: true
    },
    { id: 'bank', label: 'Bank Statement', required: true, completed: false },
    {
      id: 'insurance',
      label: 'Travel Insurance',
      required: true,
      completed: false
    },
    {
      id: 'flight',
      label: 'Flight Itinerary',
      required: false,
      completed: false
    },
    { id: 'hotel', label: 'Hotel Booking', required: false, completed: false }
  ])

  // Timeline state
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      id: '1',
      title: 'Visa case created',
      meta: 'Alex Morgan',
      time: '2026-03-10T09:20:00Z',
      icon: <FaPassport />,
      description: 'Initial case created for Maldives tourist visa'
    },
    {
      id: '2',
      title: 'Documents uploaded',
      meta: 'Alex Morgan',
      time: '2026-03-10T10:35:00Z',
      icon: <FaUpload />,
      description: 'Passport copies uploaded'
    },
    {
      id: '3',
      title: 'Documents verified',
      meta: 'Sarah Lee',
      time: '2026-03-11T14:25:00Z',
      icon: <FaCheck />,
      description: 'Passport documents verified'
    }
  ])

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState('')

  // Case summary data
  const caseSummary = {
    country: 'Maldives',
    visaType: 'Tourist',
    appointmentDate: '2026-03-16',
    appointmentTime: '10:30 AM',
    fees: '$150',
    processingTime: '5-7 working days',
    validFrom: visaValidUntil || '2026-06-16'
  }

  const saveStatus = () => {
    const validationError = validateVisaTransition(
      status,
      rejectionReason,
      visaValidUntil
    )
    setError(validationError)
    if (!validationError) {
      // Add to timeline
      const newTimelineItem: TimelineItem = {
        id: Date.now().toString(),
        title: `Status changed to ${status}`,
        meta: 'Current User',
        time: new Date().toISOString(),
        icon:
          status === 'APPROVED' ? (
            <FaCheck />
          ) : status === 'REJECTED' ? (
            <FaXmark />
          ) : (
            <FaListCheck />
          ),
        description:
          status === 'REJECTED' ? `Reason: ${rejectionReason}` : undefined
      }
      setTimeline(prev => [newTimelineItem, ...prev])
      setError('')
    }
  }

  const handleVerifyDocument = (docId: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId
          ? {
              ...doc,
              verified: true,
              verifiedAt: new Date().toISOString(),
              verifiedBy: 'Current User'
            }
          : doc
      )
    )

    // Update checklist if document matches
    const doc = documents.find(d => d.id === docId)
    if (doc?.name.includes('passport')) {
      setChecklist(prev =>
        prev.map(item =>
          item.id === 'passport' ? { ...item, completed: true } : item
        )
      )
    } else if (doc?.name.includes('bank')) {
      setChecklist(prev =>
        prev.map(item =>
          item.id === 'bank' ? { ...item, completed: true } : item
        )
      )
    } else if (doc?.name.includes('insurance')) {
      setChecklist(prev =>
        prev.map(item =>
          item.id === 'insurance' ? { ...item, completed: true } : item
        )
      )
    }

    // Add to timeline
    const newTimelineItem: TimelineItem = {
      id: Date.now().toString(),
      title: `Document verified: ${doc?.name}`,
      meta: 'Current User',
      time: new Date().toISOString(),
      icon: <FaCheck />
    }
    setTimeline(prev => [newTimelineItem, ...prev])
  }

  const handleDeleteDocument = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId))

      // Add to timeline
      const newTimelineItem: TimelineItem = {
        id: Date.now().toString(),
        title: `Document deleted`,
        meta: 'Current User',
        time: new Date().toISOString(),
        icon: <FaTrash />
      }
      setTimeline(prev => [newTimelineItem, ...prev])
    }
  }

  const handleUploadDocument = () => {
    if (!uploadFile) return

    const newDoc: Document = {
      id: `doc${Date.now()}`,
      name: uploadName || uploadFile.name,
      type: uploadFile.type.includes('pdf')
        ? 'pdf'
        : uploadFile.type.includes('image')
        ? 'image'
        : 'other',
      size: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
      verified: false,
      url: '#'
    }

    setDocuments(prev => [newDoc, ...prev])
    setShowUploadModal(false)
    setUploadFile(null)
    setUploadName('')

    // Add to timeline
    const newTimelineItem: TimelineItem = {
      id: Date.now().toString(),
      title: `Document uploaded: ${newDoc.name}`,
      meta: 'Current User',
      time: new Date().toISOString(),
      icon: <FaUpload />
    }
    setTimeline(prev => [newTimelineItem, ...prev])
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FaFilePdf className='text-red-500' />
      case 'image':
        return <FaFileImage className='text-blue-500' />
      case 'doc':
        return <FaFileWord className='text-blue-700' />
      default:
        return <FaFileImage className='text-gray-500' />
    }
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const progressPercentage =
    (checklist.filter(item => item.completed).length / checklist.length) * 100

  return (
    <div className='space-y-4 sm:space-y-6 px-4 sm:px-0'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100'>
              Visa Case #{id}
            </h1>
            <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1'>
              Manage visa status, documents, and readiness checklist
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Progress Bar */}
      <SurfaceCard className='p-4'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            Checklist Progress
          </span>
          <span className='text-sm font-semibold text-blue-600'>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
          <div
            className='h-full bg-blue-600 rounded-full transition-all duration-300'
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </SurfaceCard>

      {/* Main Grid */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        {/* Left Column - Main Content */}
        <div className='xl:col-span-2 space-y-6'>
          {/* Status Transition Card */}
          <SurfaceCard className='p-5'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              Status Transition
            </h2>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='field-label'>Status</label>
                <select
                  className='field-input'
                  value={status}
                  onChange={event => setStatus(event.target.value as any)}
                >
                  <option value='DRAFT'>DRAFT</option>
                  <option value='SUBMITTED'>SUBMITTED</option>
                  <option value='APPROVED'>APPROVED</option>
                  <option value='REJECTED'>REJECTED</option>
                </select>
              </div>

              {status === 'APPROVED' && (
                <DateInput
                  label='Visa Valid Until *'
                  value={visaValidUntil}
                  onChange={setVisaValidUntil}
                  required
                />
              )}

              {status === 'REJECTED' && (
                <TextInput
                  label='Rejection Reason *'
                  value={rejectionReason}
                  onChange={setRejectionReason}
                  required
                />
              )}
            </div>

            {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}

            <button
              onClick={saveStatus}
              className='mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
            >
              Save Status
            </button>
          </SurfaceCard>

          {/* Documents Card */}
          <SurfaceCard className='p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Documents
              </h2>
              <button
                onClick={() => setShowUploadModal(true)}
                className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700'
              >
                <FaUpload /> Upload
              </button>
            </div>

            {documents.length === 0 ? (
              <EmptyState
                title='No documents'
                description='Upload required documents for visa processing'
                icon={<FaUpload className='text-4xl' />}
              />
            ) : (
              <div className='space-y-3'>
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'
                  >
                    <div className='flex items-center gap-3 min-w-0 flex-1'>
                      <div className='text-xl'>{getDocumentIcon(doc.type)}</div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate'>
                          {doc.name}
                        </p>
                        <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>Uploaded {formatDateTime(doc.uploadedAt)}</span>
                          {doc.verified && (
                            <>
                              <span>•</span>
                              <span className='text-green-600'>
                                Verified by {doc.verifiedBy}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 ml-2'>
                      <button
                        className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
                        title='View'
                      >
                        <FaEye />
                      </button>
                      <button
                        className='p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors'
                        title='Download'
                      >
                        <FaDownload />
                      </button>
                      {!doc.verified && (
                        <button
                          onClick={() => handleVerifyDocument(doc.id)}
                          className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
                          title='Verify'
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className='p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                        title='Delete'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>

          {/* Checklist Card */}
          <SurfaceCard className='p-5'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              Readiness Checklist
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {checklist.map(item => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    item.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={item.completed}
                    onChange={() =>
                      setChecklist(prev =>
                        prev.map(i =>
                          i.id === item.id
                            ? { ...i, completed: !i.completed }
                            : i
                        )
                      )
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span
                    className={`text-sm flex-1 ${
                      item.completed
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.label}
                    {item.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </span>
                  {item.completed && (
                    <FaCheck className='text-green-600 dark:text-green-400 text-sm' />
                  )}
                </label>
              ))}
            </div>
          </SurfaceCard>

          {/* Timeline Card */}
          <SurfaceCard className='p-5'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              Activity Timeline
            </h2>
            <Timeline
              items={timeline.map(item => ({
                ...item,
                time: formatDateTime(item.time)
              }))}
            />
          </SurfaceCard>
        </div>

        {/* Right Column - Sidebar */}
        <div className='space-y-6'>
          {/* Case Summary Card */}
          <SurfaceCard className='p-5'>
            <h3 className='text-base font-semibold text-gray-900 dark:text-gray-100 mb-3'>
              Case Summary
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-sm text-gray-500'>Country</span>
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {caseSummary.country}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-sm text-gray-500'>Visa Type</span>
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {caseSummary.visaType}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-sm text-gray-500'>Appointment</span>
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {caseSummary.appointmentDate} at {caseSummary.appointmentTime}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-sm text-gray-500'>Fees</span>
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {caseSummary.fees}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-sm text-gray-500'>Processing Time</span>
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {caseSummary.processingTime}
                </span>
              </div>
              {status === 'APPROVED' && (
                <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                  <span className='text-sm text-gray-500'>Valid Until</span>
                  <span className='text-sm font-medium text-green-600'>
                    {visaValidUntil || 'Not set'}
                  </span>
                </div>
              )}
            </div>
          </SurfaceCard>

          {/* Quick Stats Card */}
          <SurfaceCard className='p-5'>
            <h3 className='text-base font-semibold text-gray-900 dark:text-gray-100 mb-3'>
              Quick Stats
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              <div className='text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <p className='text-2xl font-bold text-blue-600'>
                  {documents.length}
                </p>
                <p className='text-xs text-gray-500'>Documents</p>
              </div>
              <div className='text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                <p className='text-2xl font-bold text-green-600'>
                  {documents.filter(d => d.verified).length}
                </p>
                <p className='text-xs text-gray-500'>Verified</p>
              </div>
              <div className='text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                <p className='text-2xl font-bold text-purple-600'>
                  {checklist.filter(i => i.completed).length}/{checklist.length}
                </p>
                <p className='text-xs text-gray-500'>Checklist</p>
              </div>
              <div className='text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg'>
                <p className='text-2xl font-bold text-amber-600'>
                  {timeline.length}
                </p>
                <p className='text-xs text-gray-500'>Activities</p>
              </div>
            </div>
          </SurfaceCard>

          {/* Audit Meta */}
          <AuditMeta
            createdBy='Alex Morgan'
            createdAt='2026-03-10T09:20:00Z'
            updatedBy='Visa Team'
            updatedAt='2026-03-11T14:25:00Z'
          />
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Upload Document
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                  setUploadName('')
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <FaXmark className='text-xl' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Select File
                </label>
                <input
                  type='file'
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploadFile(file)
                      setUploadName(file.name)
                    }
                  }}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm'
                  accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Document Name (Optional)
                </label>
                <input
                  type='text'
                  value={uploadName}
                  onChange={e => setUploadName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm'
                  placeholder='Enter custom name'
                />
              </div>

              <p className='text-xs text-gray-500'>
                Accepted formats: PDF, JPG, PNG, DOC (Max 10MB)
              </p>
            </div>

            <div className='flex justify-end gap-3 mt-6'>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                  setUploadName('')
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={!uploadFile}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VisaDetailPage
