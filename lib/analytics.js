import posthog from 'posthog-js';

// Initialize PostHog (call this once in _app.jsx)
export const initAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll capture manually for more control
      capture_pageleave: true,
    });
  }
};

// ============================================
// EVENT NAME CONSTANTS
// ============================================

export const EVENTS = {
  // Authentication
  SIGN_UP_STARTED: 'sign_up_started',
  SIGN_UP_COMPLETED: 'sign_up_completed',
  SIGN_UP_FAILED: 'sign_up_failed',
  SIGN_IN_STARTED: 'sign_in_started',
  SIGN_IN_COMPLETED: 'sign_in_completed',
  SIGN_IN_FAILED: 'sign_in_failed',
  SIGN_OUT: 'sign_out',

  // Search
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_RESULTS_LOADED: 'search_results_loaded',
  LOAD_MORE_CLICKED: 'load_more_clicked',
  DOCUMENT_EXPANDED: 'document_expanded',
  DOCUMENT_COLLAPSED: 'document_collapsed',

  // Dashboard
  DASHBOARD_VIEWED: 'dashboard_viewed',
  ADD_CHILD_MODAL_OPENED: 'add_child_modal_opened',

  // Children Management
  CHILD_ADDED: 'child_added',
  CHILD_UPDATED: 'child_updated',
  CHILD_DELETED: 'child_deleted',
  CHILD_VIEWED: 'child_viewed',

  // Catechism Tracking (Children)
  CATECHISM_ASSIGNED: 'catechism_assigned',
  CATECHISM_PROGRESS_UPDATED: 'catechism_progress_updated',
  CATECHISM_COMPLETED: 'catechism_completed',
  CATECHISM_REMOVED: 'catechism_removed',
  CATECHISM_QUESTION_CLICKED: 'catechism_question_clicked',

  // My Progress (Personal Catechism Tracking)
  MY_PROGRESS_VIEWED: 'my_progress_viewed',
  MY_CATECHISM_ASSIGNED: 'my_catechism_assigned',
  MY_CATECHISM_PROGRESS_UPDATED: 'my_catechism_progress_updated',
  MY_CATECHISM_COMPLETED: 'my_catechism_completed',
  MY_CATECHISM_REMOVED: 'my_catechism_removed',
  MY_CATECHISM_QUESTION_CLICKED: 'my_catechism_question_clicked',

  // Sharing
  SHARE_MODAL_OPENED: 'share_modal_opened',
  SHARE_INVITE_CREATED: 'share_invite_created',
  SHARE_INVITE_COPIED: 'share_invite_copied',
  SHARE_INVITE_REVOKED: 'share_invite_revoked',
  SHARE_INVITE_VIEWED: 'share_invite_viewed',
  SHARE_INVITE_ACCEPTED: 'share_invite_accepted',
  SHARE_INVITE_INVALID: 'share_invite_invalid',
  GUARDIAN_REMOVED: 'guardian_removed',

  // Navigation
  PAGE_VIEWED: 'page_viewed',
  CONFESSION_VIEWED: 'confession_viewed',
};

// ============================================
// SINGLE TRACK FUNCTION
// ============================================

/**
 * Track an analytics event with PostHog
 * @param {string} eventName - One of the EVENTS constants
 * @param {object} properties - Optional properties to include with the event
 */
export const track = (eventName, properties = {}) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
};

// ============================================
// USER IDENTIFICATION
// ============================================

/**
 * Identify a user in PostHog (call after sign in)
 * @param {string} userId - The user's unique ID
 * @param {object} properties - Optional user properties (email, etc.)
 */
export const identifyUser = (userId, properties = {}) => {
  if (typeof window !== 'undefined' && posthog && userId) {
    posthog.identify(userId, properties);
  }
};

/**
 * Reset user identity (call on sign out)
 */
export const resetUser = () => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset();
  }
};

// Export posthog instance for advanced usage if needed
export { posthog };
