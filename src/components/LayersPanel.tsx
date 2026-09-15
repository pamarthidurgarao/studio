import type { StudioState } from '../hooks/useStudioState';
import { layers } from '../data/studioData';

interface LayersPanelProps {
  studio: StudioState;
}

export function LayersPanel({ studio }: LayersPanelProps) {
  const { selectedLayer, selectLayer } = studio;

  return (
    <div className="studio-layers">
      {layers.map((layer) => (
        <div
          key={layer.key}
          className={`studio-layer-row${layer.key === selectedLayer ? ' selected' : ''}`}
          style={{ paddingLeft: 8 + layer.depth * 13 }}
          onClick={() => selectLayer(layer.key)}
        >
          <i className={layer.icon} />
          <span className="studio-layer-label">{layer.label}</span>
          <span className="studio-layer-badge">{layer.badge}</span>
        </div>
      ))}
    </div>
  );
}
