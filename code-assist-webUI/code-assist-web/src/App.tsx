import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Theme } from '@carbon/react';
import EvaluationReport from './components/evaluation-report/EvaluationReport';
import Navigation from './components/layout/navigation/Navigation';
import MainHeader from './components/layout/main-header/MainHeader';
import Dashboard from "./components/layout/dashboard/Dashboard";
import Leaderboard from './components/evaluation-metrics/EvaluationMetrics';

const App: React.FC = () => {
  return (
      <Theme theme="g100">
        <div className="app">
          <Router>
            <Navigation>
              <MainHeader />
            </Navigation>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/summary" element={<EvaluationReport />} />
              <Route path='/leaderboard' element={<Leaderboard />} />
            </Routes>
          </Router>
        </div>
      </Theme>
  );
};

export default App;
