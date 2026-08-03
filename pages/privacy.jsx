/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import SEO from '../components/SEO';
import Footer from '../components/Footer';

const Section = ({ title, children }) => (
  <section className="mt-10 first:mt-0">
    <h2 className="text-xl mb-3">{title}</h2>
    {children}
  </section>
);

const PrivacyPg = () => (
  <div className="privacy flex flex-col p-8 w-full mt-24">
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel&family=Cinzel+Decorative&family=Marcellus&display=swap" rel="stylesheet" />
    </Head>
    <SEO title="Confessional Christianity | Privacy Policy" />
    <Link href="/">
      <h1 className="text-center cursor-pointer text-4xl lg:text-5xl mx-auto max-w-2xl">
        Confessional Christianity
      </h1>
    </Link>
    <div className="w-full lg:w-1/2 mt-12 mx-auto pt-10 pb-5 bg-white leading-relaxed">
      <h1 className="text-3xl mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Confessional Christianity — on the web and in the iOS app — does not require an
        account and does not collect personal information.
      </p>

      <Section title="What we don't collect">
        <p className="mb-4">
          There are no user accounts, no names, no email addresses, and no analytics or
          tracking of any kind. We don&apos;t use cookies to identify or follow you across
          visits.
        </p>
      </Section>

      <Section title="Where your progress is stored">
        <p className="mb-4">
          Your place in a catechism — which question you&apos;re on, which milestones
          you&apos;ve reached — is saved only on your own device:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>On the web, in your browser&apos;s local storage.</li>
          <li>
            In the iOS app, in a local, on-device store, shared only with the app&apos;s
            own Home Screen widget so it can show your current question.
          </li>
        </ul>
        <p className="mb-4">
          This data never leaves your device and we have no access to it. Clearing your
          browser data, or deleting the app, deletes it permanently.
        </p>
      </Section>

      <Section title="Third-party services we use">
        <p className="mb-4">
          A couple of features call external services to do their job — neither receives
          anything that identifies you:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Scripture text.</strong> Bible passages are fetched from the ESV API
            (Crossway) by reference (e.g. &ldquo;John 4:24&rdquo;) to display alongside
            catechism questions and confession citations. Most passages are bundled with
            the iOS app itself, so this call is only needed for the rest.
          </li>
          <li>
            <strong>Search.</strong> Searching the confession/catechism library sends your
            search text to Algolia, a search service, using a key restricted to read-only
            search queries. No account or personal data is attached to these requests.
          </li>
        </ul>
      </Section>

      <Section title="Notifications (iOS)">
        <p className="mb-4">
          If you turn on daily practice reminders in the iOS app, the reminder is scheduled
          locally on your device using Apple&apos;s notification system. No reminder data
          is sent anywhere.
        </p>
      </Section>

      <Section title="Children's privacy">
        <p className="mb-4">
          This app is designed for families to use together to catechize children, and by
          design collects no information from anyone, child or adult.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p className="mb-4">
          If this policy changes, the update will be posted on this page.
        </p>
      </Section>

      <Section title="Contact">
        <p className="mb-4">
          Questions about this policy can be sent to{' '}
          <a className="underline italic opacity-70" href="mailto:maxwell.n.kendall@gmail.com">
            maxwell.n.kendall@gmail.com
          </a>.
        </p>
      </Section>
    </div>
    <Footer
        links={[{ link: "HOME", href: "/" }, { link: "BLOG", href: "https://blog.confessionalchristianity.com" }]}
        />
  </div>
);

export default PrivacyPg;
