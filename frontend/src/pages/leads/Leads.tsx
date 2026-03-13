import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaCalendarPlus,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsis,
  FaEye,
  FaFileImport,
  FaFileInvoiceDollar,
  FaFire,
  FaMagnifyingGlass,
  FaPlus,
  FaUsers
} from 'react-icons/fa6'
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
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const pageSize = 3
  const nav = useNavigate()

  const filtered = useMemo(
    () =>
      allLeads.filter(
        l =>
          (tab === 'All' || l.status === tab) &&
          `${l.name} ${l.email} ${l.destination}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [tab, search]
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const leads = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Leads Management
          </h1>
          <p className='mt-1 text-xs sm:text-sm text-gray-500'>
            Manage your potential customers.
          </p>
        </div>
        <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
          <button className='inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'>
            <FaFileImport /> <span className='hidden xs:inline'>Import</span>
          </button>
          <button
            onClick={() => nav('/create-lead')}
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700'
          >
            <FaPlus /> <span className='hidden xs:inline'>Create Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards - Responsive grid */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <Kpi
          title='All Leads'
          value='1248'
          icon={<FaUsers className='text-blue-600 text-lg sm:text-xl' />}
        />
        <Kpi
          title='New Today'
          value='24'
          icon={
            <FaCalendarPlus className='text-green-500 text-lg sm:text-xl' />
          }
        />
        <Kpi
          title='Hot Leads'
          value='86'
          icon={<FaFire className='text-red-500 text-lg sm:text-xl' />}
        />
        <Kpi
          title='Qualified'
          value='220'
          icon={
            <FaFileInvoiceDollar className='text-amber-500 text-lg sm:text-xl' />
          }
        />
      </div>

      {/* Main Card */}
      <SurfaceCard className='p-0 overflow-hidden'>
        {/* Filters Section */}
        <div className='border-b border-gray-100 p-3 sm:p-4 dark:border-gray-800'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            {/* Tabs - Horizontal scroll on mobile */}
            <div className='w-full md:w-auto overflow-x-auto pb-1 scrollbar-hide'>
              <div className='inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800 min-w-max'>
                {tabs.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t)
                      setPage(1)
                    }}
                    className={`rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap ${
                      tab === t
                        ? 'bg-white text-blue-600 dark:bg-gray-700 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className='relative w-full md:w-80'>
              <FaMagnifyingGlass className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400' />
              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className='w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100'
                placeholder='Search...'
              />
            </div>
          </div>
        </div>

        {/* Leads List */}
        {leads.length === 0 ? (
          <div className='p-4 sm:p-6'>
            <EmptyState
              title='No leads yet'
              description='Try a different filter or create your first lead.'
              action={
                <button
                  onClick={() => nav('/create-lead')}
                  className='rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white'
                >
                  Create your first lead
                </button>
              }
              icon={<FaUsers />}
            />
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className='block lg:hidden divide-y divide-gray-100 dark:divide-gray-800'>
              {leads.map(l => (
                <div
                  key={l.id}
                  className='p-4 space-y-3 hover:bg-blue-50/40 dark:hover:bg-gray-800/50 transition-colors'
                >
                  {/* Header with name and status */}
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='font-medium text-gray-900 dark:text-gray-100'>
                        {l.name}
                      </p>
                      <p className='text-xs text-gray-500'>{l.leadId}</p>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>

                  {/* Contact Info */}
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <p className='text-xs text-gray-500'>Email</p>
                      <p className='text-xs text-gray-800 dark:text-gray-300 truncate'>
                        {l.email}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Phone</p>
                      <p className='text-xs text-gray-800 dark:text-gray-300'>
                        {l.phone}
                      </p>
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <p className='text-xs text-gray-500'>Destination</p>
                      <p className='text-xs text-gray-800 dark:text-gray-300'>
                        {l.destination}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Package</p>
                      <p className='text-xs text-gray-800 dark:text-gray-300'>
                        {l.packageName}
                      </p>
                    </div>
                  </div>

                  {/* Priority and Consultant */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          l.priority === 'High'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : l.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}
                      >
                        {l.priority}
                      </span>
                      <span className='text-xs text-gray-500'>{l.sla}</span>
                    </div>
                    <p className='text-xs text-gray-600 dark:text-gray-400'>
                      {l.consultant}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className='flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800'>
                    <button
                      onClick={() => nav(`/leads/${l.id}`)}
                      className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/20'
                    >
                      <FaEye />
                    </button>
                    <button className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-900/20'>
                      <FaFileInvoiceDollar />
                    </button>
                    <button className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'>
                      <FaEllipsis />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table (unchanged) */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full divide-y divide-gray-200 dark:divide-gray-800'>
                <thead className='sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/95'>
                  <tr>
                    <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      Lead
                    </th>
                    <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      Contact
                    </th>
                    <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      Trip
                    </th>
                    <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      Status
                    </th>
                    <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      Priority / SLA
                    </th>
                    <th className='px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      Consultant
                    </th>
                    <th className='px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                  {leads.map(l => (
                    <tr
                      key={l.id}
                      className='group transition-all duration-200 hover:bg-blue-50/40 dark:hover:bg-gray-800/50'
                    >
                      <td className='px-5 py-4'>
                        <p className='font-medium text-gray-900 dark:text-gray-100'>
                          {l.name}
                        </p>
                        <p className='text-xs text-gray-500'>{l.leadId}</p>
                      </td>
                      <td className='px-5 py-4'>
                        <p className='text-sm text-gray-800 dark:text-gray-100'>
                          {l.email}
                        </p>
                        <p className='text-xs text-gray-500'>{l.phone}</p>
                      </td>
                      <td className='px-5 py-4'>
                        <p className='text-sm text-gray-800 dark:text-gray-100'>
                          {l.destination}
                        </p>
                        <p className='text-xs text-gray-500'>{l.packageName}</p>
                      </td>
                      <td className='px-5 py-4'>
                        <StatusBadge status={l.status} />
                      </td>
                      <td className='px-5 py-4'>
                        <p className='text-xs text-gray-600 dark:text-gray-300'>
                          {l.priority}
                        </p>
                        <p className='text-xs text-gray-500'>{l.sla}</p>
                      </td>
                      <td className='px-5 py-4 text-sm text-gray-700 dark:text-gray-200'>
                        {l.consultant}
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex justify-end gap-2 transition-all duration-200'>
                          <button
                            className='rounded-lg border border-gray-200 p-2 text-gray-500 dark:border-gray-700'
                            onClick={() => nav(`/leads/${l.id}`)}
                          >
                            <FaEye />
                          </button>
                          <button className='rounded-lg border border-gray-200 p-2 text-gray-500 dark:border-gray-700'>
                            <FaFileInvoiceDollar />
                          </button>
                          <button className='rounded-lg border border-gray-200 p-2 text-gray-500 dark:border-gray-700'>
                            <FaEllipsis />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 p-4 dark:border-gray-800'>
              <p className='text-xs sm:text-sm text-gray-500 order-2 sm:order-1'>
                Showing {Math.min(filtered.length, (page - 1) * pageSize + 1)}-
                {Math.min(filtered.length, page * pageSize)} of{' '}
                {filtered.length}
              </p>
              <div className='flex gap-2 order-1 sm:order-2'>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className='rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                >
                  <FaChevronLeft />
                </button>
                <span className='rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 min-w-[40px] text-center'>
                  {page}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className='rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
  )
}

// KPI Component - Responsive
const Kpi = ({
  title,
  value,
  icon
}: {
  title: string
  value: string
  icon: React.ReactNode
}) => (
  <SurfaceCard
    hoverable
    className='flex items-center justify-between p-3 sm:p-5'
  >
    <div>
      <p className='text-xs uppercase tracking-wide text-gray-500'>{title}</p>
      <h3 className='mt-1 sm:mt-2 text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100'>
        {value}
      </h3>
    </div>
    <div className='text-xl sm:text-2xl'>{icon}</div>
  </SurfaceCard>
)

export default Leads
