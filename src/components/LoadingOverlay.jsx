import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const LoadingOverlay = ({ message = 'Processing... Please wait' }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl max-w-sm w-full flex flex-col items-center justify-center text-center text-white space-y-3">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <Loader2 className="w-6 h-6 text-amber-400 absolute animate-spin" />
        </div>
        
        <div>
          <h4 className="text-base font-bold font-montserrat">{message}</h4>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> High-DPI canvas rendering active
          </p>
        </div>
      </div>
    </div>
  );
};
