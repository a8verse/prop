"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Rating {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  property: {
    id: string;
    name: string;
    slug: string;
    builder: { name: string };
    location: { name: string };
    category: { name: string };
  };
}

interface MyRatingsListProps {
  ratings: Rating[];
}

export default function MyRatingsList({ ratings: initialRatings }: MyRatingsListProps) {
  const [ratings, setRatings] = useState(initialRatings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const handleDelete = async (ratingId: string) => {
    if (!confirm("Are you sure you want to delete this rating?")) return;

    try {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRatings(ratings.filter((r) => r.id !== ratingId));
      } else {
        alert("Failed to delete rating");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      alert("An error occurred");
    }
  };

  const handleEdit = (rating: Rating) => {
    setEditingId(rating.id);
    setEditRating(rating.rating);
    setEditComment(rating.comment || "");
  };

  const handleSave = async (ratingId: string) => {
    try {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setRatings(
          ratings.map((r) => (r.id === ratingId ? { ...r, ...updated } : r))
        );
        setEditingId(null);
      } else {
        alert("Failed to update rating");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      alert("An error occurred");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment("");
  };

  if (ratings.length === 0) {
    return (
      <div className="text-center text-white/60 py-12">
        <p className="text-lg mb-2">No ratings yet</p>
        <p className="text-sm">Start rating properties to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div
          key={rating.id}
          className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-white/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Link
                href={`/projects?search=${encodeURIComponent(rating.property.name)}`}
                className="text-white font-semibold text-xl mb-2 hover:text-primary transition-colors"
              >
                {rating.property.name}
              </Link>
              <div className="text-white/60 text-sm mb-2">
                <span className="text-primary">{rating.property.builder.name}</span>
                {" • "}
                {rating.property.location.name}
                {" • "}
                {rating.property.category.name}
              </div>
              {editingId === rating.id ? (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className="text-primary"
                        >
                          {star <= editRating ? (
                            <StarIcon className="w-6 h-6" />
                          ) : (
                            <StarOutlineIcon className="w-6 h-6" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Comment
                    </label>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary focus:bg-white/15"
                      placeholder="Add a comment..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(rating.id)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating.rating ? "text-primary" : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  {rating.comment && (
                    <p className="text-white/80 text-sm mt-2">{rating.comment}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    Rated on {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>
            {editingId !== rating.id && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(rating)}
                  className="text-primary hover:text-primary-light transition-colors p-2"
                  title="Edit rating"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(rating.id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2"
                  title="Delete rating"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

