// src/services/Auth.js
import AuthenticationContext from 'adal-angular'
//import AdalConfig from '../config/AdalConfig'

// We use this to enable logging in the adal library. When you're building for production, you should know that it's best to disable the logging.
window.Logging.log = function(message) {
   // console.log(message); // this enables logging to the console
  }
  window.Logging.level = 2 // 0 = only error, 1 = up to warnings, 2 = up to info, 3 = up to verbose

  // Initialize the authentication
  export default new AuthenticationContext({
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
  });
  