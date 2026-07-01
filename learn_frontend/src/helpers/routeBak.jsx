// import Home from "../views/user/home";
import React from 'react';
// route user
const NotFound = React.lazy(() => import('../components/notFound'));
const AccessDenied = React.lazy(() => import('../components/accessDenied'));
const Home = React.lazy(() => import('../views/user/home'));
const Training = React.lazy(() => import('../views/user/training'));
const TrainingTeam = React.lazy(() => import('../views/user/training_team'));
const Movement = React.lazy(() => import('../views/user/movement'));
const Viewcourse = React.lazy(() => import('../views/user/sff/viewcourse'));
const ViewcourseDetail = React.lazy(() => import('../views/user/sff/viewcourseDetail'));
const Profile = React.lazy(() => import('../views/user/profile'));
const ProfileTeams = React.lazy(() => import('../views/user/profile_teams'));
const ViewAll = React.lazy(() => import('../views/user/viewAll'));
const SearchArticle = React.lazy(() => import('../views/user/search'));
const LearningPage = React.lazy(() => import('../views/user/learning'));

// route admin
const Platform = React.lazy(() => import('../views/admin/platform'));
const PlatformDetail = React.lazy(() => import('../views/admin/platformDetail'));
const Theme = React.lazy(() => import('../views/admin/theme'));
const ThemeDetail = React.lazy(() => import('../views/admin/themeDetail'));
const Users = React.lazy(() => import('../views/admin/users'));
const UsersDetail = React.lazy(() => import('../views/admin/usersDetail'));
const PointDetail = React.lazy(() => import('../views/admin/pointDetail'));
const WebConfig = React.lazy(() => import('../views/admin/webConfig'));
const WebConfigDetail = React.lazy(() => import('../views/admin/webConfigDetail'));
const UserLevel = React.lazy(() => import('../views/admin/userLevel'));
const UserLevelDetail = React.lazy(() => import('../views/admin/userLevelDetail'));
const Pages = React.lazy(() => import('../views/admin/pages'));
const PagesDetail = React.lazy(() => import('../views/admin/pagesDetail'));
const Faq = React.lazy(() => import('../views/admin/faq'));
const FaqDetail = React.lazy(() => import('../views/admin/faqDetail'));
const Terms = React.lazy(() => import('../views/admin/terms'));
const TermsDetail = React.lazy(() => import('../views/admin/termsDetail'));
const Slider = React.lazy(() => import('../views/admin/slider'));
const SliderDetail = React.lazy(() => import('../views/admin/sliderDetail'));
const Section = React.lazy(() => import('../views/admin/section'));
const SectionDetail = React.lazy(() => import('../views/admin/sectionDetail'));
const Menu = React.lazy(() => import('../views/admin/menu'));
const MenuDetail = React.lazy(() => import('../views/admin/menuDetail'));
const Category = React.lazy(() => import('../views/admin/category'));
const CategoryDetail = React.lazy(() => import('../views/admin/categoryDetail'));
const SubCategory = React.lazy(() => import('../views/admin/subCategory'));
const SubCategoryDetail = React.lazy(() => import('../views/admin/subCategoryDetail'));
const ArticleSubCategory = React.lazy(() => import('../views/admin/subCategory'));
const SliderCategory = React.lazy(() => import('../views/admin/subCategory'));
const SliderCategoryDetail = React.lazy(() => import('../views/admin/sliderCategoryDetail'));
const ArticleOfMonthSpecial = React.lazy(() => import('../views/admin/subCategory'));
const WorkshopSharing = React.lazy(() => import('../views/admin/workshopSharing'));
const WorkshopSharingWorkshop = React.lazy(() => import('../views/admin/workshopSharing'));
const WorkshopSharingSession = React.lazy(() => import('../views/admin/workshopSharing'));
const WorkshopSharingInfoMenu = React.lazy(() => import('../views/admin/workshopSharing'));
const WorkshopSharingWorkshopUser = React.lazy(() => import('../views/admin/workshopSharingWorkshopUser'));
const WorkshopSharingWorkshopCreate = React.lazy(() => import('../views/admin/workshopSharingCreateWorkshop'));
const WorkshopSharingWorkshopEdit = React.lazy(() => import('../views/admin/workshopSharingCreateWorkshop'));
const ActivityLog = React.lazy(() => import('../views/report/activityLog'));
const AnsweredQuiz = React.lazy(() => import('../views/report/answeredQuiz'));
const EmailSubscribe = React.lazy(() => import('../views/report/emailSubscribe'));
const LearningPlanReport = React.lazy(() => import('../views/report/learningPlanReport'));
const RedeemReward = React.lazy(() => import('../views/report/redeemReward'));
const RedeemCodeClaim = React.lazy(() => import('../views/report/redeemCodeClaim'));
const RegisterCourse = React.lazy(() => import('../views/report/registerCourse'));
const ShareArticle = React.lazy(() => import('../views/report/shareArticle'));
const SubmittedIdea = React.lazy(() => import('../views/report/submittedIdea'));
const Article = React.lazy(() => import('../views/admin/article'));
const ArticlePinned = React.lazy(() => import('../views/admin/article'));
const ArticleDetail = React.lazy(() => import('../views/admin/articleDetail'));
const Quiz = React.lazy(() => import('../views/admin/articleDetail'));
const QuizDetail = React.lazy(() => import('../views/admin/quizDetail'));
const QuizCreate = React.lazy(() => import('../views/admin/quizDetail'));
const Event = React.lazy(() => import('../views/admin/event'));
const EventDetail = React.lazy(() => import('../views/admin/eventDetail'));
const Reward = React.lazy(() => import('../views/admin/reward'));
const RewardDetail = React.lazy(() => import('../views/admin/rewardDetail'));
const Sources = React.lazy(() => import('../views/admin/sources'));
const SourcesDetail = React.lazy(() => import('../views/admin/sourcesDetail'));
const Calendar = React.lazy(() => import('../views/admin/calendar'));
const CalendarDetail = React.lazy(() => import('../views/admin/calendarDetail'));
const ImportActivity = React.lazy(() => import('../views/admin/importActivity'));
const ImportActivityDetail = React.lazy(() => import('../views/admin/importActivityDetail'));
const ImportUserInfo = React.lazy(() => import('../views/admin/importUserInfo'));
const ImportUserInfoDetail = React.lazy(() => import('../views/admin/importUserInfoDetail'));
const importLimitCourse = React.lazy(() => import('../views/admin/importLimitCourse'));
const importLimitCourseDetail = React.lazy(() => import('../views/admin/importLimitCourseDetail'));
const LinkSource = React.lazy(() => import('../views/admin/linkSource'));
const LinkSourceDetail = React.lazy(() => import('../views/admin/linkSourceDetail'));
const Badge = React.lazy(() => import('../views/admin/badge'));
const BadgeDetail = React.lazy(() => import('../views/admin/badgeDetail'));
const RedeemCode = React.lazy(() => import('../views/admin/redeemCode'));
const RedeemCodeDetail = React.lazy(() => import('../views/admin/redeemCodeDetail'));
const SubmittedArticle = React.lazy(() => import('../views/admin/submittedArticle'));
const SubmittedArticleDetail = React.lazy(() => import('../views/admin/submittedArticleDetail'));
const Course = React.lazy(() => import('../views/admin/course'));
const CourseDetail = React.lazy(() => import('../views/admin/courseDetail'));
const CourseDetailImport = React.lazy(() => import('../views/report/registerCourseImport'));
const RegPeriod = React.lazy(() => import('../views/admin/regPeriod'));
const RegPeriodDetail = React.lazy(() => import('../views/admin/regPeriodDetail'));
const SliderSFF = React.lazy(() => import('../views/admin/sliderSFF'));
const SliderSFFDetail = React.lazy(() => import('../views/admin/sliderSFFDetail'));
const PointHistory = React.lazy(() => import('../views/admin/pointHistory'));
const PointHistoryDetail = React.lazy(() => import('../views/admin/pointHistoryDetail'));
const TrainingAdminSubFunction = React.lazy(() => import('../views/admin/trainingSubFunction'));
const TrainingAdminSubFunctionDetail = React.lazy(() => import('../views/admin/trainingSubFunctionDetail'));
const TrainingAdminSubFunctionUsers = React.lazy(() => import('../views/admin/trainingSubFunctionUsers'));
const TrainingAdminSubFunctionUsersExcel = React.lazy(() => import('../views/admin/trainingSubTrainingUsersExcel'));
const TrainingAdmin = React.lazy(() => import('../views/admin/training'));
const TrainingAdminDetail = React.lazy(() => import('../views/admin/trainingDetail'));
const TrainingAdminExcel = React.lazy(() => import('../views/admin/trainingExcel'));
const TrainingScheduleAdmin = React.lazy(() => import('../views/admin/trainingSchedule'));
const TrainingScheduleDetailAdmin = React.lazy(() => import('../views/admin/trainingScheduleDetail'));
const TrainingScheduleUserAdmin = React.lazy(() => import('../views/admin/trainingScheduleUser'));
const TrainingUserExcel = React.lazy(() => import('../views/admin/trainingUserExcel'));
const TrainingReportTraining = React.lazy(() => import('../views/admin/trainingReport'));
const CustomPageSubCategory = React.lazy(() => import('../views/admin/customPage'));
const CustomPageSubCategoryDetail = React.lazy(() => import('../views/admin/customPageSubCategoryDetail'));
const CustomPageArticleSubCategory = React.lazy(() => import('../views/admin/customPage'));
const CustomPageSliderCategory = React.lazy(() => import('../views/admin/customPage'));
const CustomPageSliderCategoryDetail = React.lazy(() => import('../views/admin/customPageSliderCategoryDetail'));
const LearningStep = React.lazy(() => import('../views/admin/adminLearningPlan/learningStep'));
const LearningStepDetail = React.lazy(() => import('../views/admin/adminLearningPlan/learningStepDetail'));
const LearningSkills = React.lazy(() => import('../views/admin/adminLearningPlan/learningSkills'));
const LearningSkillsDetail = React.lazy(() => import('../views/admin/adminLearningPlan/learningSkillsDetail'));
const LearningMainFocus = React.lazy(() => import('../views/admin/adminLearningPlan/learningMainFocus'));
const LearningMainFocusDetail = React.lazy(() => import('../views/admin/adminLearningPlan/learningMainFocusDetail'));
const LearningKeyBehavior = React.lazy(() => import('../views/admin/adminLearningPlan/learningKeyBehavior'));
const LearningKeyBehaviorDetail = React.lazy(() => import('../views/admin/adminLearningPlan/learningKeyBehaviorDetail'))
const LearningModulePerSkillDetail = React.lazy(() => import('../views/admin/adminLearningPlan/LearningModulePerSkillDetail'))
const ShortcutLink = React.lazy(() => import('../views/admin/shortcutLink'));
const ShortcutLinkDetail = React.lazy(() => import('../views/admin/shortcutLinkDetail'));
const ContentType = React.lazy(() => import('../views/admin/contentType'));
const ContentTypeDetail = React.lazy(() => import('../views/admin/contentTypeDetail'));
const TopPicks = React.lazy(() => import('../views/admin/topPicks'));
const TopPicksDetail = React.lazy(() => import('../views/admin/topPicksDetail'));
const LearningSupport = React.lazy(() => import('../views/admin/learningSupport'));
const LearningSupportDetail = React.lazy(() => import('../views/admin/learningSupportDetail'));
const PushNotifAdmin = React.lazy(() => import('../views/admin/pushNotifAdmin'));
const PushNotifAdminDetail = React.lazy(() => import('../views/admin/pushNotifAdminDetail'));
const EventParticipantImport = React.lazy(() => import('../views/admin/eventParticipantImport'));
const EventParticipantImportDetail = React.lazy(() => import('../views/admin/eventParticipantImportDetail'));
const ClaimSFF = React.lazy(() => import('../views/report/claimSFF'));
const ApprovalRegisterCourse = React.lazy(() => import('../views/report/approvalRegisterCourse'));
const ImportClaimSFF = React.lazy(() => import('../views/report/importClaimSFF'));
const Ads = React.lazy(() => import('../views/admin/ads'));
const AdsDetail = React.lazy(() => import('../views/admin/adsDetail'));

