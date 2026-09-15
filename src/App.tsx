import { useStudioState } from './hooks/useStudioState';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';

function App() {
  const studio = useStudioState();
  const { sidebarOpen, panelOpen, closeDrawers } = studio;

  return (
    <div className="studio-app">
      <TopBar studio={studio} />
      <div className="studio-body">
        <Sidebar studio={studio} />
        <CanvasArea studio={studio} />
        <PropertiesPanel studio={studio} />
        <div
          className={`studio-scrim${sidebarOpen || panelOpen ? ' visible' : ''}`}
          onClick={closeDrawers}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default App;
