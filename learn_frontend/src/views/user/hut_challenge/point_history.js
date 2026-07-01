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
    loading: true,
    selectLanguage: 'en',
  });
  const user_id = securityData.Security_UserId()
  const changeLaguange = async (newLangSelect) => {
    setState({ ...state, selectLanguage: newLangSelect })
    handleChangeLanguage(newLangSelect);
  }

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
      limit: 3,
      offset: 0,
      category: "",
      orderby: "awb_hut_point_history.id desc",
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbHutUser/ListPointHistoryByuser', credentials);

    if (isi.status === 200) {

      setItemsPointHistory(isi.data.data);

      setState(state => ({ ...state, loading: false }))
      setState(state => ({ ...state, totalPoint: isi.data.total_point }))
      props.loading(false)
    }
  };

  const getListLeaderboard = async () => {

    //setLoading(true)
    const credentials = {
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbHutUser/LeaderboardByZone', credentials);

    if (isi.status === 200) {

      setItemsLeaderboard(isi.data.data);
      setState(state => ({ ...state, loading: false }))
      props.loading(false)
    }
  };


  useEffect(() => {
    getListPointHistory()
    getListLeaderboard()
  }, [])

  return (
    <>
      <NavMenu adminLevel={props.adminLevel} {...props} />


      <header className="masthead">
        <div className="overlay">
          <div className=" container ">
            <div className="row d-flex ">
              <div className="col-md-12  d-flex justify-content-center title-nav-page-text" style={{ paddingTop: "75px", paddingBottom: "75px" }} >
                {t('textMenu1Day1Minutes')}
              </div>
            </div>
          </div>
        </div>
      </header>


      <section className="page-section"></section>

      <div className="container " style={{ marginTop: "-30px" }} id="access-idp">
        <div className="row d-flex ">
          <div className="col-lg-12">
            <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
              <div className="card card-white" style={{ padding: "10px" }}>
                <div className="card-body ">
                  <div className="row d-flex  justify-content-center">

                    <div className="col-lg-1 ">
                      <img src={env.assets + "landingpage/assets/images/hut/star-blue-big.svg"} />
                    </div>
                    <div className="col-lg-7">

                      <div className="row d-flex ">
                        <div className="col-lg-12">
                          <p className="title-text-black">{t('textScoreBalance')} </p>
                        </div>
                      </div>
                      <div className="row d-flex ">
                        <div className="col-lg-12">
                          <p className="title-text-blue">{state.totalPoint} {t('textPoint')} </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 text-end d-flex flex-column justify-content-center">
                      <div className="container ">
                        <div className="row align-items-center">
                          <div className="col-12 mx-auto">
                            <div className=" justify-content-center">
                              <div>
                                <a className="frame1-menit1-hari-landing-page-button-primary-button" href={routeAll.routesUser.HUTChallenge.path}>
                                  <span className="frame1-menit1-hari-landing-page-text005">
                                    <span>{t('textMoreChallenge')}</span>
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
                      <div className="container ">
                        <div className="row d-flex  justify-content-center">
                          <div className="col-lg-6">
                            <b className="text-black">
                              {

                                t('textPointHistory') === 'Point History' ? 
                                  item.title_challenge_eng
                                :
                                  item.title_challenge
                              }
                            </b>
                          </div>
                          <div className="col-lg-4   justify-content-center">
                            {
                              item.challenge_type === 0 ? 
                              t('textDailyChallenge')
                              :
                                item.challenge_type === 1 ? 
                                t('textAdditionalChallenge')
                                :
                                  item.challenge_type === 2 ? 
                                  t('textWeeklyChallenge')
                                  :
                                    item.challenge_type === 4 ? 
                                    t('textAdditionalChallenge')
                                    :
                                      t('textDailyChallenge')
                            }
                          </div>
                          <div className="col-lg-2 text-end">
                            <span className="text-blue  text-end">{item.total_point_per_day > 0 ? '+' : ''}{item.total_point_per_day} {t('textPoint')} </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            );

          })
        }



        <div className="row d-flex mb-5">
          <div className="col-lg-12">
            <a href={routeAll.routesUser.PointHistoryDetail.path}>
              <p className="text-blue">{t('textLihatSelengkapnya')}</p>
            </a>

          </div>
        </div>



        {
          itemsLeaderboard.map((item) => {

            return (

              <div className="row d-flex mb-4">
                <div className="col-lg-12">
                  <div className="card card-white">
                    <div className="card-header bg-gradient-blue">
                      <div className="row d-flex  justify-content-center ">
                        <div className="col-lg-2 align-middle text-center parent">

                          <div className="child">

                            <img src={env.assets + "landingpage/assets/images/hut/leaderboard.svg"} className="align-middle" />
                          </div>


                        </div>
                        <div className="col-lg-10">

                          <span className="filled-history-date mb-4">
                            <span className="filled-history-text040">
                              <span>{t('textLeaderboard')}</span>
                            </span>
                          </span>
                          <p className="title-text-white mt-3">TOP 11 {item.zone}</p>
                          <p className="color-white">
                           {t('textSampaiBertemu')}
                            
                          </p>

                        </div>
                      </div>
                    </div>
                    <div className="card-body ">
                      <div className="row d-flex  justify-content-center">
                        {
                          item.locations.map(
                            (location) =>
                              <div className="col-lg-6 mb-4">

                                <span className="filled-history-date mb-4 p-2">
                                  <span className="filled-history-text040 m-4">
                                    {location.location}
                                  </span>
                                </span>


                                {
                                  location.users.map(
                                    (user22, key) =>
                                      <div className="row d-flex flex-column justify-content-center mt-2">
                                        <div className="col-lg-12">
                                          <div className="card card-white">
                                            <div className="card-body ">
                                              <div className="row d-flex  justify-content-center">
                                                <div className="col-lg-2 ">
                                                  <span className="title-text-white-dark">No. {key + 1} </span>
                                                </div>
                                                <div className="col-lg-7">
                                                  <span className="text-black">{user22.name}</span>
                                                </div>
                                                <div className="col-lg-3 text-end">
                                                  <span className="text-blue  text-end">{user22.last_point} Point </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                  )
                                }



                              </div>

                          )
                        }

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
  );
}

export default PointHistory;
