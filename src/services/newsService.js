// import { db } from '../firebase';
// import {
//     collection,
//     query,
//     where,
//     getDocs,
//     getDoc,
//     doc,
//     limit,
//     orderBy,
//     onSnapshot,
//     startAfter,
//     updateDoc,
//     increment,
//     arrayUnion,
//     arrayRemove,
//     addDoc,
//     setDoc,
//     deleteDoc,
//     serverTimestamp
// } from 'firebase/firestore';

// const NEWS_COLLECTION = 'news';
// const newsCollectionRef = collection(db, NEWS_COLLECTION);

// /**
//  * NAMED EXPORTS (User Requested Format)
//  */

// /**
//  * Fetch all news
//  */
// export const getAllNews = async () => {
//     try {
//         const snapshot = await getDocs(newsCollectionRef);
//         return snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//         }));
//     } catch (error) {
//         console.error("Error fetching news:", error);
//         throw error;
//     }
// };

// /**
//  * Fetch single news by ID
//  */
// export const getNewsById = async (id) => {
//     try {
//         const docRef = doc(db, NEWS_COLLECTION, id);
//         const snapshot = await getDoc(docRef);

//         if (!snapshot.exists()) return null;

//         return {
//             id: snapshot.id,
//             ...snapshot.data(),
//         };
//     } catch (error) {
//         console.error("Error fetching news:", error);
//         throw error;
//     }
// };

// /**
//  * Fetch latest news (ordered by createdAt as requested)
//  */
// export const getLatestNewsFunc = async (count = 5) => {
//     try {
//         const q = query(
//             newsCollectionRef,
//             orderBy("createdAt", "desc"),
//             limit(count)
//         );

//         const snapshot = await getDocs(q);

//         return snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//         }));
//     } catch (error) {
//         console.error("Error fetching latest news:", error);
//         throw error;
//     }
// };

// /**
//  * Fetch news by category
//  */
// export const getNewsByCategory = async (category) => {
//     try {
//         const q = query(
//             newsCollectionRef,
//             where("category", "==", category)
//         );

//         const snapshot = await getDocs(q);

//         return snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//         }));
//     } catch (error) {
//         console.error("Error fetching news by category:", error);
//         throw error;
//     }
// };

// /**
//  * INTEGRATED SERVICE OBJECT (For NewsContext and Dashboard Support)
//  */

// export const newsService = {
//     /**
//      * Subscribe to latest news (fetch only what you need first)
//      */
//     subscribeToNews: (callback, limitCount = null) => {
//         let q = query(
//             newsCollectionRef,
//             orderBy('date', 'desc')
//         );

//         if (limitCount) {
//             q = query(q, limit(limitCount));
//         }

//         return onSnapshot(q, (snapshot) => {
//             const items = snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data(),
//                 _doc: doc // Store for pagination
//             }));
//             callback(items);
//         }, (error) => {
//             console.error('Error in news subscription:', error);
//             callback([]);
//         });
//     },

//     /**
//      * Load more news (segmented fetching)
//      */
//     loadMoreNews: async (lastItem, limitCount = 10) => {
//         if (!lastItem || !lastItem._doc) return [];

//         const q = query(
//             newsCollectionRef,
//             orderBy('date', 'desc'),
//             startAfter(lastItem._doc),
//             limit(limitCount)
//         );
//         const snap = await getDocs(q);
//         return snap.docs.map(d => ({
//             id: d.id,
//             ...d.data(),
//             _doc: d
//         }));
//     },

//     /**
//      * Fetch a single post by its slug
//      */
//     getPostBySlug: async (slug) => {
//         const q = query(
//             newsCollectionRef,
//             where('slug', '==', slug),
//             limit(1)
//         );
//         const snap = await getDocs(q);
//         if (snap.empty) return null;
//         return { id: snap.docs[0].id, ...snap.docs[0].data(), _doc: snap.docs[0] };
//     },

//     /**
//      * Fetch latest news with a limit (for Home page)
//      */
//     getLatestNews: async (count = 6) => {
//         const q = query(
//             newsCollectionRef,
//             orderBy('date', 'desc'),
//             limit(count)
//         );
//         const snap = await getDocs(q);
//         return snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }));
//     },

//     /**
//      * Increment view count for a post
//      */
//     incrementViews: async (postId) => {
//         const postRef = doc(db, NEWS_COLLECTION, postId);
//         try {
//             await updateDoc(postRef, {
//                 views: increment(1)
//             });
//         } catch (error) {
//             console.error("Error incrementing views:", error);
//         }
//     },

//     /**
//      * Increment share count for a post
//      */
//     incrementShares: async (postId) => {
//         const postRef = doc(db, NEWS_COLLECTION, postId);
//         try {
//             await updateDoc(postRef, {
//                 shares: increment(1)
//             });
//         } catch (error) {
//             console.error("Error incrementing shares:", error);
//         }
//     },

//     /**
//      * Toggle like for a post (Flat collection + counter)
//      */
//     toggleLike: async (postId, userId) => {
//         const postRef = doc(db, NEWS_COLLECTION, postId);
//         const likeId = `${postId}_${userId}`;
//         const likeRef = doc(db, 'likes', likeId);

