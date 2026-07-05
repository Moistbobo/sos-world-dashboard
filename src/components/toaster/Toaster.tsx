import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '../../hooks/useTheme';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      duration={4000}
      visibleToasts={4}
      theme={theme}
    />
  );
}
