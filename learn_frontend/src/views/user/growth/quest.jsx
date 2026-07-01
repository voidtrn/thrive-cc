import React, { useCallback, useEffect, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import routeAll from '../../../helpers/route';
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import defaultLang from '../../../helpers/lang';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../../../views/user/shared/navMenu';
import { useHistory } from '../../../helpers/useHistory';
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
    stageStatus: false,
    questStatus: false,
    sudahDikerjakan: false,
    stageStatusName: "",
    isThanks: false,
    countQuestion: 0,
  });

  const reader = new FileReader()
  const fileInput = React.createRef()
  const history = useHistory();

  const routeUser = routeAll.routesUser

  const [itemQuest, setItemQuest] = useState([])


  const [invalidImage, setInvalidImage] = useState(false)
  const [questionItems, setQuestionItems] = useState([])
  const [questItems, setQuestItems] = useState([])
  const [buttonLoading, setButtonLoading] = useState(false)
  const [file, setFile] = useState(null)

  const [itemsInput, setItemsInput] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const { t, i18n: { changeLanguage, language } } = useTranslation();
  const user_id = securityData.Security_UserId()



  useEffect(() => {
    //cekDoneOrChallengeExpired();
    //getDateChallenge();
    getQuestDetail();
    getQuestionList();
    ListQuestByQuarterId();
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
          stageStatus: response.data.stageStatus,
          questStatus: response.data.questStatus,
          sudahDikerjakan: response.data.sudahDikerjakan,
          countQuestion: response.data.countQuestion,
          stageStatusName: response.data.stageStatusName,
        });

        setLoading(false)

        if (response.data.sudahDikerjakan) {

          const questId = new URLSearchParams(props.location.search).get('questId');
          const quarterId = new URLSearchParams(props.location.search).get('quarterId');

          history.push(routeAll.routesUser.QuestAnswered.path + "?questId=" + questId + "&quarterId=" + quarterId);
        }


      } else {
        alert(response);
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [props.location.search])



  const getQuestionList = useCallback(async () => {
    const credentials = {
      limit: 10,
      offset: 0,
      category: "",
      questId: new URLSearchParams(props.location.search).get('questId')
    };

    let isi = await axiosLibrary.postData('awbGrowth/ListQuestionByQuestId', credentials);
    setQuestionItems(isi.data.data)
  }, [])



  const ListQuestByQuarterId = useCallback(async () => {
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
      submit();
      return true
    }
  }

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

  const returnNumber = (text) => {
    if (text) {
      let teksSbtr = text;
      let hasil = teksSbtr.substr(0, 3); 
      return hasil;
    }
    return "";    
  }

  const returnTtitleText = (text) => {   
    if (text) {
      let teksSbtr = text;
      let hasil = teksSbtr.substr(3); 
      return hasil;
    }
    return "";
  }


  const submit = async () => {

    setLoadingSubmit(true)

    const fd = new FormData();

    const questId = new URLSearchParams(props.location.search).get('questId');
    const quarterId = new URLSearchParams(props.location.search).get('quarterId');

    fd.append("questId", questId);
    fd.append("quarterId", quarterId);
    fd.append("user_id", user_id);

    for (var i = 0; i < itemsInput.length; i++) {
      fd.append("pertanyaan_" + itemsInput[i].name, itemsInput[i].value);
    }

    fd.append('answer', JSON.stringify(itemsInput));

    if (itemQuest.upload_score > 0) {
      const IsFileAttached = fileInput.current.files.length > 0;
      if (IsFileAttached) {
        fd.append("file_upload", fileInput.current.files[0]);
      }
    }

    let responseJson = await axiosLibrary.postData("awbGrowth/AnswerQuest", fd);

    if (responseJson.status === 200) {

      setState({ ...state, isThanks: true, isQuestionVisible: false });
      ListQuestByQuarterId();

      history.push(routeAll.routesUser.QuestAnswered.path + "?questId=" + questId + "&quarterId=" + quarterId);
    }
    else {

      alert(responseJson);
      setLoadingSubmit(false)
    }
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
                            <span dangerouslySetInnerHTML={{ __html: t('textBack') == 'Back' ? itemQuest.description_eng : itemQuest.description }}>
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    {
                      state.canAccessByDate ?

                        state.stageStatus ?

                          state.questStatus ?

                        <form id="czfrom" onSubmit={validateImage} method="post" style={{ display: "block" }} encType='multipart/form-data'>

                          <div className="row d-flex mt-4"></div>
                          {
                            itemQuest.article_url === "undefined" || itemQuest.article_url === "" || itemQuest.article_url === "null"  || itemQuest.article_url === null ? <></> :
                              <>
                                <div className="row d-flex">
                                  <div className="col-lg-1 title-text-black">
                                    {
                                      returnNumber(itemQuest.learning_material_text)
                                    }
                                  </div>
                                  <div className="col-lg-11 title-text-black">
                                    {
                                      t('textBack') == 'Back' ? 

                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.learning_material_text_eng) }}></span>
                                      :
                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.learning_material_text) }}></span>
                                    }
                                  </div>
                                </div>
                                <div className="row d-flex mt-3">
                                  <div className="col-lg-1 title-text-black"></div>
                                  <div className="col-lg-11 title-text-black mt-2">
                                    <a className="frame1-menit1-hari-landing-page-button-primary-button-growth" style={{ cursor: "pointer" }} onClick={() => openInNewTab(itemQuest.article_url)} rel="noreferrer" target="_blank">
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
                            itemQuest.checkbox_score <= 0 ? <></> :
                              <>
                                <div className="row d-flex mt-4"></div>
                                <div className="row d-flex">
                                  <div className="col-lg-1 title-text-black">
                                    {
                                      returnNumber(itemQuest.checkbox_text_eng)
                                    }
                                  </div>
                                  <div className="col-lg-11 title-text-black">
                                    {
                                      t('textBack') == 'Back' ? 
                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.checkbox_text_eng) }}></span>
                                                        :
                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.checkbox_text) }}></span>
                                    }
                                  </div>


                                </div>
                                <div className="row d-flex">
                                  
                                  <div className="col-lg-1 title-text-black"></div>
                                  <div className="col-lg-11 title-text-black mt-2">
                                    <div className="card card-white" style={{ padding: "10px" }}>
                                      <div className="card-body ">
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
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                          }

                          {
                            itemQuest.upload_score <= 0 ? <></> :
                              <>
                                <div className="row d-flex mt-4"></div>
                                <div className="row d-flex">
                                  <div className="col-lg-1 title-text-black">
                                    {
                                      returnNumber(itemQuest.upload_text_eng)
                                    }
                                  </div>
                                  <div className="col-lg-11 title-text-black">
                                    {
                                      t('textBack') == 'Back' ?

                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.upload_text_eng) }}></span>
                                      :
                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.upload_text) }}></span>
                                    }
                                  </div>
                                </div>
                                <div className="row d-flex">
                                  <div className="col-lg-1 title-text-black"></div>
                                  <div className="col-lg-11 title-text-black mt-2">
                                    <div className="card card-white" style={{ padding: "10px" }}>
                                      <div className="card-body ">
                                        <div className="row d-flex ">
                                          <div className="form-check">

                                            <input type="file" required
                                              name="file_upload" id="file_upload" size="40" accept="image/jpg,image/png,image/jpeg" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />

                                            <span className='badge bg-primary' id="upload-name" name="upload-name">{itemQuest.file_upload === "" ? "images" : itemQuest.file_upload}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                          }

                          {
                            state.countQuestion > 0 ?
                              <>
                                <div className="row d-flex mt-4"></div>
                                <div className="row d-flex">
                                  <div className="col-lg-1 title-text-black">
                                    {
                                      returnNumber(itemQuest.question_text_eng)
                                    }
                                  </div>
                                  <div className="col-lg-11 title-text-black">
                                    {
                                      t('textBack') == 'Back' ? 
                                      
                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.question_text_eng) }}></span>
                                      :
                                      <span dangerouslySetInnerHTML={{ __html: returnTtitleText(itemQuest.question_text) }}></span>

                                    }
                                  </div>

                                </div>

                                <div className="row d-flex">
                                  <div className="col-lg-1"></div>
                                  <div className="col-lg-11 title-text-black mt-2">
                                    <div className="card card-white" style={{ padding: "10px" }}>
                                      <div className="card-body ">
                                        <div className="row d-flex ">

                                          <LoadingDataButton loading={buttonLoading} />

                                          <div style={cssTarget(buttonLoading)}> </div>
                                        </div>
                                        <div className="row d-flex  mb-4">
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
                                            questionItem.question_type == 1  ?
                                              <div className="row d-flex mb-4" key={i}>
                                                <div className="col-lg-1 text-blue-growth" key={i}>
                                                  {++i}.
                                                </div>
                                                <div className="col-lg-11 title-text-black">
                                                  
                                                <div className="row">
                                                  <span className=" text-content mb-4">
                                                    {
                                                      state.selectLanguageQuestion == 'eng' ?

                                                        <span dangerouslySetInnerHTML={{ __html: questionItem.question_eng }}></span>
                                                        :
                                                        <span dangerouslySetInnerHTML={{ __html: questionItem.question }}></span>
                                                    }
                                                  </span>
                                                  </div>
                                                  
                                                  {
                                                    questionItem.answer.map(
                                                      (answerList) =>

                                                        <div className="form-check ">
                                                        <div className="row">
                                                        
                                                        <div className="col-lg-1">
                                                        <input
                                                        type="radio"
                                                        className="form-check-input vertical-align-text-top mt-1"
                                                        id={"answer_" + answerList.id}
                                                        name={"question_" + answerList.awb_growth_question_id}
                                                        value={answerList.id}
                                                        onChange={handleChange.bind(this)}
                                                        required="required"
                                                        />
                                                        </div>
                                                        
                                                        <div className="col-lg-11">
                                                        <label className="form-check-label text-content-label-input" for={"answer_" + answerList.id}>
                                                        {
                                                          state.selectLanguageQuestion == 'eng' ?
                                                      
                                                          <span dangerouslySetInnerHTML={{ __html: answerList.answer_eng }}></span>
                                                          :
                                                          <span dangerouslySetInnerHTML={{ __html: answerList.answer }}></span>
                                                        }
                                                        </label>
                                                      </div>
                                                      </div>
                                                      </div>
                                                    )
                                                  }

                                                </div>
                                              </div>
                                            :
                                            <>
                                              <div className="row d-flex mb-4" key={i}>
                                                <div className="col-lg-1 text-blue-growth" key={i}>
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
                                                </div>
                                              </div>
                                              
                                              <div className="row d-flex mb-4" key={i}>
                                                <div className="col-lg-1 text-blue-growth" key={i}></div>
                                                <div className="col-lg-11 title-text-black">
                                                  <textarea onChange={handleChange.bind(this)}  type="text" required className="form-control" name={"answer_text_"+questionItem.id} id="inputEmail3" minlength={questionItem.min_character_answer}/>
                                                </div>
                                              </div>

                                            </>
                                        )}


                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                              :
                              <></>
                          }



                          <div className="row d-flex mb-4 mt-4">
                            <div className="col-lg-12 text-end">
                              {
                                loadingSubmit ?
                                    <img src={`${env.assets}img/loading.gif`} style={{ width: "50px", marginBottom: '40px' }} />
                                  :
                                    <button type="submit" className="submit-growth" name="btnSubmit" value="save">
                                      submit
                                    </button>
                              }
                                  </div>
                            </div>
                        </form>
                            :
                              
                              <div className="container page-section" id="access-idp">
                                <div className="card card-white" style={{ padding: "10px" }}>
                                  <div className="card-body ">
                                    <div className="row d-flex "></div>
                                     <span dangerouslySetInnerHTML={{ __html: t('alertBeforeQuest') }}></span>
                                  </div>
                                </div>
                              </div>
                          :

                              <div className="container page-section" id="access-idp">
                                <div className="card card-white" style={{ padding: "10px" }}>
                                  <div className="card-body ">
                                    <div className="row d-flex "></div>
                                    <span dangerouslySetInnerHTML={{ __html: t('alertBeforeStage1') }}></span> <b>{state.stageStatusName}</b>
                                    <span dangerouslySetInnerHTML={{ __html: t('alertBeforeStage2') }}></span>
                                  </div>
                                </div>
                              </div>
                        :




                        <div className="container page-section" id="access-idp">
                          <div className="card card-white" style={{ padding: "10px" }}>
                            <div className="card-body ">
                              <div className="row d-flex "></div>
                              <span dangerouslySetInnerHTML={{ __html: t('textQuestLocked') }}></span> 
                              <br/>
                              <span dangerouslySetInnerHTML={{ __html: t('textQuestAccessPeriod') }}></span> {itemQuest.startDateDMY}
                            </div>
                          </div>
                        </div>

                    }


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
