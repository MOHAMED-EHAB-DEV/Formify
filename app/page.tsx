import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/actions/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  InteractiveHeroDemo,
  LandingFaq,
} from '@/components/LandingInteractive';
import {
  FileTextIcon,
  CheckIcon,
  CheckCircleIcon,
  XIcon,
  ArrowRightIcon,
  DownloadIcon,
  QrCodeIcon,
  ShareIcon,
  BarChartIcon,
  ListIcon,
  StarIcon,
  UploadCloudIcon,
  ClockIcon,
  UsersIcon,
  ActivityIcon,
} from '@/components/ui/svgs/icons';

export const metadata: Metadata = {
  title: 'Formify – Smart Forms Without Paywalls',
  description:
    'The modern alternative to Typeform and Google Forms. Unlimited responses, drag-and-drop builder, instant QR codes, and 1-click CSV export — 100% free.',
};

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/15 selection:text-primary">
      {/* ─── STICKY NAVBAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <FileTextIcon size={18} aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-foreground">
                Formify
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase font-semibold">
                Free & Open
              </Badge>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#demo" className="hover:text-foreground transition-colors">
              Interactive Demo
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#comparison" className="hover:text-foreground transition-colors">
              Comparison
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5">
                  <span>Dashboard</span>
                  <ArrowRightIcon size={14} aria-hidden="true" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="gap-1.5">
                    <span>Start Free</span>
                    <ArrowRightIcon size={14} aria-hidden="true" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* ─── HERO SECTION ───────────────────────────────────────────────── */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div
            aria-hidden="true"
            className="absolute top-0 inset-s-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-primary/10 via-primary/5 to-transparent blur-3xl -z-10 pointer-events-none"
          />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            {/* Value Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card shadow-xs text-xs font-medium text-foreground animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
              <span>Zero Response Caps · 100% Free · No Credit Card Required</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] animate-fade-in">
              Smart Forms Without{' '}
              <span className="bg-linear-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                The Paywall
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in">
              The modern alternative to Typeform and Google Forms. Drag-and-drop question builder, instant QR codes, real-time live sync, and 1-click CSV export.
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={user ? '/dashboard' : '/sign-up'} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-7 text-base shadow-sm">
                  <span>{user ? 'Open Dashboard' : 'Create Free Form'}</span>
                  <ArrowRightIcon size={16} aria-hidden="true" />
                </Button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                  Explore Interactive Demo
                </Button>
              </a>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon size={14} className="text-success" aria-hidden="true" />
                <span>Unlimited form submissions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon size={14} className="text-success" aria-hidden="true" />
                <span>1-Click CSV & Excel ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon size={14} className="text-success" aria-hidden="true" />
                <span>No paywall upgrades</span>
              </div>
            </div>
          </div>

          {/* ─── INTERACTIVE HERO DEMO SHOWCASE ─────────────────────────── */}
          <div id="demo" className="mt-12 md:mt-16 px-4 sm:px-6 scroll-mt-20">
            <InteractiveHeroDemo isAuthenticated={!!user} />
          </div>
        </section>

        {/* ─── VALUE PILLARS / HIGHLIGHTS ─────────────────────────────────── */}
        <section className="py-12 border-y border-border/80 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2 text-center md:text-start">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto md:ms-0">
                  <BarChartIcon size={20} aria-hidden="true" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Zero Response Limits
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Typeform cuts you off at 10 responses/month. Formify never caps your data collection.
                </p>
              </div>

              <div className="space-y-2 text-center md:text-start">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto md:ms-0">
                  <DownloadIcon size={20} aria-hidden="true" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  1-Click CSV Export
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export complete responses with sanitized values, timestamps, and files with one single click.
                </p>
              </div>

              <div className="space-y-2 text-center md:text-start">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto md:ms-0">
                  <QrCodeIcon size={20} aria-hidden="true" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Instant QR & Share
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate sharp QR codes and share straight to WhatsApp, X, Telegram, and LinkedIn.
                </p>
              </div>

              <div className="space-y-2 text-center md:text-start">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto md:ms-0">
                  <ActivityIcon size={20} aria-hidden="true" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Live Sync Engine
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  WebSocket real-time sync streams incoming submissions to your analytics dashboard live.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURE BENTO GRID ─────────────────────────────────────────── */}
        <section id="features" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="secondary" className="text-xs uppercase tracking-wider font-semibold">
              Engineered For Modern Work
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Everything You Need, Nothing You Pay For
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Clean minimalism meets powerhouse form building. Designed for creators, devs, educators, and organizers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Builder */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ListIcon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Drag-and-Drop Form Builder
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Effortlessly reorder questions, configure required flags, set custom placeholders, and write formatted descriptions with Markdown support.
              </p>
            </div>

            {/* Card 2: Field Types */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <StarIcon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                10+ Specialized Question Types
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Support for star ratings, linear scales, ranking matrices, file uploads, multiple choice, checkboxes, dropdowns, dates, and emails.
              </p>
            </div>

            {/* Card 3: File Uploads */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <UploadCloudIcon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Integrated Cloud File Uploads
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Collect resumes, screenshots, PDFs, and media directly from respondents with Cloudinary and Uploadthing integration.
              </p>
            </div>

            {/* Card 4: QR & Sharing */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShareIcon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Multi-Channel Distribution
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Download high-resolution QR codes for print flyers, or distribute with one tap across WhatsApp, X, Reddit, and Telegram.
              </p>
            </div>

            {/* Card 5: Deadlines & Scheduling */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ClockIcon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Automated Close Dates
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Set deadline dates for event RSVPs or job applications. Once reached, Formify automatically closes submissions gracefully.
              </p>
            </div>

            {/* Card 6: Accessible & Mobile First */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <UsersIcon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Accessible & Mobile First
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                WCAG compliant text contrasts, full keyboard navigation, screen reader support, and fluid layout across all mobile devices.
              </p>
            </div>
          </div>
        </section>

        {/* ─── COMPETITOR COMPARISON TABLE ────────────────────────────────── */}
        <section id="comparison" className="py-16 md:py-24 border-y border-border/80 bg-muted/15 scroll-mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
                Transparent Comparison
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                How Formify Compares
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Why makers, researchers, and indie businesses are switching to Formify.
              </p>
            </div>

            {/* Responsive Table Wrapper */}
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3.5 px-4 sm:px-6 text-start">Feature</th>
                    <th className="py-3.5 px-4 sm:px-6 text-start text-primary font-bold">
                      Formify
                    </th>
                    <th className="py-3.5 px-4 sm:px-6 text-start">Typeform</th>
                    <th className="py-3.5 px-4 sm:px-6 text-start">Google Forms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground">Monthly Price</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-success">$0 / Free Forever</td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">$29 - $59 / mo</td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">Free</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground">Free Responses / Month</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-success">Unlimited</td>
                    <td className="py-3.5 px-4 sm:px-6 text-destructive font-semibold">Only 10 responses</td>
                    <td className="py-3.5 px-4 sm:px-6 text-foreground">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground">1-Click CSV Data Export</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-success">
                      <div className="flex items-center gap-1.5">
                        <CheckIcon size={16} className="text-success" aria-hidden="true" />
                        <span>Included Free</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">Paid tier required</td>
                    <td className="py-3.5 px-4 sm:px-6 text-foreground">Via Google Sheets</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground">Built-in QR Code Generation</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-success">
                      <div className="flex items-center gap-1.5">
                        <CheckIcon size={16} className="text-success" aria-hidden="true" />
                        <span>Native Download</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">
                      <XIcon size={16} className="text-muted-foreground/60" aria-hidden="true" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">
                      <XIcon size={16} className="text-muted-foreground/60" aria-hidden="true" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground">Modern Minimalist UI</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-success">
                      <CheckIcon size={16} className="text-success" aria-hidden="true" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-foreground">
                      <CheckIcon size={16} className="text-success" aria-hidden="true" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-destructive font-semibold">Dated (2012 style)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground">File Upload Collection</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-success">
                      <div className="flex items-center gap-1.5">
                        <CheckIcon size={16} className="text-success" aria-hidden="true" />
                        <span>Free (Cloudinary)</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">Paid Plan Only</td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">Requires Google Sign-in</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground">Real-Time WebSocket Sync</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-success">
                      <CheckIcon size={16} className="text-success" aria-hidden="true" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">
                      <XIcon size={16} className="text-muted-foreground/60" aria-hidden="true" />
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">
                      <XIcon size={16} className="text-muted-foreground/60" aria-hidden="true" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── FAQ SECTION ────────────────────────────────────────────────── */}
        <section id="faq" className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="secondary" className="text-xs uppercase tracking-wider font-semibold">
              Common Questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Clear answers with no hidden strings attached.
            </p>
          </div>

          <LandingFaq />
        </section>

        {/* ─── BOTTOM CTA BANNER ──────────────────────────────────────────── */}
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-linear-to-b from-card to-muted/30 p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-lg relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-radial from-primary/10 to-transparent blur-2xl -z-10 pointer-events-none"
            />

            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              Start Free Today
            </Badge>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto">
              Ready to Collect Data Without Arbitrary Limits?
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Create your account in seconds and launch your first questionnaire without a credit card or paywalls.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={user ? '/dashboard' : '/sign-up'} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-8 text-base shadow-sm">
                  <span>{user ? 'Go to Dashboard' : 'Get Started Free'}</span>
                  <ArrowRightIcon size={16} aria-hidden="true" />
                </Button>
              </Link>
              {!user && (
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                    Sign In to Existing Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-8 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <FileTextIcon size={14} aria-hidden="true" />
            </div>
            <span className="font-semibold text-foreground">Formify</span>
            <span>— Smart Forms, Seamless Flow.</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-foreground transition-colors">
              Live Demo
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}