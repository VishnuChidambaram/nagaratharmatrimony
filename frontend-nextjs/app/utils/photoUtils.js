import { API_URL } from "./config.js";

/**
 * Resolves a list of photo URLs for a user item.
 * Handles JSON strings, single paths, and missing 'uploads/' prefix.
 * @param {Object} item - The user object containing photo and imagePath.
 * @returns {string[]} An array of resolved full URLs.
 */
export const getPhotoUrls = (item) => {
  if (!item) return [];
  const photoData = item.photo;
  let photoPaths = [];

  if (photoData) {
    if (typeof photoData === "string" && photoData.startsWith("[")) {
      try {
        photoPaths = JSON.parse(photoData);
      } catch (e) {
        photoPaths = [photoData];
      }
    } else if (Array.isArray(photoData)) {
      photoPaths = photoData;
    } else if (typeof photoData === "string") {
      photoPaths = [photoData];
    }
  }

  // Fallback to imagePath if photo is empty
  if (photoPaths.length === 0 && item.imagePath) {
    photoPaths = [item.imagePath];
  }

  return photoPaths
    .map((p) => {
      if (!p) return null;
      if (typeof p !== "string") return null;
      if (p.startsWith("http")) return p;

      // Handle full-path strings that might already contain the API_URL (not ideal but safe)
      if (API_URL && p.startsWith(API_URL)) return p;

      let cleanPath = p.replace(/\\/g, "/").replace(/^\/+/, "");
      
      // If the path doesn't start with 'uploads/' and isn't a Cloudinary path, 
      // check if it's a raw filename that needs 'uploads/' prepended.
      // We assume if it doesn't have a slash and isn't a reserved word, it's a filename.
      if (!cleanPath.startsWith("uploads/") && !cleanPath.includes("cloudinary.com")) {
          // Additional safety: only prepend if it looks like a filename (no slash) 
          // or if it's explicitly known to be in uploads.
          // For this app, most paths should be in uploads/.
          cleanPath = `uploads/${cleanPath}`;
      }
      
      return `${API_URL}/${cleanPath}`;
    })
    .filter((p) => p !== null);
};

/**
 * Resolves a single photo URL for a user item (usually the first photo).
 * @param {Object} item - The user object.
 * @param {string} fallback - The fallback placeholder URL.
 * @returns {string} The resolved full URL.
 */
export const getPhotoUrl = (item, fallback = "https://via.placeholder.com/150") => {
  const urls = getPhotoUrls(item);
  return urls.length > 0 ? urls[0] : fallback;
};
