// ClientApp/src/components/QuestionItem.jsx

import React, { useState } from 'react';
import TinyMCEEditor from './TinyMCEEditor';
import OptionList from './OptionList';

const QuestionItem = ({ question, index, questions, setQuestions }) => {
  // 更新當前問題
  const updateQuestion = (updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  // 複製問題
  const copyQuestion = () => {
    const newQuestion = { ...question, id: Date.now(), options: [] };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(newQuestions);
  };

  // 刪除問題
  const deleteQuestion = () => {
    const newQuestions = questions.filter((q, i) => i !== index);
    setQuestions(newQuestions);
  };

  return (
    <div className="question-item">
      <div className="question-header">
        <span>問題 {index + 1}</span>
        <button onClick={copyQuestion} className="btn btn-secondary btn-sm">複製</button>
        <button onClick={deleteQuestion} className="btn btn-danger btn-sm">刪除</button>
      </div>
      <TinyMCEEditor
        value={question.text}
        onEditorChange={(content) => updateQuestion({ ...question, text: content })}
      />
      {/* 選項列表 */}
      <OptionList
        options={question.options}
        setOptions={(options) => updateQuestion({ ...question, options })}
      />
    </div>
  );
};

export default QuestionItem;
