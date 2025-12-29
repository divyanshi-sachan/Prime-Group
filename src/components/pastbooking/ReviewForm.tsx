import React, { useState } from "react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <StarRating rating={rating} setRating={setRating} />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit">Submit</button>
    </form>
  );
};

export default ReviewForm;
