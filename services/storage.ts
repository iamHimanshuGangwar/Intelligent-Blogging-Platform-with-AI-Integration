import { createClient } from "@/utils/supabase/client";

const STORAGE_BUCKET = "blog-images";

export const storageService = {
  /**
   * Upload a cover image for a blog post.
   * Files are stored under the user's ID folder for RLS scoping.
   */
  async uploadCoverImage(file: File, userId: string) {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

    return publicUrl;
  },

  async uploadImage(file: File, folder: string = "posts") {
    const supabase = createClient();
    const fileName = `${folder}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);

    return publicUrl;
  },

  async deleteFile(path: string) {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);
    if (error) throw error;
  },

  getPublicUrl(path: string) {
    const supabase = createClient();
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  async listFiles(folder: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder);
    if (error) throw error;
    return data;
  },
};
