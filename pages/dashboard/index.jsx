import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faPlus, 
  faBook,
  faArrowRight,
  faChild,
  faUserFriends,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useChildren } from '../../hooks/useChildren';
import { useMyProgress } from '../../hooks/useMyProgress';
import { getCatechismById, getDocumentById, calculateProgress } from '../../lib/catechisms';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { track, EVENTS } from '../../lib/analytics';

const AddChildModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await onAdd(name.trim(), birthDate || null);
      track(EVENTS.CHILD_ADDED, {
        child_id: result?.id,
        has_birth_date: !!birthDate,
      });
      setName('');
      setBirthDate('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add child');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl mb-6">Add Child</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="childName" className="block text-sm font-medium mb-2">
              Name *
            </label>
            <input
              id="childName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Child's name"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
              Birth Date (optional)
            </label>
            <input
              id="birthDate"
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
              {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScriptureVerse = () => {
  return (
    <div className="bg-gradient-to-b from-amber-50 to-white border-b border-amber-100">
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-amber-700 mb-6">
          Deuteronomy 6:4–9
        </p>
        
        <blockquote className="space-y-4">
          <p className="text-gray-800 leading-relaxed text-lg" style={{ fontFamily: 'Marcellus, serif' }}>
            <span className="text-amber-800 font-semibold">"Hear, O Israel:</span> The <span className="small-caps">Lord</span> our God, the <span className="small-caps">Lord</span> is one. 
            You shall love the <span className="small-caps">Lord</span> your God with all your heart and with all your soul 
            and with all your might.
          </p>
          
          <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Marcellus, serif' }}>
            And these words that I command you today shall be on your heart. 
            <em className="text-amber-900"> You shall teach them diligently to your children</em>, 
            and shall talk of them when you sit in your house, and when you walk by the way, 
            and when you lie down, and when you rise.
          </p>
          
          <p className="text-gray-600 leading-relaxed text-sm" style={{ fontFamily: 'Marcellus, serif' }}>
            You shall bind them as a sign on your hand, and they shall be as frontlets between your eyes. 
            You shall write them on the doorposts of your house and on your gates."
          </p>
        </blockquote>
        
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-amber-300"></span>
          <span className="text-amber-400 text-lg">✦</span>
          <span className="h-px w-12 bg-amber-300"></span>
        </div>
      </div>
    </div>
  );
};

const MyProgressCard = ({ assignments }) => {
  const activeAssignment = assignments.find(a => !a.completed_at);
  const completedCount = assignments.filter(a => a.completed_at).length;
  const activeDocument = activeAssignment ? getDocumentById(activeAssignment.catechism_id) : null;

  return (
    <Link href="/dashboard/me">
      <div className="bg-white border border-amber-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50">
              <FontAwesomeIcon icon={faUser} className="text-xl text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">My Progress</h3>
              <p className="text-sm text-gray-500">Confessions &amp; catechisms</p>
            </div>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
        </div>

        {activeAssignment && activeDocument ? (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FontAwesomeIcon icon={faBook} className="text-amber-500" />
              <span>{activeDocument.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${calculateProgress(
                      activeAssignment.current_question, 
                      activeDocument.totalItems
                    )}%` 
                  }}
                />
              </div>
              <span className="text-sm text-gray-500">
                {activeDocument.itemLabel} {activeAssignment.current_question}
              </span>
            </div>
          </div>
        ) : assignments.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-green-600">{completedCount} confession{completedCount !== 1 ? 's' : ''} completed!</p>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">Start your confession journey</p>
          </div>
        )}
      </div>
    </Link>
  );
};

const ChildCard = ({ child }) => {
  const assignments = child.catechism_assignments || [];
  const activeAssignment = assignments.find(a => !a.completed_at);
  const isShared = !child.isOwner;
  
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

  const age = getAge(child.birth_date);

  return (
    <Link href={`/dashboard/children/${child.id}`}>
      <div className={`bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer ${isShared ? 'border-blue-200' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isShared ? 'bg-blue-50' : 'bg-gray-100'}`}>
              <FontAwesomeIcon icon={isShared ? faUserFriends : faChild} className={`text-xl ${isShared ? 'text-blue-500' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="text-lg font-medium">{child.name}</h3>
              {age !== null && (
                <p className="text-sm text-gray-500">{age} years old</p>
              )}
              {isShared && (
                <p className="text-xs text-blue-600 mt-0.5">Shared with you</p>
              )}
            </div>
          </div>
          <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
        </div>

        {activeAssignment ? (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <FontAwesomeIcon icon={faBook} className="text-gray-400" />
              <span>{getCatechismById(activeAssignment.catechism_id)?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${calculateProgress(
                      activeAssignment.current_question, 
                      getCatechismById(activeAssignment.catechism_id)?.totalQuestions
                    )}%` 
                  }}
                />
              </div>
              <span className="text-sm text-gray-500">
                Q{activeAssignment.current_question}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">No catechism assigned</p>
          </div>
        )}
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { children, loading: childrenLoading, addChild } = useChildren();
  const { assignments: myAssignments, loading: myProgressLoading } = useMyProgress();
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Track dashboard view when children load
  useEffect(() => {
    if (!childrenLoading && !myProgressLoading && user) {
      track(EVENTS.DASHBOARD_VIEWED, {
        child_count: children.length,
        owned_count: children.filter(c => c.isOwner).length,
        shared_count: children.filter(c => !c.isOwner).length,
        my_assignment_count: myAssignments.length,
      });
    }
  }, [childrenLoading, myProgressLoading, user, children.length, myAssignments.length]);

  const handleOpenAddModal = () => {
    track(EVENTS.ADD_CHILD_MODAL_OPENED);
    setShowAddModal(true);
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard | Confessional Christianity</title>
      </Head>

      <Header showBranding />

      {/* Scripture Verse */}
      <ScriptureVerse />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* My Progress Section */}
        <div className="mb-10">
          <h2 className="text-2xl mb-4">My Progress</h2>
          {myProgressLoading ? (
            <div className="flex items-center justify-center py-8">
              <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-gray-400" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MyProgressCard assignments={myAssignments} />
            </div>
          )}
        </div>

        {/* Children Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl">Your Children</h2>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Child</span>
          </button>
        </div>

        {childrenLoading ? (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-gray-400" />
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faChild} className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg text-gray-600 mb-2">No children added yet</h3>
            <p className="text-gray-500 mb-6">
              Add your children to start tracking their catechism progress
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Your First Child</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </main>

      <AddChildModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addChild}
      />

      <div className="max-w-5xl mx-auto px-4">
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
