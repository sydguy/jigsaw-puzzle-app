import { registerRootComponent } from 'expo';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

LoadSkiaWeb({ locateFile: (file: string) => `/${file}` })
  .then(() => import('./src/App'))
  .then(({ default: App }) => registerRootComponent(App))
  .catch(() => {
    const message = document.createElement('p');
    message.textContent = 'Skia preview failed to load. Check the local CanvasKit asset and console.';
    document.body.appendChild(message);
  });
