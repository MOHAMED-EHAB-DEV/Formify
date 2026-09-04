import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileTextIcon, ArrowRightIcon } from '@/components/ui/svgs/icons';

export default function NotFound() {
  return (
    <main
      role="main"
      className="min-h-screen w-full flex flex-col items-center justify-between bg-background text-foreground relative overflow-hidden px-4 py-8 sm:py-12"
    >
      {/* Ambient background glow accents */}
      <div
        className="pointer-events-none absolute -top-40 inset-s-1/2 -translate-x-1/2 w-150 h-87.5 bg-primary/10 blur-[120px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 inset-e-10 w-112.5 h-75 bg-primary/5 blur-[100px] rounded-full"
        aria-hidden="true"
      />

      {/* Top Brand Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <Image src="/assets/icons/icon.svg" alt="Formify Logo" width={28} height={28} priority />
          <span className="text-base font-bold tracking-tight text-foreground">Formify</span>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-xs">
            Dashboard
          </Button>
        </Link>
      </header>

      {/* Center 404 Experience Card */}
      <section className="w-full max-w-lg mx-auto my-auto z-10 animate-fade-in text-center">
        <div className="rounded-3xl border border-border/70 bg-card/75 backdrop-blur-md p-6 sm:p-10 shadow-sm space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            <span>404 · Form or Page Not Found</span>
          </div>

          {/* Graphical Error Element */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60 border border-border text-primary/80 shadow-inner">
            <FileTextIcon size={40} strokeWidth={1.5} />
          </div>

          {/* Heading and Clarifying Explanation */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Looking for a Form?
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This form may have been <span className="text-foreground font-medium">permanently deleted</span> by its creator, reached its automated close date, or the link has a typo.
            </p>
          </div>

          {/* Helpful Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full">
                Back to Home
              </Button>
            </Link>
            <Link href="/forms/builder" className="w-full sm:w-auto">
              <Button variant="default" size="sm" className="w-full">
                <span>Create Your Own Form</span>
                <ArrowRightIcon size={14} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <footer className="w-full max-w-5xl text-center text-xs text-muted-foreground z-10 pt-4">
        <span>Powered by </span>
        <Link href="/" className="font-semibold text-primary hover:underline underline-offset-4">
          Formify
        </Link>
        <span> · Real-Time Dynamic Forms</span>
      </footer>
    </main>
  );
}
