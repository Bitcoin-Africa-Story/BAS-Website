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
    startAfter
} from 'firebase/firestore';

const NEWS_COLLECTION = 'news';
const newsCollectionRef = collection(db, NEWS_COLLECTION);

/**
 * NAMED EXPORTS (User Requested Format)
 */

/**
 * Fetch all news
 */
export const getAllNews = async () => {
    try {
        const snapshot = await getDocs(newsCollectionRef);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
    }
};

/**
 * Fetch single news by ID
 */
export const getNewsById = async (id) => {
    try {
        const docRef = doc(db, NEWS_COLLECTION, id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return {
            id: snapshot.id,
            ...snapshot.data(),
        };
    } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
    }
};

/**
 * Fetch latest news (ordered by createdAt as requested)
 */
export const getLatestNewsFunc = async (count = 5) => {
    try {
        const q = query(
            newsCollectionRef,
            orderBy("createdAt", "desc"),
            limit(count)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching latest news:", error);
        throw error;
    }
};

/**
 * Fetch news by category
 */
export const getNewsByCategory = async (category) => {
    try {
        const q = query(
            newsCollectionRef,
            where("category", "==", category)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching news by category:", error);
        throw error;
    }
};

/**
 * INTEGRATED SERVICE OBJECT (For NewsContext and Dashboard Support)
 */

export const newsService = {
    /**
     * Subscribe to latest news (fetch only what you need first)
     */
    subscribeToNews: (callback, limitCount = null) => {
        let q = query(
            newsCollectionRef,
            orderBy('date', 'desc')
        );

        if (limitCount) {
            q = query(q, limit(limitCount));
        }

        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                _doc: doc // Store for pagination
            }));
            callback(items);
        }, (error) => {
            console.error('Error in news subscription:', error);
            callback([]);
        });
    },

    /**
     * Load more news (segmented fetching)
     */
    loadMoreNews: async (lastItem, limitCount = 10) => {
        if (!lastItem || !lastItem._doc) return [];

        const q = query(
            newsCollectionRef,
            orderBy('date', 'desc'),
            startAfter(lastItem._doc),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            _doc: d
        }));
    },

    /**
     * Fetch a single post by its slug
     */
    getPostBySlug: async (slug) => {
        const q = query(
            newsCollectionRef,
            where('slug', '==', slug),
            limit(1)
        );
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data(), _doc: snap.docs[0] };
    },

    /**
     * Fetch latest news with a limit (for Home page)
     */
    getLatestNews: async (count = 6) => {
        const q = query(
            newsCollectionRef,
            orderBy('date', 'desc'),
            limit(count)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }));
    }
};

// Also export getLatestNews as a named export that maps to the functional version
export const getLatestNews = getLatestNewsFunc;