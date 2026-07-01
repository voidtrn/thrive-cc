// This file is for the library of all popups
// every function is declared in the master js folder user
// by default the popup is rendered but it is hidden
// to display the popup, you must pass the global state and then trigger it with the properties "modalProp: true" and "type: <depending on which type of popup you want to display>"
// so far after development migrated to aws, this popup is only called on viewall, viewcourse, home, search, learning plan and training pages
// documentation created by syofian and can change at any time 

import React, { 
    useContext,
    useEffect,
    useState
  } from 'react';
import { Card, Modal } from 'react-bootstrap';
import axiosLibrary from '../helpers/axiosLibrary';
import { env, securityData } from '../helpers/globalHelper';
import GlobalState from '../helpers/globalState';
import defaultLang from '../helpers/lang';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { isMobile } from 'react-device-detect';
import moment from 'moment';
import { cssTarget, LoadingDataButton, LoadingData } from './Loading';
import routeAll from '../helpers/route';
import {Form, Col} from 'react-bootstrap';
import CardDataModule from './cardDataModule';
import buttonExit from '../assets/img/button-exit.png';

const animatedComponents = makeAnimated();

export function Alert(){

    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='alertShow'){
            setModalShow(true)
        }
        if(localStorage.getItem('showAlertPopupPrefTopic')){
            let timer = setTimeout(()=>{
                setModalShow(true)
                setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: localStorage.getItem('showAlertPopupPrefTopic'), needSubtitle:false, messageSubtitlePopup:""}}))
            },2000)
            return () => {
                clearTimeout(timer)
            }
            
        }
    },[global.modalProp])

    const closeModal = () =>{
        localStorage.removeItem('showAlertPopupPrefTopic')
        setModalShow(false)
        setGlobal(global => ({...global, modalProp:{modalShow:false, id:null, type: 'alertShow'},_PlaySoundFile:{}}))
    }

    return (
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
        >
            <Modal.Header style={{border:0}}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" style={{margin:'-0.2rem -1rem -1rem auto'}} onClick={()=>closeModal()}>
                    <img src={`${env.assets}img/close-btn-blue.png`}/>
                </button>                
            </Modal.Header>
            <Modal.Body 
                // style={global.modalProp.needSubtitle?{minHeight:'450px'}:null}
            >
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <h5 className="modal-title" id="myModalTitle" style={{marginBottom:0}}>{global.modalProp.messageTitlePopup}</h5>
                        {global.modalProp.needSubtitle?
                            <div> 
                                <h4 style={{display:global.modalProp.needSubtitle?'block':'none', fontSize:'15px', margin:'20px 15px 0'}}>
                                    Question Summary
                                </h4>
                                    {global.modalProp.messageSubtitlePopup}
                            </div>
                        : null}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer style={{border:0, justifyContent:'flex-start'}}>
                <a tabIndex="0" role="button" data-dismiss="modal" className="btn popup-btn-message" onClick={()=>closeModal()} style={{position:'unset'}}>close</a>
            </Modal.Footer>
        </Modal>
    )
}

export function PopupShareArticle(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
        if(global.modalProp.modalShow && (global.modalProp.type==='article' || global.modalProp.type==='course')){
            setLoading(true)
            setModalShow(true)
        }
    },[global.modalProp])

    const getListUser = async()=>{

        let response = await axiosLibrary.postData("awbUser/ListData",{platform_id: securityData.Security_getPlatformId()})
        if(response.status===200){
            if(response.data.data.length > 0){

                let FilteredDataEmp = response.data.data.filter(v => 
                    !v.account.includes("a-") && 
                    !v.account.includes("g-") && 
                    !v.account.includes("s-") && 
                    !v.account.includes("b-") && 
                    !v.account.includes("S-") && 
                    !v.account.includes("G-") && 
                    !v.account.includes(securityData.Security_UserAccount())
                )

                FilteredDataEmp = FilteredDataEmp.map(({id, account, name})=>{
                    return {
                        value: id,
                        label: '( '+account+' ) '+name
                    }
                });
                setGlobal(global=>({
                    ...global, 
                    optionUser: FilteredDataEmp,
                    isLoadingUser:false
                }))
                
            }
        }
        
    }

    const getArticleDetail = async () => {
        const type = global.modalProp.type
        let response = await axiosLibrary.postData(type==='article'?"awbHome/GetArticleDetail":"awbViewCourse/getCourseDetail",{id:global.modalProp.id})
        if(response.status===200){
            let articleContent = {
                shareArticleTitle: '',
                btnArticleTitle:''
            }
            articleContent = {
                shareArticleTitle: 
                                    // type==='article'? 
                                    // defaultLang.lang.shareArticleTitleValidate.replace('[variable1]',0) 
                                    // : 
                                    defaultLang.lang.shareCourseTitleValidate,
                btnArticleTitle:  defaultLang.lang.btnArticleTitleValidate
            }
            setGlobal(global=>({
                ...global, 
                ...articleContent, 
                id:response.data.data[0].id,
                course_type:response.data.data[0].course_type,
                articleTitle: securityData.Security_lang()==='ENG'? response.data.data[0].title: response.data.data[0].title_ind,
                validateShareArticle: [],
                pointShareArticle: 0,
                optionSelectedUser:[]
            }))
            setLoading(false)
            // validate dihilangkan sejak enhancement awb 2.1 karena sekarang sudah ada refferal code

            // let responseValidate = await axiosLibrary.postData(type==='article'?"awbHome/ValidateShareArticle":"awbViewCourse/validateShareCourse",{
            //     articleIdmd5:global.modalProp.id,
            //     platform_id: securityData.Security_getPlatformId(),
            // })
            // if(responseValidate.status===200){
            //     let articleContent = {
            //         shareArticleTitle: '',
            //         btnArticleTitle:''
            //     }
            //     if(responseValidate.data.data){
            //         articleContent = {
            //             shareArticleTitle: type==='article'? 
            //                                 defaultLang.lang.shareArticleTitleValidate.replace('[variable1]',responseValidate.data.point) 
            //                                 : 
            //                                 defaultLang.lang.shareCourseTitleValidate,
            //             btnArticleTitle:  defaultLang.lang.btnArticleTitleValidate
            //         }
            //     }else{
                        // articleContent={
                        //     shareArticleTitle: defaultLang.lang.shareArticleTitleUnvalidate.replace('[variable1]',responseValidate.data.point),
                        //     btnArticleTitle:  defaultLang.lang.btnArticleTitleUnvalidate
                        // }
            //     }
            // }
        }
    }

    const loadOptions = (inputValue, callback) => {
        // perform a request
        const requestResults = global.optionUser.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue)
            ).slice(0,20)
        callback(requestResults)
    }

    const submitShareArticle = async ()=>{
        const type = global.modalProp.type
        if(global.optionSelectedUser.length>0){
            let response = await axiosLibrary.postData(type==='article'?"awbHome/SubmitShareArticle":"awbViewCourse/SubmitShareCourse",{
                platform_id:securityData.Security_getPlatformId(),
                user_id:securityData.Security_UserId(),
                trn_article_id:global.id,
                configShareArticle:global.pointShareArticle,
                participant:JSON.stringify(global.optionSelectedUser),
                course_type:global.course_type
            })
    
            if(response.status===200){
                if(response.data.data){
                    let alertSuccess = 
                    <div dangerouslySetInnerHTML={{
                        __html: defaultLang.lang.alertAfterShareContent
                    }}/>
                    setModalShow(false)
                    setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:""}, alertMessage:false,optionSelectedUser:[]}))
                }
            }
        }else{
            setGlobal(global => ({...global, alertMessage:"PARTICIPANT IS MANDATORY"}))
        }

    }

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[]}))
    }

    return (
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            className={"popup-quiz"}
            onEnter={()=>{getListUser();getArticleDetail()}}
        >
            <style>
                {
                    `
                    ul.chosen-choices {
                        border: 1px solid #eee;
                        border-radius: 5px;
                        background-color: #ffffff !important;
                    }
                    .popup-quiz .quiz-rules {
                        margin: 10px 0 10px;
                    }
                    .btn {
                        display: inline-block;
                        font-weight: 400;
                        text-align: center;
                        white-space: nowrap;
                        vertical-align: middle;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        border: 1px solid transparent;
                        padding: .375rem .75rem;
                        font-size: 1rem;
                        line-height: 1.5;
                        border-radius: .25rem;
                        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
                    }
                    .btn-view-more {
                        padding: 7px 22px;
                        font-size: 13px;
                    }
                    
                    .btn-share {
                        padding: 5px 15px !important;
                        color: #5277dd !important;
                        border: 1px solid #5277dd;
                        margin-top: 10px !important;
                        font-style: normal;
                        font-size: 13px;
                        text-transform: none;
                        font-family: 'poppinssemibold', sans-serif;
                        background-color: #fafafa;
                        border-radius: 20px;
                        width: 150px;
                        float: right;
                    }
                    `
                }
            </style>
            <Modal.Header>
                <button type="button" className="btn-close quiz-btn-close" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()}><img src={`${env.assets}img/close-btn-blue.png`}/></button>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content" >
                    <div className="tab-pane active" data-tab-index="0" id="tab-0"> 
                        <LoadingData loading={loading} type={'popup'}/>
                        {
                            {
                                [true]:  
                                                <div id="contentShare" style={cssTarget(loading)}>
                                                    <h2 className="quiz-caption" >
                                                        <div dangerouslySetInnerHTML={{
                                                            __html: global.shareArticleTitle
                                                        }}/>
                                                    </h2>
                                                    <span className="quiz-rules">{global.articleTitle}</span>
                                                    <hr style={{border:"1px dashed #2b65ed"}}/>
                                                        {global.alertMessage?
                                                            <div className="alert alert-danger text-center" role="alert">{global.alertMessage}</div>
                                                        :
                                                            null
                                                        }
                                                        <input type="hidden" value={global.id} name="hdnArticleId" id="hdnArticleId"/>
                                                        <input type="hidden" value={global.pointShareArticle} name="hdnConfigShareArticle" id="hdnConfigShareArticle"/>
                                                        <AsyncSelect
                                                            onChange={(e)=>setGlobal(global=>({...global, optionSelectedUser:e}))}
                                                            className="basic-multi-select chosen-select" classNamePrefix="select" name="optionAdHoc" value={global.optionSelectedUser} isMulti components={animatedComponents} isLoading={global.isLoadingUser} loadOptions={loadOptions.bind(this)} placeholder={"Choose Employee Name"}
                                                        />
                                                        <button type="submit" id="btnShareArticle" name="btnShareArticle" className="btn btn-outline-white btn-share" value="submit" onClick={()=>submitShareArticle()}>{global.btnArticleTitle}</button>
                                                </div>

                            }[modalShow]
                        }
                    </div>
                </div>

            </Modal.Body>
        </Modal>
    )
}

