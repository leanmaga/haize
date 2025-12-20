'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function ShareButton({ title, text, url, className }) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  if (!url) {
    url = `${window.location.origin}${pathname}`;
  }

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title,
      text,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`bg-white/80 rounded-full p-2 shadow hover:bg-white transition-colors z-10 cursor-pointer ${className}`}
      aria-label="Compartir"
    >
      {copied ? (
        <CheckIcon className="h-5 w-5 text-green-600" />
      ) : (
        <ShareIcon className="h-5 w-5 text-gray-800" />
      )}
    </button>
  );
}
