import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {BackHandler} from 'react-native';

import {PAGE_TYPES} from '../../constants/page-type.constants';
import {getItem, setItem} from '../../utils/storage.utils';
import {useAuth} from '../Auth';

const LOCATION_STORAGE_KEY = 'location';
const DEFAULT_LOCATION = '/';

type NavigationState = {
  history: string[];
  isReady: boolean;
  location: string;
};

type PageContextValue = {
  canGoBack: boolean;
  goBack: () => void;
  isReady: boolean;
  location: string;
  navigate: (location: string) => void;
  replace: (location: string) => void;
};

const Context = createContext<PageContextValue | null>(null);

const normalizeLocation = (location: string) => {
  const trimmed = location.trim();

  if (!trimmed) {
    return DEFAULT_LOCATION;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

export const useNav = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('useNav must be used inside PageProvider.');
  }

  return context;
};

export function PageProvider({
  children,
  routes,
}: {
  children: ReactNode;
  routes: readonly string[];
}) {
  const validLocations = useMemo(
    () => new Set(routes.map(normalizeLocation)),
    [routes],
  );
  const resolveLocation = useCallback(
    (location: string) => {
      const normalizedLocation = normalizeLocation(location);
      return validLocations.has(normalizedLocation)
        ? normalizedLocation
        : DEFAULT_LOCATION;
    },
    [validLocations],
  );
  const [navigation, setNavigation] = useState<NavigationState>({
    history: [],
    isReady: false,
    location: DEFAULT_LOCATION,
  });

  useEffect(() => {
    let isMounted = true;

    getItem<string>(LOCATION_STORAGE_KEY).then(storedLocation => {
      if (!isMounted) {
        return;
      }

      setNavigation({
        history: [],
        isReady: true,
        location:
          typeof storedLocation === 'string'
            ? resolveLocation(storedLocation)
            : DEFAULT_LOCATION,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [resolveLocation]);

  useEffect(() => {
    if (navigation.isReady) {
      setItem(LOCATION_STORAGE_KEY, navigation.location).catch(error => {
        console.warn('Could not persist navigation location:', error);
      });
    }
  }, [navigation.isReady, navigation.location]);

  const navigate = useCallback((nextLocation: string) => {
    const normalizedLocation = resolveLocation(nextLocation);

    setNavigation(current => {
      if (current.location === normalizedLocation) {
        return current;
      }

      return {
        ...current,
        history: [...current.history, current.location],
        location: normalizedLocation,
      };
    });
  }, [resolveLocation]);

  const replace = useCallback((nextLocation: string) => {
    const normalizedLocation = resolveLocation(nextLocation);

    setNavigation(current => {
      if (current.location === normalizedLocation) {
        return current;
      }

      return {
        ...current,
        location: normalizedLocation,
      };
    });
  }, [resolveLocation]);

  const goBack = useCallback(() => {
    setNavigation(current => {
      const previousLocation = current.history[current.history.length - 1];

      if (!previousLocation) {
        return current;
      }

      return {
        ...current,
        history: current.history.slice(0, -1),
        location: previousLocation,
      };
    });
  }, []);

  const canGoBack = navigation.history.length > 0;

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!canGoBack) {
          return false;
        }

        goBack();
        return true;
      },
    );

    return () => subscription.remove();
  }, [canGoBack, goBack]);

  const value = useMemo<PageContextValue>(
    () => ({
      canGoBack,
      goBack,
      isReady: navigation.isReady,
      location: navigation.location,
      navigate,
      replace,
    }),
    [canGoBack, goBack, navigate, navigation, replace],
  );

  return (
    <Context.Provider value={value}>
      {navigation.isReady ? children : null}
    </Context.Provider>
  );
}

export function Path({
  path,
  element,
  type = PAGE_TYPES.PUBLIC,
}: {
  path: string;
  element: ReactNode;
  type?: string;
}) {
  const nav = useNav();
  const auth = useAuth();
  const normalizedPath = normalizeLocation(path);
  const isCurrentPath = nav.location === normalizedPath;
  const isAuthenticated = auth.isAuthenticated();
  console.log(nav.location)
  useEffect(() => {
    if (!isCurrentPath || !auth.isReady) {
      return;
    }

    if (type === PAGE_TYPES.UNKNOWN && isAuthenticated) {
      nav.replace('/rooms');
    } else if (type === PAGE_TYPES.PRIVATE && !isAuthenticated) {
      nav.replace('/');
    }
  }, [auth.isReady, isAuthenticated, isCurrentPath, nav, type]);

  if (!isCurrentPath || !auth.isReady) {
    return null;
  }

  if (
    (type === PAGE_TYPES.UNKNOWN && isAuthenticated) ||
    (type === PAGE_TYPES.PRIVATE && !isAuthenticated)
  ) {
    return null;
  }

  return <>{element}</>;
}
