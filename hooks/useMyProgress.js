import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useMyProgress = () => {
  const [assignments, setAssignments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const fetchAssignments = useCallback(async (showLoading = false) => {
    if (!user) {
      setAssignments([]);
      setInitialLoading(false);
      return;
    }

    try {
      if (showLoading) setInitialLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('user_catechism_assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      
      setAssignments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching user assignments:', err);
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchAssignments(true);
  }, [fetchAssignments]);

  const assignCatechism = async (catechismId) => {
    if (!user) throw new Error('Must be logged in');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticAssignment = {
      id: tempId,
      user_id: user.id,
      catechism_id: catechismId,
      current_question: 1,
      started_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
    };
    setAssignments(prev => [...prev, optimisticAssignment]);

    try {
      const { data, error: insertError } = await supabase
        .from('user_catechism_assignments')
        .insert({
          user_id: user.id,
          catechism_id: catechismId,
          current_question: 1,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Replace optimistic with real data
      setAssignments(prev => prev.map(a => a.id === tempId ? data : a));
      return data;
    } catch (err) {
      // Rollback on error
      setAssignments(prev => prev.filter(a => a.id !== tempId));
      throw err;
    }
  };

  const updateProgress = async (assignmentId, currentQuestion) => {
    // Optimistic update
    const previousAssignments = assignments;
    setAssignments(prev => prev.map(a => 
      a.id === assignmentId ? { ...a, current_question: currentQuestion } : a
    ));

    try {
      const { data, error: updateError } = await supabase
        .from('user_catechism_assignments')
        .update({ current_question: currentQuestion })
        .eq('id', assignmentId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setAssignments(prev => prev.map(a => a.id === assignmentId ? data : a));
      return data;
    } catch (err) {
      // Rollback on error
      setAssignments(previousAssignments);
      throw err;
    }
  };

  const markCompleted = async (assignmentId) => {
    // Optimistic update
    const previousAssignments = assignments;
    const completedAt = new Date().toISOString();
    setAssignments(prev => prev.map(a => 
      a.id === assignmentId ? { ...a, completed_at: completedAt } : a
    ));

    try {
      const { data, error: updateError } = await supabase
        .from('user_catechism_assignments')
        .update({ completed_at: completedAt })
        .eq('id', assignmentId)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setAssignments(prev => prev.map(a => a.id === assignmentId ? data : a));
      return data;
    } catch (err) {
      // Rollback on error
      setAssignments(previousAssignments);
      throw err;
    }
  };

  const removeAssignment = async (assignmentId) => {
    // Optimistic update
    const previousAssignments = assignments;
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));

    try {
      const { error: deleteError } = await supabase
        .from('user_catechism_assignments')
        .delete()
        .eq('id', assignmentId);

      if (deleteError) throw deleteError;
    } catch (err) {
      // Rollback on error
      setAssignments(previousAssignments);
      throw err;
    }
  };

  return {
    assignments,
    loading: initialLoading,
    error,
    assignCatechism,
    updateProgress,
    markCompleted,
    removeAssignment,
    refetch: () => fetchAssignments(false),
  };
};