export function PopupQuiz(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [stateRadio, setStateRadio] = useState(false)
    const [loading, setLoading] = useState(true)
    const [buttonLoading, setButtonLoading] = useState(false)
    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='quiz'){
            setLoading(true)
            setModalShow(true)
            if(global.modalProp.iqosQuiz){
                showQuiz()
            }
        }
    },[global.modalProp])

    const getArticleDetail = async () => {
        let response = await axiosLibrary.postData("awbHome/GetArticleDetail",{id:global.modalProp.id})
        if(response.status===200){
            if(response.data.data.length>0){
                setGlobal(global=>({
                    ...global, 
                    hdnArticleId: response.data.data[0].id,
                    hdnUserArticleId: response.data.data[0].article_id
                }))
                let responseQuiz = await axiosLibrary.postData("awbHome/HomeQuiz",{id:global.modalProp.id,iqosQuiz:global.modalProp.iqosQuiz || 0})
                if(responseQuiz.status===200){
                    if(responseQuiz.data.data.length>0){
                        let totalPoint = 0
                        responseQuiz.data.data.forEach(element => {
                            totalPoint = totalPoint + element.point
                        });
                        setGlobal(global=>({
                            ...global,
                            hyperlink_url:response.data.data[0].hyperlink_url, 
                            quizArticle:responseQuiz.data.data,
                            totalQuiz:responseQuiz.data.data.length,
                            totalPoint: totalPoint,
                            indexQuizArticle:0,
                            selectedValue:'',
                            answer_mode3:[],
                            arrQuiz:[],

                        }))

                    }
                    
                }
            }
            setLoading(false)
        }
    }

    const showQuiz = async () => {
        await axiosLibrary.contentAccessLog({contenType: global.modalProp.param.content,articleId: global.modalProp.param.articleId,trnId: global.modalProp.param.id})

        setGlobal(global => ({...global,showQuiz:true, showButton:false}))
        
        setLoading(false)
    }

    const quizShowNextOrSubmitBtn = (e,id)=>{
        setButtonLoading(true)
        let showSubmit = false
        let arrQuiz = []
        let isi = []
        let getIndexValueBefore = global.arrQuiz.findIndex(v=>v.id===id)

        let answer = {
            id: id,
            val:e.target.value
        }
        

        if(getIndexValueBefore >=0){
            if(global.quizArticle[global.indexQuizArticle].answer_mode==3){
                if(global.answer_mode3.includes(e.target.value)){
                    isi = global.answer_mode3.filter(v=>v!==e.target.value)
                }else{
                    isi = [...global.answer_mode3,e.target.value]
                }
                isi = isi.sort()
                let answer_mode3Join = isi.join('|')
                global.arrQuiz[getIndexValueBefore].val =answer_mode3Join
            }else{
                global.arrQuiz[getIndexValueBefore].val = e.target.value
            }
            arrQuiz = global.arrQuiz
        }else{
            arrQuiz = [...global.arrQuiz,answer]
        }
        
        if(global.indexQuizArticle+1 >= global.totalQuiz){
            showSubmit = true
        }

        setGlobal(global=>({...global, 
            showSubmit:showSubmit, 
            showButton:true,
            arrQuiz: arrQuiz,
            selectedValue: e.target.value,
            answer_mode3: isi
        }))
        setButtonLoading(false)
    }

    const checkAnswer = () =>{
        setButtonLoading(true)
        const currentIdx = global.indexQuizArticle
        let nextIdx = currentIdx+1
        let showSubmit = false
        if(nextIdx >= global.totalQuiz){
            showSubmit = true
            nextIdx = currentIdx
        }
        setGlobal(global=>({...global, indexQuizArticle:nextIdx, showSubmit:showSubmit, showButton:false, checkedRadio: false, selectedValue:''}))
        setButtonLoading(false)
    }

    const checkSubmit = async () => {
        setButtonLoading(true)
        if(global.indexQuizArticle+1 >= global.totalQuiz){
            if(global.arrQuiz.length === global.totalQuiz){
                const paramSubmitQuiz = {
                    platform_id: securityData.Security_getPlatformId(),
                    user_id: securityData.Security_UserId(),
                    trn_article_id: global.hdnArticleId,
                    user_article_id: global.hdnUserArticleId,
                    arrQuiz: JSON.stringify(global.arrQuiz)
                }
                
                let validationSubmit = await axiosLibrary.postData("awbHome/QuizValidationSubmit",paramSubmitQuiz)
                if(validationSubmit.status===200){
                    if(validationSubmit.data.data){
                        let submitQuiz = await axiosLibrary.postData("awbHome/SubmitQuiz",paramSubmitQuiz)
                        if(submitQuiz.status===200){
                            let dataResultQuiz = submitQuiz.data.data
                            let alertSuccess = 
                                <div dangerouslySetInnerHTML={{
                                    __html: defaultLang.lang.alertAfterSubmitQuiz.replace('[variable1]', dataResultQuiz.userPoint)
                                }}/>
                            let messageSubtitlePopup = ""
                            let needSubtitle = false
                            let dataUser = axiosLibrary.getUserInfo()
                            
                            if(dataResultQuiz.rsResultList.length>0){
                                messageSubtitlePopup = dataResultQuiz.rsResultList.map((v,idx)=>
                                    <div className='div-quiz-result' key={idx}>
                                        <p> Question : {v.question} ?</p>
                                        <p><strong>Answer : {v.result}</strong>, <span>{v.answer_summary}</span></p>
                                    </div>
                                )
                                needSubtitle = true
                            }
                            delete dataResultQuiz["rsResultList"]
                            delete dataResultQuiz["configSoundNtf"]
                            delete dataResultQuiz["returnCase"]
                            dataUser = {...dataUser,...dataResultQuiz}
                            localStorage.setItem('userinfo',JSON.stringify(dataUser));
                            setButtonLoading(false)
                            closeModal()
                            setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:needSubtitle, messageSubtitlePopup:messageSubtitlePopup, loadContent: true}, alertMessage:false, showQuiz:false, showSubmit:false, _PlaySoundFile: dataResultQuiz.userPoint > 0 ? {name:'true',event:true}:{name:'false',event:true}}))
                        }
                    }else{
                        let alertSuccess = 
                            <div dangerouslySetInnerHTML={{
                                __html: defaultLang.lang.alreadySubmitQuiz
                
                            }}/>
                        setButtonLoading(false)
                        closeModal()
                        setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:"", loadContent: true}, alertMessage:false, showQuiz:false, showSubmit:false}))
                    }
                }
               
            }
        }
    }

    const renderRadioButton = [
        {answer:'A', number:'1', checked:false},
        {answer:'B', number:'2', checked:false},
        {answer:'C', number:'3', checked:false},
        {answer:'D', number:'4', checked:false},
    ]

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, sidebarBlur:false, alertMessage:false, optionSelectedUser:[]}))
    }

    return (
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            className={"popup-quiz"}
            dialogClassName={"modal-large"}
            contentClassName={"modal-content content-border"}
            onEnter={()=>getArticleDetail()}
        >
            <style>
                {
                    `
                    .radio-toolbar input[type="radio"] {
                        display:none; 
                    }
                    .radio-toolbar label {
                        display:inline-block;
                        background-color: #fff;
                        color: #1083c8;
                        border: 2px solid #1083c8;
                        border-radius: 10px;
                        padding: 4px 15px;
                        font-size: 12px;
                        left: 30px;
                        font-family: 'poppinssemibold';
                    }
                    .radio-toolbar input[type="radio"]:checked + label { 
                        background-color: #1083c8;
                        border-color: #1083c8;
                        color: #fff;
                    }
                    /* .radio-toolbar label:hover {
                        background-color: #2b65ed;
                        border-color: #1083c8;
                        color: #fff;
                    } */
                    
                    a.left.carousel-control {
                        position: relative;
                        left: -60px;
                    }
                    a.right.carousel-control {
                        position: relative;
                        top: 5px;
                    }
                    
                    .submit.carousel-control {
                        display: block;
                        background: transparent;
                        border: 0;
                        /* text-decoration: underline; */
                        position: relative;
                        left: -10px;
                        /* height: 20px; */
                        padding: 0;
                        top: -2px;
                        font-weight: bold;
                        border-bottom: 2px solid #1083c8;
                        border-radius: 5px 5px 0 0;
                        padding: 4px 15px;
                    }
                    
                    .submit.carousel-control:hover {
                        /* border-bottom: 2px solid #000; */
                        /* line-height: 20px; */
                        cursor: pointer;
                        background-color: #1083c8;
                        border-color: #1083c8;
                        color: #fff;
                    }
                    
                    .content-border{
                        border-bottom: 8px solid #6252bd;
                        border-image: linear-gradient(to left, #6252bd 0%, #59b7d2 100%);
                        border-image-slice: 1;
                        border-bottom-width: 20px;  
                    }
                    
                    /* a.left.carousel-control {
                        position: absolute;
                        right: 20px;
                    }
                    
                    a.right.carousel-control {
                        position: absolute;
                        right: 0px;
                    } */
                    .carousel-control{
                        float:right;
                    }
                    .quizId{
                        color: #2b65ed;
                        font-size: 16px;
                        position: relative;
                        top: 11px;
                        font-weight: bold;
                        font-family: 'poppinsmedium', sans-serif;
                        display: block;
                        margin: 0px 0 2px;
                        float: right;
                    }
                    .quizSmall{
                        display: inline-block;
                        position: absolute;
                        top: -15px;
                        right: 6px;
                        width: 48px;
                        font-size: 12px;
                    }
                    `
                }
            </style>
            <Modal.Header>
                <button type="button" className="btn-close quiz-btn-close" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()}><img src={`${env.assets}img/close-btn-blue.png`}/></button>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content" >
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <LoadingData loading={loading} type={'popup'}/>
                            {
                                {
                                    [true]: 
                                            <div id="contentQuiz" style={cssTarget(loading)}>
                                                <h2 className="quiz-caption" >
                                                    <div dangerouslySetInnerHTML={{
                                                            __html: global.modalProp.iqosQuiz? defaultLang.lang.quizCaptionIqos : defaultLang.lang.quizCaption
                                                    }}/>
                                                </h2>
                                                {global.modalProp.iqosQuiz?null:
                                                    <>
                                                        <span className="quiz-points" >{defaultLang.lang.quizPoint.replace('[variable1]', global.totalPoint)}</span>
                                                        <a onClick={()=>showQuiz()} href={global.hyperlink_url} target="_blank" rel='noreferrer' className="btn quiz-btn-access-article">{defaultLang.lang.showQuiz}</a> 
                                                        <span className="quiz-rules">{defaultLang.lang.quizRules}</span>
                                                    </>
                                                }
                                                <hr style={{border:"border: 1px dashed #2b65ed"}}/>
                                                {global.showQuiz && 
                                                    <div id="myCarousel" className="carousel slide" data-ride="carousel" data-loop="false" >
                                                        <div className="carousel-inner quiz-carousel" style={{minHeight:'150px'}}>
                                                            {global.quizArticle &&
                                                                <div className="banner_slide_content">
                                                                    <input type="hidden" value={global.quizArticle[global.indexQuizArticle].id} name={`hdnQuizId${global.indexQuizArticle}`} id={`hdnQuizId${global.indexQuizArticle}`}/>
                                                                    <span className="quizId">
                                                                        <small className="quizSmall">
                                                                            question
                                                                        </small>
                                                                        {`${global.indexQuizArticle+1} of ${global.totalQuiz}`}
                                                                    </span>
                                                                    <h3 className="quiz-question" >{securityData.Security_lang()==='ENG'?  global.quizArticle[global.indexQuizArticle].question : global.quizArticle[global.indexQuizArticle].question_ind}</h3>
                                                                    <div className="radio-toolbar">
                                                                        <div className="row" style={{maxWidth:"90%"}}>
                                                                            {renderRadioButton.map((v,idx)=>
                                                                                global.quizArticle[global.indexQuizArticle][`choice_${v.number}`] 
                                                                                &&
                                                                                <div className="col-md-12" key={idx}>
                                                                                    <input 
                                                                                        className={`answerOption${global.quizArticle[global.indexQuizArticle].id}`} 
                                                                                        type="radio" 
                                                                                        id={`answerOption_${v.number}_${global.indexQuizArticle}`} 
                                                                                        name={
                                                                                                `answer${global.quizArticle[global.indexQuizArticle].answer_mode==3?
                                                                                                    `Option${v.answer}${global.quizArticle[global.indexQuizArticle].id}`
                                                                                                :
                                                                                                    `Id${global.quizArticle[global.indexQuizArticle].id}`}`
                                                                                            }
                                                                                        value={global.quizArticle[global.indexQuizArticle].answer_mode==3?v.answer:v.number}
                                                                                        onChange={()=>setStateRadio(!stateRadio)}
                                                                                        onClick={(e)=>quizShowNextOrSubmitBtn(e,global.quizArticle[global.indexQuizArticle].id)}
                                                                                        checked={global.quizArticle[global.indexQuizArticle].answer_mode==3?
                                                                                            global.answer_mode3.includes(v.answer)? true:false
                                                                                        :
                                                                                            global.selectedValue===v.number?true:false
                                                                                        }
                                                                                    />
                                                                                    <label
                                                                                        htmlFor={`answerOption_${v.number}_${global.indexQuizArticle}`}
                                                                                    >
                                                                                        {securityData.Security_lang()==='ENG'?  
                                                                                            global.quizArticle[global.indexQuizArticle][`choice_${v.number}`] 
                                                                                            : 
                                                                                            global.quizArticle[global.indexQuizArticle][`choice_${v.number}_ind`]
                                                                                        }
                                                                                    </label>
                                                                                </div>

                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            }

                                                            {global.showButton &&
                                                            <>
                                                                {global.showSubmit?
                                                                    <button type="submit"  onClick={(e)=>checkSubmit(e)} className="submit carousel-control" 
                                                                        style={{display:global.showSubmit?'block':'none'}}
                                                                        disabled={buttonLoading}
                                                                    >
                                                                        <LoadingDataButton loading={buttonLoading}/>
                                                                        <div style={cssTarget(buttonLoading)}>
                                                                            submit
                                                                        </div>
                                                                    </button>
                                                                :
                                                                    <a className="right carousel-control" onClick={(e)=>checkAnswer(e)} tabIndex={0} role="button"
                                                                    style={{
                                                                        cursor:'pointer'
                                                                    }}
                                                                    >
                                                                        <LoadingDataButton loading={buttonLoading}/>
                                                                        <div style={cssTarget(buttonLoading)}>
                                                                            <span style={{position:'relative', top:'-1px'}}>next question</span> <i className="ion-chevron-right"></i>
                                                                        </div>
                                                                    </a>
                                                                }  
                                                            </>
                                                            }
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                }[modalShow]
                            }
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupSubmitIdea(){
    const [modalShow, setModalShow] = useState(false)
    const [global] = useContext(GlobalState)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='submitIdea'){
            processSubmitIdea();
        }
    },[global.modalProp])

    const processSubmitIdea = async () => {
        const param = {
            userName: securityData.Security_UserName(),
            userId: securityData.Security_UserId(),
            platform_id: securityData.Security_getPlatformId(),
            message: global.modalProp.id
        }
        let response = await axiosLibrary.postData('awbHome/SubmitIdea', param);
        if(response.status===200){
            setModalShow(true)
        }
    }

    return(
        <Modal
            show={modalShow} 
            onHide={()=>setModalShow(false)}
            onExited={()=>setModalShow(false)}
            className={"popup-submit-idea"}
        >
            <Modal.Header className={"popup-submit-idea"}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" onClick={()=>setModalShow(false)}><img src={`${env.assets}img/close-btn.png`}/></button>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content" >
                            {
                                {
                                    [true]: <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                                <h5 className="modal-title" >
                                                    <div dangerouslySetInnerHTML={{
                                                            __html: defaultLang.lang.submit_idea_confirm
                                                    }}/>
                                                </h5> 
                                                <h5 className="modal-notes" >{defaultLang.lang.submit_idea_short_description}</h5>
                                                <a tabIndex="0" role="button" data-dismiss="modal" className="btn popup-btn-message" onClick={()=>setModalShow(false)}>{defaultLang.lang.submit_idea_send_another_ideas}</a>
                                            </div>
                                }[modalShow]
                            }
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupRedeem(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='redeem'){
            setModalShow(true)
        }
    },[global.modalProp])

    const yesReg = async () =>{
        setLoading(true)
        let md5Id = await axiosLibrary.getmd5FromBackend(global.modalProp.id)
        let workshopData = await axiosLibrary.postData('awbWorkshopSharing/SelectData', {md5ID: md5Id})
        // let md5CategoryId = await axiosLibrary.getmd5FromBackend(workshopData.data.data.category_id)
        const param = {
            userId: securityData.Security_UserId(),
            workshopId: global.modalProp.id
        }
        let cek = await axiosLibrary.postData('awbWorkshopSharingUser/selectDataByUserAndWorkshopId', param)
        if(cek.status===200){
            if(cek.data.data.length < 1){
                let totalCount = await axiosLibrary.postData('awbWorkshopSharingUser/cekCountUserInWorkshopSharing', param)
                if(totalCount.status===200){
                    let typeReg = totalCount.data.data.total_user < workshopData.data.data.capacity ? 'REGISTER':'WAITING'

                    const paramInsert = {
                        user_id: securityData.Security_UserId(),
                        awb_trn_workshop_sharing_id: global.modalProp.id,
                        register_type: typeReg,
                        platform_id:securityData.Security_getPlatformId()
                    }

                    let insertResponse = await axiosLibrary.postData('awbWorkshopSharingUser/InsertData', paramInsert)
                    if(insertResponse.status===200){
                        let alertSuccess = <div dangerouslySetInnerHTML={{
                            __html: 
                            defaultLang.lang.workShopSharingTxtSucessRegister.replace('[variable1]',global.modalProp.name).replace('[variable2]',workshopData.data.data.title)
                            // workshopData.data.data.sub_category_type==='W'? `Selamat, Anda telah terdaftar dalam Workshop ${workshopData.data.data.title}` : `Selamat, Anda telah terdaftar dalam Sharing Session ${workshopData.data.data.title}`
                        }}/>
                        closeModal()
                        setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:"", loadContent: true},alertMessage:false, optionSelectedUser:[]}))
                        setLoading(false)
                    }else{
                        let alertSuccess = <div dangerouslySetInnerHTML={{
                            __html: 'failed to insert'
                        }}/>
                        closeModal()
                        setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:"", loadContent: true},alertMessage:false, optionSelectedUser:[]}))
                        setLoading(false)
                    }
                }
            }
        }
    }

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[],blur:false}))
    }

    return(
        <>
        <style>
            {`
                .dialog-popup-reedem{
                    max-width:450px;
                }
            `}
        </style>
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            dialogClassName={'dialog-popup-reedem'}
        >
            <Modal.Header className={"popup-reedem"}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()} style={{top:"17px !important"}}>
                    <img src={`${env.assets}img/close-btn.png`} /></button>
                <br/>
                <img src={`${env.assets}img/redeem-popup.png`} style={{maxWidth:'100%',position:'absolute', top:0, left:0}}></img>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content pt-4" >
                            {
                                {
                                    [true]: <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                                <h5 className="modal-title popup-description" id="modalMessage">
                                                    {defaultLang.lang.workShopSharingTxtPopupRedeem.replace('[variable1]',global.modalProp.name)}
                                                </h5> 
                                                <button type="button" id="btnRedeemConfirm" name="btnRedeemConfirm" onClick={()=>yesReg()} className="btn popup-btn-message" disabled={loading}>
                                                    <LoadingDataButton loading={loading}/>
                                                    <div style={cssTarget(loading)}>
                                                        {defaultLang.lang.yes}
                                                    </div>
                                                </button>
                                            </div>
                                }[modalShow]
                            }
                </div>
            </Modal.Body>
        </Modal>
        </>
    )
}