//         try {
//             const likeSnap = await getDoc(likeRef);
//             if (likeSnap.exists()) {
//                 await updateDoc(postRef, { likesCount: increment(-1) });
//                 // We also keep the old likes array for backward compatibility if needed, 
//                 // but primary source will be the collection
//                 await updateDoc(postRef, { likes: arrayRemove(userId) });
//                 await deleteDoc(likeRef);
//                 return false;
//             } else {
//                 await updateDoc(postRef, { likesCount: increment(1) });
//                 await updateDoc(postRef, { likes: arrayUnion(userId) });
//                 await setDoc(likeRef, {
//                     postId,
//                     userId,
//                     createdAt: serverTimestamp()
//                 });
//                 return true;
//             }
//         } catch (error) {
//             console.error("Error toggling like:", error);
//             throw error;
//         }
//     },

//     /**
//      * Check if a user liked a post
//      */
//     checkIfLiked: async (postId, userId) => {
//         if (!userId) return false;
//         const likeId = `${postId}_${userId}`;
//         const likeRef = doc(db, 'likes', likeId);
//         const snap = await getDoc(likeRef);
//         return snap.exists();
//     },

//     /**
//      * Add a comment to a flat collection
//      */
//     addComment: async (postId, comment) => {
//         const postRef = doc(db, NEWS_COLLECTION, postId);
//         const commentsRef = collection(db, 'comments');
//         try {
//             const docRef = await addDoc(commentsRef, {
//                 postId,
//                 ...comment,
//                 createdAt: serverTimestamp()
//             });
//             await updateDoc(postRef, {
//                 commentCount: increment(1)
//             });
//             return docRef.id;
//         } catch (error) {
//             console.error("Error adding comment:", error);
//             throw error;
//         }
//     },

//     /**
//      * Get comments for a post from flat collection
//      */
//     getComments: (postId, callback) => {
//         const commentsRef = collection(db, 'comments');
//         const q = query(
//             commentsRef,
//             where('postId', '==', postId),
//             orderBy('createdAt', 'asc')
//         );
//         return onSnapshot(q, (snapshot) => {
//             const comments = snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             }));
//             callback(comments);
//         }, (err) => {
//             console.error("Error fetching comments:", err);
//             callback([]);
//         });
//     }
// };

// // Also export getLatestNews as a named export that maps to the functional version
// export const getLatestNews = getLatestNewsFunc;

