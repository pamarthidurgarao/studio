import { useStudioState } from './hooks/useStudioState';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';

function App() {
  const studio = useStudioState();

  return (
    <div className="studio-app">
      <TopBar studio={studio} />
      <div className="studio-body">
        <Sidebar studio={studio} />
        <CanvasArea studio={studio} />
        <PropertiesPanel studio={studio} />
      </div>
    </div>
  );
}

export default App;
