import { Suspense } from "react";
import TicketView from "./TicketView";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TicketView />
    </Suspense>
  );
}
