import axios from 'axios';
import routeAll from './route';
import {authContext} from './adalConfig';
import {securityData, env} from './globalHelper';

class axiosLibrary{
    async loginFirst(credentials){
        try {
            const response = await axios.post(env.apiBaseUri + "dialogueLogin", credentials);
            return response
        } catch (error) {
            return error.response
        }
       
    }

    getUserInfo(){
        return JSON.parse(localStorage.getItem("userinfo"));
    }

    getAuthHeader() {
       return {headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token_from_backend"),
                    // "Access-Control-Allow-Origin": "*"
                }/*,withCredentials: true,*/
            };
    }

    async logOut() {
        try {
            const response = await axios.post(env.apiBaseUri + 'dialogueLogout', {}, this.getAuthHeader());
            localStorage.clear();
            authContext.logOut();
            return response
        } catch (error) {
            return error.response
        }
        
    }
    
    async postDataRefresh(suburl){
        try {
            const config = this.getAuthHeader();
            const email = authContext.getCachedUser().userName;
            const account = email.replace(/@[^@]+$/, '');
            const response = await axios.post(env.apiBaseUri + suburl, {
                account:account,
            }, config);
            return response
        } catch (error) {
            return error.response
        }
    }



    async postData(suburl,param){
        try {
            //const token = localStorage.getItem("token_from_backend");
            const config = this.getAuthHeader();
            const response = await axios.post(env.apiBaseUri + suburl, param, config);
            return response
        } catch (error) {
            switch (error.response.status) {
                case 401:
                    let responseApiRefresh = await this.postDataRefresh("dialogueRefreshToken");
                    if(responseApiRefresh.status===200){
                        localStorage.setItem("token_from_backend", responseApiRefresh.data.newToken);
                        return await this.postData(suburl,param);
                    }else{
                        return error.response
                    }
                case 400:
                    alert("SESSION EXPIRED, CLICK OK TO RELOGIN");
                    const response = await this.logOut();
                    if(response.status===200){
                        authContext.login();
                    }
                    return error.response
                case 403:
                    alert("YOU DONT HAVE PERMISSION TO SEE THIS PAGE, CLICK OK TO REDIRECT");
                    window.location.href = routeAll.routesComponent.accessDenied
                    return error.response
                case 500:
                    alert("API NO RESPONSE, CLICK OK TO RELOAD");
                    // const getUrl = window.location.href;
                    // window.location.href = getUrl;
                    return error.response
                default:
                    return error.response
            }
        }
    }

    async getData(suburl,config, getPhotos=null){
        try {
            const url = getPhotos==null? env.apiBaseUri + suburl : suburl
            const response = await axios.get(url, config);
            return response;
        } catch (error) {
            // handle error
            switch (error.response.status) {
                case 401:
                    let responseApiRefresh = await this.postDataRefresh("dialogueRefreshToken");
                    if(responseApiRefresh.status===200){
                        localStorage.setItem("token_from_backend", responseApiRefresh.data.newToken);
                        return await this.getData(suburl,config,getPhotos);
                    }else{
                        return error.response
                    }
                case 400:
                    alert("SESSION EXPIRED, CLICK OK TO RELOGIN");
                    const response = await this.logOut();
                    if(response.status===200){
                        authContext.login();
                    }
                    return error.response
                case 403:
                    alert("YOU DONT HAVE PERMISSION TO SEE THIS PAGE, CLICK OK TO REDIRECT");
                    window.location.href = routeAll.routesComponent.accessDenied
                    return error.response
                case 500:
                    alert("API NO RESPONSE, CLICK OK TO RELOAD");
                    const getUrl = window.location.href;
                    window.location.href = getUrl;
                    return error.response
                default:
                    return error.response
            }
        }
    }

    async postDataFile(suburl,param){
        try {
            const config = { 
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token_from_backend") ,
                    // "Access-Control-Allow-Origin": "*" 
                },
                responseType: 'blob'
            };            
            const response = await axios.post(env.apiBaseUri + suburl, param, config);
            return response;
        } catch (error) {
            switch (error.response.status) {
                case 401:
                    let responseApiRefresh = await this.postDataRefresh("dialogueRefreshToken");
                    if(responseApiRefresh.status===200){
                        localStorage.setItem("token_from_backend", responseApiRefresh.data.newToken);
                        return await this.postDataFile(suburl,param);
                    }else{
                        return error.response
                    }
                case 400:
                    alert("SESSION EXPIRED, CLICK OK TO RELOGIN");
                    const response = await this.logOut();
                    if(response.status===200){
                        authContext.login();
                    }
                    return error.response
                case 403:
                    alert("YOU DONT HAVE PERMISSION TO SEE THIS PAGE, CLICK OK TO REDIRECT");
                    window.location.href = routeAll.routesComponent.accessDenied
                    return error.response
                case 500:
                    alert("API NO RESPONSE, CLICK OK TO RELOAD");
                    // const getUrl = window.location.href;

                    // window.location.href = getUrl;
                    return error.response
                default:
                    return error.response
            }
        }
    }

    async getPhoto(accountName){
        const url = 'https://graph.microsoft.com/v1.0/me/photos/64x64/$value';
        var hasilPhotos = "";
        // console.log(localStorage.getItem("access_tokenPhoto"))
        if(localStorage.getItem("access_tokenPhoto")!==null){
            if(!securityData.Security_getPhotos()){
                const token = localStorage.getItem("access_tokenPhoto")
                const config = {
                    headers :{
                            
                        Authorization: `Bearer `+ token,
                    },
                    responseType: 'arraybuffer' ,
                }
                let responseApi = await this.getData(url,config,'Y')
                if(responseApi.status===200){

                    const base64 = btoa(
                        new Uint8Array(responseApi.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        '',
                        ),
                    );
                    hasilPhotos = "data:;base64," + base64;

                }else{
                    hasilPhotos = env.assets+"images/icon-avatar-big_gede.png"
                }

                //setItem to table users
                const param = {
                    account: accountName,
                    photos: hasilPhotos
                }
                let setPhoto = await this.postData("user/UpdatePhotos",param)
                if(setPhoto.status === 200){
                    localStorage.setItem("photos", 1)
                    localStorage.removeItem("access_tokenPhoto")
                    return hasilPhotos
                }
            }
        }

    }

    async login(){
        if(!localStorage.getItem("userinfo")){
            const email = authContext.getCachedUser().userName;
            const account = email.replace(/@[^@]+$/, '');
                let responseLogin = await this.loginFirst({account:account});
                switch (responseLogin.status) {
                    case 200:
                        localStorage.setItem("token_from_backend", responseLogin.data.token)
                        var ads ={
                        Cz_ads:1
                        }
                        var response = {...responseLogin.data.data,...ads};
                
                        if(response.first_login === null){
                        var first_login = {
                            Cz_firstLogin: 1
                        }
                        response = {...response,...first_login};
                        }
                        const dataPhotos = await this.getPhoto(account);
                        
                        var dataHasilPhotos = {
                            profile_picture: dataPhotos
                        }
    
                        response = {...response,...dataHasilPhotos};
                        if(!localStorage.getItem("userinfo")){
                            localStorage.setItem("userinfo", JSON.stringify(response));
                        }
    
                        break;
                    case 400:
                        alert("SORRY, YOU DONT HAVE PERMISSION TO SEE THIS PAGE");
                        window.location.href = routeAll.routesComponent.accessDenied
                        break;
                    case 500:
                        alert("API NO RESPONSE, CLICK OK TO RELOAD");
                        localStorage.clear();
                        authContext.login();
                        break;
                default:
                        localStorage.clear();
                        break;
                }
        }
    }

    setPlatformTheme=async(id,name,point,redirect)=>{
        localStorage.setItem("platform_id", id);
        localStorage.setItem("platform_name", name);
        localStorage.removeItem("activity_login");
        if(securityData.Security_UserId()){
            //get role user in platform
            //set role to localstorage user info
            //di timpa rolenya
            let responseJson = await this.postData('dialoguePlatform/getRoleAdmin',{platform_id:id, user_id:securityData.Security_UserId()});
            if(responseJson.status === 200){
                let dataUser = this.getUserInfo();
                let dataAdmin = responseJson.data.data[0];
                if(dataAdmin===undefined){
                    if(dataUser.role==="super admin"){
                        dataAdmin = {
                            role:"super admin"
                        }
                    }else{
                        dataAdmin = {
                            role:""
                        }
                    }
                }
                dataUser = {...dataUser,...dataAdmin};
                localStorage.setItem('userinfo',JSON.stringify(dataUser));
            }

        }
        if(securityData.Security_getPlatformId()){
            let dataFeedback = {}
            let dataUser = this.getUserInfo();
            let responseFeedbackSession = await this.postData('dialogueFeedback/CheckFeedbackSession',{platform_id:id, user_id:securityData.Security_UserId()});
            if (responseFeedbackSession.data.data){
                dataFeedback = {
                    Cz_dlg_feedback:'1'
                }
            }else{
                dataFeedback = {
                    Cz_dlg_feedback:'0'
                }
            }
            dataUser = {...dataUser, ...dataFeedback}
            localStorage.setItem('userinfo',JSON.stringify(dataUser));
            this.changeThemeNull({platform_id:securityData.Security_getPlatformId()},redirect)
        }
    }

    changeThemeNull=async(param,redirect)=>{
        let responseJson = await this.postData('dialogueTheme/SelectDataByPlatform',param);
        if(responseJson.status===200){
            let response = await this.postData('dialogueTheme/ListData',{category:"COLUMNS"})
            let themeObject = responseJson.data.data
            response.data.data.map(v=>{
                if(themeObject[v.Field]){
                    if(v.Field.includes('img')){
                        themeObject[v.Field]=env.userDocument+"theme/"+themeObject[v.Field]
                    }
                }else{
                    if(v.Field.includes('img')){
                        themeObject[v.Field]=env.assets+"images/default_theme/"+v.Comment.match(/(?<=\[)(.*?)(?=\])/gm)[0]
                    }else{
                        themeObject[v.Field]=v.Comment
                    }
                }
            })
            localStorage.setItem("platform_theme",JSON.stringify(themeObject));
            // console.log(themeObject)
            // console.log(redirect)
            window.location.href=redirect;
        }else{
            alert("ERROR NO RESPONSE")
        }
    }
}

export default new axiosLibrary();