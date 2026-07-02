import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import Loading from './Loading';
// import AdalConfig from './config/AdalConfig'
import AuthContext from './services/Auth';
import SSO from './helpers/SSO';

var {AllRoute,LoginData, env} = SSO;

const AdalConfig = {
  clientId: import.meta.env.VITE_CLIENT_ID,
  endpoints: {
    api: import.meta.env.VITE_CLIENT_ID,
    graph : "https://graph.microsoft.com"
    // Necessary for CORS requests, for more info see https://github.com/AzureAD/azure-activedirectory-library-for-js/wiki/CORS-usage
  },
  
  // 'tenant' is the Azure AD instance.
  tenant: import.meta.env.VITE_TENANT_ID,
  // 'cacheLocation' is set to 'sessionStorage' by default (see https://github.com/AzureAD/azure-activedirectory-library-for-js/wiki/Config-authentication-context#configurable-options).
  // We change it to'localStorage' because 'sessionStorage' does not work when our app is served on 'localhost' in development.
  cacheLocation: 'localStorage'

}
// Handle possible callbacks on id_token or access_token
AuthContext.handleWindowCallback()

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container);

// Extra callback logic, only in the actual application, not in iframes in the app
if ((window === window.parent) && window === window.top && !AuthContext.isCallback(window.location.hash)) {
    // Having both of these checks is to prevent having a token in localstorage, but no user
    //console.log(AuthContext.getCachedUser())
    if (!AuthContext.getCachedToken(AdalConfig.clientId) || !AuthContext.getCachedUser()) {
    //if (!AdalConfig.clientId|| !AuthContext.getCachedUser()) {
      localStorage.clear();
      AuthContext.login();
    } else {
      AuthContext.acquireToken(AdalConfig.endpoints.api,  (message, token, msg) => {
        if (token) {
          root.render(<HelmetProvider><Loading /></HelmetProvider>);
          //console.log(token);
          localStorage.setItem("SSO_token", token);
          // console.log(localStorage.getItem("SSO_token"));
            AuthContext.acquireToken('https://graph.microsoft.com',  (message, access_token3, msg) => {
              // console.log(access_token3);
              if(access_token3){
                  localStorage.setItem("access_tokenPhoto", access_token3)
                  root.render(<HelmetProvider><App /></HelmetProvider>)
              }else{
                  AuthContext.acquireTokenRedirect('https://graph.microsoft.com');
              }
            })
          
        }
      })

    }
  }