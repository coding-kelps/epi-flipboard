'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface Tag {
    tag_id: number;
    name: string;
}


export interface FeedData {
    id?: number;
    name: string;
    description: string;
    tagIds: number[];
    tags?: Tag[]; // Helper for UI display if available
}

interface CreateFeedModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: FeedData | null;
}

export default function CreateFeedModal({ isOpen, onClose, initialData }: CreateFeedModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [tagQuery, setTagQuery] = useState('');
    const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setDescription(initialData.description);
                if (initialData.tags && initialData.tags.length > 0) {
                    setSelectedTags(initialData.tags);
                } else if (initialData.tagIds && initialData.tagIds.length > 0) {
                    // Fetch tags by IDs since we don't have them
                    // We don't have a specific bulk fetch endpoint for tags by IDs exposed to client easily
                    // But we can assume we might need one or reuse search?
                    // Reusing search for each ID is bad.
                    // Let's create a quick loop or just leave it blank for now?
                    // User expects to see their tags.
                    // I will implement a small helper to fetch tags. 
                    // Since I cannot easily create a new endpoint inside this component, 
                    // I will use a Promise.all with the search endpoint? No, search is by name.
                    // I'll create a new server action or util? No, 'DELETE actions/feeds.ts'.
                    // I will add a `ids` param to the search endpoint! /api/tags/search?ids=1,2,3

                    fetch(`/api/tags/search?ids=${initialData.tagIds.join(',')}`)
                        .then(res => res.json())
                        .then(tags => setSelectedTags(tags))
                        .catch(err => console.error("Failed to load tags for edit", err));
                }
            } else {
                setName('');
                setDescription('');
                setSelectedTags([]);
            }
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        const fetchTags = async () => {
            if (tagQuery.length < 2) {
                setTagSuggestions([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await fetch(`/api/tags/search?q=${encodeURIComponent(tagQuery)}`);
                if (res.ok) {
                    const tags: Tag[] = await res.json();
                    setTagSuggestions(tags.filter(t => !selectedTags.some(selected => selected.tag_id === t.tag_id)));
                }
            } catch (error) {
                console.error("Failed to search tags", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchTags, 300);
        return () => clearTimeout(timeoutId);
    }, [tagQuery, selectedTags]);

    const handleAddTag = (tag: Tag) => {
        setSelectedTags([...selectedTags, tag]);
        setTagQuery('');
        setTagSuggestions([]);
    };

    const handleRemoveTag = (tagId: number) => {
        setSelectedTags(selectedTags.filter(t => t.tag_id !== tagId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || selectedTags.length === 0) return;

        setIsSubmitting(true);
        try {
            const isEdit = !!initialData?.id;
            const url = isEdit ? `/api/feeds/${initialData.id}` : '/api/feeds';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    tagIds: selectedTags.map(t => t.tag_id),
                }),
            });

            if (res.ok) {
                onClose();
                setName('');
                setDescription('');
                setSelectedTags([]);
                router.refresh();
            } else {
                throw new Error('Failed to save feed');
            }
        } catch (error) {
            console.error("Failed to save feed", error);
            alert("Failed to save feed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-serif">{initialData ? 'Edit Feed' : 'Create New Feed'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="e.g. Tech Trends"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="What is this feed about?"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Required)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedTags.map(tag => (
                                <span key={tag.tag_id} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-sm">
                                    {tag.name}
                                    <button type="button" onClick={() => handleRemoveTag(tag.tag_id)} className="hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={tagQuery}
                                onChange={(e) => setTagQuery(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="Search tags..."
                            />
                            {isSearching && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                                </div>
                            )}

                            {tagSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {tagSuggestions.map(tag => (
                                        <button
                                            key={tag.tag_id}
                                            type="button"
                                            onClick={() => handleAddTag(tag)}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || selectedTags.length === 0 || !name.trim()}
                            className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Feed')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