export function PopupSubscribe(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='Subscribe'){
            setModalShow(true)
        }
    },[global.modalProp])

    const subscribe = async ()=>{
        const param = {
            optionFlag: 1,
            platform_id: securityData.Security_getPlatformId(),
            isMobileAccess: isMobile
        }
        let response = await axiosLibrary.postData('awbUser/SubscribeEmail',param);
        if(response.status===200){
            let dataUser = axiosLibrary.getUserInfo()
            const awbEmailSubscribe = {
                'Cz_awb_email_subscribe': 1
            }
            dataUser = {...dataUser,...awbEmailSubscribe};
            localStorage.setItem('userinfo',JSON.stringify(dataUser));
            if(response.data.data===2){
                //harusnya login ulang
                window.location.reload()
            }
            setGlobal(global => ({...global, showBtnConfirm:false ,modalProp:{modalShow:true, id:null, type: 'Subscribe', messageTitlePopup: defaultLang.lang.subscribe_thank_you}}))
        }
    }

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, modalProp:{modalShow:false, id:null, type: 'Subscribe'}}))
        window.location.reload()
    }

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
        >
            <Modal.Header className={"popup-subscribe"}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()}><img src={`${env.assets}img/close-btn.png`}/></button>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content" >
                            {
                                {
                                    [true]: <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                                <h5 className="modal-title" >
                                                    <div dangerouslySetInnerHTML={{
                                                            __html: global.modalProp.messageTitlePopup
                                                    }}/>
                                                </h5> 
                                                {global.showBtnConfirm &&
                                                    <a id="btnConfirm" name="btnConfirm" tabIndex="0" role="button" className="btn popup-btn-message" onClick={()=>subscribe()}>{defaultLang.lang.subscribe_submit}</a>
                                                }
                                                <a tabIndex="0" role="button" data-dismiss="modal" className="btn popup-btn-message" onClick={()=>closeModal()}>{defaultLang.lang.submit_idea_send_another_ideas}</a>
                                            </div>
                                }[modalShow]
                            }
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupRegisterCourse(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='registerCourse'){
            setModalShow(true)
        }
    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[], blur:false}))
    }

    const register = async () =>{
        
        setLoading(true)
        const param = {
            platform_id: securityData.Security_getPlatformId(),
            course_id: global.modalProp.id,
            ref:global.modalProp.ref
        }

        let response = await axiosLibrary.postData('awbViewCourse/registerCourse',param);
        if(response.status===200){
            let alertSuccess = ''
            if(response.data.data){
                if(response.data.course_type == 2 || response.data.course_type == 3){

                    alertSuccess = 
                    <div dangerouslySetInnerHTML={{
                        __html: defaultLang.lang.successRegisterCourseNeedApprove
                    }}/>
                }
                else{

                    alertSuccess = 
                    <div dangerouslySetInnerHTML={{
                        __html: defaultLang.lang.successRegisterCourse
                    }}/>
                }
                closeModal(false)
            }else{
                alertSuccess = 
                <div dangerouslySetInnerHTML={{
                    __html: defaultLang.lang.failedRegisterCourse
                }}/>
                closeModal(false)
            }
            setLoading(false)
            setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:"", loadContent: true}}))
        }
    }

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            className={"popup-areyousure"}
        >
            <Modal.Header className={"popup-areyousure"} style={{borderBottom:'none'}}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()}><img src={`${env.assets}img/close-btn-blue.png`}/></button>
                <br/>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content" >
                            {
                                {
                                    [true]: <div className="tab-pane active" data-tab-index="0" id="tab-0" style={{textAlign:'center'}}>
                                                <h5 className="modal-title" style={{paddingBottom:'2rem'}}>
                                                    <div dangerouslySetInnerHTML={{
                                                            __html: defaultLang.lang.are_you_sure
                                                    }}/>
                                                </h5> 
                                                <button id="btnSubmit" name="btnSave" className="btn" onClick={()=>register()} disabled={loading}>
                                                    <LoadingDataButton loading={loading}/>
                                                    <div style={cssTarget(loading)}>
                                                        {defaultLang.lang.yes}
                                                    </div>

                                                </button>
                                                <button id="btnClose" type="button" data-dismiss="modal" className="btn" onClick={()=>closeModal()} disabled={loading}>
                                                    <LoadingDataButton loading={loading}/>
                                                    <div style={cssTarget(loading)}>
                                                        {defaultLang.lang.no}
                                                    </div>
                                                </button>
                                            </div>
                                }[modalShow]
                            }
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupRegisterTraining(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [htmlElement, setHtmlElement] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='registerTraining'){
            setModalShow(true)
            showListSchedule()
        }
    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[]}))
    }

    const showListSchedule = async () => {
        setLoading(true)
        const param = {
            platform_id: securityData.Security_getPlatformId(),
            training_id: global.modalProp.id_training,
            schedule_id: global.modalProp.idSchedule,
            type: global.modalProp.registerType
        }

        let response = await axiosLibrary.postData('awbTraining/showDate',param);
        if(response.status===200){
            const scheduleList = response.data.data
            let htmlElement = null
            if(scheduleList.length === 0){
                htmlElement = 
                    <> {htmlElement} 
                        Tidak ada Jadwal Lain selain yang dijadwalkan
                        <br/><br/>
                        <sup>* Maksimal Waktu Pendaftaran adalah 3 Hari sebelum Jadwal</sup>
                    </>
            }else{
                htmlElement = scheduleList.map((v, idx)=>{
                    let htmlElementChild = 
                    <>
                        <span className='fa fa-calendar'/>&nbsp;{moment(moment.utc(v.schedule_date_indo)).format('DD-MM-YYYY')}
                        <br/>
                        <span className='fa fa-clock-o'/>&nbsp;{v.schedule_start_time_indo}&nbsp;{v.schedule_end_time_indo}
                        <hr/>
                    </>
                    let htmlElementParent = null
                    if(v.total_user >= v.capacity){
                        htmlElementParent = 
                        <div key={idx}>
                            <center>
                                <span className='btn btn-warning'>
                                    {htmlElementChild}
                                    Total User : {v.total_user} / {v.capacity} Kapasitas (Penuh)
                                </span>
                            </center>
                            <br/>
                        </div>
                    }else{
                        htmlElementParent = 
                        <div key={idx}>
                            <center>
                                <span className='btn btn-success' onClick={()=>registerTraining(v)}>
                                    {htmlElementChild}
                                    Total User : {v.total_user} / {v.capacity} Kapasitas.
                                </span>
                            </center>
                            <br/>
                        </div>
                    }
                    return(
                        htmlElementParent
                    )
                })
            }
            setHtmlElement(htmlElement)
            setLoading(false)
        }
    }

    const registerTraining = async (scheduleData) =>{
        const param = {
            schedule_id: scheduleData.scheduleId,
            training_id: global.modalProp.registerType!='new'?global.modalProp.idSchedule:scheduleData.id,
            action: global.modalProp.registerType,
            platform_id: securityData.Security_getPlatformId(),
        }
        
        const response = await axiosLibrary.postData('awbTraining/newUserChange',param); 
        if(response.status===200){
            let alertSuccess = ''
            if(response.data.data){
                alertSuccess = 
                <div dangerouslySetInnerHTML={{
                    __html: param.action==="new"? 
                    defaultLang.lang.titleModalConfirmRegisterTraining 
                    :
                    defaultLang.lang.titleModalConfirmChangeScheduleTraining 
                }}/>
                closeModal(false)

                var goToTabMenuFromReturn = response.data.goToTabMenu;

                setGlobal(global=>({...global, goToTabMenu: goToTabMenuFromReturn}))
            }else{
                alertSuccess = 
                <div dangerouslySetInnerHTML={{
                    __html: defaultLang.lang.titleModalFailedConfirm
                }}/>
                closeModal(false)
            }
            setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:"",loadContent: true}}))
        }
    }

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
        >
            <Modal.Header>
                {global.modalProp.messageTitlePopup}
            </Modal.Header>
            <Modal.Body>
                <LoadingData loading={loading} type={'popup'}/>
                <div className="container" style={{...cssTarget(loading),padding:"15px"}}>
                            {
                                {
                                    [true]: htmlElement
                                }[modalShow]
                            }
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupSaveAgreeTraining(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='saveAgreeTraining'){
            setModalShow(true)
        }
    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[]}))
    }

    //proses dari belum konfirmasi atau non registered -> terdaftar atau registered && proses dari registered to attend
    const yesAttended = async () =>{
        setLoading(true)
        const action = global.modalProp.action //param untuk membedakan proses
        const response = await axiosLibrary.postData(`awbTraining/${action==='registered'? `rsvp`: `hadir`}`,{idDate: global.modalProp.idDate}); 
        if(response.status===200){
            let alertSuccess = ''
            if(response.data.data){
                alertSuccess = 
                <div dangerouslySetInnerHTML={{
                    __html:action==='registered'? defaultLang.lang.titleModalConfirmAttended : defaultLang.lang.titleModalConfirmAttended2 
                }}/>
                closeModal(false)
                setGlobal(global=>({...global, goToTabMenu:action==='registered'? 2 : 4}))
            }else{
                alertSuccess = 
                <div dangerouslySetInnerHTML={{
                    __html: defaultLang.lang.titleModalFailedConfirm
                }}/>
                closeModal(false)
            }
            setLoading(false)
            setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:"",loadContent: true}}))
        }
    }
    //end

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
        >
            <Modal.Header style={{border:0}}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" style={{margin:'-0.2rem -1rem -1rem auto'}} onClick={()=>closeModal()}>
                    <img src={`${env.assets}img/close-btn-blue.png`}/>
                </button>                
            </Modal.Header>
            <Modal.Body style={global.modalProp.needSubtitle?{height:'450px'}:null}>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <h5 className="modal-title" id="myModalTitle" style={{marginBottom:0}}>
                            {global.modalProp.action==='registered' && defaultLang.lang.bodyModalAttended}

                            {global.modalProp.action==='attend' && 
                                <div dangerouslySetInnerHTML={{
                                    __html: defaultLang.lang.bodyModalAttended2.replace('[variable1]', global.modalProp.training_name)
                                }}/>
                            }

                        </h5>
                        <button type="button" data-dismiss="modal" className="btn popup-btn-message" onClick={()=>yesAttended()} disabled={loading}>
                            <LoadingDataButton loading={loading}/>
                            <div style={cssTarget(loading)}>
                                {defaultLang.lang.yes}
                            </div>
                        </button> 
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupChangeStatusForSupervisor(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='changeStatus'){
            setModalShow(true)
        }
    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[]}))
    }

    const yesChange = async ()=>{
        setLoading(true)
        const action = global.modalProp.action //param untuk membedakan proses
        const param = {
            training_id: global.modalProp.id_training,
            status: action
        }
        const response = await axiosLibrary.postData(`awbTraining/changeStatusSupervisor`,param); 
        if(response.status===200){
            let alertSuccess = <div dangerouslySetInnerHTML={{
                                    __html:response.data.data ? defaultLang.lang.alertAfterChangeStatus: "error"
                                }}/>
            setLoading(false)
            closeModal(false)
            setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:"",loadContent: true}}))
        }
    }

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
        >
            <Modal.Header style={{border:0}}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" style={{margin:'-0.2rem -1rem -1rem auto'}} onClick={()=>closeModal()}>
                    <img src={`${env.assets}img/close-btn-blue.png`}/>
                </button>                
            </Modal.Header>
            <Modal.Body style={global.modalProp.needSubtitle?{height:'450px'}:null}>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <h5 className="modal-title" id="myModalTitle" style={{marginBottom:0}}>
                                <div dangerouslySetInnerHTML={{
                                    __html: global.modalProp.action==='attend' ?
                                            defaultLang.lang.bodyModalChangeStatusAttend.replace('[variable1]', global.modalProp.training_name)
                                            : 
                                            defaultLang.lang.bodyModalChangeStatusNotAttend.replace('[variable1]', global.modalProp.training_name)
                                }}/>
                        </h5>
                        <button type="button" data-dismiss="modal" className="btn popup-btn-message" onClick={()=>yesChange()} disabled={loading}>
                            <LoadingDataButton loading={loading}/>
                            <div style={cssTarget(loading)}>
                                {defaultLang.lang.yes}
                            </div>
                        </button> 
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupNetworkSubmit(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)

    const [contentNetworkList, setcontentNetworkList] = useState([])
    const [items, setItems] = useState([])

    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()

    const [invalidImage, setInvalidImage] = useState(false)
    const reader = new FileReader()
    const fileInput = React.createRef()
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='networkSubmit'){
            getContentNetwork()
            
        }
    },[global.modalProp])

    const getContentNetwork = (async () => {
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbHome/ContentNetworkSubmitList',credentials);
        
        if(isi.status===200){
            if(isi.data.data.length>0){
                setcontentNetworkList(isi.data.data)
            }
            setModalShow(true)
        }
    })

    const handleInputChange = (event) => {
        event.preventDefault();
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    

    const setStateImage = (stateFile,invalidImage) => {
        setInvalidImage(invalidImage)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.doc|\.docx|\.pdf/i;
        var filename = upload_field.target.value;
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an document");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 3) {
            alert('File size exceeds 3 MB');
            upload_field.target.form.reset();
            return 0;
        }

        if(upload_field.target.files[0]!== undefined){
            reader.onload = (e) => {
                const img = new Document();

                img.onload = () => {
                    setStateImage(URL.createObjectURL(upload_field.target.files[0]),false)
                }
                img.onerror = () => {
                    setStateImage(true)
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(upload_field.target.files[0]);
        }
        
        return 1;       
    }

    const validateForm = (e) => {
        e.preventDefault();
        const IsFileAttached = fileInput.current.files.length > 0;
        
        if( items.title == null || items.description == null || IsFileAttached == false || invalidImage == true){
            alert("Please fill all form.");
            return false
        }else{
            submitArticle();
            return true
        }
    }

    const submitArticle= async () =>{
        setLoading(true)
        const fd = new FormData();

        fd.append("title", items.title);
        fd.append("title_ind", items.title)
        fd.append("description", items.description);
        fd.append("description_ind", items.description);
        fd.append("platform_id", platform_id);
        fd.append("user_created", user_id)
        fd.append("user_account", user_account)
        fd.append("status", 1)

        const IsFileAttached = fileInput.current.files.length > 0;
        if(IsFileAttached){
            fd.append("article_file", fileInput.current.files[0]);
        } 

        let response = await axiosLibrary.postData("awbSubmittedArticle/InsertData", fd)


        if(response.status === 200){
            if(response.data.data){
                let alertSuccess = 
                <div dangerouslySetInnerHTML={{
                    __html: "Terima kasih telah mengirimkan konten ke #AdaWaktunyaBelajar"
                }}/>
                setModalShow(false)
                setItems([])
                setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:""}}))
            } }
    }

    const closeModal = () =>{
        setModalShow(false)
        setItems([])
    }


    return(
        <>

        <style>
            {
                `.popup-submit{
                    max-width: 900px;
                }`
            }
        </style>

        <Modal 
            dialogClassName="popup-submit"
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
        >
            <Modal.Header style={{border:0}}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" style={{margin:'-0.2rem -1rem -1rem auto'}} onClick={()=>closeModal()}>
                    <img src={`${env.assets}img/close-btn-blue.png`}/>
                </button>                
            </Modal.Header>
            <Modal.Body style={global.modalProp.needSubtitle?{height:'450px'}:null}>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <div className="row">
                            <div className="col-md-12">

                                <div className="" >
                                    <h3 style={{ textAlign: "center", paddingBottom: "20px" }}>RULES</h3>
                                </div>

                                <div id="accordion" className="accordion">
                                    {
                                        contentNetworkList.map(
                                            (item, index) =>
                                            {
                                                return(
                                                    <div key={index} className="card">
                                                        <div className="card-header" id="heading<?php echo $drow->id?>">
                                                            <h6 className="mb-0"> 
                                                                <a data-toggle="collapse" href={"#collapse"+ item.id} aria-expanded="true" 
                                                                aria-controls="collapse<?php echo $drow->id?>">
                                                                    { securityData.Security_lang() == "ENG" ? item.title : item.title_ind }
                                                                </a> 
                                                            </h6>
                                                        </div>
                                                        <div id={"collapse"+ item.id} className={ index <= 0 ? 'collapse show' : 'collapse'} 
                                                        aria-labelledby={"heading"+ item.id}  data-parent="#accordion">
                                                            <div className="card-body"
                                                            dangerouslySetInnerHTML={{
                                                                __html: securityData.Security_lang() == "ENG" ? item.page_content : item.page_content_ind
                                                            }}>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        )
                                    }
                                </div>
                                        <br/>
                                <form id="formSubmittedArticle" key={items.id} autocomplete="off"  enctype="multipart/form-data" accept-charset="UTF-8"  method="post">		
                                    <div className="containerArticle">		
                                        <div className="mb-3 field-usereditform-email">		
                                            <label className="control-label" for="usereditform-email">&nbsp;Title<span style={{ color: "#ff0404" }}>(*)</span></label>		
                                            <input type="text" id="usereditform-email" style={{ width: "50%" }} className="form-control" name="title" maxlength="50" 
                                            value={items.title} onChange={handleInputChange} aria-required="true" aria-invalid="false" required />		
                                            <ul className="file-upload-requirement">		
                                                <li>		
                                                max 50 of chars		
                                                </li>		
                                            </ul>		
                                        </div>		
                                        <div className="mb-3 field-usereditform-email">		
                                            <label className="control-label" for="usereditform-email">&nbsp;Short Description<span style={{ color: "#ff0404" }}>(*)</span></label>		
                                            <input type="text" id="usereditform-email" style={{ width: "100%" }}className="form-control" name="description" maxlength="100" 
                                            value={items.description} onChange={handleInputChange} aria-required="true" aria-invalid="false" required />		
                                        </div>		
                                        <div className="mb-3 field-usereditform-email">		
                                            <label className="control-label" for="usereditform-email">&nbsp;Document<span style={{ color: "#ff0404" }}>(*)</span></label>		
                                            <input type="file" id="usereditform-email" style={{ width: "100%" }} className="form-control 
                                            fileformSubmittedArticle" name="article_doc" aria-required="true" aria-invalid="false" 
                                            value={items.article_doc} 
                                            ref={fileInput} 
                                            onChange={ajaxFileUploadImage.bind(this)}
                                            required />
                                        </div>		
                                    </div>		
                                    <div className="text-center" style={{ marginTop: "30px" }}>		

                                        <button onClick={validateForm} type="submit" id="btnSaveformSubmittedArticle" name="btnSave" className="btn btn-outline-black " value="save" style={{ marginTop: "30px" }}>
                                            { loading? "please wait..." : "submit" }
                                        </button>	
                                    </div>		
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        </>
    )
}

export function PopupPreferredTopic(){
    const [modalShow, setModalShow] = useState(false)
    const [global] = useContext(GlobalState)

    const [listPreferredTopic, setListPreferredTopic] = useState([])
    const [readPreferredTopic,setReadPreferredTopic] = useState([])
    const [categoryTopic, setCategoryTopic]  = useState([])

    const [items] = useState([])

    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()

    const [loading, setLoading] = useState(false)
    const file_path = env.userDocument

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='preferredTopic'){
            getListPreferredTopic()
            getReadPreferredTopic()
        }
    },[global.modalProp])

    const getListPreferredTopic =  async ()=>{
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/listPreferredTopic',credentials);
        setListPreferredTopic(isi.data.data);
        setLoading(false)
    }

    const getReadPreferredTopic =  async ()=>{
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/readPreferredTopic',credentials);
        if(isi.status == 200){
            setReadPreferredTopic(isi.data.data);
            setLoading(false)
            setModalShow(true)
        }
    }

    const handleInputChangeTopic = (event) => {
        setLoading(true)
        const target = event.target;
        const values = parseInt(target.value);
        const isChecked = target.checked;
        if (isChecked == true){
            
            categoryTopic.push(
                {
                    id: values
                }
            )
        }else{
            if(categoryTopic.length>0){
                categoryTopic.map(
                    (item, index) =>
                    {
                        
                        if (item.id == values){
                            categoryTopic.splice(index, values)
                        }
                        
                    }
                )
                
            }
        }
        
        setLoading(false)
    }

    const submitTopic= async(e) => {
        e.preventDefault();
        setLoading(true)
        const filterCategory = categoryTopic.filter((item) => item.id != null)

        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        if(filterCategory.length < 3){
            alert("Please choose 3 topic atleast or more.")
        }else{
            let response = await axiosLibrary.postData('awbProfile/deletePreferredTopic',credentials);
            if(response.status === 200){
                
                filterCategory.map(
                    (itemCategory) =>
                    {
                        if(itemCategory.id != null || itemCategory.id != undefined){
                            const credentials2 = {
                                platform_id:platform_id,
                                userid:user_id,
                                topicid: itemCategory.id
                            };
                            axiosLibrary.postData("awbProfile/createPreferredTopic", credentials2)
                        }
                    }
                )
                setModalShow(false)
                localStorage.setItem('showAlertPopupPrefTopic',defaultLang.lang.alertChooseTopic)
                window.location.reload()
                setCategoryTopic([])
                // setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: defaultLang.lang.alertChooseTopic, needSubtitle:false, messageSubtitlePopup:""}}))
            }else{
                alert("Failed to delete data")
            }
        }
        setLoading(false)
    }

    const closeModal = () =>{
        setModalShow(false)
        setCategoryTopic([])
    }

    useEffect(()=>{
        
        if(readPreferredTopic.length>0)
        {
            readPreferredTopic.map(
                (item) =>
                { 
                    if(categoryTopic.filter((itemCat) => itemCat.id == item.topicid).length <=0)
                    {
                        categoryTopic.push(
                            {
                                id: item.topicid
                            }
                        )
                    }
                }
            )
        }
    }, [readPreferredTopic])

    return(
        <>

        <style>
            {
                `.popup-submit{
                    max-width: 900px;
                }`
            }
        </style>

        <Modal 
            dialogClassName="popup-submit"
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
        >
            <Modal.Header style={{border:0}}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" style={{margin:'-0.2rem -1rem -1rem auto'}} onClick={()=>closeModal()}>
                    <img src={`${env.assets}img/close-btn-blue.png`}/>
                </button>                
            </Modal.Header>
            <Modal.Body style={global.modalProp.needSubtitle?{height:'450px'}:null}>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <div className="row">
                            <div className="col-md-12">

                                <div style={{paddingBottom: "10px"}}>		
                                    <h4 className="headtopic" >{defaultLang.lang.select_topic}</h4>	
                                </div>

                                <form id="formPreferredTopic" key={items.id} autocomplete="off"  enctype="multipart/form-data" accept-charset="UTF-8"  method="post">		
                                    <div className="containerArticle">		
                                        <div id="containerTopic">	
                                        {
                                            listPreferredTopic.map(
                                                (itemListTopic, index) =>
                                                {
                                                    const filterTopic = readPreferredTopic.filter((item) => item.topicid == itemListTopic.id)
                                                    return(
                                                        <label key={itemListTopic.id}  className="itemTopic" >	
                                                            <input type="checkbox" name={"cb"+index} id={"cb"+index} value={itemListTopic.id} 
                                                            onChange={handleInputChangeTopic} 
                                                            defaultChecked={filterTopic.length > 0 ? true : false}
                                                            />
                                                            <label for={"cb"+index} className="itemTopic">	
                                                            <img src={itemListTopic.menu_image == null ? 
                                                            'https://dummyimage.com/80x80/ababab/000000' : file_path+"menu/"+itemListTopic.menu_image} 
                                                            onError="this.src='https://dummyimage.com/80x80/ababab/000000';"/>	
                                                            <div className="titletopic"><b dangerouslySetInnerHTML={{__html: itemListTopic.title}	}></b></div>
                                                            </label>
                                                        </label>
                                                    )
                                                }
                                            )
                                        }
                                        </div>
                                    </div>		
                                    <div className="text-center" style={{ marginTop: "30px" }}>		

                                        <button onClick={submitTopic} type="submit" id="btnSaveformSubmittedArticle" name="btnSave" className="btn btn-outline-black " value="save" style={{ marginTop: "30px" }}>
                                            {loading ? defaultLang.lang.loading : defaultLang.lang.start_learning}
                                        </button>	
                                    </div>		
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        </>
    )
}

