import React, {
  useEffect, useState
} from 'react';

import { env, securityData } from '../../helpers/globalHelper.js';

import '../../i18n.js'
import InfiniteScroll from 'react-infinite-scroller';
import axiosLibrary from '../../helpers/axiosLibrary';

import { useTranslation } from "react-i18next";




function ListQuestion() {

  const { t, i18n: { changeLanguage, language } } = useTranslation();

  const [questionLists, setQuestion] = useState([])


  const user_id = securityData.Security_UserId();
  const [items, setItems] = useState([])
  const platform_id = securityData.Security_getPlatformId();

  const [isLoadingHos, setIsLoadingQuestion] = useState(true)

  const limit = 100
  const offset = 0
  const category = ""
  
  let getQuestion = async () => {
    let responseJson = await axiosLibrary.postData('GetMd5', { id: platform_id });
    if (responseJson.data.data !== "") {


      const credentials = {
        platform_id: platform_id,
        limit: limit,
        offset: offset,
        category: category
      };

      let responseJson = await axiosLibrary.postData('dialogueTownhall/QuestionListData',
        credentials
      );
      var response = responseJson.data.data.map(({ id, question, user_question, user_function, to_leader, total_like }) => {
        return {
          id: id,
          question: question,
          user_question: user_question,
          user_function: user_function,
          to_leader: to_leader,
          total_like: total_like
        }
      })
      setQuestion(response)
      setIsLoadingQuestion(false)
    }
  }

  useEffect(() => {
    getQuestion()
  }, [])

  return (


    <section className="page-section-2" id="list-submit">

      <div className="text-center">
        <p className="text100">{t('textSeeSubmittedQuestions')}</p>
        <p className="subTitle">{t('textClickLikeButtonifYouHaveSimilarQuestion')}</p>
      </div>

      <div className="container mt-4">

        <div className="row" >


          {questionLists.map((feeds, id) =>

          <div className="col-md-6"  key={feeds.id}>
            <div className="card mt-4 mb-4 p-4 commentDiv">
              <div className="pre-submitted-question-page-alt4eng-frame4273205871">
                <img alt="Rectangle12I122" src={env.assets + "_newdialogue/images/user-circle.png"} className="pre-submitted-question-page-alt4eng-rectangle121" />
                <div className="pre-submitted-question-page-alt4eng-text224">
                  <span className="pre-submitted-question-page-alt4eng-text225">
                    <span>{feeds.user_question} (People &amp; Culture)</span>
                  </span>
                  <span className="pre-submitted-question-page-alt4eng-text227">
                    <span>To: Ivan Cahyadi</span>
                  </span>
                </div>
                <button className="pre-submitted-question-page-alt4eng-button-upvote1">
                  <img src={env.assets + "_newdialogue/images/like-blue.png"} className="pre-submitted-question-page-alt4eng-thumbup1" />

                  <span className="pre-submitted-question-page-alt4eng-text229">
                    <span>{feeds.total_like}</span>
                  </span>
                </button>
              </div>
              <span className="pre-submitted-question-page-alt4eng-text266 mt-4">
                <span>
                  Lorem ipsum dolor sit amet consectetur. Massa vulputate
                  eleifend vitae duis vel purus. Tortor fringilla
                  facilisis sagittis mi. Egestas ut id blandit tortor
                  justo fringilla amet volutpat vulputate. Aenean in
                  integer vestibulum molestie justo.
                </span>
              </span>
            </div>
          </div>

          )}

        </div>
      </div>
    </section>

  )
}

export default ListQuestion;