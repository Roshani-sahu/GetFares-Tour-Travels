import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaCalendarPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisV,
  FaEye,
  FaFileImport,
  FaFileInvoiceDollar,
  FaFire,
  FaSearch,
  FaPlus,
  FaUsers,
  FaFilter,
  FaTimes
} from 'react-icons/fa'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import SurfaceCard from '../../components/ui/SurfaceCard'

interface Lead {
  id: number
  leadId: string
  name: string
  email: string
  phone: string
  destination: string
  packageName: string
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost'
  priority: 'High' | 'Medium' | 'Low'
  sla: string
  consultant: string
}

const allLeads: Lead[] = [
  {
    id: 1,
    leadId: '#LD-2026-001',
    name: 'Sarah Connor',
    email: 'sarah.c@gmail.com',
    phone: '+1 555 123 4567',
    destination: 'Maldives',
    packageName: 'Honeymoon',
    status: 'New',
    priority: 'High',
    sla: '1h left',
    consultant: 'Alex Morgan'
  },
  {
    id: 2,
    leadId: '#LD-2026-002',
    name: 'John Miller',
    email: 'john.m@corp.com',
    phone: '+44 20 7123',
    destination: 'Dubai',
    packageName: 'Business',
    status: 'Contacted',
    priority: 'Medium',
    sla: '4h left',
    consultant: 'Sarah Jenkins'
  },
  {
    id: 3,
    leadId: '#LD-2026-003',
    name: 'Luna Raymond',
    email: 'luna.r@gmail.com',
    phone: '+1 555 122',
    destination: 'Bali',
    packageName: 'Family',
    status: 'Qualified',
    priority: 'Low',
    sla: 'On time',
    consultant: 'Mike Ross'
  },
  {
    id: 4,
    leadId: '#LD-2026-004',
    name: 'David Roy',
    email: 'david.roy@gmail.com',
    phone: '+91 97322',
    destination: 'Paris',
    packageName: 'Luxury',
    status: 'Lost',
    priority: 'High',
    sla: 'Overdue',
    consultant: 'Alex Morgan'
  }
]

const tabs = ['All', 'New', 'Contacted', 'Qualified', 'Lost'] as const
type Tab = typeof tabs[number]

