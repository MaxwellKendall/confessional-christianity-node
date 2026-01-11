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
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../../context/AuthContext';
import { useChild } from '../../../hooks/useChildren';
import { getCatechismById, getCatechismList, calculateProgress, generateCatechismLink } from '../../../lib/catechisms';
import { getSupabaseBrowserClient } from '../../../lib/supabase';

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
      await onUpdate({ name: name.trim(), birth_date: birthDate || null });
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
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} />
          Go to Question {assignment.current_question}
        </Link>
        
        {!isCompleted && assignment.current_question >= catechism?.totalQuestions && (
          <button
            onClick={() => onMarkComplete(assignment.id)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <FontAwesomeIcon icon={faCheck} />
            Mark Complete
          </button>
        )}
        
        <button
          onClick={() => onRemove(assignment.id)}
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
  const { child, loading: childLoading, assignCatechism, updateProgress, markCompleted, removeAssignment, refetch } = useChild(childId);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

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

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <Link href="/">
              <h1 className="cursor-pointer text-xl lg:text-2xl">
                Confessional Christianity
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
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
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Edit"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                onClick={handleDeleteChild}
                disabled={deleting}
                className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                title="Delete"
              >
                {deleting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTrash} />}
              </button>
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
    </div>
  );
};

export default ChildDetailPage;
