import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY} from '../../constants/app.consts';
import {AUTH_API_ENDPOINTS} from '../../constants/api.consts';
import {getItem, removeItem, setItem} from '../../utils/storage.utils';
import {useNav} from '../Pages';

interface UserInfo {
  addresses: unknown[];
  created_at: Date;
  first_name: string | null;
  id: string;
  isAssociate: boolean;
  is_admin: boolean;
  last_name: string | null;
  national_id: string | null;
  orders: unknown[];
  phone_number: string;
  preferences: unknown;
  transactions: unknown[];
}

interface AuthContext {
  accessToken: string;
  isAuthenticated: () => boolean;
  isReady: boolean;
  refreshToken: string;
  saveTokens: (
    accessToken: string,
    refreshToken: string | null,
  ) => Promise<void>;
  setAccessToken: Dispatch<SetStateAction<string>>;
  setRefreshToken: Dispatch<SetStateAction<string>>;
  setUserInfo: Dispatch<SetStateAction<UserInfo | null>>;
  userInfo: UserInfo | null;
}

const Context = createContext<AuthContext | null>(null);

export const useAuth = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
};

export default function AuthProvider({children}: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [refreshToken, setRefreshToken] = useState('');
  const [isReady, setIsReady] = useState(false);
  const {replace} = useNav();

  const refreshUser = useCallback(async () => {
    const response = await fetch(AUTH_API_ENDPOINTS.REFRESH, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      setAccessToken('');
      setRefreshToken('');
      setUserInfo(null);
      await Promise.all([
        removeItem(ACCESS_TOKEN_KEY),
        removeItem(REFRESH_TOKEN_KEY),
      ]);
      replace('/');
      return;
    }

    const data = await response.json();
    const renewedAccessToken = data.access_token as string;
    const renewedRefreshToken = response.headers.get('set-cookie') ?? '';

    setAccessToken(renewedAccessToken);
    setRefreshToken(renewedRefreshToken);
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, renewedAccessToken),
      setItem(REFRESH_TOKEN_KEY, renewedRefreshToken),
    ]);
  }, [replace]);

  const initUserInfo = useCallback(
    async (token: string) => {
      const response = await fetch(AUTH_API_ENDPOINTS.USER_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData.user);
        return;
      }

      if (response.status === 401) {
        setAccessToken('');
        setUserInfo(null);
        await removeItem(ACCESS_TOKEN_KEY);
      }
    },
    [],
  );

  const initTokens = useCallback(async () => {
    const [storedAccessToken, storedRefreshToken] = await Promise.all([
      getItem<string>(ACCESS_TOKEN_KEY),
      getItem<string>(REFRESH_TOKEN_KEY),
    ]);

    if (typeof storedAccessToken === 'string') {
      setAccessToken(storedAccessToken);
      initUserInfo(storedAccessToken).catch(error => {
        console.warn('Could not load user profile:', error);
      });
    }

    if (typeof storedRefreshToken === 'string') {
      setRefreshToken(storedRefreshToken);
    }

    setIsReady(true);
  }, [initUserInfo]);

  useEffect(() => {
    initTokens().catch(error => {
      console.warn('Could not initialize authentication:', error);
      setIsReady(true);
    });
  }, [initTokens]);

  useEffect(() => {
    if (!accessToken && refreshToken && isReady) {
      refreshUser().catch(error => {
        console.warn('Could not refresh authentication:', error);
      });
    }
  }, [accessToken, isReady, refreshToken, refreshUser]);

  const saveTokens = useCallback(
    async (nextAccessToken: string, nextRefreshToken: string | null) => {
      const writes: Promise<void>[] = [];

      if (nextAccessToken) {
        writes.push(setItem(ACCESS_TOKEN_KEY, nextAccessToken));
      }

      if (nextRefreshToken) {
        writes.push(setItem(REFRESH_TOKEN_KEY, nextRefreshToken));
      }

      await Promise.all(writes);
    },
    [],
  );

  const isAuthenticated = useCallback(
    () => Boolean(accessToken && refreshToken),
    [accessToken, refreshToken],
  );

  return (
    <Context.Provider
      value={{
        accessToken,
        isAuthenticated,
        isReady,
        refreshToken,
        saveTokens,
        setAccessToken,
        setRefreshToken,
        setUserInfo,
        userInfo,
      }}>
      {children}
    </Context.Provider>
  );
}
