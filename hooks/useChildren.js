import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useChildren = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const fetchChildren = useCallback(async () => {
    if (!user) {
      setChildren([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('children')
        .select(`
          *,
          catechism_assignments (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setChildren(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const addChild = async (name, birthDate) => {
    if (!user) throw new Error('Must be logged in');

    const { data, error: insertError } = await supabase
      .from('children')
      .insert({
        user_id: user.id,
        name,
        birth_date: birthDate || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchChildren();
    return data;
  };

  const updateChild = async (childId, updates) => {
    const { data, error: updateError } = await supabase
      .from('children')
      .update(updates)
      .eq('id', childId)
      .select()
      .single();

    if (updateError) throw updateError;
    await fetchChildren();
    return data;
  };

  const deleteChild = async (childId) => {
    const { error: deleteError } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (deleteError) throw deleteError;
    await fetchChildren();
  };

  return {
    children,
    loading,
    error,
    addChild,
    updateChild,
    deleteChild,
    refetch: fetchChildren,
  };
};

export const useChild = (childId) => {
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const fetchChild = useCallback(async () => {
    if (!user || !childId) {
      setChild(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('children')
        .select(`
          *,
          catechism_assignments (*)
        `)
        .eq('id', childId)
        .single();

      if (fetchError) throw fetchError;
      setChild(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching child:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, childId]);

  useEffect(() => {
    fetchChild();
  }, [fetchChild]);

  const assignCatechism = async (catechismId) => {
    if (!child) throw new Error('No child loaded');

    const { data, error: insertError } = await supabase
      .from('catechism_assignments')
      .insert({
        child_id: child.id,
        catechism_id: catechismId,
        current_question: 1,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchChild();
    return data;
  };

  const updateProgress = async (assignmentId, currentQuestion) => {
    const { data, error: updateError } = await supabase
      .from('catechism_assignments')
      .update({ current_question: currentQuestion })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) throw updateError;
    await fetchChild();
    return data;
  };

  const markCompleted = async (assignmentId) => {
    const { data, error: updateError } = await supabase
      .from('catechism_assignments')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) throw updateError;
    await fetchChild();
    return data;
  };

  const removeAssignment = async (assignmentId) => {
    const { error: deleteError } = await supabase
      .from('catechism_assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) throw deleteError;
    await fetchChild();
  };

  return {
    child,
    loading,
    error,
    assignCatechism,
    updateProgress,
    markCompleted,
    removeAssignment,
    refetch: fetchChild,
  };
};
