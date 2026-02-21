/**
 * Firebase Storage helpers
 * Used for uploading gallery images and user avatars.
 */
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

import { storage } from "./config";

/**
 * Upload a file to Firebase Storage with progress reporting.
 * @param {File}     file        - The file to upload
 * @param {string}   path        - Storage path, e.g. "gallery/uid/filename.png"
 * @param {Function} onProgress  - Called with (0-100) percentage
 * @returns {Promise<string>}    - Resolves to the public download URL
 */
export function uploadFile(file, path, onProgress) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file);

        task.on(
            "state_changed",
            (snapshot) => {
                const pct = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                if (onProgress) onProgress(pct);
            },
            reject,
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve(url);
            }
        );
    });
}

/**
 * Upload a gallery image.
 * Path: gallery/{uid}/{timestamp}-{filename}
 */
export async function uploadGalleryImage(uid, file, onProgress) {
    const path = `gallery/${uid}/${Date.now()}-${file.name}`;
    return uploadFile(file, path, onProgress);
}

/**
 * Upload a user avatar.
 * Path: avatars/{uid}/{filename}
 */
export async function uploadAvatar(uid, file, onProgress) {
    const path = `avatars/${uid}/${file.name}`;
    return uploadFile(file, path, onProgress);
}

/**
 * Delete a file from Storage by its full path.
 */
export async function deleteFile(fullPath) {
    await deleteObject(ref(storage, fullPath));
}