import { db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    limit,
    orderBy,
    onSnapshot,
    startAfter,
    updateDoc,
    increment,
    addDoc,
    setDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';

const NEWS_COLLECTION = 'news';
const ANALYTICS_COLLECTION = 'analytics';
const GLOBAL_STATS_ID = '_site_stats_';
const newsCollectionRef = collection(db, NEWS_COLLECTION);

// ─── Helper: get or create analytics doc ───────────────────────────────────
const getAnalyticsRef = (postId) => doc(db, ANALYTICS_COLLECTION, postId);

const ensureAnalyticsDoc = async (postId) => {
    const ref = getAnalyticsRef(postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        const initialData = postId === GLOBAL_STATS_ID ? {
            visited: 0,
            createdAt: serverTimestamp()
        } : {
            postId,
            views: 0,
            likes: 0,
            likedBy: [],   // array of anonymous user IDs to prevent double-liking
            shares: 0,
            commentCount: 0,
            createdAt: serverTimestamp()
        };
        await setDoc(ref, initialData);
    }
    return ref;
};

// ─── Named Exports ──────────────────────────────────────────────────────────

export const getAllNews = async () => {
    try {
        const snapshot = await getDocs(newsCollectionRef);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
};

export const getNewsById = async (id) => {
    try {
        const docRef = doc(db, NEWS_COLLECTION, id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) return null;
        return { id: snapshot.id, ...snapshot.data() };
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
};

export const getLatestNewsFunc = async (count = 5) => {
    try {
        const q = query(newsCollectionRef, orderBy('createdAt', 'desc'), limit(count));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching latest news:', error);
        throw error;
    }
};

export const getNewsByCategory = async (category) => {
    try {
        const q = query(newsCollectionRef, where('category', '==', category));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching news by category:', error);
        throw error;
    }
};

export const getLatestNews = getLatestNewsFunc;

// ─── Service Object ─────────────────────────────────────────────────────────

export const newsService = {

    subscribeToNews: (callback, limitCount = null) => {
        let q = query(newsCollectionRef, orderBy('date', 'desc'));
        if (limitCount) q = query(q, limit(limitCount));

        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }));
            callback(items);
        }, (error) => {
            console.error('Error in news subscription:', error);
            callback([]);
        });
    },

    loadMoreNews: async (lastItem, limitCount = 10) => {
        if (!lastItem?._doc) return [];
        const q = query(newsCollectionRef, orderBy('date', 'desc'), startAfter(lastItem._doc), limit(limitCount));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }));
    },

    getPostBySlug: async (slug) => {
        const q = query(newsCollectionRef, where('slug', '==', slug), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data(), _doc: snap.docs[0] };
    },

    getLatestNews: async (count = 6) => {
        const q = query(newsCollectionRef, orderBy('date', 'desc'), limit(count));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }));
    },

    // ── Analytics ────────────────────────────────────────────────────────────

    /**
     * Increment views. Call once per page load per post.
     */
    incrementViews: async (postId) => {
        try {
            const ref = await ensureAnalyticsDoc(postId);
            await updateDoc(ref, { views: increment(1) });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    },

    /**
     * Increment global website visits.
     */
    incrementGlobalVisits: async () => {
        try {
            const ref = await ensureAnalyticsDoc(GLOBAL_STATS_ID);
            await updateDoc(ref, { visited: increment(1) });
        } catch (error) {
            console.error('Error incrementing global visits:', error);
        }
    },

    /**
     * Increment shares.
     */
    incrementShares: async (postId) => {
        try {
            const ref = await ensureAnalyticsDoc(postId);
            await updateDoc(ref, { shares: increment(1) });
        } catch (error) {
            console.error('Error incrementing shares:', error);
        }
    },

    /**
     * Get analytics data for a single post (one-time fetch).
     * Returns { views, likes, shares, commentCount, likedBy }
     */
    getAnalytics: async (postId) => {
        try {
            const ref = getAnalyticsRef(postId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return { views: 0, likes: 0, shares: 0, commentCount: 0, likedBy: [] };
            return snap.data();
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return { views: 0, likes: 0, shares: 0, commentCount: 0, likedBy: [] };
        }
    },

    /**
     * Subscribe to analytics for a post (real-time).
     * Returns unsubscribe function.
     */
    subscribeToAnalytics: (postId, callback) => {
        const ref = getAnalyticsRef(postId);
        return onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                callback({ views: 0, likes: 0, shares: 0, commentCount: 0, likedBy: [] });
            } else {
                callback(snap.data());
            }
        }, (err) => {
            console.error('Error subscribing to analytics:', err);
            callback({ views: 0, likes: 0, shares: 0, commentCount: 0, likedBy: [] });
        });
    },

    /**
     * Subscribe to ALL analytics docs (for dashboard).
     * Returns unsubscribe function.
     */
    subscribeToAllAnalytics: (callback) => {
        const ref = collection(db, ANALYTICS_COLLECTION);
        return onSnapshot(ref, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(data);
        }, (err) => {
            console.error('Error subscribing to all analytics:', err);
            callback([]);
        });
    },

    /**
     * Toggle like. No login needed — uses anonymous localStorage ID.
     * Returns { liked: boolean, newCount: number }
     */
    toggleLike: async (postId, userId) => {
        try {
            const ref = await ensureAnalyticsDoc(postId);
            const snap = await getDoc(ref);
            const data = snap.data();
            const likedBy = data?.likedBy || [];
            const alreadyLiked = likedBy.includes(userId);

            if (alreadyLiked) {
                // Remove like
                const newLikedBy = likedBy.filter(id => id !== userId);
                const newCount = Math.max(0, (data?.likes || 1) - 1);
                await updateDoc(ref, {
                    likes: newCount,
                    likedBy: newLikedBy
                });
                return { liked: false, newCount };
            } else {
                // Add like
                const newLikedBy = [...likedBy, userId];
                const newCount = (data?.likes || 0) + 1;
                await updateDoc(ref, {
                    likes: newCount,
                    likedBy: newLikedBy
                });
                return { liked: true, newCount };
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    /**
     * Check if anonymous user has liked a post.
     */
    checkIfLiked: async (postId, userId) => {
        if (!userId) return false;
        try {
            const ref = getAnalyticsRef(postId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return false;
            return (snap.data()?.likedBy || []).includes(userId);
        } catch {
            return false;
        }
    },

    // ── Comments (subcollection under analytics/{postId}/comments) ───────────

    /**
     * Add a comment.
     */
    addComment: async (postId, comment) => {
        try {
            const analyticsRef = await ensureAnalyticsDoc(postId);
            const commentsRef = collection(db, ANALYTICS_COLLECTION, postId, 'comments');
            const docRef = await addDoc(commentsRef, {
                ...comment,
                createdAt: serverTimestamp()
            });
            await updateDoc(analyticsRef, { commentCount: increment(1) });
            return docRef.id;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    /**
     * Subscribe to comments for a post (real-time).
     */
    getComments: (postId, callback) => {
        const commentsRef = collection(db, ANALYTICS_COLLECTION, postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));
        return onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(comments);
        }, (err) => {
            console.error('Error fetching comments:', err);
            callback([]);
        });
    },

    /**
     * Delete a comment (for dashboard moderation).
     */
    deleteComment: async (postId, commentId) => {
        try {
            const commentRef = doc(db, ANALYTICS_COLLECTION, postId, 'comments', commentId);
            await deleteDoc(commentRef);
            const analyticsRef = getAnalyticsRef(postId);
            await updateDoc(analyticsRef, { commentCount: increment(-1) });
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }
};