export function PopupFaq(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [dataFaq, setDataFaq] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='faq'){
            setLoading(true)
            setModalShow(true)
        }
    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, modalProp:{modalShow:false, id:null, type: 'faq'}}))
    }

    const showFaq = async () =>{

        const param = {
            platform_id:securityData.Security_getPlatformId(),
        }

        const response = await axiosLibrary.postData('awbHome/FaqList',param)
        if(response.status === 200){
            setDataFaq(response.data.data)
            setLoading(false)
        }
    }

    return (
        <>
        <style>
            {
                `
                .faq-dialog{
                    max-width: 900px;
                }
                .faq-content{
                    min-height:550px;
                }
                `
            }
        </style>
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            className={"popup-faq"}
            dialogClassName={"faq-dialog"}
            contentClassName={"faq-content"}
            onEnter={()=>showFaq()}
        >
            <Modal.Header style={{border:0}}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" style={{margin:'-0.2rem -1rem -1rem auto'}} onClick={()=>closeModal()}>
                    <img src={`${env.assets}img/close-btn-blue.png`}/>
                </button>                
            </Modal.Header>
            <Modal.Body 
                style={{margin:'20px'}}
            >
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <LoadingData loading={loading} type={'popup'}/>
                        <div className="row" style={cssTarget(loading)}>
                            <div className="col-md-12">
                                <h3 style={{textAlign:'center',paddingBottom:'20px'}}>FAQ</h3>
                                <h5 style={{textAlign:'left',fontFamily:'poppinssemibold',fontSize:'14px'}}>GENERAL TOPIC</h5>
                                <div id="accordion" className="accordion" >
                                {
                                    dataFaq.map((value, idx)=>
                                        <div className="card" key={idx}>
                                            <div className="card-header" id={`heading${value.id}`}>
                                                <h6 className="mb-0"> 
                                                    <a data-toggle="collapse" href={`#collapse${value.id}`} aria-expanded="true" aria-controls={`collapse${value.id}`}>
                                                        {securityData.Security_lang()==='IND'? value.title_ind:value.title}
                                                    </a> 
                                                </h6>
                                            </div>
                                            <div id={`collapse${value.id}`} className={`collapse ${idx<=0 ? `show`:``}`} aria-labelledby={`heading${value.id}`} data-parent="#accordion">
                                                <div className="card-body">
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: securityData.Security_lang()==='IND'? 
                                                        value.page_content_ind
                                                        :
                                                        value.page_content
                                                    }}/>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
        </>
    )
}

