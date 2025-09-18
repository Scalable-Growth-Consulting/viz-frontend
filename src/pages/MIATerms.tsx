import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import GlobalFooter from '@/components/GlobalFooter';

const MIATerms: React.FC = () => {
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
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-center">Terms of Service</h1>
            <p className="text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed text-center mx-auto">
              These Terms of Service ("Terms") govern your access to and use of MIA and related services provided by SG Consulting (including Viz and MIA). By accessing or using the Services, you agree to these Terms.
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
                <a href="#acceptance" className="block hover:text-viz-accent">Acceptance of Terms</a>
                <a href="#use" className="block hover:text-viz-accent">Use of the Services</a>
                <a href="#accounts" className="block hover:text-viz-accent">Accounts & Security</a>
                <a href="#ip" className="block hover:text-viz-accent">Intellectual Property</a>
                <a href="#conduct" className="block hover:text-viz-accent">Prohibited Conduct</a>
                <a href="#disclaimer" className="block hover:text-viz-accent">Disclaimers</a>
                <a href="#liability" className="block hover:text-viz-accent">Limitation of Liability</a>
                <a href="#indemn" className="block hover:text-viz-accent">Indemnification</a>
                <a href="#termination" className="block hover:text-viz-accent">Termination</a>
                <a href="#law" className="block hover:text-viz-accent">Governing Law</a>
                <a href="#changes" className="block hover:text-viz-accent">Changes</a>
                <a href="#contact" className="block hover:text-viz-accent">Contact</a>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-9 space-y-6">
            <section id="acceptance" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Acceptance of Terms</h2>
              <p>By accessing or using the Services, you confirm that you can form a binding contract with SG Consulting and that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</p>
            </section>

            <section id="use" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Use of the Services</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>You may use the Services only in compliance with these Terms and all applicable laws.</li>
                <li>You are responsible for maintaining the confidentiality of credentials and for all activities that occur under your account.</li>
                <li>We may modify, suspend, or discontinue the Services or any feature at any time with or without notice.</li>
              </ul>
            </section>

            <section id="accounts" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Accounts & Security</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Provide accurate and complete registration information and keep it up to date.</li>
                <li>Notify us immediately of any unauthorized use or security incident.</li>
                <li>Organization-administered accounts may be controlled by your employer or administrator.</li>
              </ul>
            </section>

            <section id="ip" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Intellectual Property</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>The Services and all related content are owned by SG Consulting or its licensors and are protected by intellectual property laws.</li>
                <li>These Terms do not grant you any right to use our trademarks, logos, or domain names.</li>
                <li>You retain ownership of your content; you grant us rights necessary to operate and improve the Services.</li>
              </ul>
            </section>

            <section id="conduct" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Prohibited Conduct</h2>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>No reverse engineering, scraping, or unauthorized access.</li>
                <li>No misuse that harms, overloads, or disrupts the Services.</li>
                <li>No uploading of unlawful, harmful, or infringing content.</li>
              </ul>
            </section>

            <section id="disclaimer" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Disclaimers</h2>
              <p>The Services are provided on an “as is” and “as available” basis without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.</p>
            </section>

            <section id="liability" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, SG Consulting and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>
            </section>

            <section id="indemn" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Indemnification</h2>
              <p>You agree to indemnify and hold harmless SG Consulting and its affiliates from any claims, liabilities, damages, and expenses arising from your use of the Services or violation of these Terms.</p>
            </section>

            <section id="termination" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Termination</h2>
              <p>We may suspend or terminate your access to the Services at any time for any reason, including violation of these Terms or harmful conduct.</p>
            </section>

            <section id="law" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Governing Law</h2>
              <p>These Terms are governed by the laws of India, without regard to conflict of law principles. Venue for disputes will be the competent courts located in Pune, Maharashtra, India.</p>
            </section>

            <section id="changes" className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-3 text-center">Changes to These Terms</h2>
              <p>We may update these Terms from time to time. Material changes will be communicated within the Services or by email where appropriate. Continued use after changes constitutes acceptance.</p>
            </section>

            <section id="contact" className="rounded-xl border border-black/5 dark:border-white/10 bg-gradient-to-br from-white/80 to-white/50 dark:from-white/10 dark:to-white/5 backdrop-blur p-6 sm:p-7">
              <h2 className="text-xl font-semibold mb-4 text-center">Contact</h2>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-slate-700 dark:text-slate-300">Questions about these Terms? Our team can help.</p>
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

export default MIATerms;
