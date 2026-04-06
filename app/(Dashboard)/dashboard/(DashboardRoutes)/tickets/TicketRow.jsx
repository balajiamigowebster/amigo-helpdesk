"use client";

import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

export default function TicketRow({ ticket }) {
  return (
    <tr className="border-b hover:bg-slate-50 transition">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
            H
          </div>
          <div>
            <p className="font-medium">{ticket.requester}</p>
            <p className="text-xs text-slate-500">{ticket.email}</p>
          </div>
        </div>
      </td>

      <td className="font-medium text-blue-600">{ticket.subject}</td>
      <td className="text-slate-500">unassigned</td>
      <td>
        <Badge variant="secondary" className="text-blue-600">
          Open
        </Badge>
      </td>
      <td className="flex items-center justify-between pr-6">
        <span>{ticket.time}</span>
        <MoreHorizontal className="text-slate-400" size={18} />
      </td>
    </tr>
  );
}
