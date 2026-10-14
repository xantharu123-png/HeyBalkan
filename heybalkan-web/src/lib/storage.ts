import { supabase } from '@/lib/supabase';

// Loescht alle Dateien im Ordner <uid>/ eines Buckets (Storage-Policies erlauben nur den eigenen Ordner)
export async function removeOwnFolder(bucket: string, uid: string) {
  for (let round = 0; round < 50; round++) {
    const { data, error } = await supabase.storage.from(bucket).list(uid, { limit: 100 });
    if (error) throw error;
    const files = (data || []).filter(f => f.id !== null);
    if (files.length === 0) return;

    const { error: removeError } = await supabase.storage
      .from(bucket)
      .remove(files.map(f => `${uid}/${f.name}`));
    if (removeError) throw removeError;

    if (files.length < 100) return;
  }
}

// ".../storage/v1/object/public/<bucket>/<path>" -> "<path>", sonst null (z.B. externe URLs)
export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}
