import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import ProductDetails from './pages/Product';
import CustomerPage from './pages/Coustmer'
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
        <Route
        path='/products'
         element={
            <>
              <ProductDetails />
              {/* Add other components if needed */}
            </>
          }
          />
            <Route
        path='/customers'
         element={
            <>
              <CustomerPage />
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
