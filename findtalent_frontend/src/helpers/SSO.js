import AuthHelpers from './AuthHelpers';
import GlobalHelper from './GlobalHelper';
import AuthContext from '../services/Auth';
import {isMobile} from 'react-device-detect';

class LoginData{
    static isLogin=null;
    static data = null;
    static setSelectedLogin(isLogin){
        this.isLogin = isLogin;
    }
    static setSelectedData(data){
        this.data = data
    }

    static setSelectedPlatformId(data=null){
        if(data!=null){
            localStorage.setItem("platform_id",data);
            return true
        }else{
            return false
        }
    }

    static Security_UserId(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.id;
    }

    static Security_UserName(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.name;
    }

    static Security_UserAccount(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.account;
    }

    static Security_UserBusinessUnit_2(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.business_unit;
    }
    
    static Security_UserDirectorate_3(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.directorate;
    }

    static Security_UserTitle(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.title;
    }
    
    static Security_UserProfilePicture(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.profile_picture;
    }

    static Security_UserEmail(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.email;
    }

    static Security_UserCountry(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser===null){
            return false
        }
        return dataUser.country;
    }

    static async Security_IsLogin(){
        const dataUser = AuthHelpers.getUserInfo();
        await this.Security_activityLog(isMobile);
        if(dataUser!==null || this.Security_getPlatformId()){
            // console.log("login")
            return true
        }else{ 
            await AuthHelpers.login();
            return false
        }
    }

    static Security_IsAdmin(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser!==null){
            if(dataUser.role=='admin' || dataUser.role=='super admin'){
                //console.log("adminnya "+dataUser.role);
                return true
            }else{
                //console.log("adminnya "+dataUser.role);
                return false
            }
        }else{
            return false
        }
    }

    static Security_RedirectAdmin(){
        if(!this.Security_IsAdmin()){
            alert("YOU ARE NOT ADMIN, CLICK OK TO HOMEPAGE");
            window.location.href = AllRoute.root
        }
    }

    static Security_RedirectSuperAdmin(){
        if(!this.Security_IsLoginSuperAdmin()){
            alert("YOU ARE NOT SUPER ADMIN, CLICK OK TO HOMEPAGE");
            window.location.href = AllRoute.root
        }
    }

    static Security_IsLoginSuperAdmin(){
        const dataUser = AuthHelpers.getUserInfo();
        if(dataUser!==null){
            if(dataUser.role=='super admin'){
                return true
            }else{
                return false
            }
        }else{
            return false
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
        //console.log("platform_name "+localStorage.getItem("platform_name"));
        if(localStorage.getItem("platform_name")!==null){
            return localStorage.getItem("platform_name")
        }else{
            return false;
        }
        
    }

    // static Security_getPlatformPoint(){
    //     if(localStorage.getItem("energy_point")!==null){
    //         return localStorage.getItem("energy_point")
    //     }else{
    //         return 100;
    //     }
        
    // }

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
                moduleName : "findTalent - " + this.Security_getPlatformName(),
                feature : (sourceName==null?"Login":"Login from site : "+sourceName)
              }

              let responseActivityLog = await AuthHelpers.postData("findTalentUser/ActivityLog",paramActivity);
            }
        }
    }

    static Security_getTheme(){
        const theme = JSON.parse(localStorage.getItem("platform_theme"));
        if(theme==null || theme.length==0){
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

class env{
    static assets       = "/assets/";
    static userDocument = import.meta.env.VITE_USER_DOCUMENT;
    static expSession   = import.meta.env.VITE_EXP_SESSION;
    static clientId     = import.meta.env.VITE_CLIENT_ID;
    static tenantId     = import.meta.env.VITE_TENANT_ID;
    static secretId     = import.meta.env.VITE_SECRET_ID;
    static rootPath     = import.meta.env.VITE_ROOT_FINDTALENT;
}
class AllRoute{
    static root 			= '/';
    static detailProject 	= '/detail-project';
    static appliedProject 	= '/applied-project';
    static savedProject 	= '/saved-project';
	
	
    static meeting 	= env.rootPath+'/meeting';
    static login 	= env.rootPath + '/login';
    static denied 	= env.rootPath + '/denied';
	
    static admin 	= env.rootPath + '/admin';
	
    static adminPlatform 	= env.rootPath + '/admin-platform';
    static adminPlatformDtl = env.rootPath + '/admin-platform-dtl';
	
    static adminTheme 		= env.rootPath + '/admin-theme';
    static adminThemeDtl 	= env.rootPath + '/admin-theme-dtl';
	
    static adminUsers 		= env.rootPath + '/admin-users';
    static adminUsersDtl 	= env.rootPath + '/admin-users-dtl';
	
    static adminSlider 		= env.rootPath + '/admin-slider';
    static adminSliderDtl 	= env.rootPath + '/admin-slider-dtl'; 
	
    static adminProject 	= env.rootPath + '/admin-project';
    static adminProjectDtl 	= env.rootPath + '/admin-project-dtl';
	
    static adminUserProject 	= env.rootPath + '/admin-user-project';
    static adminUserProjectDtl 	= env.rootPath + '/admin-user-project-dtl';
	
    static adminQuestionnaire 	= env.rootPath + '/admin-questionnaire';
    static adminQuestionnaireFreeText 	= env.rootPath + '/admin-questionnaire-freetext-dtl';
    static adminQuestionnaireRadio 		= env.rootPath + '/admin-questionnaire-radio-dtl';
	
    static adminActivityLog 	= env.rootPath + '/admin-activity-log';
	
    static adminReportSummary 	= env.rootPath + '/admin-report-project-summary';
    static adminReportDetail 	= env.rootPath + '/admin-report-project-detail';
	
    static adminFunction 	= env.rootPath + '/admin-function';
    static adminFunctionDtl = env.rootPath + '/admin-function-dtl';
   
}


class post_content{
    static users = [];

    static setUsers(users){
        this.users = users;
    }
    static getUsers(){
        return this.users;
    }
}

export default {LoginData, AllRoute, env, post_content}