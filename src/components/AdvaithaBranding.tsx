import React from "react";
import { Phone, Mail, ExternalLink } from "lucide-react";

export function AdvaithaBranding() {
  return (
    <div className="mx-auto mt-14 w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-200/80 bg-card shadow-2xl transition hover:shadow-sky-500/10 dark:border-sky-900/60 dark:bg-card">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Technology &amp; Development Partner
        </span>
        <div className="flex items-center gap-3 text-xs font-medium">
          <a
            href="tel:9490468368"
            className="flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            <Phone className="h-3.5 w-3.5" /> 9490468368
          </a>
          <span className="text-border">|</span>
          <a
            href="mailto:contact@advaitha.co.in"
            className="flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            <Mail className="h-3.5 w-3.5" /> contact@advaitha.co.in
          </a>
        </div>
      </div>

      {/* Actual Image Banner */}
      <div className="relative overflow-hidden bg-white p-2 sm:p-4 dark:bg-slate-950">
        <img
          src="/advaitha-banner.png"
          alt="ADVAITHA Automations - Services, Hardware & Certified Partners"
          className="h-auto w-full rounded-xl object-contain shadow-inner"
        />
      </div>
    </div>
  );
}
