import React, { useEffect, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import routeAll from '../../../helpers/route';
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import defaultLang from '../../../helpers/lang';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../../../views/user/shared/navMenu';


import '../../../i18n.js'

import { useTranslation } from "react-i18next";



function PointHistory(props) {

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
    totalPoint: 0,
    percentagePoint: 0,
    loading: true,
    selectLanguage: 'en',
  });
  const user_id = securityData.Security_UserId()
  const changeLaguange = async (newLangSelect) => {
    setState({ ...state, selectLanguage: newLangSelect })
    handleChangeLanguage(newLangSelect);
  }

  const [loading, setLoading] = useState(true)
  const [itemsPointHistory, setItemsPointHistory] = useState([])
  const [itemsLeaderboard, setItemsLeaderboard] = useState([])
  const { t, i18n: { changeLanguage, language } } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const handleChangeLanguage = (newLangSelect) => {
    setCurrentLanguage(newLangSelect);
    changeLanguage(newLangSelect);
    //console.log("aaabbb : " + newLangSelect);
  }


  const getListPointHistory = async () => {
    //setLoading(true)
    const credentials = {
      limit: 1000,
      offset: 0,
      category: "",
      orderby: "awb_growth_quest_user.id desc",
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbGrowth/ListPointHistoryByuser', credentials);

    if (isi.status === 200) {

      setItemsPointHistory(isi.data.data);

      setState(state => ({ ...state, loading: false }))
      setState(state => ({ ...state, totalPoint: isi.data.totalPoint, percentagePoint: isi.data.percentagePoint }))
      setLoading(false)
    }
  };

  const getListLeaderboard = async () => {

    //setLoading(true)
    const credentials = {
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbGrowth/LeaderboardList', credentials);

    if (isi.status === 200) {

      setItemsLeaderboard(isi.data.data);
    }
  };


  useEffect(() => {
    getListPointHistory()
    getListLeaderboard()
  }, [])

  return (
    <>
      <NavMenu adminLevel={props.adminLevel} {...props} />


      <header className="growth-masthead">
        <div className=" container ">
          <div className="row d-flex ">
            <div className="col-md-12  d-flex justify-content-center">
              <img src={env.assets + "growth/images/Logo Growth Quest_white.png"} style={{ maxHeight: "150px", marginTop: "25px" }} />
            </div>
          </div>
        </div>
      </header>
      {
        loading ?
          <div className="col-lg-12 text-center">
            <img src={`${env.assets}img/loading.gif`} style={{ width: "50px", marginBottom: '40px' }} />
          </div>
          :
          <>
            <section className="page-section"></section>

            <div className="container" style={{ marginTop: "-150px" }} id="access-idp">
              <div className="row d-flex ">
                <div className="col-lg-12">
                  <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
                    <div className="card card-white" style={{ padding: "10px" }}>
                      <div className="card-body ">
                        <div className="row d-flex  justify-content-center">

                          <div className="col-lg-2 justify-content-center">
                            <img src={env.assets + "growth/images/icon/daun-blue-big.png"} style={{ paddingTop: "10px" }} />
                          </div>
                          <div className="col-lg-7">

                            <div className="row d-flex ">
                              <div className="col-lg-12">
                                <p className="title-text-black">{t('textScoreBalance')} </p>
                              </div>
                            </div>
                            <div className="row d-flex ">
                              <div className="col-lg-12">
                                <p className="title-text-blue-growth">{state.totalPoint} {t('textPoint')} </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 text-end d-flex flex-column justify-content-center">
                            <div className="container ">
                              <div className="row align-items-center">
                                <div className="col-12 mx-auto">
                                  <div className=" justify-content-center">
                                    <div>
                                      <a className="submit-growth" href={routeAll.routesUser.Growth.path+"?scrollTo=quest-list"}>
                                        <span className="frame1-menit1-hari-landing-page-text005">
                                          <span>{t('textMoreQuest')}</span>
                                        </span>
                                        <img src={env.assets + "landingpage/assets/images/hut/arrow-right-white.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>


              <div className="row d-flex ">
                <div className="col-lg-12">
                  <p className="title-text-black">{t('textPointHistory')}</p>
                </div>
              </div>

              {
                itemsPointHistory.map((item) => {

                  return (
                    <div className="row d-flex flex-column justify-content-center mb-2">
                      <div className="col-lg-12">
                        <div className="card card-white">
                          <div className="card-body ">
                            <div className="row d-flex  justify-content-center">
                              <div className="col-lg-4 ">
                                <b className="title-text-white-dark">

                                  {
                                    t('textPointHistory') === 'Point History' ?
                                      item.quarterName
                                      :
                                      item.quarterName
                                  }
                                </b>
                                <p className="title-text-white-dark">

                                  {item.questTitle}

                                </p>
                                <p className="title-text-white-dark">
                                </p>
                              </div>
                              <div className="col-lg-6">

                                {
                                  item.detail.map(
                                    (detailList) =>
                                      <div className="row d-flex  justify-content-center">
                                        <div className="col-lg-11">
                                          <span className="text-black">
                                            {

                                              detailList.point_title == 'Wrong Answer' ?
                                                t('textWrongAnswer')
                                                :
                                                detailList.point_title == 'Correct Answer' ?
                                                  t('textCorrectAnswer')
                                                  :
                                                  detailList.point_title == 'Answer questions on the same day as the Challenge' ?
                                                    t('textDikerjakanhariYangSama')
                                                    :
                                                    detailList.point_title == 'Read daily learning material' ?
                                                      t('textCompleteReadingLearning')
                                                      :
                                                      detailList.point_title

                                            }

                                          </span>
                                        </div>
                                        <div className="col-lg-1   justify-content-center">
                                          <b>{detailList.point}</b>
                                        </div>
                                      </div>
                                  )

                                }
                              </div>
                              <div className="col-lg-2 text-end">
                                <span className="text-blue-growth  text-end">+{item.score} {t('textPoint')} </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  );

                })
              }

            </div>

          </>
      }
    </>
  );
}

export default PointHistory;
