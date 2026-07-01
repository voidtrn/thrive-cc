import React from 'react';
import { runWithAdal } from 'react-adal';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { LoadingPage } from './components/Loading';
import { adalConfig, authContext } from './helpers/adalConfig';
import { env, securityData } from './helpers/globalHelper';

const rootElement = document.getElementById('root');
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const DO_NOT_LOGIN = false;
const graphRoute = env.graphRoute || 'https://graph.microsoft.com';

// alur login sederhana
// security_isLogin -> security_activitylog -> Security_getPlatformId -> Security_ActivityLogin -> insert ke log (generateLog) -> kembali ke index -> popupplatform -> getUserPlatform -> axiosLibrary.setPlatformTheme -> axiosLibrary.changeThemeNull

const root = createRoot(rootElement);

authContext.handleWindowCallback();

if ((window === window.parent) && window === window.top && !authContext.isCallback(window.location.hash)) {
    if (!authContext.getCachedToken(adalConfig.clientId) || !authContext.getCachedUser()) {
        localStorage.clear();
        authContext.login();
    } else {
        runWithAdal(authContext, () => {
            securityData.Security_IsLogin().then(() => {
                root.render(<LoadingPage loading={true}/>);
            }).finally(() => {
                authContext.acquireToken(graphRoute, (message, access_token) => {
                    if (access_token) {
                        localStorage.setItem("access_tokenPhoto", access_token);
                        root.render(
                            <BrowserRouter basename={baseUrl}>
                                <App cachedUser={authContext.getCachedUser()} adminLevel={securityData.Security_IsAdmin()}/>
                            </BrowserRouter>
                        );
                    } else {
                        authContext.acquireTokenRedirect(graphRoute);
                    }
                });
            });
        }, DO_NOT_LOGIN);
    }
}
