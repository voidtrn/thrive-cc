import React, { useCallback, useEffect, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import routeAll from '../../../helpers/route';
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import defaultLang from '../../../helpers/lang';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../../../views/user/shared/navMenu';
import moment from 'moment';
import { cssTarget, LoadingFrontHutChallenge } from '../../../components/Loading';
import Slider from "react-slick";


import { YesterdayNotAnswer, TodayNotAnswer, TodayAnswer, AnsweredToday, Tomorrow } from '../../../components/DateChallenge';


import '../../../i18n.js'

import { useTranslation } from "react-i18next";
import { useHistory } from 'react-router';


function HUTChallenge(props) {





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
    slider1: 'carousel-1.png',
    slider1Eng: 'carousel-1.png',
    slider2: 'carousel-1.png',
    slider2Eng: 'carousel-1.png',
    slider3: 'carousel-1.png',
    slider3Eng: 'carousel-1.png',
  });
  const user_id = securityData.Security_UserId()
  const [itemsWeek1, setItemsWeek1] = useState([])
  const [itemsWeek2, setItemsWeek2] = useState([])
  const [itemsWeek3, setItemsWeek3] = useState([])
  const [itemsAdditionalChallenge, setItemsAdditionalChallenge] = useState([])
  const platform_id = securityData.Security_getPlatformId()

  const { t, i18n: { changeLanguage, language } } = useTranslation();

  const toAnswerQuiz = useCallback(async (dateId, challengeType) => {
    const md5Id = await axiosLibrary.getmd5FromBackend(dateId)

    if(challengeType == 1){
        history.push(routeAll.routesUser.AnswerQuiz.path + "?dateId=" + md5Id);
    }
    if(challengeType == 4){
        history.push(routeAll.routesUser.AnswerQuiz4.path + "?dateId=" + md5Id);
    }
    if(challengeType == 3){
        history.push(routeAll.routesUser.AnswerQuiz3.path + "?dateId=" + md5Id);
    }
   
   
  })

  const getDateChallenge = async () => {

    //setLoading(true)
    const credentials = {
      limit: 7,
      offset: 0,
      category: "",
      platform_id: platform_id,
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbHutUser/ListDateChallengeByuser', credentials);

    if (isi.status === 200) {

      setItemsWeek1(isi.data.dataWeek1);
      setItemsWeek2(isi.data.dataWeek2);
      setItemsWeek3(isi.data.dataWeek3);

      setState(state => ({ ...state, loading: false }))
      setState(state => ({ ...state, totalPoint: isi.data.totalPoint }))
      setState(state => ({ ...state, startDate: isi.data.dataStartChallenge }))
      setState(state => ({ ...state, endDate: isi.data.dataEndChallenge }))
      props.loading(false)
    }



  };


  const getAdditionalChallenge = async () => {

    const credentials = {
      category: "",
      platform_id: platform_id,
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbHutUser/ListAdditionalChallengeByuser', credentials);

    if (isi.status === 200) {

      setItemsAdditionalChallenge(isi.data.data);

      setState(state => ({
        ...state, loading: false,
        slider1: isi.data.slider1,
        slider1Eng: isi.data.slider1_eng,
        slider2: isi.data.slider2,
        slider2Eng: isi.data.slider2_eng,
        slider3: isi.data.slider3,
        slider3Eng: isi.data.slider3_eng

      }))
      props.loading(false)
    }
  };

  useEffect(() => {
    getDateChallenge()
    getAdditionalChallenge()
  }, [])


  function isLater(str1, str2) {
    return new Date(str1) <= new Date(str2);
  }








  function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
  }

  function ShowDateChallengeWeek1(props) {
    return (
      <>
        {
          itemsWeek1.map((item) => {


            let checkKerjakanDiHariYangSama = item.checkKerjakanDiHariYangSama;
            let checkSudahKerjakan = item.checkSudahKerjakan;

            //const d = new Date(item.date); // This value is coming from API
            //const currentDate = new Date();


            const d = moment.utc(item.date).format('YYYY-MM-DD')
            const currentDate = moment().format('YYYY-MM-DD');


            /// jika hari ini atau kemaren
            if (isLater(d, currentDate) == true) {

              // jika dijawab hari sesuai date challenge warna Hijau
              if (checkKerjakanDiHariYangSama !== null) {
                return AnsweredToday(item.id, item.total_point, t('textDay'), t('textPoint'), item.challenge_type);


              }
              // jika dijawab tetapi tidak sesuai hari  date challenge warna Biru
              else if (checkSudahKerjakan !== null) {
                return TodayAnswer(item.id, item.total_point, t('textDay'), t('textPoint'), item.challenge_type);
                //console.log('ini 3');
              }
              else {

                // jika tidak dijawab hari ini warna Kuning
                if (moment().format('YYYY-MM-DD') == moment().format(item.date, 'YYYY-MM-DD')) {
                  return TodayNotAnswer(item.id, t('textDay'), item.challenge_type);
                }

                // jika tidak dijawab hari ini Abu2
                else {

                  ///////////////////
                  return YesterdayNotAnswer(item.id, t('textDay'),item.challenge_type);
                }
              }

              /// jika besok maka di disabled
            }
            else {
              return Tomorrow(item.id)
            }

          })
        }


      </>
    );

  }
  const settingsSlider = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 3000,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  function ShowDateChallengeWeek2(props) {
    return (
      <>
        {
          itemsWeek2.map((item) => {

            let checkKerjakanDiHariYangSama = item.checkKerjakanDiHariYangSama;
            let checkSudahKerjakan = item.checkSudahKerjakan;

            //const d = new Date(item.date); // This value is coming from API
            //const currentDate = new Date();


            const d = moment.utc(item.date).format('YYYY-MM-DD')
            const currentDate = moment().format('YYYY-MM-DD');


            /// jika hari ini atau kemaren
            if (isLater(d, currentDate) == true) {

              //console.log("nilai true"+d);
              // jika dijawab hari sesuai date challenge warna Hijau
              if (checkKerjakanDiHariYangSama !== null) {
                return AnsweredToday(item.id, item.total_point, t('textDay'), t('textPoint'), item.challenge_type);
              }
              // jika dijawab tetapi tidak sesuai hari  date challenge warna Biru
              else if (checkSudahKerjakan !== null) {
                return TodayAnswer(item.id, item.total_point, t('textDay'), t('textPoint'), item.challenge_type);
                //console.log('ini 3');
              }
              else {

                // jika tidak dijawab hari ini warna Kuning
                if (moment().format('YYYY-MM-DD') == moment().format(item.date, 'YYYY-MM-DD')) {
                  return TodayNotAnswer(item.id, t('textDay'), item.challenge_type);
                }

                // jika tidak dijawab hari ini Abu
                else {

                  ///////////////////
                  return YesterdayNotAnswer(item.id, t('textDay'),item.challenge_type);
                }
              }

              /// jika besok maka di disabled
            }
            else {

              //console.log("nilai false"+d);
              return Tomorrow(item.id)

            }

          })
        }


      </>
    );

  }


  function ShowDateChallengeWeek3(props) {
    return (
      <>
        {
          itemsWeek3.map((item) => {

            let checkKerjakanDiHariYangSama = item.checkKerjakanDiHariYangSama;
            let checkSudahKerjakan = item.checkSudahKerjakan;

            //const d = new Date(item.date); // This value is coming from API
            //const currentDate = new Date();


            const d = moment.utc(item.date).format('YYYY-MM-DD')
            const currentDate = moment().format('YYYY-MM-DD');

            /// jika hari ini atau kemaren
            if (isLater(d, currentDate) == true) {

              // jika dijawab hari sesuai date challenge warna Hijau
              if (checkKerjakanDiHariYangSama !== null) {
                return AnsweredToday(item.id, item.total_point, t('textDay'), t('textPoint'), item.challenge_type);
              }
              // jika dijawab tetapi tidak sesuai hari  date challenge warna Biru
              else if (checkSudahKerjakan !== null) {
                return TodayAnswer(item.id, item.total_point, t('textDay'), t('textPoint'), item.challenge_type);
                //console.log('ini 3');
              }
              else {

                // jika tidak dijawab hari ini warna Kuning
                if (moment().format('YYYY-MM-DD') == moment().format(item.date, 'YYYY-MM-DD')) {
                  return TodayNotAnswer(item.id, t('textDay'), item.challenge_type);
                }

                // jika tidak dijawab hari ini Abu
                else {

                  ///////////////////
                  return YesterdayNotAnswer(item.id, t('textDay'),item.challenge_type);
                }
              }

              /// jika besok maka di disabled
            }
            else {
              return Tomorrow(item.id)

            }

          })
        }


      </>
    );

  }
  return (
    <>
      <NavMenu adminLevel={props.adminLevel} {...props} />

      <header className="masthead">
        <div className="overlay">
          <div className=" container ">
            <div className="row d-flex ">

              <div className="col-md-12  d-flex justify-content-center">
                <img src={env.assets + "landingpage/assets/images/hut/1menit1hari-white-new.png"} className="p-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container " style={{ marginTop: "-50px" }} id="access-idp">
        <div className="card card-white" style={{ padding: "10px" }}>
          <div className="card-body ">
            <div className="row d-flex ">
              <div className="col-lg-6 p-4">

                <Slider {...settingsSlider}>
                  {
                    t('textBtnStartNow') == 'Start Now' ?
                      <img src={env.assets + "landingpage/assets/images/hut/" + state.slider1Eng} className="img-fluid rounded " />
                      :
                      <img src={env.assets + "landingpage/assets/images/hut/" + state.slider1} className="img-fluid rounded " />
                  }


                  {
                    t('textBtnStartNow') == 'Start Now' ?
                      <img src={env.assets + "landingpage/assets/images/hut/" + state.slider2Eng} className="img-fluid rounded " />
                      :
                      <img src={env.assets + "landingpage/assets/images/hut/" + state.slider2} className="img-fluid rounded " />
                  }


                  {
                    t('textBtnStartNow') == 'Start Now' ?
                      <img src={env.assets + "landingpage/assets/images/hut/" + state.slider3Eng} className="img-fluid rounded " />
                      :
                      <img src={env.assets + "landingpage/assets/images/hut/" + state.slider3} className="img-fluid rounded " />
                  }
                </Slider>
              </div>
              <div className="col-lg-6  p-4">
                <p className="title-text-black">
                  {t('textBehindTheChallenge')}
                </p>
                <p className="title-text-blue">
                  {t('textMenu1Day1Minutes')}
                </p>

                <p className="text-content mb-4">
                  <div dangerouslySetInnerHTML={{ __html: t('textBehindTheChallengeDesc') }} />
                </p>
                <a className="frame1-menit1-hari-landing-page-button-primary-button mt-2" href="/hut-challenge#list-date">
                  <span className="frame1-menit1-hari-landing-page-text005">
                    <span>{t('textBtnStartNow')}</span>
                  </span>
                  <img src={env.assets + "landingpage/assets/images/hut/arrow-down.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
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
              <div className="col-lg-9 justify-content-center m-auto">
                <p className="title-text-black">
                  {t('textLangkahAwal')}
                </p>
                <p className="title-text-blue">
                  {t('textPalinUpToDate')}
                </p>
              </div>

              <div className="col-lg-3 text-end">
                <div className="card card-white">

                  <div className="card-body">

                    <div className="row d-flex align-items-center" >
                      <div className="col-3 justify-content-center text-center m-auto">
                        <img src={env.assets + "landingpage/assets/images/hut/star.svg"} />
                      </div>
                      <div className="col-9 justify-content-center m-auto align-items-center">

                        <p className="text-score-title">
                          {t('textScoreBalance')}
                        </p>
                        <p className="text-score-title-big">
                          {state.totalPoint}
                        </p>

                      </div>
                    </div>
                  </div>

                  <div className="card-footerheader-card-growth" >
                    <a href={routeAll.routesUser.PointHistory.path} className="nav-link" >
                      {t('textLihatSelengkapnya')} &nbsp;
                      <img src={env.assets + "landingpage/assets/images/hut/arrow-right.svg"} className="ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="row d-flex mt-4">
              <div className="col-lg-12 ">
                <div className="card card-white">

                  <div className="card-header header-card-growth">
                    {t('textApaItuTantangan')}
                  </div>
                  <div className="card-body">
                    <p className="text-content">
                      <div dangerouslySetInnerHTML={{ __html: t('textApaItuTantanganDesc') }} />
                    </p>
                  </div>
                </div>
              </div>
            </div>


            <div className="row d-flex mt-4">
              <div className="col-lg-12 ">
                <div className="card card-white">

                  <div className="card-header header-card-growth">
                    {t('textCaraTantangan')}
                  </div>
                  <div className="card-body">
                    <table width="100%">
                      <tbody>
                        <tr>
                          <td><span className="text-content">1.&nbsp;&nbsp;</span></td>
                          <td><span className="text-content">{t('textCaraTantanganDesc1')}</span></td>
                        </tr>
                        <tr valign="top">
                          <td><span className="text-content">2.&nbsp;&nbsp;</span></td>
                          <td><span className="text-content">{t('textCaraTantanganDesc2')}</span></td>
                        </tr>
                        <tr>
                          <td><span className="text-content">3.&nbsp;&nbsp;</span></td>
                          <td><span className="text-content">{t('textCaraTantanganDesc3')}</span></td>
                        </tr>
                      </tbody>
                    </table>


                    <table className="table table-bordered mt-4">
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col">{t('textTask')}</th>
                          <th scope="col">{t('textPoint')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>{t('textTask1')}</td>
                          <td>10</td>
                        </tr>
                        <tr>
                          <th scope="row">2</th>
                          <td>{t('textTask2')}</td>
                          <td>10</td>
                        </tr>
                        <tr>
                          <th scope="row">3</th>
                          <td>{t('textTask3')}</td>
                          <td>10</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>


        <div className="container-fluid">

          <p className="title-text-black mt-4">
            {t('textSelesaikanChallenge')}
          </p>
          <p className="text-content">
            {t('textPeriode')} : <span className="blue-bg p-2 rounded">{state.startDate} - {state.endDate}</span>
          </p>

        </div>


        {
          itemsAdditionalChallenge.map((item, idx) => {
            return (
              <div className="container mt-5 cursor-pointer-transparent" key={idx} onClick={() => toAnswerQuiz(item.id, item.challenge_type)}>
                <div className="card bg-gradient2">
                  <div className="card-body bg-">

                    <div className="row  d-flex align-items-center">
                      <div className="col-lg-6 color-white">
                        <img src={env.assets + "landingpage/assets/images/hut/carbon_task-star.png"} style={{ marginRight: "15px" }} />
                        {t('textAdditionalChallenge')}
                      </div>

                      <div className="col-lg-6 color-white text-end " >
                        {t('textAdditionalChallengeDue')} : &nbsp;
                        <span className="blue-bg rounded ml-2 p-2">18 August 2024 23:59</span>
                        <img src={env.assets + "landingpage/assets/images/hut/chevron-up.png"} style={{ marginLeft: "15px" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        }




        <div className="container-fluid">

          <div className="row page-section" style={cssTarget(state.loading)}>
            <center>
              <LoadingFrontHutChallenge loading={state.loading} />
            </center>

            <div className="row  page-" id="list-date">
              <ShowDateChallengeWeek1 items={itemsWeek1} />
            </div>
            <div className="row  page-" id="list-date">
              <ShowDateChallengeWeek2 items={itemsWeek2} />
            </div>
            <div className="row  page-" id="list-date">
              <ShowDateChallengeWeek3 items={itemsWeek3} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HUTChallenge;
