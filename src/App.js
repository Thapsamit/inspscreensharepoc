import "./App.css";
import CaptureWindow from "./components/CaptureWindow";
import ScreenShare from "./components/ScreenShare";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ScreenShare />} />
        <Route path="/capture-window" element={<CaptureWindow />} />
      </Routes>
    </div>
  );
}

export default App;
