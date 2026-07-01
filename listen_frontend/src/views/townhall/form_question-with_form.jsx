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
      var response = responseJsonAllFunction.data.data.map(({ id, name }) => {
        return {
          value: id,
          label: name
        }
      })
      setAllLeader(response)
      setIsLoadingHos(false)
      setIsDisabledHos(false)
    }
  }


  let getQuestion = async () => {
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
      var response = responseJson.data.data.map(({ id, question, user_question, user_function, to_leader, total_like, meLike, profile_picture }) => {
        return {
          id: id,
          question: question,
          user_question: user_question,
          user_function: user_function,
          to_leader: to_leader,
          total_like: total_like,
          meLike: meLike,
          profile_picture: profile_picture,
        }
      })
      setQuestion(response)
      setIsLoadingQuestion(false)
    }
  }


  useEffect(() => {
    getAllLeader()
    getQuestion()
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
      alert(t('textSubOurLeaders'));
      return false
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
        getQuestion()
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

  const likeAction = async (idPost, idLoop) => {
    const parameter = {
      postIdmd5: idPost,
      userId: imdlUser,
      platform_id: platform_id,
    }
    let responseJson = await axiosLibrary.postData("dialogueTownhall/likeQuestion", parameter);
    if (responseJson.status == 200) {

      var total_like = responseJson.data.total_like.total_like === undefined ? 0 : responseJson.data.total_like.total_like;

      var meLike = responseJson.data.meLike.meLike;
      //console.log("respones "+ meLike);

      let newsFeed = questionLists.slice();

      newsFeed[idLoop] = { ...questionLists[idLoop], total_like, meLike }

      //console.log(newsFeed[idLoop]);

      setQuestion(newsFeed);
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



  return (
    <div>

      <section className="page-section-2" id="leaders">

        <div className="text-center">
          <p className="text100">{t('textOurLeaders')}</p>
          <p className="subTitle">{t('textSubOurLeaders')}</p>
        </div>

        <div className="container mt-4">

          <Slider {...settingSliders} ref={slider => {
            sliderRef = slider;
          }}>
            {leaderLists.map((feeds, id) =>
              <div class="container2" key={feeds.id} onClick={handleClick.bind(this, feeds.value, feeds.label)}>
                <img src={env.assets + "_newdialogue/images/leaders/" + feeds.label + ".png"} className="img-fluid img-thumbnail image2" id="img-leader" role="button"
                />
                <div class="middle2">
                  <div class="text2">{t('textAskMeAnything')}</div>
                </div>
              </div>
            )}
          </Slider>


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

                    <div className="col-md-2"></div>
                    <div className="col-md-8 p-4">
                      <form id="czfrom" onSubmit={validateImage} method="post" style={{ display: "block" }} >

                        <div className="card mt-4 mb-4 p-4 bgWhite">

                          <div className="text-center">
                            <p className="text100">{t('textSubmitYourQuestion')}</p>
                            <p className="subTitle">{t('textOurAskOurLeadershipTeamAnything!')}</p>
                          </div>

                          <div className="mb-3 row">
                            <label htmlFor="staticEmail" className="col-sm-3 col-form-label">{t('textTo')}</label>
                            <div className="col-sm-9">

                              {textLeaderIdChoose === 0 ? t('textSubOurLeaders') : textLeaderNameChoose}
                            </div>
                          </div>
                          <div className="mb-3 row">
                            <label htmlFor="inputPassword" className="col-sm-3 col-form-label">{t('textQuestion')}</label>
                            <div className="col-sm-9">
                              <textarea className="form-control" id="question" name="question" required onChange={handleInputChange} ref={questionTextarea} />
                            </div>
                          </div>

                          {
                            isTextSuccessSubmit ?

                              <div className="mb-3 row">
                                <label htmlFor="inputPassword" className="col-sm-3 col-form-label"></label>
                                <div className="col-sm-9">
                                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                                    {t('textSubmitSuccess')}
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

            {
              isLoadingQuestion ?

                <center>
                  <img src={env.assets + "_newdialogue/images/loading.gif"} height="100px" />
                </center>

                :
                questionLists.map((feeds, id) =>

                  <div className="col-md-6" key={feeds.id}>
                    <div className="card mb-4 p-4 commentDiv">
                      <div className="pre-submitted-question-page-alt4eng-frame4273205871">
                        <img src={feeds.profile_picture ? feeds.profile_picture : env.assets + "_newdialogue/images/user-circle.png"} onError={addDefaultSrcImg} className="pre-submitted-question-page-alt4eng-rectangle121" />
                        <div className="pre-submitted-question-page-alt4eng-text224">
                          <span className="pre-submitted-question-page-alt4eng-text225">
                            <span>{feeds.user_question} ({feeds.user_function})</span>
                          </span>
                          <span className="">
                            <span className="pre-submitted-question-page-alt4eng-text227">{t('textTo')} : </span>
                            <span className="pre-submitted-question-page-alt4eng-text228">{feeds.to_leader}</span>
                          </span>
                        </div>

                        <button className={feeds.meLike ? "pre-submitted-question-page-alt4eng-button-upvote1" : "pre-submitted-question-page-alt4eng-button-upvote5"}
                          onClick={likeAction.bind(this, feeds.id, id)}
                        >
                          <img src={feeds.meLike ? env.assets + "_newdialogue/images/like-blue.png" : env.assets + "_newdialogue/images/like.png"} className="pre-submitted-question-page-alt4eng-thumbup1" />

                          <span className="pre-submitted-question-page-alt4eng-text229">
                            <span>{feeds.total_like}</span>
                          </span>
                        </button>



                      </div>
                      <span className="pre-submitted-question-page-alt4eng-text266 mt-2">
                        <span>
                          {feeds.question}
                        </span>
                      </span>
                    </div>
                  </div>

                )}

          </div>
        </div>
      </section>
    </div>

  )
}

export default FormQuestion;