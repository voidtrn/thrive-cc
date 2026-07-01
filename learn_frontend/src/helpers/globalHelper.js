import axiosLibrary from "./axiosLibrary";
import routeAll from "./route";

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

    static async Security_IsLogin(){
        const dataUser = axiosLibrary.getUserInfo();
        await this.Security_activityLog();
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
            return dataUser.role
        }else{
            return 0
        }
    }

    static Security_RedirectAdmin(){
        const routeAllAdmin = {...routeAll.routesAdmin, ...routeAll.routesReport}
        const currentPath = localStorage.getItem('previous_path')
        const currentAdminLevel = Object.values(routeAllAdmin).find(list => list.path ===currentPath).adminLevel
        switch (currentAdminLevel) {
            case 1:
                alert("YOU ARE NOT TRAINING REPORT ADMIN");
                break;            
            case 2:
                alert("YOU ARE NOT TRAINING ADMIN");
                break;
            case 3:
                alert("YOU ARE NOT AWB ADMIN");
                break;
            case 4:
                alert("YOU ARE NOT SUPER ADMIN");
                break;
            default:
                alert("YOU ARE NOT AWB ADMIN");
                break;
        }
        localStorage.removeItem('previous_path')
    }

    static Security_RedirectSuperAdmin(){
        if(this.Security_IsAdmin() < 4){
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

    static Security_ActivityLogin(){
        if(localStorage.getItem("Cz_awb_activity_log_landingpage_login")!==null){
            return localStorage.getItem("Cz_awb_activity_log_landingpage_login")
        }else{
            localStorage.setItem("Cz_awb_activity_log_landingpage_login", 1);
            return false;
        }
    }

    static async Security_activityLog(){
        if(this.Security_getPlatformId()){
            if(!this.Security_ActivityLogin()){
                await axiosLibrary.generateLog('Login',`Learn - ${this.Security_getPlatformName()}`);
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

    static Security_NotifierStatus(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.notifier_status;
    }

    static Security_UserCurrentStreakLogin(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.Cz_awb_streak_login_current;
    }

    static Security_UserTargetStreakLogin(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.Cz_awb_streak_login_target;
    }

    static Security_UserLevelIdx(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.Cz_awb_level_idx;
    }

    static Security_UserLevel(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.Cz_awb_level;
    }

    static Security_UserTierPoint(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.Cz_awb_tier_point;
    }

    static Security_UserPoint(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.Cz_awb_point;
    }

    static Security_UserIsSubscribe(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }else{
            return dataUser.Cz_awb_email_subscribe=='1'? true:false
        }
    }

    static Security_UserFirstLogin(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }else{
            return dataUser.Cz_awb_user_firstlogin=='1'? true:false
        }
    }
    static Security_lang(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }else{
            return dataUser.lang
        }
    }
    static Security_UserProgressStreakLogin(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.progressStreakLogin;
    }
    static Security_UserTargetLevel(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.target_level_id;
    }
    static Security_UserProgressLevel(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.progressLevel;
    }
    static Security_UserTargetPoint(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.targetPoint;
    }

    static Security_LearningPlanCompletePoint(){
        if(localStorage.getItem("learningPlanCompletePoint")!==null){
            return localStorage.getItem("learningPlanCompletePoint")
        }else{
            return false;
        }
    }   

    static GlobalLoadAHref(linkUrl){
        if (false === linkUrl.indexOf('http'))
        {
            if(linkUrl.length > 0)
            {
                linkUrl = 'http://'.linkUrl.replace('//', '')
            }
            else
            {
                linkUrl = '#';
            }
        } 
        // wrap the final output
        return linkUrl;
    }

    static Security_UserNameSplit(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.name.split(" ");
    }


    static Security_PointLandingPage(){
        const dataUser = axiosLibrary.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.point;
    }
    
}

const env = {
    apiBaseUri : process.env.REACT_APP_API_BASE_URL,
    assets : process.env.REACT_APP_ASSETS,
    userDocument : process.env.REACT_APP_USER_DOCUMENT,
    expSession : process.env.REACT_APP_EXP_SESSION,
    rootPath : process.env.REACT_APP_ROOT_LEARN,
    graphRoute : process.env.REACT_APP_GRAPH_ROUTE,
    azureWindowLog : process.env.REACT_APP_AZURE_WINDOW_LOG,
    publicUrl : process.env.PUBLIC_URL,
    nodeEnv : process.env.NODE_ENV,
    oldUserDocument: "https://thrive.pmiapps.biz/thrive/awb/_user_document/",
    adminDashboardUrl: window.location.protocol +'//dashboard.'+ window.location.hostname.replace('learn.','') + (window.location.port == 80?'':':'+window.location.port), //"https://dashboard.dev-culture.pmicloud.biz/"
}

const typePageMenuNCategory = []

const typePagesPBONDigitalCampus = typePageMenuNCategory.filter(v=>v.id==7 || v.id==8 || v.id==6).map(v=>v.id)

export {securityData, env, typePageMenuNCategory, typePagesPBONDigitalCampus};
