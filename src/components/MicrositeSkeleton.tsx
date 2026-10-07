import React from 'react';

export default function MicrositeSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      <div className="text-center space-y-2">
        <h2 className="text-base font-bold text-zinc-100 font-mono tracking-wider uppercase">
          Synthesizing Architectural Enclave
        </h2>
        <p className="text-xs text-zinc-400 font-mono">
          Loading live venture parameters from SLN CMS API...
        </p>
      </div>
    </div>
  );
}
