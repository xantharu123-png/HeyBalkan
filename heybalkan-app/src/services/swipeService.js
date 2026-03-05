import { supabase } from '../config/supabase';

export const swipeService = {
  async swipe(swiperId, swipedId, action) {
    // action: 'like', 'pass', 'super_like'
    const { data, error } = await supabase
      .from('swipes')
      .insert({
        swiper_id: swiperId,
        swiped_id: swipedId,
        action,
      })
      .select()
      .single();

    if (error) return { data: null, isMatch: false, error };

    // Check if it's a match (other person liked us too)
    if (action === 'like' || action === 'super_like') {
      const { data: reverse } = await supabase
        .from('swipes')
        .select('id')
        .eq('swiper_id', swipedId)
        .eq('swiped_id', swiperId)
        .in('action', ['like', 'super_like'])
        .single();

      if (reverse) {
        // Create match!
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: swiperId < swipedId ? swiperId : swipedId,
            user2_id: swiperId < swipedId ? swipedId : swiperId,
          })
          .select()
          .single();

        return { data: match, isMatch: true, error: matchError };
      }
    }

    return { data, isMatch: false, error: null };
  },

  async getMatches(userId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        created_at,
        user1_id,
        user2_id,
        user1:profiles!matches_user1_id_fkey(id, first_name, photos, origin_country, birth_date),
        user2:profiles!matches_user2_id_fkey(id, first_name, photos, origin_country, birth_date)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    // Transform: extract the OTHER user's profile
    const matches = (data || []).map((m) => {
      const otherUser = m.user1_id === userId ? m.user2 : m.user1;
      return {
        matchId: m.id,
        matchedAt: m.created_at,
        ...otherUser,
      };
    });

    return { data: matches, error };
  },
};
