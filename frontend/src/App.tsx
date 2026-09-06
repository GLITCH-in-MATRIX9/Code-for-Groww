import {
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import GuidePage from "./pages/Guide";


function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/guide"
        element={<GuidePage />}
      />

    </Routes>

  );

}


export default App;