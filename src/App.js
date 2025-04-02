// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Dashboard from './components/Dashboard';
// import LoggedIn from './components/LoggedIn';
// import MetadataDisplay from './components/MetadataDisplay';


// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/logged-in" element={<LoggedIn />} />
//         <Route path="/metadata-display" element={<MetadataDisplay />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LoggedIn from './components/LoggedIn';
import MetadataDisplay from './components/MetadataDisplay';

const App = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/logged-in" element={<LoggedIn />} />
        <Route path="/metadata-display" element={<MetadataDisplay />} />
        {/* Add a catch-all route for better 404 handling */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;