//testing
const Video = React.lazy(() => import('../views/user/video'));

const routesUser = {
    home:{path: '/', name: 'Home', component: Home, exact: true, pageName:"Home",adminLevel:0},
    movement:{path: '/movement', name: 'Movement', component: Movement, exact: true, pageName:"Movement",adminLevel:0},
    viewcourse:{path: '/viewcourse', name: 'Viewcourse', component: Viewcourse, exact: true, pageName:"Viewcourse",adminLevel:0},
    viewcourseDetail:{path: '/viewcourse_detail', name: 'Viewcourse detail', component: ViewcourseDetail, exact: true, pageName:"Viewcourse_detail",adminLevel:0},
    profile:{path: '/profile', name: 'Profile', component: Profile, exact: true, pageName:"Profile",adminLevel:0},
    profileDetail:{path: '/profile_teams', name: 'Profile_Teams', component: ProfileTeams, exact: true, pageName:"Profile_Teams",adminLevel:0},
    training:{path: '/training', name: 'My Training', component: Training, exact: true, pageName:"Training",adminLevel:0},
    campus:{path: '/campus', name: 'Campus', component: Home, exact: true, pageName:"Campus",adminLevel:0},
    search:{path: '/search', name: 'Search', component: SearchArticle, exact: true, pageName:"Search", adminLevel:0},
    learningPage:{path: '/learning_plan', name: 'Learning', component: LearningPage, exact: true, pageName:"Learning", adminLevel:0},

    //testing
    video:{path: '/video', name: 'Video', component: Video, exact: true, pageName:"Video", adminLevel:0}
}

