import { Component } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import AdminNavbar from '../vw_menu';
import Sidebar from './vw_sidebar';
import Head from '../../helpers/Head';

import VwSlider from './vw_slider';
import VwSliderDtl from './vw_slider_dtl';

import VwActivityLog from './vw_activity_log';

import VwUsers from './vw_users';

import VwPlatformMaster from './vw_platform_master';
import VwPlatformMasterDtl from './vw_platform_master_dtl';

import VwTheme from './vw_theme';
import VwThemeDtl from './vw_theme_dtl';

import VwProject from './vw_project';
import VwProjectDtl from './vw_project_dtl';

import VwUserProject from './vw_user_project';
import VwUserProjectDtl from './vw_user_project_dtl';

import VwQuestionaire from './vw_questionaire';
import VwQuestionaireRadio from './vw_questionaire_radio';
import VwQuestionaireFreetext from './vw_questionaire_freetext';

import VWReportSummary from './vw_report_summary';
import VwReportDetail from './vw_report_detail';


import './admin.css'
import SSO from '../../helpers/SSO';


var {LoginData, AllRoute, env} = SSO;
class Admin extends Component{
    constructor(props){
        super(props)
        this.state = {
            redirectAdmin:LoginData.Security_IsAdmin(),
            redirectSuperAdmin:LoginData.Security_IsLoginSuperAdmin(),
            isLoading:true,
        }
        this.loading = this.loading.bind(this);
    }

    loading(val){
        if(val===false){
            this.setState({isLoading:false})
        }
    }
    
    render(){
        if(this.state.redirectAdmin){
            if(!this.state.redirectSuperAdmin){
                if(window.location.pathname === AllRoute.adminPlatform || window.location.pathname === AllRoute.adminPlatformDtl) {
                    LoginData.Security_RedirectSuperAdmin();
                    return(
                        <Navigate to={AllRoute.root} />
                    );    
                }
            }
            console.log("woii"+this.state.isLoading);
            return(

                    <main>
                        <div data-u="loading" style={this.state.isLoading?{visibility:"visible",opacity:1,transition:"linear",transitionDuration:"1s"}:{visibility:"hidden",opacity:0,transition:"linear",transitionDuration:"1s"}}>
                                <div style={{filter: "alpha(opacity=30)", opacity: "0.3", position: "absolute", display: "block", top: "0px", left: "0px", width: "100%", height: "100%"}}></div>
                                <div style={{position:"absolute", display:"block", background:"url('../../assets/images/loading.gif') no-repeat center center", top:"0px",left:"0px",width:"100%",height:"100%"}}></div>
                        </div>
                        <div id="asd" style={this.state.isLoading?{visibility:"hidden",opacity:0,transition:"linear",transitionDuration:"1s"}:{visibility:"visible",opacity:1,transition:"linear",transitionDuration:"1s"}}> 
                        <Head/>
                            


                            {  window.location.pathname === AllRoute.root ? null :<AdminNavbar/> }

                                        <div className="container"  style={{marginTop:"10px"}}>
                                       
                                            <div className="row">
                                            
                                            
                                            {  
                                            window.location.pathname === AllRoute.root || window.location.pathname === AllRoute.adminPinned ? null :<Sidebar/>  
                                            }
                                                <Outlet context={{ loadingData: this.loading }} />
                                                
											</div>
                                        </div> 
                                    </div> 
                            <br/>
                            <br/>
                            <br/>
                    </main>
            );
        }else{
            LoginData.Security_RedirectAdmin();
            return(
                <Navigate to={AllRoute.root} />
            );
        }
    }
}
    export default Admin;