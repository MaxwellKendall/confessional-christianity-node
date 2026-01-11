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
  faUser,
  faQuoteLeft
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useMyProgress } from '../../hooks/useMyProgress';
import { getDocumentById, getDocumentsByTradition, calculateProgress, generateDocumentLink } from '../../lib/catechisms';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { track, EVENTS } from '../../lib/analytics';

const AssignConfessionModal = ({ isOpen, onClose, onAssign, existingAssignments }) => {
  const [selectedConfessions, setSelectedConfessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const confessionsByTradition = getDocumentsByTradition();
  const assignedIds = existingAssignments.map(a => a.catechism_id);
  
  const availableByTradition = confessionsByTradition.map(group => ({
    ...group,
    documents: group.documents.filter(d => !assignedIds.includes(d.id)),
  })).filter(group => group.documents.length > 0);
  
  const totalAvailable = availableByTradition.reduce((acc, g) => acc + g.documents.length, 0);

  const toggleConfession = (id) => {
    setSelectedConfessions(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (selectedConfessions.length === 0) return;

    setLoading(true);
    setError('');
    
    try {
      for (const confessionId of selectedConfessions) {
        await onAssign(confessionId);
        const docInfo = getDocumentById(confessionId);
        track(EVENTS.MY_CATECHISM_ASSIGNED, {
          confession_id: confessionId,
          confession_name: docInfo?.name,
          confession_type: docInfo?.type,
          total_items: docInfo?.totalItems,
        });
      }
      setSelectedConfessions([]);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden"
        style={{ height: 'calc(100vh - 64px)', maxHeight: '700px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="px-8 py-6 border-b border-gray-100 shrink-0">
          <h3 className="text-2xl font-medium">Add Confessions</h3>
          <p className="text-gray-500 mt-1">Select one or more to track your progress.</p>
        </div>
        
        {error && (
          <div className="mx-8 mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm shrink-0">
            {error}
          </div>
        )}

        {totalAvailable === 0 ? (
          <div className="text-center py-16 px-8 flex-1 flex flex-col items-center justify-center">
            <p className="text-gray-600 mb-6">You&apos;ve already added all available confessions!</p>
            <button
              onClick={onClose}
              className="px-8 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              {availableByTradition.map((group) => (
                <div key={group.tradition}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    {group.tradition}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.documents.map((doc) => {
                      const isSelected = selectedConfessions.includes(doc.id);
                      return (
                        <div
                          key={doc.id}
                          onClick={() => toggleConfession(doc.id)}
                          className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-amber-500 shadow-lg shadow-amber-500/25 scale-[1.02]' 
                              : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <FontAwesomeIcon icon={faCheck} className="text-amber-600 text-sm" />
                            </div>
                          )}
                          <p className={`font-medium leading-tight ${isSelected ? 'text-black' : 'text-gray-900'}`}>
                            {doc.name}
                          </p>
                          <p className={`text-sm mt-0.5 ${isSelected ? 'text-amber-100' : 'text-gray-500'}`}>
                            {doc.totalItems} {doc.itemLabelPlural.toLowerCase()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Fixed Footer with Buttons */}
            <div className="shrink-0 flex items-center justify-between gap-4 px-8 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <p className="text-sm text-gray-500">
                {selectedConfessions.length === 0 
                  ? 'None selected' 
                  : `${selectedConfessions.length} selected`}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={loading || selectedConfessions.length === 0}
                  className="px-8 py-3 bg-amber-500 text-black rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors shadow-lg shadow-amber-500/25"
                >
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin className="text-black" /> : 'Add'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ConfessionAssignmentCard = ({ assignment, onUpdateProgress, onRemove, onMarkComplete }) => {
  const confession = getDocumentById(assignment.catechism_id);
  const progress = calculateProgress(assignment.current_question, confession?.totalItems);
  const isCompleted = !!assignment.completed_at;
  const [updating, setUpdating] = useState(false);
  const [inputValue, setInputValue] = useState(String(assignment.current_question));

  useEffect(() => {
    setInputValue(String(assignment.current_question));
  }, [assignment.current_question]);

  const handleItemChange = async (newValue) => {
    const num = parseInt(newValue, 10);
    if (isNaN(num) || num < 1 || num > confession?.totalItems) return;
    if (num === assignment.current_question) return;
    
    setUpdating(true);
    try {
      await onUpdateProgress(assignment.id, num);
      track(EVENTS.MY_CATECHISM_PROGRESS_UPDATED, {
        confession_id: assignment.catechism_id,
        confession_name: confession?.name,
        confession_type: confession?.type,
        previous_item: assignment.current_question,
        new_item: num,
        total_items: confession?.totalItems,
        progress_percentage: Math.round((num / confession?.totalItems) * 100),
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 1 || num > confession?.totalItems) {
      setInputValue(String(assignment.current_question));
      return;
    }
    handleItemChange(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const typeColors = {
    catechism: { bg: 'bg-blue-100', text: 'text-blue-700' },
    confession: { bg: 'bg-purple-100', text: 'text-purple-700' },
    theses: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };
  const colors = typeColors[confession?.type] || typeColors.theses;

  return (
    <div className={`bg-white border rounded-lg p-6 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-amber-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100' : 'bg-amber-100'}`}>
            <FontAwesomeIcon icon={faBook} className={isCompleted ? 'text-green-600' : 'text-amber-600'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{confession?.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                {confession?.type}
              </span>
            </div>
            <p className="text-sm text-gray-500">{confession?.totalItems} {confession?.itemLabelPlural?.toLowerCase()}</p>
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
            className={`h-3 rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Item Control */}
      {!isCompleted && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current {confession?.itemLabel}</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={confession?.totalItems}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              disabled={updating}
              className="w-20 h-10 text-center text-xl font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            />
            <span className="text-gray-400">of {confession?.totalItems}</span>
            {updating && <FontAwesomeIcon icon={faSpinner} spin className="text-gray-400 ml-2" />}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <Link 
          href={generateDocumentLink(assignment.catechism_id, assignment.current_question)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-black rounded-lg hover:bg-amber-700 text-sm"
          onClick={() => {
            track(EVENTS.MY_CATECHISM_QUESTION_CLICKED, {
              confession_id: assignment.catechism_id,
              confession_name: confession?.name,
              item_number: assignment.current_question,
            });
          }}
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          Go to {confession?.itemLabel} {assignment.current_question}
        </Link>
        
        {!isCompleted && assignment.current_question >= confession?.totalItems && (
          <button
            onClick={() => {
              track(EVENTS.MY_CATECHISM_COMPLETED, {
                confession_id: assignment.catechism_id,
                confession_name: confession?.name,
              });
              onMarkComplete(assignment.id);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-black rounded-lg hover:bg-green-700 text-sm"
          >
            <FontAwesomeIcon icon={faCheck} />
            Mark Complete
          </button>
        )}
        
        <button
          onClick={() => {
            track(EVENTS.MY_CATECHISM_REMOVED, {
              confession_id: assignment.catechism_id,
              confession_name: confession?.name,
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

const ScriptureVerse = () => {
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white border-b border-amber-100">
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-amber-600 mb-4">2 Peter 3:18</p>
        
        <blockquote className="space-y-2">
          <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Marcellus, serif' }}>
            But grow in the grace and knowledge of our Lord and Savior Jesus Christ.
          </p>
          <p className="text-xl text-amber-800 font-medium leading-relaxed" style={{ fontFamily: 'Marcellus, serif' }}>
            To him be glory both now and forever! Amen.
          </p>
        </blockquote>
      </div>
    </div>
  );
};

const MyProgressPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    assignments, 
    loading: assignmentsLoading, 
    assignCatechism, 
    updateProgress, 
    markCompleted, 
    removeAssignment 
  } = useMyProgress();
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!assignmentsLoading && user) {
      track(EVENTS.MY_PROGRESS_VIEWED, {
        assignment_count: assignments.length,
        active_count: assignments.filter(a => !a.completed_at).length,
        completed_count: assignments.filter(a => a.completed_at).length,
      });
    }
  }, [assignmentsLoading, user, assignments.length]);

  if (authLoading || assignmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-500" />
      </div>
    );
  }

  const activeAssignments = assignments.filter(a => !a.completed_at);
  const completedAssignments = assignments.filter(a => a.completed_at);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>My Progress | Confessional Christianity</title>
      </Head>

      <Header showBranding />

      <ScriptureVerse />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="bg-white border border-amber-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-amber-100">
              <FontAwesomeIcon icon={faUser} className="text-2xl text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl mb-1">My Progress</h1>
              <p className="text-gray-500">Track your journey through the confessions and catechisms</p>
            </div>
          </div>
        </div>

        {/* Active Catechisms */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl">
              {activeAssignments.length > 0 ? 'In Progress' : 'Your Confessions'}
            </h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="group flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-5 py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <FontAwesomeIcon icon={faPlus} className="text-black text-xs" />
              </span>
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50 border border-amber-200 rounded-xl p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FontAwesomeIcon icon={faBook} className="text-amber-600 text-3xl" />
              </div>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                The historic confessions and catechisms are time-tested guides for growing in Christ. 
                Choose a confession or catechism and work through it at your own pace.
              </p>
              <button
                onClick={() => setShowAssignModal(true)}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-8 py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <FontAwesomeIcon icon={faPlus} className="text-black" />
                </span>
                <span className="font-semibold text-lg">Add Your First Confession</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <ConfessionAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onUpdateProgress={updateProgress}
                  onRemove={removeAssignment}
                  onMarkComplete={markCompleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        {completedAssignments.length > 0 && (
          <div>
            <h2 className="text-xl mb-6">Completed</h2>
            <div className="space-y-4">
              {completedAssignments.map((assignment) => (
                <ConfessionAssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onUpdateProgress={updateProgress}
                  onRemove={removeAssignment}
                  onMarkComplete={markCompleted}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <AssignConfessionModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={assignCatechism}
        existingAssignments={assignments}
      />

      <div className="max-w-5xl mx-auto px-4">
        <Footer />
      </div>
    </div>
  );
};

export default MyProgressPage;
