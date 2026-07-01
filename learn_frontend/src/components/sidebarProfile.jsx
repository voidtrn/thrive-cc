import React, { useEffect, useState, useRef, useContext } from 'react';
import { Image, Offcanvas, CloseButton, Accordion, Card, ProgressBar } from 'react-bootstrap';
import GlobalState from '../helpers/globalState';
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/css/sidebarProfile.scss';
import { Rating } from 'react-simple-star-rating'
import { env, securityData } from '../helpers/globalHelper';
import routeAll from '../helpers/route';
import defaultLang from '../helpers/lang';
import axiosLibrary from '../helpers/axiosLibrary';
// import ShowMoreText from "react-show-more-text";
// import moment from 'moment/min/moment-with-locales';
import { isMobile } from 'react-device-detect';
import { cssTarget, LoadingData } from './Loading';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { XAxis, YAxis, Tooltip, AreaChart, Area, } from 'recharts';

import moment from 'moment';
import 'moment/locale/id';
import _ from 'lodash';

export function SidebarProfile(props){
    const lang = securityData.Security_lang()
    const [global, setGlobal] = useContext(GlobalState)
    const [show, setShow] = useState(false);
    const [state,setState] = useState({
        activeTab:'profile',
        activeLearningPlan:defaultLang.lang.inProgress,
        loadingDataLearningPlan:false,
        dataUserLearningPlan:[],
        dataUserLearningPlanCompleted:[],
        dataLearningSkillsMaster:[],
        ratingValue:[],
        userDocument: env.userDocument,
        assets:env.assets,
        buttonNextPrevLearningPlan:{
            next:'block',Prev:'block'
        },
        refLearningPlan:{current: null},
        valueContentperWeek:1,
        dataContentperWeek:[],
        dataRecapTxt:{countRedeem:9999,countContent:9999,countBadges:9999,countWorkshop:9999},
        dataChartperWeek:[{
            date:"",
            name:"",
            content:0
        }]

    })
    const platform_id = securityData.Security_getPlatformId()
    const refLearningPlan = useRef(null)
    const dateRangeParam = 7
    const [calVar,setCalVar] = useState({
        titleCalendar:moment().format(),
        startDateWeek:moment().startOf('week'),
        endDateWeek:moment().endOf('week'),
        choosenDate:moment().format(),
        eventTabActive:0,
        showSearchInput:false,
        valSearchInput:"",
        dataEventCalendar:[],
    })

    // const updateProgress = async()=>{
    //     const isi = await axiosLibrary.postData('awbLearningPlan/UpdateUserLearningProgress',{});
    //     if(isi.status===200){
    //         checkUserLearningPlan()
    //     }
    // }

    const checkUserLearningPlan = async () =>{
        setState({...state,loadingDataLearningPlan:true})
        const credentials = {
            platform_id:platform_id,
            from_where:'sidebar_profile'
        }

        const response = await axiosLibrary.postData('awbLearningPlan/CheckUserLearningPlan',credentials);
        if(response.status===200){
            setState(state =>({...state, 
                dataUserLearningPlan:response.data.data.filter(v=>v.progress_lp < 100), 
                dataUserLearningPlanCompleted:response.data.data.filter(v=>v.progress_lp >= 100),
            }))
            if(global.modalProp.loadContent){
                setState({...state,loadingDataLearningPlan:false})
            }
        }
    }

    const loadAllData = () =>{
        setState(state =>({...state, 
            loadingDataLearningPlan:true,
        }))
        const load_all_data = [
            checkUserLearningPlan(),
            getDataSkillsMaster(),
            checkDataHaveContentperWeek(),
            getDataRecapTxt(),
            get7DaysAgo(),
            getDataEventCalendar(),
            visibility(),
        ]

        Promise.all(
            load_all_data
        ).then(()=>{
            setState(state =>({...state, 
                loadingDataLearningPlan:false,
            }))
        } 
        )
    }

    useEffect(()=>{
        if(global.sidebarProfile){
            setShow(true)
            loadAllData()
        }

    },[global.sidebarProfile])

    useEffect(()=>{
        visibility()
    },[refLearningPlan,state.refLearningPlan,state.activeLearningPlan])

    useEffect(()=>{
        if(global.sidebarProfile){
            if(global.loadContentSidebarProfile){
                loadAllData()
            }
        }
    },[global])

    const handleClose = () => {
        setShow(false)
        setGlobal(global => ({...global, sidebarProfile:false, loadContentSidebarProfile: false}))
    }

    //here recap
    const get7DaysAgo = async() =>{

        const param={
            platform_id:platform_id,
            dateRange:dateRangeParam
        }

        let date = [...Array(param.dateRange)].map((_, i)=>{
            const d = moment().subtract(i, 'days').format("DD-MM-YYYY")
            const dName = moment().subtract(i, 'days').format("ddd")
            return {
                id:i,
                date:d,
                name:dName,
                content:0
                // Math.floor(Math.random() * 101)
            }
        })
        date = _.orderBy(date, ['id'], ['desc']);

        const response = await axiosLibrary.postData('awbProfile/DataChartRecap',param);
        if(response.status===200){
            response.data.data.map((x)=>{
                date.map((v)=>{
                    if(v.date==x.date_read){
                        v.content=x.total_read
                    }
                    return v
                })
            })
        }
        setState(state=>({...state,dataChartperWeek:date}))
    }

    const getDataRecapTxt = async ()=>{
        const param = {
            platform_id:platform_id,
            showPublishOnly: 1            
        }

        const response = await axiosLibrary.postData('awbProfile/DataRecap',param);
        if(response.status===200){
            setState(state=>({...state,dataRecapTxt:response.data.data}))
        }

    }

    // const CustomTooltip = ({ active, payload, label }) => {
    //     if (active && payload && payload.length) {
    //       return (
    //         <div className="custom-tooltip">
    //           <p className="label">{`${payload[0].payload.name} : ${payload[0].payload.val}`}</p>
    //         </div>
    //       );
    //     }
    //     return null;
    // };

    const renderRecapChart = () =>{
        return(
            <div className="pt-3">
                <AreaChart
                width={isMobile?320:500}
                height={200}
                data={state.dataChartperWeek}
                margin={{
                    top: 10,
                    right: 60,
                    left: -20,
                    bottom: 10,
                }}

                >
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#514b87' }} angle={isMobile?45:0} tickMargin={10} minTickGap={5} interval={"preserveStartEnd"}/>
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#514b87' }} allowDecimals={false}/>
                    <Tooltip 
                        // content={<CustomTooltip/>}
                    />
                    <Area type="monotone" dataKey="content" fill="url(#linearGradientId)" />
                </AreaChart>
            </div>
        )
    }

    const renderTxtRecap = ()=>{
        const dataTxtRecap = [
            {value:state.dataRecapTxt.countRedeem,txt:defaultLang.lang.redeemablePoints},
            {value:state.dataRecapTxt.countContent,txt:defaultLang.lang.contentViewed},
            {value:state.dataRecapTxt.countBadges,txt:defaultLang.lang.badgesAchieved},
            {value:state.dataRecapTxt.countWorkshop,txt:defaultLang.lang.workshopAttended},
        ]
        return(
            <div className="pt-3">
                <div className="d-flex flex-row">
                    {dataTxtRecap.map((v,idx)=>
                        <div className="pe-2 ps-2 data-recap-txt" key={idx}>
                            <div className="data-recap-txt-number">{v.value}</div>
                            <div>{v.txt}</div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
    //end here recap

    // set goals
    const renderGoalPlan = ()=>{
        let textButtonAddGoal = ''
        let leftContent = ''
        if(state.dataContentperWeek.length > 0){
            textButtonAddGoal = defaultLang.lang.editGoal
            leftContent =
            <div className="d-flex flex-row align-items-center flex-goal-plan-progress" >
                <div className="goal-plan-progress">
                    <CircularProgressbar
                        value={state.dataContentperWeek[0].currentProgress/state.dataContentperWeek[0].totalTarget}
                        maxValue={1}
                        text={`${Math.round(state.dataContentperWeek[0].currentProgress/state.dataContentperWeek[0].totalTarget * 100).toFixed(0)}%`}
                        background
                        backgroundPadding={6}
                        styles={buildStyles({
                            backgroundColor: "url(#linearGradientId)",
                            textColor: "#fff",
                            pathColor: "#fff",
                            trailColor: "transparent"
                        })}
                        counterClockwise
                        strokeWidth={2}
                    />
                </div>
                <div className="p-3 current-progress">
                    {defaultLang.lang.descHaveGoal.replace('[variable]',state.dataContentperWeek[0].totalTarget)}
                </div>
            </div>
        }else{
            textButtonAddGoal = defaultLang.lang.addGoal
            leftContent =
            <div className="d-flex flex-row align-items-center" >
                <div>
                    <div className="input-group add-content-input">
                        <div className="input-group-prepend">
                            <button className="btn button-plus btn-outline-secondary border-0" type="button" id="button-plus" onClick={()=>PlusMinusButton('plus')}><i className="fa fa-plus" aria-hidden="true"></i></button>
                        </div>
                        <input type="text" min="1" max="100" className="form-control border-0 input-content" value={state.valueContentperWeek} aria-label="content/week" aria-describedby="content/week" disabled={true}/>
                        <div className="input-group-append">
                            <button className="btn button-minus btn-outline-secondary border-0 " type="button" id="button-minus" onClick={()=>PlusMinusButton('minus')}><i className="fa fa-minus" aria-hidden="true"></i></button>
                        </div>
                    </div>
                </div>
                <div className="ps-3 content-week">
                    {defaultLang.lang.contentsWeek}
                </div>
            </div> 
        }

        return(
            <div className="d-flex flex-row flex-wrap align-items-center pt-3">
                <div className="p-2 me-auto left-side-goal-plan">
                    {leftContent}
                </div>
                <div className="p-2 button-add-goal">
                    <button type="button" className="btn btn-primary btn-sm btn-choose-step button-start-learn" onClick={()=>addGoal()}>
                        {textButtonAddGoal}
                    </button></div>
            </div>
        )
    }

    const checkDataHaveContentperWeek = async()=>{
        const param={
            platform_id:platform_id,
            dateRange:dateRangeParam
        }

        const response = await axiosLibrary.postData('awbProfile/DataGoalUser',param);
        if(response.status===200){
            if(response.data.data.length>0){
                setState(state=>({...state,dataContentperWeek:[
                    {
                        id:response.data.data[0].id, 
                        totalTarget:response.data.data[0].content, 
                        currentProgress:response.data.data2,
                    }
                ],valueContentperWeek:response.data.data[0].content}))
            }
        }
    }

    const PlusMinusButton = (type)=>{
        switch (type) {
            case 'plus':
                if(state.valueContentperWeek >=100){
                    alert('max number content / week')
                }else{
                    setState({...state,valueContentperWeek:state.valueContentperWeek+1})
                }
                break;
            case 'minus':
                if(state.valueContentperWeek <=1){
                    alert('min number content / week')
                }else{
                    setState({...state,valueContentperWeek:state.valueContentperWeek-1})
                }
                break;
            default:
                break;
        }
    }

    const addGoal = async()=>{
        const param = {
            value: state.valueContentperWeek,
            platform_id:platform_id,
            dateRange:dateRangeParam
        }
        if(state.dataContentperWeek.length > 0){
            // here edit goal
            // clear dataContentperWeek
            setState({...state,dataContentperWeek:[]})
        }else{
            const response = await axiosLibrary.postData('awbProfile/StoreGoalPlan',param);
            if(response.status===200){
                loadAllData()
            }
        }


    }
    // end set goals

    // learning plan
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
    const scrollLearningPlan = (value)=>{
        refLearningPlan.current.scrollLeft += value;
        visibility()
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

    const renderCardLearningPlan =()=>{
        let loopData = [];
        switch (state.activeLearningPlan) {
            case defaultLang.lang.inProgress:
                loopData = state.dataUserLearningPlan
                break;
            case defaultLang.lang.done:
                loopData = state.dataUserLearningPlanCompleted
                break;
            default:
                loopData = state.dataUserLearningPlan
                break;
        }

        const openSidebarLearningDetail = (el)=>{
            setGlobal(global=>({...global, sidebarLearningDetail:{
                data:el.id,
                status:true,
                dataSkills:state.dataLearningSkillsMaster.filter(v=>v.id===el.id_key_behavior_dtl),
            }}))
        }
        
        return(
            <div className="sidebar-card-learn-plan d-flex flex-row" ref={refLearningPlan}>
                {loopData.map((el, i) =>
                    <div className="p-2 sidebar-div-card-learning-plan" key={i}>
                        <Card className="h-100 sidebar-learning-home-card" onClick={()=>openSidebarLearningDetail(el)}>
                            <Card.Img variant="top" className="img-fluid sidebar-learning-home-card-image" src={state.userDocument + "category/"+ el.category_image} onError={(e)=>e.target.src="https://via.placeholder.com/173x98"}/>
                            <Card.Body className="ps-3 pt-3 pe-3 pb-2" >
                                <Card.Title className={`sidebar-title-card-learning-plan mb-0`}>{lang==='ENG'?el.title:el.title_ind}</Card.Title>
                                {/* {cardText(el,state.activeLearningPlan)} */}
                            </Card.Body>
                            {cardFooter(el,state.activeLearningPlan)}
                        </Card>
                    </div>
                )}
            </div>
        )
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
                                            star_rate:<Rate 
                                                            allowHalf={true}
                                                            allowClear={false}
                                                            value={state.ratingValue[value.id]}
                                                            onHoverChange={(e)=>rateCompletedLearningPlan(e,value,'hover')}
                                                            onChange={(e)=>rateCompletedLearningPlan(e,value,'click')}
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

    const visibility = ()=>{
        if(refLearningPlan.current){
            if(state.refLearningPlan.current){
                if(state.refLearningPlan.current.scrollLeft == 0){
                    setState(state =>({...state,buttonNextPrevLearningPlan:{...state.buttonNextPrevLearningPlan, prev:'hidden'}}))
                }else{
                    setState(state =>({...state,buttonNextPrevLearningPlan:{...state.buttonNextPrevLearningPlan, prev:'visible'}}))
                }
            
                if(state.refLearningPlan.current.scrollLeft >= (state.refLearningPlan.current.scrollWidth - state.refLearningPlan.current.clientWidth)){
                    setState(state =>({...state,buttonNextPrevLearningPlan:{...state.buttonNextPrevLearningPlan, next:'hidden'}}))
                }else{
                    setState(state =>({...state,buttonNextPrevLearningPlan:{...state.buttonNextPrevLearningPlan, next:'visible'}}))
                }
            }
            setState(state =>({...state,refLearningPlan:refLearningPlan}))
        }else{
            setState(state =>({...state,buttonNextPrevLearningPlan:{...state.buttonNextPrevLearningPlan, prev:'hidden', next:'hidden'}}))
        }
    }

    const renderButton = ()=>{

        return(
            <div className="sidebar-card-button-nav">
                <div className="d-flex flex-row justify-content-between">
                    <div className="sidebar-card-button-nav-prev" onClick={()=>scrollLearningPlan(-150)}>
                        <Image 
                        src={state.assets + "img/button-next-prev.svg"} title={'prev'} width={50} style={{visibility: state.buttonNextPrevLearningPlan.prev}}
                        />
                    </div>
                    <div className="sidebar-card-button-nav-next" onClick={()=>scrollLearningPlan(150)}>
                        <Image 
                        src={state.assets + "img/button-next-prev.svg"} title={'next'} width={50} style={{visibility: state.buttonNextPrevLearningPlan.next}}
                        />
                    </div>
                </div>
            </div>
        )
    }
    // end learning plan

    // calendar view
    const changeWeekHandler = (type,data)=>{
        switch (type) {
            case 'next':
                setCalVar(calVar =>({...calVar,
                    titleCalendar:moment(calVar.titleCalendar).add(1,'weeks'),
                    startDateWeek:moment(calVar.startDateWeek).add(1,'weeks').startOf('week'),
                    endDateWeek:moment(calVar.endDateWeek).add(1,'weeks').endOf('week'),
                }))
                break;
            case 'prev':
                setCalVar(calVar =>({...calVar,
                    titleCalendar:moment(calVar.titleCalendar).subtract(1,'weeks'),
                    startDateWeek:moment(calVar.startDateWeek).subtract(1,'weeks').startOf('week'),
                    endDateWeek:moment(calVar.endDateWeek).subtract(1,'weeks').endOf('week'),
                }))
                break;
            case 'chosen':
                setCalVar(calVar =>({...calVar,
                    titleCalendar:moment(data).format(),
                    choosenDate:moment(data).format(),
                    eventTabActive:0
                }))
                break;
            default:
                // today
                setCalVar(calVar =>({...calVar,
                    titleCalendar:moment().format(),
                    startDateWeek:moment().startOf('week'),
                    endDateWeek:moment().endOf('week'),
                    choosenDate:moment().format(),
                    eventTabActive:0
                }))
                break;
        }
    }
    const renderDate = ()=>{
        const rows = [];
        let days = [];
        let day = calVar.startDateWeek;
        let currentMonth = moment(calVar.titleCalendar).format('M')
        let formattedDays = "";
        let formattedDate = "";
        let getCurrentMonth = "";
        let getCurrentEvent = "";
        let getChoosenDate = "";
        while (day <= calVar.endDateWeek) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day
                formattedDays = day.format('ddd')
                formattedDate = day.format('DD')
                getChoosenDate = day.format('DD/MM/YYYY')==moment(calVar.choosenDate).format('DD/MM/YYYY') && `selected-manual-date`
                getCurrentEvent = calVar.dataEventCalendar.find(item=>moment(item.calendar_date).format('DD/MM/YYYY')==day.format('DD/MM/YYYY'))
                getCurrentMonth = day.format('M')!==currentMonth && `not-current-month`
                days.push(
                    <div className="ps-2 pe-2 text-center fc-list-date" key={day}>
                        <div className="pb-4">{formattedDays}</div>
                        <div 
                            className={`p-4 calendar-date d-flex flex-column justify-content-center align-items-center ${getChoosenDate} ${getCurrentMonth}`}
                            onClick={()=>changeWeekHandler('chosen',cloneDay)}
                        >
                            <div>{formattedDate}</div>
                        </div>
                        <div className={`${getCurrentEvent ? `have-event`:`not-have-event`}`}>
                            <i className="fa fa-circle" aria-hidden="true"></i>
                        </div>
                    </div>
                )
                day = moment(day).add(1,'d')
            }
            rows.push(
            <div className="d-flex flex-row align-items-center justify-content-between" key={day}>
                {days}
            </div>
            );
            days = [];
        }
        return(
            rows
        )
    }
    const calendar = () =>{
        return (
            <div className="ps-5 pe-5 pb-4 pt-4 calendar-view">
                <div className="d-flex flex-row align-items-center pb-4">
                    <div className="ps-2 pe-2 fc-toolbar-title">
                        {moment(calVar.titleCalendar).format('MMMM YYYY')}
                    </div>
                    <div className="ps-2 pe-2">
                        <button type="button" className="btn fc-today-button btn-primary"  onClick={()=>changeWeekHandler()}>{defaultLang.lang.today}</button>
                    </div>
                    <div className="ps-2 pe-2 ms-auto">
                        <div className="d-flex flex-row">
                            <div>
                                <button type="button" className="btn fc-button btn-light" onClick={()=>changeWeekHandler('prev')}><i className="fa fa-angle-left" aria-hidden="true"></i></button>
                            </div>
                            <div>
                                <button type="button" className="btn fc-button btn-light" onClick={()=>changeWeekHandler('next')}><i className="fa fa-angle-right" aria-hidden="true"></i></button>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="overflow-auto render-date">
                    {renderDate()}
                </div>
            </div>
        )
    }
    // end calendar view

    // calendar event view
    const changeEventTab = (value)=>setCalVar(calVar =>({...calVar,eventTabActive:value}))

    const renderTabStyle = (value)=>calVar.eventTabActive==value && ` selected-tab-view `

    const showSearchInput=()=>setCalVar(calVar =>({...calVar,showSearchInput:!calVar.showSearchInput,valSearchInput:""}))

    const renderSearchInput = ()=>!calVar.showSearchInput && ` d-none`

    const onChangeSearch = (e)=>setCalVar(calVar =>({...calVar,valSearchInput:e.target.value}))

    const submitSearch = (e)=>{
        e.preventDefault()
        setCalVar(calVar =>({...calVar,showSearchInput:true}))
    }

    const getDataEventCalendar = async()=>{
        const credentials = {
            limit: 999999,
            offset:0,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCalendar/ListData',credentials);
        if(isi.status===200){
            setCalVar(calVar =>({...calVar,dataEventCalendar:isi.data.data}))
        }
    }

    const renderDetailEvent = ()=>{
        let dataEvent = []
        switch (calVar.eventTabActive) {
            case 0:
                dataEvent = calVar.dataEventCalendar.filter(item=>moment(item.calendar_date).format('DD/MM/YYYY')==moment(calVar.choosenDate).format('DD/MM/YYYY'))
                break;
            case 1:
                dataEvent = calVar.dataEventCalendar.filter(item=>moment(item.calendar_date).format() > moment(calVar.choosenDate).format() && moment(item.calendar_date).format() < moment(calVar.choosenDate).add(7,'d').format())
                break;
            default:
                dataEvent = calVar.dataEventCalendar.filter(item=>moment(item.calendar_date).format('DD/MM/YYYY')==moment(calVar.choosenDate).format('DD/MM/YYYY'))
                break;
        }
        if(calVar.showSearchInput){
            let searchInput = calVar.valSearchInput.toLowerCase()
            dataEvent = dataEvent.filter(item=>
                item.calendar_event.toLowerCase().includes(searchInput) ||
                item.calendar_event_ind && item.calendar_event_ind.toLowerCase().includes(searchInput) ||
                item.calendar_event_subtitle && item.calendar_event_subtitle.toLowerCase().includes(searchInput) ||
                item.calendar_event_subtitle_ind && item.calendar_event_subtitle_ind.toLowerCase().includes(searchInput) ||
                item.calendar_event_description && item.calendar_event_description.toLowerCase().includes(searchInput) ||
                item.calendar_event_description_ind && item.calendar_event_description_ind.toLowerCase().includes(searchInput)
            )
        }
        return(
            <Accordion defaultActiveKey="0">
                {dataEvent.map((data,i)=>
                    <Accordion.Item eventKey={i} bsPrefix='card-detail-event-header mb-3 p-2' key={i}>
                        <Accordion.Header>
                            <div className="d-flex flex-column flex-grow-1">
                                <div className="d-sm-flex flex-row title-event-detail align-items-center justify-content-between">
                                    <div className="ps-2 pe-5 sub-title-1-event-detail">
                                        {lang==='ENG'?data.calendar_event:data.calendar_event_ind}
                                    </div>
                                    <div className="ps-2 pe-2 ">
                                        {data.calendar_date_time ? 
                                            <div className="sub-title-2-event-detail p-1 ps-2 pe-2">
                                                {data.calendar_date_time}
                                            </div>
                                            :null
                                        }
                                        
                                    </div>
                                </div>
                                <div className="d-flex flex-row sub-title-3-event-detail">
                                    {lang==='ENG'?data.calendar_event_subtitle:data.calendar_event_subtitle_ind}
                                </div>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body bsPrefix='card-detail-event-body'>
                            <div dangerouslySetInnerHTML={{__html: 
                                lang==='ENG'?data.calendar_event_description:data.calendar_event_description_ind
                            }}/>
                        </Accordion.Body>
                    </Accordion.Item>
                )}
            </Accordion>
        )
    }

    const calendarEvent = () =>{
        return(
            <div className="ps-5 pe-5 pb-0 pt-5 event-view">
                <div className="d-flex flex-column">
                    <div className="ps-2 pe-2 pb-2 event-header">
                        {defaultLang.lang.myEvents}
                    </div>
                    <div className="d-flex flex-row align-items-center pb-4">
                        <div className={`ps-2 pe-2 ${renderTabStyle(0)} unselected-tab-view`} onClick={()=>changeEventTab(0)}>{defaultLang.lang.today}</div>
                        <div className="ps-1 pe-1 unselected-tab-view">|</div>
                        <div className={`ps-2 pe-2 ${renderTabStyle(1)} unselected-tab-view`} onClick={()=>changeEventTab(1)}>{defaultLang.lang.upcoming}</div>
                        <div className="ps-2 pe-2 ms-auto">
                            <form action="search" method="post" onSubmit={submitSearch}>
                                <input 
                                    type="search" 
                                    className={`form-control search-event ${renderSearchInput()}`} 
                                    value={calVar.valSearchInput} 
                                    onChange={(e)=>onChangeSearch(e)}
                                />
                            </form>
                        </div>
                        <div className="ps-2 pe-2 search-icon" onClick={()=>showSearchInput()}><i className="fa fa-search" aria-hidden="true"></i></div>
                    </div>
                    <div className="pe-2 me-2 area-event-detail">
                        {renderDetailEvent()}
                    </div>
                </div>
            </div>
        )
    }

    const notificationCircleCalendar = () => calVar.dataEventCalendar.find(item=>moment(item.calendar_date).format('DD/MM/YYYY')==moment().format('DD/MM/YYYY'))
    // end calendar event view

    const renderProfile = () =>{
        return(
            <ul>
                <li className="sidebar-li-title">
                    <div className="d-flex flex-column flex-wrap">
                        <div className="d-flex flex-row flex-wrap justify-content-between align-items-center">
                            <div><h5 className="mb-0">{defaultLang.lang.hereYourRecap}</h5></div>
                        </div>
                        {renderRecapChart()}
                        {renderTxtRecap()}
                    </div>
                </li>
                <li className="sidebar-li-title">
                    <div className="d-flex flex-row flex-wrap justify-content-between align-items-center">
                        <div className="set-your-goal"><h5 className="mb-0">{defaultLang.lang.setYourGoal}</h5></div>
                        <div className="span-set-your-goal">{defaultLang.lang.spanSetYourGoal}</div>
                    </div>
                    {renderGoalPlan()}
                </li>
                <li className="sidebar-li-title">
                    <div className="d-flex flex-row flex-wrap justify-content-between align-items-center">
                        <div className="me-auto"><h5 className="mb-0">{defaultLang.lang.learningPlan}</h5></div>
                        <div 
                            className={`pb-1 tab-learning-plan text-lowercase ${state.activeLearningPlan===defaultLang.lang.inProgress && `tab-learning-plan-active`}`}
                            onClick={()=>setState({...state,activeLearningPlan:defaultLang.lang.inProgress})}
                        >
                            {/* <span><i className="fa fa-circle circle-notif" aria-hidden="true"></i></span>&nbsp; */}
                            {defaultLang.lang.inProgress}<span>&nbsp;</span>
                        </div>
                        <div className="pe-2 ps-2">&nbsp;</div>
                        <div 
                            className={`pb-1 tab-learning-plan text-lowercase ${state.activeLearningPlan===defaultLang.lang.done && `tab-learning-plan-active`}`}
                            onClick={()=>setState({...state,activeLearningPlan:defaultLang.lang.done})}
                        >{defaultLang.lang.done}</div>
                    </div>
                    
                    <div>
                        {isMobile? null :renderButton()}
                        {renderCardLearningPlan()}
                    </div>
                </li>
            </ul>
        )
    }

    const renderCalendar = ()=>{
        return(
            <div className="d-flex flex-column flex-wrap">
                 {calendar()}
                 {calendarEvent()}
            </div>
        )
    }

    const renderContent = () =>{
        switch (state.activeTab) {
            case 'profile':
                return(
                    <>
                        <LoadingData loading={state.loadingDataLearningPlan} type={`popup`}/>
                        <div className="pe-5 ps-5 pt-4 me-1 ms-1" style={cssTarget(state.loadingDataLearningPlan)}>
                            {renderProfile()}
                        </div>
                    </>
                )
            case 'calendar':
                return(
                    renderCalendar()
                )
            default:
                return(
                    <>
                        <LoadingData loading={state.loadingDataLearningPlan} type={`popup`}/>
                        <div className="pe-5 ps-5 pt-4 me-1 ms-1" style={cssTarget(state.loadingDataLearningPlan)}>
                            {renderProfile()}
                        </div>
                    </>
                )
        }
    }

    return(
        <Offcanvas show={show} onHide={handleClose} {...props} backdropClassName='modal-backdrop'>
            <svg style={{ height: 0,width:0 }}>
                <defs>
                <linearGradient id={'linearGradientId'} gradientTransform={"rotate(50)"}>
                    <stop offset="0%" stopColor={'#3a8ff2'} />
                    <stop offset="100%" stopColor={'#787ae0'} />
                </linearGradient>
                </defs>
            </svg>
            <Offcanvas.Header className="pt-4 pb-0 pe-0 ps-0 me-0 ms-0 d-block">
                <div className="d-flex flex-column">
                    <div className="d-flex flex-row flex-wrap align-items-center pe-5 ps-5 pb-5">
                        <div className="profile-offcanvas pe-1">
                            <Image 
                            src={securityData.Security_UserProfilePicture()} title={securityData.Security_UserName()}
                            fluid={true}
                            thumbnail={true}
                            className="profile-photos"
                            />
                        </div>
                        <div className="title-offcanvas">
                            <div className="d-flex flex-column">
                                <div>
                                    <h3 className='m-0'>{defaultLang.lang.Hi}, {securityData.Security_UserNameSplit()[0]}!</h3>
                                </div>
                                <div className="subtitle-offcanvas" onClick={()=>window.location.href=routeAll.routesUser.profile.path}>
                                    {defaultLang.lang.openFullProfile}&nbsp;<i className="subtitle-offcanvas fa fa-angle-right" aria-hidden="true"></i>
                                </div>
                            </div>
                        </div>
                        <div className="ms-auto">
                            <CloseButton onClick={()=>handleClose()} />
                        </div>
                    </div>
                    <div className="d-flex flex-row flex-wrap justify-content-center tab">
                        <div 
                            className={`tab-link pb-1 
                                ${state.activeTab==='profile' && `tab-link-active`}
                            `}
                            onClick={()=>setState({...state,activeTab:'profile'})}
                        >{defaultLang.lang.profileSummary}</div>
                        <div className="pe-5 ps-5">&nbsp;</div>
                        <div                        
                            className={`tab-link pb-1 
                                ${state.activeTab==='calendar' && `tab-link-active`}
                            `}
                            onClick={()=>setState({...state,activeTab:'calendar'})}
                        ><span>
                            {notificationCircleCalendar()?
                                <i className="fa fa-circle circle-notif" aria-hidden="true"></i>
                            :
                                null
                            }
                            
                        </span>&nbsp;{defaultLang.lang.calendar}</div>
                    </div>
                    <hr className="hr-tab"/>
                </div>
            </Offcanvas.Header>
        <Offcanvas.Body className={`p-0 ${state.activeTab==='calendar' && `calendar-sidebar-view`}`}>
                {renderContent()}
            </Offcanvas.Body>
        </Offcanvas>
    )
}