import axiosLibrary from './axiosLibrary';
import { securityData } from './globalHelper';
import routeAll from './route';

const routeAdmin = routeAll.routesAdmin
const routeUser = routeAll.routesUser
const routeReport = routeAll.routesReport
const linkLandingPage = 'https://culture.pmicloud.biz/'
const linkTTR = 'https://recognition.culture.pmicloud.biz/'
const linkFindTime = 'https://findtime.dev-culture.pmicloud.biz/'
const linkTimeToThink = 'https://think.culture.pmicloud.biz/'

const theme = securityData.Security_getTheme()

const menu = [
    {txtName:'Home',dropdown:false,showMobile:true,adminLevel:routeUser.home.adminLevel,imageMenu:theme.img_home_menu,href:routeUser.home.path,dropdownMenu:[]},
    {txtName:'Report',dropdown:true,showMobile:false,adminLevel:1,imageMenu:theme.img_report_menu,href:"#",dropdownMenu:[
        {txtName:'Dialogue Event Report',dropdown:false,showMobile:false,adminLevel:1,href:routeReport.submittedEvent.path,dropdownMenu:[]},
        {txtName:'Initiate Dialogue Report',dropdown:false,showMobile:false,adminLevel:1,href:routeReport.submittedInitiate.path,dropdownMenu:[]},
        {txtName:'You Ask We Answer Report',dropdown:false,showMobile:false,adminLevel:1,href:routeReport.submittedYawa.path,dropdownMenu:[]},
        {txtName:'Apps Feedback Report',dropdown:false,showMobile:false,adminLevel:1,href:routeReport.appsFeedback.path,dropdownMenu:[]},
        {txtName:'Dialogue Feedback Report',dropdown:false,showMobile:false,adminLevel:1,href:routeReport.dialogueFeedback.path,dropdownMenu:[]}
    ]},
    {txtName:'Admin',dropdown:true,showMobile:false,adminLevel:1,imageMenu:theme.img_admin_menu,href:"#",dropdownMenu:[
        {txtName:'Platform',dropdown:false,showMobile:false,adminLevel:routeAdmin.platform.adminLevel,href:routeAdmin.platform.path,dropdownMenu:[]},

        {txtName:'Theme',dropdown:false,showMobile:false,adminLevel:routeAdmin.theme.adminLevel,href:routeAdmin.theme.path,dropdownMenu:[]},

        {txtName:'Users',dropdown:false,showMobile:false,adminLevel:routeAdmin.users.adminLevel,href:routeAdmin.users.path,dropdownMenu:[]},

        {txtName:'HOF / HOF - 1',dropdown:false,showMobile:false,adminLevel:routeAdmin.hof.adminLevel,href:routeAdmin.hof.path,dropdownMenu:[]},

        {txtName:'Event Schedule',dropdown:false,showMobile:false,adminLevel:routeAdmin.schedule.adminLevel,href:routeAdmin.schedule.path,dropdownMenu:[]},

        {txtName:'Slider',dropdown:false,showMobile:false,adminLevel:routeAdmin.slider.adminLevel,href:routeAdmin.slider.path,dropdownMenu:[]},

        {txtName:'Gallery',dropdown:false,showMobile:false,adminLevel:routeAdmin.gallery.adminLevel,href:routeAdmin.gallery.path,dropdownMenu:[]},

        {txtName:'Question & Answer',dropdown:false,showMobile:false,adminLevel:routeAdmin.qna.adminLevel,href:routeAdmin.qna.path,dropdownMenu:[]},

        {txtName:'Activity Log',dropdown:false,showMobile:false,adminLevel:routeAdmin.activityLog.adminLevel,href:routeAdmin.activityLog.path,dropdownMenu:[]},

        {txtName:'Setup Apps Feedback',dropdown:false,showMobile:false,adminLevel:routeAdmin.feedbackList.adminLevel,href:routeAdmin.feedbackList.path,dropdownMenu:[]},

    ]},
    {txtName:'Burger Menu',dropdown:true,showMobile:true,adminLevel:0,imageMenu:theme.img_burger_menu,href:"#",dropdownMenu:[
        {txtName:'Landing Page',dropdown:false,showMobile:true,adminLevel:0,href:linkLandingPage,dropdownMenu:[]},
        {txtName:'Recognition',dropdown:false,showMobile:true,adminLevel:0,href:linkTTR,dropdownMenu:[]},
        {txtName:'Find Time',dropdown:false,showMobile:true,adminLevel:0,href:linkFindTime,dropdownMenu:[]},
        {txtName:'Time to Think',dropdown:false,showMobile:true,adminLevel:0,href:linkTimeToThink,dropdownMenu:[]},
        {txtName:'Logout',dropdown:false,showMobile:true,adminLevel:0,href:"#", eventOnClick:()=>axiosLibrary.logOut(),dropdownMenu:[]},
    ]},
    {txtName:'Mail',dropdown:false,showMobile:true,adminLevel:0,imageMenu:theme.img_email_menu,href:"mailto:Internal.Communications@sampoerna.com",dropdownMenu:[]},

]

