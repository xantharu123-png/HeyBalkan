import { supabase } from '../config/supabase';

export const chatService = {
  async getConversations(userId) {
    // Get all matches with the last message
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        user1_id,
        user2_id,
        user1:profiles!matches_user1_id_fkey(id, first_name, photos),
        user2:profiles!matches_user2_id_fkey(id, first_name, photos)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };

    // For each match, get the latest message
    const conversations = await Promise.all(
      (matches || []).map(async (m) => {
        const otherUser = m.user1_id === userId ? m.user2 : m.user1;

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('match_id', m.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          matchId: m.id,
          user: otherUser,
          lastMessage: lastMsg || null,
        };
      })
    );

    // Sort: conversations with messages first, then by most recent
    conversations.sort((a, b) => {
      if (a.lastMessage && !b.lastMessage) return -1;
      if (!a.lastMessage && b.lastMessage) return 1;
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at);
      }
      return 0;
    });

    return { data: conversations, error: null };
  },

  async getMessages(matchId, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .limit(limit);

    return { data: data || [], error };
  },

  async sendMessage(matchId, senderId, content) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    return { data, error };
  },

  subscribeToMessages(matchId, onNewMessage) {
    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          onNewMessage(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },
};
