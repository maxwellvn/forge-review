import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines | App Review",
  description: "The standards that keep the App Review community helpful and trustworthy.",
};

const LAST_UPDATED = "June 3, 2026";

export default function GuidelinesPage() {
  return (
    <div className="container max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Community Guidelines</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed text-foreground/90">
        <section className="space-y-3">
          <p>
            App Review works because of a community that shares honest, helpful feedback.
            These guidelines keep the platform trustworthy for everyone. By participating, you
            agree to follow them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Write Honest Reviews</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Share your genuine, first-hand experience with an app.</li>
            <li>Be specific — explain what worked, what didn&apos;t, and why.</li>
            <li>Do not post fake reviews or reviews in exchange for compensation.</li>
            <li>Do not post duplicate reviews to inflate or lower a rating.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Be Respectful</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Critique the app, not the person behind it.</li>
            <li>No harassment, hate speech, threats, or personal attacks.</li>
            <li>Keep discussions constructive, even in disagreement.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Keep It Safe and Legal</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Do not submit apps that contain malware or security risks.</li>
            <li>Do not post illegal content or infringe others&apos; intellectual property.</li>
            <li>Do not share other people&apos;s private information.</li>
            <li>Do not post spam, scams, or misleading links.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Submitting Apps</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate titles, descriptions, and categories.</li>
            <li>Use screenshots and links that genuinely represent the app.</li>
            <li>Only submit apps you have the right to list.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Reporting Problems</h2>
          <p>
            If you see content or an app that breaks these guidelines, use the report button
            on the app page. Reports are private and reviewed by our moderation team. Flagging
            an app does not affect its visibility — it simply alerts us to take a closer look.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Enforcement</h2>
          <p>
            Content that violates these guidelines may be hidden or removed, and repeat or
            serious violations may result in account suspension. We aim to be fair and
            consistent, and we review context before acting.
          </p>
        </section>
      </div>
    </div>
  );
}
