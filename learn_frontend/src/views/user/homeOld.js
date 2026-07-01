import React, { useEffect, useState, useContext, useRef} from 'react';
import { securityData, env } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import defaultLang from '../../helpers/lang';
// import { cssTarget, LoadingData } from '../../components/Loading';
// import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import Slider from "react-slick";
// import HomeSubscribe from './home_subscribe';
import GlobalState from '../../helpers/globalState';
import Fade from 'react-reveal/Fade';
import '../../assets/css/homepage.css';

import HomeSlider from './shared/homeSlider';
import routeAll from '../../helpers/route';

function home(){
    
    const history = useHistory()
    const [global, setGlobal] = useContext(GlobalState)

    const [sliders, setSliders] = useState([]) 

    const file_path = env.userDocument
    const file_assets= env.assets
    const [discoverUrl, setDiscoverUrl] = useState("")
    // eslint-disable-next-line
    const [state, setState] = useState({
        layoutSectionList:[],
        layoutMenuList:[],
        layoutCategoryList: [],
        modalProp:{
            modalShow:false,
            id:null,
        },
        flagShowArticle: false,
    })

    const bannerUrl = file_assets + "img/homepage_banner.jpg"

    const sffSection = file_assets + "img/SFF_section_bg.jpg"

    // const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // eslint-disable-next-line
    const [classSubscribe, setClassSubscribe] = useState("")

    const [readPreferredTopic,setReadPreferredTopic] = useState([])

    const [topPicks, setTopPicks] = useState([])
    const [contentForYou, setContentForYou] = useState([])
    const [sffPinnedContent, setSffPinnedContent] = useState([])
    const [challengeCard, setChallengeCard] = useState([])

    const sliderHome = useRef()

    const afterChange = (index) => {
        setDiscoverUrl(sliders.length>0?sliders[index].hyperlink_url:[]);
    };

    const settingsSlider = {
        className:'slider-class',
        autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        arrows:false,
        dots: true,
        infinite: true,
        afterChange: afterChange,

        responsive: [
            {
            breakpoint: 768,
            settings: {
                arrows: true,
                slidesToShow: 1
            }
            },
            {
            breakpoint: 480,
            settings: {
                arrows: false,
                slidesToShow: 1
            }
            }
        ]
    }

    const getReadPreferredTopic =  async ()=>{
        // setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/readPreferredTopic',credentials);
        if(isi.status == 200){
            setReadPreferredTopic(isi.data.data);
            // setLoading(false)
        }
    }

    useEffect(() => {
        if(securityData.Security_getPlatformId()){
            getSubscribe()
            //function jgn digabung
            
            // getReadPreferredTopic()
            // getLayoutComboList()
            // getListArticleByMenuId()
            //end
            
            //ini kalo bisa digabung
            loadAllData()
            //end    
        }
        
    }, [])

    const [ads, setAds] = useState([])
    const [total, setTotal] = useState(null)

    const getAds = async () => {
        const credentials = {
            platform_id:securityData.Security_getPlatformId(),
        };
        let isi = await axiosLibrary.postData('awbHome/GetAds',credentials);
        setAds(isi.data.data[0])
    }

    const getUserAds = async () => {
        if (ads.id != undefined){
            const credentials = {
                platform_id : securityData.Security_getPlatformId(),
                user_id : securityData.Security_UserId(),
                id_ads : ads.id,
                category : "COUNT"
            };

            let isi = await axiosLibrary.postData('awbHome/GetUserAds',credentials);
            setTotal(isi.data.data)
        }
    }

    useEffect(()=>{
        if (ads != undefined){
            getUserAds()
        }
    }, [ads])

    useEffect(()=>{
        if (total != null && ads != undefined){
            if (total < ads.frequency){
                setGlobal(state=>({...state,modalProp:{modalShow:true, type:'popupAds', adsData: ads, totalAds: total}}))
            }
        }
    }, [total])

    const loadAllData = () =>{
        
        const load_all_data = [
            getChallengeCard(),
            getReadPreferredTopic(),
            getHomeSlider(),
            getTopPicks(),
            getContentForYou(),
            getSffPinnedContent(),
            // setLoading(false)
        ]

        Promise.allSettled(
            load_all_data
        ).then(()=>{
            setGlobal(global=>({...global, loading:false}))
                // sliderHome.current.slickPlay()
            } 
        )
    }

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            if(global.modalProp.loadContent){
                // setLoading(true)
                loadAllData()
            }
        }
    },[global.modalProp])

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getAds()
        }
    },[securityData.Security_getPlatformId()])

    const getSubscribe = () =>{
        securityData.Security_UserIsSubscribe() ? 
        setClassSubscribe("section-bg-subscribed")
            :
        setClassSubscribe("section-bg-subscription")
    }

    const getHomeSlider =  async () => {
        // setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbHome/HomeSlider',credentials);
        setSliders(isi.data.data)
        setDiscoverUrl(isi.data.data[0].hyperlink_url)
    }

    const getTopPicks =  async () => {
        // setLoading(true)
        const credentials = {
            flag_active: 1,
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbHome/TopPicksContent',credentials);
        setTopPicks(isi.data.data)
    }

    const getSffPinnedContent =  async () => {
        // setLoading(true)
        const credentials = {
            flag_active: 1,
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbHome/SFFPinnedContent',credentials);
        setSffPinnedContent(isi.data.data)
    }

    const getContentForYou =  async () => {
        // setLoading(true)
        const credentials = {
            flag_active: 1,
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbHome/listArticleContentForYouV2',credentials);
        setContentForYou(isi.data.data)
    }

    const getChallengeCard =  async () => {
        // setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id,
            menu_id: null,
            sortBy: null,
            filter_search: null,
            category4: JSON.stringify([]),
            lang: securityData.Security_lang(),
            contentTypeID: 6
        };

        let isi = await axiosLibrary.postData('awbHome/ListArticleByMenuId',credentials);
        setChallengeCard(isi.data.data)
    }

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            if (readPreferredTopic.length < 3){
                setGlobal(state=>({...state,modalProp:{modalShow:true, type:'preferredTopic'}}))
            }    
        }
    }, [readPreferredTopic])

    useEffect(()=>{
        if(state.modalProp){
            const modalProp = state.modalProp
            setGlobal(global => ({...global,  modalProp}))
        }
    },[state.modalProp])

    const goToMovementPage=async(param)=>{
        const sectionId = param;
        history.push({
            pathname: routeAll.routesUser.movement.path,
            search: "?" + new URLSearchParams({section: sectionId}).toString()
        })
    }

    const goToLearningPage=async()=>{
        window.location.href = routeAll.routesUser.learningPage.path + "?type=create&user="+securityData.Security_UserAccount()
        // history.push({
        //     pathname: routeAll.routesUser.learningPage.path,
        //     // search: "?" + new URLSearchParams({section: sectionId}).toString()
        // })
    }

    const cekDataAvailable = (data)=>{
        let result = <div className='no-data-available'>{defaultLang.lang.general_no_data_available}</div>
        if(data.content.length > 0){
            result = <HomeSlider content={data.content} typeSlider={data.typeSlider} thisStateGlobal={global}/>
        }
        return(
            result
        )
    }

    return(
        <div>
            <section className="banner-section p-0 full_screen">
                {/* <div className="jumbotron"> */}
                <div className="banner-image" style={{backgroundImage:"linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url('" + bannerUrl +"')"}} >
                    <div className="banner-text cursor-pointer" onClick={()=>( window.location.href = routeAll.routesUser.movement.path)}>
                        <h1 className="" dangerouslySetInnerHTML={{__html:defaultLang.lang.homeBannerText}}>
                        </h1>
                    </div>
                </div>
                {/* </div> */}

                <section  id="tile-menu" className="p-0 tile-menu">
                    <div className="row m-0">
                        <div id="ways-of-learning" className="col-sm-6 cursor-pointer" onClick={goToMovementPage.bind(this,'learn_ways')}>
                            <div className="tile-1">
                                <h2 dangerouslySetInnerHTML={{__html:defaultLang.lang.wayOfLearningText}}>
                                </h2>
                            </div>
                            
                        </div>
                        <div id="core-competencies" className="col-sm-6 cursor-pointer" onClick={goToMovementPage.bind(this,'competency_management')}>
                            <div className="tile-1">
                                <h2 dangerouslySetInnerHTML={{__html:defaultLang.lang.criticalCompetenciesText}}>
                                </h2>
                            </div>
                        </div>
                    </div>
                </section>

            </section>

            <section  id="tile-menu-2" className="p-0 tile-menu">
                <div className="row m-0">
                    <div id="learning-plan" className="col-sm-12 cursor-pointer" onClick={goToLearningPage.bind(this)}>
                        <div className="tile-2 d-flex flex-row align-items-center justify-content-center">
                            <div>
                                <h2 className="mb-0" dangerouslySetInnerHTML={{__html:defaultLang.lang.planLearningText}}></h2>
                            </div>
                            <div>
                                <button type="button" className="btn-circle" id="learn-plan-btn">
                                    <i className="fa fa-angle-right"></i>
                                </button>
                            </div>
                        </div>  
                    </div>
                </div>
            
            </section>   

            <section  id="slider-section" className="p-0">
                <div className="row m-0">
                    <div id="stay-in-the-know" className="col-sm-4">
                        <div className="tile-3">
                            <div id="title-in-the-know">
                                <h2 dangerouslySetInnerHTML={{__html:defaultLang.lang.stayInTheKnowText}}>
                                </h2>
                                
                            </div>
                            <hr className="h-line-separator"/>
                            <div id="subtitle-in-the-know">
                                
                                <span dangerouslySetInnerHTML={{__html:defaultLang.lang.latestUpdateText}}></span>
                            </div>
                            
                        </div>
                        
                    </div>
                    <div id="slider-div" className="col-sm-8 p-0">
                        <div className="tile-1">
                            <div id="awbSlider-v2" className="banner_content_wrap">
                                <Slider {...settingsSlider} ref={sliderHome}>
                                {
                                    sliders.map(
                                        (slider, index) =>
                                        slider.file_type==='mp4' ?
                                            <div key={index} id="sliderContent" className="background_bg overlay_bg">
                                                <div className="slider-item">
                                                    <div className="banner_slide_content">
                                                        <div className="container subscribe">
                                                            <div className="row">
                                                                <div className="col-lg-12 col-md-12 col-sm-12 text-left">
                                                                    <div className="banner_content text_white">
                                                                        <h2 className="animation test-animation-up fadeInDown" data-animation="fadeInDown" data-animation-delay="1s"
                                                                        dangerouslySetInnerHTML={{ __html:securityData.Security_lang() == "ENG" ? slider.headline : slider.headline_ind}}
                                                                        > 
                                                                        </h2>
                                                                        <p className="animation my-4 test-animation-down fadeInUp" data-animation="fadeInUp" data-animation-delay="1.5s"
                                                                        dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? slider.short_description : slider.short_description_ind  }}
                                                                        > 
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="video_wrap">
                                                        
                                                        <video className="video-center"  style={{height:"100%", width: "100%"}} 
                                                        loop={true} autoPlay={true} muted={true} poster={`${env.assets}img/video_poster.jpg`}
                                                        >
                                                            <source src={file_path+'slider/'+slider.slider_video} type="video/mp4" />
                                                            
                                                        </video>
                                                    </div>
                                                        
                                                </div>
                                            </div>
                                        :                 
                                        <div className="background_bg" key={index} style={{cursor:"pointer"}} >
                                            <div className="slider-item"
                                                style={{background: "url('"+file_path+"slider/"+slider.slider_video+"')", backgroundSize: "cover"}}
                                            >
                                                <div className="row m-0">
                                                    <div className="col-lg-12 col-md-12 col-sm-12 text-left">
                                                        
                                                        <div className="slider-content text_white">
                                                            <Fade opposite={true}>
                                                                <h2 className="animation fadeInDown" data-animation="fadeInDown" data-animation-delay="1s"
                                                                dangerouslySetInnerHTML={{ __html:securityData.Security_lang() == "ENG" ? slider.headline : slider.headline_ind }}
                                                                > 
                                                                </h2>
                                                            </Fade>
                                                            <Fade opposite={true}>
                                                                <p className="animation my-4 fadeInUp" data-animation="fadeInUp" data-animation-delay="1.5s"
                                                                dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? slider.short_description : slider.short_description_ind  }}
                                                                > 
                                                                </p>
                                                            </Fade>
                                                        </div>
                                                        
                                                    </div>
                                                </div>
                                            </div>

                                        </div>                                     
                                    )   
                                }
                               
                                </Slider>
                                <div className="slider-nav-bottom">
                                    <div className="slider-discover-link">
                                        
                                        <span>Discover</span>
                                        <a href={discoverUrl} target="_blank" rel="noreferrer">
                                            <button type="button" className="btn-circle cursor-pointer slider-discover-btn">
                                                <i className="fa fa-angle-right"></i>
                                            </button>
                                        </a>
                                            
                                    </div>                           
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </section>    

            <section id='carousel-slider' className='p-0 m-0'>
                <div className='row m-0'>
                    <div id='top-picks' className='col-sm-12'>
                        <div className='col-sm-12 home-slider'>
                            <span id='top-picks-title' className='font-black home-slider-title text-lowercase'><b>{defaultLang.lang.topPicks} &gt;</b></span>
                            {cekDataAvailable({content:topPicks,typeSlider:"topPicks"})}
                        </div>
                    </div>
                </div>
            
                <div className='row m-0'>
                    <div id='preferred-topics' className='col-sm-12'>
                        <div className='col-sm-12 home-slider'>
                            <span id='preferred-topic-title' className='font-black home-slider-title text-lowercase'><b>{defaultLang.lang.prefferedTopic} &gt;</b></span>
                            {cekDataAvailable({content:contentForYou,typeSlider:"contentForYou"})}
                        </div>
                    </div>
                </div>

                <div className='row m-0'>
                    <div id='challenge-card' className='col-sm-12'>
                        <div className='col-sm-12 home-slider'>
                            <span id='challenge-card-title' className='font-black home-slider-title text-lowercase'><b>{defaultLang.lang.challengeCard} &gt;</b></span>
                            {cekDataAvailable({content:challengeCard,typeSlider:"challengeCard"})}
                        </div>
                    </div>
                </div>
            </section>   

            <section id='sff-carousel-slider' className='p-0 m-0' >
                <div className='row m-0 banner-image' style={{backgroundImage:"linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url('" + sffSection +"')"}}>
                    <div id='sff-slider' className='col-sm-12'>
                        <div className='col-sm-12 home-slider'>
                            <div className='d-flex flex-row align-items-center'>
                                <div id='sff-content-title' className='font-white home-slider-title'><b>{defaultLang.lang.skillsForFuture} &gt;</b>
                                </div>
                                <div className='ml-auto'>
                                    <a className="see-all-button" href={routeAll.routesUser.viewcourse.path}>{defaultLang.lang.seeAll}</a>
                                </div>
                            </div>
                            {cekDataAvailable({content:sffPinnedContent,typeSlider:"sff"})}
                        </div>
                    </div>
                </div>
            </section>            
        </div>

    )
}

export default home;