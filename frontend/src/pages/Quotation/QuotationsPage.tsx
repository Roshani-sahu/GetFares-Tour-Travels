import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarDays, FaChevronLeft, FaChevronRight, FaCopy, FaEllipsis, FaEye, FaFileInvoice, FaMagnifyingGlass, FaPlus, FaWhatsapp, FaBell,  FaEnvelope, } from "react-icons/fa6";
import SurfaceCard from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import { validateQuoteTransition } from "../../utils/workflowValidation";
import { quotationsApi } from "../../api/quotations";

type Status = "pending" | "accepted" | "expired" | "rejected" | "draft";
interface Quotation { 
  id: string; 
  quoteNumber: string; 
  customer: string; 
  email: string; 
  destination: string; 
  details: string; 
  total: number; 
  margin: number; 
  status: Status; 
  lastSent: string | null;
  versions?: number;
  sendCount?: number;
  lastViewed?: string;
}

const items: Quotation[] = [
  { id: "1", quoteNumber: "QT-2026-089", customer: "Sarah Jenkins", email: "sarah.j@example.com", destination: "Maldives Retreat", details: "5 Nights - All Inclusive", total: 4250, margin: 12, status: "pending", lastSent: "Mar 9 - Email", versions: 2, sendCount: 3, lastViewed: "Mar 10, 2:30 PM" },
  { id: "2", quoteNumber: "QT-2026-088", customer: "Michael Ross", email: "m.ross@company.com", destination: "Tokyo Business Trip", details: "7 Nights - Hotel Only", total: 2800, margin: 15, status: "accepted", lastSent: "Mar 8 - WhatsApp", versions: 1, sendCount: 1, lastViewed: "Mar 8, 4:15 PM" },
  { id: "3", quoteNumber: "QT-2026-085", customer: "Emma Lewis", email: "emma.l@gmail.com", destination: "Paris Family Vacation", details: "10 Nights - Package", total: 8450, margin: 10, status: "expired", lastSent: "Mar 2 - Email", versions: 3, sendCount: 5, lastViewed: "Mar 3, 9:20 AM" },
  { id: "4", quoteNumber: "Draft", customer: "David Kim", email: "New Lead", destination: "Bali Honeymoon", details: "14 Nights", total: 5100, margin: 0, status: "draft", lastSent: null, versions: 1, sendCount: 0 },
];
const tabs = ["All", "pending", "accepted", "expired", "rejected", "draft"] as const;
const styles: Record<Status, string> = { pending: "bg-amber-100 text-amber-700 border-amber-200", accepted: "bg-green-100 text-green-700 border-green-200", expired: "bg-red-100 text-red-700 border-red-200", rejected: "bg-red-100 text-red-700 border-red-200", draft: "bg-gray-100 text-gray-700 border-gray-200" };

