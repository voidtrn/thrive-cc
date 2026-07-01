import React, { useEffect, useState, useContext } from 'react';
import defaultLang from '../helpers/lang';
import axiosLibrary from '../helpers/axiosLibrary';
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Rating } from 'react-simple-star-rating'
import { env, securityData } from '../helpers/globalHelper';
import '../assets/css/profile.scss';
import { Card, Image, ProgressBar } from 'react-bootstrap';
import GlobalState from '../helpers/globalState';
import routeAll from '../helpers/route';
import { isMobile } from 'react-device-detect';
import { cssTarget, LoadingData } from './Loading';
import Slider from 'react-slick';
import { useRef } from 'react';
// import ShowMoreText from "react-show-more-text";

var moment = require('moment');

if(securityData.Security_lang()==="IND"){
    require('moment/locale/id');
}

const settings = {
    slidesToShow: 1,
    speed: 500,
    rows: 3,
    slidesPerRow: 3,
    infinite: true,
    arrows: false,
    responsive: [
        {
            breakpoint: 600,
            settings: {
                slidesPerRow:3,
                rows: 3,
            }
        },
    ]
}

export function ProfileMyLearningPlan(props){
    const [global,setGlobal] = useContext(GlobalState)
    const [state, setState] = useState({
        anotherUserData:false,
        dataUserLearningPlan:[],
        dataUserLearningPlanCompleted:[],
        dataLearningSkillsMaster:[],
        ratingValue:[],
        userDocument: env.userDocument,
        assets:env.assets,
        activeLearningPlan:defaultLang.lang.inProgress,
        category:[],
        categoryCompleted:[],
        selectedCategory:"",
        year:[],
        yearCompleted:[],
        selectedYear:"",
        loading:true,
    });
    const platform_id = securityData.Security_getPlatformId()
    const lang = securityData.Security_lang()
    const SliderRef = useRef(null)

    useEffect(()=>{
        if(platform_id){
            if(global.loadLearningPlan || global.modalProp.loadContent){
                setState(state=>({...state,
                            loading:true
                        }))
                checkUserLearningPlan()
                getDataSkillsMaster()
                if(props.data){
                    setState(state =>({...state,anotherUserData:props.data}))
                }
            }
        }
    },[global])

    // const updateProgress = async()=>{
    //     const isi = await axiosLibrary.postData('awbLearningPlan/UpdateUserLearningProgress',{});
    //     if(isi.status===200){
    //         checkUserLearningPlan()
    //     }
    // }

    const checkUserLearningPlan = async () =>{
        let credentials = {
            platform_id:platform_id,
            type:'profile'
        }

        if(props.data){
            credentials = {...credentials, user_id:props.data.user_id}
        }

        const response = await axiosLibrary.postData('awbLearningPlan/CheckUserLearningPlan',credentials);
        if(response.status===200){
            setState(state =>({...state, 
                dataUserLearningPlan:response.data.data.filter(v=>v.progress_lp < 100), 
                dataUserLearningPlanCompleted:response.data.data.filter(v=>v.progress_lp >= 100),
                category:response.data.data2.filter(v=>v.complete_status=='on progress'),
                categoryCompleted:response.data.data2.filter(v=>v.complete_status=='completed'),
                year:response.data.data3.filter(v=>v.complete_status=='on progress'),
                yearCompleted:response.data.data3.filter(v=>v.complete_status=='completed')
            }))
            // let globalModalProp = global.modalProp
            // globalModalProp.loadContent = false
            setGlobal(global=>({...global,loadLearningPlan:false,modalProp:{loadContent:false}}))
            setState(state=>({...state,
                loading:false
            }))
        }
    }

    const renderTitleLearningPlan = ()=>{
        let titleHeader = ''
        let subtitleHeader = ''
        switch (state.activeLearningPlan) {
            case defaultLang.lang.completed:
                titleHeader = defaultLang.lang.completedLearningPlan
                subtitleHeader = defaultLang.lang.subTitleCompletedLearningPlan
                break;
            
            default:
                titleHeader = defaultLang.lang.continueLearning
                subtitleHeader = <>
                            <Image src={`${state.assets}learningplan/learning_plan_point.svg`} width={18}/>&nbsp;&nbsp;
                            {defaultLang.lang.subTitleContinueLearning.replace('[variable]','500')}
                </>
                break;
        }
        return(
            <div className="d-flex flex-column">
                <div className="pt-4 pb-1">
                    <h2 className='m-0'>{titleHeader}</h2>
                </div>
                <div className="pb-4 complete-learning-subtitle">
                    {subtitleHeader}
                </div>
            </div>
        )
    }

    const renderButtonCreateNew = ()=>{
        if(state.anotherUserData){
            return(null)
        }else{
            return(
                <div className="btn-group btn-group-create-header align-items-center" role="group" onClick={()=>goToLearningPlan()}>
                    <img src={`${state.assets}img/myprofile_add_new.svg`} />
                    <span>{defaultLang.lang.createNew}</span>
                </div>
            )
        }
    }

    const changeTab = (type)=>{
        setState(state =>({...state, 
            activeLearningPlan:type,
            selectedCategory:"",
            selectedYear:"",
        }))
    }

    const renderTabInProgressCompleted = ()=>{
        return(
            <div className="d-flex flex-row">
                <div 
                    className={`p-1 text-lowercase ${state.activeLearningPlan===defaultLang.lang.inProgress && `tab-active`}`}
                    onClick={()=>changeTab(defaultLang.lang.inProgress)}
                >
                    {defaultLang.lang.inProgress}
                </div>
                <div className="p-1">|</div>
                <div 
                    className={`p-1 text-lowercase ${state.activeLearningPlan===defaultLang.lang.completed && `tab-active`}`}
                    onClick={()=>changeTab(defaultLang.lang.completed)}
                >
                    {defaultLang.lang.completed}
                </div>
            </div>
        )
    }

    const renderCategory =()=>{
        let dataCategory = []
        switch (state.activeLearningPlan) {
            case defaultLang.lang.completed:
                dataCategory = state.categoryCompleted
                break;
            
            default:
                dataCategory = state.category
                break;

        }

        return(
            dataCategory.map((v,idx)=>
                <div className={`header-leftbar-category pb-2  ${v.id_main_focus==state.selectedCategory && `active-leftbar`}`} key={idx} onClick={()=>setState(state =>({...state, 
                    selectedCategory:v.id_main_focus
                }))}>{v.main_focus_title}</div>
            )
        )
    }

    const renderYear = ()=>{
        let dataYear = []
        switch (state.activeLearningPlan) {
            case defaultLang.lang.completed:
                dataYear = state.yearCompleted
                break;
            
            default:
                dataYear = state.year
                break;

        }

        return(
            <Slider {...settings} ref={SliderRef}>
                {dataYear.map((v,idx)=>
                    <div className={`header-leftbar-category pb-2 ${v.learning_plan_year==state.selectedYear && `active-leftbar`}`} key={idx} onClick={()=>setState(state =>({...state, 
                        selectedYear:v.learning_plan_year
                    }))}>{v.learning_plan_year}</div>
                )}
            </Slider>

        )
    }

    const renderBody = ()=>{
        let loopData = [];
        let dataCategory = []
        // let dataYear = [];
        switch (state.activeLearningPlan) {
            case defaultLang.lang.completed:
                loopData = state.dataUserLearningPlanCompleted
                dataCategory = state.categoryCompleted
                // dataYear = state.yearCompleted
                break;
            default:
                loopData = state.dataUserLearningPlan
                dataCategory = state.category
                // dataYear = state.year
                break;
        }
        // filterLoopDataByCategory
        if(state.selectedCategory){
            loopData = loopData.filter(v=>v.id_main_focus==state.selectedCategory)
            dataCategory = dataCategory.filter(v=>v.id_main_focus==state.selectedCategory)
        }
        // filterLoopDataByYear
        if(state.selectedYear){
            loopData = loopData.filter(v=>moment(v.date_created).format('YYYY')==state.selectedYear)
        }

        return(
            dataCategory.map((v,idx)=>
                <div key={idx}>
                    <div className="learning-plan-body-title">
                        {v.main_focus_title}    
                    </div>
                    <div className="d-flex flex-row flex-wrap sidebar-card-learn-plan pb-5">
                        {loopData.filter(z=>z.id_main_focus===v.id_main_focus).map((el,i)=>
                            <div className="p-2 sidebar-div-card-learning-plan" key={i}>
                                <Card className="h-100 sidebar-learning-home-card" onClick={()=>openSidebarLearningDetail(el)}>
                                    <Card.Img variant="top" className="img-fluid sidebar-learning-home-card-image" src={state.userDocument + "category/"+ el.category_image} onError={(e)=>e.target.src="https://via.placeholder.com/173x98"}/>
                                    <Card.Body className="pl-3 pt-3 pr-3 pb-2" >
                                        <Card.Title className={`sidebar-title-card-learning-plan mb-0`}>{lang==='ENG'?el.title:el.title_ind}</Card.Title>
                                        {/* {cardText(el,state.activeLearningPlan)} */}
                                    </Card.Body>
                                    {cardFooter(el,state.activeLearningPlan)}
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
                
            )
        )
    }

    // renderCardLearningPlan
    const getDataSkillsMaster = async()=>{
        const credentials = {
            platform_id:platform_id,
            param:'skill'
        };
        const isi = await axiosLibrary.postData('awbLearningPlan/GetAllDataLearningPlan',credentials);
        if(isi.status===200){
            setState(state =>({...state, 
                dataLearningSkillsMaster:isi.data.data
            }))
        }
    }

    const propProgressBar = (value) => {
        return{
            now:value==0?5:value,
            max:value==0?5:value,
            style:{
                width:value==0?'5%':`${isMobile?value*(89/100):value*(75/100)}%`
            },
            variant:value < 0 ? 'danger': value < 61 ? 'warning' : 'success'
        }
    }

    const openSidebarLearningDetail = (el)=>{
        if(!state.anotherUserData.user_id){
            setGlobal(global=>({...global, sidebarLearningDetail:{
                data:el.id,
                status:true,
                dataSkills:state.dataLearningSkillsMaster.filter(v=>v.id===el.id_key_behavior_dtl),
            }}))
        }
    }

    // const cardText = (value, type) =>{
    //     if(type===defaultLang.lang.inProgress){
    //         return(
    //             <Card.Text className="text-white module-description learning-home-card-text">
    //                 <ShowMoreText
    //                     more={defaultLang.lang.showMore}
    //                     less={defaultLang.lang.showLess}
    //                 >
    //                     <div dangerouslySetInnerHTML={{__html:
    //                         lang==='ENG'?value.description:value.description_ind
    //                     }}/>
    //                 </ShowMoreText>
    //             </Card.Text>
    //         )
    //     }else{
    //         return(
    //             null
    //         )
    //     }
    // }

    const renderCardFooterCompletedLearningPlan = (data)=>{
        return(
            <div className="d-flex flex-row flex-wrap justify-content-between align-items-center">
                <div>{data.title_rate}</div>
                <div>{data.star_rate}</div>
                <div className="result-rate">{data.result_rate}</div>
            </div>
        )
    }

    const rateCompletedLearningPlan = async(e, learningData,type)=>{
        if(e){
            e = e.toFixed(1)
        }
        setState(state =>({...state, ratingValue:{...state.ratingValue,[learningData.id]:e}}))
        switch (type) {
            case 'click':
                const credentials = {
                    platform_id:platform_id,
                    id:learningData.updateId,
                    rate:e
                }
                const response = await axiosLibrary.postData('awbLearningPlan/UpdateStarRating',credentials);
                if(response.status===200){
                    window.location.reload()
                }
                break;
            case 'hover':
                break
            default:
                break;
        }
    }

    const cardFooter = (value,type)=>{
        if(type===defaultLang.lang.inProgress){
            return(
            <Card.Footer className="sidebar-learning-home-card-footer p-3">
                {moment(moment.utc(value.date_modified)).add(30,'days').format() <= moment(moment.utc()).format() ?
                    <div className="learning-home-last-visited text-danger">{defaultLang.lang.lastVisited}</div>
                :
                   <div className="d-flex flex-row flex-wrap align-items-center">
                    <ProgressBar {...propProgressBar(value.progress_lp)}/>
                       <div className={`${value.progress_lp < 0 ? 'text-danger':value.progress_lp < 61 ? 'text-warning' : 'text-success'}`}>&nbsp;&nbsp;{value.progress_lp}%</div>
                   </div> 
                }
            </Card.Footer>
            )
        }else{
            return(
                <Card.Footer className="pt-0 pr-3 pl-3">
                    <Card.Text className="text-white module-description learning-home-card-text">
                        <div className="d-flex flex-column flex-wrap">
                            <div className="pb-1">{defaultLang.lang.completed} &nbsp;{moment(moment.utc(value.complete_date)).format('L')}</div>
                            <div className="pb-2">{
                                value.val_rating?
                                    renderCardFooterCompletedLearningPlan(
                                        {
                                            title_rate:defaultLang.lang.yourRate,
                                            star_rate:<Rating 
                                                            size={13} 
                                                            fillColor={'#ee881e'}
                                                            emptyColor={'#c67331'}  
                                                            ratingValue={value.val_rating * 20} 
                                                            readonly={true}
                                                            style={{marginTop: "-5%"}}
                                                        />,
                                            result_rate:value.val_rating.toFixed(1)
                                        }
                                    ) 
                                    : 
                                    renderCardFooterCompletedLearningPlan(
                                        {
                                            title_rate:defaultLang.lang.rateHere,
                                            star_rate: state.anotherUserData.user_id?
                                                        <Rating 
                                                            size={13} 
                                                            fillColor={'#ee881e'}
                                                            emptyColor={'#c67331'}  
                                                            ratingValue={0} 
                                                            readonly={true}
                                                            style={{marginTop: "-5%"}}
                                                        />
                                                        :
                                                        <Rate 
                                                            allowHalf={true}
                                                            allowClear={false}
                                                            value={state.ratingValue[value.id]}
                                                            onHoverChange={(e)=>
                                                                rateCompletedLearningPlan(e,value,'hover')
                                                            }
                                                            onChange={(e)=>
                                                                rateCompletedLearningPlan(e,value,'click')
                                                            }
                                                            style={{fontSize:14}}
                                                        />,
                                            result_rate:state.ratingValue[value.id]?state.ratingValue[value.id]:0
                                        }
                                    )
                                } 
                            </div>
                        </div>
                    </Card.Text>

                </Card.Footer>
            )
        }
    }
    // end

    const goToLearningPlan = ()=>{
        window.location.href = routeAll.routesUser.learningPage.path + "?" + new URLSearchParams({type:'create',user:securityData.Security_UserAccount()})
    }

    return(
        <div  className="row profile-learning-plan pb-5 mb-5">
            <div className="col-md-12 pb-5" id="header">
                <div className="d-flex flex-row align-items-center">
                    <div className="title-header pr-3">
                        {renderTitleLearningPlan()}
                    </div>
                    <div className="ml-auto button-create-header pr-3">
                        {renderButtonCreateNew()}
                    </div>
                    <div className="tab-inprogress-completed">
                        {renderTabInProgressCompleted()}
                    </div>
                </div>
            </div>
            <div className="col-md-12" id="body">
                <LoadingData loading={state.loading}/>
                <div className="row" style={cssTarget(state.loading)}>
                    <div className="col-md-3">
                        <div className="d-flex flex-column">
                            <div className="filter-by pb-3">{defaultLang.lang.filter_by} :</div>
                            <div 
                                className="header-leftbar pb-4"
                                style={{cursor:'pointer'}}
                                onClick={()=>setState(state=>({...state,selectedCategory:"",selectedYear:""}))}
                            >{defaultLang.lang.seeAll}</div>
                            <div className="header-leftbar pb-3">{defaultLang.lang.category}</div>
                            {renderCategory()}
                            <div className="header-leftbar pb-3 pt-4 d-flex flex-row align-items-center">
                                <div>{defaultLang.lang.years}</div>
                                <div className="pl-4 button-prev">
                                    <img onClick={()=>SliderRef.current.slickPrev()} className="img-button-prev" src={env.assets + "img/button-next-prev.svg"} width="30"/>
                                </div>
                                <div className="pl-3 button-next">
                                    <img onClick={()=>SliderRef.current.slickNext()} className="img-button-next" src={env.assets + "img/button-next-prev.svg"} width="30"/>
                                </div>
                            </div>
                            {renderYear()}
                        </div>
                    </div>
                    <div className="col-md-9">
                        {renderBody()}
                    </div>
                </div>
            </div>
        </div>
    )
}