import { supabase } from "@/lib/supabase";

export interface IUploadResult {
  url: string;
  path: string;
}

export interface IUploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

class MediaService {
  // Supabase Storage Buckets
  private readonly BUCKET_POST_IMAGES = "post-images";
  private readonly BUCKET_REVIEW_IMAGES = "review-images";
  private readonly BUCKET_PLACE_IMAGES = "place-images";
  private readonly BUCKET_AVATAR_IMAGES = "avatar-images";

  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (Supabase default)
  private readonly ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    options: IUploadOptions = {}
  ): Promise<IUploadResult> {
    const {
      bucket = this.BUCKET_POST_IMAGES,
      maxSizeInMB = 50,
      allowedTypes = this.ALLOWED_IMAGE_TYPES,
    } = options;

    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("=== Upload Debug Info ===");
    console.log("Session exists:", !!session);
    console.log("Session error:", sessionError);
    console.log("User ID:", session?.user?.id);
    console.log("Access token present:", !!session?.access_token);
    console.log("Bucket:", bucket);
    
    if (!session || !session.user) {
      throw new Error("You must be logged in to upload files. Please sign in and try again.");
    }

    const userId = session.user.id;

    // Validate file size
    const maxSize = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSizeInMB}MB`);
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // CRITICAL: Path must start with user ID to match RLS policy
    // Policy requires: (storage.foldername(name))[1] = auth.uid()::text
    const filePath = `${userId}/${fileName}`;            // e.g., "user-id/image.jpg"

    console.log("Uploading to:", filePath);
    console.log("First folder (must match user ID):", userId);

    // Upload to Supabase with explicit headers
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("=== Upload Error Details ===");
      console.error("Error message:", error.message);
      console.error("Error details:", error);
      console.error("Bucket:", bucket);
      console.error("Path:", filePath);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log("Upload successful:", data);


    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  }

  /**
   * Upload forum post image
   */
  async uploadPostImage(file: File): Promise<IUploadResult> {
    return this.uploadFile(file, {
      bucket: this.BUCKET_POST_IMAGES,
      maxSizeInMB: 10,
    });
  }

  /**
   * Upload review image
   */
  async uploadReviewImage(file: File): Promise<IUploadResult> {
    return this.uploadFile(file, {
      bucket: this.BUCKET_REVIEW_IMAGES,
      maxSizeInMB: 10,
    });
  }

  /**
   * Upload place image
   */
  async uploadPlaceImage(file: File): Promise<IUploadResult> {
    return this.uploadFile(file, {
      bucket: this.BUCKET_PLACE_IMAGES,
      maxSizeInMB: 10,
    });
  }

  /**
   * Upload avatar image (stored in post-images bucket)
   */
  async uploadAvatar(file: File): Promise<IUploadResult> {
    return this.uploadFile(file, {
      bucket: this.BUCKET_AVATAR_IMAGES,
      maxSizeInMB: 2,
    });
  }

  /**
   * Upload profile image (stored in post-images bucket)
   */
  async uploadProfileImage(file: File): Promise<IUploadResult> {
    return this.uploadFile(file, {
      bucket: this.BUCKET_AVATAR_IMAGES,
      maxSizeInMB: 5,
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: File[],
    options: IUploadOptions = {}
  ): Promise<IUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload multiple post images
   */
  async uploadMultiplePostImages(files: File[]): Promise<IUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadPostImage(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload multiple review images
   */
  async uploadMultipleReviewImages(files: File[]): Promise<IUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadReviewImage(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload multiple place images
   */
  async uploadMultiplePlaceImages(files: File[]): Promise<IUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadPlaceImage(file));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(
    filePath: string,
    bucket: string = this.BUCKET_POST_IMAGES
  ): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(
    filePaths: string[],
    bucket: string = this.BUCKET_POST_IMAGES
  ): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove(filePaths);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }
}

export default new MediaService();
