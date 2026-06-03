import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | App Review",
  description: "The terms that govern your use of App Review.",
};

const LAST_UPDATED = "June 3, 2026";

export default function TermsPage() {
  return (
    <div className="container max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed text-foreground/90">
        <section className="space-y-3">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of App
            Review. By using the platform, you agree to these Terms. If you do not agree,
            please do not use App Review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your Account</h2>
          <p>
            You are responsible for the activity that happens under your account and for
            keeping your login credentials secure. You must provide accurate information and
            be at least the age of majority in your jurisdiction to use App Review.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Content You Submit</h2>
          <p>
            You retain ownership of the reviews, ratings, comments, and apps you submit. By
            posting content, you grant App Review a non-exclusive license to display and
            distribute it on the platform. You are responsible for ensuring your content is
            accurate, lawful, and does not infringe the rights of others.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Acceptable Use</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Do not post false, misleading, or fraudulent reviews.</li>
            <li>Do not upload malware, spam, or harmful content.</li>
            <li>Do not harass, abuse, or impersonate others.</li>
            <li>Do not attempt to manipulate ratings or game the platform.</li>
            <li>Do not violate any applicable law or third-party rights.</li>
          </ul>
          <p>
            For detailed expectations, please review our{" "}
            <a href="/guidelines" className="text-primary hover:underline">
              Community Guidelines
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Moderation and Enforcement</h2>
          <p>
            We may review, hide, or remove content and may suspend or terminate accounts that
            violate these Terms or our Community Guidelines. Reports submitted by users are
            reviewed privately by our moderation team.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Disclaimers</h2>
          <p>
            App Review is provided &quot;as is&quot; without warranties of any kind. Reviews
            and ratings reflect the opinions of individual users and do not represent the
            views of App Review. We do not guarantee the accuracy of any app listing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, App Review is not liable for any indirect,
            incidental, or consequential damages arising from your use of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will revise the
            &quot;Last updated&quot; date above. Continued use of App Review after changes
            means you accept the revised Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>
            If you have questions about these Terms, please reach out through the community or
            support channels available on the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
