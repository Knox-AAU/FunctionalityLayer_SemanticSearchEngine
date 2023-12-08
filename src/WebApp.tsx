// import screens here
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Mainscreen from './screens/Mainscreen';
import AdminScreen from './screens/AdminScreen';

// main router
const WebApp = () => {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Mainscreen />} />
        <Route path="/admin" element={<AdminScreen />} />
      </Routes>
    </Router>
  );
}

export default WebApp;