export function PopupProfileRedeemPoints(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='profileRedeemPoints'){
            setModalShow(true)
            setShowSuccess(false)
        }
    },[global.modalProp])

    useEffect(()=>{
        if(showSuccess){
            let timer = setTimeout(()=>closeModal(),2000)
            return () => {
                setShowSuccess(false)
                setGlobal(global => ({...global, loadRewardContent:false}))
                clearTimeout(timer)
            }
        }
        
    },[showSuccess])

    const yesRedeem = async () => {
        setLoading(true)
        let id = await axiosLibrary.postData('GetMd5',{id:global.modalProp.id});
        const idClaim = id.data.data;
        const credentials = {
            platform_id:securityData.Security_getPlatformId(),
            user_id:securityData.Security_UserId(),
            productId: idClaim
        };

        let isi = await axiosLibrary.postData('awbRedeem/ClaimReward',credentials);
        if(isi.status ==200){
            setLoading(false)
            setShowSuccess(true)
        }
    }

    const closeModal = () =>{
        setModalShow(false)
        if(showSuccess){
            setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[],loadRewardContent:true}))
        }else{
            setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[]}))
        }
    }

    return(
        <>
        <style>
            {`
                .dialog-popup-reedem{
                    max-width:450px;
                }
                .dialog-popup-reedem .close{
                    top: 17px !important;
                }
            `}
        </style>
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            dialogClassName={'dialog-popup-reedem'}
        >
            <Modal.Header className={"popup-reedem"}>
                <button type="button" className="btn-close" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()} style={{top:"17px !important"}}>
                    <img src={`${env.assets}img/close-btn.png`} /></button>
                <br/>
                <img src={`${env.assets}img/redeem-popup.png`} style={{maxWidth:'100%',position:'absolute', top:0, left:0}}></img>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content pt-4" >
                            {
                                {
                                    [true]: <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                                <h5 className="modal-title popup-description" id="modalMessage">
                                                <div dangerouslySetInnerHTML={{
                                                    __html: showSuccess? defaultLang.lang.redeem_success : defaultLang.lang.redeem_confirm_redeem.replace('[variable1]',global.modalProp.points).replace('[variable2]',global.modalProp.title)
                                                }}/>
                                                </h5>
                                                {showSuccess?
                                                    null
                                                    :
                                                    <button type="button" id="btnRedeemConfirm" name="btnRedeemConfirm" onClick={()=>yesRedeem()} className="btn popup-btn-message" disabled={loading}>
                                                        <LoadingDataButton loading={loading}/>
                                                        <div style={cssTarget(loading)}>
                                                            {defaultLang.lang.general_confirm}
                                                        </div>
                                                    </button>
                                                } 
                                                
                                            </div>
                                }[modalShow]
                            }
                </div>
            </Modal.Body>
        </Modal>
        </>
    )
}

