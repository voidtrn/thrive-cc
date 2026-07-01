import { env, securityData } from './globalHelper';
import routeAll from './route';

const routeAdmin = routeAll.routesAdmin
const routeUser = routeAll.routesUser

const theme = securityData.Security_getTheme()

const menu = [
    // {txtName:routeUser.home.name,dropdown:false,showMobile:true,adminLevel:routeUser.home.adminLevel,imageMenu:theme.img_home_menu,href:routeUser.home.path,dropdownMenu:[]},
    // {txtName:routeUser.movement.name,dropdown:false,showMobile:true,adminLevel:routeUser.movement.adminLevel,imageMenu:theme.img_home_menu,href:routeUser.movement.path,dropdownMenu:[]},
    {txtName:'Explore',dropdown:true,showMobile:true,adminLevel:0,imageMenu:theme.img_home_menu,href:"#",dropdownMenu:[]},
    {txtName:'Skill For Future',dropdown:false,showMobile:true,adminLevel:routeUser.viewcourse.adminLevel,imageMenu:env.assets+"img/Artboard 3.png",href:routeUser.viewcourse.path,dropdownMenu:[]},
]

const sidebar = [
    {txtNameBold:'Super Admin',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:4,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'Platform',dropdown:false,showMobile:false,iconClass:"fa fa-home",adminLevel:routeAdmin.platform.adminLevel,href:routeAdmin.platform.path,dropdownMenu:[]},
    ]},
    {txtNameBold:'AWB Admin',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:3,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'Dashboard',dropdown:false,showMobile:false,iconClass:"fa fa-dashboard",adminLevel:routeAdmin.theme.adminLevel,href:env.adminDashboardUrl,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Users',dropdown:false,showMobile:false,iconClass:"fa fa-user",adminLevel:routeAdmin.users.adminLevel,href:routeAdmin.users.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Configuration',dropdown:false,showMobile:false,iconClass:"fa fa-gear",adminLevel:routeAdmin.webConfig.adminLevel,href:routeAdmin.webConfig.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Level',dropdown:false,showMobile:false,iconClass:"fa fa-level-up",adminLevel:routeAdmin.userLevel.adminLevel,href:routeAdmin.userLevel.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Pages',dropdown:false,showMobile:false,iconClass:"fa fa-image",adminLevel:routeAdmin.pages.adminLevel,href:routeAdmin.pages.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'FAQ',dropdown:false,showMobile:false,iconClass:"fa fa-newspaper-o",adminLevel:routeAdmin.faq.adminLevel,href:routeAdmin.faq.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Terms & Conditions',dropdown:false,showMobile:false,iconClass:"fa fa-list-alt",adminLevel:routeAdmin.terms.adminLevel,href:routeAdmin.terms.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Slider',dropdown:false,showMobile:false,iconClass:"fa fa-wpforms",adminLevel:routeAdmin.slider.adminLevel,href:routeAdmin.slider.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Section (lvl 1)',dropdown:false,showMobile:false,iconClass:"fa fa-header",adminLevel:routeAdmin.section.adminLevel,href:routeAdmin.section.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Menu (lvl 2)',dropdown:false,showMobile:false,iconClass:"fa fa-list",adminLevel:routeAdmin.menu.adminLevel,href:routeAdmin.menu.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Category (lvl 3)',dropdown:false,showMobile:false,iconClass:"fa fa-tags",adminLevel:routeAdmin.category.adminLevel,href:routeAdmin.category.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Special Page',dropdown:false,showMobile:false,iconClass:"fa fa-star",adminLevel:routeAdmin.subCategory.adminLevel,href:routeAdmin.subCategory.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Custom Page',dropdown:false,showMobile:false,iconClass:"fa fa-star",adminLevel:routeAdmin.customPageSubCategory.adminLevel,href:routeAdmin.customPageSubCategory.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Info, Workshop, Sharing Session',dropdown:false,showMobile:false,iconClass:"fa fa-star",adminLevel:routeAdmin.workshopSharing.adminLevel,href:routeAdmin.workshopSharing.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Article',dropdown:false,showMobile:false,iconClass:"fa fa-newspaper-o",adminLevel:routeAdmin.article.adminLevel,href:routeAdmin.article.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Event',dropdown:false,showMobile:false,iconClass:"fa fa-calendar",adminLevel:routeAdmin.event.adminLevel,href:routeAdmin.event.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Reward',dropdown:false,showMobile:false,iconClass:"fa fa-gift",adminLevel:routeAdmin.reward.adminLevel,href:routeAdmin.reward.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Our Others Sources',dropdown:false,showMobile:false,iconClass:"fa fa-image",adminLevel:routeAdmin.sources.adminLevel,href:routeAdmin.sources.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Calendar',dropdown:false,showMobile:false,iconClass:"fa fa-calendar",adminLevel:routeAdmin.calendar.adminLevel,href:routeAdmin.calendar.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Import Activity (Fuse)',dropdown:false,showMobile:false,iconClass:"fa fa-database",adminLevel:routeAdmin.importActivity.adminLevel,href:routeAdmin.importActivity.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Import User Group (Dashboard)',dropdown:false,showMobile:false,iconClass:"fa fa-database",adminLevel:routeAdmin.importUserInfo.adminLevel,href:routeAdmin.importUserInfo.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Import Course Limit',dropdown:false,showMobile:false,iconClass:"fa fa-database",adminLevel:routeAdmin.importLimitCourse.adminLevel,href:routeAdmin.importLimitCourse.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Custom Link',dropdown:false,showMobile:false,iconClass:"fa fa-list",adminLevel:routeAdmin.linkSource.adminLevel,href:routeAdmin.linkSource.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Badge',dropdown:false,showMobile:false,iconClass:"fa fa-trophy",adminLevel:routeAdmin.badge.adminLevel,href:routeAdmin.badge.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Redeem Code',dropdown:false,showMobile:false,iconClass:"fa fa-ticket",adminLevel:routeAdmin.redeemCode.adminLevel,href:routeAdmin.redeemCode.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Submitted Article',dropdown:false,showMobile:false,iconClass:"fa fa-newspaper-o",adminLevel:routeAdmin.submittedArticle.adminLevel,href:routeAdmin.submittedArticle.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Course',dropdown:false,showMobile:false,iconClass:"fa fa-book",adminLevel:routeAdmin.course.adminLevel,href:routeAdmin.course.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Registration Period',dropdown:false,showMobile:false,iconClass:"fa fa-calendar",adminLevel:routeAdmin.regPeriod.adminLevel,href:routeAdmin.regPeriod.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Slider Skills For Future',dropdown:false,showMobile:false,iconClass:"fa fa-wpforms",adminLevel:routeAdmin.sliderSFF.adminLevel,href:routeAdmin.sliderSFF.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Import Additional Point',dropdown:false,showMobile:false,iconClass:"fa fa-database",adminLevel:routeAdmin.pointHistory.adminLevel,href:routeAdmin.pointHistory.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Custom Shortcut Link',dropdown:false,showMobile:false,iconClass:"fa fa-external-link",adminLevel:routeAdmin.shortcutLink.adminLevel,href:routeAdmin.shortcutLink.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Content Type',dropdown:false,showMobile:false,iconClass:"fa fa-tags",adminLevel:routeAdmin.contentType.adminLevel,href:routeAdmin.contentType.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Top Picks',dropdown:false,showMobile:false,iconClass:"fa fa-star",adminLevel:routeAdmin.topPicks.adminLevel,href:routeAdmin.topPicks.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Support Learning',dropdown:false,showMobile:false,iconClass:"fa fa-graduation-cap",adminLevel:routeAdmin.learningSupport.adminLevel,href:routeAdmin.learningSupport.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Push Notification Admin',dropdown:false,showMobile:false,iconClass:"fa fa-bell",adminLevel:routeAdmin.pushNotifAdmin.adminLevel,href:routeAdmin.pushNotifAdmin.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Import Event Participant',dropdown:false,showMobile:false,iconClass:"fa fa-database",adminLevel:routeAdmin.eventParticipantImport.adminLevel,href:routeAdmin.eventParticipantImport.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Ads',dropdown:false,showMobile:false,iconClass:"fa fa-image",adminLevel:routeAdmin.ads.adminLevel,href:routeAdmin.ads.path,dropdownMenu:[]},

    ]},
    {txtNameBold:'Learning Plan Admin',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:3,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:routeAdmin.learningStep.name ,dropdown:false,showMobile:false,iconClass:"fa fa-cogs",adminLevel:routeAdmin.learningStep.adminLevel,href:routeAdmin.learningStep.path,dropdownMenu:[]},
        
        {txtNameBold:'',txtNameRegular:routeAdmin.learningMainFocus.name ,dropdown:false,showMobile:false,iconClass:"fa fa-bullseye",adminLevel:routeAdmin.learningMainFocus.adminLevel,href:routeAdmin.learningMainFocus.path,dropdownMenu:[]},
        
        {txtNameBold:'',txtNameRegular:routeAdmin.learningKeyBehavior.name ,dropdown:false,showMobile:false,iconClass:"fa fa-key",adminLevel:routeAdmin.learningKeyBehavior.adminLevel,href:routeAdmin.learningKeyBehavior.path,dropdownMenu:[]},
        
        {txtNameBold:'',txtNameRegular:routeAdmin.learningSkills.name ,dropdown:false,showMobile:false,iconClass:"fa fa-leanpub",adminLevel:routeAdmin.learningSkills.adminLevel,href:routeAdmin.learningSkills.path,dropdownMenu:[]},

    ]},

    {txtNameBold:'Training Admin',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:1,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'Sub Function on Training',dropdown:false,showMobile:false,iconClass:"fa fa-tags",adminLevel:routeAdmin.trainingAdminSubFunction.adminLevel,href:routeAdmin.trainingAdminSubFunction.path,dropdownMenu:[]},
        {txtNameBold:'',txtNameRegular:'Training',dropdown:false,showMobile:false,iconClass:"fa fa-graduation-cap",adminLevel:routeAdmin.trainingAdmin.adminLevel,href:routeAdmin.trainingAdmin.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Training Report',dropdown:false,showMobile:false,iconClass:"fa fa-download",adminLevel:routeAdmin.trainingReportTraining.adminLevel,href:routeAdmin.trainingReportTraining.path,dropdownMenu:[]},
    ]},
    {txtNameBold:'Report',txtNameRegular:'Menu',dropdown:true,showMobile:false,adminLevel:3,iconClass:"",href:"#",dropdownMenu:[
        {txtNameBold:'',txtNameRegular:'Activity Log',dropdown:false,showMobile:false,iconClass:"fa fa-database",adminLevel:routeAdmin.activityLog.adminLevel,href:routeAdmin.activityLog.path,dropdownMenu:[]},
       
        {txtNameBold:'',txtNameRegular:'Submitted Idea',dropdown:false,showMobile:false,iconClass:"fa fa-lightbulb-o",adminLevel:routeAdmin.submittedIdea.adminLevel,href:routeAdmin.submittedIdea.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Redeem Code Claim',dropdown:false,showMobile:false,iconClass:"fa fa-ticket",adminLevel:routeAdmin.redeemCodeClaim.adminLevel,href:routeAdmin.redeemCodeClaim.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Reward Redemption',dropdown:false,showMobile:false,iconClass:"fa fa-gift",adminLevel:routeAdmin.redeemReward.adminLevel,href:routeAdmin.redeemReward.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Email Subscribe',dropdown:false,showMobile:false,iconClass:"fa fa-envelope",adminLevel:routeAdmin.emailSubscribe.adminLevel,href:routeAdmin.emailSubscribe.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Learning Plan',dropdown:false,showMobile:false,iconClass:"fa fa-leanpub",adminLevel:routeAdmin.learningPlanReport.adminLevel,href:routeAdmin.learningPlanReport.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Answered Quiz',dropdown:false,showMobile:false,iconClass:"fa fa-question",adminLevel:routeAdmin.answeredQuiz.adminLevel,href:routeAdmin.answeredQuiz.path,dropdownMenu:[]},

        {txtNameBold:'',txtNameRegular:'Share Article',dropdown:false,showMobile:false,iconClass:"fa fa-share",adminLevel:routeAdmin.shareArticle.adminLevel,href:routeAdmin.shareArticle.path,dropdownMenu:[]},
        
        
        {txtNameBold:'',txtNameRegular:'Approval Register Course',dropdown:false,showMobile:false,iconClass:"fa fa-book",adminLevel:routeAdmin.approvalRegisterCourse.adminLevel,href:routeAdmin.approvalRegisterCourse.path,dropdownMenu:[]},
               
        {txtNameBold:'',txtNameRegular:'Register Course',dropdown:false,showMobile:false,iconClass:"fa fa-book",adminLevel:routeAdmin.registerCourse.adminLevel,href:routeAdmin.registerCourse.path,dropdownMenu:[]},

        
        {txtNameBold:'',txtNameRegular:'Claim SFF',dropdown:false,showMobile:false,iconClass:"fa fa-book",adminLevel:routeAdmin.claimSFF.adminLevel,href:routeAdmin.claimSFF.path,dropdownMenu:[]},
    ]},       
]

const navMenu = {
    menu,
    sidebar
}

export default navMenu;