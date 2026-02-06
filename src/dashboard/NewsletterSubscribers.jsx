import { useState, useEffect } from 'react';
import { Mail, Trash2, Search, Send, Users, Calendar, RefreshCw, Download } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { toast } from 'sonner';

const NewsletterSubscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fetch subscribers from Firebase
    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'newsletterSubscribers'), orderBy('subscribedAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const subs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                subscribedAt: doc.data().subscribedAt?.toDate()
            }));
            setSubscribers(subs);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            toast.error('Failed to fetch subscribers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    // Delete a subscriber
    const handleDelete = async (id, email) => {
        try {
            await deleteDoc(doc(db, 'newsletterSubscribers', id));
            setSubscribers(prev => prev.filter(sub => sub.id !== id));
            toast.success(`Removed ${email} from subscribers`);
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            toast.error('Failed to delete subscriber');
        }
    };

    // Toggle email selection
    const toggleEmailSelection = (email) => {
        setSelectedEmails(prev =>
            prev.includes(email)
                ? prev.filter(e => e !== email)
                : [...prev, email]
        );
    };

    // Select/Deselect all
    const toggleSelectAll = () => {
        if (selectedEmails.length === filteredSubscribers.length) {
            setSelectedEmails([]);
        } else {
            setSelectedEmails(filteredSubscribers.map(sub => sub.email));
        }
    };

    // Filter subscribers by search term
    const filteredSubscribers = subscribers.filter(sub =>
        sub.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Open Gmail with selected emails in BCC
    const openGmailCompose = () => {
        const emails = selectedEmails.length > 0 ? selectedEmails : filteredSubscribers.map(sub => sub.email);
        if (emails.length === 0) {
            toast.error('No subscribers to email');
            return;
        }
        // Using BCC to protect subscriber privacy
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${emails.join(',')}`;
        window.open(gmailUrl, '_blank');
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Export subscribers to CSV
    const exportToCSV = () => {
        const emails = selectedEmails.length > 0 ? selectedEmails : filteredSubscribers.map(sub => sub.email);
        if (emails.length === 0) {
            toast.error('No subscribers to export');
            return;
        }

        // Create CSV content with header
        const csvContent = 'Email,Subscribed Date\n' +
            (selectedEmails.length > 0
                ? filteredSubscribers.filter(sub => selectedEmails.includes(sub.email))
                : filteredSubscribers
            ).map(sub => `${sub.email},${formatDate(sub.subscribedAt)}`).join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${emails.length} subscribers to CSV`);
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                        <Mail className="text-yellow-500" size={20} />
                    </div>
                    Newsletter Subscribers
                </h1>
                <p className="text-gray-400">Manage newsletter subscribers and send emails via Gmail</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                            <Users className="text-yellow-500" size={18} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{subscribers.length}</p>
                            <p className="text-gray-400 text-sm">Total Subscribers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <Calendar className="text-green-500" size={18} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {subscribers.filter(s => {
                                    if (!s.subscribedAt) return false;
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return s.subscribedAt > weekAgo;
                                }).length}
                            </p>
                            <p className="text-gray-400 text-sm">This Week</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Mail className="text-blue-500" size={18} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{selectedEmails.length}</p>
                            <p className="text-gray-400 text-sm">Selected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={fetchSubscribers}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw size={18} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 flex items-center gap-2 transition-colors"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>
                    <button
                        onClick={openGmailCompose}
                        className="px-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <Send size={18} />
                        <span>Compose Email</span>
                    </button>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800/50 border-b border-gray-800 text-sm font-medium text-gray-400">
                    <div className="col-span-1 flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedEmails.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                        />
                    </div>
                    <div className="col-span-6 sm:col-span-5">Email</div>
                    <div className="col-span-4 sm:col-span-4 hidden sm:block">Subscribed</div>
                    <div className="col-span-5 sm:col-span-2 text-right">Actions</div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="p-8 text-center text-gray-400">
                        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                        Loading subscribers...
                    </div>
                ) : filteredSubscribers.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        {searchTerm ? 'No subscribers match your search' : 'No subscribers yet'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {filteredSubscribers.map((sub) => (
                            <div
                                key={sub.id}
                                className={`grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-800/30 transition-colors ${selectedEmails.includes(sub.email) ? 'bg-yellow-500/5' : ''
                                    }`}
                            >
                                <div className="col-span-1 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmails.includes(sub.email)}
                                        onChange={() => toggleEmailSelection(sub.email)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                                    />
                                </div>
                                <div className="col-span-6 sm:col-span-5 flex items-center">
                                    <span className="text-white truncate">{sub.email}</span>
                                </div>
                                <div className="col-span-4 sm:col-span-4 hidden sm:flex items-center text-gray-400 text-sm">
                                    {formatDate(sub.subscribedAt)}
                                </div>
                                <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-2">
                                    {deleteConfirm === sub.id ? (
                                        <>
                                            <button
                                                onClick={() => handleDelete(sub.id, sub.email)}
                                                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(sub.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete subscriber"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-sm text-gray-300">
                    <strong className="text-yellow-500">Tip:</strong> Select specific subscribers using checkboxes,
                    then click "Compose Email" to open Gmail with those emails in BCC. If none are selected,
                    all visible subscribers will be included.
                </p>
            </div>
        </div>
    );
};

export default NewsletterSubscribers;
