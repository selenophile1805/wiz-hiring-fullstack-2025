import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import MyBookingsPage from './pages/MyBookingsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />
            <Route path="/create" element={<CreateEventPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4 mt-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
            Made with ❤️ by Chetan
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
