import { useState } from "react";
import {
  FaPlus,
  FaFileImport,
  FaUsers,
  FaCalendarPlus,
  FaFire,
  FaChartLine,
  FaSearch,
  FaChevronDown,
  FaFilter,
  FaEye,
  FaFileInvoiceDollar,
  FaEllipsisV,
} from "react-icons/fa";

const Leads = () => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]
    );
  };

  const leads = [
    {
      id: 1,
      name: "Sarah Connor",
      email: "sarah.c@gmail.com",
      phone: "+1 555 123 4567",
      destination: "Maldives",
      type: "Honeymoon",
      status: "New",
      consultant: "Alex Morgan",
    },
    {
      id: 2,
      name: "John Miller",
      email: "john.m@corp.com",
      phone: "+44 20 7123 4567",
      destination: "Dubai",
      type: "Business",
      status: "Contacted",
      consultant: "Sarah Jenkins",
    },
    {
      id: 3,
      name: "Emily Chen",
      email: "emily.chen@tech.io",
      phone: "+65 9123 4567",
      destination: "Japan",
      type: "Family Trip",
      status: "Quote Sent",
      consultant: "Alex Morgan",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500">
            Manage your potential customers and track conversions.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm">
            <FaFileImport /> Import
          </button>

          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            <FaPlus /> Create Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="All Leads" value="1,248" icon={<FaUsers />} />
        <StatCard title="New Today" value="24" icon={<FaCalendarPlus />} />
        <StatCard title="Hot Leads" value="86" icon={<FaFire />} />
        <StatCard title="Conversion" value="18.5%" icon={<FaChartLine />} />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border shadow-sm">
        {/* Toolbar */}
        <div className="p-4 flex flex-col lg:flex-row justify-between gap-4 border-b">
          {/* Search */}
          <div className="relative w-full lg:w-72">
            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select className="border px-3 py-2 rounded-lg text-sm">
              <option>Status: All</option>
              <option>New</option>
              <option>Contacted</option>
              <option>Qualified</option>
            </select>

            <select className="border px-3 py-2 rounded-lg text-sm">
              <option>Source: All</option>
              <option>Website</option>
              <option>Social Media</option>
            </select>

            <button className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm">
              <FaFilter /> Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="p-3"></th>
                <th className="p-3 text-left">Lead</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Destination</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Consultant</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(lead.id)}
                      onChange={() => toggleRow(lead.id)}
                    />
                  </td>

                  <td className="p-3">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-gray-500">
                      ID: LD-{lead.id}
                    </div>
                  </td>

                  <td className="p-3">
                    <div>{lead.email}</div>
                    <div className="text-xs text-gray-500">{lead.phone}</div>
                  </td>

                  <td className="p-3">
                    <div>{lead.destination}</div>
                    <div className="text-xs text-gray-500">{lead.type}</div>
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      {lead.status}
                    </span>
                  </td>

                  <td className="p-3">{lead.consultant}</td>

                  <td className="p-3">
                    <div className="flex gap-3 text-gray-400">
                      <FaEye className="cursor-pointer hover:text-blue-600" />
                      <FaFileInvoiceDollar className="cursor-pointer hover:text-green-600" />
                      <FaEllipsisV className="cursor-pointer hover:text-gray-700" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t flex justify-between text-sm text-gray-500">
          <span>Showing 1–7 of 1248</span>

          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded">Prev</button>
            <button className="px-3 py-1 border rounded bg-blue-600 text-white">
              1
            </button>
            <button className="px-3 py-1 border rounded">2</button>
            <button className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leads;


/* Stat Card Component */
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500 uppercase">{title}</p>
        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
      </div>

      <div className="text-blue-600 text-xl">{icon}</div>
    </div>
  );
};