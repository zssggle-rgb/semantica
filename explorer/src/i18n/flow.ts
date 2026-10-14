import type { AriaLabelConfig } from '@xyflow/react';
import { uiText } from './index';

// React Flow's native localization contract; no DOM replacement.
export const flowLabels: Partial<AriaLabelConfig> = {
  'node.a11yDescription.default': uiText('Press enter or space to select a node. Press delete to remove it and escape to cancel.'),
  'node.a11yDescription.keyboardDisabled': uiText('Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.'),
  'edge.a11yDescription.default': uiText('Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.'),
  'controls.ariaLabel': uiText('Control Panel'),
  'controls.zoomIn.ariaLabel': uiText('Zoom In'),
  'controls.zoomOut.ariaLabel': uiText('Zoom Out'),
  'controls.fitView.ariaLabel': uiText('Fit View'),
  'controls.interactive.ariaLabel': uiText('Toggle Interactivity'),
  'minimap.ariaLabel': uiText('Mini Map'),
  'handle.ariaLabel': uiText('Handle'),
};
