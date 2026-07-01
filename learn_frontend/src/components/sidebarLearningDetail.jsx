import React, { useEffect, useState, useContext } from 'react';
import { Card, Image, Offcanvas, CloseButton, ProgressBar } from 'react-bootstrap';
import defaultLang from '../helpers/lang';
import axiosLibrary from '../helpers/axiosLibrary';
import { isMobile } from 'react-device-detect';
import { env, securityData } from '../helpers/globalHelper';
import { Rating } from 'react-simple-star-rating';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/css/sidebarLearningDetail.scss";
import GlobalState from '../helpers/globalState';
import { cssTarget, LoadingData } from './Loading';
import CardDataModule from './cardDataModule';

import moment from 'moment';
import 'moment/locale/id';

export function SidebarLearningDetail(props){
    const lang = securityData.Security_lang()
    const platform_id = securityData.Security_getPlatformId()
    const userDocument = env.userDocument
    const assets = env.assets
    const [global, setGlobal] = useContext(GlobalState)
    const [show, setShow] = useState(false);
    const [state,setState] = useState({
        dataModule:[],
        skillsDataUsers:{},
        loading:false,
    })

    const getModuleDetailData = async()=>{
        const credentials = {
            platform_id:platform_id,
            learning_users:state.skillsDataUsers.id

        };
        const isi = await axiosLibrary.postData('awbLearningPlan/ModuleDetailData',credentials);
        if(isi.status===200){
            setState(state=>({...state,
                dataModule:isi.data.data,
                loading:false,
            }))
        }
    }

    const checkUserLearningPlan = async () =>{
        const credentials = {
            platform_id:platform_id,
            learning_users:global.sidebarLearningDetail ? global.sidebarLearningDetail.data:0,
            from_where:'sidebar_learning'
        }
    
        const response = await axiosLibrary.postData('awbLearningPlan/CheckUserLearningPlan',credentials);
        if(response.status===200){
            if(global.sidebarLearningDetail){
                let dataLearningUsers = response.data.data.filter(v=>v.id===global.sidebarLearningDetail.data)
                if(dataLearningUsers.length > 0){
                    setState(state=>({...state,
                        skillsDataUsers:dataLearningUsers[0],
                    }))
                }
            }
        }
    }

    // const updateProgress = async()=>{
    //     const credentials = {
    //         learning_users:global.sidebarLearningDetail.data
    //     }
    //     const isi = await axiosLibrary.postData('awbLearningPlan/UpdateUserLearningProgress',credentials);
    //     if(isi.status===200){
    //         checkUserLearningPlan()
    //     }
    // }

    useEffect(()=>{
        if(global.sidebarLearningDetail){
            if(global.sidebarLearningDetail.status){
                setShow(true)
                setState(state=>({...state,
                    skillsDataMaster:global.sidebarLearningDetail.dataSkills,
                    loading:true
                }))
            }
        }

    },[global.sidebarLearningDetail])

    useEffect(()=>{
        if(state.loading){
            checkUserLearningPlan()
        }
    },[state.loading])

    useEffect(()=>{
        if(global.modalProp.loadContent){
            setState(state=>({...state,
                loading:true
            }))
        }
    },[global.modalProp])

    useEffect(()=>{
        if(state.skillsDataUsers.id){
            getModuleDetailData()
        }
    },[state.skillsDataUsers])

    const handleClose = () => {
        setShow(false)
        setGlobal(global => ({...global, loadContentSidebarProfile:true, sidebarLearningDetail:{data:[],status:false}}))
        setState(state=>({...state,skillsDataUsers:{}}))
    }

    //click event article, course, PSBB, challenge card
    const onClickEventArticle = async (type, param)=>{
        switch (type) {
            case 'shareArticle':
                setGlobal(state=>({...state,modalProp:{modalShow:true, id:param.id, type:'article'},flagShowArticle:true}))
                break;
            case 'loadArticleQuiz':
                // if(!state.flagShowArticle){
                //     await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                // }
                setGlobal(state=>({...state,sidebarBlur:true,modalProp:{modalShow:true, id:param.id, type: 'quiz',param:param}, flagShowArticle:false}))
                break;
            case 'logActivityArticle':
                if(!global.flagShowArticle){
                    let isi = await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                    if(isi){
                        if(isi.status===200){
                            setGlobal(state=>({...state,modalProp:{modalShow:false, id:null, loadContent: true}}))
                        }
                    }
                }
                window.open(param.hyperlink_url,'_blank')
                break;
            case 'loadIqosQuiz':
                if(param.allowJoin>1){
                    if(!global.flagShowArticle){
                        await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                        setGlobal(state=>({...state,modalProp:{modalShow:true, id:param.id, type: 'quiz', iqosQuiz:1}, flagShowArticle:false}))
                    }
                }else{
                    let alertSuccess = 
                    <div dangerouslySetInnerHTML={{
                        __html: defaultLang.lang.alreadySubmitQuizIqos
                    }}/>
                    setGlobal(state => ({...state, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:""}}))
                }
                break;
            default:
                break;
        }
        
    }

    //click event workshop
    const onClickEventWorkshop = (contentItem)=>{
        setGlobal(state=>({...state,sidebarBlur:true,modalProp:{modalShow:true, id:contentItem.content_id, type: 'showDetailWorkshop',dataWorkShop:contentItem}}))
    }

    //click event skills for future
    const onClickEventSff = async (param, course_type)=>{

        switch (course_type) {
            case 0:
                if(course_type===0){
                    if(!global.flagShowArticle){
                        let isi = await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.id,trnId: param.id})
                        if(isi){
                            if(isi.status===200){
                                setGlobal(state=>({...state,modalProp:{modalShow:false, id:null, loadContent: true}}))
                            }
                        }
                        window.open(param.hyperlink_url,'_blank')
                    }
                }
                break;
            default:
                if(props.thisStateGlobal.activePeriod == null){
                    alert("Enrollment Closed")
                }else{
                    if(param.sff_flag_registered == 0){
                        setGlobal(state=>({...state,sidebarBlur:true,modalProp:{modalShow:true, id:param.id, type: 'showDetailSff',dataSff:param.data}}))
                        // setGlobal(state=>({...state,modalProp:{modalShow:true, id:param.id, type: 'registerCourse'}}))
                    }
                }
                break;
        }
    }

    const readButton = (contentItem) => {
        switch (props.typeSlider) {
            case 'contentForYou':
                if (contentItem.show_quiz==1) {
                    onClickEventArticle('loadArticleQuiz',{
                        content:contentItem.content_type_title_eng,
                        articleId: contentItem.article_id,
                        id:contentItem.id
                    })
                }else{
                    onClickEventArticle('logActivityArticle',{
                        content:contentItem.content_type_title_eng,
                        articleId: contentItem.article_id,
                        id:contentItem.id,
                        hyperlink_url:contentItem.hyperlink_url
                    })
                }
                break;
        
            default:
                switch (contentItem.content_type_id) {
                    case 2:
                        //workshop
                        onClickEventWorkshop(contentItem)
                        break;
                    case 3:
                        //Skills For Future
                        onClickEventSff({
                            content:contentItem.content_type_title_eng,
                            articleId: contentItem.content_article_id,
                            id:contentItem.content_id,
                            hyperlink_url:contentItem.content_hyperlink_url,
                            sff_flag_registered:contentItem.sff_flag_registered,
                            data:contentItem
                        },contentItem.content_course_type)
                        break;
                    case 5:
                        //PSBB
                        onClickEventArticle('logActivityArticle',{
                            content:contentItem.content_type_title_eng,
                            articleId: contentItem.content_id,
                            id:contentItem.content_id,
                            hyperlink_url:contentItem.content_hyperlink_url
                        })
                        break;
                    default:
                        //article, course, challenge card
                        if (contentItem.article_show_quiz==1) {
                            onClickEventArticle('loadArticleQuiz',{
                                content:contentItem.content_type_title_eng,
                                articleId: contentItem.content_article_id,
                                id:contentItem.content_id
                            })
                        }else{
                            onClickEventArticle('logActivityArticle',{
                                content:contentItem.content_type_title_eng,
                                articleId: contentItem.content_article_id,
                                id:contentItem.content_id,
                                hyperlink_url:contentItem.content_hyperlink_url
                            })
                        }
                        break;
                }
                break;
        }
    }

    const propProgressBar = (value, date_modified) => {
        return{
            now:value==0?5:value,
            max:value==0?5:value,
            style:{
                width:value==0?'5%':`${isMobile?value*(89/100):value*(75/100)}%`
            },
            variant:changeColor(value, date_modified).progress
        }
    }

    const changeColor = (progress_lp, date_modified)=>{
        let varColor = {text:"text-danger",progress:"danger", border:"border-danger"}
        if (moment(moment.utc(date_modified)).add(30,'days').format() <= moment(moment.utc()).format()) {
            varColor = {text:"text-danger",progress:"danger", border:"border-danger"}
        } else {
            if(progress_lp < 0){
                varColor = {text:"text-danger",progress:"danger", border:"border-danger"}
            }else if(progress_lp < 61){
                varColor = {text:"text-warning",progress:"warning", border:"border-warning"}
            }else{
                varColor = {text:"text-success",progress:"success", border:"border-success"}
            }
        }
        return varColor
    }

    const renderHeader = ()=>{
        return(
        <div className="d-flex flex-row align-items-center p-5" style={cssTarget(state.loading)}>
            <div className="pr-3 sidebar-learning-detail-image-header">
                <Image 
                    src={userDocument + "category/"+ state.skillsDataUsers.category_image} title={state.skillsDataUsers.category_image}
                    onError={(e)=>e.target.src="https://via.placeholder.com/300x190"}
                />
            </div>
            <div className="title-offcanvas pr-4">
                <div className="d-flex flex-column">
                    <div>
                        <h5 className='m-0 mb-1'>{lang==='ENG'?state.skillsDataUsers.title:state.skillsDataUsers.title_ind}</h5>
                    </div>
                    <div className="subtitle-offcanvas pb-3">
                        {lang==='ENG'?state.skillsDataUsers.description:state.skillsDataUsers.description_ind}
                    </div>
                    <div className="subtitle-offcanvas">
                        {moment(moment.utc(state.skillsDataUsers.date_modified)).add(30,'days').format() <= moment(moment.utc()).format() ?
                            <div className="learning-home-last-visited text-danger">{defaultLang.lang.lastVisited}</div>
                        :
                        <div className="d-flex flex-row flex-wrap align-items-center">
                            <ProgressBar {...propProgressBar(state.skillsDataUsers.progress_lp,state.skillsDataUsers.date_modified)}/>
                            <div className={changeColor(state.skillsDataUsers.progress_lp,state.skillsDataUsers.date_modified).text}>&nbsp;&nbsp;{state.skillsDataUsers.progress_lp}%</div>
                        </div> 
                        }
                    </div>
                </div>
            </div>
            <div className="ml-auto align-self-start">
                <CloseButton onClick={()=>handleClose()} variant="white" />
            </div>
        </div>
        )
    }

    // const renderCapacityWorkshop = (data) =>{
    //     let renderData = ''
    //     if(data.type_of_content===2){
    //         if(data.workshop_total_user >= data.workshop_capacity){
    //             renderData = defaultLang.lang.workshopCapacityNoSeats
    //         }else{
    //             let sisaCapacity = data.workshop_capacity - data.workshop_total_user
    //             if(sisaCapacity == 1){
    //                 renderData =  defaultLang.lang.workshopCapacityOnlyOne
    //             }else{
    //                 renderData = defaultLang.lang.workshopCapacityMoreThanOne.replace('[x]',sisaCapacity)
    //             }
    //         }
    //     }
    //     return(
    //         renderData
    //     )
    // }

    // const renderOptionalDescription = (data) =>{
    //     let renderData = ''
        
    //     if(data.flag_required == 0){
    //         renderData = defaultLang.lang.opsional
    //     }

    //     return(
    //         renderData
    //     )
    // }

    const renderBody = ()=>{
        return(
            state.dataModule ?
            <div className={`col-sm-12 ${isMobile?`pr-3 pl-3`:`pr-5 pl-5`} pt-4 pb-4`} >
                <LoadingData loading={state.loading}/>
                <div className="d-flex flex-row justify-content-between detail-list-skill-header" style={cssTarget(state.loading)}>
                    <div>{state.dataModule.length} MODULES</div>
                    { state.skillsDataMaster ? state.skillsDataMaster[0]?.title && state.skillsDataMaster[0]?.title_ind &&
                        <>
                            <div className="vertical-line-step-3-skill-header">|</div>
                            <div>
                                <Rating 
                                    size={20} 
                                    fillColor={'#000000'} 
                                    ratingValue={state.skillsDataMaster? state.skillsDataMaster[0].rating? state.skillsDataMaster[0].rating * 20 : 0 : 50} 
                                    readonly={true}
                                    style={{marginTop: "-5%"}}
                                />
                            </div>
                            <div>{state.skillsDataMaster? state.skillsDataMaster[0].rating ?? 0 :0}</div>
                            <div className="vertical-line-step-3-skill-header">|</div>
                            <div>
                                learning hours : {state.skillsDataMaster? state.skillsDataMaster[0].learning_hours:'xxx'} hours
                            </div>
                        </>
                        :null
                    }

                </div>
                <div style={cssTarget(state.loading)}>
                    {
                        state.dataModule && state.dataModule.map((v,idx)=>
                            <Card className={`card-module-step-3`} key={idx} onClick={()=>readButton(v)}>
                                <CardDataModule data={v}/>

                                {/* <div className="card-horizontal">
                                    <Card.Img className={`img-square-wrapper`} src={userDocument +v.content_image} />
                                    <Card.Body className="card-body-step-3-skill">
                                        <div className="d-flex flex-row pb-3 pr-2">
                                            <div>
                                                <Card.Text className={`module-type-of-content text-uppercase`}>{lang==='ENG'?v.content_type_title_eng:v.content_type_title_ind}</Card.Text>
                                            </div>
                                            <div className="ml-auto"> 
                                                <Card.Text className={`module-type-of-content font-italic`}>
                                                    <div className="text-right module-optional">{renderOptionalDescription(v)}</div>
                                                </Card.Text>
                                            </div>
                                        </div>
                                        <Card.Title className={`module-title`}>{lang==='ENG'?v.content_title_eng:v.content_title_ind}</Card.Title>
                                        <Card.Text className="text-white module-description">
                                            <div dangerouslySetInnerHTML={{__html:
                                                lang==='ENG'?v.content_description_eng:v.content_description_ind
                                            }}/>
                                        </Card.Text>
                                    </Card.Body>
                                </div> */}
                                {v.completed_flag==1 ? 
                                    <div className="check-read">
                                        <Card.Img className={`check-read-image`} src={assets + 'learningplan/check_learning_plan.svg'} />
                                    </div>
                                :
                                    null
                                }
                            </Card>
                        )
                    }
                </div>
            </div>
            :
            null
        )
    }

    return(
        <Offcanvas show={show} onHide={handleClose} {...props} backdropClassName='modal-backdrop' bsPrefix={`${global.sidebarBlur && `popup-blur`} offcanvas`}>
            <svg style={{ height: 0,width:0 }}>
                <defs>
                <linearGradient id={'linearGradientId'} gradientTransform={"rotate(50)"}>
                    <stop offset="0%" stopColor={'#3a8ff2'} />
                    <stop offset="100%" stopColor={'#787ae0'} />
                </linearGradient>
                </defs>
            </svg>
            <Offcanvas.Header className="p-0 mr-0 ml-0 d-block">
                <div className={`d-flex flex-column sidebar-learning-detail-header ${changeColor(state.skillsDataUsers.progress_lp,state.skillsDataUsers.date_modified).border}`}>
                    {renderHeader()}
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body className={`p-0 sidebar-learning-detail-body`}>
                {renderBody()}
            </Offcanvas.Body>
        </Offcanvas>
    )
}