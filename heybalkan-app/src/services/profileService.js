import { supabase } from '../config/supabase';

export const profileService = {
  async createProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData,
        onboarding_complete: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    return { data, error };
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async getDiscoverProfiles(userId, limit = 20) {
    // Get profiles user hasn't swiped on yet
    const { data: swipedIds } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', userId);

    const excludeIds = [userId, ...(swipedIds?.map((s) => s.swiped_id) || [])];

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .eq('onboarding_complete', true)
      .limit(limit);

    return { data: data || [], error };
  },

  async uploadPhoto(userId, uri, index) {
    const fileName = `${userId}/photo_${index}_${Date.now()}.jpg`;

    // Convert URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('photos')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) return { url: null, error };

    const { data: urlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  },
};
