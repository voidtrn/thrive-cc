
import { AuthenticationContext, withAdalLogin } from 'react-adal';

export const adalConfig = {
    tenant: process.env.REACT_APP_TENANT_ID,
    clientId: process.env.REACT_APP_CLIENT_ID,
    redirectUri: window.location.origin,
    endpoints: {
        api: process.env.REACT_APP_GRAPH_ROUTE
    },
    // postLogoutRedirectUri: window.location.href,
    cacheLocation: 'localStorage'
};

export const authContext = new AuthenticationContext(adalConfig);

export const getToken = () => authContext.getCachedToken(adalConfig.clientId);

export const withAdalLoginApi = withAdalLogin(authContext, adalConfig.endpoints.api)
