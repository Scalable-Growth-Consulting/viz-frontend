import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GlobalFooter from '@/components/GlobalFooter';

const MIADataDeletion: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_50%)] text-slate-900 dark:text-slate-100">
      <Header showDataSection={false} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-1 text-sm font-medium text-viz-accent hover:text-viz-accent/80 transition-colors"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-8 mb-8">
          <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-viz-accent/10 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-full bg-viz-accent/10 text-viz-accent px-2.5 py-0.5 text-xs font-medium ring-1 ring-viz-accent/20">
                Policy
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-900/5 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-black/5 dark:ring-white/10">
                Last updated: August 28, 2025
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-center">Data Deletion Policy</h1>
            <p className="text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed text-center mx-auto">
              How SG Consulting (including Viz and MIA) processes deletion requests for personal data and customer content, and what limitations may apply.
            </p>
          </div>
        </section>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sticky TOC (desktop) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">On this page</div>
              <nav className="text-sm space-y-2">
                <a href="#scope" className="block hover:text-viz-accent">Scope</a>
                <a href="#request" className="block hover:text-viz-accent">How to Request Deletion</a>
                <a href="#processing" className="block hover:text-viz-accent">Processing Your Request</a>
                <a href="#limits" className="block hover:text-viz-accent">Limitations & Exceptions</a>
                <a href="#account" className="block hover:text-viz-accent">Account Closure</a>
                <a href="#contact" className="block hover:text-viz-accent">Contact</a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            <section id="scope" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Scope</h2>
              <p>This Policy covers personal information and customer content processed by the Services. Certain data may be retained where required by law, for security or fraud prevention, or to comply with contractual or audit obligations.</p>
            </section>

            <section id="request" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">How to Request Deletion</h2>
              <ol className="list-decimal pl-5 space-y-2 text-left">
                <li>
                  Submit a deletion request from your account email to
                  <a href="mailto:sg@sgconsultingtech.com" className="text-viz-accent hover:underline ml-1">sg@sgconsultingtech.com</a>.
                </li>
                <li>
                  Include your full name, organization, registered account email, and a clear description of what to delete (e.g., account, uploaded datasets, logs).
                </li>
                <li>
                  For security, we may ask you to verify your identity and ownership of the account or workspace.
                </li>
              </ol>
            </section>

            <section id="processing" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Processing Your Request</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>We acknowledge requests within 7 business days and aim to fulfill verified deletion requests within 30 days where feasible.</li>
                <li>Deletion removes specified personal data and customer content from active systems. Backups and archives are purged via normal rotation cycles.</li>
                <li>Some metadata required for billing, audit, or compliance may be retained as required by law or legitimate interests.</li>
              </ul>
            </section>

            <section id="limits" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Limitations & Exceptions</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Retention as necessary to comply with legal obligations, resolve disputes, enforce agreements, maintain security logs, or detect/prevent fraud and abuse.</li>
                <li>Aggregated or de-identified data that does not identify you may be retained for analytics and service improvement.</li>
                <li>Organization accounts may require administrator approval or be handled by your organization.</li>
              </ul>
            </section>

            <section id="account" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Account Closure</h2>
              <p>If you request deletion of your account, we will deactivate and schedule deletion of account credentials and associated content, subject to the limitations above. You may lose access to remaining credits, licenses, or integrations.</p>
            </section>

            <section id="contact" className="rounded-xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/50 dark:from-white/10 dark:to-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-4 text-center">Contact</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-slate-700 dark:text-slate-300">For all data deletion and privacy-related requests, contact our team.</p>
                <a href="mailto:sg@sgconsultingtech.com" className="inline-flex items-center justify-center rounded-lg bg-viz-accent text-white px-4 py-2 text-sm font-medium shadow hover:opacity-90 transition">
                  Email sg@sgconsultingtech.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Global Footer */}
      <GlobalFooter variant="mia" />
    </div>
  );
};

export default MIADataDeletion;
