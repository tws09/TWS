import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { 
  CalendarIcon, 
  UserIcon, 
  PaperClipIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import CardModal from './CardModal';
import { PRIORITY_COLORS } from '../../constants/projectConstants';
import { formatCardDueDate } from '../../utils/dateUtils';

const Card = ({ card, index, onUpdate, projectId, boardId, listId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPriorityColor = (priority) => {
    const priorityColors = PRIORITY_COLORS[priority];
    if (priorityColors) {
      return priorityColors.bg.replace('-100', '-500');
    }
    return 'bg-gray-500';
  };

  const dueDateInfo = formatCardDueDate(card.dueDate);
  const completedSubtasks = card.subtasks?.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = card.subtasks?.length || 0;

  return (
    <>
      <Draggable draggableId={card._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
            } ${card.completed ? 'opacity-75' : ''}`}
            onClick={() => setIsModalOpen(true)}
          >
            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-medium text-white rounded"
                    style={{ backgroundColor: label.color || '#6B7280' }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {card.title}
            </h4>

            {/* Description */}
            {card.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {card.description}
              </p>
            )}

            {/* Subtasks Progress */}
            {totalSubtasks > 0 && (
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Priority */}
                {card.priority && card.priority !== 'medium' && (
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(card.priority)}`} />
                )}

                {/* Due Date */}
                {dueDateInfo && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                    <span className={`text-xs ${dueDateInfo.color}`}>
                      {dueDateInfo.text}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-1">
                {/* Attachments */}
                {card.attachments && card.attachments.length > 0 && (
                  <div className="flex items-center">
                    <PaperClipIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 ml-1">
                      {card.attachments.length}
                    </span>
                  </div>
                )}

                {/* Comments */}
                {card.comments && card.comments.length > 0 && (
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 ml-1">
                      {card.comments.length}
                    </span>
                  </div>
                )}

                {/* Time Tracking */}
                {card.timeTracking?.actualHours > 0 && (
                  <div className="flex items-center">
                    <ClockIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 ml-1">
                      {card.timeTracking.actualHours}h
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignees */}
            {card.assignees && card.assignees.length > 0 && (
              <div className="flex items-center mt-2">
                <div className="flex -space-x-1">
                  {card.assignees.slice(0, 3).map((assignee, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                      title={assignee.fullName}
                    >
                      {assignee.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                  ))}
                  {card.assignees.length > 3 && (
                    <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                      +{card.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        card={card}
        onUpdate={onUpdate}
        projectId={projectId}
        boardId={boardId}
        listId={listId}
      />
    </>
  );
};

export default Card;
