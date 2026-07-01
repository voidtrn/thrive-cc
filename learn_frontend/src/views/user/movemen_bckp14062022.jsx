import React, { useCallback, useEffect, useRef, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import defaultLang from '../../helpers/lang';
import routeAll from '../../helpers/route';
import * as am4core from "@amcharts/amcharts4/core";
// import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected";
import am4themes_animated from "@amcharts/amcharts4/themes/animated"; 
import { Overlay,  Popover } from 'react-bootstrap';
import Slider from "react-slick";

import "../../assets/css/movement.css";
import { isMobile } from 'react-device-detect';

am4core.useTheme(am4themes_animated);

function Movement(props){

    const bannerUrl = env.assets + "img/homepage_banner.jpg"

    let learnHelpText = React.useRef(null)
    let firstSlide = React.useRef(null)

    const [learnSupportList,setLearnSupportList] = useState([])

    const platform_id = securityData.Security_getPlatformId()

    const [prevSliderTarget, setPrevSliderTarget] = useState(null)
    // let prevSliderTarget = null

    // const [slideToShow, setSlideToShow] = useState(4)

    const [activePlatform, setActivePlatform] = useState({
        aboutProgramme:'',
        participant:'',
        format:'',
        benefits:'',
        noRegistration:0,
        free:0,
        selfLearning:0,
        noPreWork:0,
        flagCount:0
    })

    const [activePlatformFlag1, setActivePlatformFlag1] = useState([])
    const [activePlatformFlag2, setActivePlatformFlag2] = useState([])

    const fillActivePlatform = (learnSupportItem) =>{

        let langActive = securityData.Security_lang()
        if(langActive == "ENG"){
            setActivePlatform({
                aboutProgramme: learnSupportItem.about_eng,
                participant:learnSupportItem.participant_eng,
                format:learnSupportItem.format_eng,
                benefits:learnSupportItem.benefits_eng,
                noRegistration:learnSupportItem.no_registration_flag,
                free:learnSupportItem.free_flag,
                selfLearning:learnSupportItem.self_learn_flag,
                noPreWork:learnSupportItem.no_pre_work_flag,
                flagCount:0,
                hyperlinkUrl:learnSupportItem.hyperlink_url,
            });
        }else{
            setActivePlatform({
                aboutProgramme: learnSupportItem.about_ind,
                participant:learnSupportItem.participant_ind,
                format:learnSupportItem.format_ind,
                benefits:learnSupportItem.benefits_ind,
                noRegistration:learnSupportItem.no_registration_flag,
                free:learnSupportItem.free_flag,
                selfLearning:learnSupportItem.self_learn_flag,
                noPreWork:learnSupportItem.no_pre_work_flag,
                flagCount:0,
                hyperlinkUrl:learnSupportItem.hyperlink_url,
            });
        }

        let arrayTemp=[]
        let arrayTemp2=[]
        if (learnSupportItem.no_registration_flag == 1){
            arrayTemp2 = ['noReg', (langActive === 'ENG'?learnSupportItem.registration_eng:learnSupportItem.registration_ind) , 'img/registrasi_icon.svg']
            arrayTemp.push(arrayTemp2)
        }
        if (learnSupportItem.free_flag == 1){
            arrayTemp2 = ['free', (langActive === 'ENG'?learnSupportItem.price_eng:learnSupportItem.price_ind),'img/biaya_icon.svg']
            arrayTemp.push(arrayTemp2)
        }
        if (learnSupportItem.self_learn_flag == 1){
            arrayTemp2 = ['selfLearn', (langActive === 'ENG'?learnSupportItem.duration_eng:learnSupportItem.duration_ind),'img/durasi_icon.svg']
            arrayTemp.push(arrayTemp2)
        }
        if (learnSupportItem.no_pre_work_flag == 1){
            arrayTemp2 = ['noPreWork', (langActive === 'ENG'?learnSupportItem.pre_work_eng:learnSupportItem.pre_work_ind),'img/pre-work_icon.svg']
            arrayTemp.push(arrayTemp2)
        }
        setActivePlatformFlag1(arrayTemp.slice(0,2))
        setActivePlatformFlag2(arrayTemp.slice(2,4))
        
    };

    const afterChange = (index) =>(event) => {
        // setDiscoverUrl(sliders[index].hyperlink_url);
        // alert(event.currentTarget.className)
        const addClassName = "card-overlay-active"
        event.currentTarget.classList.add(addClassName)
        
        if (prevSliderTarget != event.currentTarget){
            if(prevSliderTarget){
                prevSliderTarget.classList.remove(addClassName)
               
            }
       
            setPrevSliderTarget(event.currentTarget)
        }
        // alert(event.currentTarget.className)
        fillActivePlatform(learnSupportList[index])
        // alert(index)
    };

    const settings = {
        className:'movement-learn-support-slick',
        centerMode: false,
        infinite: false,
        autoplay: false,
        autoplaySpeed: 5000,
        focusOnSelect: true,
        // centerPadding: '38%',
        slidesToShow: 4,
        // slidesToScroll: 1,
        // nextArrow: <NextArrow />,
        // prevArrow:<PrevArrow />,
        arrows:true,
        // afterChange: afterChange,
        responsive: [
            {
            breakpoint: 768,
            settings: {
                arrows: true,
                // centerMode: true,
                // slidesToScroll: 1,
                slidesToShow: 1
            }
            },
            {
            breakpoint: 480,
            settings: {
                arrows: false,
                // centerMode: true,
                // slidesToScroll: 1,
                slidesToShow: 1
            }
            }
        ]
    }

    const getLearnSupport = useCallback(async () => {

        const credentials = {
            limit: 99999,
            offset:0,
            category:"",
            flag_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbLearningSupport/ListData',credentials);
        setLearnSupportList(isi.data.data)
        fillActivePlatform(isi.data.data[0])
        // if (isi.data.data.length>4){
        //     setSlideToShow(4)
        // }else{
        //     // setSlideToShow(4)
        //     setSlideToShow(isi.data.data.length)

        // }
        
    })

    
    const [dataChart, setDataChart]=useState([])

    const getCompetencyManagementData = useCallback(async () => {

        const credentials = {
            platform_id:platform_id,
            lang:securityData.Security_lang()
        };

        let isi = await axiosLibrary.postData('awbMovement/CompetencyManagementData',credentials);
        setDataChart(isi.data.data)
        
    })


    // const [state, setState] = useState({
    //     lang:securityData.Security_lang(),
    // })
    
    // const changeLang = (value) =>{
    //     let dataUser = axiosLibrary.getUserInfo()
    //     const langCurrent = {
    //         lang: value
    //     }
    //     dataUser = {...dataUser,...langCurrent};
    //     localStorage.setItem('userinfo',JSON.stringify(dataUser));
    //     setState(state=>({...state, ...langCurrent}))
    //     window.location.reload();
    // }

    useEffect(()=>{
        getLearnSupport();
        getCompetencyManagementData();
        // drawChart();
        props.loading(false)
    },[platform_id])

    useEffect(()=>{
        
        drawChart();
        
    },[dataChart])

    const [showHelpText, setShowHelpText] = useState(false)
    const [learnCollapse, setLearnCollapse] = useState(true)

    const [collapsed, setCollapsed] = useState(true)
    // const [networkSeriesState, setNetworkSeriesState] = useState(null)

    const drawChart= ()=> {
        
        setCollapsed(true)

        var chart = am4core.create(
            "chartdiv",
            am4plugins_forceDirected.ForceDirectedTree
        );
        var networkSeries = chart.series.push(
            new am4plugins_forceDirected.ForceDirectedSeries()
        );

        networkSeries.dataFields.linkWith = "linkWith";
        networkSeries.dataFields.color = "color";
        networkSeries.dataFields.collapsed = "collapsed";
        networkSeries.dataFields.name = "name";
        networkSeries.dataFields.id = "name";
        networkSeries.dataFields.value = "value";
        networkSeries.dataFields.children = "children";
        networkSeries.dataFields.fontSize = "fontSize";
        networkSeries.maxLevels = 1;

        networkSeries.data = dataChart;

        //   networkSeries.dataFields.fixed = "fixed";
      
        // chart.zoomable = true;
        // chart.mouseWheelBehavior = "none";
      
        networkSeries.nodes.template.label.text = "{name}";
        //   networkSeries.nodes.template.label.fontSize = "1rem";
        networkSeries.fontSize = "0.8rem";
        networkSeries.dragable = false;
        networkSeries.inert = false;
        //   networkSeries.linkWithStrength = 0;
        networkSeries.manyBodyStrength = -20;
        //   networkSeries.links.template.distance = 1;
        //   networkSeries.links.template.strength = 1;
        networkSeries.nodes.template.expandAll = false;
        networkSeries.maxRadius = am4core.percent(8);
      
          // Close other nodes when one is opened
        networkSeries.nodes.template.events.on("hit", function(ev) {
            var targetNode = ev.target;
            if (targetNode.isActive) {
                networkSeries.nodes.each(function(node) {
                    if (targetNode !== node && node.isActive && targetNode.dataItem.level == node.dataItem.level) {
                    node.isActive = false;
                    }
                });
            }

            setCollapsed(true)
            networkSeries.nodes.each(function(node) {
                if (node.isActive) {
                    setCollapsed(false)
                }
            });
            
            chart.zoomToDataItem(targetNode.dataItem, 1, true)
        });

        // networkSeries.nodes.template.events.on('ready', function(event) {
        //     var fontSize = Math.max(14, Math.min(15, Math.ceil(event.target.measuredWidth * .5)));
        //     console.log(event.target.dataItem.dataContext.name, ' width: ', event.target.measuredWidth, '; fontSize: ', fontSize);
        //     event.target.fontSize = fontSize;
        // });

        var nodeTemplate = networkSeries.nodes.template;
        nodeTemplate.tooltipText = "{name}";
        nodeTemplate.fillOpacity = 1;
        nodeTemplate.label.hideOversized = false;
        nodeTemplate.label.truncate = false;
        nodeTemplate.label.wrap = true;
        //   nodeTemplate.label.textAlign = "start";
        nodeTemplate.label.marginLeft = am4core.percent(5);
      
        var linkTemplate = networkSeries.links.template;
        //   linkTemplate.strokeWidth = 1;
        var linkHoverState = linkTemplate.states.create("hover");
        linkHoverState.properties.strokeOpacity = 1;
        linkHoverState.properties.strokeWidth = 2;
      
        nodeTemplate.events.on("over", function(event) {
            var dataItem = event.target.dataItem;
            dataItem.childLinks.each(function(link) {
                link.isHover = true;
            });
        });
      
        nodeTemplate.events.on("out", function(event) {
            var dataItem = event.target.dataItem;
            dataItem.childLinks.each(function(link) {
              link.isHover = false;
            });
        });
        
        // setNetworkSeriesState(networkSeries);
    }

    const CloseAllcircle = () => {
        // networkSeriesState.nodes.each(function(node) {
        //     if (node.isActive) {
        //         node.isActive = false;
        //     }
        // });
        drawChart()
    }

    let compManagementRef = useRef()
    let hmsLearnRef = useRef()

    useEffect(() => {
        let section = new URLSearchParams(props.location.search).get('section')
        if(section == 'competency_management'){
            window.scrollTo({ behavior: 'smooth', top: compManagementRef.current.offsetTop })
        }

        if(section == 'learn_ways'){
            window.scrollTo({ behavior: 'smooth', top: hmsLearnRef.current.offsetTop })
        }

    },[props.location.search])

    const goToLearningPage=async()=>{
        window.location.href = routeAll.routesUser.learningPage.path + "?type=create&user="+securityData.Security_UserAccount()
        // history.push({
        //     pathname: routeAll.routesUser.learningPage.path,
        //     // search: "?" + new URLSearchParams({section: sectionId}).toString()
        // })
    }

    // movement learning
    const [movementLearning, setMovementLearning] = useState(2);
    const [tempMovementLearning, setTempmovementLearning] = useState(2);
    const [loadImage, setLoadImage] = useState(false);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if(loadImage){
            setCurrentOpacity()
        }
    },[loadImage])

    const changeMovementLearning = (idx) =>{
        setLoadImage(false)
        if(idx!=movementLearning){
            setOpacity(0)
        }
        //for leftbar
        setTempmovementLearning(idx)
        //for rightbar
        let timer = setTimeout(()=>setMovementLearning(idx),1000)
        return () => {
            clearTimeout(timer)
        }
    }

    const setCurrentOpacity = ()=>{
        let timer = setTimeout(()=>setOpacity(1),500)
        return () => {
            clearTimeout(timer)
        }
    }

    const dataLearning = [
        {data:'70%',desc_leftbar:defaultLang.lang.movement70Percent, title_rightbar:defaultLang.lang.movement70PercentRightBar, image_desktop:'img/70.png',image_mobile1:'img/70.1.png',image_mobile2:'img/70.2.png', status:false},
        {data:'20%',desc_leftbar:defaultLang.lang.movement20Percent, title_rightbar:defaultLang.lang.movement20PercentRightBar, image_desktop:'img/20.png',image_mobile1:'img/20.1.png',image_mobile2:'img/20.2.png',status:false},
        {data:'10%',desc_leftbar:defaultLang.lang.movement10Percent, title_rightbar:defaultLang.lang.movement10PercentRightBar, image_desktop:'img/10.png',image_mobile1:'img/10.1.png',image_mobile2:'img/10.2.png',status:false}
    ]
    // end movement learning

    const downloadFullDetailsPage = ()=>{
        window.open("https://pmi.fuseuniversal.com/communities/22099/contents/1489723",'_blank')
    }

    return(
    <div className="movement-page-section">
        <section className="banner-section p-0">
            {/* <div className="jumbotron"> */}
            <div className="banner-image" style={{backgroundImage:"linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url('" + bannerUrl +"')"}} >
                <div className="banner-text">
                    <h1 className="text-black" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementBannerText}}>
                    </h1>
                </div>
            </div>
        </section>
        <section  id="movement-subtitle-section" className="p-0">
            <div className="row m-0">
                <div id="movement-subtitle" className="col-sm-12">
                    <div >
                        <div className=" text-center">
                            <span id="movement-subtitle-text" className="text-white" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementBannerSubText}}>
                            </span>
                        </div>
                    </div>  
                </div>
            </div>
        </section> 
        <section  id="movement-parties-section" className="p-0">
            <div className="row m-0">
                <div id="movement-parties-1" className="col-sm-4">
                    <div className='movement-parties-container-1'>
                        <div id="mov-parties-sub-div" className=" text-start">
                            <h5 id="movement-parties-subtitle-text" className="text-white" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementPartiesSubTitle}}>
                            </h5>
                        </div> 
                        <div id="mov-parties-title-div" className="text-start">
                            <h1 id="movement-parties-title-text" className="text-white" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementPartiesTitle}}>
                            </h1>
                        </div> 
                    </div>
                </div>
                <div id="movement-parties-2" className="col-sm-8">
                    <div className='movement-parties-container-2'>
                        <div className=" text-center card-container row">
                            <div className='col-sm-4 mov-parties-card'>
                                <div className='card h-100 movement-parties' >
                                    <div className='card-body'>
                                        <h2 className='card-title slider-content-title'>{defaultLang.lang.movementPartiesEmpTitle}</h2>
                                        <p className='card-text slider-content-description'>{defaultLang.lang.movementPartiesEmpContent}</p>
                                    </div>      
                                </div>
                            </div>
                            
                            <div className='col-sm-4 mov-parties-card'>
                                <div className='card h-100 movement-parties' >
                                    <div className='card-body'>
                                        <h2 className='card-title slider-content-title'>{defaultLang.lang.movementPartiesPMTitle}</h2>
                                        <p className='card-text slider-content-description'>{defaultLang.lang.movementPartiesPMContent}</p>
                                    </div>      
                                </div>
                            </div>

                            <div className='col-sm-4 mov-parties-card'>
                                <div className='card h-100 movement-parties' >
                                    <div className='card-body'>
                                        <h2 className='card-title slider-content-title'>{defaultLang.lang.movementPartiesPnCTitle}</h2>
                                        <p className='card-text slider-content-description'>{defaultLang.lang.movementPartiesPnCContent}</p>
                                    </div>      
                                </div>
                            </div>
                        </div> 
                    </div>
                </div>
            </div>
        </section> 
        <section  ref={hmsLearnRef} id="movement-learning-section" className="p-0">
            <div id="movement-learning-header-row" className="row m-0">
                <div id="movement-learning-header" className="col-sm-12">
                    <div >
                        <div className=" text-center">
                            <span id="movement-learning-head-text" className="text-white" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnHeaderText}}>
                            </span>
                            &nbsp;
                            {/* <i style={{color:'blue'}} className="fa fa-info-circle"></i> */}
                            <img className='cursor-pointer' ref={learnHelpText} style={{height:'1.1rem',marginBottom:'5px', cursor:'pointer'}} 
                                onClick={() => setShowHelpText(!showHelpText)} src={env.assets+'img/info-circle-solid-white.svg'} />
                            <Overlay placement="right"
                                show={showHelpText}
                                target={learnHelpText.current}
                                rootClose
                                onHide={() => setShowHelpText(false)}
                                >
                                <Popover id="popover-help-text">
                                    <Popover.Content>
                                            <div id="learn-help-text">
                                                <div id="learn-help-text-title">
                                                    <span className='font-weight-bold' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnHelpTextTitle}}>
                                                    </span>
                                                </div>
                                                <div id="learn-help-text-content">
                                                    <p className='m-0' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnHelpTextContent}}>
                                                    </p>
                                                </div>
                                            </div>
                                    </Popover.Content>
                                </Popover>
                            </Overlay> 
                        </div>
                        <div className=" text-center">
                           <span id="movement-learning-head-portion" className="text-white" >
                                70&nbsp; 
                                <span className="learning-portion-sep">:</span>&nbsp;
                                20&nbsp;
                                <span className="learning-portion-sep">:</span>&nbsp;
                                10
                            </span>
                        </div>
                    </div>  
                </div>
            </div>
            <div id="movement-learning-collapse-row" className="row m-0">
                <div id="movement-learning-collapse" className="col-md-12">
                    <div>
                        <div id="movement-learning-collapse-cont" className=" text-center">
                            <span  className="text-white" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnCollapsibleText}}>
                            </span>&nbsp;
                            <button id="movement-learning-collapse-btn" type="button" className="rounded-circle border-0 cursor-pointer" 
                                data-toggle="collapse" data-target="#learning-collapse-area" aria-expanded="false" aria-controls="learning-collapse-area"
                                onClick={()=>setLearnCollapse(!learnCollapse)}>
                                {learnCollapse?
                                    <i className="fa fa-angle-down"></i>
                                :
                                    <i className="fa fa-angle-up"></i>
                                }
                                
                            </button>
                        </div>
                    </div>
                </div>

                <div id="learning-collapse-area" className="col-md-12 collapse" >
                    <div className="row p-5">
                        <div className="pe-4 movement-learn-master-leftbar col-sm-3">
                            {dataLearning.map((v,idx)=>
                                <div key={idx} className={`movement-learning-leftbar ${idx===tempMovementLearning && `movement-learning-leftbar-active`} pe-4 ps-4 pt-3 pb-3 m-2`} onClick={()=>changeMovementLearning(idx)} onMouseEnter={()=>changeMovementLearning(idx)}>
                                    <div className="d-flex flex-row align-items-center">
                                        <div>{v.data}</div>
                                        {idx===tempMovementLearning?
                                        <div className="ps-3 span-desc-move">
                                            <div dangerouslySetInnerHTML={{__html: v.desc_leftbar}}/>
                                        </div>
                                        :
                                        null
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="ps-4 movement-learning-rightbar col-sm-9 pt-3">
                            {dataLearning.filter((_,idx)=>idx===movementLearning).map((v,idx)=>
                                <div className={`d-flex flex-column`} key={idx}>
                                    <div className="pt-2 movement-learn-title-rightbar" style={{opacity:opacity}}><div dangerouslySetInnerHTML={{__html: v.title_rightbar}}/></div>
                                    {isMobile?
                                    <>
                                        <img className={`img-movement-learn-master`} src={env.assets + v.image_mobile1} alt={v.title_rightbar} style={{opacity:opacity}} onLoad={()=>setLoadImage(true)}/>
                                        <img className={`img-movement-learn-master`} src={env.assets + v.image_mobile2} alt={v.title_rightbar} style={{opacity:opacity}} onLoad={()=>setLoadImage(true)}/>
                                    </>
                                    :
                                        <img className={`img-movement-learn-master img-movement-learning-${movementLearning}`} src={env.assets + v.image_desktop} alt={v.title_rightbar} style={{opacity:opacity}} onLoad={()=>setLoadImage(true)}/>

                                    }
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
    
        </section> 
        <section id="movement-support-learn" className="p-0">
            <div id="movement-support-learn-row-1" className="row m-0">
                <div className="col-md-12 p-0">
                    <div className=" row m-0">
                        <div id="support-learn-title" className='col-md-2 pe-5 ps-5'>
                            <span className='text-color-purple' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnSupportSubText}}>
                            </span>
                            <h1 className="text-white" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnSupportTitleText}}>
                            </h1>
                        </div>
                        <div id="support-learn-slider" className='col-md-10 pe-0'>
                            <Slider {...settings}>
                                {
                                learnSupportList.map(
                                    (supportItem, index) =>
                                    <div key={index}>
                                        <div className='slider-container'>
                                            <div className='card support-learn-card' onClick={(e)=>afterChange(index)(e)} onLoad={index==0?(e)=>afterChange(index)(e):()=>{}}>
                                                <div className="overlay" ref={index == 0?firstSlide:null}>
                                                </div>
                                                <div className='card-body' style={{height:'100%'}}>
                                                    <img className='img-fluid h-100 mx-auto' src={env.userDocument+'learn_support/'+supportItem.logo_image} alt={supportItem.title} />
                                                </div>   
                                                                                                                              
                                            </div>
                                        </div>
                                    </div>
                                    )
                                }                                
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
            <div id="movement-support-learn-row-2" className="row m-0">
                <div className="col-md-12 p-0">
                    <div className=" row m-0 mb-5">
                        {activePlatform.hyperlinkUrl?
                            <div id="support-learn-button-access" className='col-md-2 pe-5 ps-5'>
                                <div className="p-3">
                                    <button id='access-now-btn' className='text-white' onClick={()=>window.open(activePlatform.hyperlinkUrl,'_blank')}>{defaultLang.lang.movementLearnSupportAccessBtnText}</button>
                                </div>
                            </div>
                        : 
                            <div className='col-md-2'></div>
                        }
                        
                        <div id="support-learn-explanation" className='col-md-10'>
                            <div className="row m-0 mb-5">
                                <div className="col-md-7 pt-3 pe-5">
                                    <div className='mb-3'>
                                        <span className='text-color-purple font-weight-bold' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnSupportAbout}}>
                                        </span>
                                    </div>
                                    <p className='text-white text-justify' dangerouslySetInnerHTML={{ __html: activePlatform.aboutProgramme }}>
                                    </p>
                                </div>
                                <div className="col-md-5 pt-3">
                                    <div className="row m-0">
                                        <div className="col-md-6 p-0 pe-5">
                                            <div className='mb-3'>
                                                <span className='text-color-purple font-weight-bold' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnSupportTarget}}>
                                                </span>
                                            </div>
                                            
                                            <p className='text-white' dangerouslySetInnerHTML={{ __html: activePlatform.participant }}>
                                            </p>
                                        </div>
                                        <div className="col-md-6 p-0 pe-5">
                                            <div className='mb-3'>
                                                <span className='text-color-purple font-weight-bold' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnSupportFormat}}>
                                                </span>
                                            </div>
                                            
                                            <p className='text-white' dangerouslySetInnerHTML={{ __html: activePlatform.format }}>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row m-0">
                                <div id="programe-benefits" className="col-md-7 pt-3 pe-5">
                                    <div className='mb-3'>
                                        <span className='text-color-purple font-weight-bold' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementLearnSupportBenefits}}>
                                        </span>
                                    </div>
                                    
                                    <p className='text-white' dangerouslySetInnerHTML={{ __html: activePlatform.benefits }}>
                                    </p>
                                </div>
                                <div className="col-md-5 pt-3">
                                    <div className="row m-0">
                                        {
                                        activePlatformFlag1.map(
                                            (loopData, i) =>
                                                <div className="col-md-6 p-0 pe-5" key={i}>
                                                    <img className="icon-platform-movement-support mb-2" src={env.assets + loopData[2]} alt={`icon-platform1-${i}`}/>
                                                    <p className='text-white' dangerouslySetInnerHTML={{ __html: loopData[1] }}>
                                                    </p>
                                                </div>                                          
                                            )
                                        }  
                                    </div>
                                    <div className="row m-0 pt-3">
                                        {
                                        activePlatformFlag2.map(
                                            (loopData, i) =>
                                                <div className="col-md-6 p-0 pe-5" key={i}>
                                                    <img className="icon-platform-movement-support mb-2" src={env.assets + loopData[2]} alt={`icon-platform1-${i}`}/>
                                                    <p className='text-white' dangerouslySetInnerHTML={{ __html: loopData[1] }}>
                                                    </p>
                                                </div>                                          
                                            )
                                        }  
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section ref={compManagementRef} id="movement-competency-management" className="p-0">
            <div id="movement-competency-management-row" className="row m-0 pt-5">
                <div className="col-md-12 p-0">
                    {/* <div id='comp-manage-title-row' className="row m-0 w-100">
                        <div className='col-md-12 p-0'>
                            <div className='row m-0'>
                                <div className='col-md-4 p-0'>
                                    <div id="comp-management-title" className='ps-5'>
                                        <div>
                                            <span className='text-color-purple' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementCompManageSubTitle}}>
                                            </span>
                                        </div>
                                        <div className=' pt-2'>
                                            <h1 className="text-black float-start me-4" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementCompManageTitle}}>
                                            </h1>
                                            <button id='dowload-comp-manage-btn' className='text-color-purple' onClick={()=>downloadFullDetailsPage()}>
                                                {defaultLang.lang.movementCompManageDownloadBtn}
                                            </button>
                                        </div>
                                        
                                    </div>
                                </div>
                                <div className='col-md-2 offset-md-5 p-0'>
                                    <div className='ps-5 pt-2'>
                                        {
                                            !collapsed?
                                            <button id='back-comp-manage-btn' className='text-color-purple' onClick={CloseAllcircle}>
                                                <div>
                                                <span className='text-color-purple' >
                                                    {defaultLang.lang.movementCompManageBackBtn}
                                                                                        
                                                </span> &nbsp;
                                                <i className="fa fa-angle-right"></i>
                                                </div>
                                                
                                            </button>
                                            : null
                                        }
                                        
                                    </div>  
                                </div>
                            </div>

                            
                        </div>
                        
                    </div> */}
                    <div id='comp-manage-title-row' className="d-flex flex-row m-0 ps-5">
                        <div id="comp-management-title" className='ps-5'>
                            <div>
                                <span className='text-color-purple' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementCompManageSubTitle}}>
                                </span>
                            </div>
                            <div className=' pt-2'>
                                <h1 className="text-black float-start me-4" dangerouslySetInnerHTML={{__html:defaultLang.lang.movementCompManageTitle}}>
                                </h1>
                                <button id='dowload-comp-manage-btn' className='text-color-purple' onClick={()=>downloadFullDetailsPage()}>
                                    {defaultLang.lang.movementCompManageDownloadBtn}
                                </button>
                            </div>
                            
                        </div>
                    </div>

                    <div className='ps-5 pt-2 comp-manage-back-button'>
                        {
                            !collapsed?
                            <button id='back-comp-manage-btn' className='text-color-purple' onClick={CloseAllcircle}>
                                <div>
                                <span className='text-color-purple' >
                                    {defaultLang.lang.movementCompManageBackBtn}
                                                                        
                                </span> &nbsp;
                                <i className="fa fa-angle-right"></i>
                                </div>
                                
                            </button>
                            : null
                        }
                    </div>

                    <div className='row m-0'>
                        {/* <div className='col-md-8'>

                        </div> */}
                        {/* <div className='col-md-4 p-0'> */}
                            <div className='ps-5 pt-2'>
                                {
                                    collapsed?
                                    <div id='comp-manage-help-text'>
                                        <span className='text-color-purple' dangerouslySetInnerHTML={{__html:defaultLang.lang.movementCompManageExploreBtn}}></span>
                                    </div>
                                : null
                                }
                            </div>
                        {/* </div> */}
                    </div>

                    <div className="row m-0">
                        <div id="chartdiv" style={{ width: "100%", height: "40rem" }} />
                    </div>

                    <div className='row m-0 w-100'>
                        <div className='col-md-12'>
                            <div className='ps-5 pt-2'>
                                {
                                    !collapsed?
                                    <div id='comp-manage-learn' className='text-center'>
                                        <button id='comp-manage-learn-btn' className='text-white' onClick={goToLearningPage.bind(this)}>
                                            {defaultLang.lang.movementCompManageLearnBtn}
                                        </button>
                                    </div>
                                : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </section>
    </div>
    )
}

export default Movement;