const Leads: React.FC = () => {
  const [tab, setTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const pageSize = 3
  const nav = useNavigate()

  const filtered = useMemo(
    () =>
      allLeads.filter(
        l =>
          (tab === 'All' || l.status === tab) &&
          `${l.name} ${l.email} ${l.destination} ${l.phone}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [tab, search]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const leads = filtered.slice((page - 1) * pageSize, page * pageSize)

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'Low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Header Section */}
        <div className='flex flex-col gap-4 mb-6'>
          {/* Title and Actions Row */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100'>
                Leads
              </h1>
              <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1'>
                {filtered.length} total •{' '}
                {allLeads.filter(l => l.status === 'New').length} new
              </p>
            </div>

            {/* Action Buttons - Compact on mobile */}
            <div className='flex items-center gap-2'>
              <button
                className='p-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                title='Import Leads'
              >
                <FaFileImport className='text-sm sm:mr-2' />
                <span className='hidden sm:inline'>Import</span>
              </button>

              <button
                onClick={() => nav('/create-lead')}
                className='p-2 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1'
                title='Create Lead'
              >
                <FaPlus className='text-sm sm:mr-2' />
                <span className='hidden sm:inline'>Create</span>
              </button>
            </div>
          </div>

          {/* KPI Cards - Single row scrollable on mobile */}
          <div className='grid grid-cols-4 gap-2 sm:gap-4'>
            <KpiCard
              title='All'
              value={allLeads.length.toString()}
              change='+12%'
              icon={<FaUsers className='text-blue-600' />}
            />
            <KpiCard
              title='New'
              value={allLeads.filter(l => l.status === 'New').length.toString()}
              change='+5'
              icon={<FaCalendarPlus className='text-green-500' />}
            />
            <KpiCard
              title='Hot'
              value={allLeads
                .filter(l => l.priority === 'High')
                .length.toString()}
              change='+3'
              icon={<FaFire className='text-red-500' />}
            />
            <KpiCard
              title='Qualified'
              value={allLeads
                .filter(l => l.status === 'Qualified')
                .length.toString()}
              change='+2'
              icon={<FaFileInvoiceDollar className='text-amber-500' />}
            />
          </div>
        </div>

        {/* Main Card */}
        <SurfaceCard className='overflow-hidden border border-gray-200 dark:border-gray-800'>
          {/* Search and Filter Bar */}
          <div className='p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800'>
            <div className='flex flex-col gap-3'>
              {/* Search and Filter Row */}
              <div className='flex items-center gap-2'>
                <div className='flex-1 relative'>
                  <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400' />
                  <input
                    type='text'
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder='Search leads...'
                    className='w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* Filter Toggle for Mobile */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`lg:hidden p-2.5 rounded-xl border transition-colors ${
                    showFilters
                      ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <FaFilter />
                </button>
              </div>

              {/* Filters - Desktop always visible, Mobile toggleable */}
              <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className='flex flex-col lg:flex-row lg:items-center gap-3'>
                  {/* Tabs */}
                  <div className='flex-1 overflow-x-auto pb-1 scrollbar-hide'>
                    <div className='inline-flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl'>
                      {tabs.map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            setTab(t)
                            setPage(1)
                            setShowFilters(false)
                          }}
                          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                            tab === t
                              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          {t}{' '}
                          {t !== 'All' &&
                            `(${allLeads.filter(l => l.status === t).length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Close filter button on mobile */}
                  {showFilters && (
                    <button
                      onClick={() => setShowFilters(false)}
                      className='lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Leads List */}
          {leads.length === 0 ? (
            <div className='p-8'>
              <EmptyState
                title='No leads found'
                description='Try adjusting your search or filters'
                action={
                  <button
                    onClick={() => {
                      setSearch('')
                      setTab('All')
                    }}
                    className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors'
                  >
                    Clear filters
                  </button>
                }
                icon={<FaUsers className='text-4xl' />}
              />
            </div>
          ) : (
            <>
              {/* Mobile View - Card Layout */}
              <div className='block lg:hidden divide-y divide-gray-100 dark:divide-gray-800'>
                {leads.map((lead, index) => (
                  <div
                    key={lead.id}
                    className={`p-4 space-y-4 ${
                      index !== leads.length - 1
                        ? 'border-b border-gray-100 dark:border-gray-800'
                        : ''
                    }`}
                  >
                    {/* Header Row */}
                    <div className='flex items-start justify-between'>
                      <div className='space-y-1'>
                        <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                          {lead.name}
                        </h3>
                        <p className='text-xs text-gray-500'>{lead.leadId}</p>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>

                    {/* Contact Details */}
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Email
                        </p>
                        <p className='text-xs text-gray-800 dark:text-gray-300 break-all'>
                          {lead.email}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Phone
                        </p>
                        <p className='text-xs text-gray-800 dark:text-gray-300'>
                          {lead.phone}
                        </p>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Destination
                        </p>
                        <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                          {lead.destination}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Package
                        </p>
                        <p className='text-sm text-gray-800 dark:text-gray-300'>
                          {lead.packageName}
                        </p>
                      </div>
                    </div>

                    {/* Priority & Consultant */}
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Priority / SLA
                        </p>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(
                              lead.priority
                            )}`}
                          >
                            {lead.priority}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {lead.sla}
                          </span>
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Consultant
                        </p>
                        <p className='text-sm text-gray-800 dark:text-gray-300'>
                          {lead.consultant}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex justify-end gap-2 pt-2'>
                      <button
                        onClick={() => nav(`/leads/${lead.id}`)}
                        className='p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all'
                        title='View Details'
                      >
                        <FaEye className='text-sm' />
                      </button>
                      <button
                        className='p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all'
                        title='Create Quotation'
                      >
                        <FaFileInvoiceDollar className='text-sm' />
                      </button>
                      <button
                        className='p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all'
                        title='More Options'
                      >
                        <FaEllipsisV className='text-sm' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className='hidden lg:block overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 dark:bg-gray-800/50'>
                    <tr>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        Lead
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        Contact
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        Trip
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        Priority
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        SLA
                      </th>
                      <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        Consultant
                      </th>
                      <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                    {leads.map(lead => (
                      <tr
                        key={lead.id}
                        className='hover:bg-blue-50/40 dark:hover:bg-gray-800/50 transition-colors cursor-pointer'
                        onClick={() => nav(`/leads/${lead.id}`)}
                      >
                        <td className='px-6 py-4'>
                          <p className='font-medium text-gray-900 dark:text-gray-100'>
                            {lead.name}
                          </p>
                          <p className='text-xs text-gray-500'>{lead.leadId}</p>
                        </td>
                        <td className='px-6 py-4'>
                          <p className='text-sm text-gray-800 dark:text-gray-200'>
                            {lead.email}
                          </p>
                          <p className='text-xs text-gray-500'>{lead.phone}</p>
                        </td>
                        <td className='px-6 py-4'>
                          <p className='text-sm text-gray-800 dark:text-gray-200'>
                            {lead.destination}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {lead.packageName}
                          </p>
                        </td>
                        <td className='px-6 py-4'>
                          <StatusBadge status={lead.status} />
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityClass(
                              lead.priority
                            )}`}
                          >
                            {lead.priority}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {lead.sla}
                          </p>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-700 dark:text-gray-300'>
                          {lead.consultant}
                        </td>
                        <td className='px-6 py-4'>
                          <div
                            className='flex justify-end gap-2'
                            onClick={e => e.stopPropagation()}
                          >
                            <button className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors'>
                              <FaEye />
                            </button>
                            <button className='p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg transition-colors'>
                              <FaFileInvoiceDollar />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-gray-800'>
                <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1'>
                  Showing{' '}
                  <span className='font-medium'>
                    {Math.min(filtered.length, (page - 1) * pageSize + 1)}
                  </span>{' '}
                  to{' '}
                  <span className='font-medium'>
                    {Math.min(filtered.length, page * pageSize)}
                  </span>{' '}
                  of <span className='font-medium'>{filtered.length}</span>{' '}
                  results
                </p>

                <div className='flex items-center gap-2 order-1 sm:order-2'>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                  >
                    <FaChevronLeft className='text-sm' />
                  </button>

                  <div className='flex items-center gap-1'>
                    {[...Array(Math.min(3, totalPages))].map((_, i) => {
                      let pageNum = page
                      if (page <= 2) pageNum = i + 1
                      else if (page >= totalPages - 1)
                        pageNum = totalPages - 2 + i
                      else pageNum = page - 1 + i

                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className='p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                  >
                    <FaChevronRight className='text-sm' />
                  </button>
                </div>
              </div>
            </>
          )}
        </SurfaceCard>
      </div>
    </div>
  )
}

// KPI Card Component
const KpiCard = ({
  title,
  value,
  change,
  icon
}: {
  title: string
  value: string
  change: string
  icon: React.ReactNode
}) => (
  <SurfaceCard className='p-3 sm:p-4 hover:shadow-md transition-shadow'>
    <div className='flex items-center justify-between mb-2'>
      <p className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
        {title}
      </p>
      <div className='text-base sm:text-lg'>{icon}</div>
    </div>
    <div className='flex items-end justify-between'>
      <p className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
        {value}
      </p>
      <span className='text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded'>
        {change}
      </span>
    </div>
  </SurfaceCard>
)

export default Leads
