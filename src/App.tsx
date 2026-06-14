import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import { SecurityProvider } from './contexts/SecurityContext';
import Security from './pages/Security';
import Settings from './pages/Settings';
import CalendarView from './pages/CalendarView';
import EntriesArchive from './pages/EntriesArchive';
import FutureLetters from './pages/FutureLetters';
import StubPage from './pages/StubPage';
import './main.css';

function App() {
  return (
    <BrowserRouter>
      <SecurityProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="auth" element={<Auth />} />
            <Route path="new" element={<NewEntry />} />
            <Route path="security" element={<Security />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="entries" element={<EntriesArchive />} />
            <Route path="mood-analytics" element={<StubPage title="Mood Analytics" />} />
            <Route path="future-letters" element={<FutureLetters />} />
            <Route path="import-export" element={<Settings />} />
          </Route>
        </Routes>
      </SecurityProvider>
    </BrowserRouter>
  );
}

export default App;
