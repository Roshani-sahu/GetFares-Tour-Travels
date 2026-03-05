const Dashboard = () => {
  return (
    <div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h1>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-bold">1,248</h3>
          <p className="text-sm text-gray-500">Total Leads</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-bold">24</h3>
          <p className="text-sm text-gray-500">New Today</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-bold">$84k</h3>
          <p className="text-sm text-gray-500">Revenue</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-xl font-bold">18%</h3>
          <p className="text-sm text-gray-500">Conversion</p>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;