import React, { useEffect, useState, useContext, useRef } from 'react';
import { securityData, env } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import defaultLang from '../../helpers/lang';
import { cssTarget, LoadingData } from '../../components/Loading';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import Slider from "react-slick";
import HomeSubscribe from './home_subscribe';
import GlobalState from '../../helpers/globalState';
import Fade from 'react-reveal/Fade';

function PrevArrow(props){
    const { style, onClick, fromSource } = props;
    return (
            <i className='fa fa-3x fa-angle-left' 
            style={{
                ...fromSource!="slider"&&style, 
                fontSize:'30px',
                color:'#0e93d8', 
                background:'#fff', 
                width:'50px', 
                height:'50px',
                borderRadius:'50%',
                padding:'9px 17px',
                position:'absolute',
                top:fromSource==="slider"?'50%':'40%',
                left:fromSource==="slider"? '1%':'-2%',
                cursor: 'pointer',
                zIndex:'10'
            }} onClick={onClick}/>
    );
}

function NextArrow(props){
    const { style, onClick, fromSource } = props;
    return (
            <i className='fa fa-3x fa-angle-right' 
            style={{...fromSource!="slider"&&style, 
                fontSize:'30px',
                color:'#0e93d8', 
                background:'#fff', 
                width:'50px', 
                height:'50px',
                borderRadius:'50%',
                padding:'9px 20px',
                position:'absolute',
                top:fromSource==="slider"?'50%':'40%',
                right:fromSource==="slider"? '1%':'-2%',
                cursor: 'pointer'
            }} onClick={onClick}/>
    );
}

