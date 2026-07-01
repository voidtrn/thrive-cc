
import { AuthenticationContext, withAdalLogin } from 'react-adal';

export const adalConfig = {
    tenant: import.meta.env.VITE_TENANT_ID,
    clientId: import.meta.env.VITE_CLIENT_ID,
    redirectUri: window.location.origin,
    endpoints: {
        api: import.meta.env.VITE_GRAPH_ROUTE
    },
    // postLogoutRedirectUri: window.location.href,
    cacheLocation: 'localStorage'
};

export const authContext = new AuthenticationContext(adalConfig);

export const getToken = () => authContext.getCachedToken(adalConfig.clientId);

export const withAdalLoginApi = withAdalLogin(authContext, adalConfig.endpoints.api)
