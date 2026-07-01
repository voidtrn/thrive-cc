// import Home from "../views/user/home";
import React from 'react';
// route user
const NotFound = React.lazy(() => import('../components/notFound'));
const AccessDenied = React.lazy(() => import('../components/accessDenied'));
const Home = React.lazy(() => import('../views/user/home'));
// const Home = React.lazy(() => {
//     return new Promise(resolve => {
//       setTimeout(() => resolve(import('../views/user/home')), 200000000);
//     });
//   });
// const UserGallery = React.lazy(() => {
//         return new Promise(resolve => {
//           setTimeout(() => resolve(import('../views/user/gallery')), 10000);
//         });
//       });
const UserGallery = React.lazy(() => import('../views/user/gallery'));
const Events = React.lazy(() => import('../views/user/events'));
const Yawa = React.lazy(() => import('../views/user/yawa'));
const Uft = React.lazy(() => import('../views/user/uft'));

// route admin
const Platform = React.lazy(() => import('../views/admin/platform'));
const PlatformDetail = React.lazy(() => import('../views/admin/platformDetail'));
const Theme = React.lazy(() => import('../views/admin/theme'));
const ThemeDetail = React.lazy(() => import('../views/admin/themeDetail'));
const Users = React.lazy(() => import('../views/admin/users'));
const UsersDetail = React.lazy(() => import('../views/admin/usersDetail'));
const Hof = React.lazy(() => import('../views/admin/hof'));
const HofDetail = React.lazy(() => import('../views/admin/hofDetail'));
const Schedule = React.lazy(() => import('../views/admin/schedule'));
const ScheduleDetail = React.lazy(() => import('../views/admin/scheduleDetail'));
const Slider = React.lazy(() => import('../views/admin/slider'));
const SliderDetail = React.lazy(() => import('../views/admin/sliderDetail'));
const Gallery = React.lazy(() => import('../views/admin/gallery'));
const GalleryDetail = React.lazy(() => import('../views/admin/galleryDetail'));
const Qna = React.lazy(() => import('../views/admin/qna'));
const QnaDetail = React.lazy(() => import('../views/admin/qnaDetail'));
const ActivityLog = React.lazy(() => import('../views/admin/activityLog'));
const FeedbackList = React.lazy(() => import('../views/admin/feedbackList'));
const FeedbackListDetail = React.lazy(() => import('../views/admin/feedbackListDetail'));

const submittedEvent = React.lazy(()=> import('../views/report/reportSubmittedEvents'))
const submittedInitiate = React.lazy(()=> import('../views/report/reportSubmittedInitiate'))
const submittedYawa = React.lazy(()=> import('../views/report/reportSubmittedYawa'))
const appsFeedback = React.lazy(()=> import('../views/report/reportAppsFeedback'))
const dialogueFeedback = React.lazy(()=> import('../views/report/reportDialogueFeedback'))

const UftSlider = React.lazy(() => import('../views/admin/uftSlider'));
const UftSliderDetail = React.lazy(() => import('../views/admin/uftSliderDetail'));
const UftConfig = React.lazy(() => import('../views/admin/uftConfig'));
const UftConfigDetail = React.lazy(() => import('../views/admin/uftConfigDetail'));
const UftFeature = React.lazy(() => import('../views/admin/uftFeature'));
const UftFeatureDetail = React.lazy(() => import('../views/admin/uftFeatureDetail'));


const routesUser = {
    home:{path: '/', name: 'Home', component: Home, exact: true, pageName:"Home",adminLevel:0},
    gallery:{path: '/gallery', name: 'Gallery', component: UserGallery, exact: true, pageName:"Gallery", adminLevel:0},
    events:{path: '/events', name: 'Events', component: Events, exact: true, pageName:"Events", adminLevel:0},
    yawa:{path: '/yawa', name: 'Yawa', component: Yawa, exact: true, pageName:"YAWA", adminLevel:0},
    uft:{path: '/uft', name: 'Upward Feedback Tool', component: Uft, exact: true, pageName:"UFT", adminLevel:0},
}

