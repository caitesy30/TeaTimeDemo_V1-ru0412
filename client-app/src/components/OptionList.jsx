// client-app/src/components/OptionList.jsx

import React from 'react';
import OptionItem from './OptionItem';

const OptionList = ({ options, setOptions }) => {
  // 新增選項
  const addOption = () => {
    const newOption = { id: Date.now(), text: '', isCorrect: false, isOther: false };
    setOptions([...options, newOption]);
  };

  // 更新選項
  const updateOption = (index, updatedOption) => {
    const newOptions = [...options];
    newOptions[index] = updatedOption;
    setOptions(newOptions);
  };

  // 刪除選項
  const deleteOption = (index) => {
    const newOptions = options.filter((o, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <div className="option-list">
      {options.map((option, index) => (
        <OptionItem
          key={option.id}
          option={option}
          index={index}
          updateOption={updateOption}
          deleteOption={deleteOption}
        />
      ))}
      <button onClick={addOption} className="btn btn-primary btn-sm">新增選項</button>
    </div>
  );
};

export default OptionList;
