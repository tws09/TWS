import React, { useState } from 'react';
import { useLongPress } from '../../hooks/useLongPress';
import { useSwipe } from '../../hooks/useSwipe';
import { HeartIcon, HandThumbUpIcon, FaceSmileIcon, ShareIcon } from '@heroicons/react/24/outline';

/**
 * Example component demonstrating useLongPress and useSwipe hooks
 * This shows how to implement touch gestures for mobile messaging
 */
const LongPressExample = () => {
  const [pressCount, setPressCount] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState('');
  const [selectedReaction, setSelectedReaction] = useState('');
  const [showActions, setShowActions] = useState(false);

  // Long press handler for showing reaction menu
  const handleLongPress = () => {
    setShowActions(true);
    setPressCount(prev => prev + 1);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Long press hook configuration
  const longPressHandlers = useLongPress(handleLongPress, {
    threshold: 500, // 500ms to trigger
    onStart: () => {
      console.log('Long press started');
    },
    onFinish: () => {
      console.log('Long press finished');
    },
    onCancel: () => {
      console.log('Long press cancelled');
      setShowActions(false);
    }
  });

  // Swipe handlers
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      setSwipeDirection('Left');
      setTimeout(() => setSwipeDirection(''), 2000);
    },
    onSwipeRight: () => {
      setSwipeDirection('Right');
      setTimeout(() => setSwipeDirection(''), 2000);
    },
    onSwipeUp: () => {
      setSwipeDirection('Up');
      setTimeout(() => setSwipeDirection(''), 2000);
    },
    onSwipeDown: () => {
      setSwipeDirection('Down');
      setTimeout(() => setSwipeDirection(''), 2000);
    }
  }, {
    minDistance: 50,
    maxTime: 300,
    threshold: 0.3
  });

  const reactions = [
    { emoji: '👍', label: 'Like', icon: HandThumbUpIcon },
    { emoji: '❤️', label: 'Love', icon: HeartIcon },
    { emoji: '😂', label: 'Laugh', icon: FaceSmileIcon },
    { emoji: '🔥', label: 'Fire', icon: ShareIcon }
  ];

  const handleReaction = (emoji) => {
    setSelectedReaction(emoji);
    setShowActions(false);
    setTimeout(() => setSelectedReaction(''), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Touch Gesture Demo
      </h2>
      
      {/* Long Press Demo */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Long Press Demo</h3>
        <div
          className={`relative p-6 bg-blue-100 rounded-lg border-2 border-dashed border-blue-300 text-center cursor-pointer transition-all duration-200 ${
            longPressHandlers.longPressTriggered ? 'bg-blue-200 scale-105' : 'hover:bg-blue-150'
          }`}
          {...longPressHandlers}
        >
          <p className="text-blue-800 font-medium">
            Long press me for 500ms
          </p>
          <p className="text-sm text-blue-600 mt-2">
            Press count: {pressCount}
          </p>
          
          {/* Reaction Menu */}
          {showActions && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-white rounded-lg shadow-lg border p-2 flex space-x-2 z-10">
              {reactions.map((reaction) => (
                <button
                  key={reaction.emoji}
                  onClick={() => handleReaction(reaction.emoji)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={reaction.label}
                >
                  <span className="text-lg">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {selectedReaction && (
          <div className="mt-3 p-3 bg-green-100 rounded-lg text-center">
            <p className="text-green-800">
              You reacted with {selectedReaction}
            </p>
          </div>
        )}
      </div>

      {/* Swipe Demo */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Swipe Demo</h3>
        <div
          className="p-6 bg-purple-100 rounded-lg border-2 border-dashed border-purple-300 text-center cursor-pointer"
          {...swipeHandlers}
        >
          <p className="text-purple-800 font-medium">
            Swipe in any direction
          </p>
          {swipeDirection && (
            <p className="text-sm text-purple-600 mt-2">
              Swiped: {swipeDirection}
            </p>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-2">Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Long Press:</strong> Hold for 500ms to show reaction menu</li>
          <li>• <strong>Swipe:</strong> Swipe in any direction (min 50px distance)</li>
          <li>• <strong>Mobile:</strong> Use touch gestures on mobile devices</li>
          <li>• <strong>Desktop:</strong> Use mouse click and drag</li>
        </ul>
      </div>

      {/* Code Example */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4 text-white text-sm overflow-x-auto">
        <h4 className="font-semibold mb-2 text-gray-300">Usage Example:</h4>
        <pre className="text-gray-300">
{`import { useLongPress, useSwipe } from './hooks';

const longPress = useLongPress(handleLongPress, {
  threshold: 500,
  onStart: () => console.log('Started'),
  onCancel: () => console.log('Cancelled')
});

const swipe = useSwipe({
  onSwipeLeft: () => console.log('Left'),
  onSwipeRight: () => console.log('Right')
});

return (
  <div {...longPress} {...swipe}>
    Interactive Element
  </div>
);`}
        </pre>
      </div>
    </div>
  );
};

export default LongPressExample;