export function PopupFinishSetLearningPlan(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(true)
    const lang = securityData.Security_lang()

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='confirmLearningPlan'){
            setModalShow(true)
            setLoading(false)
        }
    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[]}))
    }

    const confirmPlan = async () =>{
        const param = {
            platform_id:securityData.Security_getPlatformId(),
            step1:global.modalProp.data[0].id,
            step2:global.modalProp.data[1].id,
            step3:global.modalProp.data[2].id
        }

        const response = await axiosLibrary.postData('awbLearningPlan/InsertData',param)
        if(response.status === 200){
            if(response.data.data==='DUPLICATE'){
                setModalShow(false)
                setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: response.data.message, needSubtitle:false, messageSubtitlePopup:""}, alertMessage:false,optionSelectedUser:[]}))
            }else{
                closeModal()
                window.location.href = routeAll.routesUser.learningPage.path
            }
        }
    }

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            className={"popup-finish-learning-plan"}
            centered
            contentClassName={"popup-content-finish-learning-plan"}
            size='md'
            dialogClassName={"popup-dialog-finish-learning-plan"}
        >
            <Modal.Body className={"popup-body-finish-learning-plan"}>
                <LoadingData loading={loading} type={'popup'}/>
                <div className="p-3" style={{...cssTarget(loading),padding:"15px"}}>
                    <div className="text-center pb-3">
                        {global.modalProp.data?
                        <div className="d-flex flex-row flex-wrap justify-content-center">
                            <div className="btn-choose-step result-step m-1 pe-3 ps-3 pt-2 pb-2">
                                { global.modalProp.data[0].title_menu }
                            </div>
                            <div className="arrow-step m-1 p-2">
                                <i className="fa fa-chevron-right " aria-hidden="true" ></i>
                            </div>
                            <div className="btn-choose-step result-step m-1 pe-3 ps-3 pt-2 pb-2">
                                { lang=='ENG' ? global.modalProp.data[1].title_eng : global.modalProp.data[1].title_ind}
                            </div>
                            <div className="arrow-step m-1 p-2">
                                <i className="fa fa-chevron-right " aria-hidden="true" ></i>
                            </div>
                            <div className="btn-choose-step result-step m-1 pe-3 ps-3 pt-2 pb-2">
                                { lang=='ENG' ? global.modalProp.data[2].title :  global.modalProp.data[2].title_ind}
                            </div>
                        </div>
                        :null}
                    </div>
                    <div>
                        <div dangerouslySetInnerHTML={{__html:defaultLang.lang.confirmLearningPlan}}/>
                    </div>
                    <div className="d-flex flex-row text-uppercase justify-content-center pt-5">
                        <div className="pe-5 btn-confirm" onClick={()=>confirmPlan()}>{defaultLang.lang.yes}</div>
                        <div className="pe-3 ps-3">&nbsp;</div>
                        <div className="ps-5 btn-confirm" onClick={()=>closeModal()}>{defaultLang.lang.no}</div>
                    </div>

                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupSff(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(true)
    const lang = securityData.Security_lang()
    const [state, setState] =useState([])

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='showDetailSff'){
            setModalShow(true)
            setLoading(false)
            setState(global.modalProp.dataSff)
        }

        if(global.modalProp.type==='alertShow'){
            closeModal()
        }

    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[],blur:false,sidebarBlur:false}))
    }

    const registerSff = ()=>{
        setGlobal(global=>({...global,modalProp:{modalShow:true, id:global.modalProp.id, type: 'registerCourse'},blur:true}))
    }

    useEffect(()=>{
        if(global.modalProp.dataSff){
            changeEngInd()
        }

    },[global.modalProp.dataSff,modalShow])

    const changeEngInd = ()=>{
        let content = ""
        const contentFormat = [
            {type:1,textEng:"Short Course", textInd: "Kursus Pendek"},
            {type:2,textEng:"Executive Education", textInd: "Pendidikan Eksekutif"},
            {type:3,textEng:"Certification", textInd: "Sertifikasi"},
            {type:0,textEng:"#AWB Online Content", textInd: "#Konten Daring AWB"},
        ]
        if(lang==='ENG'){
            content = {
                content_title:global.modalProp.dataSff.content_title_eng,
                content_desc:global.modalProp.dataSff.content_description_eng,
                content_format:contentFormat.find(v=>v.type===global.modalProp.dataSff.content_course_type).textEng,
            }
        }else{
            content = {
                content_title:global.modalProp.dataSff.content_title_ind,
                content_desc:global.modalProp.dataSff.content_description_ind,
                content_format:contentFormat.find(v=>v.type===global.modalProp.dataSff.content_course_type).textInd,
            }
        }
        setState(state=>({...state,...content}))
    }

    const renderLeftSide = ()=>{
        return(
            <div className="d-flex flex-column">
                <div className="mb-3"><h4>{state.content_title}</h4></div>
                <div className="mb-3 popup-desc-sff">{state.content_desc}</div>
            </div>
        )
    }

    const renderRightSide = ()=>{
        return(
            <div className="col-sm-6 popup-righside">
                <div className="row">
                    <div className="col-sm-6">
                        <div className="mb-3 popup-title-rightside">Format</div>
                        <div className="popup-desc-rightside">{state.content_format}</div>
                    </div>
                </div>
                <div className="pt-4 row">
                    <div className="col-sm-6 pb-4">
                        <div className="popup-title-rightside">
                            {{
                                "0": <img className="icon-popup-sff" src={env.assets + "img/bhs_indo.svg"} alt="icon bhs indo"/>,
                                "1": <img className="icon-popup-sff" src={env.assets + "img/bhs_english.svg"} alt="icon bhs english"/>,
                                "2": <>
                                    <img className="icon-popup-sff" src={env.assets + "img/bhs_indo.svg"} alt="icon bhs indo"/> &nbsp;
                                    <img className="icon-popup-sff" src={env.assets + "img/bhs_english.svg"} alt="icon bhs english"/>
                                </>
                            }[state.language_avail]}
                        </div>
                        <div className="popup-desc-rightside">
                            {{
                                "0": <>Bahasa</>,
                                "1": <>English</>,
                                "2": <>
                                    Bahasa & English
                                </>
                            }[state.language_avail]}
                        </div>
                    </div>
                    <div className="col-sm-6 pb-4">
                        <div className=" popup-title-rightside"><img className="icon-popup-sff" src={env.assets + "img/biaya_icon_popup.svg"} alt="icon biaya"/></div>
                        <div className="popup-desc-rightside">
                            {state.price_amt==0||state.price_amt==null?
                                <>FREE</>
                            :
                                `${state.price_type} ${state.price_amt}`
                            }
                        </div>
                    </div>
                    <div className="col-sm-6 pb-4">
                        <div className=" popup-title-rightside"><img className="icon-popup-sff" src={env.assets + "img/durasi_icon_popup.svg"} alt="icon durasi"/></div>
                        <div className="popup-desc-rightside">
                        {
                            state.duration_amt==null || state.duration_amt==""||state.duration_amt==0?
                            null
                            :
                            <> 
                            {state.months>0 && `${state.months} month${state.months>1 ? `s `:` ` }` }
                            {state.weeks>0 && `${state.weeks} week${state.weeks>1 ? `s `:` `}` }
                            {state.days>0 && `${state.days} day${state.days>1 ? `s `:` `}` }
                            {state.hours>0 && `${state.hours} hour${state.hours>1 ? `s `:` `}` }
                            {state.minutes>0 && `${state.minutes} minute${state.minutes>1 ? `s `:` `}` }
                            </>
                        }
                        </div>
                    </div>
                </div>
                
            </div>
        )
    }

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            className={`popup-finish-learning-plan ${global.blur && `popup-blur`}`}
            centered
            contentClassName={"popup-content-finish-learning-plan addon-popup-content-sff"}
            size='md'
            dialogClassName={"popup-dialog-finish-learning-plan"}
        >
            <Modal.Header className='popup-header-sff pb-0 pt-0'>
                <img src={`${env.assets}img/Artboard 3.png`} width={150}></img>
                <button type="button" className="btn-close mt-1" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()}><img src={`${env.assets}img/close-btn.png`}/></button>
            </Modal.Header>
            <Modal.Body className={"popup-body-finish-learning-plan m-3"}>
                <LoadingData loading={loading} type={'popup'}/>
                <div className="d-flex flex-column">
                    <div className="row">
                        <div className="col-sm-6">
                            {renderLeftSide()}
                        </div>
                        {renderRightSide()}
                    </div>
                    <div className="d-flex flex-row text-uppercase justify-content-center pt-5 pb-2">
                        <div className="btn-confirm" onClick={()=>window.location.href=state.content_hyperlink_url}>{defaultLang.lang.moreInfo}</div>
                        <div className="pe-3 ps-3">&nbsp;</div>
                        <div className="ps-5 btn-confirm" onClick={()=>registerSff()}>{defaultLang.lang.registerNow}</div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupWorkShop(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [loading, setLoading] = useState(true)
    const lang = securityData.Security_lang()
    const [state, setState] =useState([])

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='showDetailWorkshop'){
            setModalShow(true)
            setLoading(false)
            setState(global.modalProp.dataWorkShop)
        }

        if(global.modalProp.type==='alertShow'){
            closeModal()
        }

    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[],blur:false,sidebarBlur:false}))
    }

    useEffect(()=>{
        if(global.modalProp.dataWorkShop){
            changeEngInd()
        }

    },[global.modalProp.dataWorkShop,modalShow])

    const renderCapacityWorkshop = (data) =>{
        let renderData = ''
        if(data.content_type_id===2){
            if(data.workshop_total_user >= data.workshop_capacity){
                renderData = defaultLang.lang.workshopCapacityNoSeats
            }else{
                let sisaCapacity = data.workshop_capacity - data.workshop_total_user
                if(sisaCapacity == 1){
                    renderData =  defaultLang.lang.workshopCapacityOnlyOne
                }else{
                    renderData = defaultLang.lang.workshopCapacityMoreThanOne.replace('[x]',sisaCapacity)
                }
            }
        }
        return(
            renderData
        )
    }

    const changeEngInd = ()=>{
        let content = ""
        if(lang==='ENG'){
            content = {
                content_title:global.modalProp.dataWorkShop.content_title_eng,
                content_desc:global.modalProp.dataWorkShop.content_description_eng,
                content_format:renderCapacityWorkshop(global.modalProp.dataWorkShop)
            }
        }else{
            content = {
                content_title:global.modalProp.dataWorkShop.content_title_ind,
                content_desc:global.modalProp.dataWorkShop.content_description_ind,
                content_format:renderCapacityWorkshop(global.modalProp.dataWorkShop)
            }
        }
        setState(state=>({...state,...content}))
    }

    const registerWorkShop = ()=>{
        switch (state.content_workshop_sub_type) {
            case "W":
                setGlobal(state=>({...state,modalProp:{modalShow:true, id:global.modalProp.id, type: 'redeem', name:"WorkShop"},blur:true}))
                break;
            case "S":
                setGlobal(state=>({...state,modalProp:{modalShow:true, id:global.modalProp.id, type: 'redeem', name:"Sharing Session"},blur:true}))
                break;
            default:
                break;
        }
    }

    const renderLeftSide = ()=>{
        return(
            <div className="d-flex flex-column">
                <div className="mb-3"><h4>{state.content_title}</h4></div>
                <div className="mb-3 popup-desc-sff" dangerouslySetInnerHTML={{__html:state.content_desc}}/>
            </div>
        )
    }

    const renderRightSide = ()=>{
        return(
            <div className="col-sm-6 popup-righside align-self-center">
                <div className="row">
                    <div className="col-sm-6">
                        <div className="popup-title-rightside"><img className="icon-popup-sff" src={env.assets + "img/seat_available_people_popup.svg"} alt="icon seat available"/></div>
                        <div className="popup-desc-rightside">{state.content_format}</div>
                    </div>
                </div>
            </div>
        )
    }

    const renderButton = [
        {click:()=>window.open(state.content_hyperlink_url,"_blank"), desc:defaultLang.lang.moreInfo},
        {click:()=>registerWorkShop(), desc:defaultLang.lang.registerNow}
    ]

    return(
        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            className={`popup-finish-learning-plan ${global.blur && `popup-blur`}`}
            centered
            contentClassName={"popup-content-finish-learning-plan addon-popup-content-sff"}
            size='md'
            dialogClassName={"popup-dialog-finish-learning-plan"}
        >
            <Modal.Header className='popup-header-sff pb-0 pt-0'>
                {/* <img src={`${env.assets}img/Artboard 3.png`} width={150}></img> */}
                <button type="button" className="btn-close mt-1" data-dismiss="modal" aria-hidden="true" onClick={()=>closeModal()}><img src={`${env.assets}img/close-btn.png`}/></button>
            </Modal.Header>
            <Modal.Body className={"popup-body-finish-learning-plan m-3"}>
                <LoadingData loading={loading} type={'popup'}/>
                <div className="d-flex flex-column">
                    <div className="row">
                        <div className="col-sm-6">
                            {renderLeftSide()}
                        </div>
                        {renderRightSide()}
                    </div>
                    <div className="d-flex flex-row text-uppercase justify-content-center pt-5 pb-2">
                        {
                            renderButton.map((v,idx)=>
                                <div key={idx} className="btn-confirm pe-4 ps-4" onClick={v.click}>{v.desc}</div>
                            )
                        }
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupAds(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(null)
    const lang = securityData.Security_lang()
    const file_path= env.userDocument

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='popupAds'){
            setItems(global.modalProp.adsData)
            setTotal(global.modalProp.totalAds)
        }
    },[global.modalProp])

    const trackAds = (async ()=>{
        const credentials = {
            platform_id:securityData.Security_getPlatformId(),
            user_id : securityData.Security_UserId(),
            id_ads : items.id,
        };
        let isi = await axiosLibrary.postData('awbAds/TrackAds',credentials);
        if(isi.status === 200){ 
            setModalShow(true)
        }
    })

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false}))
    }

    useEffect(()=>   {
        if(total<items.frequency){
            trackAds()
        }
    },[items, total])

    return(
        <>
        <style>
            {`
                .dialog-popup-ads{
                    max-width:50%;
                    background: transparent;
                }
                .buttonExitPopup{
                    position: absolute;
                    right:-40%;
                    top:0;
                    cursor: pointer;
                }
            `}
        </style>

        <Modal
            show={modalShow} 
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            dialogClassName={'dialog-popup-ads'}
        >
            <img src={buttonExit} className="buttonExitPopup" onClick={()=>closeModal()}/>
            {
                total<=items.frequency ?
                    <a href={items.hyperlink_url? items.hyperlink_url : "#"} 
                    onClick={()=>closeModal()}
                    target={
                            items.hyperlink_url?
                                items.open_type == 0? '_self' : '_blank'
                                : '_self'
                        } rel="noreferrer" >
                        {
                        lang=='ENG' ?
                                <img  style={{width:"100%",height:"auto"}} src={file_path+ "ads/" + items.image} alt="" />
                                :
                                <img  style={{width:"100%",height:"auto"}} src={file_path+ "ads/" + items.image_ind} alt="" />
                        
                        }           
                    </a>
                    :""
            }
        </Modal>
        </>
    )}