const QuotationsPage: React.FC = () => {
  const nav = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState<string | null>(null);
  const [showSendLogModal, setShowSendLogModal] = useState<string | null>(null);
  const pageSize = 4;

  const sendReminder = async (quotationId: string, type: 'email' | 'sms' | 'whatsapp') => {
    setLoading(true);
    try {
      await quotationsApi.sendReminder(quotationId, type);
      // Update the UI or show success message
      console.log(`${type} reminder sent for quotation ${quotationId}`);
    } catch (error) {
      console.error('Failed to send reminder:', error);
      setError('Failed to send reminder');
    } finally {
      setLoading(false);
    }
  };

  const runAllReminders = async () => {
    setLoading(true);
    try {
      await quotationsApi.runReminders();
      console.log('All reminders processed');
    } catch (error) {
      console.error('Failed to run reminders:', error);
      setError('Failed to run reminders');
    } finally {
      setLoading(false);
    }
  };

  const viewVersions = async (quotationId: string) => {
    try {
      const versions = await quotationsApi.versions(quotationId);
      setShowVersionModal(quotationId);
      // Store versions data for modal display
    } catch (error) {
      console.error('Failed to load versions:', error);
      setError('Failed to load versions');
    }
  };

  const viewSendLogs = async (quotationId: string) => {
    try {
      const logs = await quotationsApi.sendLogs(quotationId);
      setShowSendLogModal(quotationId);
      // Store logs data for modal display
    } catch (error) {
      console.error('Failed to load send logs:', error);
      setError('Failed to load send logs');
    }
  };

  const filtered = useMemo(() => items.filter((q) => (tab === "All" || q.status === tab) && (`${q.quoteNumber} ${q.customer} ${q.destination}`).toLowerCase().includes(search.toLowerCase())), [tab, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const rejectQuotation = () => {
    const reason = window.prompt("Reason is required for REJECTED status.");
    const validationError = validateQuoteTransition("REJECTED", reason ?? "");
    setError(validationError);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quotations</h1><p className="text-sm text-gray-500">Manage, track, and convert quotations faster.</p></div><button onClick={() => nav("/quotations/builder")} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><FaPlus className="mr-2" /> Create Quotation</button></div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ t: "Total Active", v: "142", c: "+12%" }, { t: "Pending", v: "28", c: "Attention" }, { t: "Converted", v: "45", c: "This Month" }, { t: "Value", v: "$342,800", c: "USD" }].map((k) => 
          <SurfaceCard key={k.t} hoverable className="p-5">
            <div className="mb-2 flex justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-500">{k.t}</p>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{k.c}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{k.v}</p>
          </SurfaceCard>
        )}
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={runAllReminders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          <FaBell className="text-sm" />
          {loading ? 'Processing...' : 'Run All Reminders'}
        </button>
      </div>

      <SurfaceCard className="p-0 overflow-hidden">
        {error ? <p className="border-b border-gray-100 px-4 py-2 text-sm text-red-500 dark:border-gray-800">{error}</p> : null}
        <div className="border-b border-gray-100 p-4 dark:border-gray-800"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="inline-flex w-full rounded-xl border border-gray-200 bg-gray-50 p-1 lg:w-auto dark:border-gray-700 dark:bg-gray-800">{tabs.map((t) => <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-white text-blue-600 dark:bg-gray-700" : "text-gray-600 dark:text-gray-300"}`}>{t}</button>)}</div><div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"><div className="relative w-full sm:w-80"><FaMagnifyingGlass className="pointer-events-none absolute left-3 top-3 text-xs text-gray-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="field-input pl-9" placeholder="Search quote, customer, destination" /></div><button className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"><FaCalendarDays className="mr-2" /> Date Range</button></div></div></div>

        {rows.length === 0 ? <div className="p-4"><EmptyState title="No quotations found" description="Try different filters or create a new quotation." icon={<FaFileInvoice />} /></div> : <><div className="overflow-x-auto"><table className="min-w-[980px] w-full divide-y divide-gray-200 dark:divide-gray-800"><thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/95"><tr><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Quote #</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Destination</th><th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th><th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Last Sent</th><th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{rows.map((q) => <tr key={q.id} className="group hover:bg-blue-50/30 dark:hover:bg-gray-800/40"><td className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-300">{q.quoteNumber}</td><td className="px-5 py-4"><p className="text-sm font-medium text-gray-900 dark:text-gray-100">{q.customer}</p><p className="text-xs text-gray-500">{q.email}</p></td><td className="px-5 py-4"><p className="text-sm text-gray-800 dark:text-gray-100">{q.destination}</p><p className="text-xs text-gray-500">{q.details}</p></td><td className="px-5 py-4 text-right"><p className="text-sm font-semibold text-gray-900 dark:text-gray-100">${q.total.toFixed(2)}</p><p className="text-xs text-green-600">Margin {q.margin}%</p></td>                <td className="px-5 py-4 text-center">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${styles[q.status]}`}>{q.status}</span>
                  {q.versions && q.versions > 1 && (
                    <div className="mt-1">
                      <button 
                        onClick={() => viewVersions(q.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        v{q.versions}
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="text-xs text-gray-500">
                    <div>{q.lastSent ?? "Never Sent"}</div>
                    {q.sendCount && q.sendCount > 0 && (
                      <button 
                        onClick={() => viewSendLogs(q.id)}
                        className="text-blue-600 hover:text-blue-800 underline mt-1"
                      >
                        {q.sendCount} sends
                      </button>
                    )}
                    {q.lastViewed && (
                      <div className="text-green-600 mt-1">Viewed: {q.lastViewed}</div>
                    )}
                  </div>
                </td>                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1 transition-all duration-200">
                    <button onClick={() => nav(`/quotations/${q.id}`)} className="rounded-lg border border-gray-200 p-2 text-gray-500 dark:border-gray-700" title="View">
                      <FaEye />
                    </button>
                    <div className="relative group">
                      <button className="rounded-lg border border-gray-200 p-2 text-amber-600 dark:border-gray-700" title="Send Reminder">
                        <FaBell />
                      </button>
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                        <button 
                          onClick={() => sendReminder(q.id, 'email')}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <FaEnvelope /> Email
                        </button>
                        <button 
                          onClick={() => sendReminder(q.id, 'sms')}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <FaEnvelope /> SMS
                        </button>
                        <button 
                          onClick={() => sendReminder(q.id, 'whatsapp')}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <FaWhatsapp /> WhatsApp
                        </button>
                      </div>
                    </div>
                    <button className="rounded-lg border border-gray-200 p-2 text-gray-500 dark:border-gray-700" title="Duplicate">
                      <FaCopy />
                    </button>
                    <button onClick={rejectQuotation} className="rounded-lg border border-gray-200 p-2 text-red-600 dark:border-gray-700" title="More Actions">
                      <FaEllipsis />
                    </button>
                  </div>
                </td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800"><p className="text-sm text-gray-500">Showing {Math.min(filtered.length, (page - 1) * pageSize + 1)}-{Math.min(filtered.length, page * pageSize)} of {filtered.length}</p><div className="flex gap-2"><button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700"><FaChevronLeft /></button><span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{page}</span><button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:opacity-40 dark:border-gray-700"><FaChevronRight /></button></div></div></>}
      </SurfaceCard>
    </div>
  );
};

export default QuotationsPage;

