import React from 'react';
import { Modal } from './Modal.js';
import { useTheme } from '../../hooks/useTheme.js';
import { FileText, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentUrl?: string | null;
  employeeName?: string;
}

export const DocumentViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentUrl,
  employeeName
}) => {
  const { isDark } = useTheme();

  if (!documentUrl) return null;

  const isPdf = documentUrl.toLowerCase().endsWith('.pdf');
  const fullUrl = documentUrl.startsWith('http') ? documentUrl : `${window.location.origin}${documentUrl}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Supporting Document ${employeeName ? `- ${employeeName}` : ''}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Actions bar */}
        <div className={`flex items-center justify-between p-3 rounded-xl border ${
          isDark
            ? 'bg-[#33302C] border-[#3D3833] text-stone-300'
            : 'bg-[#F2ECE1] border-[#E2DBD0] text-stone-800'
        }`}>
          <div className="flex items-center space-x-2 text-sm truncate">
            {isPdf ? <FileText className="w-4 h-4 text-blue-500 shrink-0" /> : <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />}
            <span className="truncate">{documentUrl.split('/').pop()}</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Original</span>
            </a>
            <a
              href={fullUrl}
              download
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isDark
                  ? 'bg-[#3D3833] hover:bg-[#4D4740] text-stone-200'
                  : 'bg-[#E2DBD0] hover:bg-[#D6CEC1] text-stone-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>

        {/* Content Preview */}
        <div className={`w-full h-96 border rounded-xl overflow-hidden flex items-center justify-center ${
          isDark ? 'bg-[#22201D] border-[#3D3833]' : 'bg-[#FAF7F2] border-[#E2DBD0]'
        }`}>
          {isPdf ? (
            <iframe
              src={fullUrl}
              className="w-full h-full border-none"
              title="PDF Document Viewer"
            />
          ) : (
            <img
              src={fullUrl}
              alt="Uploaded supporting document"
              className="max-w-full max-h-full object-contain p-2"
              onError={(e) => {
                // Fallback for document loading issue
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
