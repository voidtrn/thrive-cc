import React, { useCallback, useEffect, useState, useRef, createRef, Component } from 'react';
import { useLocation } from 'react-router-dom';
import routeAll from '../../../helpers/route.js';
import { env, securityData } from '../../../helpers/globalHelper.js';
import axiosLibrary from '../../../helpers/axiosLibrary.js';
import defaultLang from '../../../helpers/lang.js';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../shared/navMenu.js';
import moment from 'moment';
import { cssTarget, LoadingData2 } from '../../../components/Loading.js';
import Slider from "react-slick";
import ProgressBar from 'react-bootstrap/ProgressBar';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';


import { YesterdayNotAnswer, TodayNotAnswer, TodayAnswer, AnsweredToday, Tomorrow } from '../../../components/DateChallenge.js';

import SemiCircleProgressBar from "react-progressbar-semicircle";

import '../../../i18n.js'

import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router';


function Growth(props) {





  const history = useHistory();
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
    startDate: "0",
    endDate: "0",
    loading: true,
    selectLanguage: 'en',
    slider1: 'Carousel-Growth-Quest_1 1.jpg',
    slider1Eng: 'Carousel-Growth-Quest_1 1.jpg',
    //slider2: 'Carousel-Growth-Quest_2 1.jpg',
    //slider2Eng: 'Carousel-Growth-Quest_2 1.jpg',    
    slider2: 'Carousel-Growth-Quest_2_3.jpg',
    slider2Eng: 'Carousel-Growth-Quest_2_3.jpg',
    slider2_1: 'Carousel-Referral_Eng.jpg',
    slider3: 'Carousel-Growth-Quest_3 1.jpg',
    slider3Eng: 'Carousel-Growth-Quest_3 1.jpg',    
    //slider4: 'Carousel-Growth-4.jpg',
    //slider4Eng: 'Carousel-Growth-4.jpg',
    slider4: 'Carousel-Growth-Quest_6.jpg',
    slider4Eng: 'Carousel-Growth-Quest_6.jpg',
  });



  const targetRef = useRef(null);

  const [loading, setLoading] = useState(true)

  const user_id = securityData.Security_UserId()
  const [itemsQuarter, setItemsQuarter] = useState([])
  const [itemsLeaderboardUser, setLeaderboardUser] = useState([])

  const platform_id = securityData.Security_getPlatformId()

  const { t, i18n: { changeLanguage, language } } = useTranslation();


  const getQuarter = async () => {
    const credentials = {
      limit: 10,
      offset: 0,
      category: "",
      platform_id: platform_id,
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbGrowth/QuarterListForEmployee', credentials);

    if (isi.status === 200) {
      setItemsQuarter(isi.data.data);
      setLoading(false)


      const scrollTo = new URLSearchParams(props.location.search).get('scrollTo');
      if (scrollTo === 'quest-list') {
        targetRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

    }
  };

  const getLeaderboardUser = async () => {
    const credentials = {
      limit: 10,
      offset: 0,
      category: "",
      platform_id: platform_id,
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbGrowth/LeaderboardUser', credentials);

    if (isi.status === 200) {
      setLeaderboardUser(isi.data);
      props.loading(false)
    }
  };

  const isEmptyObject = (obj) => Object.keys(obj).length === 0;


  const toQuest = useCallback(async (questId, questType, quarterId, checkSudahDIkerjakan) => {
    const md5Id = await axiosLibrary.getmd5FromBackend(questId)
    const md5IdQuarter = await axiosLibrary.getmd5FromBackend(quarterId)
    if (checkSudahDIkerjakan > 0) {
      history.push(routeAll.routesUser.QuestAnswered.path + "?questId=" + md5Id + "&quarterId=" + md5IdQuarter);
    } else {
      history.push(routeAll.routesUser.Quest.path + "?questId=" + md5Id + "&quarterId=" + md5IdQuarter);
    }
  })


  useEffect(() => {
    getQuarter();
    getLeaderboardUser();
  }, [])

  const settingsSlider = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 3000,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  function ShowListQuest(props) {
  }

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
            <div className="container " style={{ marginTop: "-95px" }} id="access-idp">
              <div className="card card-white" style={{ padding: "10px" }}>
                <div className="card-body ">
                  <div className="row d-flex ">
                    <div className="col-lg-6 p-4">
                       <Slider {...settingsSlider}>
                          {
                            t('textBtnStartNow') == 'Start Now' ?
                              <img src={env.assets + "growth/thumbnail/" + state.slider1Eng} className="img-fluid rounded " />
                              :
                              <img src={env.assets + "growth/thumbnail/" + state.slider1} className="img-fluid rounded " />
                          }
                          {
                            t('textBtnStartNow') == 'Start Now' ?
                              <img src={env.assets + "growth/thumbnail/" + state.slider2Eng} className="img-fluid rounded " />
                              :
                              <img src={env.assets + "growth/thumbnail/" + state.slider2} className="img-fluid rounded " />
                          }
                          
                          {
                            t('textBtnStartNow') == 'Start Now' ?
                              <img src={env.assets + "growth/thumbnail/" + state.slider2_1} className="img-fluid rounded " />
                              :
                              <img src={env.assets + "growth/thumbnail/" + state.slider2_1} className="img-fluid rounded " />
                          }
                          {
                            t('textBtnStartNow') == 'Start Now' ?
                              <img src={env.assets + "growth/thumbnail/" + state.slider3Eng} className="img-fluid rounded " />
                              :
                              <img src={env.assets + "growth/thumbnail/" + state.slider3} className="img-fluid rounded " />
                          }
                          {
                            t('textBtnStartNow') == 'Start Now' ?
                              <img src={env.assets + "growth/thumbnail/" + state.slider4Eng} className="img-fluid rounded " />
                              :
                              <img src={env.assets + "growth/thumbnail/" + state.slider4} className="img-fluid rounded " />
                          }
                        </Slider>
                    </div>
                    <div className="col-lg-6  p-3">
                      <br/>
                      <p className="title1color2">
                        {t('textBehindTheChallengeGrowth')}
                      </p>
                      <br/>
                      <p className=" mb-5">
                        <div dangerouslySetInnerHTML={{ __html: t('textBehindTheChallengeDescGrowth') }} />
                      </p>
                      <br/>
                      <a className="growth-button-primary-button mt-4" target="_blank" rel="noopener noreferrer" href="https://forms.office.com/e/bmw29sH0mg">
                        <span className="frame1-menit1-hari-landing-page-text005">
                          <span>{t('textBtnSubsribeEmail')}</span>
                        </span>
                        <img src={env.assets + "growth/images/icons8-email-50_white.png"} className="frame1-menit1-hari-landing-page-arrowdown mb-1" style={{ marginLeft: "10px" }} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container" id="access-idp" style={{ marginTop: "10px" }}>
              <div className="card card-white" style={{ padding: "10px" }}>
                <div className="card-body ">
                  <div className="row d-flex">
                    <div className="col-lg-2 justify-content-center m-auto mt-1">
                      <img src={env.assets + "growth/images/Logo Growth Quest_blue.png"} className="img-fluid" />
                    </div>
                    {

                      itemsQuarter.map(
                        (item) =>
                          <div className="col-lg-2 mt-1" key={item.id}>
                            <div className="card card-white">
                              <div className="card-body" style={{ padding: "10px" }}>
                                <div className="d-flex align-items-center justify-content-center " >

                                  <SemiCircleProgressBar strokeWidth={17} diameter={150} stroke={"#1A4496"} percentage={item.percentage} showPercentValue />

                                </div>
                              </div>

                              <div className="card-footer   text-center header-card-growth-2 " >
                                <b>{item.quarterName}</b>
                                <br />
                                {item.myPointQuarter} / {item.total_point} {t('textPoint')}
                              </div>
                            </div>
                          </div>
                      )}


                  </div>

                  <div className="row d-flex mt-4"  >
                    <div className="col-lg-12 ">
                      <div className="card card-white">

                        <div className="card-header header-card-growth">
                          {t('textProgressKeseluruhan')}
                        </div>
                        <div className="card-body" >
                          <div className="row d-flex " style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                            <div className="col-lg-7  p-2" style={{ paddingTop: "7px" }}>
                              <ProgressBar now={itemsLeaderboardUser.percentage} className="blue-progress-bar" />
                            </div>
                            <div className="col-lg-2  p-2 text-end font-weight-bold" >
                              <b style={{ marginTop: "10px" }}>{itemsLeaderboardUser.percentage}%</b>
                              <img src={env.assets + "growth/images/icon/daun-blue.png"} style={{ marginLeft: "5px" }} />
                            </div>
                            <div className="col-lg-3  p-2 text-end">
                              <a className="growth-button-primary-button mt-2" href="/leaderboard">
                                <span className="frame1-menit1-hari-landing-page-text005">
                                  <span>{t('textBtnLihatLeaderboard')}</span>
                                </span>
                                <img src={env.assets + "growth/images/icon/arrow-right-white.png"} className="frame1-menit1-hari-landing-page-arrowdown mb-1" style={{ marginLeft: "10px" }} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row d-flex mt-4">
                    <div className="col-lg-12 ">
                      <div className="card card-white">
                        <div className="card-header header-card-growth">
                          {t('textCaraGrowthQuest')}
                        </div>
                        <div className="card-body">
                          <table width="100%">
                            <tbody>
                              <tr valign="top">
                                <td><span className="">1.&nbsp;&nbsp;</span></td>
                                <td>
                                  <span className="">
                                    <div dangerouslySetInnerHTML={{ __html: t('textHowToCompleteNew1') }} />
                                  </span>
                                </td>
                              </tr>
                              <tr valign="top">
                                <td><span className="">2.&nbsp;&nbsp;</span></td>
                                <td>
                                  <span className="">
                                    <div dangerouslySetInnerHTML={{ __html: t('textHowToCompleteNew2') }} />
                                  </span>
                                </td>
                              </tr>
                              <tr valign="top">                         
                                <td><span className="">3.&nbsp;&nbsp;</span></td>
                                <td>
                                  <span className="">
                                    <div dangerouslySetInnerHTML={{ __html: t('textHowToCompleteNew4') }} />
                                  </span>
                                </td>
                              </tr>
                              <tr valign="top">
                                <td><span className="">4.&nbsp;&nbsp;</span></td>
                                <td>
                                  <span className="">
                                    <div dangerouslySetInnerHTML={{ __html: t('textHowToCompleteNew5') }} />
                                  </span>
                                </td>
                              </tr>
                              
                              <tr valign="top">
                                <td><span className="">5.&nbsp;&nbsp;</span></td>
                                <td>
                                  <span className="">
                                    <div dangerouslySetInnerHTML={{ __html: t('textHowToCompleteNew7') }} />
                                  </span>
                                </td>
                              </tr>
                              {/* 
                              <tr valign="top">
                                <td><span className="">6.&nbsp;&nbsp;</span></td>
                                <td>
                                  <span className="">
                                    <div dangerouslySetInnerHTML={{ __html: t('textHowToCompleteNew6') }} />
                                  </span>
                                </td>
                              </tr>
                              */}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div ref={targetRef} className="container" id="quest-list" style={{ marginTop: "20px", marginBottom: "10px" }}>
              <p className="title-text-black">
                {t('textTitleTiapQuest')}
              </p>
              <div className="mt-4"></div>
              <Tab.Container id="left-tabs-example" defaultActiveKey="divBody1">
                <Row>
                  <Col sm={3}>
                    <Nav variant="pills" className="flex-column">
                      {itemsQuarter.map(
                        (item) =>
                          <Nav.Item key={item.id}>
                            <Nav.Link eventKey={"divBody" + item.id}>{item.quarterName}</Nav.Link>
                          </Nav.Item>
                      )}
                    </Nav>
                  </Col>
                  <Col sm={9}>
                    <Tab.Content>
                      {
                        itemsQuarter.map((item) => (
                          <>
                            {
                              isEmptyObject(item.allDataQuest) ?
                                <><Tab.Pane eventKey={"divBody" + item.id}>
                                  <div className="card card-white mb-4 ">
                                    <div className="card-body ">
                                      <div className="row d-flex ">
                                        <div className="col-lg-12  ">{t('textNoQuest')}</div></div></div></div></Tab.Pane></> :
                                item.allDataQuest.map(
                                  (questItem) =>
                                    <Tab.Pane eventKey={"divBody" + item.id}>

                                      <div className="card card-white mb-4 " style={{ padding: "5px", cursor: "pointer" }} onClick={() => toQuest(questItem.id, questItem.quest_type, item.id, questItem.checkSudahDIkerjakan)}>
                                        <div className="card-body ">
                                          <div className="row d-flex ">
                                            <div className="col-lg-1  ">
                                              {
                                                questItem.checkSudahDIkerjakan == 1 ?


                                                <img src={env.assets + "growth/images/icon/note-green.png"} className="" />

                                                :
                                                  questItem.canAccessByDate == 1 ?

                                                    <img src={env.assets + "growth/images/icon/note-blue.png"} className="" />
                                                    
                                                    :

                                                    <img src={env.assets + "growth/images/icon/note-grey.png"} className="" />
                                                  

                                              }
                                            </div>
                                            <div className="col-lg-7 ">
                                              <div className="row d-flex">
                                                Quest {questItem.questNumber}
                                              </div>
                                              <div className="row d-flex fw-bold">

                                                {t('textBack') == 'Back' ? questItem.titleQuestEng : questItem.titleQuest}
                                              </div>
                                            </div>
                                            <div className="col-lg-3  text-end " style={{ padding: "10px", borderRadius: "5px" }}>
                                              <span className=
                                                {
                                                  questItem.checkSudahDIkerjakan == 1 ?
                                                    "titleQuestDone"
                                                    : questItem.canAccessByDate == 1 ?
                                                      "titleTabQuarter" : "titleQuestNotAvailable"                                                    
                                                    }>

                                                {
                                                  questItem.checkSudahDIkerjakan == 1 ?
                                                    t('textQuestDone') :
                                                    questItem.canAccessByDate == 1 ?
                                                      t('textQuestAvailable') : t('textQuestNotAvailable')
                                                    
                                                }
                                              </span>
                                            </div>
                                            <div className="col-lg-1  text-end " style={{ paddingTop: "10px" }}>
                                              <img src={env.assets + "growth/images/icon/arrow-right-blue.png"} className="" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                    </Tab.Pane>
                                )}
                          </>
                        ))}




                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>


            </div>
          </>
      }
    </>
  );
}

export default Growth;
