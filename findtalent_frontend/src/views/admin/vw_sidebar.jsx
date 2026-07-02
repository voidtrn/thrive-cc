import { Component } from 'react';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute} = SSO;
 

class sidebar_menu extends Component{
    constructor(props){
        super(props)
        this.state = {
            isSuperAdmin: LoginData.Security_IsLoginSuperAdmin()
        };

    }
     
    render(){
        const{isSuperAdmin}=this.state;
        const platformClass	= window.location.pathname === AllRoute.adminPlatform || window.location.pathname === AllRoute.adminPlatformDtl ? 'active list-group-item' : 'list-group-item';
        const userClass 	= window.location.pathname === AllRoute.adminUsers || window.location.pathname === AllRoute.adminUsersDtl ? 'active list-group-item' : 'list-group-item';
        const sliderClass	= window.location.pathname === AllRoute.adminSlider || window.location.pathname === AllRoute.adminSliderDtl ? 'active list-group-item' : 'list-group-item';
        const projectClass	= window.location.pathname === AllRoute.adminProject  || window.location.pathname === AllRoute.adminProjectDtl || window.location.pathname === AllRoute.adminQuestionnaire || window.location.pathname === AllRoute.adminQuestionnaireRadio || window.location.pathname === AllRoute.adminQuestionnaireFreeText ? 'active list-group-item' : 'list-group-item';
	const userProjectClass	= window.location.pathname === AllRoute.adminUserProject || window.location.pathname === AllRoute.adminUserProjectDtl ? 'active list-group-item' : 'list-group-item';
		
	const themeClass 	= window.location.pathname === AllRoute.adminTheme || window.location.pathname === AllRoute.adminThemeDtl ? 'active list-group-item' : 'list-group-item';
        const activityLogClass = window.location.pathname === AllRoute.adminActivityLog ? 'active list-group-item' : 'list-group-item';
        const reportSummaryClass = window.location.pathname === AllRoute.adminReportSummary ? 'active list-group-item' : 'list-group-item';
        const reportDetailClass = window.location.pathname === AllRoute.adminReportDetail ? 'active list-group-item' : 'list-group-item';
        

        return(
            <div className="col-md-2">
                <div id="admin-menu" className="panel panel-default">	
                    {isSuperAdmin? 
                        <div className="panel-heading"><strong>Super Admin</strong> menu</div>
                    : null}
                    
                    {isSuperAdmin? 
                        <div className="list-group">
                            <a className={platformClass} href={AllRoute.adminPlatform}>
                                <i className="fa fa-home"></i><span>&nbsp;Platform</span>
                            </a>
                            {/* <a className={mstContentClass} href={AllRoute.adminMstContent}>
                                <i className="fa fa-hashtag"></i><span>&nbsp;Master Content</span>
                            </a>    */}
                        </div>      
                    : null}	                
						<div className="panel-heading"><strong>Admin</strong> menu</div>
                        <div className="list-group">
                            <a className={ themeClass } href={AllRoute.adminTheme}>
                                <i className="fa fa-paint-brush"></i><span>&nbsp;Theme</span>
                            </a> 
                            <a className={userClass} href={AllRoute.adminUsers}>
                                <i className="fa fa-users"></i><span>&nbsp;Users</span>
                            </a>
                            <a className={ sliderClass } href={AllRoute.adminSlider}>
                                <i className="fa fa-image"></i><span>&nbsp;Image Slider</span>
                            </a>
                            <a className={ projectClass } href={AllRoute.adminProject}>
                                <i className="fa fa-cube"></i><span>&nbsp;Manage Project</span>
                            </a>
                            <a className={ userProjectClass } href={AllRoute.adminUserProject}>
                                <i className="fa fa-user"></i><span>&nbsp;User Project</span>
                            </a> 
                            <a className={activityLogClass} href={AllRoute.adminActivityLog}>
                                <i className="fa fa-database"></i><span>&nbsp;Activity Log</span>
                            </a>
                        </div>
						<div className="panel-heading"><strong>Report</strong> menu</div>
                        <div className="list-group">
                            <a className={reportSummaryClass} href={AllRoute.adminReportSummary}>
                                <i className="fa fa-edit"></i><span>&nbsp;Project Summary</span>
                            </a>
                            <a className={reportDetailClass} href={AllRoute.adminReportDetail}>
                                <i className="fa fa-edit"></i><span>&nbsp;Project Detail</span>
                            </a>
                        </div>
                </div>
					
					
            </div>
        );
    }
}
    
    export default sidebar_menu;