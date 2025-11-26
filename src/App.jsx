import React from 'react';
import './App.css';

import LoginFormComponent from './login-form/LoginFormComponent';
import './login-form/LoginFormComponent.css';

function App() {
  return (
    <div className="App">
      <video
        className="bg-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>
      <LoginFormComponent />
    </div>
  );
}

export default App;