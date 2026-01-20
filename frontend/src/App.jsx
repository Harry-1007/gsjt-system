import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Introduction from './pages/Introduction';
import Tutorial from './pages/Tutorial';
import Assessment from './pages/Assessment';
import Completion from './pages/Completion';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/intro" element={<Introduction />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/complete" element={<Completion />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
