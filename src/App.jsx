import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      {/* Router should wrap everything that depends on routes */}
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              {/* Add other components if needed */}
            </>
          }
        />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;
