/*
Note :
1. search data => data yang di search dimasukan ke dalam session dengan key searchData, session searchData akan dihapus jika sudah masuk ke halaman viewall
*/

import React, { useContext, useEffect, useState} from 'react';
import routeAll from '../../../helpers/route';
import { env, securityData, typePageMenuNCategory, typePagesPBONDigitalCampus } from '../../../helpers/globalHelper';
import navMenu from '../../../helpers/navMenu';
import defaultLang from '../../../helpers/lang';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { Collapse } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';
import GlobalState from '../../../helpers/globalState';
import{ Button , ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import { cssTarget, LoadingData, LoadingDataButton } from '../../../components/Loading';
import { Overlay,  Popover, ListGroup } from 'react-bootstrap';

import "../../../assets/css/navMenu.scss"
import moment from 'moment';

function NavMenu(props){
    const [state, setState] = useState({
        lang:securityData.Security_lang(),
        activePeriod:null,
        sectionList:[],
        menuList:[],
        categoryList:[],
        showDropdown:false,
        contentFromYourNetwork:0,
        currentTab:0,
        loading:true,
        txtSearch:"",
        showPlatform:true,
        notificationData:[
            // {id_notif_admin:1,description_en:"test notification",description_ind:"test notification ind",url:"www.google.com",status_read:0, image:null}
        ],
        notificationDataUnread:[]
    })
    const [dropdown, setdropdown] = useState(false)

    const currentPath = window.location.pathname;
    const [addStyle,setAddStyle] = useState("")
    const [headerLogo, setHeaderLogo] = useState(env.assets+"img/header_logo_white.svg")
    const [loadNotif, setLoadNotif] = useState(true);
    const isSubscribeSff = securityData.Security_UserIsSubscribe()
    const isAdmin = securityData.Security_IsAdmin()
    // const isSubscribeSff = false
    // const isAdmin = 0
    const notifierStatus = securityData.Security_NotifierStatus()||'10000'
    const platform_name = securityData.Security_getPlatformName() || "null platform"
    const user_id = securityData.Security_UserId();
    const user_country = securityData.Security_UserCountry();
    const user_directorate = securityData.Security_UserDirectorate_3();
    const lang = securityData.Security_lang();
    // const [showPlatform, setShowPlatform] = useState(false)
    // const platform_lang = securityData.Security_getTheme().lang || "null language"
    // const [list_theme, setList_theme] = useState([])

    // eslint-disable-next-line
    const [global, setGlobal] = useContext(GlobalState)

    let notifBellRef = React.useRef(null)

    const getActivePeriod = async () => {
        let response = await axiosLibrary.postData('awbHome/getActivePeriod',{platform_id:securityData.Security_getPlatformId()});
        if(response.status===200){
            setState(state =>({...state, activePeriod:response.data.data}))
            setGlobal(global=>({...global, activePeriod:response.data.data}))
        }
    }

    const getSectionList = async () => {
        let response = await axiosLibrary.postData('awbHome/LayoutComboList',{platform_id:securityData.Security_getPlatformId()});
        if(response.status===200){
            let md5ContentFromYourNetwork = await axiosLibrary.getmd5FromBackend('26')
            setState(state=>({...state, sectionList:response.data.data1, menuList:response.data.data2, categoryList:response.data.data3, contentFromYourNetwork:md5ContentFromYourNetwork, idSection:response.data.data1[0].id}))
            // props.loading(false)
        }
    }

    const checkNewNotif = async ()=>{
        
        const credentials = {
            platform_id:securityData.Security_getPlatformId()
        };

        let isi = await axiosLibrary.postData('awbNotifUser/CheckNewNotif',credentials);
        
        if(isi.status===200){
            getNotifData()
        }
    }

    const getNotifData = async ()=>{
        
        const credentials = {
            platform_id:securityData.Security_getPlatformId()
        };

        let isi = await axiosLibrary.postData('awbNotifUser/ListNotifData',credentials);
        let dataNotif = [];
        let dataNotifUnread = [];
        if(isi.status===200){
            dataNotif = isi.data.data.filter(v=> v.delete_flag===0).map((v)=>{
                if(v.notif_type_id===2){
                    return{...v,notif_text_eng:v.notif_text_eng.replace(`':url'`,`'#' onclick="clickedNotif(${v});return false;"`),notif_text_ind:v.notif_text_ind.replace(`':url'`,`'#' onclick="clickedNotif(${v});return false;"`)}
                }else{
                    return{...v}
                }
            })
            dataNotifUnread = isi.data.data.filter(v=> v.read_flag===0).map((v)=>{
                if(v.notif_type_id===2){
                    return{...v,notif_text_eng:v.notif_text_eng.replace(`':url'`,`'#' onclick="clickedNotif(${v});return false;"`),notif_text_ind:v.notif_text_ind.replace(`':url'`,`'#' onclick="clickedNotif(${v});return false;"`)}
                }else{
                    return{...v}
                }
            })
            setState(state=>({...state,notificationData:dataNotif,notificationDataUnread:dataNotifUnread}))
            setLoadNotif(false)
        }
    }

    // event to manipulate style based on current path
    useEffect(()=>{
        if(currentPath === routeAll.routesUser.home.path 
            || currentPath === routeAll.routesUser.learningPage.path 
            || currentPath === routeAll.routesUser.movement.path
            || currentPath === routeAll.routesUser.profile.path
            || currentPath === routeAll.routesUser.profileDetail.path){
            setAddStyle(addStyle + 'header-transparent ');
        }

        if(currentPath === routeAll.routesUser.learningPage.path){
            setHeaderLogo(env.assets+"img/header_logo_gradient.svg");
        }
        
    },[currentPath])

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getActivePeriod()
            getSectionList()   
            getTotalPlatformData()
            // getNotificationData()
            // checkNewNotif()
        }
    },[])

    useEffect(()=>{
        if(loadNotif){
            checkNewNotif()
        }
    },[loadNotif])

    useEffect(()=>{
        if(state.categoryList.length>0){
            setState(state=>({...state, loading:false}))
        }

    },[state.categoryList])

    const changeLang = (value) =>{
        let dataUser = axiosLibrary.getUserInfo()
        const langCurrent = {
            lang: value
        }
        dataUser = {...dataUser,...langCurrent};
        localStorage.setItem('userinfo',JSON.stringify(dataUser));
        setState(state=>({...state, ...langCurrent}))
        window.location.reload();
    }

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

    const search = async (e) => {
        e.preventDefault();
        axiosLibrary.generateLog('Search', `Keyword : ${state.txtSearch} , via ${isMobile?`Mobile Device`:`Desktop`}`)
        localStorage.setItem('searchData', state.txtSearch)
        window.location.href = routeAll.routesUser.search.path
    }
    
    // eslint-disable-next-line
    const renderNav = ()=>{
        return (
            navMenu.menu.filter(navBar => navBar.adminLevel <= props.adminLevel).map((nav, idx)=>{
                    if(nav.txtName==="Skill For Future"){
                        return(
                            // state.activePeriod !== null ? 
                            //     <li key={idx} className={`skillfuture ${isSubscribeSff? `` : `skillwithsubscribe`}`} style={{backgroundColor:"black"}}>
                            //         <a href={nav.href}>
                            //             <img className="logo_default" src={nav.imageMenu} alt={nav.txtName} />
                            //         </a>
                            //     </li>
                            // :null
                            null
                        )
                    }else{
                        return(
                            // <li className={nav.showMobile? "dropdown" : "dropdown hidden-xs"} key={idx} style={nav.txtName==="Topics"?{textAlign:"center", minWidth: "90px"}:{}}>
                            <li id="topics-nav-menu" className={nav.showMobile? "dropdown" : "dropdown hidden-xs"} key={idx} style={nav.txtName==="Explore"?{textAlign:"center", minWidth: "90px"}:{}}>
                                {nav.dropdown ?
                                        <>
                                            <a style={{cursor:'pointer'}} tabIndex="0" role="button" className="dropdown-toggle nav-link menu-topics nav-menu-white" onClick={()=>setdropdown(!dropdown)}>{nav.txtName}</a>
                                        </>
                                    :
                                    <a href={nav.href} className="nav-link">{nav.txtName}</a>     
                                }
                            </li>
                        )
                    }
                    
            })
            
        )
    }

    const getTotalPlatformData = async ()=>{
        let responseJson = await axiosLibrary.postData('awbPlatform/GetPlatformAccess',{country:user_country,directorate:user_directorate, user_id:user_id});
        if(responseJson.status===200){
            if(responseJson.data.data2 == 1){
                setState(state=>({...state, showPlatform:false}))
            }
        }
    }

    const [showNotif, setShowNotif] = useState(false)

    const clickedNotif = async(data) =>{
        const param = {
            notif_id: data.id
        }
        let isi = await axiosLibrary.postData('awbNotifUser/UpdateNotifRead',param);
        if(isi.status===200){
            if(data.hyperlink_url){
                window.location.href = !data.hyperlink_url && data.notif_type_id==2?routeAll.routesUser.learningPage.path:data.hyperlink_url    
            } 
            setLoadNotif(true)
        }

    }

    const clearNotif = async() =>{
        const credentials = {
            platform_id:securityData.Security_getPlatformId()
        };

        let isi = await axiosLibrary.postData('awbNotifUser/ClearNotif',credentials);
        
        if(isi.status===200){
            setLoadNotif(true)
        }
    }

    const noNotif = ()=>{
        return(
            <Popover.Content className='body-no-notif'>
                <div className="d-flex flex-row pt-3">
                    <div className='p-1 pe-5'>
                            <div>
                                <img className="img-no-notif" src={env.assets +'img/notif-icon-no-notif.svg'} alt="no-notif"/>
                            </div>
                            <div className="header-no-notif">
                                <div dangerouslySetInnerHTML={{__html:defaultLang.lang.headerNoNotif}}/>
                                </div>
                            <div className="pt-3 subheader-no-notif">
                                <div dangerouslySetInnerHTML={{__html:defaultLang.lang.subheaderNoNotif}}/>
                            </div>
                            <div className="pt-3 pb-3 subheader-no-notif">
                                <div dangerouslySetInnerHTML={{__html:defaultLang.lang.subheader2NoNotif}}/>
                            </div>
                    </div>
                    <div className='p2 ms-auto text-end cursor-pointer'>
                        <img id="notif-close-btn-no-notif" src={env.assets +'img/notif-icon-close.svg'} alt="btn-close" 
                            onClick={()=>setShowNotif(false)}
                            />
                    </div>
                </div>   
            </Popover.Content>
        )
    }
    const haveNotif = () =>{
        return(
            <>
            <LoadingData loading={loadNotif} type="popup"/>
            <Popover.Title as="div">
                <div className="row">
                    <div className='col-sm-12'>
                        <div className="d-flex flex-row align-items-center">
                            <div className="pe-3">{defaultLang.lang.notifications}</div>
                            <div className="cursor-pointer clear-all-button" onClick={()=>clearNotif()}>{defaultLang.lang.clearAll}</div>
                            <div className="cursor-pointer ms-auto"><img id="notif-close-btn" src={env.assets +'img/notif-icon-close.svg'} alt="btn-close" onClick={()=>setShowNotif(false)}/></div>
                        </div>
                    </div>
                </div>   
            </Popover.Title>
            <Popover.Content style={cssTarget(loadNotif)}>
                    <ListGroup >
                        {state.notificationData.map((v,idx)=>
                            <ListGroup.Item className="list-group-notif" key={idx} onClick={()=>clickedNotif(v)}>
                                <div className="row">
                                    <div className="col-sm-2 p-0 w-auto">
                                        <div className={`notif-image-stack ${v.read_flag==0 && `notif-unread`}`}>
                                            <img src={v.notif_img?env.userDocument+'category/'+v.notif_img:env.assets+'img/notif-icon-system-nudge.svg'} alt="..." className="img-fluid rounded-circle notif-img" />
                                        </div>
                                    </div>
                                    <div className="col-sm-7">
                                        <span>
                                            <div dangerouslySetInnerHTML={{__html:
                                                lang==='ENG'? v.notif_text_eng : v.notif_text_ind
                                            }}/>
                                        </span>
                                    </div>
                                    <div className="col-sm-3 p-0 text-end">
                                        <span className='notif-dur-text'>{moment(moment.utc(v.date_created).toDate()).fromNow()}</span>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        )}
                    </ListGroup>
            </Popover.Content>
            </>

        )
    }

    const renderNotif = ()=>{
        let render = <></>
        if(state.notificationData.length <= 0){
            render = noNotif()
        }else{
            render = haveNotif()
        }

        return render
    }
    const notifPopover = (
        <Popover id="popover-notif">
            {renderNotif()}
        </Popover>
    )

    const getLinkMenuNCategory = (menuData,type)=>{
        // let linkData = 
        // [36,37,38,41,42,43].includes(menuData.id)?
        // `${routeAll.routeViewAll.menuSpecial.path}?menu=${menuData.pageId}`
        // :
        // [27].includes(menuData.id)?
        // `${routeAll.routesUser.viewcourse.path}`
        // :
        // `${routeAll.routeViewAll.page.path}?menu=${menuData.pageId}`;
        const idxLinkData = typePageMenuNCategory.findIndex(v=>v.id===menuData.flag_type_page)

        let linkData = 
        type=='menu'?
        typePageMenuNCategory[idxLinkData===-1?0:idxLinkData].hrefLinkMenu.replace('[variable1]',menuData.pageId)
        :
        typePageMenuNCategory[idxLinkData===-1?0:idxLinkData].hrefLinkCategory.replace('[variable1]',menuData.pageId)

        return linkData
    }

    if(isMobile){
        return(
            <header className="header_wrap fixed-top hover_menu_style2">
                <div className="container p-0">
                    <nav className="navbar navbar-expand-lg d-flex flex-row align-items-center">
                        <a className="navbar-brand page-scroll" href={routeAll.routesUser.home.path}>
                            <img className="logo-default" src={headerLogo} alt="logo" />
                        </a>
                        <div className="badge-notification">
                            <span id="notifBell" ref={notifBellRef} className="fa-stack" data-count={state.notificationDataUnread.length > 0 ? state.notificationDataUnread.length : null } onClick={() => setShowNotif(!showNotif)}>
                                {/* <i className="fa fa-bell" id="notif-icon"></i> */}
                                <svg className="cursor-pointer notif-nav-menu-image" id="notif">
                                    <use xlinkHref={env.assets +'img/notif-icon-bell.svg#Layer_1'}></use>
                                </svg>
                            </span>  
                            <Overlay placement="bottom"
                                show={showNotif}
                                target={notifBellRef.current}
                                rootClose={true}
                                rootCloseEvent='click'
                                onHide={() => setShowNotif(false)}
                                >
                                {notifPopover}
                            </Overlay> 
                        </div>
                    </nav>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"> 
                        <span className="ion-android-menu"></span> 
                    </button>

                    <div className="collapse navbar-collapse " id="navbarSupportedContent">
                        <ul className="navbar-nav" id="menubar">
                            {state.sectionList.map((v,idx)=>
                                <li className="dropdown panel" key={idx}>
                                    {v.id===7?
                                        <a className="nav-link" href={`${routeAll.routeViewAll.page.path}?menu=${state.contentFromYourNetwork}`}>{v.title}</a>
                                    :
                                        <a className="dropdown-toggle nav-link" data-toggle="collapse" data-parent="#menubar" href={`#collapse${idx}`}>{v.title}</a>
                                    }
                                    <div className="dropdown-menu collapse" id={`collapse${idx}`}>
                                        <ul className="list-unstyled">
                                            {state.menuList.filter(x=>x.section_id===v.id).map((y, idxy)=>
                                                <li key={idxy}>
                                                    <a className="dropdown-item menu-link" href={ getLinkMenuNCategory(y,'menu')}>
                                                        <div dangerouslySetInnerHTML={{
                                                            __html: y.title
                                                        }}/>
                                                    </a>
                                                    <div className="dropdown-menu sub-menu show">
                                                        <ul className="list-unstyled">
                                                            {state.categoryList.filter(w=>w.menu_id===y.id && !typePagesPBONDigitalCampus.includes(y.flag_type_page)).map((z,idx_category)=>
                                                                <li key={idx_category}>
                                                                    <a className="dropdown-item menu-link" href={getLinkMenuNCategory(z,'category')}>
                                                                        <div dangerouslySetInnerHTML={{
                                                                            __html: z.category_title
                                                                        }}/>
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </li>                            
                            )}
                            <div className={`search_wrap`}>
                                <form action="search" method="post" onSubmit={search}>
                                    <div>
                                        <input type="text" autoComplete="off" className="form-control" placeholder={defaultLang.lang.home_search_content} id="txtSearch" name="txtSearch" value={state.txtSearch} onChange={(e)=>setState(state=>({...state, txtSearch:e.target.value}))}/>
                                        <button type="submit" className="search_icon"><i className="ion-ios-search-strong"></i></button>
                                    </div>
                                </form>
                            </div>
                            <li className="li-responsive-user-profile">
                                <div className="d-flex flex-row p-2">
                                    <div>
                                            <a 
                                            // href={routeAll.routesUser.profile.path}
                                            onClick={()=>setGlobal(global=>({...global, sidebarProfile:true}))}
                                            style={{cursor:'pointer'}}
                                        ><span className="nav-link profile-user">
                                            <div className="profile-photo-v2" title={securityData.Security_UserName()}
                                                style={{backgroundImage:`url(${securityData.Security_UserProfilePicture()})`}}>
                                                {notifierStatus.substr(0,1)==='0'? <i className="fa fa-circle" aria-hidden="true"></i>: null}
                                        </div>
                                        </span>
                                        </a>
                                    </div>
                                    <div className="ms-auto nav-lang-v2 header-lang-v2 nav-menu-item pe-4">
                                        <ul className="ul-lang-v2 list-unstyled" style={{cursor:'pointer'}}>
                                            <li id="lang-eng-li">
                                                <a tabIndex="0" id="lang-eng" className=" lang-selector-a" role="button" onClick={changeLang.bind(this,'ENG')}>
                                                    {state.lang==='ENG'?
                                                        <span className="lang-active">ENG</span>
                                                    : 
                                                        <span className="lang-inactive">ENG</span>
                                                    }
                                                </a>
                                            </li>
                                            <li id="lang-separator">
                                                <span className="lang-selector-a">|</span>
                                            </li>
                                            <li id="lang-ind-li">
                                                <a tabIndex="0" id="lang-ind" role="button" className=" lang-selector-a" onClick={changeLang.bind(this,'IND')}>
                                                    {state.lang==='IND'?
                                                        <span className="lang-active">IND</span> 
                                                    : 
                                                        <span className="lang-inactive">IND</span>
                                                    }
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>
        )
    }else{
        return(
            // <header className="header_wrap fixed-top hover_menu_style2" id="header-nav">
            <header className={"header_wrap fixed-top hover_menu_style2 " + addStyle} id="header-nav">
                <style>
                    {
                    `            
                    .hover_menu_style2 .navbar-expand-lg .navbar-nav .skillfuture{
                        padding-top: 14px !important;
                        margin-bottom: 5px !important;
                    }
                    .nav-fixed.hover_menu_style2 .navbar-expand-lg .navbar-nav .skillfuture{
                        padding-top: 9px !important;
                        margin-bottom: 0px !important;
                    }
                    
                    .hover_menu_style2 .navbar-expand-lg .navbar-nav .skillwithsubscribe{
                        padding-top: 14px !important;
                        margin-bottom: 5px !important;
                    }
                    
                    .skillfuture a .logo_default{
                            max-width: 66.412px;
                    }
                    
                    .search-subscribe-without-admin{
                        width: 400px !important;
                    }
                    
                    @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
                        .hover_menu_style2 .navbar-expand-lg .navbar-nav .skillfuture{
                            padding-top: 14px !important;
                            margin-bottom: 10px !important;
                        }
                        .skillfuture a .logo_default{
                            max-width: 66.412px;
                        }
                        .menu-topics-container ul.nav.nav-tabs > li.active{
                            height: 80px;
                        }
                    }
                    
                    @media screen and (min-width:0\0) and (min-resolution: +72dpi) {
                        .hover_menu_style2 .navbar-expand-lg .navbar-nav .skillwithsubscribe{
                            padding-top: 14px !important;
                            margin-bottom: 10px !important;
                        }
                        .skillwithsubscribe a .logo_default{
                            max-width: 66.412px;
                        }
                        .menu-topics-container ul.nav.nav-tabs > li.active{
                            height: 80px;
                        }
                    }
                    
                    .submenu{
                        width: 20%;
                        padding: 15px 30px !important;
                        text-align: left;
                        align-self: center;
                        justify-content: center;
                        display: flex;
                    }
        
                    .langmenu{
                        left:${!isSubscribeSff?`12%`:securityData.Security_IsAdmin()>0?`18%`:`21%`};
                    }
        
                    .platformbutton{
                        padding: 7px 15px 7px !important;
                        background-color: #3159ce !important;
                        font-size: 11px;
                        border: 0;
                        color: #fff;
                        margin-right: 20px;
                        border-radius:25px;
                    }
                    .navbar-collapse{
                        flex-grow:0;
                    }
                    .width-search-subscribe-admin-totalplatform{
                        width:${
                            isAdmin > 0 ?
                                isSubscribeSff?
                                    state.showPlatform?
                                    `400px`
                                    :
                                    `550px`
                                :
                                    state.showPlatform?
                                    `250px`
                                    :
                                    `400px`
                            :
                                isSubscribeSff?
                                    state.showPlatform?
                                    `550px`
                                    :
                                    `650px`
                                :
                                    state.showPlatform?
                                    `350px`
                                    :
                                    `450px`
                        } !important
                    }
                    `
                    }
                </style>
                <div className="new-style-navmenu pt-2 pb-2 ps-0 pe-0">
                    <div className="d-flex flex-row align-items-center">
                        <div className="logo pe-3">
                            <a className="navbar-brand page-scroll" href={routeAll.routesUser.home.path} id="brand-logo">
                                {/* <img className="logo_light" src={env.assets+"img/header_logo_white.svg"} alt="logo" /> */}
                                {/* <img className="logo_powered" src={env.assets+"img/powered-by-fuse.png"} alt="fuse" /> */}
                                <img className="logo-default" src={headerLogo} alt="logo" />
                            </a>
                        </div>
                        <div className="explore pe-3 dropdown">
                            <span style={{cursor:'pointer'}} className="dropdown-toggle nav-link nav-menu-white" onClick={()=>setdropdown(!dropdown)} dangerouslySetInnerHTML={{__html:defaultLang.lang.explore}}></span>
                        </div>
                        <div className="pe-3 search-text">
                            <span className="nav-link nav-menu-white" dangerouslySetInnerHTML={{__html:defaultLang.lang.searchText}}></span>
                        </div>
                        <div className="search-box flex-fill pe-3">
                            {/* <div className={`search_wrap header-search-form-v2 width-search-subscribe-admin-totalplatform-v2`}> */}
                                <form action="search" method="post" onSubmit={search}>
                                    <div className='input-search'>
                                        <input type="text" autoComplete="off" className="form-control" id="txtSearch" name="txtSearch" value={state.txtSearch} onChange={(e)=>setState(state=>({...state, txtSearch:e.target.value}))}/>
                                    </div>
                                </form>
                            {/* </div> */}
                        </div>
                        <div className="subscribe-button pe-2">
                            {!isSubscribeSff?
                                // <li >
                                    <a id="subscribe0" tabIndex="0" role="button" style={{cursor:'pointer'}} onClick={()=>subscribe()} className="btn btn-outline-white btn-header-subscribe">
                                        {defaultLang.lang.header_subscribe}
                                        <i className="ion-ios-email-outline"></i>
                                    </a>
                                // </li>
                            :
                                null
                            }
                        </div>
                        <div className="lang-selector nav-lang-v2 header-lang-v2 nav-menu-item pe-3">
                            <ul className="ul-lang-v2" style={{cursor:'pointer'}}>
                                <li id="lang-eng-li">
                                    <a tabIndex="0" id="lang-eng" className="nav-menu-white lang-selector-a" role="button" onClick={changeLang.bind(this,'ENG')}>
                                        {state.lang==='ENG'?
                                            <span className="lang-active">ENG</span>
                                        : 
                                            <span className="lang-inactive">ENG</span>
                                        }
                                    </a>
                                </li>
                                <li id="lang-separator">
                                    <span className="lang-selector-a">|</span>
                                </li>
                                <li id="lang-ind-li">
                                    <a tabIndex="0" id="lang-ind" role="button" className="nav-menu-white lang-selector-a" onClick={changeLang.bind(this,'IND')}>
                                        {state.lang==='IND'?
                                            <span className="lang-active">IND</span> 
                                        : 
                                            <span className="lang-inactive">IND</span>
                                        }
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="notification-area">
                            <div className="badge-notification">
                                <span id="notifBell" ref={notifBellRef} className="fa-stack" data-count={state.notificationDataUnread.length > 0 ? state.notificationDataUnread.length : null } onClick={() => setShowNotif(!showNotif)}>
                                    {/* <i className="fa fa-bell" id="notif-icon"></i> */}
                                    {/* <svg className="cursor-pointer notif-nav-menu-image" id="notif">
                                        <use xlinkHref={env.assets +'img/notif-icon-bell.svg#Layer_1'}></use>
                                    </svg> */}
                                    <img className="cursor-pointer notif-nav-menu-image" src={env.assets +'img/notif-icon-bell.svg'}/>
                                </span>  
                                <Overlay placement="bottom"
                                    show={showNotif}
                                    target={notifBellRef.current}
                                    style={{marginTop:10}}
                                    rootClose={true}
                                    rootCloseEvent='click'
                                    onHide={() => setShowNotif(false)}
                                    >
                                    {notifPopover}
                                </Overlay> 
                            </div>
                        </div>
                        <div className="profile-picture pe-3">
                            <a 
                                onClick={()=>setGlobal(global=>({...global, sidebarProfile:true}))}
                                style={{cursor:'pointer'}}
                            ><span className="nav-link profile-user">
                                <div className="profile-photo-v2" title={securityData.Security_UserName()}
                                    style={{backgroundImage:`url(${securityData.Security_UserProfilePicture()})`}}>
                                    {notifierStatus.substr(0,1)==='0'? <i className="fa fa-circle" aria-hidden="true"></i>: null}
                            </div>
                            </span>
                            </a>
                        </div>
                        <div className="admin-area nav-admin pe-3" id="admin-nav-icon">
                            {isAdmin>0?
                                <a href={{
                                    [1]:routeAll.routesAdmin.trainingReportTraining.path,
                                    [2]:routeAll.routesAdmin.trainingAdmin.path,
                                    [4]:routeAll.routesAdmin.platform.path
                                }[isAdmin]||routeAll.routesAdmin.users.path}>
                                    <svg className="profile-photo cursor-pointer" id="admin-link">
                                        <use xlinkHref={env.assets+"img/user-cog-solid.svg#user-cog"}></use>
                                    </svg>
                                </a>
                            :
                            null
                            }
                        </div>
                        <div className="platform-area pe-3">
                            {state.showPlatform &&
                                <ButtonToolbar >
                                    <ButtonGroup>
                                        <Button id="subscribe0" tabIndex="0" role="button" style={{cursor:'pointer'}} className="btn btn-outline-white platformbutton" onClick={()=>setGlobal(global=>({...global, showPlatform:true}))}>
                                            <LoadingDataButton loading={global.showPlatform}/> 
                                            <div style={cssTarget(global.showPlatform)}>
                                            { platform_name }
                                            </div>
                                        </Button>
                                        {/* {list_theme.map((list, id)=>
                                            <Button key={id} className={list.lang===platform_lang? "buttonGroupPlatform bolder":"buttonGroupPlatform" } name={list.lang} onClick={handleClickTheme}>{list.lang}</Button>
                                        )} */}
                                    </ButtonGroup>
                                </ButtonToolbar>  
                            }
                        </div>
                    </div>
                </div>
                <Collapse in={dropdown}>
                    <div className="menu-topics-container" id="menuTopics">
                        <ul className="nav nav-tabs nav-topics">
                            {state.sectionList.map((v,idx)=>
                                <li className={state.currentTab===idx?"active submenu":"submenu"} key={idx} onClick={()=>setState(state=>({...state,currentTab:idx,idSection:v.id}))}>
                                    {v.id===7?
                                        <a href={`${routeAll.routeViewAll.page.path}?menu=${state.contentFromYourNetwork}`}>{v.title}</a>
                                    :
                                        <a data-toggle="tab" href="#submenu1">{v.title}</a>
                                    }
                                </li>
                            )}
                        </ul>
                        <div className="tab-content" style={{maxHeight:'50vh', overflow:'auto'}}>
                            <div id="submenu0" className="tab-pane in active show">
                                <div className="row">
                                    {state.menuList.map((v, idx)=>
                                        v.section_id===state.idSection && 
                                        <div className="col-lg-2 col-md-2 menu-topics-lvl-3" key={idx}>
                                            <h4>
                                                <a href=
                                                    { 
                                                        getLinkMenuNCategory(v,'menu')
                                                    }
                                                >
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: v.title
                                                    }}/>
                                                </a>
                                            </h4>
                                            {typePagesPBONDigitalCampus.includes(v.flag_type_page)?null:
                                                <ul>
                                                    {state.categoryList.map((x,idx_category)=>
                                                        x.menu_id===v.id &&
                                                            <div key={idx_category}>
                                                                <li>
                                                                    <a href=
                                                                        { 
                                                                            getLinkMenuNCategory(x,'category')
                                                                        }
                                                                    >
                                                                        {x.category_title}
                                                                    </a>
                                                                </li>
                                                            </div>
                                                            
                                                    )}
                                                </ul>
                                            }
                                        </div>
                                    )}
                                    {/* <div className="col-lg-2 col-md-2 menu-topics-lvl-3">
                                        {state.menuList.map((v, idx_menulist)=>
                                             v.section_id===state.idSection && v.section_id===8 && [34,35,29].includes(v.id) &&
                                             <h4 key={idx_menulist}>
                                                <a href=
                                                    {
                                                        {
                                                            [34]: `https://thrive.pmiapps.biz/thrive/awb/campus`,
                                                            [35]: `https://pmi.fuseuniversal.com/communities/23189`
                                                        }[v.id] ||  `${routeAll.routeViewAll.page.path}?menu=${v.pageId}`
                                                    }
                                                >
                                                    <div dangerouslySetInnerHTML={{
                                                        __html: v.title
                                                    }}/>
                                                </a>
                                            </h4>
                                        )}
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </Collapse>
            </header>
        
            )
    }


}

export default NavMenu;