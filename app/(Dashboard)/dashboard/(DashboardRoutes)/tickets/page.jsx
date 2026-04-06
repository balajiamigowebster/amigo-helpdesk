"use client";

import { useState } from "react";
import TicketHeader from "./TicketHeader";
import TicketSidebar from "./TicketSidebar";
import TicketTable from "./TicketTable";

export default function TicketsPage() {
  const [status, setStatus] = useState("open");
  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <TicketSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TicketHeader currenStatus={status} onStatusChange={setStatus} />
        <TicketTable statusFilter={status} />
      </div>
    </div>
  );
}
