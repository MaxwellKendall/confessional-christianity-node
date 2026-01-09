import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faPlus, 
  faUser, 
  faSignOutAlt,
  faBook,
  faArrowRight,
  faChild
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useChildren } from '../../hooks/useChildren';
import { getCatechismById, calculateProgress } from '../../lib/catechisms';

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
      await onAdd(name.trim(), birthDate || null);
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

const ChildCard = ({ child }) => {
  const assignments = child.catechism_assignments || [];
  const activeAssignment = assignments.find(a => !a.completed_at);
  
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
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faChild} className="text-gray-500 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{child.name}</h3>
              {age !== null && (
                <p className="text-sm text-gray-500">{age} years old</p>
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
  const { user, loading: authLoading, signOut } = useAuth();
  const { children, loading: childrenLoading, addChild } = useChildren();
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="cursor-pointer text-xl lg:text-2xl">
                Confessional Christianity
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl">Your Children</h2>
          <button
            onClick={() => setShowAddModal(true)}
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
              onClick={() => setShowAddModal(true)}
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
    </div>
  );
};

export default Dashboard;
