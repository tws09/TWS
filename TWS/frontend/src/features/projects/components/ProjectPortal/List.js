import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import AddCardButton from './AddCardButton';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import listApiService from '../../services/listApiService';
import { handleApiError } from '../../utils/errorHandler';

const List = ({ list, onUpdate, onCardUpdate, projectId, boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState(list.name);

  const handleNameSubmit = async () => {
    if (listName.trim() && listName !== list.name) {
      try {
        const response = await listApiService.updateList(list._id, { name: listName.trim() });
        if (response.success) {
          onUpdate(list._id, { name: listName.trim() });
        }
      } catch (error) {
        handleApiError(error, 'Failed to update list name', { showToast: false });
        // Revert to original name on error
        setListName(list.name);
      }
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setListName(list.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-gray-200 rounded-lg p-3 w-80 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyPress={handleKeyPress}
            className="w-full px-2 py-1 text-sm font-medium bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div className="flex items-center flex-1">
            <h3 
              className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-300 px-2 py-1 rounded flex-1"
              onClick={() => setIsEditing(true)}
            >
              {list.name}
            </h3>
            <button className="p-1 hover:bg-gray-300 rounded">
              <EllipsisHorizontalIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 ml-2">
          {list.cards?.length || 0}
        </div>
      </div>

      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-32 space-y-2 ${
              snapshot.isDraggingOver ? 'bg-gray-300' : ''
            }`}
          >
            {list.cards?.map((card, index) => (
              <Card
                key={card._id}
                card={card}
                index={index}
                onUpdate={(updates) => onCardUpdate(list._id, card._id, updates)}
                projectId={projectId}
                boardId={boardId}
                listId={list._id}
              />
            ))}
            {provided.placeholder}
            
            <AddCardButton
              listId={list._id}
              onCardAdded={(newCard) => {
                onCardUpdate(list._id, newCard._id, newCard);
              }}
            />
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default List;
