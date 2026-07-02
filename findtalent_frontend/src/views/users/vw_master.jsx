import { Component } from 'react';
import { Outlet } from 'react-router-dom';
import withRouter from '../../helpers/withRouter';
import Navbar from '../vw_menu';
import Head from '../../helpers/Head';
import Slider from './feature/vw_slider';
import HomeView from './feature/vw_home';
import DetailProjectView from './feature/vw_detail_project';
import SavedProjectView from './feature/vw_saved_project';
import AppliedProjectView from './feature/vw_applied_project';
import ProfileNav from './feature/vw_profile_nav';
import Footer from './vw_footer';

import AuthHelpers from '../../helpers/AuthHelpers';
import PlatformSelection from '../../components/Platform';
import {isMobile} from 'react-device-detect';
import queryString from 'query-string';
import './users.css';
import SSO from '../../helpers/SSO';


var {LoginData, AllRoute, env} = SSO;



class vw_homepage extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[],
            azure:[],
            file:null,
            file_path: env.userDocument,
            openModal:false,
            isLoading:true,
            platform_id:LoginData.Security_getPlatformId(),
            isLogin:this.props.isLogin,
            isMobile:isMobile,
            typeContent:this.props.location.pathname,
            customLink:[],
            imageSrc:"",
            showPlatform : false,
            getAccess_Token:"",
            loadContentAfterPost:false,
        };
        //this._isMounted = false;
        this.loading = this.loading.bind(this);
      }


    componentDidMount(){
        //this._isMounted = true;
        this.sliderFunction();
        LoginData.Security_IsLogin().then(()=>{
            this.cekQueryString();
            //this.setState({isLoading: false});
        })
       
        
    }
    
    componentWillUnmount() {
        //this._isMounted = false;
    }

    updatePhotos = async (e)=>{
        if(localStorage.getItem("access_tokenPhoto")!==null){
            if(!LoginData.Security_getPhotos()){
                this.setState({getAccess_Token: localStorage.getItem("access_tokenPhoto")},(prevProps)=>{
                    if(prevProps!=""){
                        AuthHelpers.getPhoto();
                    }
                })
    
            }
        }
    }

    cekQueryString(){
        if(LoginData.Security_UserId()){
            const arrayQueryString = queryString.parse(this.props.location.search)

            if(Object.keys(arrayQueryString).length > 0){
                this.setState({customLink:arrayQueryString},()=>{
                    this.redirectUri();
                });
            }
        }
    }

    redirectUri = async ()=>{
        const {customLink} = this.state;
        switch (customLink.type) {
            case 'cstm':
                if(!localStorage.getItem("Cz_findtalent_request_uri")){
                    localStorage.setItem("Cz_findtalent_request_uri", customLink.src_token)
                    const srcToken = customLink.src_token
                    if(srcToken != '')
                    {
                        const mobile = isMobile;
                        const param = {
                            userName: LoginData.Security_UserName(),
                            userId: LoginData.Security_UserId(),
                            userAccount: LoginData.Security_UserAccount(),
                            userEmail: LoginData.Security_UserEmail(),
                            isMobile : mobile,
                            token : srcToken
                        }
                        let responseCheckUserAccess = await AuthHelpers.postData("linksource/CheckUserAccess",param);
                        if(responseCheckUserAccess.status===200){
                            AuthHelpers.setPlatformTheme(responseCheckUserAccess.data.data2.id,responseCheckUserAccess.data.data2.name,AllRoute.root);
                        }
                        
                    }
                }
                break;
            case 'received':
                const param = {
                    email : customLink.email
                }
                let responseHitsPostId = await AuthHelpers.postData("dashboard/HitsEmailNotification",param);
                if(responseHitsPostId.status===200){
                    AuthHelpers.setPlatformTheme(responseHitsPostId.data.data.id,responseHitsPostId.data.data.name,AllRoute.rootReceived);
                }

                break;
            case 'submitted':
                const userAccount = customLink.account
                const platform = customLink.platform
                if(userAccount===LoginData.Security_UserAccount()){
                    let responseSelectPlatform = await AuthHelpers.postData("thinkplatform/SelectData",{md5ID:platform});
                    if(responseSelectPlatform.status==200){
                        AuthHelpers.setPlatformTheme(responseSelectPlatform.data.data.id,responseSelectPlatform.data.data.name,AllRoute.rootSubmitted);
                    }

                }

                if(userAccount != LoginData.Security_UserAccount()){
                    window.location.href = AllRoute.root
                }
            default:
                //console.log(LoginData.Security_UserName())
                break;
        }
    }



    sliderFunction(){
        var x = document.getElementsByClassName("header-wrapper");
        if(x.top > 10)
        {
            document.getElementsByClassName("header-wrapper").attr({'style':'position:relative;top:-27px'});
            document.getElementsByID("footer").attr({'style':'position:relative;bottom:-55px;background:#fff'});
        }
    }

    loading(val){
        if(val===false){

            this.setState({isLoading:val})
        }
    }


    render(){
        const { platform_id} = this.state;
        const assets = env.assets;
        return(
            
             <main>

                <Head/>
                { !platform_id ? <PlatformSelection showPlatform={this.state.showPlatform}/> : 
                <>

                    <div data-u="loading" style={this.state.isLoading?{visibility:"visible",opacity:1,transition:"linear",transitionDuration:"1s"}:{visibility:"hidden",opacity:0,transition:"linear",transitionDuration:"1s"}}>
                            <div style={{filter: "alpha(opacity=30)", opacity: "0.3", position: "absolute", display: "block", top: "0px", left: "0px", width: "100%", height: "100%"}}></div>
                            <div style={{position:"absolute", display:"block", background:"url('../../assets/images/loading.gif') no-repeat center center", top:"0px",left:"0px",width:"100%",height:"100%"}}></div>
                    </div>
                    <div id="asd" style={this.state.isLoading?{visibility:"hidden",opacity:0,transition:"linear",transitionDuration:"1s"}:{visibility:"visible",opacity:1,transition:"linear",transitionDuration:"1s"}}> 

                        <div className="header-wrapper">
                            
                            <Navbar/>
                            <Slider loadingData={this.loading}/>
                            <div id="main-contents">
                                <div class="container">
                                <div class="row">
                                    <Outlet context={{ loadingData: this.loading }} />
                                    <ProfileNav/>
                                </div>
                                </div>
                            </div>
                        </div>
                        <Footer/>
                    </div>
                
                </>
                }
                
                
                
                </main>
        );
    }
}
    
export default withRouter(vw_homepage);