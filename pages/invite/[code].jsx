import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faChild,
  faCheck,
  faExclamationTriangle,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useShareInvite } from '../../hooks/useChildren';

const AcceptInvitePage = () => {
  const router = useRouter();
  const { code } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { invite, loading: inviteLoading, error, accepting, acceptInvite } = useShareInvite(code);

  const handleAccept = async () => {
    try {
      const result = await acceptInvite();
      if (result?.success) {
        router.push(`/dashboard/children/${result.child_id}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to accept invite');
    }
  };

  // If not logged in, show sign in prompt
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Head>
          <title>Accept Invite | Confessional Christianity</title>
        </Head>

        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="cursor-pointer text-xl lg:text-2xl">
                Confessional Christianity
              </h1>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faSignInAlt} className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-xl mb-3">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              You need to sign in or create an account to accept this invite and access the shared child profile.
            </p>
            <div className="space-y-3">
              <Link 
                href={`/auth/signin?redirect=/invite/${code}`}
                className="block w-full bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 text-center"
              >
                Sign In
              </Link>
              <Link 
                href={`/auth/signup?redirect=/invite/${code}`}
                className="block w-full border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 text-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (authLoading || inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-500" />
      </div>
    );
  }

  // Error state
  if (error || !invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Head>
          <title>Invalid Invite | Confessional Christianity</title>
        </Head>

        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="cursor-pointer text-xl lg:text-2xl">
                Confessional Christianity
              </h1>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 text-2xl" />
            </div>
            <h2 className="text-xl mb-3">Invalid Invite</h2>
            <p className="text-gray-600 mb-6">
              {error || 'This invite link is invalid, has expired, or has already been used.'}
            </p>
            <Link 
              href="/dashboard"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Accept Invite | Confessional Christianity</title>
      </Head>

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="cursor-pointer text-xl lg:text-2xl">
              Confessional Christianity
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faChild} className="text-green-600 text-2xl" />
          </div>
          <h2 className="text-xl mb-3">You're Invited!</h2>
          <p className="text-gray-600 mb-2">
            You've been invited to help track catechism progress for:
          </p>
          <p className="text-2xl font-medium mb-6">
            {invite.child?.name}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            As a guardian, you'll be able to view and update their catechism progress.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {accepting ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  Accept Invite
                </>
              )}
            </button>
            <Link 
              href="/dashboard"
              className="block w-full border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcceptInvitePage;
