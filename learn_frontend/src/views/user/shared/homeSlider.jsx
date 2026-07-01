import React, { useRef } from 'react';
import { useContext } from 'react';
// import Slider from "react-slick";
import axiosLibrary from '../../../helpers/axiosLibrary';
import {  env, securityData } from '../../../helpers/globalHelper';
import GlobalState from '../../../helpers/globalState';
import defaultLang from '../../../helpers/lang';
import ShowMoreText from "react-show-more-text";
import { isMobile } from 'react-device-detect';
import { Image } from 'react-bootstrap';
import { useState } from 'react';
import { useEffect } from 'react';

// function PrevArrow(props){
//     const { onClick } = props;
//     return (
//             <i className='fa fa-3x fa-angle-left slider-arrow' 
//             style={{
//                 left:'-1%'
//             }} onClick={onClick}/>
//     );
// }

// function NextArrow(props){
//     const { onClick } = props;
//     return (
//             <i className='fa fa-3x fa-angle-right slider-arrow' 
//             style={{
//                 right:'-1%',
//             }} onClick={onClick}/>
//     );
// }

function HomeSlider(props){
    const [state, setState] = useContext(GlobalState)
    const refSlider = useRef(null)
    const refCard = useRef(null)
    const [stateRefSlider, setStateRefSlider] = useState({
        buttonNextPrevLearningPlan:{
            next:'block',Prev:'block'
        },
        refSlider:{current:null},
        valueScroll:null,
    });

    useEffect(()=>{
        visibility()
    },[refSlider,stateRefSlider.refSlider])

    // let infiniteSlide = true
    // if(props.content.length > 4){
    //     infiniteSlide = true
    // }else{
    //     infiniteSlide = false
    // }

    // const settings = {
    //     className:'home-slider-slick',
    //     centerMode: false,
    //     infinite: infiniteSlide,
    //     autoplay: false,
    //     autoplaySpeed: 5000,
    //     // centerPadding: '38%',
    //     slidesToShow: 4,
    //     // slidesToScroll: 4,
    //     nextArrow: <NextArrow />,
    //     prevArrow:<PrevArrow />,
    //     arrows:true,
    //     responsive: [
    //         {
    //         breakpoint: 991,
    //         settings: {
    //             arrows: true,
    //             // centerMode: true,
    //             // slidesToScroll: 1,
    //             slidesToShow: 2
    //         }
    //         },
    //         {
    //         breakpoint: 768,
    //         settings: {
    //             arrows: true,
    //             // centerMode: true,
    //             // slidesToScroll: 1,
    //             slidesToShow: 1
    //         }
    //         },
    //         {
    //         breakpoint: 480,
    //         settings: {
    //             arrows: false,
    //             // centerMode: true,
    //             // slidesToScroll: 1,
    //             slidesToShow: 1
    //         }
    //         }
    //     ]
    // }

    //click event article, course dan PSBB
    const onClickEventArticle = async (type, param)=>{
        switch (type) {
            case 'shareArticle':
                setState(state=>({...state,modalProp:{modalShow:true, id:param.id, type:'article'},flagShowArticle:true}))
                break;
            case 'loadArticleQuiz':
                // if(!state.flagShowArticle){
                //     await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                // }
                setState(state=>({...state,modalProp:{modalShow:true, id:param.id, type: 'quiz',param:param}, flagShowArticle:false}))
                break;
            case 'logActivityArticle':
                if(!state.flagShowArticle){
                    let isi = await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                    if(isi){
                        if(isi.status===200){
                            setState(state=>({...state,modalProp:{modalShow:false, id:null, loadContent: true}}))
                        }
                    }
                }
                window.open(param.hyperlink_url,'_blank')
                break;
            case 'loadIqosQuiz':
                if(param.allowJoin>1){
                    if(!state.flagShowArticle){
                        await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                        setState(state=>({...state,modalProp:{modalShow:true, id:param.id, type: 'quiz', iqosQuiz:1}, flagShowArticle:false}))
                    }
                }else{
                    let alertSuccess = 
                    <div dangerouslySetInnerHTML={{
                        __html: defaultLang.lang.alreadySubmitQuizIqos
                    }}/>
                    setState(state => ({...state, modalProp:{modalShow:true, id:null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle:false, messageSubtitlePopup:""}}))
                }
                break;
            default:
                break;
        }
        
    }

    //click event workshop
    const onClickEventWorkshop = (contentItem)=>{
        setState(state=>({...state,modalProp:{modalShow:true, id:contentItem.content_id, type: 'showDetailWorkshop',dataWorkShop:contentItem}}))
    }

    //click event skills for future
    const onClickEventSff = async (param, course_type)=>{
        switch (course_type) {
            case 0:
                //free sff
                if(course_type==0){
                    if(!state.flagShowArticle){
                        let isi = await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.id,trnId: param.id})
                        if(isi){
                            if(isi.status===200){
                                setState(state=>({...state,modalProp:{modalShow:false, id:null, loadContent: true}}))
                            }
                        }
                    }
                    window.open(param.hyperlink_url,'_blank')
                }
                break;
            default:
                //berbayar
                if(props.thisStateGlobal.activePeriod == null){
                    alert("Enrollment Closed")
                }else{
                    if(param.sff_flag_registered == 0){
                        setState(state=>({...state,modalProp:{modalShow:true, id:param.id, type: 'showDetailSff',dataSff:param.data}}))
                        // setState(state=>({...state,modalProp:{modalShow:true, id:param.id, type: 'registerCourse'}}))
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
            case 'challengeCard':
                if (contentItem.show_quiz==1) {
                    onClickEventArticle('loadArticleQuiz',{
                        content:defaultLang.lang.challengeCard,
                        articleId: contentItem.article_id,
                        id:contentItem.id,
                    })
                }else{
                    onClickEventArticle('logActivityArticle',{
                        content:defaultLang.lang.challengeCard,
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
                        //article, course
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

    const renderButtonText = (contentItem) =>{
        let txtButton = defaultLang.lang.read
        let disabledButton = false
        switch (contentItem.content_type_id) {
            case 2:
                if(!contentItem.workshop_register_type){
                    if (contentItem.workshop_total_user >= contentItem.workshop_capacity) {
                        txtButton = defaultLang.lang.workShopButtonJoinWaitingList
                    } else {
                        txtButton = defaultLang.lang.workShopButtonRegister
                    }
                }else{
                    disabledButton = true
                    if(contentItem.workshop_register_type==='WAITING'){
                        txtButton = defaultLang.lang.workShopTxtRegisteredWaitingList
                    }else{
                        txtButton = defaultLang.lang.workShopTxtRegistered
                    }
                }
                break;
            case 3:
                if(contentItem.content_course_type != 0){
                    if(contentItem.sff_flag_registered == 0){
                        if(props.thisStateGlobal.activePeriod==null){
                            disabledButton = true
                            txtButton = "Enrollment Closed"
                        }else{
                            txtButton = defaultLang.lang.workShopButtonRegister
                        }
                    }else{
                        disabledButton = true
                        if(contentItem.flag_claim==1){
                            txtButton = defaultLang.lang.courseClaim
                        }else{
                            txtButton = defaultLang.lang.workShopTxtRegistered
                        }

                    }
                }
                break;
            default:
                break;
        }
        return (
            <button type="button" className="btn btn-outline-primary  slider-content-button" onClick={()=>readButton(contentItem)} disabled={disabledButton}>
                {txtButton}
            </button>
        )
    }

    const renderButton = ()=>{
        return(
            <div className="slider-card-button-nav">
                <div className="d-flex flex-row justify-content-between">
                    <div className="slider-card-button-nav-prev" onClick={()=>scrollLearningPlan(refCard.current?-refCard.current.clientWidth:-400)}>
                        <Image 
                        src={env.assets + "img/button-next-prev.svg"} title={'prev'} width={50} 
                        style={{visibility: stateRefSlider.buttonNextPrevLearningPlan.prev}}
                        />
                    </div>
                    <div className="slider-card-button-nav-next" onClick={()=>scrollLearningPlan(refCard.current?refCard.current.clientWidth:400)}>
                        <Image 
                        src={env.assets + "img/button-next-prev.svg"} title={'next'} width={50} 
                        style={{visibility: stateRefSlider.buttonNextPrevLearningPlan.next}}
                        />
                    </div>
                </div>
            </div>
        )
    }

    const scrollLearningPlan = (value)=>{
        refSlider.current.scrollLeft += value;
        setStateRefSlider(state =>({...state,valueScroll:value}))
        visibility()
    }

    const visibility = ()=>{
        if(refSlider.current){
            if(stateRefSlider.refSlider.current){
                if(stateRefSlider.refSlider.current.scrollWidth == stateRefSlider.refSlider.current.clientWidth){
                    setStateRefSlider(state =>({...state,buttonNextPrevLearningPlan:{...state.buttonNextPrevLearningPlan, prev:'hidden', next:'hidden'}}))
                }
            }
            setStateRefSlider(state =>({...state,refSlider:refSlider}))
        }
    }

    return(
        // <Slider {...settings}>
        <>
            {isMobile? null :renderButton()}
            <div className="d-flex flex-row slider-content-home home-slider-slick" ref={refSlider}>
                {
                    props.typeSlider == "challengeCard" ?
                    props.content.map(
                        (contentItem, index) =>
                        <div key={index} className="slider-content-detail-home" ref={refCard}>
                            <div className='slider-container h-100'>
                                <div className='card h-100' >
                                    <img className='card-img-top' src={env.userDocument+"article/"+contentItem.article_preview_image} 
                                    alt={securityData.Security_lang()==='ENG' ? contentItem.title : contentItem.title_ind} />
                                    <div className='card-body'>
                                        <span className="badge bg-primary content-type-badge">
                                            {defaultLang.lang.challengeCard}
                                        </span>
                                        <span className="content-category">{contentItem.category_title}</span><br/>
                                        <h4 className='card-title slider-content-title'>
                                            {securityData.Security_lang()==='ENG' ? contentItem.title : contentItem.title_ind}
                                        </h4>
                                        <div className='slider-content-description'>
                                            <ShowMoreText
                                                more={defaultLang.lang.showMore}
                                                less={defaultLang.lang.showLess}
                                            >
                                                <p className='card-text '>
                                                    {securityData.Security_lang()==='ENG' ? contentItem.description :contentItem.description_ind}
                                                </p>
                                            </ShowMoreText>
                                        </div>
                                    
                                        {/* <p className='card-text slider-content-description'>{contentItem.content_description_eng}</p> */}
                                        {/* <a href='#' className='btn btn-primary slider-content-button'>Go somewhere</a> */}
                                        
                                    </div>  
                                    <div className='card-footer content-slider-footer p-4'>
                                        {renderButtonText(contentItem)}
                                    </div>    
                                </div>
                            </div>
                        </div>
                        )
                    :
                    props.content.map(
                        (contentItem, index) =>
                        <div key={index} className="slider-content-detail-home" ref={refCard}>
                            <div className='slider-container h-100'>
                                <div className='card h-100' >
                                    <img className='card-img-top' src={env.userDocument+contentItem.content_image} alt={contentItem.content_title} />
                                    <div className='card-body'>
                                        <span className="badge bg-primary content-type-badge">{contentItem.content_type_title_eng}</span>
                                        <span className="content-category">{contentItem.category_title_eng}</span><br/>
                                        <h4 className='card-title slider-content-title'>{contentItem.content_title_eng}</h4>
                                        <div className='slider-content-description'>
                                            <ShowMoreText
                                                more={defaultLang.lang.showMore}
                                                less={defaultLang.lang.showLess}
                                            >
                                                <p className='card-text '>{contentItem.content_description_eng}</p>
                                            </ShowMoreText>
                                        </div>
                                    
                                        {/* <p className='card-text slider-content-description'>{contentItem.content_description_eng}</p> */}
                                        {/* <a href='#' className='btn btn-primary slider-content-button'>Go somewhere</a> */}
                                        
                                    </div>  
                                    <div className='card-footer content-slider-footer p-4'>
                                        {renderButtonText(contentItem)}
                                    </div>    
                                </div>
                            </div>
                        </div>
                        )
                }
            </div>
        </>

        // </Slider>
    )

}

export default HomeSlider;