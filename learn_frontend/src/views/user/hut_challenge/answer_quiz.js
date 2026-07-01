import React, { useCallback, useEffect, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import routeAll from '../../../helpers/route';
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import defaultLang from '../../../helpers/lang';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../../../views/user/shared/navMenu';
import { useHistory } from 'react-router';
import { cssTarget, LoadingDataButton, LoadingData } from '../../../components/Loading';

import { YesterdayNotAnswer, TodayNotAnswer, TodayAnswer, AnsweredToday, Tomorrow } from '../../../components/DateChallenge';


import moment from 'moment';

import '../../../i18n.js'

import { useTranslation } from "react-i18next";



function AnswerQuiz(props) {

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
    selectLanguageQuestion: 'eng',
    isQuestionVisible: false,
    isThanks: false,
  });

  const fileInput = React.createRef()
  const history = useHistory();
  const [allAnswer, setAllAnswer] = useState([])
  const [invalidImage, setInvalidImage] = useState(false)
  const [questionItems, setQuestionItems] = useState([])
  const [buttonLoading, setButtonLoading] = useState(false)
  const [itemsWeek1, setItemsWeek1] = useState([])
  const [itemsAnswerUser, setItemsAnswerUser] = useState([])
  const [invalidImagePreview, setInvalidImagePreview] = useState(false)

  const [filePreview, setFilePreview] = useState(null)
  const [itemsInput, setItemsInput] = useState([])
  const [itemsDateChallenge, setItemsDateChallenge] = useState([])
  const [loading, setLoading] = useState(false)
  const reader = new FileReader()
  const { t, i18n: { changeLanguage, language } } = useTranslation();

  const [radio, setRadio] = useState(new Map());

  const user_id = securityData.Security_UserId()

  const [allAnswerUser, setAllAnswerUser] = useState([])
  const [file, setFile] = useState(null)

  const openInNewTab = (url) => {
    openNewTabSaveDatabase(url);
    const newWindow = window.open(url)
    if (newWindow) newWindow.opener = null
  }

  const openNewTabSaveDatabase = async (url) => {
    let response = await axiosLibrary.postData('awbHome/createHistoryLandingPage', { url: url, platform_id: state.platformId, user_id: securityData.Security_UserId() })
    if (response.status === 200) {
      setState(currentState => ({ ...currentState, sliderSff: response.data.data }))
    }
  }


  const setStateImage = (HtmlElement, stateFile, invalidImage) => {
    document.getElementById("upload-name").innerHTML = HtmlElement

    setFile(stateFile)
    setInvalidImage(invalidImage)
  }

  const ajaxFileUploadImage = (upload_field) => {
    var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;
    var filename = upload_field.target.value;
    var imagename = filename == null ? "" : filename.replace("C:\\fakepath\\", "");
    if (filename.search(re_text) === -1) {
      alert("File must be an image (png,jpg,jpeg,gif)");
      upload_field.target.form.reset();
      return 0;
    }
    var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
    if (FileSize > 4) {
      alert('File size exceeds 4 MB');
      upload_field.target.form.reset();
      return 0;
    }

    setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')', URL.createObjectURL(upload_field.target.files[0]), false)

    // if(upload_field.target.files[0]!== undefined){
    //     reader.onload = (e) => {
    //         const img = new Image();
    //         img.onload = () => {
    //             setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')',URL.createObjectURL(upload_field.target.files[0]),false)
    //         }
    //         img.onerror = () => {
    //             setStateImage('Invalid image content',null,true)
    //         }
    //         img.src = e.target.result;
    //     }
    //     reader.readAsDataURL(upload_field.target.files[0]);
    // }

    return 1;
  }

  const formatSizeUnits = (bytes) => {

    if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + ' GB'; }
    else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + ' MB'; }
    else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + ' KB'; }
    else if (bytes > 1) { bytes = bytes + ' bytes'; }
    else if (bytes === 1) { bytes = bytes + ' byte'; }
    else { bytes = '0 byte'; }
    return bytes;
  }


  const cekDoneOrChallengeExpired = useCallback(async () => {
    const data = {
      user_id: user_id,
      md5ID: new URLSearchParams(props.location.search).get('dateId')
    }
    if (data.md5ID !== null) {
      //setEditData(true)
      let response = await axiosLibrary.postData('awbHutUser/CekDoneOrChallengeExpired', data);
      if (response.status === 200) {
        //console.log("case = "+response.data.typeRedirect);


        if (response.data.typeRedirect === 2) {
          setState({ ...state, isThanks: true, isQuestionVisible: false });
          getAnswerUser();
        }
        else if (response.data.typeRedirect === 3 || response.data.typeRedirect === 1) {
          history.push(routeAll.routesUser.HUTChallenge.path);

        }
        else {
          setState({ ...state, isThanks: false, isQuestionVisible: true });
        }
        setLoading(false)

      } else {
        history.push(routeAll.routesUser.HUTChallenge.path);
      }
    } else {
      setLoading(false)
    }
  }, [props.location.search])


  const questionLanguage = useCallback(async (lang) => {
    setState(state => ({ ...state, selectLanguageQuestion: lang }))
  })


  const getChallengeDetail = useCallback(async () => {
    const data = {
      md5ID: new URLSearchParams(props.location.search).get('dateId')
    }
    if (data.md5ID !== null) {
      //setEditData(true)
      let response = await axiosLibrary.postData('awbHutDateChallenge/SelectData', data);
      if (response.status === 200) {


        if (response.data.data.challenge_type == 4) {
          var md5New = new URLSearchParams(props.location.search).get('dateId');
          history.push(routeAll.routesUser.AnswerQuiz4.path + "?dateId=" +md5New );
        }
        if (response.data.data.challenge_type == 3) {
          var md5New2 = new URLSearchParams(props.location.search).get('dateId');
          history.push(routeAll.routesUser.AnswerQuiz3.path + "?dateId=" +md5New2 );
        }

        setItemsDateChallenge(response.data.data)
        setLoading(false)
      } else {
        alert(response);
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [props.location.search])

  const getQuestionList = useCallback(async () => {
    setLoading(true)
    const credentials = {
      limit: 10,
      offset: 0,
      category: "",
      dateId: new URLSearchParams(props.location.search).get('dateId')
    };

    let isi = await axiosLibrary.postData('awbHutUser/ListQuestionByDateId', credentials);
    setQuestionItems(isi.data.data)
  }, [])

  useEffect(() => {
    cekDoneOrChallengeExpired();
    getDateChallenge();
    getChallengeDetail();
    getQuestionList();
    //console.log("isThanks useEffect = "+state.isThanks);
  }, [])
  const addDefaultSrc = (ev) => {
    // ev.target.src =  file_path+"profile/resized/default.jpg";
    ev.target.src = "";
  }


  const ajaxFileUploadImagePreview = (upload_field_preview) => {
    var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;
    var filename = upload_field_preview.target.value;
    var imagename = filename == null ? "" : filename.replace("C:\\fakepath\\", "");
    if (filename.search(re_text) === -1) {
      alert("File must be an image (png,jpg,jpeg,gif) or video (mp4)");
      upload_field_preview.target.form.reset();
      return 0;
    }
    var FileSize = upload_field_preview.target.files[0].size / 1024 / 1024; // in MB
    if (FileSize > 1) {
      alert('File size exceeds 1 MB');
      upload_field_preview.target.form.reset();
      return 0;
    }

    setStateImagePreview(imagename + ' (' + formatSizeUnits(upload_field_preview.target.files[0].size) + ')', URL.createObjectURL(upload_field_preview.target.files[0]), false)

    if (upload_field_preview.target.files[0] !== undefined) {
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setStateImagePreview(imagename + ' (' + formatSizeUnits(upload_field_preview.target.files[0].size) + ')', URL.createObjectURL(upload_field_preview.target.files[0]), false)
        }
        img.onerror = () => {
          setStateImagePreview('Invalid image content', null, true)
        }
        img.src = e.target.result;
      }
      reader.readAsDataURL(upload_field_preview.target.files[0]);
    }

    return 1;
  }



  const setStateImagePreview = (HtmlElement, stateFilePreview, invalidImagePreview) => {
    document.getElementById("upload-name-preview").innerHTML = HtmlElement

    setFilePreview(stateFilePreview)
    setInvalidImagePreview(invalidImagePreview)
  }

  const validateImage = (e) => {
    e.preventDefault();
    if (invalidImage) {
      alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
      return false
    } else {
      submit();
      return true
    }
  }

  const dateId = new URLSearchParams(props.location.search).get('dateId');
  const submit = async () => {

    setButtonLoading(true)


    const credentials = {
      date_id: dateId,
      user_id: user_id,
      answer: itemsInput
    }

    let responseJson = await axiosLibrary.postData("awbHutUser/AnswerQuiz", credentials);

    if (responseJson.status === 200) {

      setState({ ...state, isThanks: true, isQuestionVisible: false });
      getDateChallenge();
      getAnswerUser();
      setButtonLoading(false)
    }
    else {
      setButtonLoading(false)
      alert(responseJson);
    }
  }

  const handleChange = (e) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.name;

    var stateCopy = Object.assign({}, itemsInput);
    stateCopy[key] = value;

    setItemsInput(stateCopy)
  };



  function isLater(str1, str2) {
    return new Date(str1) <= new Date(str2);
  }


  const getDateChallenge = async () => {

    const credentials = {
      limit: 100,
      allData: 'true',
      offset: 0,
      category: "",
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbHutUser/ListDateChallengeByuser', credentials);

    if (isi.status === 200) {

      setItemsWeek1(isi.data.dataWeek);

      setState(state => ({ ...state, loading: false }))
      setState(state => ({ ...state, totalPoint: isi.data.totalPoint }))
      props.loading(false)
    }
  };
  const getAnswerUser = async () => {

    const credentials = {
      limit: 100,
      allData: 'true',
      offset: 0,
      category: "",
      userId: user_id,
      dateId: dateId,
    };

    let isi = await axiosLibrary.postData('awbHutUser/ListQuestionAnswerUserByDateId', credentials);

    if (isi.status === 200) {
      setItemsAnswerUser(isi.data.data);
      props.loading(false)
    }
  };


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
                  return YesterdayNotAnswer(item.id, t('textDay'), item.challenge_type);
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
              <div className="col-md-12  d-flex justify-content-center title-nav-page-text" style={{ paddingTop: "75px", paddingBottom: "75px" }} >
                {t('textMenu1Day1Minutes')}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="page-section"></section>

      <div className="container" style={{ marginTop: "-30px" }} id="access-idp">
        <div className="row d-flex ">
          <div className="col-lg-3">
            <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
              <div className="card card-white" >
                <div className="card-body ">
                  <div className="row d-flex justify-content-center ">
                    <a href={routeAll.routesUser.HUTChallenge.path} >
                      <p className="text-blue">

                        <img src={env.assets + "landingpage/assets/images/hut/arrow-left.svg"} className="ml-2" />
                        {t('textBack')}
                      </p>
                    </a>
                    <p className="title-text-black">
                      {t('textDaysChallenge')}
                    </p>
                    <ShowDateChallengeWeek1 items={itemsWeek1} />

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-9">
            <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
              <div className="card card-white" style={{ padding: "10px" }}>
                <div className="card-body ">
                  <div className="row d-flex ">



                    <p className="title-text-blue">
                      {
                        t('textBack') == 'Back' ? itemsDateChallenge.title_challenge_eng : itemsDateChallenge.title_challenge
                      }
                    </p>

                    <span className="title-content">
                      <span dangerouslySetInnerHTML={{ __html: t('textBack') == 'Back' ? itemsDateChallenge.description_challenge_eng : itemsDateChallenge.description_challenge }}>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              {
                state.isQuestionVisible ?

                  <form id="czfrom" onSubmit={validateImage} method="post" style={{ display: "block" }} encType='multipart/form-data'>

                    <div className="row d-flex mt-4"></div>


                    <div id="challenge012" style={{
                      display:
                        itemsDateChallenge.challenge_type == 2 || itemsDateChallenge.challenge_type == 0 || itemsDateChallenge.challenge_type == 1 ? "" : "none"
                    }}>
                      <div className="row d-flex">
                        <div className="col-lg-1 text-blue ">
                          1.
                        </div>
                        <div className="col-lg-11 title-text-black">
                          {t('')}


                          {
                            itemsDateChallenge.challenge_type == 2 ?
                              t('textLearnWeekly')
                              :
                              t('textLearn')
                          }
                        </div>
                      </div>
                      <div className="row d-flex mt-3">
                        <div className="col-lg-1 ">
                        </div>
                        <div className="col-lg-11">
                          <a className="frame1-menit1-hari-landing-page-button-primary-button" style={{ cursor: "pointer" }} onClick={() => openInNewTab(itemsDateChallenge.article_url)} rel="noreferrer" target="_blank">


                            <span className="frame1-menit1-hari-landing-page-text005" >
                              <span>{t('textBtnVisitlink')}</span>
                            </span>
                            <img src={env.assets + "landingpage/assets/images/hut/arrow-right-white.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
                          </a>
                        </div>
                      </div>

                      <div className="row d-flex mt-4"></div>
                      <div className="row d-flex">
                        <div className="col-lg-1 text-blue ">
                          2.
                        </div>
                        <div className="col-lg-11 title-text-black">
                          {
                            itemsDateChallenge.challenge_type == 2 ?
                              t('textLearnProgressWeekly')
                              :
                              t('textLearnProgress')
                          }
                        </div>
                      </div>
                      <div className="row d-flex">
                        <div className="col-lg-1 text-blue ">

                        </div>
                        <div className="col-lg-11 title-text-black mt-2">
                          <div className="card card-white" style={{ padding: "10px" }}>
                            <div className="card-body ">

                              {
                                itemsDateChallenge.challenge_type == 2 ?
                                  <>
                                    <div className="row d-flex ">
                                      <div className="form-check">

                                        <input
                                          type="radio" required
                                          className="form-check-input"
                                          id={t('textCheckboxMenyenangkan')}
                                          name="learning_progress"
                                          value={t('textCheckboxMenyenangkan')}
                                          onChange={handleChange.bind(this)}
                                        />
                                        <label className="form-check-label text-content" for={t('textCheckboxMenyenangkan')}>
                                          {t('textCheckboxMenyenangkan')}
                                        </label>
                                      </div>
                                    </div>

                                    <div className="row d-flex ">
                                      <div className="form-check">

                                        <input
                                          type="radio" required
                                          className="form-check-input"
                                          id={t('textCheckboxNetral')}
                                          name="learning_progress"
                                          value={t('textCheckboxNetral')}
                                          onChange={handleChange.bind(this)}
                                        />
                                        <label className="form-check-label text-content" for={t('textCheckboxNetral')}>
                                          {t('textCheckboxNetral')}
                                        </label>
                                      </div>
                                    </div>

                                    <div className="row d-flex ">
                                      <div className="form-check">

                                        <input
                                          type="radio"
                                          className="form-check-input"
                                          id={t('textCheckboxKurangTertarik')}
                                          name="learning_progress" required
                                          value={t('textCheckboxKurangTertarik')}
                                          onChange={handleChange.bind(this)}
                                        />
                                        <label className="form-check-label text-content" for={t('textCheckboxKurangTertarik')}>
                                          {t('textCheckboxKurangTertarik')}
                                        </label>
                                      </div>
                                    </div>
                                  </>
                                  :
                                  <div className="row d-flex ">
                                    <div className="form-check">

                                      <input required
                                        type="checkbox"
                                        className="form-check-input"
                                        id="flexCheckDefault"
                                        name="learning_progress"
                                        value={itemsInput.learning_progress}
                                        onChange={handleChange.bind(this)}
                                      />
                                      <label className="form-check-label text-content" for="flexCheckDefault">
                                        {t('textFinishLearning')}
                                      </label>
                                    </div>
                                  </div>
                              }


                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row d-flex mt-4"></div>
                      <div className="row d-flex">
                        <div className="col-lg-1 text-blue ">
                          3.
                        </div>
                        <div className="col-lg-11 title-text-black">
                          {
                            itemsDateChallenge.challenge_type == 2 ?
                              t('textQuizTitleWeekly')
                              :
                              t('textQuizTitle')
                          }
                        </div>
                      </div>




                      <div className="row d-flex">
                        <div className="col-lg-1 text-blue ">

                        </div>
                        <div className="col-lg-11 title-text-black mt-2">
                          <div className="card card-white" style={{ padding: "10px" }}>
                            <div className="card-body ">
                              <div className="row d-flex mb-4">

                                <LoadingDataButton loading={buttonLoading} />

                                <div style={cssTarget(buttonLoading)}> </div>
                              </div>
                              <div className="row d-flex mb-4">
                                <div className="col-lg-12 text-end ">
                                  <span onClick={() => questionLanguage('id')} className={state.selectLanguageQuestion == 'id' ? 'text-language-question-bold' : 'text-language-question'}>ID</span>
                                  &nbsp;&nbsp;
                                  |
                                  &nbsp;&nbsp;
                                  <span onClick={() => questionLanguage('eng')} className={state.selectLanguageQuestion == 'eng' ? 'text-language-question-bold' : 'text-language-question'}>ENG</span>

                                </div>
                              </div>
                              {questionItems.map(
                                (questionItem, i) =>

                                  <div className="row d-flex mb-4" key={i}>
                                    <div className="col-lg-1 text-blue ">
                                      {++i}.
                                    </div>
                                    <div className="col-lg-11 title-text-black">
                                      <span className=" text-content">
                                        {
                                          state.selectLanguageQuestion == 'eng' ?

                                            <span dangerouslySetInnerHTML={{ __html: questionItem.question_eng }}></span>
                                            :
                                            <span dangerouslySetInnerHTML={{ __html: questionItem.question }}></span>

                                        }

                                      </span>
                                      {
                                        questionItem.answer.map(
                                          (answerList) =>

                                            <div className="form-check">
                                              <input
                                                type="radio"
                                                className="custom-control-input vertical-align-text-top"
                                                id={"answer_" + answerList.id}
                                                name={"question_" + answerList.question_id}
                                                value={answerList.id}
                                                onChange={handleChange.bind(this)}
                                                required="required"
                                              />
                                              <label className="form-check-label ml-4 mt-1 text-content-label-input" for={"answer_" + answerList.id}>
                                                {
                                                  state.selectLanguageQuestion == 'eng' ?

                                                    <span dangerouslySetInnerHTML={{ __html: answerList.answer_eng }}></span>
                                                    :
                                                    <span dangerouslySetInnerHTML={{ __html: answerList.answer }}></span>
                                                }
                                              </label>
                                            </div>
                                        )
                                      }

                                    </div>
                                  </div>
                              )}
                              <div className="row d-flex mb-4 mt-4">
                                <div className="col-lg-1 text-blue ">
                                </div>
                                <div className="col-lg-11 title-text-black">
                                  <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">
                                    submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>




                    

                  </form>
                  : <></>
              }

              {
                state.isThanks ?
                  <>
                    <div className="row d-flex">
                      <div className="col-lg-12 text-center ">

                        <div>
                          <img src={env.assets + "landingpage/assets/images/hut/done-day-challenge.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />

                        </div>
                        <div>
                          <p className=" title-text-black">{t('textCongratulations')}</p>
                          <p className=" mb-4 title-content">{t('textAnotherChallenge')}</p>



                          <a className="frame1-menit1-hari-landing-page-button-primary-button" href="/hut-challenge#list-date">
                            <span className="frame1-menit1-hari-landing-page-text005 ">
                              <span>{t('textOtherChallenge')}</span>
                            </span>
                            <img src={env.assets + "landingpage/assets/images/hut/arrow-right-white.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
                          </a>

                        </div>
                      </div>
                    </div>

                    <div className="row d-flex mt-4">
                      <div className="col-lg-12 title-text-black mt-2">
                        <div className="card card-white" style={{ padding: "10px" }}>
                          <div className="card-body ">

                          <div className="row d-flex">
                        <div className="col-lg-12 title-text-black">
                          {
                            itemsDateChallenge.challenge_type == 2 ?
                              t('textLearnWeekly')
                              :
                              t('textLearn')
                          }
                        </div>
                      </div>
                      <div className="row d-flex mt-3">
                        <div className="col-lg-12">
                          <a className="frame1-menit1-hari-landing-page-button-primary-button" style={{ cursor: "pointer" }} onClick={() => openInNewTab(itemsDateChallenge.article_url)} rel="noreferrer" target="_blank">


                            <span className="frame1-menit1-hari-landing-page-text005" >
                              <span>{t('textBtnVisitlink')}</span>
                            </span>
                            <img src={env.assets + "landingpage/assets/images/hut/arrow-right-white.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
                          </a>
                        </div>
                      </div>



                            <div className="row d-flex mb-4">
                              <div className="col-lg-12 text-end ">
                                <span onClick={() => questionLanguage('id')} className={state.selectLanguageQuestion == 'id' ? 'text-language-question-bold' : 'text-language-question'}>ID</span>
                                &nbsp;&nbsp;
                                |
                                &nbsp;&nbsp;
                                <span onClick={() => questionLanguage('eng')} className={state.selectLanguageQuestion == 'eng' ? 'text-language-question-bold' : 'text-language-question'}>ENG</span>

                              </div>
                            </div>
                            {itemsAnswerUser.map(
                              (questionItem, i) =>

                                <div className="row d-flex mb-4">
                                  <div className="col-lg-1 text-blue ">
                                    {++i}.
                                  </div>
                                  <div className="col-lg-11 title-text-black">
                                    <p className=" text-content">
                                      {
                                        state.selectLanguageQuestion == 'eng' ?

                                          <span dangerouslySetInnerHTML={{ __html: questionItem.question_eng }}></span>
                                          :
                                          <span dangerouslySetInnerHTML={{ __html: questionItem.question }}></span>

                                      }

                                    </p>
                                    {
                                      questionItem.answer.map(
                                        (answerList) =>

                                          <div className="form-check">
                                            <label className={
                                              answerList.correct == 1
                                                ?
                                                "form-check-label ml-4 mt-1  text-content-label-input-green"
                                                :
                                                answerList.id == answerList.answer_id_by_user
                                                  ?
                                                  "form-check-label ml-4 mt-1 text-content-label-input-red"
                                                  :
                                                  "form-check-label ml-4 mt-1 text-content-label-input"
                                            }>
                                              {
                                                state.selectLanguageQuestion == 'eng' ?

                                                  <span dangerouslySetInnerHTML={{ __html: answerList.answer_eng }}></span>
                                                  :
                                                  <span dangerouslySetInnerHTML={{ __html: answerList.answer }}></span>
                                              }

                                              {
                                                answerList.correct == 1
                                                  ?
                                                  <img height="12px" className="m-1" src={env.assets + "landingpage/assets/images/hut/true.png"} />
                                                  :
                                                  answerList.id == answerList.answer_id_by_user
                                                    ?
                                                    <img height="12px" className="m-1" src={env.assets + "landingpage/assets/images/hut/false.png"} />
                                                    :
                                                    ""
                                              }

                                            </label>
                                          </div>
                                      )
                                    }

                                  </div>
                                </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>


                  </>
                  :
                  <></>
              }
            </div>
          </div>
        </div>
      </div >

    </>
  );
}

export default AnswerQuiz;
