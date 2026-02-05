import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { newsService } from '../services/newsService';

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [lastVisibleDoc, setLastVisibleDoc] = useState(null);

    useEffect(() => {
        console.log('Initializing NewsContext synchronization...');
        const unsubscribe = newsService.subscribeToNews((items) => {
            setNews(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        news,
        loading,
        error,
        getPostBySlug: (slug) => news.find(p => p.slug === slug)
    };

    return (
        <NewsContext.Provider value={value}>
            {children}
        </NewsContext.Provider>
    );
};

export const useNews = () => {
    const context = useContext(NewsContext);
    if (!context) {
        throw new Error('useNews must be used within a NewsProvider');
    }
    return context;
};
