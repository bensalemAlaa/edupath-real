import Link from "next/link";
import { LogoMark } from "@/app/components/logo-mark";
import { AssessmentContent } from "@/app/components/assessment-content";

export default function AIAssessmentPage() {
  return (
    <main className="galaxy-landing landing-page relative min-h-screen overflow-x-hidden text-slate-100">
      {/* Immersive background decoration matching the home page */}
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-300/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-8 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute left-[12%] top-[62%] h-56 w-56 rounded-full bg-amber-200/10 blur-3xl" />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
        {/* Simple Navigation Header for Anonymous Users */}
        <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <LogoMark className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              EduPath
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-blue-200/70 hover:text-white transition"
          >
            ← Back Home
          </Link>
        </header>

        {/* The Quiz Content renders directly on the full page without any profile sidebars */}
        <AssessmentContent />
      </div>
    </main>
  );
}
