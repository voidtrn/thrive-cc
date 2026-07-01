import React, { useContext, useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useHistory } from '../../../helpers/useHistory';
import { cssTarget, LoadingData } from '../../../components/Loading';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env, securityData } from '../../../helpers/globalHelper';
import GlobalState from '../../../helpers/globalState';
import defaultLang from '../../../helpers/lang';
import routeAll from '../../../helpers/route';

import _ from 'lodash';

function ViewCourseDetail(props){
    const history = useHistory()
    const [state, setState] = useState({
        param:axiosLibrary.getParamString(props.location.search),
        userDocument:env.userDocument,
        // userDocument:env.oldUserDocument,
        listCategory: [
            {type:1,text:"Short Course", btnId:"short_course",active:true},
            {type:2,text:"Executive Education", btnId:"executive_education",active:false},
            {type:3,text:"Certification", btnId:"certification",active:false},
            {type:0,text:"#AWB Online Content", btnId:"awb_online_content",active:false},
        ],
        rsSidebarTopicList:[],
        platformId: securityData.Security_getPlatformId(),
        modalProp:{
            modalShow:false,
            id:null,
        },
        sortData:1,
        courseList:[],
        sortedCourse:[],
        loading:true,
        tabMenuTypeActive:1,
        scrollLeftArrowMenuSpecial:true,
        scrollRightArrowMenuSpecial:false
    })

    const [global, setGlobal] = useContext(GlobalState)

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getCategory()
            getCourseList()
        }
    },[state.param, props.location.search, state.tabMenuTypeActive, global.modalProp.loadContent])

    useEffect(()=>{
        if(state.modalProp){
            const modalProp = state.modalProp
            setGlobal(global => ({...global,  modalProp}))
        }
    },[state.modalProp])

    useEffect(()=>{
        if(state.sortData){
            let timer = setTimeout(()=>sorting(),1000)
            return () => {
                clearTimeout(timer)
            }
        }
    },[state.sortData, state.courseList])

    const getCourseList = async ()=>{
        setState(state =>({...state, loading:true}))
        if(state.param && state.param.course){
            //select course by id
            
        }
        let param = {
            platform_id: state.platformId,
            course_type: state.tabMenuTypeActive
        }

        if(state.param){
            param = {...param,md5id:state.param.category}
        }
        if(state.param && state.param.course){
            //select course by id
            param = {...param,course:state.param.course}
        }

        let response = await axiosLibrary.postData('awbViewCourse/ListCourse',param)
        if(response.status===200){
            setState(state=>({...state, courseList:response.data.data}))
            props.loading(false)
            if(state.param && state.param.course){
                //select course by id
                const valueTabMenu = response.data.data[0].course_type
                changeTab(valueTabMenu)

            }
        }
    }

    const changeTab = (value)=>{
        const getIndexOldTab = state.listCategory.findIndex(v=>v.active===true)
        state.listCategory[getIndexOldTab].active = false
        const getIndexCurrentTab = state.listCategory.findIndex(v=>v.type==value)
        state.listCategory[getIndexCurrentTab].active = true
        setState(state=>({...state, tabMenuTypeActive: state.listCategory[getIndexCurrentTab].type}))
    }

    const getCategory = async ()=>{
        let response = await axiosLibrary.postData('awbViewCourse/getCategory',{platform_id:state.platformId})
        if(response.status===200){
            let anotherTopic = []
            let titleCategory = []
            if(state.param){
                anotherTopic = response.data.data.filter(v=>v.pageId!=state.param.category)
                titleCategory = response.data.data.filter(v=>v.pageId===state.param.category)
                if(titleCategory.length <=0){
                    anotherTopic = response.data.data
                    titleCategory = [{title:''}]
                }
            }else{
                anotherTopic = response.data.data
                titleCategory = [{title:''}]
            }
            setState(currentState=>({...currentState, rsSidebarTopicList:anotherTopic, titleCategory: titleCategory[0].title}))
        }
    }

    const sorting = ()=>{
        if(state.sortData){

            let tempCourseList = state.courseList
            switch (state.sortData) {
                case "1":
                    tempCourseList = tempCourseList.sort((a,b)=>b.id - a.id);
                    break;
                case "2":
                    var emptyList = tempCourseList.filter(w => w.price_type == "")
                    emptyList = emptyList.sort((a,b)=> a.price_amt - b.price_amt)
    
                    var nullList = tempCourseList.filter(w => w.price_type == null)
                    nullList = nullList.sort((a,b)=> a.price_amt - b.price_amt)
    
                    var idrList = tempCourseList.filter(w => w.price_type == 'IDR')
                    idrList = idrList.sort((a,b)=> a.price_amt - b.price_amt)
    
                    var usdList = tempCourseList.filter(w => w.price_type == 'USD')
                    usdList = usdList.sort((a,b)=> a.price_amt - b.price_amt)
    
                    var eurList = tempCourseList.filter(w => w.price_type == 'EUR')
                    eurList = eurList.sort((a,b)=> a.price_amt - b.price_amt)
    
                    var audList = tempCourseList.filter(w => w.price_type == 'AUD')
                    audList = audList.sort((a,b)=> a.price_amt - b.price_amt)
    
                    tempCourseList = [...emptyList, ...nullList, ...idrList, ...audList,  ...usdList, ...eurList]
                    break;
                case "3":
                    tempCourseList = tempCourseList.sort((a,b)=>a.duration_amt - b.duration_amt);
                    break;
                case "4":
                    tempCourseList = _.sortBy(tempCourseList, ['enroll_from']);
                    break;
                case "5":
                    tempCourseList = tempCourseList.sort((a,b)=> a.language_avail - b.language_avail);
                    break;
                case "6":
                    tempCourseList = _.orderBy(tempCourseList, ['date_created'], ['desc']);
                    break;
                default:
                    tempCourseList = tempCourseList.sort((a,b)=>b.id - a.id);
                    break;
            }
            setState(state=>({...state, sortedCourse:tempCourseList, loading:false, totalSearch:tempCourseList.length}))
        }
    }

    const changeCategory = (param) => {
        const search = "?" + new URLSearchParams({category: param}).toString()
        history.push({
            pathname: routeAll.routesUser.viewcourseDetail.path,
            search: search// your data array of objects
        })
        setState(currentState=>({...currentState, param:axiosLibrary.getParamString(search)}))
    }

    const scrollableElement = useRef(null);

    const handleScroll = () => {
        const { scrollLeft, scrollWidth } = scrollableElement.current;
        const atStart = scrollLeft === 0;
        const atEnd = scrollLeft > scrollWidth - window.innerWidth;

        setState(state => ({ ...state, scrollLeftArrowMenuSpecial:atStart, scrollRightArrowMenuSpecial:atEnd }))
    };

    const tabMenuSff = () => {
        return(
            <>
                <div className="row mb-4" >
                    <div className="col-md-3">
                        &nbsp;
                    </div>
                    <div className="col-md-9">
                        <h3 className="header-category">{state.titleCategory}</h3>
                        <div className="container" style={{borderBottom:'1px solid #3356d4'}}>
                            {isMobile &&
                                <>
                                    <div className={`slider-card-button-nav-prev slider-card-button-nav ${state.scrollLeftArrowMenuSpecial && `d-none-mobile`}`}>
                                        <i className="fa fa-chevron-left" aria-hidden="true"></i>
                                    </div>

                                    <div  className={`slider-card-button-nav-next slider-card-button-nav ${state.scrollRightArrowMenuSpecial && `d-none-mobile`}`}>
                                        <i className="fa fa-chevron-right" aria-hidden="true"></i>
                                    </div>
                                </>
                                
                             }
                            <div className="wrapper profile-wrapper" ref={scrollableElement} onScroll={handleScroll}>
                                <ul className="nav nav-tabs profile-tabs list " id="category-tab" role="tablist">
                                    {
                                        state.listCategory.map((item,id)=>
                                            <li className={item.active?'active show':''} key={id}>
                                                <a onClick={()=>changeTab(item.type)} id={item.btnId} data-type={item.type} >{item.text}</a>
                                            </li>
                                        )
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-3 d-none-mobile">
                        &nbsp;
                    </div>
                    <div className="col-md-9">
                        <div className="row">
                            <div className="col-md-8">
                                <label htmlFor="sortData" className="label_select_sort_data">{defaultLang.lang.sort_by}</label>
                                <div className="select_sort_data">
                                    <select className="form-control select-filter" name="sortData" onChange={(e)=>setState(state =>({...state, sortData:e.target.value, loading:true}))} value={state.sortData}>
                                            <option value={1}>DEFAULT SORTING</option>
                                            <option value={2}>PRICE</option>
                                            <option value={3}>ESTIMATE COMPLETION</option>
                                            <option value={4}>START DATE</option>
                                            <option value={5}>LANGUAGE</option>
                                            <option value={6}>NEWEST</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div style={cssTarget(state.loading)}>
                                    {!state.loading &&
                                        <span className="search_info" >
                                            {state.totalSearch > 0 ? 
                                            `${state.totalSearch} ${defaultLang.lang.search_content_article_found}`
                                            :
                                            defaultLang.lang.search_content_article_not_found
                                            }
                                        </span>
                                    }
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return(
        <>
            <style>
                {
                    `
                    .header-category {
                        color: #3255d5;
                    }
                    .btn_title_sff{
                        color:#fff;
                    }
                    
                    .select_sort_data{
                        width: 250px;
                        display: inline-block;
                    }
                    .label_select_sort_data{
                        color: #000000;
                    }
                    .anotherListCategory{
                        cursor:pointer
                    }
                    .anotherListCategory:hover{
                        text-decoration: underline;
                    }
                    .select-filter{
                        background-color: #e6e6e6;
                        font-family: 'poppinsmedium', sans-serif;
                        color: #4d4d4d;
                        font-size: 13px;
                        margin-left: 5px;
                    }
                    
                    .select-filter option{
                        background-color: #e6e6e6;
                        font-family: 'poppinsmedium', sans-serif;
                        color: #4d4d4d;
                    }
                    span.search_info {
                        font-family: 'poppinsmedium', sans-serif;
                        font-size: 14px;
                        float: right;
                        margin-top: 10px;
                    }
                    .list-group-item.active{
                        color: #3255d6;
                        background-color:#fff;  
                        border-color:none;
                    }
                    .list-group-item {
                        font-family: 'poppinsmedium', sans-serif;
                        font-size: 14px;
                        border: 0;
                        padding: 3px 5px;
                        border: 0;
                        color: #888888;
                    }
                    
                    a.list-group-item.sub-menu {
                        margin-left: 25px;
                    }
                    
                    .panel-heading {
                        color: #000000;
                        border-bottom: 1px solid #e6e6e6;
                        margin-bottom: 10px;
                        font-size: 16px;
                        font-family: 'poppinsmedium', sans-serif;
                        padding-left:3px;
                    }
                    .div-list-course .col-md-4{
                        padding: 7px 5px;
                        cursor: pointer;
                    }
                    
                    .div-list-course {
                        margin: 0 auto;
                    }
                    
                    .div-list-course .col-md-6{
                        padding: 7px 5px;
                        cursor: pointer;
                    }
                    
                    .team_title{
                        padding: 15px 25px;
                        font-size: 14px;
                    }
                    
                    .team_img img {
                        height: 200px;
                    }
                
                    .lang_avail {
                        max-width: 40%;
                        max-height: 20%;
                    }
                
                    #course {
                        height: 100%;
                    }
                
                    #courseImg img {
                        height: 200px !important;
                        /*
                        width: 100% !important;
                        max-height: 100%;
                        */
                    }
                    
                        
                    .team_course img {
                        width: 100%;
                        transition: all 0.5s ease-in-out;
                    }
                    
                    .team_box:hover .team_course{
                        height:180px;
                        border-radius: 5px 5px 0 0;
                    
                    }
                    
                    .team_course {
                        height:200px;
                    }
                    
                    
                    .team_course img{
                        height:200px;
                        border-radius: 5px 5px 0 0;
                    }
                    
                    .team_hover_style1 .team_course,
                    .team_hover_style2 .team_course {
                        position:relative;
                    }
                    
                    .team_hover_style1 .team_course::before,
                    .team_hover_style2 .team_course::before {
                        content: "";
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        opacity: 0;
                        transition: all 0.5s ease-in-out;
                        z-index: 1;
                    }
                    
                    .team_hover_style1.team_box:hover .team_course::before,
                    .team_hover_style2.team_box:hover .team_course::before {
                        opacity: 1;
                    }
                    
                    .team_hover_style2.team_box .team_course {
                        overflow: hidden;
                    }
                    .team_hover_style2.team_box:hover .team_course img {
                        -moz-transform: scale(1.2);
                        -webkit-transform: scale(1.2);
                        transform: scale(1.2);
                    }
                    #underButton{
                        position: absolute;
                        bottom: 15px;
                        left: 0;
                        width: 300px;
                        height: 22px;
                        /*border: 3px solid #73AD21;*/
                        font-size: 13px;
                        font-style: italic;
                        padding-left: 25px;
                        text-align: left;
                    }
                    .provdescr{
                        height: 200px !important;
                    }
                    
                    .flag{
                        width: 100% !important;
                        height: 120px !important;
                    }
                    #btnSave {
                        position: relative;
                        /* margin-top: 30px; */
                        /* width: 400px; */
                        height: 50px;
                        /*border: 3px solid #73AD21;*/
                        top: 10%;
                    }
                    #btnSubmit{
                        color: #fff;
                        background: #411ada;
                        padding: 10px 30px;
                        -webkit-border-radius: 25px;
                        -moz-border-radius: 25px;
                        border-radius: 25px;
                        padding: 4px 30px;
                        font-size: 12px;
                        /* position: absolute; */
                        left: 30px;
                        font-family: 'poppinssemibold';
                        text-transform: none;
                    }
                    
                    #btnClose {
                        color: #fff;
                        background: #411ada;
                        padding: 10px 30px;
                        -webkit-border-radius: 25px;
                        -moz-border-radius: 25px;
                        border-radius: 25px;
                        padding: 4px 30px;
                        font-size: 12px;
                        /* position: absolute; */
                        bottom: 112px;
                        left: 120px;
                        font-family: 'poppinssemibold';
                        text-transform: none;
                    }
                    .btn-outline-black {
                        color: #000 !important;
                        background-color: #fff !important;
                    }
                    @media only screen and (max-width: 767px){
                        .wrapper.profile-wrapper{
                            overflow-x:auto;
                        }
                        ul.nav.nav-tabs{
                            display: block;
                            min-width: max-content;
                        }
                        .col, .col-1, .col-10, .col-11, .col-12, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-auto, .col-lg, .col-lg-1, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-auto, .col-md, .col-md-1, .col-md-10, .col-md-11, .col-md-12, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-auto, .col-sm, .col-sm-1, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-auto, .col-xl, .col-xl-1, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-auto{
                            padding-right: 15px;
                        }
                        span.search_info {
                            float: left;
                            margin-top: 20px;
                            margin-left: 5px;
                        }
                        .section-view-all {
                            margin-top: 15%;
                        }

                        .d-none-mobile{
                            display: none;
                        }
                        .newsletter_form .btn{
                            top: 150%;
                        }
                        .slider-card-button-nav{
                            position: absolute;
                            bottom: 13px;
                        }
                        .slider-card-button-nav-prev{
                            left: 15px;
                        }
                        .slider-card-button-nav-next{
                            right: 15px;
                        }
                        .anotherListCategory{
                            text-align:center;
                        }
                    }
                    `
                }
            </style>
            <section id="function" className="section-view-all" >
                <div className="container containter-view-all">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tab-style4">
                                {!isMobile && tabMenuSff()}
                                <div className="row">
                                    <div className="col-md-3">
                                        <div id="admin-menu" className="panel panel-default">
                                            <div className="panel-heading">{defaultLang.lang.sff_another_topic}</div>
                                            <div className="list-group">
                                                {state.rsSidebarTopicList.map((v,idx)=>
                                                    <a className="list-group-item" tabIndex="0" role="button" key={idx} onClick={()=>changeCategory(v.pageId)} style={{cursor:'pointer'}}>
                                                        <span>{v.title}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-9">
                                    {isMobile && tabMenuSff()}
                                        <div className="tab-content">
                                            <div className="tab-pane fade show active" >
                                                <LoadingData loading={state.loading}/>
                                                <div className="row div-list-course" id="listCourse" style={cssTarget(state.loading)}>
                                                    {/* list article sff in here */}
                                                    <GlobalState.Provider value={[state,setState]}>
                                                        {
                                                            <RenderCourseList {...props} thisStateGlobal={global}/>
                                                        }
                                                    </GlobalState.Provider>
                                                </div>                         
                                            </div>
                                        </div>
                                        <div className="container submit-your-idea-containter">
                                            <div className="row align-items-center submit-your-idea">
                                                <div className="col-lg-12 col-md-12 col-sm-12" style={{padding:'5px'}}> 
                                                    <div className="mb-12 mb-lg-0">   
                                                        <h4 className="header-category">{defaultLang.lang.sff_find_another_course}</h4>

                                                        <div className="d-flex flex-row font-weight-bold" id="anotherCategory">
                                                            {
                                                                state.listCategory.filter(w => !w.active).map((item,id)=>
                                                                    <div className="flex-fill anotherListCategory" data-type={item.type} onClick={()=>changeTab(item.type)} key={id}>
                                                                        {item.text}
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
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

function RenderCourseList(props){
    const [state, setState] = useContext(GlobalState)

    const onClickEvent = async (type, param, course_type)=>{
        switch (type) {
            case 'shareCourse':
                setState(state=>({...state,modalProp:{modalShow:true, id:param.id, type:'course'},flagShowArticle:true}))
                break;
            case 'logActivityArticle':
                if(course_type===0){
                    if(!state.flagShowArticle){
                        let isi = await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                        if(isi){
                            if(isi.status===200){
                                setState(state=>({...state,modalProp:{modalShow:false, id:null, loadContent: true}}))
                            }
                        }
                    }
                    window.open(param.hyperlink_url,'_blank', 'noopener noreferrer')
                }
                break;
            default:
                break;
        }
    }

    return(
        <>
        <style>
            {`
                @media only screen and (max-width: 767px){
                    .team_title {
                        height: max-content;
                    }
                    .provdescr {
                        height: max-content !important;
                    }
                    .flag {
                        height: max-content !important;
                        padding-bottom: 70px;
                    }
                    .lang_avail {
                        max-width: 12%;
                    }
                    #btnSave {
                        height: auto;
                        top: unset;
                        bottom: 60px;
                    }
                }
            `}
        </style>
        {state.sortedCourse.map((v,idx)=>
            <div className="col-md-6 item " key={idx}>
                {/* {v.course_type===0
                    && */}
                <object>
                    <a tabIndex="0" role="button" onClick={()=>onClickEvent('shareCourse',{content:'Course',articleId: v.id, id:v.id})} className="share-article">
                        <i className="ion-share"></i>
                    </a>
                </object>
                {/* } */}
                
                    <div className="team_box white_bg team_hover_style2 social_white" id="course" onClick={()=>onClickEvent('logActivityArticle',{content:'Skills for future',articleId: v.id,id:v.id,hyperlink_url:v.hyperlink_url},v.course_type)}>
                        <div className="team_course">
                            <img src={`${state.userDocument}course/${v.course_image}`} alt={v.course_image}/>
                        </div>
                        <div className="team_title">
                            <h5>
                                {securityData.Security_lang()==='ENG'? v.title:v.title_ind}
                            </h5>
                            <span className="provdescr">
                                <b>
                                    {v.provider}
                                </b>                                        
                                <br/>
                                {securityData.Security_lang()==='ENG'? v.description:v.description_ind}
                            </span>
                            <br/>
                            <br/>
                            <span className="flag">
                                    {{
                                        "0": <img className="lang_avail" src={env.assets+"img/flag_idn.png"} />,
                                        "1": <img className="lang_avail" src={env.assets+"img/flag_uk.png"} />,
                                        "2": <>
                                            <img className="lang_avail" src={env.assets+"img/flag_idn.png"} />&nbsp;
                                            <img className="lang_avail" src={env.assets+"img/flag_uk.png"} />
                                        </>
                                    }[v.language_avail]}
                                <br/>
                                    {v.price_amt==0||v.price_amt==null?
                                        <>FREE</>
                                    :
                                        `${v.price_type} ${v.price_amt}`
                                    }
                                <br/>
                                    {
                                        v.duration_amt==null || v.duration_amt==""||v.duration_amt==0?
                                        null
                                        :
                                        <> Estimate completion&nbsp; 
                                        {v.months>0 && `${v.months} month${v.months>1 ? `s `:` ` }` }
                                        {v.weeks>0 && `${v.weeks} week${v.weeks>1 ? `s `:` `}` }
                                        {v.days>0 && `${v.days} day${v.days>1 ? `s `:` `}` }
                                        {v.hours>0 && `${v.hours} hour${v.hours>1 ? `s `:` `}` }
                                        {v.minutes>0 && `${v.minutes} minute${v.minutes>1 ? `s `:` `}` }
                                        </>
                                    }
                            </span>
                        </div>
                        {v.course_type != 0 &&
                            <div id="btnSave" className="text-center" >
                                {v.flag_registered == 0 ?
                                    <button 
                                        type="submit" 
                                        className="btn btn-outline-black btn-view-more" 
                                        onClick={()=>setState(state=>({...state,modalProp:{modalShow:true, id:v.id, type: 'registerCourse',ref:state.param.ref||''}}))} 
                                        disabled={props.thisStateGlobal.activePeriod == null ? true:false}
                                        
                                    >
                                    {props.thisStateGlobal.activePeriod == null ? "Enrollment Closed" : "Register"}
                                </button>
                                :
                                    <button 
                                        type="submit" 
                                        className="btn btn-outline-black btn-view-more" 
                                        disabled 
                                    >
                                        {
                                        v.flag_claim ==1 
                                            ? defaultLang.lang.courseClaim 
                                            : 
                                            v.flag_active == 0 
                                            ? defaultLang.lang.workShopTxtRejected 
                                            :   v.flag_active == 2 
                                                ? defaultLang.lang.workShopTxtProcessApproval 
                                                : defaultLang.lang.workShopTxtRegistered
                                        }
                                    </button>
                                }
                            </div>
                        }
                        <h4 id="underButton">{v.category_title}</h4>    
                    </div>
                {/* </a> */}
            </div>
        )}
        </>
    )
}


export default ViewCourseDetail;
export {RenderCourseList};