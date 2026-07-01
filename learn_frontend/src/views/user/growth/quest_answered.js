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

import { Answer, NotAnswer, QuestNotOpen } from '../../../components/QuestBoxList';


import moment from 'moment';

import '../../../i18n.js'

import { useTranslation } from "react-i18next";



function Quest(props) {

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
    canAccessByDate: false,
    sudahDikerjakan: false,
    isThanks: false,
    imageUpload: false,
    countQuestion: 0,
  });

  const reader = new FileReader()
  const fileInput = React.createRef()
  const history = useHistory();


  const file_path = env.userDocument;
  const [itemQuest, setItemQuest] = useState([])

  const [itemsAnswerUser, setItemsAnswerUser] = useState([])

  const [invalidImage, setInvalidImage] = useState(false)
  const [questionItems, setQuestionItems] = useState([])
  const [questItems, setQuestItems] = useState([])
  const [buttonLoading, setButtonLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [imageUpload, setImageUpload] = useState(null)

  const [itemsInput, setItemsInput] = useState([])
  const [loading, setLoading] = useState(true)
  const { t, i18n: { changeLanguage, language } } = useTranslation();
  const user_id = securityData.Security_UserId()


  const targetRef = useRef(null);

  useEffect(() => {
    //cekDoneOrChallengeExpired();
    //getDateChallenge();
    getQuestDetail();
    getQuestionList();
    ListQuestByQuarterId();
    getAnswerUser();
    //console.log("isThanks useEffect = "+state.isThanks);
  }, [])

  const getQuestDetail = useCallback(async () => {
    const data = {
      md5ID: new URLSearchParams(props.location.search).get('questId'),
      userId: user_id
    }
    if (data.md5ID !== null) {
      //setEditData(true)
      let response = await axiosLibrary.postData('awbGrowth/SelectDataQuestById', data);
      if (response.status === 200) {
        setItemQuest(response.data.data)
        setState({
          canAccessByDate: response.data.canAccessByDate,
          countQuestion: response.data.countQuestion,
          sudahDikerjakan: response.data.sudahDikerjakan
        });

        setLoading(false)
        targetRef.current?.scrollIntoView({ behavior: 'smooth' });

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
      questId: new URLSearchParams(props.location.search).get('questId')
    };

    let isi = await axiosLibrary.postData('awbGrowth/ListQuestionByQuestId', credentials);
    setQuestionItems(isi.data.data)
  }, [])


  const getAnswerUser = async () => {

    const credentials = {
      limit: 100,
      allData: 'true',
      offset: 0,
      category: "",
      userId: user_id,
      questId: new URLSearchParams(props.location.search).get('questId')
    };

    let responseAnswerUser = await axiosLibrary.postData('awbGrowth/ListQuestionAnswerUserByQuestId', credentials);

    if (responseAnswerUser.status === 200) {
      setItemsAnswerUser(responseAnswerUser.data.data);

      setImageUpload(responseAnswerUser.data.urlImageUpload);

      //props.loading(false)
    }
  };



  const ListQuestByQuarterId = useCallback(async () => {
    setLoading(true)
    const credentials = {
      limit: 10,
      offset: 0,
      category: "",
      md5ID: new URLSearchParams(props.location.search).get('quarterId'),
      userId: user_id,
      questType: 1,
    };

    let isi = await axiosLibrary.postData('awbGrowth/ListQuestByQuarterId', credentials);
    setQuestItems(isi.data.data)
  }, [])




  const questionLanguage = useCallback(async (lang) => {
    setState(state => ({ ...state, selectLanguageQuestion: lang }))
  })


  const handleChange = (e) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.name;

    var stateCopy = Object.assign({}, itemsInput);
    stateCopy[key] = value;

    setItemsInput(stateCopy)
  };

  const validateImage = (e) => {
    e.preventDefault();
    if (invalidImage) {
      alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
      return false
    } else {
      return true
    }
  }

  const openInNewTab = (url) => {
    openNewTabSaveDatabase(url);
    const newWindow = window.open(url)
    if (newWindow) newWindow.opener = null
  }


  const openImage = () => {
    const newUrl = file_path + "growth/" + imageUpload;
    const newWindow = window.open(newUrl)
    if (newWindow) newWindow.opener = null
  }

  const openNewTabSaveDatabase = async (url) => {
    let response = await axiosLibrary.postData('awbHome/createHistoryLandingPage', { url: url, platform_id: state.platformId, user_id: securityData.Security_UserId() })
    if (response.status === 200) {
      setState(currentState => ({ ...currentState, sliderSff: response.data.data }))
    }
  }


  function ShowListQuest(props) {
    return (
      <>
        {
          questItems.map((item) => {

            if (item.openQuest) {
              if (item.answeredByUser) {
                return Answer(item.id, item.awb_growth_quarter_id, item.number, t('textQuest'), item.scoreUser, item.quest_type, t('textPoint'));
              }
              else {
                return NotAnswer(item.id, item.awb_growth_quarter_id, item.number, t('textQuest'), item.scoreUser, item.quest_type, t('textPoint'));
              }
            }
            else {
              return QuestNotOpen(item.id, item.awb_growth_quarter_id, item.number, t('textQuest'), item.scoreUser, item.quest_type, t('textPoint'));
            }




          })
        }
      </>
    );

  }


  const ajaxFileUploadImage = (upload_field) => {
    var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
    var filename = upload_field.target.value;
    var imagename = filename == null ? "" : filename.replace("C:\\fakepath\\", "");
    if (filename.search(re_text) === -1) {
      alert("File must be an image");
      upload_field.target.form.reset();
      return 0;
    }
    var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
    if (FileSize > 1) {
      alert('File size exceeds 1 MB');
      upload_field.target.form.reset();
      return 0;
    }

    if (upload_field.target.files[0] !== undefined) {
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')', URL.createObjectURL(upload_field.target.files[0]), false)
        }
        img.onerror = () => {
          setStateImage('Invalid image content', null, true)
        }
        img.src = e.target.result;
      }
      reader.readAsDataURL(upload_field.target.files[0]);
    }

    return 1;
  }
  const setStateImage = (HtmlElement, stateFile, invalidImage) => {
    document.getElementById("upload-name").innerHTML = HtmlElement

    setFile(stateFile)
    setInvalidImage(invalidImage)
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
                <div className="col-lg-3">
                  <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
                    <div className="card card-white" >
                      <div className="card-body ">
                        <div className="row d-flex justify-content-center ">
                          <a href={routeAll.routesUser.Growth.path+"?scrollTo=quest-list"} >
                            <p className="text-blue-growth">
                              <img src={env.assets + "growth/images/icon/arrow-left-blue.png"} style={{ marginRight: "5px" }} />
                              {t('textBack')}
                            </p>
                          </a>
                          <p className="title-text-black">
                            {itemQuest.quarterName}
                          </p>

                          <ShowListQuest items={questItems} />

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

                          <span className=" title-text-black">
                            {t('textQuest')} {itemQuest.number}
                          </span>
                          <p className="title-text-blue-growth">
                            {t('textBack') == 'Back' ? 
                            <span dangerouslySetInnerHTML={{ __html: itemQuest.title_eng }}></span>
                            :
                            <span dangerouslySetInnerHTML={{ __html: itemQuest.title }}></span>
                            }
                          </p>

                          <span className="title-content">
                            {t('textBack') == 'Back' ? 
                              
                              <span dangerouslySetInnerHTML={{ __html: itemQuest.description_eng }}></span>
                              :
                              <span dangerouslySetInnerHTML={{ __html: itemQuest.description }}></span>
                              }
                            
                            {state.canAccessByDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <form id="czfrom" ref={targetRef} onSubmit={validateImage} method="post" style={{ display: "block" }} encType='multipart/form-data'>
                      <div className="row d-flex">
                        <div className="col-lg-12 text-center ">

                          <div>
                            <img src={env.assets + "growth/images/icon/done.png"} className="frame1-menit1-hari-landing-page-arrowdown" />

                          </div>
                          <div>
                            <p className=" title-text-black">{t('textCongratulationsQuest')}</p>
                            <p className=" mb-4 title-content">                              
                              <span dangerouslySetInnerHTML={{ __html: t('textBack') == 'Back' ? itemQuest.finished_text_eng : itemQuest.finished_text }}>
                              </span>
                            </p>

                            <a className="submit-growth " href="/growth?scrollTo=quest-list">
                              <span className="">
                                <span>{t('textOtherQuest')}</span>
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

                              {
                                itemQuest.article_url === "undefined" || itemQuest.article_url === "" || itemQuest.article_url === "null" || itemQuest.article_url === null ? <></> :
                                  <>
                                    <div className="row d-flex mt-3">

                                      {t('textBack') == 'Back' ? 
                                      
                                      <span dangerouslySetInnerHTML={{ __html: itemQuest.learning_material_text_eng }}></span>
                                      :
                                      <span dangerouslySetInnerHTML={{ __html: itemQuest.learning_material_text }}></span>
                                      
                                      }
                                    </div>
                                    <div className="row d-flex mt-3">
                                      <div className="col-lg-12">
                                        <a className="submit-growth " style={{ cursor: "pointer" }} onClick={() => openInNewTab(itemQuest.article_url)} rel="noreferrer" target="_blank">
                                          <span className="frame1-menit1-hari-landing-page-text005" >
                                            <span>{t('textBtnVisitlink')}</span>
                                          </span>
                                          <img src={env.assets + "landingpage/assets/images/hut/arrow-right-white.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
                                        </a>
                                      </div>
                                    </div>
                                  </>
                              }

                              {
                                itemQuest.upload_score > 0 ?
                                  <>
                                    <div className="row d-flex mt-3">
                                      {t('textBack') == 'Back' ? 
                                       <span dangerouslySetInnerHTML={{ __html: itemQuest.upload_text_eng }}></span>
                                       :
                                       <span dangerouslySetInnerHTML={{ __html: itemQuest.upload_text }}></span>

                                      }
                                    </div>
                                    <div className="row d-flex mt-3">
                                      <div className="col-lg-12">
                                        <a className="submit-growth " style={{ cursor: "pointer" }} onClick={() => openImage()} rel="noreferrer" target="_blank">
                                          <span className="" >
                                            <span>{t('textBtnSeeScreenshot')}</span>
                                          </span>
                                          <img src={env.assets + "landingpage/assets/images/hut/arrow-right-white.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
                                        </a>
                                      </div>
                                    </div>
                                  </>
                                  :
                                  <></>
                              }

                              {
                                state.countQuestion > 0 ?
                                  <>


                                    <div className="row d-flex mt-4">
                                      
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
                                                  questionItem.question_type === 1  ?
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
                                                  :
                                                  <div className="form-check">
                                                      <label className={
                                                        answerList.point > 0
                                                          ?
                                                          "form-check-label ml-4 mt-1  text-content-label-input-green"
                                                          :
                                                            "form-check-label ml-4 mt-1 text-content-label-input-red"
                                                      }>
                                                        <span dangerouslySetInnerHTML={{ __html: answerList.answer }}></span>

                                                        {
                                                          answerList.point > 0
                                                            ?
                                                            <img height="12px" className="m-1" src={env.assets + "landingpage/assets/images/hut/true.png"} />
                                                            :
                                                           
                                                              <img height="12px" className="m-1" src={env.assets + "landingpage/assets/images/hut/false.png"} />
                                                        }
                                                      </label>
                                                    </div>
                                              )
                                            }

                                          </div>
                                        </div>
                                    )}
                                  </>
                                  :
                                  <></>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div >

          </>
      }
    </>
  );
}

export default Quest;
