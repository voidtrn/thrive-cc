import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { HelmetProvider } from 'react-helmet-async';
import { runWithAdal } from 'react-adal';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { LoadingPage } from './components/Loading';
import { adalConfig, authContext } from './helpers/adalConfig';
import { securityData } from './helpers/globalHelper';
import registerServiceWorker from './registerServiceWorker';

const baseUrl       = document.getElementsByTagName('base')[0].getAttribute('href');
const DO_NOT_LOGIN  = false;

authContext.handleWindowCallback()

const root = createRoot(document.getElementById("root"));

if ((window === window.parent) && window === window.top && !authContext.isCallback(window.location.hash)) {
    // console.log(localStorage)
    // console.log(getToken())
    // console.log(authContext.loginInProgress())
    // console.log(authContext.getCachedUser())
    if(!authContext.getCachedToken(adalConfig.clientId) || !authContext.getCachedUser()){
      localStorage.clear()
      authContext.login()
    }else{
      runWithAdal(authContext,()=>{
        securityData.Security_IsLogin().then(()=>{
          root.render(            
            <LoadingPage loading={true}/>)
        }).finally(()=>{
          root.render(
            <HelmetProvider>
              <BrowserRouter basename ={baseUrl}>
                <App cachedUser={authContext.getCachedUser()} adminLevel={securityData.Security_IsAdmin()}/>
              </BrowserRouter>
            </HelmetProvider>
          );
          registerServiceWorker();
        })
      },DO_NOT_LOGIN)
    }
    
    
    
}






// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

