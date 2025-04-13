// client-app/src/components/TinyMCEEditor.jsx

import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

const TinyMCEEditor = ({ value, onEditorChange }) => {
  return (
    <Editor
      apiKey="YOUR_TINYMCE_API_KEY" // 請替換為您的 TinyMCE API 金鑰
      initialValue={value}
      init={{
        height: 200,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount',
          'table', // 啟用表格插件
        ],
        toolbar:
          'undo redo | formatselect | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help | table',
      }}
      onEditorChange={onEditorChange}
    />
  );
};

export default TinyMCEEditor;
