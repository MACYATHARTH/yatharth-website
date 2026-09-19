export const DEFAULT_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || "yatharth-assets";

interface StorageConfig {
  supabaseUrl: string;
  serviceKey: string;
  bucket: string;
}

/**
 * Retrieves and validates the Supabase Storage server-side credentials.
 * Throws an explicit error if required environment variables are missing.
 */
function getStorageConfig(bucketOverride?: string): StorageConfig {
  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  )?.replace(/\/+$/, "");

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    throw new Error(
      "Supabase Storage configuration error: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) is not set."
    );
  }

  if (!serviceKey) {
    throw new Error(
      "Supabase Storage configuration error: SUPABASE_SERVICE_ROLE_KEY is not set on the server."
    );
  }

  const bucket = bucketOverride?.trim() || DEFAULT_STORAGE_BUCKET;

  return {
    supabaseUrl,
    serviceKey,
    bucket,
  };
}

/**
 * Generates the public CDN URL for a Supabase Storage object in a public bucket.
 */
export function getStoragePublicUrl(
  bucket: string = DEFAULT_STORAGE_BUCKET,
  filePath: string
): string {
  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  )?.replace(/\/+$/, "");

  const cleanPath = filePath.replace(/^\/+/, "");

  if (!supabaseUrl) {
    // If URL is not configured yet, return a normalized relative path structure
    return `/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Parses a storage object path from a URL if and only if it belongs to our Supabase Storage bucket.
 * Returns null for:
 * - Default local assets (e.g. /assets/wallpaper/...)
 * - External URLs (e.g. Unsplash, external CDNs)
 * - URLs belonging to other buckets or projects
 */
export function extractStoragePathFromUrl(
  url: string | null | undefined,
  bucket: string = DEFAULT_STORAGE_BUCKET
): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const cleanUrl = url.trim();

  // Pattern: .../storage/v1/object/public/<bucket>/<filePath>
  const expectedPrefix = `/storage/v1/object/public/${bucket}/`;
  const index = cleanUrl.indexOf(expectedPrefix);

  if (index === -1) {
    return null;
  }

  // Extract the portion after the prefix
  const rawPath = cleanUrl.slice(index + expectedPrefix.length);
  if (!rawPath) {
    return null;
  }

  // Remove any query params or hashes
  const cleanPath = rawPath.split("?")[0].split("#")[0].replace(/^\/+/, "");
  return cleanPath || null;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  filename: string;
  fileBuffer: Buffer | Uint8Array | ArrayBuffer;
  contentType: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Uploads a file buffer directly to Supabase Storage via REST API using server-side service-role key.
 */
export async function uploadToSupabaseStorage({
  bucket,
  folder,
  filename,
  fileBuffer,
  contentType,
}: UploadOptions): Promise<UploadResult> {
  try {
    const config = getStorageConfig(bucket);

    const cleanFolder = folder ? folder.replace(/^\/+|\/+$/g, "") : "";
    const cleanFilename = filename.replace(/^\/+/, "");
    const filePath = cleanFolder ? `${cleanFolder}/${cleanFilename}` : cleanFilename;

    const endpoint = `${config.supabaseUrl}/storage/v1/object/${config.bucket}/${filePath}`;

    const bodyData = (
      Buffer.isBuffer(fileBuffer)
        ? new Uint8Array(fileBuffer)
        : fileBuffer instanceof ArrayBuffer
        ? new Uint8Array(fileBuffer)
        : new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength)
    ) as unknown as BodyInit;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.serviceKey}`,
        apikey: config.serviceKey,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: bodyData,
    });

    if (!response.ok) {
      let errorMessage = `Supabase Storage upload failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          errorMessage = `${errorMessage}: ${errJson.message || errJson.error}`;
        }
      } catch {
        const errText = await response.text();
        if (errText) {
          errorMessage = `${errorMessage}: ${errText}`;
        }
      }
      return { success: false, error: errorMessage };
    }

    const publicUrl = getStoragePublicUrl(config.bucket, filePath);

    return {
      success: true,
      url: publicUrl,
      key: filePath,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error during Supabase Storage upload.";
    return { success: false, error: message };
  }
}

export interface DeleteOptions {
  bucket?: string;
  filePath: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Deletes an object from Supabase Storage via REST API using server-side service-role key.
 */
export async function deleteFromSupabaseStorage({
  bucket,
  filePath,
}: DeleteOptions): Promise<DeleteResult> {
  try {
    const config = getStorageConfig(bucket);
    const cleanPath = filePath.replace(/^\/+/, "");

    const endpoint = `${config.supabaseUrl}/storage/v1/object/${config.bucket}`;

    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.serviceKey}`,
        apikey: config.serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [cleanPath] }),
    });

    if (!response.ok) {
      let errorMessage = `Supabase Storage delete failed with status ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          errorMessage = `${errorMessage}: ${errJson.message || errJson.error}`;
        }
      } catch {
        const errText = await response.text();
        if (errText) {
          errorMessage = `${errorMessage}: ${errText}`;
        }
      }
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error during Supabase Storage deletion.";
    return { success: false, error: message };
  }
}
