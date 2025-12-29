import React from "react";

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => setRating(star)}
        className={star <= rating ? "text-yellow-400" : "text-gray-300"}
      >
        ★
      </button>
    ))}
  </div>
);

export default StarRating;
