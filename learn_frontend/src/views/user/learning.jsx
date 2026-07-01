import React, { useEffect, useState, useRef, createRef } from 'react';
import { env, securityData } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import { Card, Collapse, OverlayTrigger, Image, ProgressBar } from 'react-bootstrap';
import Slider from 'react-slick';
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css';
import '../../assets/css/cssLearningPage.scss';
import { Rating } from 'react-simple-star-rating'
import defaultLang from '../../helpers/lang';
import GlobalState from '../../helpers/globalState';
import { useContext } from 'react';
import routeAll from '../../helpers/route';
import ShowMoreText from "react-show-more-text";
import moment from 'moment';
import { isMobile } from 'react-device-detect';
import CardDataModule from '../../components/cardDataModule';

const settings = {
    slidesToShow: 1,
    speed: 500,
    rows: 4,
    slidesPerRow: 3,
    infinite: true,
    arrows: false,
    swipeToSlide: false,
    swipe:false,
    responsive: [
        {
            breakpoint: 600,
            settings: {
                swipeToSlide: true,
                swipe:true,
                slidesPerRow:2,
                rows: 6,
            }
        },
    ]
}


function Learning(props){
    const [collapseData,setCollapseData] = useState(3)
    const [state, setState] = useState({
        param:axiosLibrary.getParamString(props.location.search),
        data1:[],
        data2:[],
        data3:[],
        data4:[],
        loadData:false,
        dataModule:[],
        stepData:[],
        type_of_content:[],
        userDocument: env.userDocument,
        assets: env.assets,
        dataUserLearningPlan:[],
        dataUserLearningPlanCompleted:[],
        ratingValue:[],
        typeCompletedLearningPlan: "completed_partial",
        showButtonReset:[
            false,false,false
        ],
        isTypeDimensionCoreSkills:true,
        isEditDimension:false,
        listDeleteDataDimension:[],
    })
    const cardBodyMainFocusRef = useRef([])
    const cardBodyKeyBehaviorRef = useRef([])
    const SliderRef = useRef([])
    const platform_id = securityData.Security_getPlatformId()
    const userName = securityData.Security_UserName()
    const lang = securityData.Security_lang()
    const completePoint = securityData.Security_LearningPlanCompletePoint()||0
    const [global, setGlobal] = useContext(GlobalState)
    const limit = 50
    const offset = 0

    const getStepData = async()=>{
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id
        };

        const isi = await axiosLibrary.postData('awbLearningPlanStep/ListData',credentials);
        setState(state =>({...state, stepData:isi.data.data, createStateSliderRef:true}))
    }

    const getAllDataLearningPlan = async()=>{
        const credentials = {
            platform_id:platform_id
        };
        const isi = await axiosLibrary.postData('awbLearningPlan/GetAllDataLearningPlan',credentials);
        if(isi.status===200){
            setState(state =>({...state, 
                data1:isi.data.data[0],
                data2:isi.data.data[1],
                data3:isi.data.data[2],
                data4:isi.data.data[3],
                createStateData0:true
            }))
            
        }
    }

    const getContentType = async () => {
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
                    id:v.id,value:v.title
                }
            })
            setState(state =>({...state, type_of_content:typeContent}))
        }
    }

    // const updateProgress = async()=>{
    //     const isi = await axiosLibrary.postData('awbLearningPlan/UpdateUserLearningProgress',{});
    //     if(isi.status===200){
    //         checkUserLearningPlan()
    //     }
    // }

    const checkUserLearningPlan = async () =>{
        const credentials = {
            platform_id:platform_id,
            from_where:'learning_plan'
        }

        const response = await axiosLibrary.postData('awbLearningPlan/CheckUserLearningPlan',credentials);
        if(response.status===200){
            setState(state =>({...state, dataUserLearningPlan:response.data.data.filter(v=>v.progress_lp < 100), dataUserLearningPlanCompleted:response.data.data.filter(v=>v.progress_lp >= 100)}))
            props.loading(false)
        }
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

    const loadAllData = () =>{
        const load_all_data = [
            getStepData(),
            getContentType(),
            getAllDataLearningPlan(),
            checkUserLearningPlan(),
        ]

        Promise.all(
            load_all_data
        ).then(()=>{
            setState(state =>({...state, loadData:true}))
        } 
        )
    }

    useEffect(()=>{
        if(global.modalProp.loadContent){
            loadAllData()
        }
    },[global.modalProp])

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            loadAllData()
            if(state.param){
                if(state.param.type==="create" && state.param.user===securityData.Security_UserAccount()){
                    resetStep(0)
                }else{
                    window.location.href=routeAll.routesUser.learningPage.path
                }
            }
        }
    },[state.param])

    // useEffect(()=>{
    //     if(securityData.Security_getPlatformId()){
    //         if(state.param){
    //             if(state.param.type==="create" && state.param.user===securityData.Security_UserAccount()){
    //                 if(state.dataUserLearningPlan && state.dataUserLearningPlan.length >= 3){
    //                     alert('You cannot create a new learning plan, (max : 3 learning plans)')
    //                     window.location.href = routeAll.routesUser.learningPage.path        
    //                 }
    //             }
    //         }
    //     }
    // },[state.dataUserLearningPlan])

    useEffect(()=>{
        if(state.loadData){
            if(state.createStateData0 && state.data1 && state.data1.length > 0){
                createReff()
            }
            if(state.createStateData0 || state.createCurrentStateData0 || state.createStateSliderRef){
                updateHeight()
            }
        }
    },[state])

    const createReff = () =>{
        cardBodyMainFocusRef.current = state.data1.map((_,i)=>cardBodyMainFocusRef.current[i]??createRef())
        cardBodyKeyBehaviorRef.current = state.data2.map((_,i)=>cardBodyKeyBehaviorRef.current[i]??createRef())
        setState(state =>({...state, createCurrentStateData0:true, createStateData1:true}))
    }

    const updateHeight = () =>{

        if(state.createStateData0 && state.createCurrentStateData0){
            let maxHeightBody = 0;
            for (var i = 0; i < state.data1.length; i++) {
                if (cardBodyMainFocusRef.current[i].current && maxHeightBody < cardBodyMainFocusRef.current[i].current.clientHeight) {
                    maxHeightBody = cardBodyMainFocusRef.current[i].current.clientHeight;
                }
            }
            setState(state =>({...state, cardBodyHeightSubCategory:maxHeightBody, createStateData0:false, createCurrentStateData0:false}))
        }

        if(state.createStateSliderRef){
            SliderRef.current = state.stepData.map((_,i)=>SliderRef.current[i]??createRef())
            setState(state =>({...state, createStateSliderRef:false}))

        }
    }

    const setStepX = (data,idxStep) =>{
        if(data.lp_type && data.lp_type===3){
            //enhancement awb custom learning plan
            const dataStep2 = state.data2.filter(x => x.id_main_focus == data.id)
            setState(state => ({...state, [`step${idxStep}`]:data,[`step${idxStep+1}`]:dataStep2[0]}))
            setCollapseData(idxStep+2)
            //end
        }else{
            setState(state => ({...state, [`step${idxStep}`]:data}))
            if(idxStep !==2){
                setCollapseData(idxStep+1)
            }
            if(idxStep === 2){
                const moduleData = state.data4.filter(v => v.id_key_behavior_dtl==data.id)
                setState(state =>({...state,dataModule:moduleData}))
            }
        }
    }

    const resetStep = (value)=>{
        setCollapseData(value)
        setState(state =>({...state,
            step1:false,
            step2:false,
            dataModule:false
        }))
    }

    const hoverKeyBehavior = (data)=>{
        setState(state =>({...state, [`isHovered${data}`]:!state[`isHovered${data}`]}))
    }

    const finishLine = () =>{
        setGlobal(global => ({...global,
            modalProp:{
                modalShow:true, 
                type: 'confirmLearningPlan',
                data: [
                    state.step0,
                    state.step1,
                    state.step2
                ]
           }
        }))
    }

    const startLearning = () =>{
        // console.log("test");
        // setGlobal(global => ({...global,
        //     modalProp:{
        //         modalShow:true, 
        //         type: 'ChooseTypeLearningPlan',
        //    }
        // }))
        window.location.href = `${routeAll.routesUser.learningPage.path}?`+new URLSearchParams({type: "create"}).toString()+"&"+new URLSearchParams({user: securityData.Security_UserAccount()}).toString();
    }

    // const changeEditDimension = ()=>{
    //     setState(state =>({...state, isEditDimension:!state.isEditDimension}))
    // }

    const changeTypeDimension = ()=>{
        setState(state =>({...state, 
            isTypeDimensionCoreSkills:!state.isTypeDimensionCoreSkills, 
            isEditDimension:false
        }))
    }
    // const addToListDeletedDimension = (idMainFocus)=>{
    //     console.log(idMainFocus);
    //     //here logic delete main focus, call get only main focus to refresh state.data1 after delete
    // }

    const addYourOwnCategories = ()=>{
        // here logic to add custom learning plan from main focus
        setGlobal(global => ({...global,
            modalProp:{
                modalShow:true, 
                type: 'formCustomLearningPlan',
                dataLp: [
                    state.step0,
                    state.step1
                ]
           }
        }))
    }

    const renderCollapseData = (stepDetail,idxStep)=>{
        const imageHover = `learning_page_hover.png`
            switch (idxStep) {
                case 0:
                    return(
                        <Slider {...settings} ref={SliderRef.current[idxStep]}>
                            {state.data1.filter(v=>state.isTypeDimensionCoreSkills?v.lp_type===0:v.lp_type!==0).map((v,idx)=>
                            <div key={idx}>
                                <Card data-image-hover={`${env.assets}learningplan/${imageHover}`} className={`card-step-1 card-step-1-${idx>5?idx-6:idx} text-capitalize ${state[`step${idxStep}`] && state[`step${idxStep}`].id===v.id && `card-step-1-active`}`} ref={cardBodyMainFocusRef.current[idx]} style={{height:state.cardBodyHeightSubCategory==0?'auto': state.cardBodyHeightSubCategory}} >
                                    <Card.Body style={{display:'flex'}} onClick={()=>setStepX(v,idxStep)}>
                                        <br/>
                                        <span className="title-span-main-focus">
                                            <br/>
                                            {v.title_menu}
                                        </span>
                                    </Card.Body>
                                    {/* {
                                        state.isEditDimension &&
                                        <div className="edit-dimension" onClick={()=>addToListDeletedDimension(v.id)}>
                                            <Card.Img className={`check-read-image`} src={env.assets + 'learningplan/edit-mode-dimension.svg'} />
                                        </div>
                                    } */}
                                    
                                </Card>
                            </div>
                            )}
                            {/* {!state.isTypeDimensionCoreSkills && */}
                                {/* <div>
                                    <Card className={`card-step-1 learning-home-card-add-new`} style={{height:state.cardBodyHeightSubCategory==0?'auto': state.cardBodyHeightSubCategory}} onClick={()=>addYourOwnCategories()}>
                                        <Card.Body>
                                            <div className="learning-home-card-add-new-button">
                                                <span className="ripple-add-new-categories"></span>
                                                <svg className="img-add-new-categories" id="button-plus">
                                                    <use xlinkHref={`${state.assets}learningplan/add_new_plan.svg#Layer_1`}></use>
                                                </svg>
                                            </div>
                                            <br/>
                                            <span className="title-span-main-focus">
                                                {defaultLang.lang.txtAddNewCategoriesLearningPlan}
                                            </span>
                                        </Card.Body>
                                    </Card>
                                </div> */}
                            {/* } */}
                        </Slider>
                    )
                case 1:
                    const showKeyBehavior = state.step0 ? state.data2.filter(x => x.id_main_focus == state.step0.id): []
                    return(
                        <Slider {...settings} ref={SliderRef.current[idxStep]}>
                            {showKeyBehavior.map((v,idx)=>
                            <div key={idx} onMouseEnter={()=>hoverKeyBehavior(idx)} onMouseLeave={()=>hoverKeyBehavior(idx)}>
                                <Card className={`card-step-1 card-step-1-${idx>5?idx%6:idx} text-capitalize ${state[`step${idxStep}`] && state[`step${idxStep}`].id===v.id && `card-step-1-active`}`} ref={cardBodyKeyBehaviorRef.current[idx]} onClick={()=>setStepX(v,idxStep)}>
                                    <Card.Body style={{display:'grid'}}>
                                        {state[`isHovered${idx}`] && state.data3.filter(x=>x.id_key_behavior==v.id).length>0?
                                            <>
                                                <span className="title-span-main-focus">
                                                    <ul className="list-key-behavior">
                                                        {state.data3.filter(x=>x.id_key_behavior==v.id).map((z,idx)=>
                                                            <li key={idx}>{lang==='ENG'?z.title:z.title_ind}</li>
                                                        )}
                                                    </ul>
                                                </span>
                                            </>
                                        :
                                            <>
                                                <span className="title-span-main-focus">
                                                    <br/>
                                                    {lang==='ENG'?v.title_eng:v.title_ind}
                                                </span>
                                            </>
                                            
                                        }
                                        
                                    </Card.Body>
                                </Card>
                            </div>
                            )}
                        </Slider>
                    )
                case 2:
                    const listSkill = state.step1 ? state.data3.filter(x => x.id_key_behavior == state.step1.id):[]
                    const filteredForCustomLearningPlan = state.step0?.lp_type==3 ? listSkill.filter(z=>z.user_created==securityData.Security_UserId()):listSkill
                    return(
                        <div className="row">
                            <div className="col-sm-4">
                                {state.step0?.lp_type==3 &&
                                    <Card className={`card-step-1 card-step-3-skill learning-home-card-add-new`} onClick={()=>addYourOwnCategories()}>
                                        <Card.Body className="card-body-step-3-skill">
                                            <div className="learning-home-card-add-new-button">
                                                <span className="ripple-add-new-categories"></span>
                                                <svg className="img-add-new-categories" id="button-plus">
                                                    <use xlinkHref={`${state.assets}learningplan/add_new_plan.svg#Layer_1`}></use>
                                                </svg>
                                            </div>
                                            <span className="title-span-main-focus add-new">
                                                {defaultLang.lang.txtAddNewCategoriesLearningPlan}
                                            </span>
                                        </Card.Body>
                                    </Card>
                                }

                                {filteredForCustomLearningPlan.map((v,idx)=>
                                    <Card className={`text-capitalize card-step-1 card-step-3-skill card-step-1-${idx>5?idx%6:idx} ${state[`step${idxStep}`] && state[`step${idxStep}`].id===v.id && `card-step-1-active`}`} key={idx} onClick={()=>setStepX(v,idxStep)}>
                                        <Card.Body style={{display:'grid'}} className="card-body-step-3-skill">
                                                <span className="title-span-main-focus">
                                                    {v.title && v.title_ind? lang==='ENG'? v.title:v.title_ind : v.lp_name}
                                                </span>
                                        </Card.Body>
                                    </Card>
                                )}
                            </div>
                            {
                                state.dataModule ?
                                <div className="col-sm-8">
                                    <div className={`d-flex flex-row justify-content-between detail-list-skill-header`}>
                                        <div>{state.dataModule.length} MODULES</div>
                                        {
                                            state.step0?.lp_type!==3 &&
                                            <>
                                                <div className="vertical-line-step-3-skill-header">|</div>
                                                <div>
                                                    <Rating 
                                                        size={20} 
                                                        fillColor={'#000000'} 
                                                        ratingValue={state.step2? state.step2.rating? state.step2.rating * 20 : 0 : 50} 
                                                        readonly={true}
                                                        style={{marginTop: "-5%"}}
                                                    />
                                                </div>
                                                <div>{state.step2? state.step2.rating ?? 0 :0}</div>
                                                <div className="vertical-line-step-3-skill-header">|</div>
                                                <div>
                                                    {`learning hours :  ${ state.step0?.lp_type!==3 && state.step2? state.step2.learning_hours:'xxx'} hours`}
                                                </div>
                                            </>
                                        }
                                        
                                    </div>
                                    <div>
                                        {
                                            state.dataModule && state.dataModule.map((v,idx)=>
                                                <Card className={`card-module-step-3`} key={idx}>
                                                    <CardDataModule data={v}/>
                                                </Card>
                                            )
                                        }
                                    </div>
                                    {state.step0?.lp_type!==3 && state.dataModule && state.dataModule.length > 0 ?
                                        <div className="text-end">
                                            <button type="button" className="btn btn-primary btn-sm btn-choose-step button-finish" onClick={()=>finishLine()}>
                                                {defaultLang.lang.chooseTheseModuleText}
                                            </button>
                                        </div>
                                    :null}
                                    
                                </div>
                                :
                                null
                            }
                        </div>
                    )
                default:
                    return(
                        <div className="pt-3 pb-3">
                            isi collapse {stepDetail.title_eng}
                        </div>
                    )
            }
    }

    const overlayPopup = (data) =>{
        return(
            <Card style={{zIndex:999,margin:10}} className='popup-card'>
                <Card.Body className='p-3'>
                    <div className='popup-content-card'>
                        <div dangerouslySetInnerHTML={{__html: lang==='ENG'? data.popup_description_eng:data.popup_description_ind}}/>
                    </div>
                </Card.Body>
            </Card>
        )
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

    const cardLearningHome = (typeCard) => {
        let loopData = []
        switch (typeCard) {
            case 'continue':
                loopData = state.dataUserLearningPlan
                break;
            case 'completed_partial':
                loopData = state.dataUserLearningPlanCompleted.filter((_,index)=>index <= 3)
                break;
            case 'completed_full':
                loopData = state.dataUserLearningPlanCompleted
                break;
            default:
                loopData = state.dataUserLearningPlan
                break;
        }

        const cardText = (value, type) =>{
            if(type==='continue'){
                return(
                    <Card.Text className="text-white module-description learning-home-card-text">
                        <ShowMoreText
                            more={defaultLang.lang.showMore}
                            less={defaultLang.lang.showLess}
                        >
                            <div dangerouslySetInnerHTML={{__html:
                                lang==='ENG'?value.description:value.description_ind
                            }}/>
                        </ShowMoreText>
                    </Card.Text>
                )
            }else{
                return(
                    null
                )
            }
        }

        const renderCardFooterCompletedLearningPlan = (data)=>{
            return(
                <div className="d-flex flex-row flex-wrap justify-content-between align-items-center">
                    <div>{data.title_rate}</div>
                    <div>{data.star_rate}</div>
                    <div className="result-rate">{data.result_rate}</div>
                </div>
            )
        }

        const cardFooter = (value,type)=>{
            if(type==='continue'){
                return(
                <Card.Footer className="learning-home-card-footer ps-3 pb-3 pe-3 pt-0">
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
                    <Card.Footer className="pt-0 pe-3 ps-3">
                        <Card.Text className="text-white module-description learning-home-card-text">
                            <div className="d-flex flex-column flex-wrap">
                                <div className="pb-2">{defaultLang.lang.completed} &nbsp;{moment(moment.utc(value.complete_date)).format('L')}</div>
                                <div className="pb-2">{
                                    value.val_rating?
                                        renderCardFooterCompletedLearningPlan(
                                            {
                                                title_rate:defaultLang.lang.yourRate,
                                                star_rate:<Rating 
                                                                size={12} 
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
                                                star_rate:<Rate 
                                                                allowHalf={true}
                                                                allowClear={false}
                                                                value={state.ratingValue[value.id]}
                                                                onHoverChange={(e)=>rateCompletedLearningPlan(e,value,'hover')}
                                                                onChange={(e)=>rateCompletedLearningPlan(e,value,'click')}
                                                                style={{fontSize:12}}
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

        const openSidebarLearningDetail = (el)=>{
            setGlobal(global=>({...global, sidebarLearningDetail:{
                data:el.id,
                status:true,
                dataSkills:state.data3.filter(v=>v.id===el.id_key_behavior_dtl),
            }}))
        }

        return(
            loopData.map((el, i) =>
                <div className="col-sm-12 col-lg-3 learning-home-col-card" key={i}>
                    <Card className="h-100 learning-home-card">
                        <Card.Img variant="top" className="img-fluid learning-home-card-image" src={state.userDocument + "category/"+ el.category_image} onError={(e)=>e.target.src="https://via.placeholder.com/173x98"} onClick={()=>openSidebarLearningDetail(el)}/>
                        <Card.Body className="ps-3 pt-3 pe-3 pb-2" onClick={()=>openSidebarLearningDetail(el)}>
                            <Card.Title className={`module-title mb-3`}>{lang==='ENG'?el.title:el.title_ind}</Card.Title>
                            {cardText(el,typeCard)}
                        </Card.Body>
                        {cardFooter(el,typeCard)}
                    </Card>
                </div>
            )
        )
    }

    const cardAddNewPlan =()=>{
        return(
            // state.dataUserLearningPlan.length < 3 &&
            <div className={`col-sm-12 col-lg-3 learning-home-col-card`}>
                <Card className={`${state.dataUserLearningPlan.length > 0 && ` h-100`} learning-home-card-add-new`} style={{height:state.dataUserLearningPlan.length <= 0 && !isMobile?'250px':''}}>
                    <Card.Body>
                        <div className="text-end learning-home-card-add-new-button" onClick={()=>startLearning()}>
                            <span className="ripple"></span>
                            <Image src={`${state.assets}learningplan/add_new_plan.svg`} width={60}/>
                        </div>
                        <Card.Title className={`learning-home-card-add-new-title`}>{defaultLang.lang.addNewLearningPlan}</Card.Title>
                    </Card.Body>
                </Card>
            </div>
        )
    }

    const leftSidebar = ()=>{
        return(
            state.stepData.map((v,idx)=>
                <div key={idx} className={`sidebar-collapse-${idx-1} ${collapseData===idx? collapseData===3?`height-sidebar-collapse-active-last-step`:`height-sidebar-collapse-active`:``}`}>
                    <div className={`sidebar-collapse-master ${collapseData===idx?`sidebar-collapse-active`:collapseData<idx && `d-none`} sidebar-collapse-${idx} `}>
                        <div className="d-flex flex-row flex-wrap justify-content-between align-items-center">
                            <div>
                                {lang==='ENG'? v.title_eng:v.title_ind}
                            </div>
                            <div className={`${collapseData===idx && `d-none`} sidebar-expand-learning-plan`} onClick={()=>idx===0 ? resetStep(idx) : setCollapseData(idx)}>
                                {collapseData===3?null:'expand'}
                            </div>
                        </div>
                        <Collapse in={collapseData===idx?true:false} >
                            <div className={collapseData>idx && `d-none`}>
                                <hr/>
                                <div className="sidebar-subtitle pt-1 pb-2">{lang==='ENG'? v.sub_title_eng : v.sub_title_ind}</div>
                                <div className="sidebar-description pb-2" dangerouslySetInnerHTML={{__html:
                                    lang==='ENG'? v.description_eng: v.description_ind
                                }}/>
                                <hr/>
                                {
                                collapseData===3 && state.dataUserLearningPlan.length < 3 &&
                                <div className="text-center pb-5">
                                        <button type="button" className="btn btn-primary btn-sm btn-choose-step button-start-learn" onClick={()=>startLearning()}>
                                            {defaultLang.lang.addAnotherPlan}
                                        </button>
                                    </div>
                                }
                            </div>
                        </Collapse>
                    </div>
                </div>
            )
        )
    }

    const rightBarDetailLearningHome = ()=>{
        return(
            <div>
                <div className="d-flex flex-column">
                    <div className="pt-4 pb-2"><h2 className='m-0'>{defaultLang.lang.continueLearning}</h2></div>
                    <div className="pb-4 complete-learning-subtitle">
                        <Image src={`${state.assets}learningplan/learning_plan_point.svg`} width={18}/>&nbsp;&nbsp;
                        {defaultLang.lang.subTitleContinueLearning.replace('[variable]',completePoint)}
                    </div>
                    <div className="pb-2">
                        <div className="row">
                                {cardLearningHome('continue')}
                                {cardAddNewPlan()}
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="d-flex flex-column">
                    <div className="pt-2 pb-2">
                        <div className="d-flex flex-row flex-wrap justify-content-between align-items-center">
                            <div><h2 className='m-0'>{defaultLang.lang.completedLearningPlan}</h2></div>
                            {state.dataUserLearningPlanCompleted.length > 3 ?
                                <div className="see-all-button" onClick={()=>setState(state =>({...state, typeCompletedLearningPlan:'completed_full'}))}>{defaultLang.lang.seeAll}</div>
                            :
                                null}
                            
                        </div>
                    </div>
                    <div className="pb-2 complete-learning-subtitle">{defaultLang.lang.subTitleCompletedLearningPlan}</div>
                    <div className="pb-2">
                        <div className="row">
                            {cardLearningHome(state.typeCompletedLearningPlan)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const changeValueShowButton = (idx, type)=>{
        const newValShowButton = state.showButtonReset.slice()
        switch (type) {
            case 'enter':
                newValShowButton[idx] = true
                break;
            case 'leave':
                newValShowButton[idx] = false
                break;
            default:
                newValShowButton[idx] = true
                break;
        }
        setState(state =>({...state,showButtonReset:newValShowButton}))

    }

    const rightBarDetailLearningCreate = () =>{
        return(
            state.stepData.filter(v=>v.seqnum !== 4).map((v,idx)=>
                <div key={idx}>
                <div className="row">
                    <div className="col-sm-6">
                        <span className={`text-capitalize title-main-step ${collapseData==idx && 'active'}`}>{lang==='ENG'? v.title_eng:v.title_ind}</span> 
                        &nbsp; &nbsp; 
                        {collapseData===idx && 
                            <OverlayTrigger
                                placement='auto'
                                trigger={['hover','focus']}
                                overlay={overlayPopup(v)}
                            >
                                <img src={state.assets + 'learningplan/info_icon.svg'} alt="info-button" className="icon-info"/>
                                {/* <i className="fa fa-info-circle" style={{color: '#0834d3'}} aria-hidden="true"></i> */}
                            </OverlayTrigger>
                        }
                    </div>
                    <div className="col-sm-6 arrow-title-main-step text-end" >
                        {
                            collapseData===idx?
                                <div className="arrow-child-title-main-step">
                                    {collapseData===0?
                                        <div className="d-flex flex-row step0-main-arrow pe-3 align-items-center">
                                            <div className="cursor-pointer" onClick={()=>changeTypeDimension()}>
                                                {state.isTypeDimensionCoreSkills?
                                                    <div className="d-flex flex-row dimension-type">
                                                        <div>{defaultLang.lang.typeLearningPlanRoles}&nbsp;&nbsp;&nbsp;</div>
                                                        <div><i className="fa fa-chevron-right dimension-arrow-type" aria-hidden="true" role="button"></i></div>
                                                    </div>
                                                :
                                                    <div className="d-flex flex-row dimension-type">
                                                        <div><i className="fa fa-chevron-left dimension-arrow-type" aria-hidden="true" role="button"></i></div>
                                                        <div> &nbsp;&nbsp;&nbsp;{defaultLang.lang.typeLearningPlanCoreSkills}</div>
                                                    </div>
                                                }
                                            </div>
                                            {/* {
                                                !state.isTypeDimensionCoreSkills && <div className="see-all-button ps-4" onClick={()=>changeEditDimension()}>{state.isEditDimension?defaultLang.lang.doneButtonLearningPlan:defaultLang.lang.editButtonLearningPlan}</div>
                                            } */}

                                        </div>
                                    :
                                    <div className="arrow-child">
                                        <i className="fa fa-chevron-left cursor-pointer" aria-hidden="true" role="button" onClick={()=>SliderRef.current[idx].current.slickPrev()}></i>
                                        &nbsp;&nbsp;&nbsp;
                                        <i className="fa fa-chevron-right cursor-pointer" aria-hidden="true" role="button" onClick={()=>SliderRef.current[idx].current.slickNext()}></i>
                                    </div>
                                    }


                                </div>
                            :
                                state[`step${idx}`] ?
                                <div className="btn-group" role="group" aria-label="Basic example" onMouseEnter={()=>changeValueShowButton(idx,'enter')} onMouseLeave={()=>changeValueShowButton(idx,'leave')}>
                                    <button type="button" className="btn btn-sm btn-choose-step btn-choose-step-left">
                                        {lang==='ENG'? 
                                            state[`step${idx}`].title_eng || state[`step${idx}`].title_menu || state[`step${idx}`].title
                                            :
                                            state[`step${idx}`].title_ind || state[`step${idx}`].title_menu}
                                    </button>
                                    {state.showButtonReset[idx] &&
                                        <button type="button" className="btn btn-sm btn-choose-step btn-choose-step-right" onClick={()=>{resetStep(idx);changeValueShowButton(idx,'leave')}}>
                                            <img src={state.assets + 'learningplan/edit_button.png'} alt="edit_button" className="icon-info"/>
                                        </button>
                                    }
                                    
                                </div>
                                :
                                null
                        }
                    </div>
                </div>
                <Collapse in={collapseData===idx?true:false}>
                    {renderCollapseData(v,idx)}
                </Collapse>
                {
                    idx!==2 && <hr/>
                }
                </div>
            )
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
    //                 renderData = defaultLang.lang.workshopCapacityOnlyOne
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

    return(
        <>
            <div id="topic" className="section-topic">
                <div className="container web-tour-section-topic">
                    <div className="row justify-content-center2">
                        <div className="col-md-12">
                            <div className=" text-center">
                                <h2 className="section-title">
                                    {/* {props.pageName} */}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <section id="function" className="section-view-all learning-plan" >
                <div className="container">
                    <div className="row">
                        <div className="col-sm-1 add-padding-bottom-learning-plan"></div>
                        {isMobile && !state.param ? null : 
                            <div className="col-sm-3 sidebar-learning-plan p-0">
                                
                                <div className="d-flex flex-row flex-wrap justify-content-between align-items-center pb-4 header-sidebar-learning-plan">
                                    <div>
                                        {`${userName}'s`} <br/>Learning plan
                                    </div>
                                    <div>
                                        <Image src={`${state.assets}learningplan/learning_plan_setting.svg`} width={18}/>&nbsp;&nbsp;
                                    </div>
                                </div>
                                {
                                    //sidebar kiri
                                    leftSidebar()
                                }
                            </div>
                        }
                        <div className="col-sm-7 main-step-learning">
                            {collapseData===3?
                                //ini tampilan detail sebelah kanan learning home (status learning plan user)
                                rightBarDetailLearningHome()
                            :
                                //ini tampilan detail sebelah kanan untuk create learning plan
                                rightBarDetailLearningCreate()
                            }
                        </div>
                        <div className="col-sm-1"></div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Learning;