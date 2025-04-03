import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoggedIn from './components/LoggedIn';
import MetadataDisplay from './components/MetadataDisplay';

const basename = process.env.PUBLIC_URL || '/';
const App = () => {
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/logged-in" element={<LoggedIn />} />
        <Route path="/metadata-display" element={<MetadataDisplay />} />
      </Routes>
    </Router>
  );
};

export default App;
