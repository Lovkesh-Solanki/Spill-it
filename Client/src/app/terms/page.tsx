import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — SpillIt",
};

const h2 = "mt-10 font-display text-xl font-bold text-ink-100";
const p = "mt-3 text-sm leading-relaxed text-ink-400";
const ul = "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-400";
const strong = "text-ink-100";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-500">
        Legal
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-100">
        Terms of Service
      </h1>
      <p className="mt-2 text-xs text-ink-700">
        Last updated: July 23, 2026 &middot; SpillIt is an independent,
        non-commercial project created and operated by Lucky Solanki,
        based in India (&ldquo;SpillIt,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us&rdquo;)
      </p>

      <p className={p}>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
        and use of SpillIt, including our website, apps, and the SpillIt
        game itself (together, the &ldquo;Service&rdquo;). By creating an
        account, or by using the Service without an account in local/offline
        mode, you agree to these Terms. If you don&apos;t agree, please
        don&apos;t use the Service.
      </p>

      <h2 className={h2}>1. Eligibility &amp; Age Requirements</h2>
      <p className={p}>
        You must be at least 13 years old to create a SpillIt account. If
        you are under the age of majority in your jurisdiction, you may
        only use the Service with the involvement of a parent or guardian
        where required by local law.
      </p>
      <p className={p}>
        SpillIt organizes prompts into difficulty tiers —{" "}
        <span className={strong}>Children, Teens, Adult,</span> and{" "}
        <span className={strong}>Spicy</span> — intended to help groups
        choose content appropriate to who&apos;s actually in the room. The{" "}
        <span className={strong}>Adult</span> and{" "}
        <span className={strong}>Spicy</span> tiers contain mature,
        suggestive, or romantically/sexually themed prompts and are gated
        behind an in-app age-consent confirmation. By confirming that gate,
        you represent that you are at least 18 years old, or the age of
        legal majority where you live if that is higher, and that everyone
        you are playing with meets that same requirement. SpillIt has no
        way to independently verify age or who is physically present during
        a game session — that responsibility sits with the players.
      </p>

      <h2 className={h2}>2. Your Account</h2>
      <p className={p}>
        When you create an account, you agree to provide accurate
        information (including a working email address) and to keep your
        password secure. You&apos;re responsible for all activity that
        happens under your account. Tell us right away if you believe your
        account has been compromised.
      </p>
      <p className={p}>
        One account per person. Accounts are personal and may not be sold,
        shared, or transferred.
      </p>

      <h2 className={h2}>3. The Service</h2>
      <p className={p}>
        SpillIt provides a digital Truth-or-Dare style party game, playable
        locally on one device (&ldquo;local mode&rdquo;) or, where enabled,
        in online rooms with other account holders (&ldquo;online
        mode&rdquo;), which may include text and/or voice chat. Features
        described as in-progress or upcoming in our documentation are not
        guaranteed to ship on any particular timeline and may change before
        release.
      </p>

      <h2 className={h2}>4. Acceptable Use</h2>
      <p className={p}>You agree not to use the Service to:</p>
      <ul className={ul}>
        <li>
          Harass, threaten, abuse, or discriminate against any other user;
        </li>
        <li>
          Post or transmit content that is illegal, that sexualizes minors
          in any way, or that otherwise violates applicable law;
        </li>
        <li>
          Attempt to circumvent the age-consent gate on any content tier,
          or misrepresent your age;
        </li>
        <li>
          Attempt to gain unauthorized access to another user&apos;s
          account, to our systems, or to data you&apos;re not authorized to
          access, including by bypassing Row Level Security or other access
          controls;
        </li>
        <li>
          Scrape, reverse-engineer, or use automated tools against the
          Service outside of what a documented, official API (if any)
          permits;
        </li>
        <li>
          Interfere with or disrupt the Service, including online rooms or
          chat, for other users.
        </li>
      </ul>
      <p className={p}>
        We may suspend or terminate accounts that violate this section, at
        our discretion, with or without notice depending on severity.
      </p>

      <h2 className={h2}>5. Chat, Reports &amp; Moderation</h2>
      <p className={p}>
        Where online rooms include chat, messages you send are visible to
        other members of that room. Don&apos;t send anything in chat you
        wouldn&apos;t want stored and reviewed — chat content may be
        retained for moderation and safety purposes as described in our{" "}
        <a href="/privacy" className="text-truth hover:underline">
          Privacy Policy
        </a>
        .
      </p>
      <p className={p}>
        You can report a prompt or a chat message you believe violates
        these Terms. Messages that receive enough reports are automatically
        hidden pending review; we may also act on reports manually. Filing
        deliberately false reports is itself a violation of these Terms.
      </p>

      <h2 className={h2}>6. Your Content &amp; License to Us</h2>
      <p className={p}>
        You retain ownership of the display name, chat messages, and any
        other content you submit through the Service (&ldquo;User
        Content&rdquo;). By submitting User Content, you grant us a
        worldwide, non-exclusive, royalty-free license to host, store,
        reproduce, and display that content solely as needed to operate,
        moderate, and improve the Service — for example, showing your chat
        messages to other room members, or reviewing a reported message.
      </p>

      <h2 className={h2}>7. Premium Features &amp; Payments</h2>
      <p className={p}>
        Some visual themes and future features may be offered as paid,
        premium add-ons. Where paid features exist, pricing will be shown
        before purchase, and payments are processed by a third-party
        payment provider — SpillIt does not directly store your payment
        card details. Except where required by law, purchases of digital
        content are final once delivered/unlocked. We&apos;ll describe any
        different refund policy at the point of purchase if one applies.
      </p>

      <h2 className={h2}>8. Intellectual Property</h2>
      <p className={p}>
        The Service — including the SpillIt name and logo, the game
        design, the prompt bank, the theme designs and particle effects,
        and the underlying code — is owned by Lucky Solanki, the creator
        of SpillIt, unless otherwise noted, and protected by intellectual
        property law. These Terms don&apos;t grant you any rights to our
        trademarks or branding. You may use the Service for personal,
        non-commercial entertainment purposes only.
      </p>

      <h2 className={h2}>9. Termination</h2>
      <p className={p}>
        You may stop using the Service and delete your account at any time.
        We may suspend or terminate your access if you violate these Terms,
        if required by law, or if we discontinue the Service or a feature
        of it. Sections that by their nature should survive termination
        (ownership, disclaimers, limitation of liability, governing law)
        will survive.
      </p>

      <h2 className={h2}>10. Disclaimers</h2>
      <p className={p}>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
        AVAILABLE,&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
        IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DON&apos;T WARRANT THAT
        THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT
        CONTENT SUBMITTED BY OTHER USERS WILL BE APPROPRIATE — GAMEPLAY
        PROMPTS AND USER CHAT ARE USED AT YOUR OWN DISCRETION AND RISK.
      </p>

      <h2 className={h2}>11. Limitation of Liability</h2>
      <p className={p}>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
        DAMAGES, OR ANY LOSS OF DATA, GOODWILL, OR PROFITS, ARISING FROM
        YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE
        POSSIBILITY OF SUCH DAMAGES. SPILLIT IS CURRENTLY FREE TO USE, SO
        OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM RELATING TO THE SERVICE IS
        LIMITED TO THE GREATER OF (A) THE AMOUNT YOU ACTUALLY PAID US IN
        THE 12 MONTHS BEFORE THE CLAIM (CURRENTLY ₹0 FOR MOST USERS), OR
        (B) ₹1,000 (ABOUT $12 USD). THIS FLOOR AMOUNT MAY BE REVISITED IF
        AND WHEN SPILLIT INTRODUCES PAID FEATURES.
      </p>

      <h2 className={h2}>12. Indemnification</h2>
      <p className={p}>
        You agree to indemnify and hold Lucky Solanki harmless from any
        claims, damages, or expenses (including reasonable legal fees)
        arising from your violation of these Terms or your misuse of the
        Service.
      </p>

      <h2 className={h2}>13. Governing Law &amp; Disputes</h2>
      <p className={p}>
        These Terms are governed by the laws of India, without regard to
        conflict-of-law principles. Any dispute arising from these Terms or
        the Service will be subject to the jurisdiction of the courts of
        India. This clause reflects where SpillIt is currently operated
        from and may be updated if that changes.
      </p>

      <h2 className={h2}>14. Changes to These Terms</h2>
      <p className={p}>
        We may update these Terms from time to time. If we make material
        changes, we&apos;ll update the &ldquo;Last updated&rdquo; date
        above and, where appropriate, notify you in-app or by email.
        Continuing to use the Service after changes take effect means you
        accept the revised Terms.
      </p>

      <h2 className={h2}>15. Contact</h2>
      <p className={p}>
        Questions about these Terms? Reach us at{" "}
        <a href="mailto:spillit.contact@gmail.com" className="text-truth hover:underline">
          spillit.contact@gmail.com
        </a>
        .
      </p>
    </main>
  );
}