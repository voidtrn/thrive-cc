// src/services/Api.js
import axios from 'axios';
import ApiConfig from '../config/ApiConfig';
//import AdalConfig from '../config/AdalConfig';
import AuthContext from './Auth'

const instance = axios.create(ApiConfig);

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


// Add a request interceptor
instance.interceptors.request.use((config) => {
    // Check and acquire a token before the request is sent
    return new Promise((resolve, reject) => {
      AuthContext.acquireToken(AdalConfig.endpoints.api, (message, idtoken, msg) => {
        if (!!idtoken) {
          config.headers.Authorization = `Bearer ${idtoken}`
          console.log("gagal");
          console.log(config);
          resolve(config)
        } else {
            // Do something with error of acquiring the token
            console.log("berhasil");
            console.log(config);
            reject(config)
        }
        //console.log(config);
      })
    })
  }, function(error) {
    // Do something with error of the request
    console.log("error");
    return Promise.reject(error)
  })

export default instance;



