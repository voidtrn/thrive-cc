import axios from 'axios';
import { useHistory } from 'react-router';
import routeAll from './route';
import {authContext} from './adalConfig';
import {securityData, env} from './globalHelper';
import queryString from 'query-string';
import { isMobile } from 'react-device-detect';

class axiosLibrary{
    async loginFirst(credentials){
        try {
            const response = await axios.post(env.apiBaseUri + "awblogin", credentials);
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

    getTokenPhotos(){
        authContext.acquireToken('https://graph.microsoft.com', (message, access_token) => {
            if(access_token){
                localStorage.setItem("access_tokenPhoto", access_token)
            }
            else{
                authContext.acquireTokenRedirect('https://graph.microsoft.com');
            }
        })
    }

    async logOut() {
        try {
            const response = await axios.post(env.apiBaseUri + 'awblogout', {}, this.getAuthHeader());
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
            if(error.response.status !== undefined){
                switch (error.response.status) {
                    case 401:
                        let responseApiRefresh = await this.postDataRefresh("awbrefreshToken");
                        if(responseApiRefresh.status===200){
                            localStorage.setItem("token_from_backend", responseApiRefresh.data.newToken);
                            return await this.postData(suburl,param);
                        }else{
                            return error.response
                        }
                    case 400:
                        alert("Session Expired, Click OK to Relogin");
                        const response = await this.logOut();
                        if(response.status===200){
                            authContext.login();
                        }
                        return error.response
                    case 403:
                        alert("You dont have Permission to see this Page, Click OK to Redirect");
                        window.location.href = routeAll.routesComponent.accessDenied.path
                        return error.response
                    case 500:
                        alert("API no Response, Click OK to Reload");
                        const getUrl = window.location.href;
                        if(getUrl.includes("dev")||getUrl.includes("qas")||getUrl.includes("localhost")){
                            console.log("error api")
                        }else{
                            window.location.href = getUrl;
                        }
                        return error.response
                    default:
                        return error.response
                }
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
                    let responseApiRefresh = await this.postDataRefresh("awbrefreshToken");
                    if(responseApiRefresh.status===200){
                        localStorage.setItem("token_from_backend", responseApiRefresh.data.newToken);
                        return await this.getData(suburl,config,getPhotos);
                    }else{
                        return error.response
                    }
                case 400:
                    alert("Session Expired, Click OK to Relogin");
                    const response = await this.logOut();
                    if(response.status===200){
                        authContext.login();
                    }
                    return error.response
                case 403:
                    alert("You dont have Permission to see this Page, Click OK to Redirect");
                    window.location.href = routeAll.routesComponent.accessDenied.path
                    return error.response
                case 500:
                    alert("API no Response, Click OK to Reload");
                    const getUrl = window.location.href;
                    if(getUrl.includes("dev")||getUrl.includes("qas")||getUrl.includes("localhost")){
                        console.log("error api")
                    }else{
                        window.location.href = getUrl;
                    }
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
                    let responseApiRefresh = await this.postDataRefresh("awbrefreshToken");
                    if(responseApiRefresh.status===200){
                        localStorage.setItem("token_from_backend", responseApiRefresh.data.newToken);
                        return await this.postDataFile(suburl,param);
                    }else{
                        return error.response
                    }
                case 400:
                    alert("Session Expired, Click OK to Relogin");
                    const response = await this.logOut();
                    if(response.status===200){
                        authContext.login();
                    }
                    return error.response
                case 403:
                    alert("You dont have Permission to see this Page, Click OK to Redirect");
                    window.location.href = routeAll.routesComponent.accessDenied.path
                    return error.response
                case 500:
                    alert("API no Response, Click OK to Reload");
                    const getUrl = window.location.href;
                    if(getUrl.includes("dev")||getUrl.includes("qas")||getUrl.includes("localhost")){
                        console.log("error api")
                    }else{
                        window.location.href = getUrl;
                    }
                    return error.response
                default:
                    return error.response
            }
        }
    }

    async getPhoto(accountName){
        const url = 'https://graph.microsoft.com/v1.0/me/photos/64x64/$value';
        //var hasilPhotos = "https://recognition.culture.pmicloud.biz/recognition/_assets/images/icon-avatar-big_gede.png";
        var hasilPhotos = "https://learn.culture.pmicloud.biz/_assets/landingpage/assets/images/rectangle-10-bg-Ax7.png";
        // if(localStorage.getItem("access_tokenPhoto")){
        //     if(!securityData.Security_getPhotos()){
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

              }

              //setItem to table users
              const param = {
                  account: accountName,
                  photos: hasilPhotos
              }
              let setPhoto = await this.postData("user/UpdatePhotos",param)
              if(setPhoto.status === 200){
                  localStorage.setItem("photos", 1)
                  let dataUser = this.getUserInfo();
                  var dataHasilPhotos = {
                      profile_picture: hasilPhotos
                  }
                  dataUser = {...dataUser, ...dataHasilPhotos}
                  localStorage.setItem('userinfo',JSON.stringify(dataUser));
                //   localStorage.removeItem('access_tokenPhoto')

                    window.location.reload();

              }

            //   return hasilPhotos
        //     }
        // }

    }

    async login(){
        if(!localStorage.getItem("userinfo")){
            const email = authContext.getCachedUser().userName;
            const account = email.replace(/@[^@]+$/, '');
                let responseLogin = await this.loginFirst({account:account});
                switch (responseLogin.status) {
                    case 200:
                        localStorage.setItem("token_from_backend", responseLogin.data.token)
                        // await this.getPhoto(account)
                        
                        var lang = {
                            lang:'ENG'
                        }
                        
                        //only for testing lang local
                        const getUrl = window.location.href;
                        if(getUrl.includes("localhost")){
                            lang = {
                                lang:'ENG'
                            }
                        }else{
                            //this is original set lang
                            if(responseLogin.data.data.country==='ID'){
                                lang = {
                                    lang:'IND'
                                }
                            }
                            //end
                        }
                        //end testing
                        

                        var response = {...responseLogin.data.data, ...lang};
                        if(!localStorage.getItem("userinfo")){
                            localStorage.setItem("userinfo", JSON.stringify(response));
                        }
                        break;
                    case 400:
                        alert("Sorry, You dont have Permission to See this Page");
                        window.location.href = routeAll.routesComponent.accessDenied.path
                        break;
                    case 500:
                        alert("API no Response, Click OK to Reload");
                        localStorage.clear();
                        authContext.login();
                        break;
                default:
                        localStorage.clear();
                        break;
                }
        }
    }

    setPlatformTheme=async(id,name,redirect)=>{
        localStorage.setItem("loadingNow", true);
        localStorage.setItem("platform_id", id);
        localStorage.setItem("platform_name", name);
        if(securityData.Security_UserId()){
            //get role user in platform
            //set role to localstorage user info
            //di timpa rolenya
            let responseJson = await this.postData('awbPlatform/getRoleAdmin',{platform_id:id, user_id:securityData.Security_UserId()});
            if(responseJson.status === 200){
                let dataUser = this.getUserInfo();
                let dataAdmin = responseJson.data.data[0];
                if(dataAdmin===undefined){
                    if(dataUser.role===4){
                        dataAdmin = {
                            role:4
                        }
                    }else{
                        dataAdmin = {
                            role:0
                        }
                    }
                }
                dataUser = {...dataUser,...dataAdmin};
                localStorage.setItem('userinfo',JSON.stringify(dataUser));
            }

        }

        //getphoto
        if(!window.location.href.includes('localhost')){
            if(securityData.Security_getPlatformId()){
                await this.getPhoto(securityData.Security_UserAccount());
            }
        }
        //end getphoto

        if(securityData.Security_getPlatformId()){
            if(!securityData.Security_LearningPlanCompletePoint()){
                let responseGetLearningPlanCompletePoint = await this.postData('awbHome/GetMasterConfigValue',{platform_id:id, code:'LP_COMPLETE'});
                if(responseGetLearningPlanCompletePoint.status===200){
                    localStorage.setItem('learningPlanCompletePoint',responseGetLearningPlanCompletePoint.data.data);
                }
            }
        }
        
        if(securityData.Security_getPlatformId()){
            let dataUser = this.getUserInfo();
            let responseUserAccess = await this.postData('awbUser/CheckUserAccess',{platform_id:id, user_id:securityData.Security_UserId()});
            if(responseUserAccess.status===200){
                var first_login = {
                    Cz_awb_user_firstlogin: responseUserAccess.data.flag_first_login
                }
                dataUser = {...dataUser, ...responseUserAccess.data.data, ...first_login}
                localStorage.setItem('userinfo',JSON.stringify(dataUser));
                this.changeThemeNull({platform_id:securityData.Security_getPlatformId()},redirect)    
            }
        }
        

    }

    changeThemeNull=async(param,redirect)=>{
        localStorage.removeItem("loadingNow");
        // let responseJson = await this.postData('awbTheme/SelectDataByPlatform',param);
        // if(responseJson.status===200){
        //     let response = await this.postData('awbTheme/ListData',{category:"COLUMNS"})
        //     let themeObject = responseJson.data.data
        //     response.data.data.map(v=>{
        //         if(themeObject[v.Field]){
        //             if(v.Field.includes('img')){
        //                 themeObject[v.Field]=env.userDocument+"theme/"+themeObject[v.Field]
        //             }
        //         }else{
        //             if(v.Field.includes('img')){
        //                 themeObject[v.Field]=env.assets+"images/default_theme/"+v.Comment.match(/(?<=\[)(.*?)(?=\])/gm)[0]
        //             }else{
        //                 themeObject[v.Field]=v.Comment
        //             }
        //         }
        //     })
        //     localStorage.setItem("platform_theme",JSON.stringify(themeObject));
                window.location.href=redirect
        
        // }else{
        //     alert("ERROR NO RESPONSE")
        // }
    }

    decodeEncodeUri(inputQueryString,type){
        if(type==='decode'){
            if(securityData.Security_UserId()){
                const arrayQueryString = queryString.parse(decodeURIComponent(escape(window.atob(inputQueryString))))
                if(Object.keys(arrayQueryString).length > 0){
                    return arrayQueryString
                }
            }
        }

        if(type==='encode'){
            const uriEncode = window.btoa(unescape(encodeURIComponent(inputQueryString)))
            return uriEncode
        }
        // return 'false'
    }

    getParamString(paramString){
        if(securityData.Security_UserId()){
            const arrayQueryString = queryString.parse(paramString)
            if(Object.keys(arrayQueryString).length > 0){
                return arrayQueryString
            }
        }
    }

    contentAccessLog=async(param)=>{
        let contentTypeNotArticleCourse = ['Skills for future', 'PSBB', 'Workshop']
        if(param.articleId){
            if(!param.contenType.includes(contentTypeNotArticleCourse)){
                const paramInsertArticleLog = {
                    articleIdmd5: param.trnId,
                    platform_id: securityData.Security_getPlatformId(),
                    user_id: securityData.Security_UserId(),
                }
                var response = await this.postData('awbHome/InsertArticleLog',paramInsertArticleLog)
            }
            this.generateLog(
                param.contenType, 
                `Content Type : ${param.contenType}, Content Id : ${param.articleId}`,
                param.articleId
            )
        }
        return response
    }

    generateLog=async(log_type, log_info, trnId=null)=>{
        const paramAWBGenerateLog = {
            // user_name : securityData.Security_UserName(),
            // user_id : securityData.Security_UserId(),
            // user_account : securityData.Security_UserAccount(),
            // user_email : securityData.Security_UserEmail(),
            access_device : isMobile? 'Mobile' : 'Desktop',
            log_type : log_type,
            log_info : log_info,
            transaction_id : trnId,
            platform_id : securityData.Security_getPlatformId()
          }
        this.postData('awbHome/AwbGenerateLog',paramAWBGenerateLog)
    }

    getmd5FromBackend= async (param)=>{
        let responseJson = await this.postData('GetMd5',{id:param});
        return responseJson.data.data; 
    }

    userTracking = async (request_uri)=>{
        // masuk halaman admin seharusnya refferer_uri harus dihilangkan
        let previous_uri = localStorage.getItem('refferer_uri')
        const param = {
            request_uri:request_uri,
            referer_page:previous_uri,
            platform_id:securityData.Security_getPlatformId()
        }
        let responseJson = await this.postData('awbHome/trackThis',param);
        if(responseJson.data.data){
            //set previous uri to localstorage refferer_uri
            localStorage.setItem('refferer_uri',request_uri)
        }else{
            console.log("unable to track")
        }
    }

    hrefLink = (link,queryString)=>{
        const history = useHistory()
        history.push({
            pathname: link,
            search: queryString && "?" + queryString// your data array of objects
        })
    }

    cekLinkSource = async (dataPlatform=null) =>{
        const queryStringtoObject = this.getParamString(window.location.search)
        const hashStringtoObject = this.getParamString(window.location.hash)
        //login from token link source
        if(queryStringtoObject && queryStringtoObject.src_token){
            const mobile = isMobile;
            const response = await this.postData('linksource/CheckUserAccess',
                {
                    userName: securityData.Security_UserName(),
                    userId: securityData.Security_UserId(),
                    userAccount: securityData.Security_UserAccount(),
                    userEmail: securityData.Security_UserEmail(),
                    isMobile : mobile,
                    token : queryStringtoObject.src_token,
                    module_name: 'awb'
                }
            )

            if(response.status===200){
                const dataPlatform_from_token = response.data.data2
                const getDataPlatform = dataPlatform.filter(v=> v.id===dataPlatform_from_token.id)
                if(getDataPlatform.length > 0){
                    this.setPlatformTheme(dataPlatform_from_token.id,dataPlatform_from_token.name,window.location.pathname)
                    return true
                }
            }
        }
        //end login from token link source

        if(securityData.Security_UserFirstLogin()){
            //login with referral account
            if(queryStringtoObject && queryStringtoObject.refer && queryStringtoObject.platform){
                const response = await this.postData('awbUser/CheckReferralAccount',
                    {
                        referByUserAccount: queryStringtoObject.refer,
                        platform_id: queryStringtoObject.platform
                    }
                )

                if(response.status===200){
                    const getDataPlatform = dataPlatform.filter(v=> v.id===response.data.data2)
                    if(getDataPlatform.length > 0){
                        this.setPlatformTheme(getDataPlatform[0].id,getDataPlatform[0].name,routeAll.routesUser.movement.path)
                    }
                }

                return true
            }
            //end
            window.location.href=routeAll.routesUser.movement.path
        }

        if(hashStringtoObject && hashStringtoObject.platform && hashStringtoObject.tabMenu){
            return await this.cekLinkTraining(dataPlatform)
        }

        if(hashStringtoObject && hashStringtoObject.points && hashStringtoObject.platform){
            return await this.cekLinkWeMissYou(dataPlatform)
        }

        return false
    }

    cekLinkWeMissYou = async (dataPlatform=null)=>{
        const queryStringtoObject = this.getParamString(window.location.search)

        if(queryStringtoObject && queryStringtoObject.platform && queryStringtoObject.points){
            if(dataPlatform){
                const getPlatform = await this.postData('awbPlatform/SelectData',
                    {
                        md5ID: queryStringtoObject.platform
                    }
                )
                if(getPlatform.status===200){
                    const currentLink = `${window.location.pathname}`
                    const getDataPlatform = dataPlatform.filter(v=> v.id===getPlatform.data.data.id)
                    if(getDataPlatform.length > 0){
                        const insertPointWeMissYou = await this.postData('awbHome/readLastAddPointWeMissYou',{
                            platform_id:getDataPlatform[0].id,
                            points: queryStringtoObject.points
                        })
                        if(insertPointWeMissYou.status===200){
                            this.setPlatformTheme(getDataPlatform[0].id,getDataPlatform[0].name,currentLink)
                            return true
                        }
                    }
                }
                
            }else{
                const user_id = securityData.Security_UserId();
                const user_country = securityData.Security_UserCountry();
                const user_directorate = securityData.Security_UserDirectorate_3();

                let responseJson = await this.postData('awbPlatform/GetPlatformAccess',{country:user_country,directorate:user_directorate, user_id:user_id});
                if(responseJson.status == 200){
                    dataPlatform = responseJson.data.data

                    const getPlatform = await this.postData('awbPlatform/SelectData',
                        {
                            md5ID: queryStringtoObject.platform
                        }
                    )
                    if(getPlatform.status===200){
                        const currentLink = `${window.location.pathname}`
                        const getDataPlatform = dataPlatform.filter(v=> v.id===getPlatform.data.data.id)
                        if(getDataPlatform.length > 0){
                            const insertPointWeMissYou = await this.postData('awbHome/readLastAddPointWeMissYou',{
                                platform_id:getDataPlatform[0].id,
                                points: queryStringtoObject.points
                            })
                            if(insertPointWeMissYou.status===200){
                                this.setPlatformTheme(getDataPlatform[0].id,getDataPlatform[0].name,currentLink)
                                return true
                            }
                        }
                    }
                }
            }
        }

        return false
    }

    cekLinkTraining=async(dataPlatform=null)=>{
        const hashStringtoObject = this.getParamString(window.location.hash)

        if(hashStringtoObject && hashStringtoObject.platform && hashStringtoObject.tabMenu){
            if(dataPlatform){
                const getPlatform = await this.postData('awbPlatform/SelectData',
                    {
                        md5ID: hashStringtoObject.platform
                    }
                )
                if(getPlatform.status===200){
                    const currentLink = `${window.location.pathname}#${new URLSearchParams({tabMenu: hashStringtoObject.tabMenu}).toString()}`
                    const getDataPlatform = dataPlatform.filter(v=> v.id===getPlatform.data.data.id)
                    if(getDataPlatform.length > 0){
                        this.setPlatformTheme(getDataPlatform[0].id,getDataPlatform[0].name,currentLink)
                        return true
                    }
                }
                
            }else{
                const user_id = securityData.Security_UserId();
                const user_country = securityData.Security_UserCountry();
                const user_directorate = securityData.Security_UserDirectorate_3();

                let responseJson = await this.postData('awbPlatform/GetPlatformAccess',{country:user_country,directorate:user_directorate, user_id:user_id});
                if(responseJson.status == 200){
                    dataPlatform = responseJson.data.data

                    const getPlatform = await this.postData('awbPlatform/SelectData',
                        {
                            md5ID: hashStringtoObject.platform
                        }
                    )
                    if(getPlatform.status===200){
                        const currentLink = `${window.location.pathname}#${new URLSearchParams({tabMenu: hashStringtoObject.tabMenu}).toString()}`
                        const getDataPlatform = dataPlatform.filter(v=> v.id===getPlatform.data.data.id)
                        if(getDataPlatform.length > 0){
                            this.setPlatformTheme(getDataPlatform[0].id,getDataPlatform[0].name,currentLink)
                            return true
                        }
                    }
                }
            }
        }

        return false

    }

}

export default new axiosLibrary();