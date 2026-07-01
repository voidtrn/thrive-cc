import React, { useEffect, useState, useRef, createRef } from 'react';
import routeAll from '../../../helpers/route.jsx';
import { env, securityData } from '../../../helpers/globalHelper.js';


import '../../../i18n.js'

import { useTranslation } from "react-i18next";



function AdminDateChallenge(props) {

  const [state, setState] = useState({
    anotherUserData: false,
    isMaintenanceMode: false,
    dataUserLearningPlan: [],
    dataUserLearningPlanCompleted: [],
    dataLearningSkillsMaster: [],
    ratingValue: [],
    userDocument: env.userDocument,
    assets: env.assets,
    category: [],
    categoryCompleted: [],
    selectedCategory: "",
    year: [],
    yearCompleted: [],
    selectedYear: "",
    loading: true,
    selectLanguage: 'en',
  });
  const changeLaguange = async (newLangSelect) => {
    setState({ ...state, selectLanguage: newLangSelect })
    handleChangeLanguage(newLangSelect);
  }

  const { t, i18n: { changeLanguage, language } } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const handleChangeLanguage = (newLangSelect) => {
    setCurrentLanguage(newLangSelect);
    changeLanguage(newLangSelect);
    //console.log("aaabbb : " + newLangSelect);
  }

  const toAnswerQuiz = () => {
    history.push(routeAll.routesUser.AdminDateChallenge.path);
  }

  return (
    <>
      <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
        <div className="card card-white" >

          <div className="card-header ">
            <div className="row d-flex ">
              <span className="text-blue">
                Admin Menu
              </span>
            </div>
          </div>
          <div className="card-body ">
            <div className="card card-white">
              
              <div className="card-body ">
                <a href={routeAll.routesAdmin.AdminGrowthQuarter.path} className="nav-link color-white-dark50" >Stage</a>
              </div>
              <div className="card-body ">
                <a href={routeAll.routesAdmin.AdminGrowthQuest.path} className="nav-link color-white-dark50" >Quest</a>
              </div>
              <div className="card-body ">
                <a href={routeAll.routesAdmin.AdminGrowthQuestion.path} className="nav-link color-white-dark50" >Question</a>
              </div>
              <div className="card-body ">
                <a href={routeAll.routesAdmin.AdminGrowthLeaderboardReport.path} className="nav-link color-white-dark50" >Leaderboard Report</a>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}

export default AdminDateChallenge;