const routesAdmin = {
    platform:{path: '/admin/platform', name: 'Platform', exact: true, component:Platform, pageName:"Platform Administration",adminLevel:2},
    platformDetail:{path: '/admin/platform_detail', name: 'Platform Detail', exact: true, component:PlatformDetail, pageName:"Platform Detail Administration",adminLevel:2},
    theme:{path: '/admin/theme', name: 'Theme', exact: true, component:Theme, pageName:"Theme Administration",adminLevel:1},
    themeDetail:{path: '/admin/theme_detail', name: 'Theme Detail', exact: true, component:ThemeDetail, pageName:"Theme Detail Administration",adminLevel:1},
    users:{path: '/admin/users', name: 'Users', component: Users, exact: true, pageName:"Users Administration",adminLevel:1},
    usersDetail:{path: '/admin/users_detail', name: 'Users Detail', exact: true, component:UsersDetail, pageName:"Users Detail Administration",adminLevel:1},
    hof:{path: '/admin/hof', name: 'HOF / HOF - 1', exact: true, component:Hof, pageName:"HoF Administration",adminLevel:1},
    hofDetail:{path: '/admin/hof_detail', name: 'HOF Detail', exact: true, component:HofDetail, pageName:"HOF Detail Administration",adminLevel:1},
    schedule:{path: '/admin/schedule', name: 'Event Schedule', exact: true, component:Schedule, pageName:"Event Schedule Administration",adminLevel:1},
    scheduleDetail:{path: '/admin/schedule_detail', name: 'Event Schedule Detail', exact: true, component:ScheduleDetail, pageName:"Event Schedule Detail Administration",adminLevel:1},
    slider:{path: '/admin/slider', name: 'Slider', exact: true, component:Slider, pageName:"Slider Administration",adminLevel:1},
    sliderDetail:{path: '/admin/slider_detail', name: 'Slider Detail', exact: true, component:SliderDetail, pageName:"Slider Detail Administration",adminLevel:1},
    gallery:{path: '/admin/gallery', name: 'Gallery', exact: true, component:Gallery, pageName:"Gallery Administration",adminLevel:1},
    galleryDetail:{path: '/admin/gallery_detail', name: 'Gallery Detail', exact: true, component:GalleryDetail, pageName:"Gallery Detail Administration",adminLevel:1},
    qna:{path: '/admin/qna', name: 'Question & Answer', exact: true, component:Qna, pageName:"Question & Answer Administration",adminLevel:1},
    qnaDetail:{path: '/admin/qna_detail', name: 'Question & Answer Detail', exact: true, component:QnaDetail, pageName:"Question & Answer Detail Administration",adminLevel:1},
    activityLog:{path: '/admin/activity_log', name: 'Activity Log', exact: true, component:ActivityLog, pageName:"Activity Log Administration",adminLevel:1},
    feedbackList:{path: '/admin/feedback_list', name: 'Setup Apps Feedback', exact: true, component:FeedbackList, pageName:"Setup Apps Feedback Administration",adminLevel:1},
    feedbackListDetail:{path: '/admin/feedback_list_detail', name: 'Setup Apps Feedback Detail', exact: true, component:FeedbackListDetail, pageName:"Setup Apps Feedback Detail Administration",adminLevel:1},
    uftSlider:{path: '/admin/uftSlider', name: 'Slider', exact: true, component:UftSlider, pageName:"Slider Administration", adminLevel:1},
    uftSliderDetail:{path: '/admin/uftSliderDetail', name: 'Slider Detail', exact: true, component:UftSliderDetail, pageName:"Slider Detail Administration", adminLevel:1},
    uftFeature:{path: '/admin/uftFeature', name: 'Feature', exact: true, component:UftFeature, pageName:"Feature Administration", adminLevel:1},
    uftFeatureDetail:{path: '/admin/uftFeatureDetail', name: 'Feature Detail', exact: true, component:UftFeatureDetail, pageName:"Feature Detail Administration", adminLevel:1},
    uftConfig:{path: '/admin/uftConfig', name: 'Config', exact: true, component:UftConfig, pageName:"Config Administration", adminLevel:1},
    uftConfigDetail:{path: '/admin/uftConfigDetail', name: 'Config Detail', exact: true, component:UftConfigDetail, pageName:"Config Detail Administration", adminLevel:1},

}

const routesComponent = {
    notFound:{path: '/error/404', name: '404 Not Found', component: NotFound, exact: true, pageName:"404 Not Found",adminLevel:0},
    accessDenied:{path: '/error/400', name: 'ACCESS DENIED', component: AccessDenied, exact: true, pageName:"ACCESS DENIED",adminLevel:0},
}

const routesReport = {
    submittedEvent:{path: '/report/submitted_event', name: 'Dialogue Event Report', exact: true, component:submittedEvent, pageName:"Report Dialogue Event ",adminLevel:1},
    submittedInitiate:{path: '/report/submitted_initiate', name: 'Initiate Dialogue Report', exact: true, component:submittedInitiate, pageName:"Report Initiate Dialogue ",adminLevel:1},
    submittedYawa:{path: '/report/submitted_yawa', name: 'You Ask We Answer Report', exact: true, component:submittedYawa, pageName:"Report You Ask We Answer",adminLevel:1},
    appsFeedback:{path: '/report/apps_feedback', name: 'Apps Feedback Report', exact: true, component: appsFeedback, pageName:"Report Apps Feedback", adminLevel:1},
    dialogueFeedback:{path: '/report/dialogue_feedback', name: 'Dialogue Feedback Report', exact: true, component: dialogueFeedback, pageName:"Report Dialogue Feedback", adminLevel:1}
}


const routeAll = {
    routesUser,
    routesAdmin,
    routesComponent,
    routesReport
}

export default routeAll;