export function PopupChooseTypeLearningPlan(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [, setLoading] = useState(true)

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='ChooseTypeLearningPlan'){
            setModalShow(true)
            setLoading(false)
        }
    },[global.modalProp])

    const closeModal = () =>{
        setModalShow(false)
        setGlobal(global => ({...global, alertMessage:false, optionSelectedUser:[]}))
    }

    const chooseType = type => {
        switch (type) {
            case defaultLang.lang.txtPresetLearningPlan:
                window.location.href = `${routeAll.routesUser.learningPage.path}?`+new URLSearchParams({type: "create"}).toString()+"&"+new URLSearchParams({user: securityData.Security_UserAccount()}).toString();

                break;
            case defaultLang.lang.txtCustomLearningPlan:
                window.location.href = `${routeAll.routesUser.learningPage.path}?`+new URLSearchParams({type: "create"}).toString()+"&"+new URLSearchParams({user: securityData.Security_UserAccount()}).toString()+"&"+new URLSearchParams({create:"custom"});
                break;
            default:
                break;
        }
    }

    return(
        <Modal
            className={"popup-finish-learning-plan"}
            centered
            contentClassName={"popup-content-finish-learning-plan"}
            size='md'
            dialogClassName={"popup-dialog-finish-learning-plan"}
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            show={modalShow} 
        >
            <Modal.Body className={"popup-body-finish-learning-plan"}>
                <div className="p-3" style={{padding:"15px"}}>
                    <div className="text-center">
                        <div dangerouslySetInnerHTML={{__html:defaultLang.lang.txtPopupChooseTypeLearningPlan}}/>
                    </div>
                    <div className="d-flex flex-row text-uppercase justify-content-center pt-5">
                        <div className="pe-5 btn-confirm" onClick={()=>chooseType(defaultLang.lang.txtPresetLearningPlan)}>{defaultLang.lang.txtPresetLearningPlan}</div>
                        <div className="pe-3 ps-3">&nbsp;</div>
                        <div className="ps-5 btn-confirm" onClick={()=>chooseType(defaultLang.lang.txtCustomLearningPlan)}>{defaultLang.lang.txtCustomLearningPlan}</div>
                    </div>

                </div>
            </Modal.Body>
        </Modal>
    )
}

