import React from "react";

export interface ModalProps {
  modalTitle: string;
  modalContent: string;
  onClose: () => void;
  onSave: () => void;
}
export default function Modal(modalProps: ModalProps) {
  return (
    <article>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card border border-border p-6 w-96">
          <h2 className="text-xl font-bold mb-4"> {modalProps.modalTitle}</h2>
          <p className="mb-4">{modalProps.modalContent}</p>
          <div className="flex justify-end" gap-2>
            <button
              className="border border-border text-text px-4 py-2 hover:bg-secondary transition-colors"
              onClick={modalProps.onClose}
            >
              Close
            </button>
            <button
              className="bg-error text-white px-4 py-2 ml-2 hover:opacity-90 transition-opacity"
              onClick={modalProps.onSave}
            >
              Yes, I'm sure
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
