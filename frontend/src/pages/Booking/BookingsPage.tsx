import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowTrendUp,
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
  FaCreditCard,
  FaDownload,
  FaEye,
  FaFileInvoiceDollar,
  FaMagnifyingGlass,
  FaPaperPlane,
  FaPlus,
  FaTriangleExclamation,
  // FaFileText,
  FaMoneyBillWave,
  FaEnvelope,
  
} from "react-icons/fa6";
import SurfaceCard from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import { validateBookingTransition } from "../../utils/workflowValidation";
import { bookingsApi } from "../../api/bookings";

type BookingStatus = "confirmed" | "pending" | "cancelled";
type PaymentStatus = "partial" | "unpaid" | "paid" | "refunded";

interface Booking {
  id: string;
  bookingId: string;
  customer: string;
  destination: string;
  dates: string;
  status: BookingStatus;
  payment: PaymentStatus;
  paid: number;
  total: number;
  documentsReady: number;
  documentsTotal: number;
}

const statusClasses: Record<BookingStatus, string> = {
  confirmed: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900",
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900",
  cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900",
};

const paymentClasses: Record<PaymentStatus, string> = {
  partial: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900",
  unpaid: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900",
  paid: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900",
  refunded: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

const bookings: Booking[] = [
  {
    id: "1",
    bookingId: "BK-2034",
    customer: "Sarah Jenkins",
    destination: "Maldives Retreat",
    dates: "Dec 15 - Dec 20",
    status: "confirmed",
    payment: "partial",
    paid: 1200,
    total: 4250,
    documentsReady: 2,
    documentsTotal: 4,
  },
  {
    id: "2",
    bookingId: "BK-2033",
    customer: "Michael Ross",
    destination: "Dubai Luxury",
    dates: "Jan 10 - Jan 15",
    status: "pending",
    payment: "unpaid",
    paid: 0,
    total: 2800,
    documentsReady: 0,
    documentsTotal: 3,
  },
  {
    id: "3",
    bookingId: "BK-2030",
    customer: "Emma Wilson",
    destination: "Paris & London",
    dates: "Nov 05 - Nov 12",
    status: "confirmed",
    payment: "paid",
    paid: 5400,
    total: 5400,
    documentsReady: 5,
    documentsTotal: 5,
  },
  {
    id: "4",
    bookingId: "BK-2028",
    customer: "James Lee",
    destination: "Tokyo Adventure",
    dates: "Dec 01 - Dec 10",
    status: "cancelled",
    payment: "refunded",
    paid: 0,
    total: 8200,
    documentsReady: 1,
    documentsTotal: 3,
  },
];

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pageSize = 4;

  const handleGenerateInvoice = async (bookingId: string) => {
    setLoading(true);
    try {
      await bookingsApi.generateInvoice(bookingId);
      console.log(`Invoice generated for booking ${bookingId}`);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      setError('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleSendConfirmation = async (bookingId: string) => {
    setLoading(true);
    try {
      await bookingsApi.sendConfirmation(bookingId);
      console.log(`Confirmation sent for booking ${bookingId}`);
    } catch (error) {
      console.error('Failed to send confirmation:', error);
      setError('Failed to send confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (bookingId: string) => {
    const amount = window.prompt('Enter payment amount:');
    if (!amount) return;
    
    setLoading(true);
    try {
      await bookingsApi.recordPayment(bookingId, {
        amount: parseFloat(amount),
        method: 'manual',
        notes: 'Manual payment entry'
      });
      console.log(`Payment recorded for booking ${bookingId}`);
      // Refresh booking data
    } catch (error) {
      console.error('Failed to record payment:', error);
      setError('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const statusMatch = statusFilter === "all" || booking.status === statusFilter;
      const searchMatch =
        booking.bookingId.toLowerCase().includes(search.toLowerCase()) ||
        booking.customer.toLowerCase().includes(search.toLowerCase()) ||
        booking.destination.toLowerCase().includes(search.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const cancelBooking = () => {
    const cancellationReason = window.prompt("Cancellation reason is required for CANCELLED status.");
    const validationError = validateBookingTransition("CANCELLED", cancellationReason ?? "");
    setError(validationError);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor confirmations, payments, and documents from one place.</p>
        </div>
        <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-blue-700">
          <FaPlus className="mr-2" /> New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SurfaceCard hoverable className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-gray-500">Upcoming Trips</p>
            <FaCalendarDays className="text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">24</p>
          <p className="mt-1 text-xs text-green-600"><FaArrowTrendUp className="mr-1 inline" /> 12% this week</p>
        </SurfaceCard>
        <SurfaceCard hoverable className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-gray-500">Unconfirmed</p>
            <FaTriangleExclamation className="text-amber-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">8</p>
          <p className="mt-1 text-xs text-amber-600">Needs immediate attention</p>
        </SurfaceCard>
        <SurfaceCard hoverable className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-gray-500">Pending Payments</p>
            <FaCreditCard className="text-red-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">$12.5k</p>
          <p className="mt-1 text-xs text-gray-500">5 invoices</p>
        </SurfaceCard>
      </div>

      <SurfaceCard className="p-0 overflow-hidden">
        {error ? <p className="border-b border-gray-100 px-4 py-2 text-sm text-red-500 dark:border-gray-800">{error}</p> : null}
        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full sm:w-80">
                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-3 text-xs text-gray-400" />
                <input
                  className="field-input pl-9"
                  placeholder="Search booking, customer, destination"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <select
                className="field-input w-full sm:w-44"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "all" | BookingStatus);
                  setPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
              <FaDownload className="mr-2" /> Export
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No bookings found"
              description="Try changing search or filters."
              icon={<FaCalendarDays />}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/95">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Booking ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Dates</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Payment</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Docs</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((booking) => (
                    <tr key={booking.id} className="group transition-all duration-200 hover:bg-blue-50/30 dark:hover:bg-gray-800/40">
                      <td className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-300">#{booking.bookingId}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{booking.customer}</p>
                        <p className="text-xs text-gray-500">{booking.destination}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-200">{booking.dates}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${paymentClasses[booking.payment]}`}>
                            {booking.payment}
                          </span>
                          {booking.payment === 'partial' || booking.payment === 'unpaid' ? (
                            <button 
                              onClick={() => handleRecordPayment(booking.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                              title="Record Payment"
                            >
                              +Pay
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">${booking.paid.toLocaleString()} / ${booking.total.toLocaleString()}</p>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full" 
                            style={{ width: `${(booking.paid / booking.total) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${booking.documentsReady === booking.documentsTotal ? 'text-green-600' : 'text-amber-600'}`}>
                            {booking.documentsReady}/{booking.documentsTotal} ready
                          </span>
                          <button 
                            onClick={() => navigate(`/bookings/${booking.id}/documents`)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                            title="View Documents"
                          >
                            View
                          </button>
                        </div>
                        {booking.documentsReady < booking.documentsTotal && (
                          <p className="text-xs text-red-500 mt-1">Missing {booking.documentsTotal - booking.documentsReady} docs</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1 transition-all duration-200">
                          <button
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleGenerateInvoice(booking.id)}
                            disabled={loading}
                            className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-900/20 disabled:opacity-50"
                            title="Generate Invoice"
                          >
                            <FaFileInvoiceDollar />
                          </button>
                          <button 
                            onClick={() => handleSendConfirmation(booking.id)}
                            disabled={loading}
                            className="rounded-lg border border-gray-200 p-2 text-green-600 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-900/20 disabled:opacity-50"
                            title="Send Confirmation"
                          >
                            <FaPaperPlane />
                          </button>
                          <div className="relative group">
                            <button className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                              <FaEnvelope />
                            </button>
                            <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                              <button 
                                onClick={() => navigate(`/bookings/${booking.id}/documents`)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <FaEnvelope /> Documents
                              </button>
                              <button 
                                onClick={() => navigate(`/bookings/${booking.id}/payments`)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <FaMoneyBillWave /> Payments
                              </button>
                              <button 
                                onClick={cancelBooking}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                              >
                                Cancel Booking
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
              <p className="text-sm text-gray-500">Showing {Math.min(filtered.length, (page - 1) * pageSize + 1)}-{Math.min(filtered.length, page * pageSize)} of {filtered.length}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                >
                  <FaChevronLeft />
                </button>
                <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{page}</span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </SurfaceCard>
    </div>
  );
};

export default BookingsPage;
