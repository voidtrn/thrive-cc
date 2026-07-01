import React, {
  useEffect, useState, useRef
} from 'react';

import { env, securityData } from '../../helpers/globalHelper.js';
import axiosLibrary from '../../helpers/axiosLibrary';

import '../../i18n.js'

import Select from 'react-select';
import { useTranslation } from "react-i18next";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Image } from 'react-bootstrap';


import 'use-bootstrap-select/dist/use-bootstrap-select.css'
import UseBootstrapSelect from 'use-bootstrap-select'
import makeAnimated from 'react-select/animated';

function FormQuestion(props) {

  const [isLoadingHos, setIsLoadingHos] = useState(true)
  const [isDisabledHos, setIsDisabledHos] = useState(true)

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false)
  const [isTextSuccessSubmit, setIsTextSuccessSubmit] = useState(false)
  const [isTextFailedSubmit, setIsTextFailedSubmit] = useState(false)
  const [textLeaderFailed, setTextFailed] = useState("")

  const [textLeaderNameChoose, setTextLeaderNameChoose] = useState()
  const [textLeaderIdChoose, setTextLeaderIdChoose] = useState(0)

  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)

  const { t, i18n: { changeLanguage, language } } = useTranslation();

  const [invalidImage, setInvalidImage] = useState(false)

  const limit = 100
  const offset = 0
  const category = ""

  const [idActiveForm, setIdActiveForm] = useState(1)
  const [isClickablePhoto, setClickablePhoto] = useState(0)

  const user_id = securityData.Security_UserId();
  const [items, setItems] = useState([])
  const platform_id = securityData.Security_getPlatformId();

  const imdlUser = securityData.Security_UserId();
  const nameUser = securityData.Security_UserName();
  const functionUser = securityData.Security_UserDirectorate_3();

  const [leaderLists, setAllLeader] = useState([])
  const [optionSelectedQuestion, setOptionSelectedQuestion] = useState({})

  const [questionLists, setQuestion] = useState([])

  const animatedComponents = makeAnimated();
  const getAllLeader = async () => {
    let responseJson = await axiosLibrary.postData('GetMd5', { id: platform_id });
    if (responseJson.data.data !== "") {


      const credentials = {
        platform_id: platform_id,
        limit: limit,
        offset: offset,
        category: category
      };

      let responseJsonAllFunction = await axiosLibrary.postData('dialogueTownhall/LeaderListData',
        credentials
      );
      var response = responseJsonAllFunction.data.data.map(({ id, name, photo }) => {
        return {
          value: id,
          label: name,
          photo_png: photo
        }
      })
      setAllLeader(response)
      setIdActiveForm(responseJsonAllFunction.data.id_form_active)
      setClickablePhoto(responseJsonAllFunction.data.is_clickable_photo)
      setIsLoadingHos(false)
      setIsDisabledHos(false)

      //console.log("idActiveForm = "+ idActiveForm);
      //console.log("responseJson.id_form_active = "+responseJsonAllFunction.data.id_form_active);
    }
  }


  let getQuestion = async (isStateLoading = true) => {
    isStateLoading ? setIsLoadingQuestion(true) : setIsLoadingQuestion(false)

    let responseJson = await axiosLibrary.postData('GetMd5', { id: platform_id });
    if (responseJson.data.data !== "") {

      const credentials = {
        platform_id: platform_id,
        imdl: imdlUser,
        limit: limit,
        offset: offset,
        category: category
      };

      let responseJson = await axiosLibrary.postData('dialogueTownhall/QuestionListData',
        credentials
      );

      setQuestion(responseJson.data.data)
      setIsLoadingQuestion(false)
    }
    else {
      setIsLoadingQuestion(false)

    }
  }


  useEffect(() => {
    getAllLeader()
    getQuestion(true)
  }, [])

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.name;

    var stateCopy = Object.assign({}, items);
    stateCopy[key] = value;
    //console.log(stateCopy);
    setItems(stateCopy)
  }

  const validateImage = (e) => {
    e.preventDefault();
    if (textLeaderIdChoose == 0) {
      if (isClickablePhoto == 1) {
        alert(t('textSubOurLeaders'));
        return false;
      }
      else {
        submit();
        return true;
      }
    } else {
      submit();
      return true
    }
  }

  const submit = async () => {

    setIsLoadingSubmit(true)
    setIsTextSuccessSubmit(false)
    setIsTextFailedSubmit(false)
    setIsLoadingQuestion(true)

    const fd = new FormData();

    fd.append("question", items.question);
    fd.append("to_leader", textLeaderIdChoose);
    fd.append("user_question", nameUser);
    fd.append("user_function", functionUser);

    fd.append("user_created", imdlUser);
    fd.append("platform_id", platform_id);
    fd.append("townhall_section_id", idActiveForm);

    let responseJson = await axiosLibrary.postData("dialogueTownhall/SubmitQuestion", fd);

    if (responseJson.status === 200) {

      if (responseJson.data.data) {


        setTextLeaderNameChoose(t('textOurLeaders'));
        setTextLeaderIdChoose(0);


        setIsLoadingSubmit(false)
        document.getElementById("czfrom").reset();
        setIsTextSuccessSubmit(true)
        setIsLoadingQuestion(false)
        setIsTextFailedSubmit(false)
        getQuestion(true)
      }
      else {

        setIsLoadingSubmit(false)
        setIsTextSuccessSubmit(false)
        setIsLoadingQuestion(false)

        setIsTextFailedSubmit(true)
        setTextFailed(responseJson.data.message)
      }
    }
    else {

      setIsLoadingSubmit(false)
      setIsTextSuccessSubmit(false)
      setIsLoadingQuestion(false)

      setIsTextFailedSubmit(true)
      setTextFailed(responseJson.message)
    }


  }

  const addDefaultSrcImg = async (e) => {
    e.target.src = env.assets + "_newdialogue/images/user-circle.png";
  }

  const likeAction = async (idPost, idLoop, idLoop2) => {
    const parameter = {
      postIdmd5: idPost,
      userId: imdlUser,
      platform_id: platform_id,
    }
    let responseJson = await axiosLibrary.postData("dialogueTownhall/likeQuestion", parameter);
    if (responseJson.status == 200) {

      var total_like = responseJson.data.total_like.total_like === undefined ? 0 : responseJson.data.total_like.total_like;

      var meLike = responseJson.data.meLike.meLike;
      console.log("respones " + meLike);

      let newsFeed = questionLists.slice();

      //newsFeed[idLoop] = { ...questionLists[idLoop],...questionLists.dataQuestion[idLoop2], total_like, meLike }

      console.log(newsFeed);

      getQuestion(false)
    }
  }

  const questionTextarea = useRef(null);

  const settingSliders = {
    dots: true,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 10000,
    rows: 5,
    slidesPerRow: 5,
  };


  let sliderRef = useRef(null);
  const next = () => {
    sliderRef.slickNext();
  };
  const previous = () => {
    sliderRef.slickPrev();
  };

  const skills = () => document.getElementById('form-submit');
  const handleClick = async (leaderId, LeaderName) => {
    setTextLeaderNameChoose(LeaderName);
    setTextLeaderIdChoose(leaderId);
    skills().scrollIntoView({ behavior: 'smooth' })
    questionTextarea.current.focus();


    setIsTextSuccessSubmit(false)
    setIsTextFailedSubmit(false)

  }

   const handleClick2 = async (leaderId, LeaderName) => {
    skills().scrollIntoView({ behavior: 'smooth' })
    questionTextarea.current.focus();
    setIsTextSuccessSubmit(false)
    setIsTextFailedSubmit(false)

  }




  return (
    <div>

      <section className="page-section-2" id="leaders">

        <div className="text-center">
          <p className="text100">{t('textOurLeaders')}</p>
          {
            isClickablePhoto === 1 ?
              <p className="subTitle">{t('textSubOurLeaders')}</p>

              :
              <></>
          }
        </div>

        <div className="container mt-4">

          {
            isClickablePhoto === 1 ?
              <Slider {...settingSliders} ref={slider => {
                sliderRef = slider;
              }}>
                {leaderLists.map((feeds, id) =>

                  <div className="container2" key={id} onClick={handleClick.bind(this, feeds.value, feeds.label)}>
                    <img src={env.userDocument +"leaders/"+ feeds.photo_png} className="img-fluid img-thumbnail image2" id="img-leader" role="button"
                    />
                    <div className="middle2">
                      <div className="text2">{t('textAskMeAnything')}</div>
                    </div>
                  </div>
                )}
              </Slider>

              :
              <Slider {...settingSliders} ref={slider => {
                sliderRef = slider;
              }}>
                {leaderLists.map((feeds, id) =>

                  <div className="container2" key={id} onClick={handleClick2.bind(this)}>
                    <img src={env.userDocument +"leaders/"+ feeds.photo_png} className="img-fluid img-thumbnail" id="img-leader"
                    />
                    <div className="middle2">
                    </div>
                  </div>
                )}
              </Slider>

          }



          <div className='mt-4 '>
            <div className='pre-submitted-question-page-alt4eng-pagination1 mt-4 '>
              <div className="pre-submitted-question-page-alt4eng-pagination2  mt-4 ">
                <div className="pre-submitted-question-page-alt4eng-frame427320667" onClick={previous}>
                  <div className="pre-submitted-question-page-alt4eng-icon-fillchevronleft">
                    <img alt="MaskI122" src={env.assets + "_newdialogue/images/left.png"} className="pre-submitted-question-page-alt4eng-mask1" />
                  </div>
                  <span className="pre-submitted-question-page-alt4eng-text202">
                    <span>{t('textPrev')}</span>
                  </span>
                </div>
                <div className="pre-submitted-question-page-alt4eng-frame427320668" onClick={next}>
                  <span className="pre-submitted-question-page-alt4eng-text204">
                    <span>{t('textNext')}</span>
                  </span>
                  <div className="pre-submitted-question-page-alt4eng-icon-fillchevronright">
                    <img alt="MaskI122" src={env.assets + "_newdialogue/images/right.png"} className="pre-submitted-question-page-alt4eng-mask2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

      <section className="page-section-2" id="form-submit">
        <div className="container " id=" ">

          <div className="row">
            <div className="col-md-12">
              <div className="">
                <div className="container mt-4 p-4" style={{ background: "linear-gradient(to right, #C8C8C8, #009DE4, #D4AAD1)", borderRadius: "10px" }}>

                  <div className="row" >
                    {
                      idActiveForm === 0 ?
                        <>
                          <div className="col-md-2"></div>
                          <div className="col-md-8 p-4 text-center">
                            <p className="text100-sub">{t('textCloseForm')}</p>
                          </div>
                          <div className="col-md-2"></div>
                        </>

                        :
                        <>
                          <div className="col-md-2"></div>
                          <div className="col-md-8 p-4">
                            <form id="czfrom" onSubmit={validateImage} method="post" style={{ display: "block" }} >

                              <div className="card mt-4 mb-4 p-4 bgWhite">

                                <div className="text-center">
                                  <p className="text100">{t('textSubmitYourQuestion')}</p>

                                  {
                                    isClickablePhoto === 1 ?
                                      <p className="subTitle">{t('textOurAskOurLeadershipTeamAnything!')}</p>

                                      :
                                      <>
                                      <p className="subTitle"><div dangerouslySetInnerHTML={{ __html: t('textOurAskOurLeadershipTeamAnything!2') }} /></p>
                                      <br/>
                                      </>
                                  }


                                </div>

                                {
                                  isClickablePhoto === 1 ?
                                    <div className="mb-3 row">
                                      <label htmlFor="staticEmail" className="col-sm-3 col-form-label">{t('textTo')}</label>
                                      <div className="col-sm-9">

                                        {textLeaderIdChoose === 0 ? t('textSubOurLeaders') : textLeaderNameChoose}
                                      </div>
                                    </div>
                                    :
                                    <></>

                                }
                                <div className="mb-3 row">
                                  <label htmlFor="inputPassword" className="col-sm-3 col-form-label">{t('textQuestion')}</label>
                                  <div className="col-sm-9">
                                    <textarea className="form-control" rows="5" id="question" name="question" required onChange={handleInputChange} ref={questionTextarea} />
                                  </div>
                                </div>

                                {
                                  isTextSuccessSubmit ?

                                    <div className="mb-3 row">
                                      <label htmlFor="inputPassword" className="col-sm-3 col-form-label"></label>
                                      <div className="col-sm-9">
                                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                                          {t('textSubmitSuccess')}
                                          {
                                            isClickablePhoto == 0 ?
                                            <div dangerouslySetInnerHTML={{ __html: t('textSubmitSuccess2') }} />
                                              :
                                              <></>
                                          }
                                          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </div>
                                      </div>
                                    </div>
                                    :
                                    <span></span>
                                }

                                {
                                  isTextFailedSubmit ?

                                    <div className="mb-3 row">
                                      <label htmlFor="inputPassword" className="col-sm-3 col-form-label"></label>
                                      <div className="col-sm-9">
                                        <div className="alert alert-warning alert-dismissible fade show" role="alert">
                                          {textLeaderFailed} {t('textMorethan9')}
                                          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </div>
                                      </div>
                                    </div>

                                    :
                                    <span></span>
                                }

                                <div className="mb-3 row">
                                  <label htmlFor="inputPassword" className="col-sm-3 col-form-label"></label>
                                  <div className="col-sm-9">

                                    <button type="submit" className="pre-submitted-question-page-alt4eng-button-primary-button2" name="btnSubmit" value="save">{isLoadingSubmit ? 'Loading ... ' : t('textSubmit')}</button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                          <div className="col-md-2"></div>
                        </>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="page-section-2" id="list-submit">

        <div className="text-center">
          <p className="text100">{t('textSeeSubmittedQuestions')}</p>
          <p className="subTitle">{t('textClickLikeButtonifYouHaveSimilarQuestion')}</p>
        </div>

        <div className="container mt-4">

          <div className="row" >
            <div className="accordion" id="accordionExample">

              {
                isLoadingQuestion ?

                  <center>
                    <img src={env.assets + "_newdialogue/images/loading.gif"} height="100px" />
                  </center>

                  :
                  questionLists.map((feeds, id) =>
                    <div className="accordion-item" key={id}>
                      <h2 className="accordion-header" id={"heading" + feeds.sectionId}>
                        <button class={feeds.isActive === 1 ? "accordion-button " : "accordion-button collapsed"} type="button" data-bs-toggle="collapse" data-bs-target={"#collapse" + feeds.sectionId} aria-expanded={feeds.isActive === 1 ? "false" : "false"} aria-controls={"collapse" + feeds.sectionId}>
                          {feeds.sectionName}
                        </button>
                      </h2>
                      <div id={"collapse" + feeds.sectionId} class={feeds.isActive === 1 ? "accordion-collapse collapse show" : "accordion-collapse collapse"} aria-labelledby={"heading" + feeds.sectionId} data-bs-parent="#accordionExample">
                        <div className="accordion-body">
                          <div className="row" >

                            {
                              feeds.dataQuestion.map((feeds2, id2) =>

                                <div className="col-md-6" key={id2}>
                                  <div className="card mb-4 p-4 commentDiv">
                                    <div className="pre-submitted-question-page-alt4eng-frame4273205871">
                                      <img src={feeds2.profile_picture ? feeds2.profile_picture : env.assets + "_newdialogue/images/user-circle.png"} onError={addDefaultSrcImg} className="pre-submitted-question-page-alt4eng-rectangle121" />

                                      {
                                        feeds2.is_clickable_photo === 1 ?

                                          <div className="pre-submitted-question-page-alt4eng-text224">
                                            <span className="pre-submitted-question-page-alt4eng-text225">
                                              <span>{feeds2.user_question} ({feeds2.user_function})</span>
                                            </span>
                                            <span className="">
                                              <span className="pre-submitted-question-page-alt4eng-text227">{t('textTo')} : </span>
                                              <span className="pre-submitted-question-page-alt4eng-text228">{feeds2.to_leader}</span>
                                            </span>
                                          </div>
                                          :
                                          <div className="pre-submitted-question-page-alt4eng-text224">
                                            <span className="pre-submitted-question-page-alt4eng-text225">
                                              <span>{feeds2.user_question}</span>
                                            </span>
                                            <span className="">
                                              <span className="pre-submitted-question-page-alt4eng-text228">{feeds2.user_function}</span>
                                            </span>
                                          </div>

                                      }



                                      <button className={feeds2.meLike ? "pre-submitted-question-page-alt4eng-button-upvote1" : "pre-submitted-question-page-alt4eng-button-upvote5"}
                                        onClick={likeAction.bind(this, feeds2.id, id, id2)}
                                      >
                                        <img src={feeds2.meLike ? env.assets + "_newdialogue/images/like-blue.png" : env.assets + "_newdialogue/images/like.png"} className="pre-submitted-question-page-alt4eng-thumbup1" />

                                        <span className="pre-submitted-question-page-alt4eng-text229">
                                          <span>{feeds2.total_like}</span>
                                        </span>
                                      </button>



                                    </div>
                                    <span className="pre-submitted-question-page-alt4eng-text266 mt-2">
                                      <span>
                                        {feeds2.question}
                                      </span>
                                    </span>
                                  </div>
                                </div>

                              )}


                          </div>
                        </div>
                      </div>
                    </div>
                  )}

            </div>
          </div>
        </div>
      </section >
    </div >

  )
}

export default FormQuestion;