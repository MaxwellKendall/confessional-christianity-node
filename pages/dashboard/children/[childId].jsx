import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faArrowLeft,
  faBook,
  faPlus,
  faTrash,
  faExternalLinkAlt,
  faCheck,
  faEdit,
  faShare,
  faUserFriends,
  faCopy,
  faTimes,
  faLink
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/AuthContext';
import { useChild } from '../../../hooks/useChildren';
import { getCatechismById, getCatechismList, calculateProgress, generateCatechismLink } from '../../../lib/catechisms';
import { getSupabaseBrowserClient } from '../../../lib/supabase';
import Header from '../../../components/Header';
import { track, EVENTS } from '../../../lib/analytics';

const AssignCatechismModal = ({ isOpen, onClose, onAssign, existingAssignments }) => {
  const [selectedCatechism, setSelectedCatechism] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const catechisms = getCatechismList();
  const assignedIds = existingAssignments.map(a => a.catechism_id);
  const availableCatechisms = catechisms.filter(c => !assignedIds.includes(c.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCatechism) {
      setError('Please select a catechism');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onAssign(selectedCatechism);
      const catechismInfo = catechisms.find(c => c.id === selectedCatechism);
      track(EVENTS.CATECHISM_ASSIGNED, {
        catechism_id: selectedCatechism,
        catechism_name: catechismInfo?.name,
        total_questions: catechismInfo?.totalQuestions,
      });
      setSelectedCatechism('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign catechism');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl mb-6">Assign Catechism</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {availableCatechisms.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">All catechisms have already been assigned.</p>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {availableCatechisms.map((catechism) => (
                <label
                  key={catechism.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedCatechism === catechism.id 
                      ? 'border-gray-800 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="catechism"
                      value={catechism.id}
                      checked={selectedCatechism === catechism.id}
                      onChange={(e) => setSelectedCatechism(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{catechism.name}</p>
                      <p className="text-sm text-gray-500">{catechism.totalQuestions} questions</p>
                      <p className="text-xs text-gray-400 mt-1">Recommended: {catechism.ageRange} years</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedCatechism}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Assign'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const EditChildModal = ({ isOpen, onClose, child, onUpdate }) => {
  const [name, setName] = useState(child?.name || '');
  const [birthDate, setBirthDate] = useState(child?.birth_date || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (child) {
      setName(child.name || '');
      setBirthDate(child.birth_date || '');
    }
  }, [child]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const fieldsUpdated = [];
      if (name.trim() !== child?.name) fieldsUpdated.push('name');
      if ((birthDate || null) !== child?.birth_date) fieldsUpdated.push('birth_date');
      
      await onUpdate({ name: name.trim(), birth_date: birthDate || null });
      track(EVENTS.CHILD_UPDATED, {
        child_id: child?.id,
        fields_updated: fieldsUpdated,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl mb-6">Edit Child</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editName" className="block text-sm font-medium mb-2">
              Name *
            </label>
            <input
              id="editName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label htmlFor="editBirthDate" className="block text-sm font-medium mb-2">
              Birth Date
            </label>
            <input
              id="editBirthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ShareChildModal = ({ isOpen, onClose, child, guardians, shareInvites, onCreateInvite, onRevokeInvite, onRemoveGuardian, currentUserId }) => {
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [error, setError] = useState('');

  const handleRevokeInvite = async (inviteId) => {
    await onRevokeInvite(inviteId);
    track(EVENTS.SHARE_INVITE_REVOKED, { child_id: child?.id });
  };

  const handleCreateInvite = async () => {
    setCreating(true);
    setError('');
    try {
      await onCreateInvite();
      track(EVENTS.SHARE_INVITE_CREATED, { child_id: child?.id });
    } catch (err) {
      setError(err.message || 'Failed to create invite');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async (inviteCode) => {
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedCode(inviteCode);
      track(EVENTS.SHARE_INVITE_COPIED, { child_id: child?.id });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCode(inviteCode);
      track(EVENTS.SHARE_INVITE_COPIED, { child_id: child?.id });
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleRemoveGuardian = async (userId) => {
    if (!confirm('Are you sure you want to remove this guardian? They will no longer have access to this child.')) {
      return;
    }
    try {
      await onRemoveGuardian(userId);
      track(EVENTS.GUARDIAN_REMOVED, { child_id: child?.id });
    } catch (err) {
      setError(err.message || 'Failed to remove guardian');
    }
  };

  if (!isOpen) return null;

  const otherGuardians = guardians.filter(g => g.user_id !== currentUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl">Share {child?.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <p className="text-gray-600 mb-6">
          Share access with another parent or guardian. They'll be able to view and update catechism progress.
        </p>

        {/* Active Share Links */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faLink} className="text-gray-400" />
            Invite Links
          </h4>
          
          {shareInvites.length === 0 ? (
            <p className="text-sm text-gray-500 mb-3">No active invite links</p>
          ) : (
            <div className="space-y-2 mb-3">
              {shareInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {invite.invite_code}
                    </code>
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(invite.invite_code)}
                      className="px-3 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={copiedCode === invite.invite_code ? faCheck : faCopy} />
                      {copiedCode === invite.invite_code ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleRevokeInvite(invite.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Revoke invite"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleCreateInvite}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 text-gray-600 px-4 py-3 rounded-lg hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
          >
            {creating ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} />
                Create New Invite Link
              </>
            )}
          </button>
        </div>

        {/* Current Guardians */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FontAwesomeIcon icon={faUserFriends} className="text-gray-400" />
            People with Access ({guardians.length})
          </h4>
          
          <div className="space-y-2">
            {guardians.map((guardian) => (
              <div key={guardian.user_id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserFriends} className="text-gray-500 text-sm" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {guardian.user_id === currentUserId ? 'You' : 'Guardian'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{guardian.role}</p>
                  </div>
                </div>
                {guardian.user_id !== currentUserId && guardian.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveGuardian(guardian.user_id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title="Remove guardian"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const CatechismAssignmentCard = ({ assignment, onUpdateProgress, onRemove, onMarkComplete }) => {
  const catechism = getCatechismById(assignment.catechism_id);
  const progress = calculateProgress(assignment.current_question, catechism?.totalQuestions);
  const isCompleted = !!assignment.completed_at;
  const [updating, setUpdating] = useState(false);
  const [inputValue, setInputValue] = useState(String(assignment.current_question));

  // Keep input in sync with assignment changes
  useEffect(() => {
    setInputValue(String(assignment.current_question));
  }, [assignment.current_question]);

  const handleQuestionChange = async (newValue) => {
    const num = parseInt(newValue, 10);
    if (isNaN(num) || num < 1 || num > catechism?.totalQuestions) return;
    if (num === assignment.current_question) return;
    
    setUpdating(true);
    try {
      await onUpdateProgress(assignment.id, num);
      track(EVENTS.CATECHISM_PROGRESS_UPDATED, {
        catechism_id: assignment.catechism_id,
        catechism_name: catechism?.name,
        previous_question: assignment.current_question,
        new_question: num,
        total_questions: catechism?.totalQuestions,
        progress_percentage: Math.round((num / catechism?.totalQuestions) * 100),
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 1 || num > catechism?.totalQuestions) {
      setInputValue(String(assignment.current_question));
      return;
    }
    handleQuestionChange(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-6 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
            <FontAwesomeIcon icon={faBook} className={isCompleted ? 'text-green-600' : 'text-gray-500'} />
          </div>
          <div>
            <h3 className="font-medium">{catechism?.name}</h3>
            <p className="text-sm text-gray-500">{catechism?.totalQuestions} questions</p>
          </div>
        </div>
        {isCompleted && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <FontAwesomeIcon icon={faCheck} />
            Completed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question Control */}
      {!isCompleted && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current Question</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={catechism?.totalQuestions}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              disabled={updating}
              className="w-20 h-10 text-center text-xl font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            />
            <span className="text-gray-400">of {catechism?.totalQuestions}</span>
            {updating && <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400 ml-2" />}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <Link 
          href={generateCatechismLink(assignment.catechism_id, assignment.current_question)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
          onClick={() => {
            track(EVENTS.CATECHISM_QUESTION_CLICKED, {
              catechism_id: assignment.catechism_id,
              catechism_name: catechism?.name,
              question_number: assignment.current_question,
            });
          }}
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          Go to Question {assignment.current_question}
        </Link>
        
        {!isCompleted && assignment.current_question >= catechism?.totalQuestions && (
          <button
            onClick={() => {
              track(EVENTS.CATECHISM_COMPLETED, {
                catechism_id: assignment.catechism_id,
                catechism_name: catechism?.name,
              });
              onMarkComplete(assignment.id);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <FontAwesomeIcon icon={faCheck} />
            Mark Complete
          </button>
        )}
        
        <button
          onClick={() => {
            track(EVENTS.CATECHISM_REMOVED, {
              catechism_id: assignment.catechism_id,
              catechism_name: catechism?.name,
              was_completed: isCompleted,
            });
            onRemove(assignment.id);
          }}
          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm ml-auto"
        >
          <FontAwesomeIcon icon={faTrash} />
          Remove
        </button>
      </div>
    </div>
  );
};

const ChildDetailPage = () => {
  const router = useRouter();
  const { childId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { 
    child, 
    loading: childLoading, 
    guardians,
    shareInvites,
    assignCatechism, 
    updateProgress, 
    markCompleted, 
    removeAssignment, 
    createShareInvite,
    revokeShareInvite,
    removeGuardian,
    refetch 
  } = useChild(childId);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Track child view when loaded
  useEffect(() => {
    if (child && !childLoading) {
      track(EVENTS.CHILD_VIEWED, {
        child_id: child.id,
        is_owner: child.isOwner,
        assignment_count: child.catechism_assignments?.length || 0,
      });
    }
  }, [child?.id, childLoading]);

  const handleOpenShareModal = () => {
    track(EVENTS.SHARE_MODAL_OPENED, { child_id: childId });
    setShowShareModal(true);
  };

  const handleDeleteChild = async () => {
    if (!confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId);
      
      if (error) throw error;
      track(EVENTS.CHILD_DELETED, { child_id: childId });
      router.push('/dashboard');
    } catch (err) {
      alert('Failed to delete: ' + err.message);
      setDeleting(false);
    }
  };

  const handleUpdateChild = async (updates) => {
    const { error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', childId);
    
    if (error) throw error;
    await refetch();
  };

  const getAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (authLoading || childLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-500" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 mb-4">Child not found</p>
        <Link href="/dashboard" className="text-gray-800 underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const assignments = child.catechism_assignments || [];
  const age = getAge(child.birth_date);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{child.name} | Confessional Christianity</title>
      </Head>

      <Header />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Child Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl mb-1">{child.name}</h2>
              {age !== null && (
                <p className="text-gray-500">{age} years old</p>
              )}
              {child.birth_date && (
                <p className="text-sm text-gray-400 mt-1">
                  Born: {new Date(child.birth_date).toLocaleDateString()}
                </p>
              )}
              {/* Show shared status for non-owners */}
              {!child.isOwner && (
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUserFriends} />
                  Shared with you
                </p>
              )}
              {/* Show guardian count for owners */}
              {child.isOwner && guardians.length > 1 && (
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUserFriends} />
                  Shared with {guardians.length - 1} {guardians.length - 1 === 1 ? 'person' : 'people'}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {child.isOwner && (
                <button
                  onClick={handleOpenShareModal}
                  className="p-2 text-blue-500 hover:text-blue-700 rounded-lg hover:bg-blue-50"
                  title="Share"
                >
                  <FontAwesomeIcon icon={faShare} />
                </button>
              )}
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Edit"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              {child.isOwner && (
                <button
                  onClick={handleDeleteChild}
                  disabled={deleting}
                  className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                  title="Delete"
                >
                  {deleting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTrash} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Catechism Assignments */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl">Catechism Assignments</h3>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Assign Catechism</span>
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faBook} className="text-gray-400 text-2xl" />
            </div>
            <h4 className="text-lg text-gray-600 mb-2">No catechisms assigned</h4>
            <p className="text-gray-500 mb-6">
              Assign a catechism to start tracking progress
            </p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Assign First Catechism</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <CatechismAssignmentCard
                key={assignment.id}
                assignment={assignment}
                onUpdateProgress={updateProgress}
                onRemove={removeAssignment}
                onMarkComplete={markCompleted}
              />
            ))}
          </div>
        )}
      </main>

      <AssignCatechismModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={assignCatechism}
        existingAssignments={assignments}
      />

      <EditChildModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        child={child}
        onUpdate={handleUpdateChild}
      />

      {child?.isOwner && (
        <ShareChildModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          child={child}
          guardians={guardians}
          shareInvites={shareInvites}
          onCreateInvite={createShareInvite}
          onRevokeInvite={revokeShareInvite}
          onRemoveGuardian={removeGuardian}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};

export default ChildDetailPage;
