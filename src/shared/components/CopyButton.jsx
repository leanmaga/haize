'use client';
import { useState } from 'react';
import {
  DocumentDuplicateIcon,
  ShareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function CopyButton({ text, className, shareIcon = false }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      className={`rounded-full p-2 shadow hover:bg-white transition-colors z-10 cursor-pointer ${className}`}
      aria-label="Copiar al portapapeles"
    >
      {copied ? (
        <CheckIcon className="h-5 w-5 text-green-600" />
      ) : shareIcon ? (
        <ShareIcon className="h-5 w-5 text-gray-800" />
      ) : (
        <DocumentDuplicateIcon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  );
}
