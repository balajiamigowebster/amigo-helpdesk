import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteOrganizationDialog({ orgName, deleteHook }) {
  const { deleteOrg, isPending, states, handleFirstConfirm } = deleteHook;

  return (
    <>
      {/* First Modal */}
      <AlertDialog
        open={states.isFirstModalOpen}
        onOpenChange={states.setIsFirstModalOpen}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900">
              Delete Organization?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium pt-2">
              Are you sure you want to delete{" "}
              <span className="text-slate-900 font-bold italic">
                "{orgName}"
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="font-bold border-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstConfirm}
              className="bg-slate-900 text-white font-bold border-none shadow-lg px-6"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Overlay */}
      {states.isVerifying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Verifying...
            </p>
          </div>
        </div>
      )}

      {/* Final Modal */}
      <AlertDialog
        open={states.isFinalModalOpen}
        onOpenChange={states.setIsFinalModalOpen}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl bg-white border-t-4 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Final Warning
            </AlertDialogTitle>
            <AlertDialogDescription
              asChild
              className="text-slate-500 font-medium pt-2 space-y-4"
            >
              <div>
                <p>
                  Deleting this is{" "}
                  <span className="text-red-600 font-black underline">
                    PERMANENT
                  </span>
                  .
                </p>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-700 text-xs font-bold leading-relaxed">
                  <ul className="list-disc ml-4 space-y-1 uppercase tracking-tight">
                    <li>All Support Tickets & History</li>
                    <li>Employee Associations & Settings</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel
              disabled={isPending}
              className="px-6 font-bold border-2 border-slate-100"
            >
              Abort Action
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                deleteOrg();
              }}
              className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-lg"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Yes, Delete Everything"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
