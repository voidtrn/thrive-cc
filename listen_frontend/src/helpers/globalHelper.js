import axiosLibrary from "./axiosLibrary";
import {isMobile} from 'react-device-detect';

class securityData{
    static setSelectedPlatformId(data=null){
        if(data!=null){
            localStorage.setItem("platform_id",data);
            return true
        }else{
            return false
        }
    }

    static Security_UserId(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.id;
    }

    static Security_UserName(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.name;
    }

    static Security_UserAccount(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.account;
    }

    static Security_UserBusinessUnit_2(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.business_unit;
    }
    
    static Security_UserDirectorate_3(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.directorate;
    }

    static Security_UserTitle(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.title;
    }
    
    static Security_UserProfilePicture(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.profile_picture;
    }

    static Security_UserEmail(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.email;
    }

    static Security_UserCountry(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.country;
    }

    static Security_ShowUserFeedback(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser.Cz_dlg_feedback==='1'){
            return true
        }else{
            return false
        }
    }

    static Security_ShowUserEventDialogueRating(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser.Cz_dlg_event_rating){
            return dataUser.Cz_dlg_event_rating
        }else{
            return false
        }
    }

    static async Security_IsLogin(){
        const dataUser = axiosLibrary.getUserInfo();
        await this.Security_activityLog(isMobile);
        if(dataUser!==null || this.Security_getPlatformId()){
            return true
        }else{ 
            await axiosLibrary.login();
            return false
        }
    }

    static Security_IsAdmin(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser!==null){
            switch (dataUser.role) {
                case 'super admin':
                    return 2
                case 'admin':
                    return 1
                default:
                    return 0
            }
        }else{
            return false
        }
    }

    static Security_RedirectAdmin(){
        if(this.Security_IsAdmin() < 1){
            alert("YOU ARE NOT ADMIN");
        }else if(this.Security_IsAdmin() < 2){
            alert("YOU ARE NOT SUPER ADMIN");
        }else{
            alert("YOU DONT HAVE ACCESS TO THIS PAGE");
        }
    }

    static Security_RedirectSuperAdmin(){
        if(this.Security_IsAdmin() < 2){
            alert("YOU ARE NOT SUPER ADMIN");
        }
    }

    static Security_getPlatformId(){
        if(localStorage.getItem("platform_id")!==null){
            return localStorage.getItem("platform_id")
        }else{
            return false;
        }
    }

    static Security_getPlatformName(){
        if(localStorage.getItem("platform_name")!==null){
            return localStorage.getItem("platform_name")
        }else{
            return false;
        }
        
    }

    static Security_getPlatformPoint(){
        if(localStorage.getItem("energy_point")!==null){
            return localStorage.getItem("energy_point")
        }else{
            return 100;
        }
        
    }

    static Security_ActivityLogin(){
        if(localStorage.getItem("activity_login")!==null){
            return localStorage.getItem("activity_login")
        }else{
            localStorage.setItem("activity_login", 1);
            return false;
        }
    }

    static async Security_activityLog(isMobile,sourceName=null){
        if(this.Security_getPlatformId()){
            if(!this.Security_ActivityLogin()){
      
              const paramActivity = {
                userName : this.Security_UserName(),
                userId : this.Security_UserId(),
                userAccount : this.Security_UserAccount(),
                userEmail : this.Security_UserEmail(),
                isMobile : isMobile,
                moduleName : "Time to Listen - " + this.Security_getPlatformName(),
                feature : (sourceName==null?"Login":"Login from site : "+sourceName)
              }
                await axiosLibrary.postData("user/ActivityLog",paramActivity);
            }
        }
    }

    static Security_getInsertLogYawa(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser.Cz_dlg_yawa==='1'){
            return true
        }else{
            return false
        }
    }

    static Security_getInsertLogUft(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser.Cz_dlg_uft==='1'){
            return true
        }else{
            return false
        }
    }

    static Security_getInsertLogGallery(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser.Cz_dlg_gallery==='1'){
            return true
        }else{
            return false
        }
    }

    static Security_getInsertLogEvents(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser.Cz_dlg_events==='1'){
            return true
        }else{
            return false
        }
    }

    static Security_getTheme(){
        const theme = JSON.parse(localStorage.getItem("platform_theme"));
        if(theme==null || theme.length===0){
            return false
        }else{
            return theme; 
        }

    }

    static Security_getPhotos(){
        if(localStorage.getItem("photos")!==null){
            return localStorage.getItem("photos")
        }else{
            return false;
        }
    }
}

const env = {
    apiBaseUri : process.env.REACT_APP_API_BASE_URL,
    assets : process.env.REACT_APP_ASSETS,
    userDocument : process.env.REACT_APP_USER_DOCUMENT,
    clientId : process.env.REACT_APP_CLIENT_ID,
    tenantId : process.env.REACT_APP_TENANT_ID,
    expSession : process.env.REACT_APP_EXP_SESSION,
    secretId : process.env.REACT_APP_SECRET_ID,
    rootPath : process.env.REACT_APP_ROOT_TIMETOLISTEN,
    graphRoute : process.env.REACT_APP_GRAPH_ROUTE,
    azureWindowLog : process.env.REACT_APP_AZURE_WINDOW_LOG,
    publicUrl : process.env.PUBLIC_URL,
    nodeEnv : process.env.NODE_ENV,
    recognitionUrl : process.env.REACT_APP_RECOGNITION_URL,
}

const azureConfig = {
    clientId: env.clientId,
    endpoints: {
      api: env.clientId,
      graph : env.graphRoute
      // Necessary for CORS requests, for more info see https://github.com/AzureAD/azure-activedirectory-library-for-js/wiki/CORS-usage
    },
    
    // 'tenant' is the Azure AD instance.
    tenant: env.tenantId,
    // 'cacheLocation' is set to 'sessionStorage' by default (see https://github.com/AzureAD/azure-activedirectory-library-for-js/wiki/Config-authentication-context#configurable-options).
    // We change it to'localStorage' because 'sessionStorage' does not work when our app is served on 'localhost' in development.
    cacheLocation: 'localStorage'
}

export {securityData, env, azureConfig};
