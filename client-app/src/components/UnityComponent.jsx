// client-app/src/components/UnityComponent.jsx

import React from 'react';
import Unity, { UnityContent } from 'react-unity-webgl';

const UnityComponent = () => {
  const unityContent = new UnityContent(
    'Build/UnityProject.json',
    'Build/UnityLoader.js'
  );

  return (
    <div className="unity-container">
      <Unity unityContent={unityContent} style={{ width: '600px', height: '400px' }} />
    </div>
  );
};

export default UnityComponent;
