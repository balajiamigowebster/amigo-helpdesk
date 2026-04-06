export default function UserTicketDashboard({ org, portalData, userEmail }) {
  //   const themeColor =
  //     portalData.portalTheme === "orange" ? "bg-orange-500" : "bg-blue-600";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Professional Navbar */}
      <nav className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-8">
          <span className="font-black text-xl tracking-tighter uppercase italic text-gray-800">
            Testing
          </span>
          <a
            href="#"
            className="text-gray-600 font-semibold border-b-2 border-orange-500 pb-1"
          >
            Home
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-[#008CBA] hover:bg-[#007096] text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2 shadow-sm uppercase tracking-wide">
            <span className="text-lg">+</span> Submit a ticket
          </button>

          <div className="flex items-center gap-3 border-l pl-4">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white">
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : "KK"}
            </div>
            <span className="text-sm font-medium text-gray-500 hidden md:block">
              {userEmail || "Guest"}
            </span>
          </div>
        </div>
      </nav>

      {/* Welcome Banner */}
      <div className={`bg-orange-500 py-16 text-center text-white relative`}>
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase drop-shadow-md">
          Welcome HelpDeskTech
        </h1>
      </div>

      {/* Ticket List Section */}
      <main className="max-w-6xl mx-auto w-full px-4 -mt-10 mb-20 z-10">
        <div className="bg-white rounded-xl shadow-xl border overflow-hidden">
          <div className="p-4 border-b flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
            <select className="border rounded px-4 py-2 text-sm font-bold text-gray-600 bg-white shadow-sm outline-none focus:ring-1 focus:ring-orange-500">
              <option>Open Tickets</option>
              <option>Closed Tickets</option>
            </select>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
              />
              <span className="absolute left-3 top-2.5 opacity-40">🔍</span>
            </div>
          </div>

          {/* Empty State Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Summary</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4">Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-slate-50 transition-colors">
                  <td colSpan="5" className="px-6 py-24 text-center space-y-2">
                    <p className="text-gray-600 font-semibold text-base italic uppercase tracking-tighter">
                      You have no open tickets at the moment.
                    </p>
                    <p className="text-gray-400 text-sm">
                      Press "Submit a ticket" if you need to request something
                      from IT.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
