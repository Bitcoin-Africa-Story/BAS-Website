import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Trash2, Eye, Calendar, User, Clock, Link2, ExternalLink } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, getDocs, deleteDoc, addDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadString } from 'firebase/storage';
import { toast } from 'sonner';
import StatusModal from './components/StatusModal';
import ProcessingOverlay from './components/ProcessingOverlay';

const SubmittedStories = () => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', message: '', confirmAction: null });

  const fetchStories = async () => {
    try {
      const q = query(collection(db, 'submitted_stories'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching submitted stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleApprove = async (story) => {
    setModal({
      open: true,
      title: 'Confirm',
      message: 'Are you sure you want to approve this story? It will be published to the main news feed.',
      confirmAction: async () => {
        setIsProcessing(true);
        try {
          // Handle legacy data during approval if it exists (converting to storage)
          let imageUrl = story.image;
          if (imageUrl && imageUrl.startsWith('data:image')) {
            const storageRef = ref(storage, `news/featured_approved_${Date.now()}`);
            await uploadString(storageRef, imageUrl, 'data_url');
            imageUrl = await getDownloadURL(storageRef);
          }

          let authorImageUrl = story.authorImage;
          if (authorImageUrl && authorImageUrl.startsWith('data:image')) {
            const authorStorageRef = ref(storage, `authors/author_approved_${Date.now()}`);
            await uploadString(authorStorageRef, authorImageUrl, 'data_url');
            authorImageUrl = await getDownloadURL(authorStorageRef);
          }

          // 1. Add to main 'news' collection
          await addDoc(collection(db, 'news'), {
            title: story.title,
            slug: story.slug,
            category: story.category,
            date: story.date,
            readTime: story.readTime,
            image: imageUrl,
            excerpt: story.excerpt,
            content: story.content,
            author: story.authorName, // Mapping authorName to author field in news
            authorImage: authorImageUrl || '',
            authorLinkedIn: story.authorLinkedIn || '',
            authorX: story.authorX || '',
            youtubeUrl: story.youtubeUrl || '',
            createdAt: serverTimestamp(),
            views: 0
          });

          // 2. Delete from 'submitted_stories'
          await deleteDoc(doc(db, 'submitted_stories', story.id));

          toast.success('Story approved and published successfully!');
          setSelectedStory(null);
          fetchStories();
        } catch (error) {
          console.error('Error approving story:', error);
          toast.error('Failed to approve story.');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const handleDelete = async (story) => {
    setModal({
      open: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this submission? This action cannot be undone.',
      confirmAction: async () => {
        setIsProcessing(true);
        try {
          // Delete images from Storage if they exist
          const deleteStorageFile = async (url) => {
            if (url && url.includes('firebasestorage.googleapis.com')) {
              try {
                const fileRef = ref(storage, url);
                await deleteObject(fileRef);
              } catch (storageErr) {
                console.error('Storage delete error:', storageErr);
              }
            }
          };

          if (story.image) await deleteStorageFile(story.image);
          if (story.authorImage) await deleteStorageFile(story.authorImage);

          await deleteDoc(doc(db, 'submitted_stories', story.id));
          toast.success('Submission deleted successfully.');
          if (selectedStory?.id === story.id) setSelectedStory(null);
          fetchStories();
        } catch (error) {
          console.error('Error deleting submission:', error);
          toast.error('Failed to delete submission.');
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  // Helper to get YouTube Embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <ProcessingOverlay isVisible={isProcessing} />
      {modal.open && modal.confirmAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">{modal.title}</h2>
            <p className="text-gray-400">{modal.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModal({ open: false, title: '', message: '', confirmAction: null })} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={() => { modal.confirmAction(); setModal({ open: false, title: '', message: '', confirmAction: null }); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <StatusModal open={modal.open && !modal.confirmAction} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false, confirmAction: null })} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="text-yellow-500" size={36} />
            Submitted Stories
          </h1>
          <p className="text-gray-400">Review and approve stories submitted by the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stories List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Pending Reviews
                <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">{stories.length}</span>
              </h2>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : stories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending stories.</p>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
                  {stories.map(story => (
                    <div
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedStory?.id === story.id
                        ? 'bg-yellow-500/10 border-yellow-500'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                        }`}
                    >
                      <h3 className="font-bold text-sm mb-1 line-clamp-2">{story.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span className="text-yellow-500">{story.category}</span>
                        <span>•</span>
                        <span>{story.authorName}</span>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(story.submittedAt?.toDate()).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Story Details Preview */}
          <div className="lg:col-span-2">
            {selectedStory ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-gray-800">
                  <button
                    onClick={() => handleApprove(selectedStory)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <CheckCircle size={18} /> Approve & Publish
                  </button>
                  <button
                    onClick={() => handleDelete(selectedStory)}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>

                {/* Content Preview */}
                <div className="prose prose-invert max-w-2xl mx-auto">
                  {/* Header Image */}
                  {selectedStory.image && (
                    <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6">
                      <img src={selectedStory.image} alt={selectedStory.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Title & Metadata */}
                  <div className="mb-8">
                    <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm">{selectedStory.category}</span>
                    <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 leading-tight">{selectedStory.title}</h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {selectedStory.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {selectedStory.readTime}
                      </div>
                    </div>
                  </div>

                  {/* Author Details Section */}
                  <div className="bg-gray-800/50 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center md:justify-between gap-4 border border-gray-700">
                    <div className="flex items-center gap-4">
                      {selectedStory.authorImage ? (
                        <img src={selectedStory.authorImage} alt={selectedStory.authorName} className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Submitted By</div>
                        <div className="font-bold text-white text-lg">{selectedStory.authorName}</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {selectedStory.authorLinkedIn && (
                        <a href={selectedStory.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="uppercase">LinkedIn</span>
                            <ExternalLink size={12} />
                          </div>
                        </a>
                      )}
                      {selectedStory.authorX && (
                        <a href={selectedStory.authorX} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="uppercase">X / Twitter</span>
                            <ExternalLink size={12} />
                          </div>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="text-xl font-medium text-gray-300 italic mb-8 pl-4 border-l-4 border-yellow-500">
                    {selectedStory.excerpt}
                  </div>

                  {/* YouTube Embed */}
                  {selectedStory.youtubeUrl && (() => {
                    const embedUrl = getYouTubeEmbedUrl(selectedStory.youtubeUrl);
                    return embedUrl ? (
                      <div className="mb-8 rounded-xl overflow-hidden border border-gray-700">
                        <div className="relative pb-[56.25%] h-0">
                          <iframe
                            src={embedUrl}
                            title="YouTube video player"
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Rich Text Content */}
                  <div
                    className="text-gray-300 space-y-4 rich-text-content"
                    dangerouslySetInnerHTML={{ __html: selectedStory.content }}
                  />

                  {/* Styles for consistent rich text rendering */}
                  <style jsx="true">{`
                    .rich-text-content h1 { font-size: 2.25rem; font-weight: 800; color: white; margin-top: 2rem; margin-bottom: 1rem; }
                    .rich-text-content h2 { font-size: 1.875rem; font-weight: 700; color: white; margin-top: 2rem; margin-bottom: 1rem; }
                    .rich-text-content h3 { font-size: 1.5rem; font-weight: 600; color: #eab308; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                    .rich-text-content p { margin-bottom: 1.5rem; line-height: 1.8; font-size: 1.125rem; }
                    .rich-text-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                    .rich-text-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                    .rich-text-content li { margin-bottom: 0.5rem; }
                    .rich-text-content blockquote { border-left: 4px solid #eab308; padding-left: 1rem; font-style: italic; color: #9ca3af; margin: 2rem 0; background: rgba(234, 179, 8, 0.05); padding: 1.5rem; border-radius: 0.5rem; }
                    .rich-text-content a { color: #eab308; text-decoration: underline; text-underline-offset: 4px; }
                    .rich-text-content img { border-radius: 0.75rem; margin: 2rem 0; width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #374151; }
                    .rich-text-content pre { background: #111827; padding: 1rem; border-radius: 0.75rem; overflow-x: auto; border: 1px solid #374151; font-family: monospace; }
                  `}</style>

                </div>
              </div>
            ) : (
              <div className="h-[600px] bg-gray-900/50 border border-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-500 border-dashed">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p className="text-lg">Select a story to review details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmittedStories;