export function PopupFormCustomLearningPlan(){
    const [modalShow, setModalShow] = useState(false)
    const [global, setGlobal] = useContext(GlobalState)
    const [, setLoading] = useState(true)
    const lang = securityData.Security_lang()
    const [state, setState] =useState({
        listSelectedModule:[],
        platform_id: securityData.Security_getPlatformId()
    })
    const [optionType, setOptionType] = useState([]);
    const [loadingType, setLoadingType] = useState(true);
    const [loadingModule, setLoadingModule] = useState(true);
    const [allContent, setAllContent] = useState([]);
    const [optionModule, setOptionModule] = useState([]);
    const txtLang = defaultLang.lang
    const platform_id = securityData.Security_getPlatformId()

    useEffect(()=>{
        if(global.modalProp.modalShow && global.modalProp.type==='formCustomLearningPlan'){
            setLoading(true)
            setModalShow(true)
        }
    },[global.modalProp])

    useEffect(()=>{
        if(modalShow){
            getContentType()
            getContentFromType()
        }
    },[modalShow])

    useEffect(()=>{
        setLoadingModule(true)
        if(state.type){
            const listDataOptionModule = allContent.filter(v=>v.contentId==state.type).map(v=>{
                return{
                    value:v.id,label:lang=="ENG"?v.title:v.title_ind,description:lang=="ENG"?v.description:v.description_ind,tags:v.tags?v.tags:""
                }
            })
            setOptionModule(listDataOptionModule)
            setLoadingModule(false)
            setState(state=>({...state,module:""}))
        }
    },[state.type])

    const getContentType = async () => {
        setLoadingType(true)
        const credentials = {
            limit: 9999,
            offset:0,
            category:"",
            flag_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbContentType/ListData',credentials);
        if(isi.status===200){
            let typeContent = isi.data.data.map(v=>{
                return{
                    value:v.id,label:v.title
                }
            })
            setOptionType(typeContent)
            setLoadingType(false)
        }
    }

    const getContentFromType = async () => {
        const param = {
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbContentType/GetContentFromType',param);
        if(isi.status===200){
            setAllContent(isi.data.data)
        }
    }

    const closeModal = () =>{
        setModalShow(false)
        setState({
            listSelectedModule:[],
        })
        setGlobal(global => ({...global, modalProp:{modalShow:false, id:null, type: 'alertShow'}, alertMessage:false, optionSelectedUser:[]}))
    }

    const showChooseModule = (e)=>{
        e.preventDefault()
        setState(state=>({...state,showChooseModule:true}))
    }

    const customStyleReactSelect ={
        control: (base, state) => ({
            ...base,
            border: state.isFocused ? 0 : 0,
            // This line disable the blue border
            boxShadow: state.isFocused ? 0 : 0,
            '&:hover': {
               border: state.isFocused ? 0 : 0
            }
        })
    }
    
    const themeReactSelect = (theme)=>{
        let themeVar = {
            ...theme,
            colors: {
                ...theme.colors,
                primary75:"#4b4881",
                primary25: '#4b4881',
                primary: '#fff',
                neutral0:'#403a68',
                neutral40:'#fff',
                neutral50:'#7973b3',
                neutral60:'#7973b3',
                neutral80:"#7973b3",
            },
        }
        return themeVar
    }

    const customFilter = (option, searchText)=>{
        if(
            option.data.label.toLowerCase().includes(searchText.toLowerCase()) || 
            option.data.description.toLowerCase().includes(searchText.toLowerCase()) ||
            option.data.tags.toLowerCase().includes(searchText.toLowerCase())
        ){
            return true
        }else{
            return false
        }
    }

    const typeNModuleComponent = (data,idx)=>{
        return(
            <div className='pb-1 type-n-module' key={idx}>
                <Form.Group >
                    <Form.Row>
                        <Form.Label column sm={2}>
                            {data.label}
                        </Form.Label>
                        <Col sm={6}>
                            <Select
                                theme={(theme) => themeReactSelect(theme)}
                                styles={customStyleReactSelect}
                                className="dropdown-type-n-module"
                                classNamePrefix="select"
                                value={data.option.filter(v=>v.value == state[data.name])}
                                onChange={(e,action)=>setState(state=>({...state,[action.name]:e.value}))}
                                name={data.name}
                                options={data.option}
                                components={{
                                    IndicatorSeparator: () => null
                                    }}
                                isLoading={data.loading}
                                placeholder={data.placeholder}
                                menuPlacement={"auto"}
                                filterOption={customFilter}
                            />
                        </Col>
                    </Form.Row>
                </Form.Group>
            </div>
        )
    }
    
    const listTypeNModuleData = [
        {label:txtLang.formLblType,option:optionType,name:"type",placeholder:txtLang.foromPlaceholderDropdown,loading:loadingType},
        {label:txtLang.formLblModule,option:optionModule,name:"module",placeholder:txtLang.foromPlaceholderDropdown,loading:loadingModule},
    ]

    const addTemporaryModule = ()=>{
        if(!state.type || !state.module){
            alert("NO MODULE SELECTED")
        }else{
            const currentModule = {
                contentId: state.type,
                id_module:state.module
            }
            if(state.listSelectedModule.filter(v=>v.contentId==currentModule.contentId && v.id_module==currentModule.id_module).length > 0){
                alert("MODULE ALREADY CHOOSEN")
            }else{
                setState(state=>({...state,module:"",listSelectedModule:[...state.listSelectedModule,currentModule]}))
            }
        }
    }
    
    const renderListModule = ()=>{
        const dataListModule = state.listSelectedModule
        const render = dataListModule.map(v=>
            allContent.filter(x=>x.contentId==v.contentId && x.id==v.id_module).map((v,idx)=>
                <Card className={`card-module-step-3`} key={idx}>
                    <CardDataModule data={v}/>
                </Card>
            )
        )
        return render
    }

    const submitCustomLP = async () =>{
        const param = {...state,
            platform_id: securityData.Security_getPlatformId(),
            step1:global.modalProp.dataLp[0].id,
            step2:global.modalProp.dataLp[1].id
        }
        const response = await axiosLibrary.postData('awbLearningPlan/InsertDataCustom',param)
        if(response.status === 200){
            if(response.data.data==='DUPLICATE'){
                setModalShow(false)
                setGlobal(global => ({...global, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: response.data.message, needSubtitle:false, messageSubtitlePopup:""}, alertMessage:false,optionSelectedUser:[]}))
            }else{
                closeModal()
                window.location.href = routeAll.routesUser.learningPage.path
            }
        }
    }

    return(
        <Modal
            onHide={()=>closeModal()}
            onExited={()=>closeModal()}
            show={modalShow}
            className={'popup-form-custom-learning-plan'}
        >
            <Modal.Body>
                <div className="row m-0 p-0">
                    <div className="col-sm-6 form-content">
                        <div className="pb-5"><img className="logo-default" src={env.assets+"img/header_logo_white.svg"} alt="logo" /></div>
                        <div className="pt-2 form-custom-back-button cursor-pointer" onClick={()=>closeModal()}>{`<`}&nbsp;{txtLang.movementCompManageBackBtn}</div>
                        <div className='d-flex flex-column pt-3 pb-3'>
                            <div className="learning-plan-name">
                                <div className="lbl-learning-plan-name">{txtLang.formLblLearningPlanName}</div>
                                <form onSubmit={showChooseModule}>
                                    <div className="input-learning-plan-name pt-3 pb-4">
                                        <input type="text" autoComplete='off' className="form-control" name="lp_name" value={state.lp_name} onChange={(e)=>setState(state=>({...state,[e.target.name]:e.target.value}))} required={true}/>
                                    </div>
                                    <div className="pt-3 pb-5 button-add-content">
                                        <button type="submit" className="btn btn-primary">
                                            <i class="fa fa-plus" aria-hidden="true"></i>&nbsp;{txtLang.formButtonAddContent}&nbsp;
                                        </button>
                                    </div>
                                </form>
                                {state.showChooseModule &&
                                    <>
                                        {listTypeNModuleData.map((v,idx)=>
                                            typeNModuleComponent(v,idx)
                                        )}
                                        <div className="button-add col-sm-8 p-0 pt-1 text-end">
                                            <button type="button" className="btn btn-primary" onClick={()=>addTemporaryModule()}>
                                                {txtLang.formButtonAdd}
                                            </button>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 module-content d-flex flex-column">
                        <div className="mt-auto">
                            <div className="d-flex flex-row justify-content-between detail-list-skill-header">
                                <div>{state.listSelectedModule.length} MODULES</div>
                            </div>
                        </div>
                        <div className="pe-2 overflow-auto">
                                {state.listSelectedModule.length > 0 ?
                                    renderListModule()
                                :
                                    <div>no module added</div>
                                }
                        </div>
                        {/* <div className="button-submit pt-5">
                            <button type="button" className="btn btn-primary">
                                {txtLang.formButtonSubmitAll}
                            </button>
                        </div> */}
                        {state.listSelectedModule.length > 0 ?
                            <div className="text-end pt-2">
                                <button type="button" className="btn btn-primary btn-sm btn-choose-step button-finish" onClick={()=>submitCustomLP()}>
                                    {defaultLang.lang.chooseTheseModuleText}
                                </button>
                            </div>
                        :null}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}