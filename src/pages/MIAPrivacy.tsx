import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const MIAPrivacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_50%)] text-slate-900 dark:text-slate-100">
      <Header showDataSection={false} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/riz/mia"
            className="inline-flex items-center gap-1 text-sm font-medium text-viz-accent hover:text-viz-accent/80 transition-colors"
          >
            <span>←</span>
            <span>Back to RIZ / MIA</span>
          </Link>
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-center">Privacy Policy</h1>
            <p className="text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed text-center mx-auto">
              How SG Consulting (including Viz and MIA) collects, uses, shares, and protects information when you use our applications, websites, and services.
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
                <a href="#collect" className="block hover:text-viz-accent">Information We Collect</a>
                <a href="#use" className="block hover:text-viz-accent">How We Use Information</a>
                <a href="#legal" className="block hover:text-viz-accent">Legal Basis</a>
                <a href="#retention" className="block hover:text-viz-accent">Data Retention</a>
                <a href="#sharing" className="block hover:text-viz-accent">Sharing & Disclosure</a>
                <a href="#transfers" className="block hover:text-viz-accent">International Transfers</a>
                <a href="#security" className="block hover:text-viz-accent">Security</a>
                <a href="#rights" className="block hover:text-viz-accent">Your Rights</a>
                <a href="#children" className="block hover:text-viz-accent">Children's Privacy</a>
                <a href="#changes" className="block hover:text-viz-accent">Changes</a>
                <a href="#contact" className="block hover:text-viz-accent">Contact</a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            <section id="collect" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Information We Collect</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ul className="text-left">
                  <li><strong>Account & Authentication:</strong> Name, email, organization, and identifiers used to manage your account.</li>
                  <li><strong>Usage & Interaction:</strong> Device/browser metadata, IP, time zone, logs, prompts/queries, and feature interactions to improve quality and reliability.</li>
                  <li><strong>Content You Provide:</strong> Files, datasets, tables, schemas, and configuration you upload or connect.</li>
                  <li><strong>Integrations:</strong> Metadata and tokens needed to operate connected services (e.g., data warehouses/analytics).</li>
                </ul>
              </div>
            </section>

            <section id="use" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">How We Use Information</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Provide, operate, secure, and improve the Services.</li>
                <li>Personalize experience, troubleshoot, and enhance performance.</li>
                <li>Communicate updates, security notices, and support responses.</li>
                <li>Comply with legal obligations and prevent misuse or fraud.</li>
              </ul>
            </section>

            <section id="legal" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Legal Basis for Processing</h2>
              <p>Performance of a contract, legitimate interests, compliance with legal obligations, and consent where required.</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section id="retention" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
                <h2 className="text-xl font-semibold mb-3 text-center">Data Retention</h2>
                <p>We retain personal information only as long as necessary for the purposes described, legal compliance, dispute resolution, and enforcement.</p>
              </section>

              <section id="security" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
                <h2 className="text-xl font-semibold mb-3 text-center">Security</h2>
                <p>We apply administrative, technical, and physical safeguards to protect information. No method is 100% secure; absolute security cannot be guaranteed.</p>
              </section>
            </div>

            <section id="sharing" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Sharing & Disclosure</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li><strong>Service Providers:</strong> Vetted vendors under contract for hosting, auth, analytics, and support.</li>
                <li><strong>Legal:</strong> As required by law, regulation, or to protect rights, users, and the public.</li>
                <li><strong>Business Transfers:</strong> In mergers, acquisitions, or asset sales consistent with this Policy.</li>
              </ul>
            </section>

            <section id="transfers" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">International Data Transfers</h2>
              <p>Data may be processed outside your region. Where required, we use appropriate safeguards (e.g., standard contractual clauses).</p>
            </section>

            <section id="rights" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Your Rights</h2>
              <p>Subject to law, you may access, correct, delete, or restrict processing; object to certain processing; or request portability.</p>
              <div className="mt-4 rounded-lg border border-amber-300/40 bg-amber-50/70 dark:bg-amber-400/10 dark:border-amber-400/30 p-4 text-amber-800 dark:text-amber-200">
                Tip: Organization-managed accounts may require requests via your administrator.
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section id="children" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
                <h2 className="text-xl font-semibold mb-3 text-center">Children's Privacy</h2>
                <p>The Services are not directed to children under 16, and we do not knowingly collect personal information from them.</p>
              </section>

              <section id="changes" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
                <h2 className="text-xl font-semibold mb-3 text-center">Changes to This Policy</h2>
                <p>We may update this Policy. Material changes will be communicated within the Services or by email where appropriate.</p>
              </section>
            </div>

            <section id="contact" className="rounded-xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/50 dark:from-white/10 dark:to-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-4 text-center">Contact</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-slate-700 dark:text-slate-300">Questions about this Policy? Our privacy team can help.</p>
                <a href="mailto:sg@sgconsultingtech.com" className="inline-flex items-center justify-center rounded-lg bg-viz-accent text-white px-4 py-2 text-sm font-medium shadow hover:opacity-90 transition">
                  Email sg@sgconsultingtech.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MIAPrivacy;
