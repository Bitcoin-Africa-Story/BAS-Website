import { db } from '../firebase';
import {
    collection,
    query,
    getDocs,
    orderBy,
    limit,
    doc,
    getDoc
} from 'firebase/firestore';

const EVENTS_COLLECTION = 'events';
const eventsCollectionRef = collection(db, EVENTS_COLLECTION);

/**
 * Fetch all events
 */
export const getAllEvents = async () => {
    try {
        const q = query(eventsCollectionRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

/**
 * Fetch upcoming events
 */
export const getUpcomingEvents = async (count = 3) => {
    try {
        const q = query(
            eventsCollectionRef,
            orderBy("date", "asc"),
            limit(count)
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching upcoming events:", error);
        throw error;
    }
};

export const getEventById = async (id) => {
    try {
        const docRef = doc(db, EVENTS_COLLECTION, id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
    } catch (error) {
        console.error("Error fetching event by id:", error);
        throw error;
    }
};

export const eventsService = {
    getAllEvents,
    getUpcomingEvents,
    getEventById
};
