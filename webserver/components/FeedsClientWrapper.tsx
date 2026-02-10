'use client'

import { useState } from 'react'
import CreateFeedModal, { FeedData, Tag } from '@/components/CreateFeedModal'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Feed {
    id: number
    name: string
    description: string | null
    tagIds: number[]
    publisherIds: number[]
    tags?: Tag[] // Assuming we might pass this later, or map it
    userId: number
    createdAt: string // Serialized Date
}

export default function FeedsClientWrapper({
    initialFeeds,
}: {
    initialFeeds: Feed[]
}) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingFeed, setEditingFeed] = useState<FeedData | null>(null)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const router = useRouter()

    const handleCreate = () => {
        setEditingFeed(null)
        setIsCreateModalOpen(true)
    }

    const handleEdit = (e: React.MouseEvent, feed: Feed) => {
        e.preventDefault() // Prevent Link navigation
        e.stopPropagation()

        setEditingFeed({
            id: feed.id,
            name: feed.name,
            description: feed.description || '',
            tagIds: feed.tagIds,
            tags: [],
            publisherIds: feed.publisherIds || [], // Handle potential missing field if old data (though DB migration handles it)
        })
        setIsCreateModalOpen(true)
    }

    // Revision to handleEdit: We need to properly fetch tags to populate the modal.
    // Instead of hacking it, let's just make the modal smarter or fetch here.
    // I previously made `getTagsByIds` in `page.tsx`.
    // I will add a `useEffect` in `CreateFeedModal` to fetch tags if `initialData.tagIds` exists but `tags` is empty.

    const handleDelete = async (e: React.MouseEvent, feedId: number) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('Are you sure you want to delete this feed?')) return

        setIsDeleting(feedId)
        try {
            const res = await fetch(`/api/feeds/${feedId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                router.refresh()
            } else {
                alert('Failed to delete feed.')
            }
        } catch (error) {
            console.error('Delete failed', error)
            alert('Error deleting feed.')
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <>
            <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                    My Feeds
                </h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Create New Feed
                </button>
            </div>

            {initialFeeds.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900">
                        No feeds yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Create a custom feed to follow topics you care about.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialFeeds.map((feed) => (
                        <Link
                            key={feed.id}
                            href={`/feeds/${feed.id}`}
                            className="group block relative"
                        >
                            <article className="h-full p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex flex-col">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold font-serif text-gray-900 mb-2 group-hover:text-gray-700">
                                        {feed.name}
                                    </h2>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleEdit(e, feed)}
                                            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-black"
                                            title="Edit Feed"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) =>
                                                handleDelete(e, feed.id)
                                            }
                                            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                                            title="Delete Feed"
                                            disabled={isDeleting === feed.id}
                                        >
                                            {isDeleting === feed.id ? (
                                                <span className="animate-spin">
                                                    ...
                                                </span>
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                                    {feed.description}
                                </p>
                                <div className="text-xs text-gray-400 mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span>{feed.tagIds.length} tags</span>
                                    <span>
                                        {new Date(
                                            feed.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}

            <CreateFeedModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                initialData={editingFeed}
            />
        </>
    )
}
