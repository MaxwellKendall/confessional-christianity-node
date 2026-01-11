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
      // Query children via the user_children junction table
      const { data: userChildrenData, error: fetchError } = await supabase
        .from('user_children')
        .select(`
          role,
          child:children (
            *,
            catechism_assignments (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      
      // Flatten the data structure and include the user's role
      const childrenWithRole = (userChildrenData || [])
        .filter(uc => uc.child) // Filter out any null children
        .map(uc => ({
          ...uc.child,
          userRole: uc.role, // 'owner' or 'guardian'
          isOwner: uc.role === 'owner',
        }));
      
      setChildren(childrenWithRole);
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

    // Note: We don't use .select() here because the SELECT policy 
    // checks user_children, which is created by a trigger AFTER insert.
    // Instead, we just refetch all children after insert.
    const { error: insertError } = await supabase
      .from('children')
      .insert({
        user_id: user.id,
        name,
        birth_date: birthDate || null,
      });

    if (insertError) throw insertError;
    await fetchChildren();
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
  const [guardians, setGuardians] = useState([]);
  const [shareInvites, setShareInvites] = useState([]);
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
      
      // Fetch child data with user's role
      const { data: userChildData, error: userChildError } = await supabase
        .from('user_children')
        .select(`
          role,
          child:children (
            *,
            catechism_assignments (*)
          )
        `)
        .eq('user_id', user.id)
        .eq('child_id', childId)
        .single();

      if (userChildError) throw userChildError;
      
      if (userChildData?.child) {
        setChild({
          ...userChildData.child,
          userRole: userChildData.role,
          isOwner: userChildData.role === 'owner',
        });
      } else {
        setChild(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching child:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, childId]);

  const fetchGuardians = useCallback(async () => {
    if (!childId) return;

    try {
      // Use the SECURITY DEFINER function to fetch guardians (avoids RLS recursion)
      const { data, error: fetchError } = await supabase
        .rpc('get_child_guardians', { p_child_id: childId });

      if (fetchError) throw fetchError;
      setGuardians(data || []);
    } catch (err) {
      console.error('Error fetching guardians:', err);
    }
  }, [childId]);

  const fetchShareInvites = useCallback(async () => {
    if (!childId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('child_share_invites')
        .select('*')
        .eq('child_id', childId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      if (fetchError) throw fetchError;
      setShareInvites(data || []);
    } catch (err) {
      console.error('Error fetching share invites:', err);
    }
  }, [childId]);

  useEffect(() => {
    fetchChild();
    fetchGuardians();
    fetchShareInvites();
  }, [fetchChild, fetchGuardians, fetchShareInvites]);

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

  // Generate a share invite code
  const createShareInvite = async () => {
    if (!child) throw new Error('No child loaded');
    if (!child.isOwner) throw new Error('Only owners can share');

    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { data, error: insertError } = await supabase
      .from('child_share_invites')
      .insert({
        child_id: child.id,
        invited_by: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchShareInvites();
    return data;
  };

  // Revoke a share invite
  const revokeShareInvite = async (inviteId) => {
    const { error: deleteError } = await supabase
      .from('child_share_invites')
      .delete()
      .eq('id', inviteId);

    if (deleteError) throw deleteError;
    await fetchShareInvites();
  };

  // Remove a guardian (only owners can do this)
  const removeGuardian = async (guardianUserId) => {
    if (!child?.isOwner) throw new Error('Only owners can remove guardians');
    if (guardianUserId === user.id) throw new Error('Cannot remove yourself');

    // Use the SECURITY DEFINER function to remove guardian
    const { data, error: rpcError } = await supabase
      .rpc('remove_child_guardian', { 
        p_child_id: child.id, 
        p_guardian_user_id: guardianUserId 
      });

    if (rpcError) throw rpcError;
    if (!data?.success) throw new Error(data?.error || 'Failed to remove guardian');
    
    await fetchGuardians();
  };

  return {
    child,
    loading,
    error,
    guardians,
    shareInvites,
    assignCatechism,
    updateProgress,
    markCompleted,
    removeAssignment,
    createShareInvite,
    revokeShareInvite,
    removeGuardian,
    refetch: fetchChild,
    refetchGuardians: fetchGuardians,
  };
};

// Hook for accepting share invites
export const useShareInvite = (inviteCode) => {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const fetchInvite = useCallback(async () => {
    if (!inviteCode) {
      setInvite(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('child_share_invites')
        .select(`
          *,
          child:children (id, name)
        `)
        .eq('invite_code', inviteCode)
        .single();

      if (fetchError) throw fetchError;
      
      // Check if expired
      if (data && new Date(data.expires_at) < new Date()) {
        setError('This invite has expired');
        setInvite(null);
      } else if (data?.accepted_at) {
        setError('This invite has already been used');
        setInvite(null);
      } else {
        setInvite(data);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching invite:', err);
      setError('Invite not found');
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  useEffect(() => {
    fetchInvite();
  }, [fetchInvite]);

  const acceptInvite = async () => {
    if (!user) throw new Error('Must be logged in');
    if (!invite) throw new Error('No valid invite');

    setAccepting(true);
    try {
      // Use the database function to accept the invite
      const { data, error: rpcError } = await supabase
        .rpc('accept_share_invite', { p_invite_code: inviteCode });

      if (rpcError) throw rpcError;
      if (!data?.success) throw new Error(data?.error || 'Failed to accept invite');

      return data;
    } finally {
      setAccepting(false);
    }
  };

  return {
    invite,
    loading,
    error,
    accepting,
    acceptInvite,
  };
};
