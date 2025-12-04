import { ReactNode, useRef, useState } from "react";

interface SwipeableProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 80,
  disabled = false,
}: SwipeableProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const actionWidth = useRef(0);
  const isHorizontalSwipe = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || disabled) return;
    currentX.current = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = Math.abs(startX.current - currentX.current);
    const diffY = Math.abs(startY.current - currentY);
    const diff = startX.current - currentX.current;

    // Determine if this is a horizontal swipe on first significant movement
    if (!isHorizontalSwipe.current && (diffX > 5 || diffY > 5)) {
      isHorizontalSwipe.current = diffX > diffY;
    }

    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;

    // Determine action width based on swipe direction
    const maxWidth = diff > 0 ? (leftAction ? 80 : 0) : rightAction ? 80 : 0;
    actionWidth.current = maxWidth;

    // Allow both left and right swipe
    if (diff > 0 && leftAction) {
      // Swipe left
      setTranslateX(Math.min(diff, maxWidth));
    } else if (diff < 0 && rightAction) {
      // Swipe right
      setTranslateX(Math.max(diff, -maxWidth));
    } else if ((diff > 0 && !leftAction) || (diff < 0 && !rightAction)) {
      // Reset if no action available for this direction
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    if (Math.abs(translateX) >= threshold / 2) {
      // Snap to open position to reveal the action button
      setTranslateX(
        translateX > 0 ? actionWidth.current : -actionWidth.current
      );
    } else {
      // Snap back to closed
      setTranslateX(0);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    if (action) {
      action();
    }
    setTranslateX(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left action (revealed on swipe left) */}
      {leftAction && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center cursor-pointer"
          style={{ width: "80px" }}
          onClick={(e) => handleActionClick(e, onSwipeLeft)}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onSwipeLeft) {
              onSwipeLeft();
            }
            setTranslateX(0);
          }}
        >
          {leftAction}
        </div>
      )}

      {/* Right action (revealed on swipe right) */}
      {rightAction && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center cursor-pointer"
          style={{ width: "80px" }}
          onClick={(e) => handleActionClick(e, onSwipeRight)}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onSwipeRight) {
              onSwipeRight();
            }
            setTranslateX(0);
          }}
        >
          {rightAction}
        </div>
      )}

      {/* Swipeable content */}
      <div
        className="relative bg-background touch-pan-y z-10"
        style={{
          transform: `translateX(-${translateX}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
