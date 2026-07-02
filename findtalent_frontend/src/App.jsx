import { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Admin from './views/admin/admin';
import Homepage from './views/users/vw_master';
import Report from './views/reports/vw_reports';
import Head from './helpers/Head';
import 'bootstrap/dist/css/bootstrap.css';
import SSO from './helpers/SSO';

// Homepage (vw_master) leaf views
import HomeView from './views/users/feature/vw_home';
import DetailProjectView from './views/users/feature/vw_detail_project';
import SavedProjectView from './views/users/feature/vw_saved_project';
import AppliedProjectView from './views/users/feature/vw_applied_project';

// Report (vw_reports) leaf views
import Record from './views/reports/vw_record';
import Score from './views/reports/vw_score';

// Admin leaf views
import VwSlider from './views/admin/vw_slider';
import VwSliderDtl from './views/admin/vw_slider_dtl';
import VwActivityLog from './views/admin/vw_activity_log';
import VwUsers from './views/admin/vw_users';
import VwPlatformMaster from './views/admin/vw_platform_master';
import VwPlatformMasterDtl from './views/admin/vw_platform_master_dtl';
import VwTheme from './views/admin/vw_theme';
import VwThemeDtl from './views/admin/vw_theme_dtl';
import VwProject from './views/admin/vw_project';
import VwProjectDtl from './views/admin/vw_project_dtl';
import VwUserProject from './views/admin/vw_user_project';
import VwUserProjectDtl from './views/admin/vw_user_project_dtl';
import VwQuestionaire from './views/admin/vw_questionaire';
import VwQuestionaireRadio from './views/admin/vw_questionaire_radio';
import VwQuestionaireFreetext from './views/admin/vw_questionaire_freetext';
import VWReportSummary from './views/admin/vw_report_summary';
import VwReportDetail from './views/admin/vw_report_detail';



var {AllRoute,LoginData, env} = SSO;


class App extends Component{
  constructor(props){
    super(props);

    this.state = {
      btnWizardPostColor: LoginData.Security_getTheme().btn_submit,
      btnComment: LoginData.Security_getTheme().btn_submit,
      module_titleColor: LoginData.Security_getTheme().module_title,
      colorFooter: LoginData.Security_getTheme().footer_background,
      isLoading: true,
      IsLoginSuccess: false,
      NeedRegister: false,
      modalShow:true,

      
      defaultProfileCard: env.assets+"images/Base-Profile-1.jpg",      
      profileCard: env.userDocument+"theme/"+LoginData.Security_getTheme().background_profile,
    }
  }

  componentDidMount(){
  }
  
  componentWillUpdate(){
    this.expireSession();
  }

  expireSession(){
    var hours = env.expSession; // Reset when storage is more than 1hours
    var now = new Date().getTime();
    var setupTime = localStorage.getItem('setupTime');
    if (setupTime == null) {
        localStorage.setItem('setupTime', now)
    } else {
        if(now-setupTime > hours*60*60*1000) {
            localStorage.clear()
            //AuthContext.logOut()
            localStorage.setItem('setupTime', now);
        }
    }
  }

  handleClose() {
    this.setState({ modalShow: false });
  }

  render(){
    const{ 
      btnWizardPostColor,
      btnComment,
      module_titleColor,
      colorFooter,




      defaultProfileCard,
      profileCard,

    } = this.state
    return (
      <BrowserRouter>
          <main>
            <style>{
                    ` button.btn-previous, button.btn.btn-next, button.btn-submit {
                      background:`+btnWizardPostColor+`;
                    }
                    .buttonGroupPlatform{
                      background:`+LoginData.Security_getTheme().background_top_button+`;
                      color:`+LoginData.Security_getTheme().text_color_top_button+`;
                      
                    }
                    .buttonGroupPlatform{
                      border : 2px solid #fff;
                    }
                    .buttonGroupPlatform{
                      margin-left:5px;
                    } 
                    .buttonGroupPlatform:hover{
                        background:`+LoginData.Security_getTheme().background_top_button+`;
                        border : 2px solid `+LoginData.Security_getTheme().background_top_button+`;
                    }
                    .buttonGroupPlatform:active{
                      background:`+LoginData.Security_getTheme().background_top_button+`;
                      border : 2px solid `+LoginData.Security_getTheme().background_top_button+`;
                    }
                    .copyright{
                      background-image:`+colorFooter+`;
                    }
                    span.module-title{
                      color:`+module_titleColor+`;
                    }
                    .btnSubmit, .btn-search{
                      background:`+(LoginData.Security_getTheme().background_btn_submit || 'linear-gradient(to right, #f58220 0%, #e45053 50%, #d31d85 100%)')+` !important;
                      color:`+(LoginData.Security_getTheme().text_color_btn_submit || '#ffffff')+` !important;
                      display: inline-block;
                      padding: 8px 16px;
                    }
                    .btnSubmit:hover{
                      color:`+(LoginData.Security_getTheme().text_color_btn_submit || '#ffffff')+` !important;
                    }
                    
                    .saved-as-draft {
                      color: `+LoginData.Security_getTheme().background_top_button
                      +`;
                      border-color: `+LoginData.Security_getTheme().background_top_button+`;
                      background: #fff;
                      border-width: 1px;
                    }
                    

                    textarea.form-control {
                      border: 1px solid `+LoginData.Security_getTheme().background_top_button+`;
                    }

                    .profile-card{
                      background: url(`+profileCard+`),url(`+defaultProfileCard+`);
                      background-repeat: no-repeat;
                      background-size: auto;
                    }

                    .btn-action-detail {
                      margin: 20px;
                    }
                    .post-detail{
                     margin-left: 35px;
                     font-size: 13px;
                    }
                    .post-detail h5{
                      margin: 0px;
                      font-size: 13px;
                    }

                    .post-detail span{
                      color: #b1b1b1;
                      margin: 0;
                      font-weight: 300;
                      font-size: 13px;
                    }
                    .post-container{
                      margin: 10px;
                    }
                    #footer::before{
                      content: "";
                      background: `+LoginData.Security_getTheme().top_menu_border+`;
                      height: 5px;
                      width: 100%;
                      position: absolute;
                    }
                    .copyright{
                      background-image: `+LoginData.Security_getTheme().footer_background+`;
                      background-repeat: round;
                      text-align: center;
                      color: `+LoginData.Security_getTheme().text_footer_color+`;
                      padding: 13px 0 10px;
                      font-size: 13px;
                      font-weight: bold;
                    }.ql-editor{
                      min-height: 100px !important;
                      max-height: 300px;
                      overflow: hidden;
                      overflow-y: scroll;
                      overflow-x: scroll;
                    }
                    `
                    }
            </style>
            <Head/>
            <Routes>
                <Route path={AllRoute.login} element={<Login/>}/>

                {/* Homepage layout (vw_master renders chrome + <Outlet/>) */}
                <Route element={<Homepage/>}>
                  <Route path={AllRoute.root} element={<HomeView/>}/>
                  <Route path={AllRoute.detailProject} element={<DetailProjectView/>}/>
                  <Route path={AllRoute.savedProject} element={<SavedProjectView/>}/>
                  <Route path={AllRoute.appliedProject} element={<AppliedProjectView/>}/>
                </Route>

                {/* Report layout */}
                <Route element={<Report/>}>
                  <Route path={AllRoute.reportRecord} element={<Record/>}/>
                  <Route path={AllRoute.reportScore} element={<Score/>}/>
                </Route>

                {/* Admin layout */}
                <Route element={<Admin/>}>
                  <Route path={AllRoute.adminPlatform} element={<VwPlatformMaster/>}/>
                  <Route path={AllRoute.adminPlatformDtl} element={<VwPlatformMasterDtl/>}/>
                  <Route path={AllRoute.adminUsers} element={<VwUsers/>}/>
                  <Route path={AllRoute.adminSlider} element={<VwSlider/>}/>
                  <Route path={AllRoute.adminSliderDtl} element={<VwSliderDtl/>}/>
                  <Route path={AllRoute.adminProject} element={<VwProject/>}/>
                  <Route path={AllRoute.adminProjectDtl} element={<VwProjectDtl/>}/>
                  <Route path={AllRoute.adminQuestionnaire} element={<VwQuestionaire/>}/>
                  <Route path={AllRoute.adminQuestionnaireRadio} element={<VwQuestionaireRadio/>}/>
                  <Route path={AllRoute.adminQuestionnaireFreeText} element={<VwQuestionaireFreetext/>}/>
                  <Route path={AllRoute.adminUserProject} element={<VwUserProject/>}/>
                  <Route path={AllRoute.adminUserProjectDtl} element={<VwUserProjectDtl/>}/>
                  <Route path={AllRoute.adminActivityLog} element={<VwActivityLog/>}/>
                  <Route path={AllRoute.adminReportSummary} element={<VWReportSummary/>}/>
                  <Route path={AllRoute.adminReportDetail} element={<VwReportDetail/>}/>
                  <Route path={AllRoute.adminTheme} element={<VwTheme/>}/>
                  <Route path={AllRoute.adminThemeDtl} element={<VwThemeDtl/>}/>
                </Route>
            </Routes>
          </main>
      </BrowserRouter>
    );
  }
}


export default App;
