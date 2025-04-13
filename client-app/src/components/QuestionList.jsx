// client-app/src/components/QuestionList.jsx

import React from 'react';
import QuestionItem from './QuestionItem';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const QuestionList = ({ questions, setQuestions }) => {
  // 處理拖放結果
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedQuestions = Array.from(questions);
    const [removed] = reorderedQuestions.splice(result.source.index, 1);
    reorderedQuestions.splice(result.destination.index, 0, removed);
    setQuestions(reorderedQuestions);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="questions">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {questions.map((question, index) => (
              <Draggable key={question.id} draggableId={`${question.id}`} index={index}>
                {(provided) => (
                  <div
                    className="question-draggable"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <QuestionItem
                      question={question}
                      index={index}
                      questions={questions}
                      setQuestions={setQuestions}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default QuestionList;
