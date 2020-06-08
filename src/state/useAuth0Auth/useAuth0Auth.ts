import { useCallback, useEffect, useState } from 'react';
import createAuth0Client, { Auth0ClientOptions, Auth0Client } from '@auth0/auth0-spa-js';

const auth0Config: Auth0ClientOptions = {
  domain: process.env.DOMAIN || 'domain',
  client_id: process.env.CLIENT_ID || 'cliendID',
};

export default function useAuth0Auth() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth0Client, setAuth0] = useState<Auth0Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);

  const getToken = useCallback(
    async (identity: string, roomName: string) => {
      const headers = new window.Headers();

      const idToken = await user!.getIdToken();
      headers.set('Authorization', idToken);

      const endpoint = process.env.REACT_APP_TOKEN_ENDPOINT || '/token';
      const params = new window.URLSearchParams({ identity, roomName });

      return fetch(`${endpoint}?${params}`, { headers }).then(res => res.text());
    },
    [user]
  );

  useEffect(() => {
    const initAuth0 = async () => {
      const auth0FromHook = await createAuth0Client(auth0Config);
      setAuth0(auth0FromHook);

      // if (
      //   window.location.search.includes("code=") &&
      //   window.location.search.includes("state=")
      // ) {
      //   const { appState } = await auth0FromHook.handleRedirectCallback();
      //   onRedirectCallback(appState);
      // }

      const authenticatedResult = await auth0FromHook.isAuthenticated();

      setIsAuthenticated(authenticatedResult);

      if (authenticatedResult === true) {
        const userData = await auth0FromHook.getUser();
        setUser(userData);
      }

      setLoading(false);
      setIsAuthReady(true);
    };
    initAuth0();
    // eslint-disable-next-line
  }, []);

  const signIn = useCallback(
    async (params = {}) => {
      if (!auth0Client) {
        return;
      }

      setPopupOpen(true);

      try {
        await auth0Client.loginWithPopup(params);
      } catch (error) {
        console.error(error);
      } finally {
        setPopupOpen(false);
      }

      const userData = await auth0Client.getUser();
      setUser(userData);
      setIsAuthenticated(true);
    },
    [auth0Client]
  );

  const handleRedirectCallback = async () => {
    if (!auth0Client) {
      return;
    }

    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const userData = await auth0Client.getUser();
    setLoading(false);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = useCallback(
    (...p) => {
      if (auth0Client) {
        auth0Client.logout(...p);
        setIsAuthenticated(false);
        setUser(null);
      }
    },
    [auth0Client]
  );

  const getIdTokenClaims = useCallback((...p) => auth0Client && auth0Client.getIdTokenClaims(...p), [auth0Client]);
  const loginWithRedirect = useCallback((...p) => auth0Client && auth0Client.loginWithRedirect(...p), [auth0Client]);
  const getTokenSilently = useCallback((...p) => auth0Client && auth0Client.getTokenSilently(...p), [auth0Client]);
  const getTokenWithPopup = useCallback((...p) => auth0Client && auth0Client.getTokenWithPopup(...p), [auth0Client]);

  return {
    user,
    signIn,
    logout,
    isAuthReady,
    isAuthenticated,
    loading,
    popupOpen,
    getToken,
    getIdTokenClaims,
    loginWithRedirect,
    getTokenSilently,
    getTokenWithPopup,
    handleRedirectCallback,
  };
}
