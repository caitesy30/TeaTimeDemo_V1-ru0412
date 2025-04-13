// client-app/src/components/OptionItem.jsx

import React from 'react';

const OptionItem = ({ option, index, updateOption, deleteOption }) => {
  return (
    <div className="option-item">
      <input
        type="text"
        value={option.text}
        onChange={(e) => updateOption(index, { ...option, text: e.target.value })}
        placeholder={`選項 ${index + 1} 描述`}
        className="form-control mb-2"
      />
      <div className="form-check">
        <input
          type="checkbox"
          checked={option.isCorrect}
          onChange={(e) => updateOption(index, { ...option, isCorrect: e.target.checked })}
          className="form-check-input"
          id={`correctCheck-${option.id}`}
        />
        <label className="form-check-label" htmlFor={`correctCheck-${option.id}`}>正確答案</label>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          checked={option.isOther}
          onChange={(e) => updateOption(index, { ...option, isOther: e.target.checked })}
          className="form-check-input"
          id={`otherCheck-${option.id}`}
        />
        <label className="form-check-label" htmlFor={`otherCheck-${option.id}`}>其他選項</label>
      </div>
      <button onClick={() => deleteOption(index)} className="btn btn-danger btn-sm mt-2">刪除選項</button>
    </div>
  );
};

export default OptionItem;
