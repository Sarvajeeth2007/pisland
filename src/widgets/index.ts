import { QuickControlsWidget } from './QuickControlsWidget';
import { MediaWidget } from './MediaWidget';
import { ClipboardWidget } from './ClipboardWidget';
import { SystemStatsWidget } from './SystemStatsWidget';
import { WeatherWidget } from './WeatherWidget';
import { CalendarWidget } from './CalendarWidget';

export const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  'quick-controls': QuickControlsWidget,
  'media': MediaWidget,
  'clipboard': ClipboardWidget,
  'system-stats': SystemStatsWidget,
  'weather': WeatherWidget,
  'calendar': CalendarWidget,
};

export { QuickControlsWidget, MediaWidget, ClipboardWidget, SystemStatsWidget, WeatherWidget, CalendarWidget };
