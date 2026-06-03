import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | App Review",
  description: "How App Review collects, uses, and protects your information.",
};

const LAST_UPDATED = "June 3, 2026";

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="mt-8 space-y-8 text-sm sm:text-base leading-relaxed text-foreground/90">
        <section className="space-y-3">
          <p>
            This Privacy Policy explains how App Review (&quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) collects, uses, and shares information when you use our website
            and services. By using App Review, you agree to the practices described here.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Account information</span> — your name, email
              address, and profile details provided when you sign in or create an account.
            </li>
            <li>
              <span className="font-medium">Content you create</span> — reviews, ratings,
              comments, discussions, reports, and apps you submit.
            </li>
            <li>
              <span className="font-medium">Usage data</span> — pages you view, searches you
              run, and interactions such as votes, used to improve the platform.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To operate, maintain, and improve App Review.</li>
            <li>To display your reviews, ratings, and profile to other users.</li>
            <li>To personalize content such as trending apps and recommendations.</li>
            <li>To review reports and keep the community safe.</li>
            <li>To communicate with you about your account and important updates.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Sharing of Information</h2>
          <p>
            We do not sell your personal information. Public content you post — such as
            reviews and comments — is visible to others by design. Reports you submit are
            private and visible only to our moderation team. We may share information with
            service providers who help us run the platform, or when required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your Choices</h2>
          <p>
            You can update your profile information at any time from your account settings.
            You may request deletion of your account by contacting us. Note that some
            content may remain visible in aggregated or anonymized form after deletion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Data Security</h2>
          <p>
            We take reasonable measures to protect your information. However, no method of
            transmission or storage is completely secure, and we cannot guarantee absolute
            security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise
            the &quot;Last updated&quot; date above. Continued use of App Review after changes
            means you accept the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please reach out through the
            community or support channels available on the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
