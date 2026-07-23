import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SpillIt",
};

const h2 = "mt-10 font-display text-xl font-bold text-ink-100";
const p = "mt-3 text-sm leading-relaxed text-ink-400";
const ul = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-400";
const strong = "text-ink-100";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Legal
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-100">
        Privacy Policy
      </h1>
      <p className="mt-2 text-xs text-ink-700">
        Last updated: July 23, 2026 &middot; SpillIt is an independent,
        non-commercial project created and operated by Lucky Solanki,
        based in India (&ldquo;SpillIt,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us&rdquo;)
      </p>

      <p className={p}>
        This Privacy Policy explains what information SpillIt collects, how
        we use it, and the choices you have. It applies to our website,
        apps, and the SpillIt game (together, the &ldquo;Service&rdquo;).
      </p>

      <h2 className={h2}>1. Information We Collect</h2>
      <p className={p}>
        <span className={strong}>Account information.</span> When you sign
        up, we collect your email address, a password (stored as a secure
        hash by our authentication provider, Supabase — we never see or
        store your password in plain text), and the display name you
        choose.
      </p>
      <p className={p}>
        <span className={strong}>Gameplay data.</span> If you play in
        online rooms, we store the rooms you create or join, room
        membership, your in-room nickname, forfeit counts, and logs of
        prompts served during a session (type, difficulty tier, and
        whether it resulted in a forfeit) so features like the scoreboard
        and punish mechanic work correctly.
      </p>
      <p className={p}>
        <span className={strong}>Chat messages.</span> Where room chat is
        enabled, we store the messages you send, tied to your account and
        the room, for as long as needed to display them to other room
        members and to support moderation (see &ldquo;Reports&rdquo;
        below).
      </p>
      <p className={p}>
        <span className={strong}>Reports.</span> If you report a prompt or
        message, we store the report, the category you selected, and any
        details you provide, along with your account ID as the reporter.
      </p>
      <p className={p}>
        <span className={strong}>Technical data.</span> Our hosting
        provider (Vercel) and database provider (Supabase) automatically
        log standard technical information such as IP address, browser
        type, and request timestamps, for security and reliability
        purposes.
      </p>
      <p className={p}>
        <span className={strong}>Local mode.</span> If you use SpillIt
        without an account in local/offline mode, gameplay data (player
        names, scores, forfeit counts) stays in your browser and is not
        sent to our servers.
      </p>

      <h2 className={h2}>2. How We Use Your Information</h2>
      <ul className={ul}>
        <li>To create and secure your account, and let you sign in;</li>
        <li>
          To operate core gameplay features — rooms, the bottle-spin
          mechanic, scoreboards, and the punish mechanic;
        </li>
        <li>To display your chosen display name and chat messages to other room members;</li>
        <li>To review and act on reports, including auto-hiding heavily reported messages;</li>
        <li>To maintain the security and integrity of the Service, including detecting abuse;</li>
        <li>To communicate with you about your account (e.g. email confirmation, security notices);</li>
        <li>
          To comply with legal obligations, and to enforce our{" "}
          <a href="/terms" className="text-truth hover:underline">
            Terms of Service
          </a>
          .
        </li>
      </ul>
      <p className={p}>
        We do not use your gameplay or chat content to train third-party
        AI models, and we do not sell your personal information.
      </p>

      <h2 className={h2}>3. Cookies &amp; Similar Technologies</h2>
      <p className={p}>
        We use a small number of essential cookies set by our
        authentication provider to keep you signed in and to keep your
        session valid as you navigate the Service. These are functional,
        not advertising, cookies. We don&apos;t currently use third-party
        advertising or tracking cookies.
      </p>

      <h2 className={h2}>4. How We Share Information</h2>
      <p className={p}>We share information only with:</p>
      <ul className={ul}>
        <li>
          <span className={strong}>Service providers</span> who process
          data on our behalf to run the Service — currently{" "}
          <span className={strong}>Supabase</span> (database, authentication,
          and, if enabled, realtime chat infrastructure) and{" "}
          <span className={strong}>Vercel</span> (application hosting).
          These providers are contractually restricted from using your
          data for their own purposes;
        </li>
        <li>
          <span className={strong}>Other users,</span> to the extent
          inherent to the feature — your display name and chat messages are
          visible to other members of a room you&apos;re in;
        </li>
        <li>
          <span className={strong}>Legal authorities,</span> if required to
          comply with a legal obligation, protect our rights, or protect
          the safety of any person.
        </li>
      </ul>
      <p className={p}>
        We do not sell your personal information to third parties.
      </p>

      <h2 className={h2}>5. Data Retention</h2>
      <p className={p}>
        We retain account and gameplay data for as long as your account is
        active. If you delete your account, we delete or anonymize
        associated personal data within a reasonable period, except where
        we&apos;re required to retain certain records (e.g. reports under
        active review, or data needed for legal compliance) for longer.
      </p>

      <h2 className={h2}>6. Data Security</h2>
      <p className={p}>
        Access to your data is controlled at the database level using
        Postgres Row Level Security, meaning even our own application code
        can only read or write data a given user is authorized to access.
        Passwords are hashed by Supabase Auth, never stored or transmitted
        in plain text. Room passwords, where used, are hashed with bcrypt
        server-side and never exposed to the client. No system is
        perfectly secure, but we design access controls into the database
        layer itself rather than relying solely on application logic.
      </p>

      <h2 className={h2}>7. Your Rights &amp; Choices</h2>
      <p className={p}>
        Depending on where you live, you may have rights to access,
        correct, export, or delete your personal information, or to object
        to or restrict certain processing. You can update your display
        name directly in your account settings. To request deletion of
        your account and associated data, or to exercise any other
        applicable privacy right, contact us at{" "}
        <a href="mailto:spillit.contact@gmail.com" className="text-truth hover:underline">
          spillit.contact@gmail.com
        </a>
        .
      </p>

      <h2 className={h2}>8. Children&apos;s Privacy</h2>
      <p className={p}>
        The Service is not directed at, and account creation is not
        permitted for, children under 13. This applies regardless of
        SpillIt&apos;s in-game &ldquo;Children&rdquo; difficulty tier,
        which refers to a category of party-game prompts intended for
        family-friendly play under adult/parental supervision using local
        mode — it does not mean the Service collects data from, or
        provides accounts to, children under 13. If we learn we have
        collected personal information from a child under 13 without
        appropriate consent, we will delete it. Parents who believe their
        child has provided us information can contact{" "}
        <a href="mailto:spillit.contact@gmail.com" className="text-truth hover:underline">
          spillit.contact@gmail.com
        </a>
        .
      </p>

      <h2 className={h2}>9. International Users &amp; Data Transfers</h2>
      <p className={p}>
        Our infrastructure is hosted via Supabase and Vercel. Based on our
        deployment setup, our database is expected to be hosted in
        Frankfurt, Germany (EU) — please confirm this against Supabase
        Dashboard &rarr; Project Settings &rarr; General &rarr; Region and
        correct this sentence if it differs. Vercel serves the application
        through its global edge network. If you access the Service from
        outside that region, your information may be transferred to,
        stored, and processed in a different country than your own, which
        may have different data protection laws.
      </p>

      <h2 className={h2}>10. Changes to This Policy</h2>
      <p className={p}>
        We may update this Privacy Policy from time to time. If we make
        material changes, we&apos;ll update the &ldquo;Last updated&rdquo;
        date above and, where appropriate, notify you in-app or by email.
      </p>

      <h2 className={h2}>11. Contact</h2>
      <p className={p}>
        Questions about this Privacy Policy or your data? Reach us at{" "}
        <a href="mailto:spillit.contact@gmail.com" className="text-truth hover:underline">
          spillit.contact@gmail.com
        </a>
        .
      </p>
    </main>
  );
}