function home(){
    const history = useHistory()
    const [global, setGlobal] = useContext(GlobalState)

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
    
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()

    const file_path = env.userDocument
    const file_assets= env.assets

    const [sliders, setSliders] = useState([]) 

    const [ListArticleByMenuId, setListArticleByMenuId] = useState([])

    const [ListArticleWhatsHot, setListArticleWhatsHot] = useState([])
    const [ListArticleWhatsNew, setListArticleWhatsNew] = useState([])
    const [ListArticleContentForYou, setListArticleContentForYou] = useState([])

    const [ListArticleContentFromYourNetwork, setListArticleContentFromYourNetwork] = useState([])
    const [ListskillfuturebyMenuId, setListskillfuturebyMenuId ] = useState([])
    const [HomeEvent, setHomeEvent] = useState([])
    const [HomeOurOtherSources, setHomeOurOtherSources] = useState([])

    const [tabTrans, setTabTrans] = useState(null)
    const [tabTopic, setTabTopic] = useState(null)
    const [tabJourney, setTabJourney] = useState(null)
    const [tabFunction, setTabFunction] = useState(null)
    const [tabWhats, setTabWhats] = useState(null)
    
    const [tabName, setTabName] = useState("")
    const [infinite,setInfinite] = useState(true)

    const [classSubscribe, setClassSubscribe] = useState("")

    const [articleList, setArticleList] = useState(ListArticleContentForYou)
    const [readPreferredTopic,setReadPreferredTopic] = useState([])

    const sliderHome = useRef()

    const settings = {
        className:'your-class',
        centerMode: true,
        infinite: infinite,
        autoplay: false,
        autoplaySpeed: 5000,
        centerPadding: '38%',
        slidesToShow: 1,
        nextArrow: <NextArrow />,
        prevArrow:<PrevArrow />,
        arrows:true,
        responsive: [
            {
            breakpoint: 768,
            settings: {
                arrows: true,
                centerMode: true,
                slidesToShow: 1
            }
            },
            {
            breakpoint: 480,
            settings: {
                arrows: false,
                centerMode: true,
                slidesToShow: 1
            }
            }
        ]
    }

    const settings2 =  {
        className:'your-class',
        autoplay: false,
        infinite: infinite,
        autoplaySpeed: 5000,
        slidesToShow: 4,
        nextArrow: <NextArrow />,
        prevArrow:<PrevArrow />,
        arrows:true,
        responsive: [
            {
            breakpoint: 768,
            settings: {
                arrows: true,
                centerMode: true,
                slidesToShow: 1
            }
            },
            {
            breakpoint: 480,
            settings: {
                arrows: false,
                centerMode: true,
                slidesToShow: 1
            }
            }
        ] 
    }

    const settingsEvent = {
        className:'event-class',
        centerMode: true,
        autoplay: true,
        autoplaySpeed: 5000,
        centerPadding: '32%',
        slidesToShow: 1,
        nextArrow: <NextArrow />,
        prevArrow:<PrevArrow />,
        arrows:true,
        responsive: [
            {
            breakpoint: 768,
            settings: {
                arrows: true,
                centerMode: true,
                slidesToShow: 1
            }
            },
            {
            breakpoint: 480,
            settings: {
                arrows: false,
                centerMode: true,
                slidesToShow: 1
            }
            }
        ]
    }

    const settingsSlider = {
        className:'slider-class',
        // autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        nextArrow: <NextArrow fromSource="slider" />,
        prevArrow:<PrevArrow fromSource="slider" />,
        arrows:true,

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
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbProfile/readPreferredTopic',credentials);
        if(isi.status == 200){
            setReadPreferredTopic(isi.data.data);
            setLoading(false)
        }
    }

    const getSubscribe = () =>{
        securityData.Security_UserIsSubscribe() ? 
        setClassSubscribe("section-bg-subscribed")
            :
        setClassSubscribe("section-bg-subscription")
    }

    const getHomeSlider =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbHome/HomeSlider',credentials);
        setSliders(isi.data.data)
    }

    const getHomeEvent =  async () => {
        setLoading(true)
        setTabName("homeEvent")
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbHome/HomeEvent',credentials);
        setHomeEvent(isi.data.data)
        
         
    }

    const getHomeOurOtherSources =  async () => {
        setLoading(true)
        setTabName("homeSources")
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbHome/HomeOurOtherSources',credentials);
        setHomeOurOtherSources(isi.data.data)
    }

    const getLayoutComboList =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id
        };

        let response = await axiosLibrary.postData('awbHome/LayoutComboList',credentials);
        if(response.status===200){
            setState(state=>({...state, layoutSectionList:response.data.data1, layoutMenuList:response.data.data2}))
        }
        
         
    }

    const getListArticleByMenuId =  async (param) => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id: user_id,
            menu_id: param,
            category4: JSON.stringify([]),
            lang:securityData.Security_lang(),
            sortBy:1
        };

        let isi = await axiosLibrary.postData('awbHome/ListArticleByMenuId',credentials);
        setListArticleByMenuId(isi.data.data)
    }


    const getListArticleWhatsHot =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id: user_id,
            type: "hot"
        };
        let isi = await axiosLibrary.postData('awbHome/ListArticleWhats',credentials);
        setListArticleWhatsHot(isi.data.data)
        setLoading(false)
    }

    const getListArticleWhatsNew =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id: user_id,
            type: "new"
        };
        let isi = await axiosLibrary.postData('awbHome/ListArticleWhats',credentials);
        setListArticleWhatsNew(isi.data.data)
        setLoading(false)
    }

    const getListArticleContentForYou =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id: user_id
        };
        let isi = await axiosLibrary.postData('awbHome/listArticleContentForYou',credentials);
        setListArticleContentForYou(isi.data.data)
        setLoading(false)
    }

    const getListArticleContentFromYourNetwork =  async () => {
        setLoading(true)
        setTabName("contentNetwork")
        const credentials = {
            platform_id:platform_id,
            user_id: user_id,
            type:  "network"
        };
        let isi = await axiosLibrary.postData('awbHome/ListArticleWhats',credentials);
        setListArticleContentFromYourNetwork(isi.data.data)

    }

    const getListskillfuturebyMenuId =  async (param) => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            menu_id: param,
        };

        let isi = await axiosLibrary.postData('awbHome/ListskillfuturebyMenuId',credentials);
        setListskillfuturebyMenuId(isi.data.data)
        setLoading(false)
    }

    const getViewAll=async(param, param2)=>{
        const idParam = param;
        if (idParam == 27){
            history.push({
                pathname: routeAll.routeUser.viewcourse.path
            })
        }else{
            let md5Id = await axiosLibrary.getmd5FromBackend(idParam)
            param2 == true ?
            history.push({
                pathname: routeAll.routeViewAll.menuSpecial.path,
                search: "?" + new URLSearchParams({menu: md5Id}).toString()
            })
            :
            history.push({
                pathname: routeAll.routeViewAll.page.path,
                search: "?" + new URLSearchParams({menu: md5Id}).toString()
            })
        }
        
    }

    const onClickEvent = async (type, param)=>{
        switch (type) {
            case 'shareArticle':
                setGlobal(state=>({...state,modalProp:{modalShow:true, id:param.id, type:'article'},flagShowArticle:true}))
                break;
            case 'loadArticleQuiz':
                // if(!state.flagShowArticle){
                //     // await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                // }
                setGlobal(state=>({...state,modalProp:{modalShow:true, id:param.id, type: 'quiz',param:param}, flagShowArticle:false}))
                break;
            case 'logActivityArticle':
                if(!state.flagShowArticle){
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
                if(param.allowJoin){
                    if(!state.flagShowArticle){
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

            case 'ShowContentNetworkSubmit':
                setGlobal(state=>({...state,modalProp:{modalShow:true, type:'networkSubmit'}}))
                break;
            
            case "event":
                let isi = await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                    if(isi){
                        if(isi.status===200){
                            setGlobal(state=>({...state,modalProp:{modalShow:false, id:null, loadContent: true}}))
                        }
                    }
                    window.open(param.hyperlink_url,'_blank')
                    break;

            default:
                break;
        }
        
    }

    const changeTab = (param, param2)=>{
        setLoading(true)
        const tab = param;
        const name = param2

        switch (name) {

            case 2:
                setTabTopic(tab)
                break;

            case 3:
                setTabFunction(tab)
                break;

            case 4:
                setTabJourney(tab)
                break;

            case 8:
                setTabTrans(tab)
                break;
                
            case 6:
                setTabWhats(tab)
                break;
        
            default:
                break;
        }
        setTabName(name)
        
    }

    const sectionResults=(section, type, tab)=>{
        switch (type) {
            case "nav":
                return(
                    state.layoutMenuList.filter((itemLayout) => itemLayout.section_id == section).map(
                        (itemLayout, index) =>
                        {
                            if (section == 8)
                            {
                                if( itemLayout.id == 36 || itemLayout.id == 37 || itemLayout.id == 38 || itemLayout.id == 20 || itemLayout.id == 27)
                                {
                                        
                                    return(
                                    <li key={index} className="nav-item ">
                                        <a className={ itemLayout.id == tab ? 'nav-link active' : 'nav-link'} 
                                            id={section} data-toggle="tab" onClick={changeTab.bind(this, itemLayout.id, section)} 
                                            href={section} role="tab" aria-controls={tab}
                                            aria-selected="true" > <span dangerouslySetInnerHTML={{
                                                __html: itemLayout.title
                                            }}></span>  </a>
                                    </li>
                                    );
                                }
                            }
                            else if (section == 6){
                                return(
                                    <li key={index} className="nav-item" >
                                    { index > 0 ? <span className="menu-divider"></span> : ''}
                                        <a className={ itemLayout.id == tab ? 'nav-link a-generated-content active' : 'nav-link a-generated-content' } 
                                            id={"generated-content-tab "  } data-toggle="tab" onClick={changeTab.bind(this, itemLayout.id, itemLayout.section_id)}
                                            href={"#gencontent-tab "  } role="tab" aria-controls={tab}
                                            aria-selected="true" alt={itemLayout.id}> <span dangerouslySetInnerHTML={{
                                                __html: itemLayout.title
                                            }}></span>   </a>
                                    </li>
                                )
                            }
                            else{
                                return(
                                    <li key= {index} className="nav-item" style={ section==3 ? {width: "25%"} : {width: "20%"}}>
                                        <a className={   itemLayout.id == tab ? 'nav-link active' : 'nav-link'
                                            /*
                                            section == 4 ?
                                                index == 0 ? 'nav-link active' : 'nav-link'
                                                :
                                            section == 3 ?
                                                itemLayout.title == securityData.Security_UserDirectorate_3() && index == 0 || 
                                                itemLayout.title == securityData.Security_UserDirectorate_3() && securityData.Security_UserDirectorate_3() == itemLayout.title ?
                                                'nav-link active' : 'nav-link'
                                                :
                                            //section == 2 ?
                                                itemLayout.set_as_default == 1 ? 'nav-link active' : 'nav-link'
                                                */
                                        }
                                        
                                            id={section} data-toggle="tab" onClick={changeTab.bind(this, itemLayout.id, section)}
                                            href={section} role="tab" aria-controls={tab}
                                            aria-selected="true"
                                            > <span dangerouslySetInnerHTML={{
                                                __html: itemLayout.title
                                            }}></span> 
                                        </a>
                                    </li>
                                )
                            }
                        }
                    ) 
                    
                )
            case "result":
                return(
                        state.layoutMenuList.filter((itemLayout) => itemLayout.section_id == section).map(
                            (itemLayout, index) =>
                            {
                                if(section == 6 ){

                                    return(
                                        <div key={index} className={itemLayout.set_as_default == 1 ? "tab-pane fade show active" : "tab-pane fade" 
                                        } 
                                            id={"gencontent-tab " }
                                            role="tabpanel" aria-labelledby={"generated-content-tab " }>
                                               
                                            <Slider {...settings2}>
                                                {   
                                                    tab == 25 && articleList.length <=0 ?                         
                                                    ListArticleContentForYou.map(
                                                        (itemArticle, index) =>
                                                            <div key={index} id="sliderContent" className={ itemArticle.flag_read == 1 ? 'item disabled-article' : 'item'}>

                                                                    <object >
                                                                        <a style={{color: "white"}}
                                                                        onClick={ ()=>onClickEvent('shareArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                        }
                                                                        className="share-article">
                                                                            <i className="ion-share"></i>
                                                                        </a>

                                                                        { itemArticle.flag_quiz == 1 ?
                                                                            <img className='poin-flag' style={{height: 'auto'}} src={itemArticle.show_quiz == 0 ? file_assets+"img/poin-grayscale.png" : file_assets+"img/poin.png"}/>
                                                                            :"" 
                                                                        }
                                                                    </object>  
                                                                
                                                                    <div className="team_box white_bg team_hover_style2 social_white">

                                                                            <div className="team_img" >
                                                                                <img src={file_path+"article/"+itemArticle.article_image} alt={itemArticle.article_image}/>
                                                                            </div>

                                                                            <a key={index} style={{color: "white"}}
                                                                            onClick={ itemArticle.show_quiz == 1 ? 
                                                                                ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                            :
                                                                                ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id,hyperlink_url:itemArticle.hyperlink_url})
                                                                            }>
                                                                                <div className="team_title">
                                                                                    <h5 style={{wordWrap:"break-word" }} dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemArticle.title : itemArticle.title_ind}}></h5>    
                                                                                    <span dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemArticle.description : itemArticle.description_ind }}></span>
                                                                                    <h4 dangerouslySetInnerHTML={{__html: itemArticle.category_title }}></h4>
                                                                                </div>
                                                                            </a>
                                                                    </div>
                                                                    
                                                            </div>
                                                    )
                                                    : 
                                                    articleList.map(
                                                        (itemArticle, index) =>
                                                            <div key={index} id="sliderContent" className={ itemArticle.flag_read == 1 ? 'item disabled-article' : 'item'}>

                                                                <object >
                                                                    <a  key={index}  style={{color: "white"}}
                                                                    onClick={ ()=>onClickEvent('shareArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                    }
                                                                    className="share-article">
                                                                        <i className="ion-share"></i>
                                                                    </a>

                                                                    { itemArticle.flag_quiz == 1 ?
                                                                        <img className='poin-flag' style={{height: 'auto'}} src={itemArticle.show_quiz == 0 ? file_assets+"img/poin-grayscale.png" : file_assets+"img/poin.png"}/>
                                                                        :"" 
                                                                    }
                                                                </object> 
                                                                
                                                                <div className="team_box white_bg team_hover_style2 social_white">

                                                                        <div className="team_img" >
                                                                            <img src={file_path+"article/"+itemArticle.article_image} alt={itemArticle.article_image}/>
                                                                        </div>

                                                                        <a key={index} 
                                                                        onClick={ itemArticle.show_quiz == 1 ? 
                                                                            ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                        :
                                                                            ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id,hyperlink_url:itemArticle.hyperlink_url})
                                                                        }>
                                                                            <div className="team_title">
                                                                                <h5 style={{wordWrap:"break-word" }} dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemArticle.title : itemArticle.title_ind}}></h5>    
                                                                                <span dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemArticle.description : itemArticle.description_ind }}></span>
                                                                                <h4 dangerouslySetInnerHTML={{__html: itemArticle.category_title }}></h4>
                                                                            </div>
                                                                        </a>
                                                                </div>
                                                                    
                                                            </div>
                                                    )
                                                }
                                                </Slider>

                                                <div className="text-center" style={{marginTop:"30px"}}>
                                                    { 
                                                    //loading && tabName == section ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div>  :
                                                        tab == 25 && articleList.length <=0 ?  
                                                            ListArticleContentForYou.length ==0 ?
                                                                    <span style={{color: "black"}}>
                                                                        {defaultLang.lang.search_content_article_not_found }
                                                                    </span> : "" 
                                                            :
                                                            articleList.length == 0 ?
                                                                <span style={{color: "black"}}>
                                                                    {defaultLang.lang.search_content_article_not_found }
                                                                </span> : ""
                                                    }
                                                </div>    
                                        </div>
                                    );
                                }else if(section == 8 && tab == 27 ){
                                    return(
                                
                                        <div key={index} style={{padding: "0px 5px"}} className={ section == 4 ?
                                            index == 0 ? "tab-pane fade show active" : "tab-pane fade" 
                                            :
                                        section == 3 ?
                                            itemLayout.title == securityData.Security_UserDirectorate_3() && index == 0 || 
                                            itemLayout.title == securityData.Security_UserDirectorate_3() && securityData.Security_UserDirectorate_3() == itemLayout.title ?
                                            "tab-pane fade show active" : "tab-pane fade" 
                                            :
                                        //section == 2 ?
                                            itemLayout.set_as_default == 1 ? "tab-pane fade show active" : "tab-pane fade"  } id={section} role="tabpanel" aria-labelledby={"home-tab " }>
                                            
                                            <Slider {...settings2}>
                                            {
                                                
                                                
                                                ListskillfuturebyMenuId.filter((itemArticle) => itemArticle.menu_id == tab).map(
                                                    (itemArticle, index) =>
                                                                                                
                                                                                        
                                                        <div key={index} id="sliderContent"  className={ itemArticle.flag_read == 1 ? 'item disabled-article' : 'item'}>
                                                            <div className="home_topic_box white_bg home_topic_hover_style2 social_white"
                                                            style={{backgroundImage: "url('"+file_path+"category/"+itemArticle.category_image+"')"}}>
                                                                
                                                                <a key={index} href={`${routeAll.routesUser.viewcourseDetail.path}?category=${itemArticle.pageId}`}>
                                                                                                            
                                                                    <div className="home_topic_title">    
                                                                        <h5 dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemArticle.title : itemArticle.title_ind}}></h5>    
                                                                        <span className="article-descr" dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemArticle.description : itemArticle.description_ind }}></span>
                                                                        
                                                                    </div>
                                                                </a>
                                                            </div>
                                                        </div> 
                                                        
                                                    )   
                                                }
                                            </Slider>
                                            <div className="text-center" style={{marginTop:"30px"}}>
                                                { 
                                                //loading && tabName == section ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div>  :
                                                    ListskillfuturebyMenuId.filter((itemArticle) => itemArticle.menu_id == tab).length > 0 ?
                                                        <a href={routeAll.routesUser.viewcourse.path} className=" btn btn-outline-black btn-view-more ">  
                                                        { defaultLang.lang.general_view_more } </a>
                                                        :
                                                        <span>
                                                            {defaultLang.lang.search_content_article_not_found }
                                                        </span>
                                                    }
                                            </div>    
                                        </div>
                                    )
                                }        
                                else if(section == 2 || section == 8){
                                    
                                    return(
                                        <>
                                            <div key={index}
                                            
                                            className={ section == 4 ?
                                                index == 0 ? "tab-pane  show active" : "tab-pane " 
                                                :
                                            section == 3 ?
                                                itemLayout.title == securityData.Security_UserDirectorate_3() && index == 0 || 
                                                itemLayout.title == securityData.Security_UserDirectorate_3() && securityData.Security_UserDirectorate_3() == itemLayout.title ?
                                                "tab-pane  show active" : "tab-pane " 
                                                :
                                            //section == 2 ?
                                                itemLayout.set_as_default == 1 ? "tab-pane  show active" : "tab-pane "  } id={section} role="tabpanel" aria-labelledby={"home-tab " }>
                                                
                                                <Slider {...section == 3 || section == 4 ?settings2: settings}
                                                >
                                                {
                                                    
                                                    
                                                    ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tab).map(
                                                        (itemArticle, index) =>

                                                                                            
                                                            <div  key={index}  id="sliderContent" className={ itemArticle.flag_read == 1 ? 'item disabled-article' : 'item'}>
                                                                <div className="home_topic_box white_bg home_topic_hover_style2 social_white"
                                                                style={{backgroundImage: "url('"+file_path+"article/"+itemArticle.article_image+"')"}}>
                                                                    <object>
                                                                        
                                                                        <a 
                                                                        onClick={ ()=>onClickEvent('shareArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                        }className="share-article" style={{marginLeft:'268px'}}>
                                                                        <i className="ion-share"></i>
                                                                        </a>
                                                                        { itemArticle.flag_quiz == 1 ?
                                                                            <img className='poin-flag' src={itemArticle.show_quiz == 0 ? file_assets+"img/poin-grayscale.png" : file_assets+"img/poin.png"} style={{marginLeft:'226px'}}/>
                                                                            :"" 
                                                                        }

                                                                    </object>
                                                                    
                                                                    <a 
                                                                    onClick={ itemArticle.show_quiz == 1 ? 
                                                                        ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                    :
                                                                        ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id,hyperlink_url:itemArticle.hyperlink_url})
                                                                    } >
                                                                        
                                                                        <div className="home_topic_title">                                                                        
                                                                            <h5 dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemArticle.title : itemArticle.title_ind}}></h5>    
                                                                            <span className="article-descr" dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemArticle.description : itemArticle.description_ind }}></span>
                                                                            <p className="article-category" dangerouslySetInnerHTML={{__html: `${itemArticle.category_title}` }}></p>
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            </div> 
                                                            
                                                        )   
                                                    }
                                                </Slider>
                                                <div className="text-center" style={{marginTop:"30px"}}>
                                                    {
                                                    //loading && tabName == section ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div>  : 
                                                            //section == 3 ? "" :
                                                            ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tab).length > 0 ?
                                                            <a onClick={ 
                                                                section == 8 && (tab == 36 || tab == 37 || tab == 38 ) ?
                                                                getViewAll.bind(this, tab, true) : getViewAll.bind(this, tab, false)
                                                                } className={ section == 3 ? 'btn btn-outline-white btn-view-more' : 'btn btn-outline-black btn-view-more' } 
                                                                style={section == 3 ? styleViewMoreWhite : styleViewMore} 
                                                            onMouseEnter={() => section == 3 ? changeStyleViewMoreWhite("rgb(87, 118, 192)", "white") : changeStyleViewMore("white", "black")}
                                                            onMouseLeave={() => section == 3 ? changeStyleViewMoreWhite("white", "transparent") : changeStyleViewMore("black", "transparent")}
                                                            >  
                                                            { defaultLang.lang.general_view_more } </a>
                                                            :
                                                            <span>
                                                                {defaultLang.lang.search_content_article_not_found }
                                                            </span>
                                                        }
                                                </div>    
                                            </div>
                                        </>
                                    )
                                }
                                else{
                                    return(
                                        <div key={index}
                                            
                                            className={ section == 4 ?
                                                index == 0 ? "tab-pane  show active" : "tab-pane " 
                                                :
                                            section == 3 ?
                                                itemLayout.title == securityData.Security_UserDirectorate_3() && index == 0 || 
                                                itemLayout.title == securityData.Security_UserDirectorate_3() && securityData.Security_UserDirectorate_3() == itemLayout.title ?
                                                "tab-pane  show active" : "tab-pane " 
                                                :
                                            //section == 2 ?
                                                itemLayout.set_as_default == 1 ? "tab-pane  show active" : "tab-pane "  } id={section} role="tabpanel" aria-labelledby={"home-tab " }>
                                               
                                            <Slider {...settings2}>
                                            {ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tab).map(
                                                        (itemArticle, index) =>
                                                            <div key={index} id="sliderContent" className={ itemArticle.flag_read == 1 ? 'item disabled-article' : 'item'}>

                                                                <object >
                                                                    <a tabIndex="0" role="button"  key={index}
                                                                    onClick={ ()=>onClickEvent('shareArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                    }
                                                                    className="share-article">
                                                                        <i className="ion-share"></i>
                                                                    </a>

                                                                    {/* { itemArticle.flag_quiz == 1 ?
                                                                        <img className='poin-flag' style={{height: 'auto'}} src={itemArticle.show_quiz == 0 ? file_assets+"img/poin-grayscale.png" : file_assets+"img/poin.png"}/>
                                                                        :"" 
                                                                    } */}
                                                                </object> 
                                                                
                                                                <div className="team_box white_bg team_hover_style2 social_white" 
                                                                // style={{background: "url('"+file_path+"article/"+itemArticle.article_image+"')", backgroundSize: "contain"}}
                                                                >
                                                                    { itemArticle.flag_quiz == 1 ?
                                                                        <img className='poin-flag' src={itemArticle.show_quiz == 0 ? file_assets+"img/poin-grayscale.png" : file_assets+"img/poin.png"}/>
                                                                        :null 
                                                                    }

                                                                        <div className="team_img" >
                                                                            <img src={file_path+"article/"+itemArticle.article_image} alt={itemArticle.article_image}/>
                                                                        </div>

                                                                        <a key={index} 
                                                                        onClick={ itemArticle.show_quiz == 1 ? 
                                                                            ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                        :
                                                                            ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id,hyperlink_url:itemArticle.hyperlink_url})
                                                                        }>
                                                                            <div className="team_title">
                                                                                <h5 style={{wordWrap:"break-word" }} dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemArticle.title : itemArticle.title_ind}}></h5>    
                                                                                <span dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemArticle.description : itemArticle.description_ind }}></span>
                                                                                <h4 dangerouslySetInnerHTML={{__html: itemArticle.category_title }}></h4>
                                                                            </div>
                                                                        </a>
                                                                </div>
                                                                    
                                                            </div>
                                                    )
                                                }
                                                </Slider>

                                                <div className="text-center" style={{marginTop:"30px"}}>
                                                    {
                                                    //loading && tabName == section ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div>  : 
                                                            //section == 3 ? "" :
                                                            ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tab).length > 0 ?
                                                            <a onClick={ 
                                                                section == 8 && (tab == 36 || tab == 37 || tab == 38 ) ?
                                                                getViewAll.bind(this, tab, true) : getViewAll.bind(this, tab, false)
                                                                } className={ section == 3 ? 'btn btn-outline-white btn-view-more' : 'btn btn-outline-black btn-view-more' } 
                                                                style={section == 3 ? styleViewMoreWhite : styleViewMore} 
                                                            onMouseEnter={() => section == 3 ? changeStyleViewMoreWhite("rgb(87, 118, 192)", "white") : changeStyleViewMore("white", "black")}
                                                            onMouseLeave={() => section == 3 ? changeStyleViewMoreWhite("white", "transparent") : changeStyleViewMore("black", "transparent")}
                                                            >  
                                                            { defaultLang.lang.general_view_more } </a>
                                                            :
                                                            <span>
                                                                {defaultLang.lang.search_content_article_not_found }
                                                            </span>
                                                        }
                                                </div>    
                                        </div>
                                    );
                                }
                            }
                        )
            );
        
            default:
                break;
        }
    }

    const [viewMoreColor, setviewMoreColor] = useState("black")
    const [viewMoreColor2, setviewMoreColor2] = useState("white")
    const [viewMoreBackground, setviewMoreBackground] = useState("transparent")

    const changeStyleViewMore = (color, background) =>{
        setviewMoreColor(color)
        setviewMoreBackground(background)
    }

    const changeStyleViewMoreWhite = (color, background) =>{
        setviewMoreColor2(color)
        setviewMoreBackground(background)
    }

    const styleViewMore = {
        color: `${viewMoreColor}`,
        background: `${viewMoreBackground}`,
    }

    const styleViewMoreWhite = {
        color: `${viewMoreColor2}`,
        background: `${viewMoreBackground}`,
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

    const loadAllData = () =>{
        // setGlobal(global=>({...global, loading:true}))
        const load_all_data = [
            getReadPreferredTopic(),
            getLayoutComboList(),
            getListArticleByMenuId(),
            getHomeSlider(),
            getListArticleContentForYou(),
            getListArticleWhatsHot(),
            getListArticleWhatsNew(),
            getListArticleContentFromYourNetwork(),
            getHomeOurOtherSources(),
            getHomeEvent(),
            getListskillfuturebyMenuId(27)
        ]

        Promise.allSettled(
            load_all_data
        ).then(()=>{
                setGlobal(global=>({...global, loading:false}))
                sliderHome.current.slickPlay()
            } 
        )
    }

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            if(global.modalProp.loadContent){
                setLoading(true)
                loadAllData()
            }
        }
    },[global.modalProp])

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

    // untuk set tab dari sini
    useEffect(()=>{
        state.layoutMenuList.length <=0 ?  
        setLoading(true)
        : 
        setLoading(true)
        state.layoutMenuList.map(
            (itemLayout, idx) =>
            {
                switch (itemLayout.section_id ) {

                    case 2:
                        if (itemLayout.set_as_default==1){
                            setTabTopic(itemLayout.id)
                        } 
                        break;

                    case 3:
                        if (itemLayout.title == securityData.Security_UserDirectorate_3() && idx == 0 || 
                        itemLayout.title == securityData.Security_UserDirectorate_3() && securityData.Security_UserDirectorate_3() == itemLayout.title){
                            setTabFunction(itemLayout.id)
                        } 
                        break;

                    case 4:
                        state.layoutMenuList.filter((item) => item.section_id == itemLayout.section_id ).map(
                            (item, index) =>
                            {
                                if (index==0){
                                    setTabJourney(item.id)
                                } 
                            }
                        )
                        break;

                    case 8:
                        if( itemLayout.id == 36 || itemLayout.id == 37 || itemLayout.id == 38 || itemLayout.id == 20 || itemLayout.id == 27)
                        {
                            if (itemLayout.set_as_default==1){
                                setTabTrans(itemLayout.id)
                            } 
                        }
                        break;
                        
                    case 6:
                        setTabWhats(25)
                        break;
                
                    default:
                        break;
                }
            }
        )
        
        setLoading(false)
    }, [state.layoutMenuList])

    //untuk ganti tab di content for you, whats hot dan whats new
    useEffect(()=>{
        
        if (tabWhats==23){
            setArticleList(ListArticleWhatsHot)
        }else if(tabWhats==24){
            setArticleList(ListArticleWhatsNew)
        }else if(tabWhats==25){
            setArticleList(ListArticleContentForYou)
        }
        
    }, [tabWhats])

    // useEffect(()=>{
    //     getListskillfuturebyMenuId(tabTrans)
    // }, [tabTrans])

    //
    useEffect(()=>{
        const section = tabName
        setLoading(true)
        if (section == 6){
            switch (tabWhats) {
                case 23:
                    ListArticleWhatsHot.length >2 ?
                    setInfinite(true) : setInfinite(false)
                    break;
                case 24:
                    ListArticleWhatsNew.length >2 ?
                    setInfinite(true) : setInfinite(false)
                    break;
                case 25:
                    ListArticleContentForYou.length >2 ?
                    setInfinite(true) : setInfinite(false)
                    break;
            
                default:
                    break;
            }

        }else if (section ==8 & tabTrans==27){
            ListskillfuturebyMenuId.filter((itemArticle) => itemArticle.menuId == tabTrans).length >2 ?
            setInfinite(true) : setInfinite(false)

        }else{
            switch (section) {

                case 2:
                    ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tabTopic).length >2 ?
                    setInfinite(true) : setInfinite(false)
                    break;

                case 3:
                    ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tabFunction).length >2 ?
                    setInfinite(true) : setInfinite(false)
                    break;

                case 4:
                    ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tabJourney).length >2 ?
                    setInfinite(true) : setInfinite(false)
                    break;

                case 8:
                    ListArticleByMenuId.filter((itemArticle) => itemArticle.menuId == tabTrans).length >2 ?
                    setInfinite(true) : setInfinite(false)
                    break;

                default:
                    break;
            }
        }
        setLoading(false)
    }, [tabJourney, tabWhats, tabFunction, tabTrans, tabTopic, tabName])

    return(
        <>
        <div>
            <style>
                {`	
                    html[data-useragent*='MSIE 10.0'] .headtopic {	
                    color: #617dbc;	
                    }	
                    #containerTopic {		
                        display: flex;		
                        flex-direction: row;		
                        flex-wrap: wrap;	
                        text-align: center;		
                        justify-content: center;	
                    }		
                    #containerTopic label {		
                    flex-basis: 15%;	
                    border: 1px solid #fff;	
                    padding: 10px 0px 0px 0px;	
                    display: block;	
                    position: relative;	
                    margin: 0px;	
                    cursor: pointer;		
                    }	
                    .btntopic{	
                        border: 2px solid #617dbc;	
                        color: #617dbc;	
                        width: 30%;	
                        font-weight: 900;	
                        padding: 0px 0px;	
                        border-radius: 20px;	
                    }	
                    .btntopic:hover{	
                    /* border: 2px solid #ffffff; */	
                    background: #617dbc;/* Old Browsers */	
                    background: -moz-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* FF3.6+ */	
                    background: -webkit-gradient(left top, right top, color-stop(0%, #617dbc), color-stop(32%, #617dbc), color-stop(87%, #5cb3d1), color-stop(100%, #5cb3d1));/* Chrome, Safari4+ */	
                    background: -webkit-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Chrome10+,Safari5.1+ */	
                    background: -o-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Opera 11.10+ */	
                    background: -ms-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* IE 10+ */	
                    background: linear-gradient(to right, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%);/* W3C */	
                    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#617dbc', endColorstr='#5cb3d1', GradientType=1 );/* IE6-9 */	
                    }	
                    .headtopic{	
                        text-align: center;	
                        background: -moz-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* FF3.6+ */	
                    background: -webkit-gradient(left top, right top, color-stop(0%, #617dbc), color-stop(32%, #617dbc), color-stop(87%, #5cb3d1), color-stop(100%, #5cb3d1));/* Chrome, Safari4+ */	
                    background: -webkit-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Chrome10+,Safari5.1+ */	
                    background: -o-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Opera 11.10+ */	
                    /* background: -ms-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); IE 10+ */	
                    /* background: linear-gradient(to right, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); */	
                    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#617dbc', endColorstr='#5cb3d1', GradientType=1 );/* IE6-9 */	
                        -webkit-background-clip:text;	
                        -webkit-text-fill-color: transparent;	
                        -moz-background-clip:text;	
                        -moz-text-fill-color: transparent;	
                        -o-background-clip:text;	
                        -o-text-fill-color: transparent;	
                        background-clip:text;	
                            
                    }	
                    input[type="checkbox"][id^="cb"] {	
                    display: none;	
                    }	
                    .titletopic{	
                        margin-top: 14px;	
                        font-size: 9pt;	
                        color: black;	
                    }	
                    .itemTopic:before {	
                    background-color: white;	
                    color: white;	
                    content: " ";	
                    display: block;	
                    border-radius: 50%;	
                    border: 2px solid #617dbc;	
                    position: absolute;	
                    left: 70px;	
                    top: 4px;	
                    width: 25px;	
                    height: 25px;	
                    text-align: center;	
                    font-size: 10pt;	
                    line-height: 24px;	
                    transition-duration: 0.4s;	
                    transform: scale(0);	
                    }	
                    .itemTopic img {	
                        width: 80px;	
                        border-radius: 10px 10px 10px 10px;	
                        -moz-border-radius: 10px 10px 10px 10px;	
                        -webkit-border-radius: 10px 10px 10px 10px;	
                        -webkit-box-shadow: 4px 4px 0px 1px rgb(216, 219, 221);	
                        -moz-box-shadow: 4px 4px 0px 1px rgb(216, 219, 221);	
                        box-shadow: 4px 4px 0px 1px rgb(216, 219, 221);	
                        transition-duration: 0.2s;	
                        transform-origin: 50% 50%;	
                    }	
                    :checked + .itemTopic:before{	
                        content: "✔";	
                        font-weight: 900;	
                        color: #617dbc;	
                    color: -moz-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* FF3.6+ */	
                    color: -webkit-gradient(left top, right top, color-stop(0%, #617dbc), color-stop(32%, #617dbc), color-stop(87%, #5cb3d1), color-stop(100%, #5cb3d1));/* Chrome, Safari4+ */	
                    color: -webkit-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Chrome10+,Safari5.1+ */	
                    color: -o-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Opera 11.10+ */	
                    color: -ms-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* IE 10+ */	
                    color: linear-gradient(to right, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%);/* W3C */	
                        background: #ffffff;	
                        background: -moz-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: -webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(0%, #ffffff), color-stop(47%, #f6f6f6), color-stop(100%, #ededed));	
                        background: -webkit-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: -o-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: -ms-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: radial-gradient(ellipse at center, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#ededed', GradientType=1 );	
                    transform: scale(1);	
                    left: 70px;	
                    top: 4px;	
                    }	
                    :checked + .itemTopic img { 	
                    border: 4px solid transparent;	
                    background: #5cb3d1;/* Old Browsers */	
                    background: -moz-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* FF3.6+ */	
                    background: -webkit-gradient(left top, right bottom, color-stop(0%, #5cb3d1), color-stop(13%, #5cb3d1), color-stop(68%, #617dbc), color-stop(100%, #617dbc));/* Chrome, Safari4+ */	
                    background: -webkit-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* Chrome10+,Safari5.1+ */	
                    background: -o-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* Opera 11.10+ */	
                    background: -ms-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* IE 10+ */	
                    background: linear-gradient(135deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%);/* W3C */	
                    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#5cb3d1', endColorstr='#617dbc', GradientType=1 );/* IE6-9 fallback on horizontal gradient */	
                    /* border-image-slice: 1; */	
                    /* transform: scale(0.9); */	
                    z-index: -1;	
                    }	
                    @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {	
                    /* IE10+ CSS styles go here */	
                    }	
                    ul.file-upload-requirement {		
                        font-size: 11px;		
                        font-weight: normal;		
                        padding: 5px 0 5px 25px;		
                        list-style: circle;		
                    }		
                    .chosen-container-multi .chosen-choices{		
                            background-color: transparent;		
                            border: 2px solid #ededed;		
                    }		
                    ul.chosen-choices{		
                        min-height:170px;		
                    }	

                    #sliderContent{
                        padding: 0px 5px;
                    }

                    #event .slick-slide{
                        padding: 0px 20px;
                    }

                    #event{
                        // margin-bottom: 5%;
                        padding: 0px 0px 80px 0px;
                    }
                    
                    .share-article{
                        // margin: 0px 0px;
                        // float: right;
                        // position:unset;
                        // right: 0px;
                        top:12px;
                        right: unset;
                        margin-left: 215px;
                        cursor:pointer;
                     }
                     img.poin-flag {
                        //  z-index: 9;
                        //  width: 40px !important;
                         top: 12px;
                         right: unset;
                         margin-left: 173px;
                        //  position:unset;
                        //  float: right;
                     }
                    //  object{
                    //      float: right;
                    //      width: unset;
                    //      z-index: 2;
                    //      margin-top: 5px;
                    //      margin-right: 5px;
                    //  }

                    .slider-item{
                        height: 100vh;
                        width: 100%;
                        max-height: 450px;
                        margin-top: 60px;
                        cursor: pointer;
                        background-size: cover;
                        padding:11vh 0;
                    }

                    .hover{
                        color:white;
                    }

                    .hover:hover{
                        color: black;
                    }
                    
                    .event-class img{
                        opacity: 1;
                        transition: all 300ms ease;
                        width: 100%;
                    }
                    
                    .event-class .slick-center img{
                        /* padding: 1rem; */
                        -webkit-transform: scale(1.2);
                        opacity: 1;
                        transform: scale(1.2);
                    }

                    .event-class{
                        padding: 4rem;
                    }
                    .slider-class i.fa {
                        display:none
                    }

                    .slider-class:hover i.fa {
                        display:block
                    }
                    .item{
                        display:block !important;
                    }
                `}	
            </style>

            <section className="banner_section p-0 full_screen home-slider"
            >
                <div id="awbSlider" className="banner_content_wrap">
                    <Slider {...settingsSlider} ref={sliderHome}>
                    {
                        sliders.map(
                            (slider, index) =>
                            slider.file_type==='mp4' ?
                                <div key={index} id="sliderContent" className="background_bg overlay_bg">
                                    <div className="slider-item">
                                        <a tabIndex="0" role="button" href={slider.hyperlink_url}
                                        // onClick={ slider.show_quiz == 1 ? 
                                        //     ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: slider.trn_article_id,id:slider.id})
                                        // :
                                        //     ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: slider.article_id,id:slider.id,hyperlink_url:slider.hyperlink_url})
                                        // }
                                        >
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
                                            
                                        </a>
                                    </div>
                                </div>
                            :                 
                            <div className="background_bg" key={index} style={{cursor:"pointer"}} >
                                <div className="slider-item"
                                style={{background: "url('"+file_path+"slider/"+slider.slider_video+"')", backgroundSize: "cover"}}>
                                <a tabIndex="0" role="button" href={slider.hyperlink_url}
                                //     onClick={ slider.show_quiz == 1 ? 
                                //         ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: slider.trn_article_id,id:slider.id})
                                //     :
                                //         ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: slider.article_id,id:slider.id,hyperlink_url:slider.hyperlink_url})
                                // }
                                >
                                    <div className="banner_slide_content" >
                                        <div className="container subscribe">
                                            <div className="row">
                                                <div className="col-lg-12 col-md-12 col-sm-12 text-left">
                                                    
                                                        <div className="banner_content text_white">
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
                                </a>
                                </div>

                            </div>
                        )   
                    }
                    </Slider>
                </div>
                
            </section>
                                            
            {   /*
                state.layoutSectionList.filter((item) => item._code == "Transformation Essentials").length <=0 ? 
                <div className="col-sm-12"style={{color: "black", textAlign:"center"}}>
                    <span >
                        {defaultLang.lang.search_content_article_not_found }
                    </span> 
                </div>
                : */
                state.layoutSectionList.filter((item) => item._code == "Transformation Essentials").map(
                    (itemSection, index) =>
                    {
                        return(
                        <section key={index} id="transformation" className={"section-transformation " }>
                            <div className="container web-tour-section-topic">

                                <div className="row justify-content-center">
                                    <div className="col-md-6">
                                        <div className=" text-center">
                                            <h2 className="section-title">  {itemSection.title}  </h2>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-12" style={{padding:"0 !important"}}>
                                        <div className="tab-style4">
                                            <ul className="nav nav-tabs" role="tablist" style={{justifyContent: "space-around"}}>
                                                {sectionResults(itemSection.id,"nav", tabTrans)}
                                            </ul>

                                            <div className="col-md-12" style={{margin: "auto 0"}}>
                                                {loading && tabName == itemSection.id ? <LoadingData loading={loading}/> : ""}
                                            </div>
                                            <div className="tab-content" style={cssTarget(loading)} >
                                                { 
                                                    sectionResults(itemSection.id,"result", tabTrans)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                    </section>
        );
    })
}
            {
                /*
                state.layoutSectionList.filter((item) => item._code == "Topic").length <=0 ? 
                <div className="col-sm-12"style={{color: "black", textAlign:"center"}}>
                    <span >
                        {defaultLang.lang.search_content_article_not_found }
                    </span> 
                </div>
                :*/
                state.layoutSectionList.filter((item) => item._code == "Topic").map(
                    (itemSection, index) =>
                    {
                        return(
                        <section key={index} id="topic" className={"section-topic " }>
                            <div className="container web-tour-section-topic">

                                <div className="row justify-content-center">
                                        <div className="col-md-6">
                                            <div className=" text-center">
                                                <h2 className="section-title"> { itemSection.title }  </h2>
                                            </div>
                                        </div>
                                </div>
                        
                                <div className="row">
                                    <div className="col-md-12" style={{padding:"0 !important"}}>
                                        <div className="tab-style4">
                                            <ul className="nav nav-tabs" role="tablist">
                                                {sectionResults(itemSection.id,"nav", tabTopic)}
                                            </ul>

                                            <div className="col-md-12" style={{margin: "auto 0"}}>
                                                {loading && tabName == itemSection.id ? <LoadingData loading={loading}/> : ""}
                                            </div>

                                            <div className="tab-content" style={cssTarget(loading)}>
                                                { 
                                                    sectionResults(itemSection.id,"result", tabTopic)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </section>
            );
        })
    }
            <section id="generatedContent" className="section-generated-content" style={{backgroundColor: "#86d0e2"
            ,backgroundSize: "cover"
            }}>
            
                    <div className="container">

                        <div className="row justify-content-center">
                            <div className="col-md-6">
                                <div className=" text-center">
                                &nbsp;
                                </div>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-12">
                                 <div className="tab-style4 tab-function tab-generated-content">

                                    <ul className="nav nav-tabs" id="nav-function" role="tablist">
                                        {sectionResults(6, "nav", tabWhats)}
                                    </ul>

                                    <div className="col-md-12" style={{margin: "auto 0"}}>
                                        {loading && tabName == 6 ? <LoadingData loading={loading}/> : ""}
                                    </div>

                                    <div className="tab-content" style={cssTarget(loading)}>
                                        {
                                            sectionResults(6,"result", tabWhats)
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
            </section>
        {
            /*
            state.layoutSectionList.filter((item) => item._code == "Employee Journey").length <=0 ? 
            <div className="col-sm-12"style={{color: "black", textAlign:"center"}}>
                    <span >
                        {defaultLang.lang.search_content_article_not_found }
                    </span> 
                </div>
            :*/
            state.layoutSectionList.filter((item) => item._code == "Employee Journey").map(
                (itemSection, index) =>
                {
                    return(
                            <section key={index}  id="employeeJourney" className={"section-employee-journey " } 
                            style={ itemSection.title ? {} : {backgroundSize: "cover" }}
                            >
                                <div className="container">

                                    <div className="row justify-content-center">
                                        <div className="col-md-6">
                                            <div className=" text-center">
                                                <h2 className="section-title">  { itemSection.title }  </h2>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="tab-style4 tab-function">

                                                <ul className="nav nav-tabs" id="nav-function" role="tablist">
                                                    {sectionResults(itemSection.id,"nav", tabJourney)}
                                                </ul>

                                                <div className="col-md-12" style={{margin: "auto 0"}}>
                                                    {loading && tabName == itemSection.id ? <LoadingData loading={loading}/> : ""}
                                                </div>

                                                <div className="tab-content" style={cssTarget(loading)}>
                                                    {
                                                        sectionResults(itemSection.id,"result", tabJourney)
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                        </section>
                    );
                })        
        }
            <section id="generatedContent contentNetwork" className="section-generated-content" style={{backgroundColor: "#5776c0", 
            backgroundSize: "cover"
            }}>
            
                    <div className="container">

                        <div className="row justify-content-center">
                            <div className="col-md-6">
                                <div className=" text-center">
                                &nbsp;
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="tab-style4 tab-function tab-content-from-your-network">

                                    <ul className="nav nav-tabs" id="nav-function" role="tablist">
                                        <li className="nav-item" style={{width: "50%" }}>
                                            <a className="nav-link active" 
                                                id="content_network" data-toggle="tab" 
                                                href="#" role="tab" aria-controls="content-network" 
                                                aria-selected="true">Content from your Network</a>
                                        </li>
                                        <li className="nav-item" style={{width: "50%" }}>
                                            <a className="nav-link active" id="content_network_submit"  
                                            onClick={ ()=>onClickEvent('ShowContentNetworkSubmit') }
                                            >Submit your own content & get +100 points </a>
                                        </li>
                                    </ul>

                                    <div className="tab-content tab-content-network">  
                                        <div className="row">
                                            {
                                                loading && tabName == "contentNetwork" ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div> :
                                                ListArticleContentFromYourNetwork.map(
                                                    (itemArticle, index) =>

                                                    <div key={index} className="col-md-6">
                                                            <div className="row div-content-network" onClick={ itemArticle.show_quiz == 1 ? 
                                                                        ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                    :
                                                                        ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id,hyperlink_url:itemArticle.hyperlink_url})
                                                                    } 
                                                                style={{cursor:'pointer'}}
                                                            >
                                                                
                                                                <div className="col-md-5">
                                                                    <a onClick={ ()=>onClickEvent('shareArticle',{content:'Article',articleId: itemArticle.article_id,id:itemArticle.id})
                                                                    } className="share-article" style={{position: 'absolute', margin: '1%',cursor:'pointer'}} tabIndex="0" role="button"><i  className="ion-share"></i>
                                                                    </a>
                                                                    <div className="content-network-img-preview" 
                                                                        style={{backgroundImage: "url('"+file_path+"article/"+itemArticle.article_image}} title={itemArticle.article_image}>
                                                                        { itemArticle.flag_quiz == 1 ? 
                                                                            <img className='poin-flag' src={ itemArticle.show_quiz == 0 ? file_assets+"img/poin-grayscale.png" : file_assets+"img/poin.png" }/>
                                                                            :""
                                                                        }
                                                                        
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="col-md-6">
                                                                        <h5 style={{wordWrap:"break-word" }} dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemArticle.title : itemArticle.title_ind}}></h5>    
                                                                        <span dangerouslySetInnerHTML={{__html: securityData.Security_lang() == "ENG" ? itemArticle.description : itemArticle.description_ind }}></span>
                                                                </div>
                                                                
                                                            </div>
                                                    </div>

                                                )
                                            }
                                            
                                        </div>
                                        <div className="text-center" style={{marginTop:"30px"}}>
                                            { 
                                                //loading && tabName == "contentNetwork"  ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div>  :
                                                ListArticleContentFromYourNetwork.length > 0 ?
                                                    <a onClick={ getViewAll.bind(this, 26, false)} className="btn btn-outline-white btn-view-more"
                                                    style={styleViewMoreWhite} 
                                                        onMouseEnter={() => changeStyleViewMoreWhite("rgb(87, 118, 192)", "white")}
                                                        onMouseLeave={() => changeStyleViewMoreWhite("white", "transparent")}
                                                    >  
                                                    { defaultLang.lang.general_view_more } </a>
                                                    :
                                                    <span>
                                                        {defaultLang.lang.search_content_article_not_found }
                                                    </span>
                                            }
                                        </div>    

                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>

            </section>
            {
                /*
                state.layoutSectionList.filter((item) => item._code == "Function").length <=0 ? 
                <div className="col-sm-12"style={{color: "black", textAlign:"center"}}>
                    <span >
                        {defaultLang.lang.search_content_article_not_found }
                    </span> 
                </div>
                :*/
                state.layoutSectionList.filter((item) => item._code == "Function").map(
                    (itemSection, index) =>
                        <section key={index} id="function" className={"section-function "+classSubscribe} 
                        style={ securityData.Security_UserIsSubscribe() == false? 
                            {backgroundSize: "contain", backgroundPosition: "bottom 100px center"}:
                            {backgroundSize: "contain", backgroundPosition: "bottom center"} 
                             } 
                        >
                            <div className="container">
                                <div className="row justify-content-center">
                                    <div className="col-md-6">
                                        <div className=" text-center">
                                            <h2 className="section-title"> { itemSection.title }</h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="tab-style4 tab-function">
                                            <ul className="nav nav-tabs" id="nav-function" role="tablist">
                                                {sectionResults(itemSection.id,"nav", tabFunction)}
                                            </ul>

                                            <div className="col-md-12" style={{margin: "auto 0"}}>
                                                {loading && tabName == itemSection.id ? <LoadingData loading={loading}/> : ""}
                                            </div>

                                            <div className="tab-content"  style={cssTarget(loading)}>
                                                { 
                                                    sectionResults(itemSection.id,"result", tabFunction)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <HomeSubscribe  thisStateGlobal={global}/>
                        </section>
                )
            }



            <section className="section-our-other-sources">

            <div className="row justify-content-center">
                                <div className="col-md-6">
                                    <div className=" text-center">
                                        <h2 className="section-title">{ defaultLang.lang.home_our_others_sources}</h2>
                                    </div>
                                </div>
                            </div>

                    <div className="row slider">
                    
                    <ul>
                        {
                            loading && tabName == "homeSources" ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div> :
                            HomeOurOtherSources.map(
                                (itemHome, index) =>
                                {
                                    return(
                                    <li key={index} style={{background:"url('"+file_path+"sources/"+itemHome.sources_image+"')", backgroundSize: "cover", height: "100%"}}>
                                        <a href={ itemHome.hyperlink_url } rel="noreferrer" target="_blank"> 
                                            <div className="title" dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemHome.description : itemHome.description_ind}}></div>
                                            <div className="caption" ><h2 dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? itemHome.title : itemHome.title_ind}}></h2></div>
                                        </a>
                                    </li>
                                    )
                                }
                            )
                        }
                        
                        
                        
                    </ul>
                    
                    
                    </div>


            </section>



            {
                /*
                state.layoutSectionList.filter((item) => item._code == "Event").length <=0 ? 
                <div className="col-sm-12"style={{color: "black", textAlign:"center"}}>
                    <span >
                        {defaultLang.lang.search_content_article_not_found }
                    </span> 
                </div> 
                :*/
            // state.layoutSectionList.filter((item) => item._code == "Event").map(
            //         (itemSection, index) =>
            //         {
            //             return(
                            <section 
                            // key={index} 
                            id="event" className="section-idea-event" >
                                <div className="container" >

                                    <div className="row">
                                        <div className="col-md-12 animation" data-animation="fadeInUp" data-animation-delay="0.1s">
                                            <div className=" text-center">
                                                <h2 className="section-title">
                                                    {/* { itemSection.title }  */}
                                                    Events
                                                </h2>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-12">
                                            <div className="cleafix small_divider"></div>
                                        </div>
                                    </div>

                                    <div className="row section-event">
                                        <div className="col-md-12 animation" data-animation="fadeInUp" data-animation-delay="0.1s">
                                            <div className="container">
                                                <Slider {...settingsEvent}>
                                                    { 
                                                    loading && tabName == "homeEvent" ? <div className="col-md-12" style={{margin: "auto 0"}}> <LoadingData loading={loading}/> </div> :
                                                    HomeEvent.map(
                                                        (itemEvent, index) =>
                                                                
                                                            <div key={index} id="sliderContent" className="event-item">
                                                                <a 
                                                                onClick={ ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: itemEvent.id,id:itemEvent.id}) }
                                                                href={ itemEvent.hyperlink_url } rel="noreferrer" target="_blank">
                                                                    <div className="testimonial_box">
                                                                    <img src={file_path+"event/"+itemEvent.event_image}/>
                                                                        <div className="testi_content">
                                                                            <span className="event-date">{ securityData.Security_lang() == "ENG" ? itemEvent.event_date.replace(/<[^>]+>/g, '') : itemEvent.event_date_ind.replace(/<[^>]+>/g, '') }</span>
                                                                            <h6 className="event-title">{ securityData.Security_lang() == "ENG" ? itemEvent.event_title.replace(/<[^>]+>/g, '') : itemEvent.event_title_ind.replace(/<[^>]+>/g, '') }</h6>
                                                                            <p className="event-status">{ securityData.Security_lang() == "ENG" ? itemEvent.event_status.replace(/<[^>]+>/g, '') : itemEvent.event_status_ind.replace(/<[^>]+>/g, '')  } </p>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            </div>
                                                            
                                                    )}
                                                </Slider>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </section>
                    //     );
                    // })
            }
            </div>
        </>

    )
}

export default home;