const sidebar = [
    {txtNameBold:'Super Admin',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:2,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'Platform',dropdown:false,showMobile:false,iconClass:"fa fa-home",adminLevel:routeAdmin.platform.adminLevel,href:routeAdmin.platform.path,dropdownMenu:[]},
    ]},
    {txtNameBold:'Admin Dialogue',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:1,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'Theme',dropdown:false,showMobile:false,iconClass:"fa fa-paint-brush",adminLevel:routeAdmin.theme.adminLevel,href:routeAdmin.theme.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Users',dropdown:false,showMobile:false,iconClass:"fa fa-user",adminLevel:routeAdmin.users.adminLevel,href:routeAdmin.users.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'HOF / HOF - 1',dropdown:false,showMobile:false,iconClass:"fa fa-user",adminLevel:routeAdmin.hof.adminLevel,href:routeAdmin.hof.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Event Schedule',dropdown:false,showMobile:false,iconClass:"fa fa-calendar",adminLevel:routeAdmin.schedule.adminLevel,href:routeAdmin.schedule.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Slider',dropdown:false,showMobile:false,iconClass:"fa fa-image",adminLevel:routeAdmin.slider.adminLevel,href:routeAdmin.slider.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Gallery',dropdown:false,showMobile:false,iconClass:"fa fa-image",adminLevel:routeAdmin.gallery.adminLevel,href:routeAdmin.gallery.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Question & Answer',dropdown:false,showMobile:false,iconClass:"fa fa-comment",adminLevel:routeAdmin.qna.adminLevel,href:routeAdmin.qna.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Activity Log',dropdown:false,showMobile:false,iconClass:"fa fa-database",adminLevel:routeAdmin.activityLog.adminLevel,href:routeAdmin.activityLog.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Setup Apps Feedback',dropdown:false,showMobile:false,iconClass:"fa fa-comment",adminLevel:routeAdmin.feedbackList.adminLevel,href:routeAdmin.feedbackList.path,dropdownMenu:[]},

    ]},
    {txtNameBold:'Admin UFT',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:1,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'UFT Slider', dropdown:false, showMobile:false, iconClass:"fa fa-image", adminLevel:routeAdmin.uftSlider.adminLevel, href:routeAdmin.uftSlider.path, dropdownMenu:[]},
        {txtNameBold:'',txtNameRegular:'UFT Feature', dropdown:false, showMobile:false, iconClass:"fa fa-columns", adminLevel:routeAdmin.uftFeature.adminLevel, href:routeAdmin.uftFeature.path, dropdownMenu:[]},
        {txtNameBold:'',txtNameRegular:'UFT Config', dropdown:false, showMobile:false, iconClass:"fa fa-gear", adminLevel:routeAdmin.uftConfigDetail.adminLevel, href:routeAdmin.uftConfigDetail.path, dropdownMenu:[]},
    ]},
    {txtNameBold:'Submitted Dialogue',txtNameRegular:'Data',dropdown:true,showMobile:false,adminLevel:1,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'Dialogue Event',dropdown:false,showMobile:false,adminLevel:1,iconClass:"fa fa-database",href:routeReport.submittedEvent.path,dropdownMenu:[]},
        {txtNameBold:'',txtNameRegular:'Initiate Dialogue',dropdown:false,showMobile:false,adminLevel:1,iconClass:"fa fa-database",href:routeReport.submittedInitiate.path,dropdownMenu:[]},
        {txtNameBold:'',txtNameRegular:'You Ask We Answer',dropdown:false,showMobile:false,adminLevel:1,iconClass:"fa fa-database",href:routeReport.submittedYawa.path,dropdownMenu:[]},
    ]},

]

const navMenu = {
    menu,
    sidebar
}

export default navMenu;