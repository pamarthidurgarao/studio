import { useState } from 'react';
import { useStudioState } from './hooks/useStudioState';
import { useThemeMode } from './hooks/useThemeMode';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PagesLanding } from './components/PagesLanding';
import { PreviewOverlay } from './components/PreviewOverlay';
import { useDataTableEditor } from './hooks/useDataTableEditor';
import { useDynamicFormEditor } from './hooks/useDynamicFormEditor';
import { useStepperFormEditor } from './hooks/useStepperFormEditor';
import { STUDIO_TABLE_PRESETS } from './data/studioTableConfigs';
import { STUDIO_FORM_PRESETS } from './data/studioFormConfigs';
import { STUDIO_STEPPER_PRESETS } from './data/studioStepperConfigs';
import type { StudioPageItem } from './data/pagesData';

type View = 'pages' | 'studio';

function App() {
  const studio = useStudioState();
  const { sidebarOpen, panelOpen, sidebarCollapsed, propertiesCollapsed, closeDrawers } = studio;
  const { theme, toggleTheme } = useThemeMode();
  const [view, setView] = useState<View>('pages');
  const [activePage, setActivePage] = useState<StudioPageItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const tablePreset = activePage?.type === 'table' ? STUDIO_TABLE_PRESETS[activePage.id] : undefined;
  const tableEditor = useDataTableEditor(tablePreset, activePage?.id);

  const formPreset = activePage?.type === 'form' ? STUDIO_FORM_PRESETS[activePage.id] : undefined;
  const formEditor = useDynamicFormEditor(formPreset, activePage?.id);

  const stepperPreset = activePage?.type === 'stepper' ? STUDIO_STEPPER_PRESETS[activePage.id] : undefined;
  const stepperEditor = useStepperFormEditor(stepperPreset, activePage?.id);

  const openPage = (page: StudioPageItem) => {
    setActivePage(page);
    setView('studio');
    setPreviewOpen(false);
  };

  if (view === 'pages') {
    return <PagesLanding onSelectPage={openPage} theme={theme} onToggleTheme={toggleTheme} />;
  }

  const gridCols =
    sidebarCollapsed && propertiesCollapsed
      ? 'grid-cols-1 md:grid-cols-[44px_minmax(0,1fr)_44px]'
      : sidebarCollapsed
        ? 'grid-cols-1 md:grid-cols-[44px_minmax(0,1fr)_260px] xl:grid-cols-[44px_minmax(0,1fr)_296px]'
        : propertiesCollapsed
          ? 'grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_44px] xl:grid-cols-[248px_minmax(0,1fr)_44px]'
          : 'grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)_260px] xl:grid-cols-[248px_minmax(0,1fr)_296px]';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--color-bg)]">
      <TopBar
        studio={studio}
        theme={theme}
        onToggleTheme={toggleTheme}
        onBackToPages={() => setView('pages')}
        onPreview={activePage ? () => setPreviewOpen(true) : undefined}
        pageTitle={activePage?.title}
      />
      <div className={`flex-1 grid ${gridCols} min-h-0 relative transition-[grid-template-columns] duration-150`}>
        <Sidebar studio={studio} activePage={activePage} onSelectPage={openPage} />
        <CanvasArea
          studio={studio}
          activePage={activePage}
          tableEditor={activePage?.type === 'table' ? tableEditor : undefined}
          formEditor={activePage?.type === 'form' ? formEditor : undefined}
          stepperEditor={activePage?.type === 'stepper' ? stepperEditor : undefined}
        />
        <PropertiesPanel
          studio={studio}
          tableEditor={activePage?.type === 'table' ? tableEditor : undefined}
          formEditor={activePage?.type === 'form' ? formEditor : undefined}
          stepperEditor={activePage?.type === 'stepper' ? stepperEditor : undefined}
          activePageId={activePage?.id}
        />
        <div
          className={`lg:hidden fixed inset-x-0 top-12 bottom-0 z-30 bg-black/50 transition-opacity duration-200 ${
            sidebarOpen || panelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeDrawers}
          aria-hidden="true"
        />
      </div>

      {previewOpen && activePage && (
        <PreviewOverlay
          activePage={activePage}
          tableEditor={activePage.type === 'table' ? tableEditor : undefined}
          formEditor={activePage.type === 'form' ? formEditor : undefined}
          stepperEditor={activePage.type === 'stepper' ? stepperEditor : undefined}
          onExit={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
