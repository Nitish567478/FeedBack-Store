import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  currentRating = 0,
  onRatingSubmit,
  readOnly = false,
  size = 'md',
  showScore = false,
  submitting = false
}) => {
  const [hover, setHover] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  const getScoreDisplay = () => {
    if (hover > 0) return `${hover} Stars`;
    if (currentRating > 0) return `${currentRating} Stars`;
    return 'Unrated';
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`flex items-center space-x-1 ${readOnly || submitting ? 'cursor-default' : 'cursor-pointer'}`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hover || currentRating);

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly || submitting}
              className={`p-0.5 transition-all duration-150 transform ${
                !readOnly && !submitting
                  ? 'hover:scale-125 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded'
                  : ''
              }`}
              onClick={() => {
                if (!readOnly && onRatingSubmit) {
                  onRatingSubmit(star);
                }
              }}
              onMouseEnter={() => !readOnly && !submitting && setHover(star)}
              onMouseLeave={() => !readOnly && !submitting && setHover(0)}
              title={readOnly ? `${currentRating} Stars` : `Rate ${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSize} transition-colors duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-slate-600 fill-transparent hover:text-slate-500'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold text-slate-300 ml-1">
          {getScoreDisplay()}
        </span>
      )}
    </div>
  );
};
