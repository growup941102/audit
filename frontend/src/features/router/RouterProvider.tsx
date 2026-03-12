import { RouterProvider as Provider } from 'react-router-dom';

import { router } from './router';
import { RouterContext } from './router-context';

export const RouterProvider = () => {
  const reactRouter = useSyncExternalStore(
    router.subscribe,
    () => router.reactRouter,
    () => router.reactRouter
  );

  return (
    <RouterContext.Provider value={router}>
      <Provider router={reactRouter} />
    </RouterContext.Provider>
  );
};