const routeViewAll = {
    section:{path: '/viewall/section', name: 'Section', component: ViewAll, exact: true, pageName:"Section",adminLevel:0},
    page:{path: '/viewall/page', name: 'Page', component: ViewAll, exact: true, pageName:"Page",adminLevel:0},
    cate:{path: '/viewall/cate', name: 'Cate', component: ViewAll, exact: true, pageName:"Cate",adminLevel:0},
    article:{path: '/viewall/article', name: 'Article', component: ViewAll, exact: true, pageName:"Article",adminLevel:0},
    specialPage:{path: '/viewall/special_page', name: 'Special_page', component: ViewAll, exact: true, pageName:"Special_page",adminLevel:0},
    menuSpecial:{path: '/viewall/menu_special', name: 'Menu_Special', component: ViewAll, exact: true, pageName:"Menu_Special",adminLevel:0},
    customPage:{path: '/viewall/custom_page', name: 'custom_page', component: ViewAll, exact: true, pageName:"custom_page",adminLevel:0},
}

const routeTrainingTeam = {
    trainingTeams:{parentPath: '/training_team', path: '/training_team/:id', name: 'Training Team', component: TrainingTeam, exact: false, pageName:"Training_Team",adminLevel:0},
}

const routesAdmin = {
    platform:{path: '/admin/platform', name: 'Platform', exact: true, component:Platform, pageName:"Platform Administration",adminLevel:4},
    platformDetail:{path: '/admin/platform_detail', name: 'Platform Detail', exact: true, component:PlatformDetail, pageName:"Platform Detail Administration",adminLevel:4},
    theme:{path: '/admin/theme', name: 'Theme', exact: true, component:Theme, pageName:"Theme Administration",adminLevel:3},
    themeDetail:{path: '/admin/theme_detail', name: 'Theme Detail', exact: true, component:ThemeDetail, pageName:"Theme Detail Administration",adminLevel:3},
    users:{path: '/admin/users', name: 'Users', component: Users, exact: true, pageName:"Users Administration",adminLevel:3},
    usersDetail:{path: '/admin/users_detail', name: 'Users Detail', exact: true, component:UsersDetail, pageName:"Users Detail Administration",adminLevel:3},
    pointDetail:{path: '/admin/point_detail', name: 'Point Detail', exact: true, component:PointDetail, pageName:"User Points Administration",adminLevel:3},
    webConfig:{path: '/admin/web_config', name: 'Configuration', component: WebConfig, exact: true, pageName:"Configuration Administration",adminLevel:3},
    webConfigDetail:{path: '/admin/web_config_detail', name: 'Configuration Detail', component: WebConfigDetail, exact: true, pageName:"Configuration Administration",adminLevel:3},
    userLevel:{path: '/admin/user_level', name: 'Level', component: UserLevel, exact: true, pageName:"Level Administration",adminLevel:3},
    userLevelDetail:{path: '/admin/user_level_detail', name: 'Level Detail', component: UserLevelDetail, exact: true, pageName:"Level Administration",adminLevel:3},
    pages:{path: '/admin/pages', name: 'Pages', component: Pages, exact: true, pageName:"Pages Administration",adminLevel:3},
    pagesDetail:{path: '/admin/pages_detail', name: 'Pages Detail', component: PagesDetail, exact: true, pageName:"Pages Administration",adminLevel:3},
    faq:{path: '/admin/faq', name: 'FAQ', component: Faq, exact: true, pageName:"FAQ Administration",adminLevel:3},
    faqDetail:{path: '/admin/faq_detail', name: 'FAQ Detail', component: FaqDetail, exact: true, pageName:"FAQ Administration",adminLevel:3},
    terms:{path: '/admin/terms', name: 'Terms', component: Terms, exact: true, pageName:"Terms & Conditions Administration",adminLevel:3},
    termsDetail:{path: '/admin/terms_detail', name: 'Terms Detail', component: TermsDetail, exact: true, pageName:"Terms & Conditions Administration",adminLevel:3},
    slider:{path: '/admin/slider', name: 'Slider', exact: true, component:Slider, pageName:"Slider Administration",adminLevel:3},
    sliderDetail:{path: '/admin/slider_detail', name: 'Slider Detail', exact: true, component:SliderDetail, pageName:"Slider Detail Administration",adminLevel:3},
    section:{path: '/admin/section', name: 'Section', component: Section, exact: true, pageName:"Section (Lvl 1) Administration",adminLevel:3},
    sectionDetail:{path: '/admin/section_detail', name: 'Section Detail', component: SectionDetail, exact: true, pageName:"Section (Lvl ) Administration",adminLevel:3}, 
    menu:{path: '/admin/menu', name: 'Menu', component: Menu, exact: true, pageName:"Menu (Lvl 2) Administration",adminLevel:3},
    menuDetail:{path: '/admin/menu_detail', name: 'Menu Detail', component: MenuDetail, exact: true, pageName:"Menu (Lvl 2) Administration",adminLevel:3}, 
    category:{path: '/admin/category', name: 'Category', component: Category, exact: true, pageName:"Category (Lvl 3) Administration",adminLevel:3},
    categoryDetail:{path: '/admin/category_detail', name: 'Category Detail', component: CategoryDetail, exact: true, pageName:"Category (Lvl 3) Administration",adminLevel:3},
    subCategory:{path: '/admin/sub_category', name: 'Sub Category', component: SubCategory, exact: true, pageName:"Sub Category (Lvl 4) Administration",adminLevel:3},
    subCategoryDetail:{path: '/admin/sub_category_detail', name: 'Sub Category Detail', component: SubCategoryDetail, exact: true, pageName:"Sub Category (Lvl 4) Administration",adminLevel:3},
    articleSubCategory:{path: '/admin/article_sub_category', name: 'Article Sub Category', component: ArticleSubCategory, exact: true, pageName:"Article under Sub Category (Lvl 4) Administration",adminLevel:3},
    sliderCategory:{path: '/admin/slider_category', name: 'Slider Category', component: SliderCategory, exact: true, pageName:"Slider for Special Page Administration",adminLevel:3},
    sliderCategoryDetail:{path: '/admin/slider_category_detail', name: 'Slider Category Detail', component: SliderCategoryDetail, exact: true, pageName:"Slider for Special Page Administration",adminLevel:3},
    articleOfMonthSpecial:{path: '/admin/article_of_the_month_spc', name: 'Article Of the Month for Special Page', component: ArticleOfMonthSpecial, exact: true, pageName:"Article of the Month for Special Page Administration",adminLevel:3},
    workshopSharing:{path: '/admin/workshop_sharing', name: 'Workshop Sharing', component: WorkshopSharing, exact: true, pageName:"Info, Workshop, Sharing Session Administration",adminLevel:3},
    workshopSharingWorkshop:{path: '/admin/workshop_sharing_workshop', name: 'Workshop Sharing Workshop', component: WorkshopSharingWorkshop, exact: true, pageName:"Info, Workshop, Sharing Session Administration",adminLevel:3},
    workshopSharingSession:{path: '/admin/workshop_sharing_session', name: 'Workshop Sharing Session', component: WorkshopSharingSession, exact: true, pageName:"Info, Workshop, Sharing Session Administration",adminLevel:3},
    workshopSharingInfoMenu:{path: '/admin/workshop_sharing_menu', name: 'Workshop Sharing Info Menu', component: WorkshopSharingInfoMenu, exact: true, pageName:"Info, Workshop, Sharing Session Administration",adminLevel:3},
    workshopSharingWorkshopUser:{path: '/admin/workshop_sharing_workshop_user', name: 'Workshop Sharing Workshop User', component: WorkshopSharingWorkshopUser, exact: true, pageName:"Info, Workshop, Sharing Session Administration",adminLevel:3},
    workshopSharingWorkshopCreate:{path: '/admin/workshop_sharing_workshop_create', name: 'Workshop Sharing Workshop Create', component: WorkshopSharingWorkshopCreate, exact: true, pageName:"Info, Workshop, Sharing Session Administration",adminLevel:3},
    workshopSharingWorkshopEdit:{path: '/admin/workshop_sharing_workshop_edit', name: 'Workshop Sharing Workshop Edit', component: WorkshopSharingWorkshopEdit, exact: true, pageName:"Info, Workshop, Sharing Session Administration",adminLevel:3},
    activityLog:{path: '/admin/activity_log', name: 'Activity Log', exact: true, component:ActivityLog, pageName:"Activity Log Report",adminLevel:3},
    answeredQuiz:{path: '/admin/answered_quiz', name: 'Answered Quiz', exact: true, component:AnsweredQuiz, pageName:"Answered Quiz Report",adminLevel:3},
    emailSubscribe:{path: '/admin/email_subscribe', name: 'Submitted Idea', exact: true, component:EmailSubscribe, pageName:"Email Subscribe Report",adminLevel:3},
    learningPlanReport:{path: '/admin/learning_plan_report', name: 'Learning Plan Report', exact: true, component:LearningPlanReport, pageName:"Learning Plan Report",adminLevel:3},
    redeemCodeClaim:{path: '/admin/redeem_code_claim', name: 'Redeem Code Claim', exact: true, component:RedeemCodeClaim, pageName:"Redeem Code Claim Report ",adminLevel:3},
    redeemReward:{path: '/admin/redeem_reward', name: 'Reward Redemption', exact: true, component:RedeemReward, pageName:"Reward Redemption Report",adminLevel:3},
    registerCourse:{path: '/admin/register_course', name: 'Register Course', exact: true, component:RegisterCourse, pageName:"Register Course Report",adminLevel:3},
    shareArticle:{path: '/admin/share_article', name: 'Share Article', exact: true, component:ShareArticle, pageName:"Share Article Report",adminLevel:3},
    submittedIdea:{path: '/admin/submitted_idea', name: 'Submitted Idea', exact: true, component:SubmittedIdea, pageName:"Submitted Idea Report",adminLevel:3},
    customPageSubCategory:{path: '/admin/custom_page', name: 'Custom Page', component: CustomPageSubCategory, exact: true, pageName:"Custom Page Administration",adminLevel:3},
    customPageSubCategoryDetail:{path: '/admin/custom_page_sub_category_detail', name: 'Custom Page Sub Category Detail', component: CustomPageSubCategoryDetail, exact: true, pageName:"Custom Page Sub Category (Lvl 4) Administration",adminLevel:3},
    customPageArticleSubCategory:{path: '/admin/custom_page_article_sub_category', name: 'Custom Page Article Sub Category', component: CustomPageArticleSubCategory, exact: true, pageName:"Custom Page Article under Sub Category (Lvl 4) Administration",adminLevel:3},
    customPageSliderCategory:{path: '/admin/custom_page_slider_category', name: 'Slider Custom Page', component: CustomPageSliderCategory, exact: true, pageName:"Slider for Custom Page Administration",adminLevel:3},
    customPageSliderCategoryDetail:{path: '/admin/custom_page_slider_category_detail', name: 'Slider Custom Page Detail', component: CustomPageSliderCategoryDetail, exact: true, pageName:"Slider for Custom Page Administration",adminLevel:3},


    article:{path: '/admin/article', name: 'Article', component: Article, exact: true, pageName:"Article Administration",adminLevel:3},
    articlePinned:{path: '/admin/article_pinned', name: 'Pinned Article', component: ArticlePinned, exact: true, pageName:"Article Administration",adminLevel:3},
    articleDetail:{path: '/admin/article_detail', name: 'Article Detail', component: ArticleDetail, exact: true, pageName:"Article Administration",adminLevel:3},
    quiz:{path: '/admin/quiz', name: 'Quiz', component: Quiz, exact: true, pageName:"Quiz Administration",adminLevel:3},
    quizDetail:{path: '/admin/quiz_detail', name: 'Quiz Detail', component: QuizDetail, exact: true, pageName:"Quiz Administration",adminLevel:3},
    quizCreate:{path: '/admin/quiz_create', name: 'Quiz Create', component: QuizCreate, exact: true, pageName:"Quiz Administration",adminLevel:3},
    event:{path: '/admin/event', name: 'Event', component: Event, exact: true, pageName:"Event Administration",adminLevel:3},
    eventDetail:{path: '/admin/event_detail', name: 'Event Detail', component: EventDetail, exact: true, pageName:"Event Administration",adminLevel:3},
    reward:{path: '/admin/reward', name: 'Reward', component: Reward, exact: true, pageName:"Reward Administration",adminLevel:3},
    rewardDetail:{path: '/admin/reward_detail', name: 'Reward Detail', component: RewardDetail, exact: true, pageName:"Reward Administration",adminLevel:3},
    sources:{path: '/admin/sources', name: 'Sources', component: Sources, exact: true, pageName:"Our Other Sources Administration",adminLevel:3},
    sourcesDetail:{path: '/admin/sources_detail', name: 'Sources Detail', component: SourcesDetail, exact: true, pageName:"Our Other Sources Administration",adminLevel:3},
    calendar:{path: '/admin/calendar', name: 'Calendar', component: Calendar, exact: true, pageName:"Holiday Administration",adminLevel:3},
    calendarDetail:{path: '/admin/calendar_detail', name: 'Calendar Detail', component: CalendarDetail, exact: true, pageName:"Holiday Administration",adminLevel:3},
    importActivity:{path: '/admin/import', name: 'Import', component: ImportActivity, exact: true, pageName:"Import Activity Administration",adminLevel:3},
    importActivityDetail:{path: '/admin/import_create', name: 'Import Create', component: ImportActivityDetail, exact: true, pageName:"Import Activity Administration",adminLevel:3},
    importUserInfo:{path: '/admin/user_info', name: 'Import User Info', component: ImportUserInfo, exact: true, pageName:"Import User Group (Dashboard) Administration",adminLevel:3},
    importUserInfoDetail:{path: '/admin/user_info_create', name: 'Import User Info Create', component: ImportUserInfoDetail, exact: true, pageName:"Import User Group (Dashboard) Administration",adminLevel:3},
    importLimitCourse:{path: '/admin/limit_course', name: 'Import Course Limit', component: importLimitCourse, exact: true, pageName:"Import Course Limit Administration",adminLevel:3},
    importLimitCourseDetail:{path: '/admin/limit_course_create', name: 'Import Course Limit Create', component: importLimitCourseDetail, exact: true, pageName:"Import Course Limit Administration",adminLevel:3},
    
    linkSource:{path: '/admin/link_source', name: 'Link Source', component: LinkSource, exact: true, pageName:"Custom Link Administration",adminLevel:3},
    linkSourceDetail:{path: '/admin/link_source_detail', name: 'Link Source Detail', component: LinkSourceDetail, exact: true, pageName:"Custom Link Administration",adminLevel:3},
    badge:{path: '/admin/badge', name: 'Badge', component: Badge, exact: true, pageName:"Badge Administration",adminLevel:3},
    badgeDetail:{path: '/admin/badge_detail', name: 'Badge Detail', component: BadgeDetail, exact: true, pageName:"Badge Administration",adminLevel:3},
    redeemCode:{path: '/admin/redeem_code', name: 'Redeem Code', component: RedeemCode, exact: true, pageName:"Redeem Code Administration",adminLevel:3},
    redeemCodeDetail:{path: '/admin/redeem_code_detail', name: 'Redeem Code Detail', component: RedeemCodeDetail, exact: true, pageName:"Redeem Code Administration",adminLevel:3},
    submittedArticle:{path: '/admin/submitted_article', name: 'Submitted Article', component: SubmittedArticle, exact: true, pageName:"Submitted Article Administration",adminLevel:3},
    submittedArticleDetail:{path: '/admin/submitted_article_detail', name: 'Submitted Article Detail', component: SubmittedArticleDetail, exact: true, pageName:"Submitted Article Administration",adminLevel:3},
    course:{path: '/admin/course', name: 'Course', component: Course, exact: true, pageName:"Course Administration",adminLevel:3},
    courseDetail:{path: '/admin/course_detail', name: 'Course Detail', component: CourseDetail, exact: true, pageName:"Course Administration",adminLevel:3},
    CourseDetailImport:{path: '/admin/course_detail_import', name: 'Course Detail', component: CourseDetailImport, exact: true, pageName:"S2 Course Import",adminLevel:3},
    regPeriod:{path: '/admin/reg_period', name: 'Registration Period', component: RegPeriod, exact: true, pageName:"Registration Period Administration",adminLevel:3},
    regPeriodDetail:{path: '/admin/reg_period_detail', name: 'Registration Period Detail', component: RegPeriodDetail, exact: true, pageName:"Registration Period Administration",adminLevel:3},
    sliderSFF:{path: '/admin/slider_sff', name: 'Slider Skill For Future', component: SliderSFF, exact: true, pageName:"Slider Skill For Future Administration",adminLevel:3},
    sliderSFFDetail:{path: '/admin/slider_sff_detail', name: 'Slider Skill For Future Detail', component: SliderSFFDetail, exact: true, pageName:"Slider Skill For Future Administration",adminLevel:3},
    pointHistory:{path: '/admin/point_history', name: 'Point History', component: PointHistory, exact: true, pageName:"Import Point History Administration",adminLevel:3},
    pointHistoryDetail:{path: '/admin/point_history_detail', name: 'Point History Detail', component: PointHistoryDetail, exact: true, pageName:"Import Point History Administration",adminLevel:3},
    trainingAdminSubFunction:{path: '/admin/training-sub-function', name: 'Sub Function', component: TrainingAdminSubFunction, exact: true, pageName:"Sub Function Training Page Administration",adminLevel:2},
    trainingAdminSubFunctionDetail:{path: '/admin/training-sub-function-detail', name: 'Sub Function Detail ', component: TrainingAdminSubFunctionDetail, exact: true, pageName:"Sub Function Training Page Administration",adminLevel:2},
    trainingAdminSubFunctionUsers:{path: '/admin/training-sub-function-users', name: 'Sub Function Users ', component: TrainingAdminSubFunctionUsers, exact: true, pageName:"Users Sub Function Training Page",adminLevel:2},
    trainingAdminSubFunctionUsersExcel:{path: '/admin/training-sub-function-users-excel', name: 'Sub Function Users Excel ', component: TrainingAdminSubFunctionUsersExcel, exact: true, pageName:"Users Sub Function Training Page",adminLevel:2},
    trainingAdmin:{path: '/admin/training', name: 'Training', component: TrainingAdmin, exact: true, pageName:"Training Page Administration",adminLevel:2},
    trainingAdminDetail:{path: '/admin/training_detail', name: 'Training Detail', component: TrainingAdminDetail, exact: true, pageName:"Training Administration",adminLevel:2},
    trainingAdminExcel:{path: '/admin/training_import', name: 'Training Import', component: TrainingAdminExcel, exact: true, pageName:"New Data Training from Excel Administration",adminLevel:2},
    trainingScheduleAdmin:{path: '/admin/training_schedule', name: 'Training Schedule', component: TrainingScheduleAdmin, exact: true, pageName:"Training Schedule Administration",adminLevel:2},
    trainingScheduleDetailAdmin:{path: '/admin/training_schedule_detail', name: 'Training Schedule Detail', component: TrainingScheduleDetailAdmin, exact: true, pageName:"Training Schedule Administration",adminLevel:2},
    trainingScheduleUserAdmin:{path: '/admin/training_schedule_user', name: 'Training Schedule User', component: TrainingScheduleUserAdmin, exact: true, pageName:"List Employee in Training Schedule Administration",adminLevel:2},
    trainingUserExcel:{path: '/admin/training_user_excel', name: 'Training User Excel', component: TrainingUserExcel, exact: true, pageName:"New Data Employee from Excel Administration",adminLevel:2},
    trainingReportTraining:{path: '/admin/training_report_training', name: 'Training Report Training', component: TrainingReportTraining, exact: true, pageName:"Training Report Administration",adminLevel:1},
    topPicks:{path: '/admin/top_picks', name: 'Top Picks', component: TopPicks, exact: true, pageName:"Top Picks Administration",adminLevel:3},
    topPicksDetail:{path: '/admin/top_picks_detail', name: 'Top Picks Detail', component: TopPicksDetail, exact: true, pageName:"Top Picks Administration",adminLevel:3},
    contentType:{path: '/admin/content_type', name: 'Content Type', component: ContentType, exact: true, pageName:"Content Type Administration",adminLevel:3},
    contentTypeDetail:{path: '/admin/content_type_detail', name: 'Content Type Detail', component: ContentTypeDetail, exact: true, pageName:"Content Type Administration",adminLevel:3},
    shortcutLink:{path: '/admin/shortcut_link', name: 'Custom Shortcut', component: ShortcutLink, exact: true, pageName:"Custom Shortcut Administration",adminLevel:3},
    shortcutLinkDetail:{path: '/admin/shortcut_link_detail', name: 'Custom Shortcut Detail', component: ShortcutLinkDetail, exact: true, pageName:"Custom Shortcut Administration",adminLevel:3},
    learningSupport:{path: '/admin/learning_support', name: 'Learning Support', component: LearningSupport, exact: true, pageName:"Learning Support Administration",adminLevel:3},
    learningSupportDetail:{path: '/admin/learning_support_detail', name: 'Learning Support Detail', component: LearningSupportDetail, exact: true, pageName:"Learning Support Administration",adminLevel:3},    
    pushNotifAdmin:{path: '/admin/push_notif_admin', name: 'Push Notification Admin', component: PushNotifAdmin, exact: true, pageName:"Push Notification Administration",adminLevel:3},
    pushNotifAdminDetail:{path: '/admin/push_notif_admin_detail', name: 'Push Notification Admin Detail', component: PushNotifAdminDetail, exact: true, pageName:"Push Notification Administration",adminLevel:3},    
    eventParticipantImport:{path: '/admin/event_participant', name: 'Event Participant Import', component: EventParticipantImport, exact: true, pageName:"Event Participant Import",adminLevel:3},
    eventParticipantImportDetail:{path: '/admin/event_participant_detail', name: 'Event Participant Import Detail', component: EventParticipantImportDetail, exact: true, pageName:"Event Participant Import",adminLevel:3},    

    learningStep:{path: '/admin/learning_step', name: 'Learning Step Master', component: LearningStep, exact: true, pageName:"Learning Step Administration",adminLevel:3},
    learningStepDetail:{path: '/admin/learning_step_detail', name: 'Learning Step Master Detail', component: LearningStepDetail, exact: true, pageName:"Learning Step Detail Administration",adminLevel:3},
    learningMainFocus:{path: '/admin/learning_main_focus', name: 'Main Focus', component: LearningMainFocus, exact: true, pageName:"Learning Main Focus Administration",adminLevel:3},
    learningMainFocusDetail:{path: '/admin/learning_main_focus_detail', name: 'Learning Main Focus Detail', component: LearningMainFocusDetail, exact: true, pageName:"Learning Main Focus Detail Administration",adminLevel:3},
    learningKeyBehavior:{path: '/admin/learning_key_behavior', name: 'Key Behavior', component: LearningKeyBehavior, exact: true, pageName:"Learning Key Behavior Administration",adminLevel:3},
    learningKeyBehaviorDetail:{path: '/admin/learning_key_behavior_detail', name: 'Learning Key Behavior Detail', component: LearningKeyBehaviorDetail, exact: true, pageName:"Learning Key Behavior Detail Administration",adminLevel:3},
    learningSkills:{path: '/admin/learning_skills', name: 'Skills', component: LearningSkills, exact: true, pageName:"Learning Skills Administration",adminLevel:3},
    learningSkillsDetail:{path: '/admin/learning_skills_detail', name: 'Learning Skills Detail', component: LearningSkillsDetail, exact: true, pageName:"Learning Skills Detail Administration",adminLevel:3},
    learningModulePerSkillDetail:{path: '/admin/learning_module_detail', name: 'Learning Module Detail', component: LearningModulePerSkillDetail, exact: true, pageName:"Learning Module Detail Administration",adminLevel:3},

    claimSFF:{path: '/admin/claimSFF', name: 'Claim SFF', component: ClaimSFF, exact: true, pageName:"List Employee of Unclaimed SFF", adminLevel:3},
    approvalRegisterCourse:{path: '/admin/approval_reg_course', name: 'Approval Register Course', component: ApprovalRegisterCourse, exact: true, pageName:"List Employee of Approval Register Course", adminLevel:3},
    importClaimSFF:{path: '/admin/importClaimSFF', name: 'Import Claim SFF', component: ImportClaimSFF, exact: true, pageName:"Import Claim SFF", adminLevel:3},
    ads: {path: '/admin/ads', name: 'Ads', component: Ads, exact: true, pageName:"Ads Administration", adminLevel:3},
    adsDetail: {path: '/admin/ads_detail', name: 'Ads Detail', component: AdsDetail, exact: true, pageName:"Ads Administration", adminLevel:3},
}

const routesComponent = {
    notFound:{path: '/error/404', name: '404 Not Found', component: NotFound, exact: true, pageName:"404 Not Found",adminLevel:0},
    maintenanceMode:{path: '/error/503', name: '503 Maintenance Mode', component: NotFound, exact: true, pageName:"503 Maintenance Mode",adminLevel:0},
    accessDenied:{path: '/error/400', name: 'ACCESS DENIED', component: AccessDenied, exact: true, pageName:"ACCESS DENIED",adminLevel:0},
}

const routesReport = {

}


const routeAll = {
    routesUser,
    routesAdmin,
    routesComponent,
    routesReport,
    routeViewAll,
    routeTrainingTeam
}

export default routeAll;