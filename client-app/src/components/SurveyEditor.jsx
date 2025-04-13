// client-app/src/components/SurveyEditor.jsx

import React, { useState, useEffect } from 'react';
import QuestionList from './QuestionList';
import axios from 'axios';
import './SurveyEditor.css'; // 建議新增相應的 CSS 檔案

const SurveyEditor = () => {
  // 問卷的狀態，包含所有問題
  const [questions, setQuestions] = useState([]);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stationName, setStationName] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // 取得類別和站別列表
  const [categories, setCategories] = useState([]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // 取得類別列表
    axios.get('/api/surveyreact/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error(error));

    // 取得站別列表
    axios.get('/api/surveyreact/stations')
      .then(response => setStations(response.data))
      .catch(error => console.error(error));
  }, []);

  // 新增新問題
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      options: [],
      answerType: 'SingleChoice', // 預設問題類型
    };
    setQuestions([...questions, newQuestion]);
  };

  // 保存問卷
  const saveSurvey = () => {
    const surveyData = {
      Title: surveyTitle,
      Description: surveyDescription,
      CategoryId: categoryId,
      StationName: stationName,
      IsPublished: isPublished,
      Questions: questions,
    };

    axios.post('/api/surveyreact/save', surveyData)
      .then(response => {
        alert('問卷已成功保存！');
        // 可以根據需要重定向或重置表單
      })
      .catch(error => {
        console.error(error);
        alert('保存問卷時發生錯誤。');
      });
  };

  return (
    <div className="survey-editor">
      <h1>問卷編輯器</h1>
      <div className="survey-info">
        <div className="form-group">
          <label>問卷標題</label>
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>問卷描述</label>
          <textarea
            value={surveyDescription}
            onChange={(e) => setSurveyDescription(e.target.value)}
            className="form-control"
          ></textarea>
        </div>
        <div className="form-group">
          <label>類別</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="form-control"
          >
            <option value="">選擇類別</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.text}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>站別</label>
          <select
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            className="form-control"
          >
            <option value="">選擇站別</option>
            {stations.map(sta => (
              <option key={sta.value} value={sta.text}>{sta.text}</option>
            ))}
          </select>
        </div>
        <div className="form-group form-check">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="form-check-input"
            id="publishCheck"
          />
          <label className="form-check-label" htmlFor="publishCheck">發布問卷</label>
        </div>
      </div>

      <QuestionList
        questions={questions}
        setQuestions={setQuestions}
      />

      <button onClick={addQuestion} className="btn btn-primary">新增問題</button>
      <button onClick={saveSurvey} className="btn btn-success">保存問卷</button>
    </div>
  );
};

export default SurveyEditor;
