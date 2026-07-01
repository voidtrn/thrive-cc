// import Home from "../views/user/home";
import React from 'react';
// route user
const NotFound = React.lazy(() => import('../components/notFound'));
const AccessDenied = React.lazy(() => import('../components/accessDenied'));
const Home = React.lazy(() => import('../views/user/home'));

//testing
const HUTChallenge = React.lazy(() => import('../views/user/hut_challenge/home_hut_challenge'));
const AnswerQuiz = React.lazy(() => import('../views/user/hut_challenge/answer_quiz'));
const AnswerQuiz3 = React.lazy(() => import('../views/user/hut_challenge/answer_quiz3'));
const AnswerQuiz4 = React.lazy(() => import('../views/user/hut_challenge/answer_quiz4'));
const PointHistory = React.lazy(() => import('../views/user/hut_challenge/point_history'));
const PointHistoryDetail = React.lazy(() => import('../views/user/hut_challenge/point_history_detail'));

const AdminDateChallenge = React.lazy(() => import('../views/admin/hut_challenge/dateChallenge'));
const AdminDateChallengeDetail = React.lazy(() => import('../views/admin/hut_challenge/dateChallengeDetail'));

const AdminQuestionChallenge = React.lazy(() => import('../views/admin/hut_challenge/questionChallenge'));
const AdminQuestionChallengeDetail = React.lazy(() => import('../views/admin/hut_challenge/questionChallengeDetail'));


const AdminLocationFunction = React.lazy(() => import('../views/admin/hut_challenge/LocationFunction'));
const AdminLocationFunctionDetail = React.lazy(() => import('../views/admin/hut_challenge/LocationFunctionDetail'));
const AdminLocationFunctionImport = React.lazy(() => import('../views/admin/hut_challenge/LocationFunctionImport'));


const Growth = React.lazy(() => import('../views/user/growth/growth'));
const Quest = React.lazy(() => import('../views/user/growth/quest'));
const QuestAnswered = React.lazy(() => import('../views/user/growth/quest_answered'));
const GrowthPointHistory = React.lazy(() => import('../views/user/growth/point_history_detail'));
const GrowthLeaderBoard = React.lazy(() => import('../views/user/growth/leaderboard'));

const AdminGrowthQuarter = React.lazy(() => import('../views/admin/growth/AdminQuarter'));
const AdminGrowthQuarterDetail = React.lazy(() => import('../views/admin/growth/AdminQuarterDetail'));
const AdminGrowthQuest = React.lazy(() => import('../views/admin/growth/AdminQuest'));
const AdminGrowthQuestDetail = React.lazy(() => import('../views/admin/growth/AdminQuestDetail'));
const AdminGrowthQuestion = React.lazy(() => import('../views/admin/growth/AdminQuestion'));
const AdminGrowthQuestionDetail = React.lazy(() => import('../views/admin/growth/AdminQuestionDetail'));
const AdminGrowthQuestionDetail2 = React.lazy(() => import('../views/admin/growth/AdminQuestionDetail2'));
const AdminGrowthQuestionDetail3 = React.lazy(() => import('../views/admin/growth/AdminQuestionDetail3'));
const AdminGrowthLeaderboardReport = React.lazy(() => import('../views/admin/growth/AdminGrowthLeaderboardReport'));

