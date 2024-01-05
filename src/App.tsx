import { Route, Routes } from 'react-router-dom';
import './App.scss';
import { ROUTE_URL } from './constrains/router';
import HomePage from './pages/HomePage';
import CodeRoom from './pages/CodeRoom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={ROUTE_URL.HOME} element={<HomePage />} />
        <Route path={ROUTE_URL.CODE_ROOM} element={<CodeRoom />} />
      </Routes>
    </div>
  );
}

export default App;
