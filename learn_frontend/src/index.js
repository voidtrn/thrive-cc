import React from 'react';
import { runWithAdal } from 'react-adal';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { LoadingPage } from './components/Loading';
import { adalConfig, authContext } from './helpers/adalConfig';
import { env, securityData } from './helpers/globalHelper';
//import registerServiceWorker from './registerServiceWorker';

const rootElement = document.getElementById('root');
const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const DO_NOT_LOGIN = false;
const graphRoute = env.graphRoute || 'https://graph.microsoft.com'

// alur login sederhana
// security_isLogin -> security_activitylog -> Security_getPlatformId -> Security_ActivityLogin -> insert ke log (generateLog) -> kembali ke index -> popupplatform -> getUserPlatform -> axiosLibrary.setPlatformTheme -> axiosLibrary.changeThemeNull

authContext.handleWindowCallback()

if ((window === window.parent) && window === window.top && !authContext.isCallback(window.location.hash)) {
    if(!authContext.getCachedToken(adalConfig.clientId) || !authContext.getCachedUser()){
      localStorage.clear()
      authContext.login()
    }else{
      runWithAdal(authContext,()=>{
        securityData.Security_IsLogin().then(()=>{
          ReactDOM.render(            
            <LoadingPage loading={true}/>,rootElement)
        }).finally(()=>{
          authContext.acquireToken(graphRoute, (message, access_token) => {
              if(access_token){
                  localStorage.setItem("access_tokenPhoto", access_token)
                  ReactDOM.render(
                    <BrowserRouter basename ={baseUrl}>
                      <App cachedUser={authContext.getCachedUser()} adminLevel={securityData.Security_IsAdmin()}/>
                    </BrowserRouter>,
                    rootElement
                  );
                  //registerServiceWorker();
              }
              else{
                  authContext.acquireTokenRedirect(graphRoute);
              }
          })
        })
      },DO_NOT_LOGIN)
    }
    
    
    
}






// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