const routesUser = {

    home:{path: '/', name: 'Home', component: Home, exact: true, pageName:"Home",adminLevel:0},
    HUTChallenge:{path: '/hut-challenge', name: 'HUTChallenge', component: HUTChallenge, exact: true, pageName:"HUTChallenge", adminLevel:0},
    AnswerQuiz:{path: '/answer-quiz', name: 'AnswerQuiz', component: AnswerQuiz, exact: true, pageName:"Answer Quiz", adminLevel:0},
    AnswerQuiz3:{path: '/answer-quiz3', name: 'AnswerQuiz3', component: AnswerQuiz3, exact: true, pageName:"Answer Quiz", adminLevel:0},
    AnswerQuiz4:{path: '/answer-quiz4', name: 'AnswerQuiz4', component: AnswerQuiz4, exact: true, pageName:"Answer Quiz", adminLevel:0},
    PointHistory:{path: '/point-history', name: 'PointHistory', component: PointHistory, exact: true, pageName:"Poin History", adminLevel:0},
    PointHistoryDetail:{path: '/point-history-detail', name: 'PointHistoryDetail', component: PointHistoryDetail, exact: true, pageName:"Poin History Detail", adminLevel:0},

    Growth:{path: '/growth', name: 'growth', component: Growth, exact: true, pageName:"Growth", adminLevel:0},
    Quest:{path: '/quest', name: 'quest', component: Quest, exact: true, pageName:"Answer Quest", adminLevel:0},
    QuestAnswered:{path: '/quest-answered', name: 'quest', component: QuestAnswered, exact: true, pageName:"Answered Quest", adminLevel:0},

    GrowthLeaderBoard:{path: '/leaderboard', name: 'quest', component: GrowthLeaderBoard, exact: true, pageName:"GrowthLeaderBoard", adminLevel:0},
    GrowthPointHistory:{path: '/growth-point-history', name: 'GrowthPointHistory', component: GrowthPointHistory, exact: true, pageName:"GrowthPointHistory", adminLevel:0},
   
}
const routesAdmin = {
    AdminDateChallenge:{path: '/admin/challenge-date', name: 'AdminDateChallenge', component: AdminDateChallenge, exact: true, pageName:"AdminDateChallenge",adminLevel:3},
    AdminDateChallengeDetail:{path: '/admin/challenge-date-detail', name: 'Date Challenge Detail', component: AdminDateChallengeDetail, exact: true, pageName:"AdminDateChallengeDetail",adminLevel:3},
    AdminQuestionChallenge:{path: '/admin/question', name: 'AdminQuestionChallenge', component: AdminQuestionChallenge, exact: true, pageName:"AdminQuestionChallenge",adminLevel:3},
    AdminQuestionChallengeDetail:{path: '/admin/question-detail', name: 'Date Challenge Detail', component: AdminQuestionChallengeDetail, exact: true, pageName:"AdminQuestionChallengeDetail",adminLevel:3},
    AdminLocationFunction:{path: '/admin/location-function', name: 'AdminLocationFunction', component: AdminLocationFunction, exact: true, pageName:"AdminLocationFunction",adminLevel:3},
    
    AdminLocationFunctionDetail:{path: '/admin/location-function-detail', name: 'AdminLocationFunctionDetail', component: AdminLocationFunctionDetail, exact: true, pageName:"AdminLocationFunctionDetail",adminLevel:3},
    AdminLocationFunctionImport:{path: '/admin/location-function-import', name: 'AdminLocationFunctionImport', component: AdminLocationFunctionImport, exact: true, pageName:"AdminLocationFunctionImport",adminLevel:3},
    


    AdminGrowthQuarter:{path: '/admin/growth-quarter', name: 'AdminGrowthQuarter', component: AdminGrowthQuarter, exact: true, pageName:"AdminGrowthQuarter",adminLevel:3},
    AdminGrowthQuarterDetail:{path: '/admin/growth-quarter-detail', name: 'QuarterDetail', component: AdminGrowthQuarterDetail, exact: true, pageName:"AdminGrowthQuarterDetail",adminLevel:3},
    
    AdminGrowthQuest:{path: '/admin/growth-quest', name: 'AdminGrowthQuest', component: AdminGrowthQuest, exact: true, pageName:"AdminGrowthQuest",adminLevel:3},
    AdminGrowthQuestDetail:{path: '/admin/growth-quest-detail', name: 'QuestDetail', component: AdminGrowthQuestDetail, exact: true, pageName:"AdminGrowthQuestDetail",adminLevel:3},

    
    AdminGrowthQuestion:{path: '/admin/growth-question', name: 'AdminGrowthQuestion', component: AdminGrowthQuestion, exact: true, pageName:"AdminGrowthQuestion",adminLevel:3},
    AdminGrowthQuestionDetail:{path: '/admin/growth-question-detail', name: 'AdminGrowthQuestionDetail', component: AdminGrowthQuestionDetail, exact: true, pageName:"AdminGrowthQuestionDetail",adminLevel:3},
    AdminGrowthQuestionDetail2:{path: '/admin/growth-question-detail2', name: 'AdminGrowthQuestionDetail2', component: AdminGrowthQuestionDetail2, exact: true, pageName:"AdminGrowthQuestionDetail2",adminLevel:3},
    AdminGrowthQuestionDetail3:{path: '/admin/growth-question-detail3', name: 'AdminGrowthQuestionDetail3', component: AdminGrowthQuestionDetail3, exact: true, pageName:"AdminGrowthQuestionDetail3",adminLevel:3},
    AdminGrowthLeaderboardReport:{path: '/admin/leaderboard-report', name: 'AdminGrowthLeaderboardReport', component: AdminGrowthLeaderboardReport, exact: true, pageName:"AdminGrowthLeaderboardReport",adminLevel:3},
  
}



const routeAll = {
    routesUser,
    routesAdmin,
}

export default routeAll;