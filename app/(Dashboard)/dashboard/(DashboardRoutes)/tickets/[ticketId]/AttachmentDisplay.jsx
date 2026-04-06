import React, { useState } from "react";
import { FiDownload, FiFileText, FiEye } from "react-icons/fi";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion"; // Framer motion import

const AttachmentDisplay = ({ attachments }) => {
  const [selectedImage, setSelectedImage] = useState(null); // Modal-kaga state

  if (!attachments || !Array.isArray(attachments) || attachments.length === 0)
    return null;

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <>
      <div className="flex gap-3 mt-3 pb-2 flex-nowrap overflow-x-auto custom-scrollbar">
        {attachments.map((file, idx) => {
          const isImage = file.type?.startsWith("image/");
          const isPdf = file.type === "application/pdf";

          return (
            <div
              key={idx}
              className="group relative flex flex-col shrink-0 w-24 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Preview Section */}
              <div className="h-14 w-full bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                {isImage ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : isPdf ? (
                  <BsFileEarmarkPdf size={20} className="text-red-500" />
                ) : (
                  <FiFileText size={20} className="text-blue-500" />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity ">
                  {isImage && (
                    <button
                      className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-transform active:scale-90"
                      onClick={() => setSelectedImage(file)} // Click panna modal open aagum
                    >
                      <FiEye size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(file.url, file.name)}
                    className="p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-transform active:scale-90"
                  >
                    <FiDownload size={14} />
                  </button>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-1.5">
                <p
                  className="text-[9px] font-medium text-gray-700 truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-[7px] text-gray-400 uppercase font-bold tracking-tighter">
                  {file.type?.split("/")[1] || "file"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- FRAMER MOTION MODAL --- */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
            {/* Backdrop (Outside click handle panna intha motion.div use aagum) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)} // Outside click logic
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-zoom-out"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] z-10 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()} // Card-kulla click panna modal close aaga koodathu
            >
              <div className="bg-white p-2 rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt="Full preview"
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
                <div className="mt-3 px-2 pb-1 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {selectedImage.name}
                    </p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                      {selectedImage.type}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleDownload(selectedImage.url, selectedImage.name)
                    }
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    <FiDownload /> Download
                  </button>
                </div>
              </div>

              {/* Hint text */}
              {/* <p className="mt-4 text-white/50 text-xs font-medium">
                Click anywhere outside to close
              </p> */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AttachmentDisplay;
