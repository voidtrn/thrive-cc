import React, { useContext, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import GlobalState from '../../helpers/globalState';
import routeAll from '../../helpers/route';
import defaultLang from '../../helpers/lang';
import { cssTarget, LoadingData } from '../../components/Loading';
import { Form } from 'react-bootstrap';

const srcError = 'https://thrive.pmiapps.biz/thrive/awb/_user_document/'

const routeViewAll = routeAll.routeViewAll;

function SearchArticle(props){
    const [state, setState] = useState({
        assets: env.assets,
        userDocument: env.userDocument,
        // userDocument: srcError,
        articleList:[],
        refineBy:[],
        rsSidebarMenuList:[
            {id:1,title:'Please Wait...', show_submenu:1, controller:'None'}
        ],
        rsSidebarSubMenuList:[
            {id:1,title:'Please Wait...',controller:'NoneSubmenu'},
        ],
        rsSidebarCategory4List:[
            {category_4:'Please Wait...'},

        ],
        showSearchResult:1,
        searchKeyword:localStorage.getItem('searchData')||'',
        loading:true,
        modalProp:{
            modalShow:false,
            id:null,
        },
        flagShowArticle: false,
        messageSubmitIdea: "",
        sortData:1,
        raIqosQuiz:[],
        showIqosPage: false,
    })

    // eslint-disable-next-line
    const [global,setGlobal] = useContext(GlobalState)

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getArticle()
            getSidebarMenu()    
        }
    },[])

    useEffect(()=>{
        if(state.modalProp){
            const modalProp = state.modalProp
            setGlobal(global => ({...global,  modalProp}))
        }
    },[state.modalProp])

    useEffect(()=>{
        if(state.modalProp.loadContent){
            getArticle()
        }
    },[state.modalProp])

    useEffect(()=>{
        getArticle()
    },[state.sortData, state.refineBy])

    const getArticle = async () => {
        setState(state =>({...state, loading:true}))

        const paramGetArticle = {
            platform_id:securityData.Security_getPlatformId(),
            user_id:securityData.Security_UserId(),
            sortBy: state.sortData,
            filter_search: state.searchKeyword,
            category4: JSON.stringify(state.refineBy),
            lang:securityData.Security_lang()
        }

        let response = await axiosLibrary.postData('awbHome/ListArticleByMenuId',paramGetArticle);
        if(response.status===200){
            setState(state =>({...state, articleList:response.data.data, totalSearch:response.data.data.length, loading:false}))
            props.loading(false)
        }
    }

    const getSidebarMenu = async () => {
        const param = {
            platform_id: securityData.Security_getPlatformId(),
        }
        let isi = await axiosLibrary.postData('awbHome/rsSidebarMenuSearchList',param);
        if(isi.status===200){
            if(isi.data.data.length > 0){
                const paramGetRefineBy = {
                    platform_id: securityData.Security_getPlatformId(),
                }
                let responseRefineBy = await axiosLibrary.postData('awbHome/rsSidebarCategory4List',paramGetRefineBy);
                if(responseRefineBy.status===200){
                    setState(state =>({...state, 
                        rsSidebarMenuList:isi.data.data, 
                        rsSidebarCategory4List: state.totalSearch>0 ? responseRefineBy.data.data: [],
                        checkedRefineBy: state.totalSearch>0 ? new Array(responseRefineBy.data.data.length).fill(false):[]
                    }))
                }
            }
        }
    }

    const onClickEvent = async (type, param)=>{
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

    const sorting = (e)=>{
        setState(state =>({...state, sortData:e.target.value}))
    }

    const filterData = (category_4) => {
        let isi = []
        if(state.refineBy.includes(category_4)){
            isi = state.refineBy.filter(v=>v!==category_4)
        }else{
            isi = [...state.refineBy,category_4]
        }

        setState(state=>({...state,refineBy:isi}))
    }

    return(
    <>
        <style>
                {
                    `
                    .tab-style4 .nav-tabs .nav-link.active {
                        border-bottom-color: transparent;
                        color: #000000;
                    }
                    
                    .div-list-article {
                        margin: 0 auto;
                    }
                    
                    .div-list-article .col-md-4 {
                        padding: 7px 5px;
                        cursor: pointer;
                    }
                    
                    .team_title {
                        padding: 15px 25px;
                    }
                    
                    .team_img img {
                        height: 200px;
                    }
                    
                    .search-container {
                        max-width: 1080px !important;
                        margin: 50px auto 60px;
                    }
                    
                    .row.justify-content-center {
                        padding: 80px 0 70px;
                    }
                    
                    span.search_info {
                        font-family: "poppinsmedium", sans-serif;
                        font-size: 14px;
                        float: right;
                        margin-top: 10px;
                    }
                    
                    .select-filter {
                        background-color: #e6e6e6;
                        font-family: "poppinsmedium", sans-serif;
                        color: #4d4d4d;
                        font-size: 13px;
                        margin-left: 5px;
                    }
                    
                    .select-filter option {
                        background-color: #e6e6e6;
                        font-family: "poppinsmedium", sans-serif;
                        color: #4d4d4d;
                    }
                    
                    .list-group-item.active {
                        color: #3255d6;
                        background-color: #fff;
                        border-color: none;
                    }
                    .list-group-item {
                        font-family: "poppinsmedium", sans-serif;
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
                        font-family: "poppinsmedium", sans-serif;
                        padding-left: 3px;
                    }
                    
                    .search-result {
                        padding: 30px 5px 80px;
                    }
                    
                    .checkbox {
                        padding-left: 10px;
                    }
                    .checkbox label {
                        display: inline-block;
                        position: relative;
                        padding-left: 5px;
                        margin: 0;
                        display: inline-block;
                        font-family: "poppinsmedium", sans-serif;
                        font-size: 12px;
                        border: 0;
                        padding: 0;
                        border: 0;
                        color: #888888;
                    }
                    .checkbox label::before {
                        content: "";
                        display: inline-block;
                        position: absolute;
                        width: 17px;
                        height: 17px;
                        left: 0;
                        margin-left: -22px;
                        border: 1px solid #5d8ec9;
                        border-radius: 3px;
                        background-color: #fff;
                        -webkit-transition: border 0.15s ease-in-out, color 0.15s ease-in-out;
                        -o-transition: border 0.15s ease-in-out, color 0.15s ease-in-out;
                        transition: border 0.15s ease-in-out, color 0.15s ease-in-out;
                    }
                    .checkbox label::after {
                        display: inline-block;
                        position: absolute;
                        width: 16px;
                        height: 16px;
                        left: 0;
                        top: 0;
                        margin-left: -22px;
                        padding-left: 3px;
                        padding-top: 1px;
                        font-size: 11px;
                        color: #555555;
                    }
                    
                    .checkbox input[type="checkbox"] {
                        opacity: 0;
                    }
                    .checkbox input[type="checkbox"]:focus + label::before {
                        outline: thin dotted;
                        outline: 5px auto -webkit-focus-ring-color;
                        outline-offset: -2px;
                    }
                    .checkbox input[type="checkbox"]:checked + label::before {
                        font-family: "FontAwesome";
                        content: "\f00c";
                    }
                    .checkbox input[type="checkbox"]:disabled + label {
                        opacity: 0.65;
                    }
                    .checkbox input[type="checkbox"]:disabled + label::before {
                        background-color: #eeeeee;
                        cursor: not-allowed;
                    }
                    .checkbox.checkbox-circle label::before {
                        border-radius: 50%;
                    }
                    ${state.showIqosPage?
                        `
                        .iqos-top-banner {
                            background-size: cover;
                            background-position: center;
                            height: 400px;
                            display: block;
                            position: relative;
                            top: -12px;
                        }
                        
                        .iqos-top-quiz {
                            background-size: cover;
                            background-position: center;
                            height: 250px;
                            display: block;
                            position: relative;
                            top: -5px;
                            cursor: pointer;
                        }
                        
                        section#function {
                            padding: 30px 0;
                        }
                        `
                        :
                        ``}
                    .owl-carousel{
                    margin-top:20px;
                    }
                    
                        
                    .item-owl-carousel{
                    opacity:0.4;
                    transition:.4s ease all;
                    #margin:0 5px;
                    transform:scale(.9);
                    }
                    
                    
                    .active .item-owl-carousel{
                        opacity:1;
                        transform:scale(1);
                    } 
                    
                    
                    .owl-item {
                        -webkit-backface-visibility: hidden;
                        -webkit-transform: translateZ(0) scale(1.0, 1.0);
                    }
                    
                    .inner{
                            position:absolute;;
                        }
                    .inner a{
                            font-size:20px;color:#fff; font-weight:bold;text-decoration:none; transition:.3s ease border-color
                        }
                    .inner #inner-p{
                            font-size:14px;color:#fff; text-decoration:none; transition:.3s ease border-color
                        }
                    
                    .owl-carousel:after{content:""; display:block; position:absolute; width:8%; top:0; bottom:0; left:50%; margin-left:-4%; pointer-events: none; 
                    
                    }
                    
                    .owl-controls{position:absolute; margin-top:300px;}
                    
                    .next-nav{
                        box-shadow: 0 0 3px rgb(0 0 0 / 15%);
                        color: #5b9ecd;
                        font-size: 30px;
                        padding: 5px 20px 2px 20px;
                        background: #fff;
                        border-radius: 50%;
                        position: absolute !important;
                        top: 40% !important;
                        transform: translateY(-50%);
                        right: 0%;
                    }

                    .prev-nav{
                        box-shadow: 0 0 3px rgb(0 0 0 / 15%);
                        color: #5b9ecd;
                        font-size: 30px;
                        padding: 5px 20px 2px 20px;
                        background: #fff;
                        border-radius: 50%;
                        position: absolute !important;
                        top: 40% !important;
                        transform: translateY(-50%);
                    }
                    .slick-slide{
                        padding: 4rem 4rem 2rem 4rem;
                    }
                    
                    .your-class img{
                        opacity: 0.4;
                        transition: all 300ms ease;
                        width: 100%;
                    }
                    
                    .your-class .slick-center img{
                        /* padding: 1rem; */
                        -webkit-transform: scale(1.2);
                        opacity: 1;
                        transform: scale(1.2);
                    }
                    `
                }
            </style>
            {{
                [true]:
                <>
                    <a href={state.configBannerUrl!=''?state.configBannerUrl:'#'} target="_blank" rel="noreferrer">
                        <div  className="iqos-top-banner" style={{backgroundSize:'cover',backgroundPosition:'center',backgroundImage:`url(${state.userDocument}iqos/banner-top.png)`}} data-img-src={`${state.userDocument}iqos/banner-top.png`}>
                        </div>
                    </a>
                    <a id="aHrefLoadIqosQuiz" 
                        onClick={()=>onClickEvent('loadIqosQuiz',{allowJoin:state.raIqosQuiz.total_user_answer <=0?1:0,content:'Beliver`s Quiz',articleId: state.raIqosQuiz.article_id,id:state.raIqosQuiz.id})}
                        target="_blank" rel="noreferrer"
                    >
                        <div className="iqos-top-quiz" style={{backgroundImage:`url(${state.userDocument}iqos/banner-quiz.png)`}} data-img-src={`${state.userDocument}iqos/banner-quiz.png`}></div>
                    </a>
                </>
            }[state.showIqosPage]
            }

        <section id="function" className="section-view-all" >
            <div className="container containter-view-all">
                <div className="row">
                    <div className="col-md-12">
                        <div className="tab-style4">
                            <div className="row">
                                <div className="col-md-3">
                                    &nbsp;
                                </div>
                                <div className="col-md-9">
                                {
                                    state.showSearchResult && <h3 className="section-title search-result">Showing result for: {state.searchKeyword}</h3>
                                }
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div style={{maxWidth:"250px"}}>
                                                <select className="form-control select-filter" name="sortData" onChange={sorting} value={state.sortData}>
                                                    <option value={1}>DEFAULT SORTING</option>
                                                    <option value={2}>SORT A - Z</option>
                                                    <option value={3}>SORT Z - A</option>
                                                    <option value={4}>MOST POPULAR</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div>
                                                <span className="search_info">
                                                    {state.totalSearch > 0 ? 
                                                    `${state.totalSearch} ${defaultLang.lang.search_content_article_found}`
                                                    :
                                                    defaultLang.lang.search_content_article_not_found
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3">
                                    <br/>
                                    <div id="admin-menu" className="panel panel-default">
                                        {location.pathname===routeViewAll.specialPage.path?null:
                                            <>
                                                <div className="panel-heading">Category</div>
                                                <div className="list-group">
                                                    {state.rsSidebarMenuList.map((v,idx)=>
                                                        <div className="" key={idx}>
                                                            <a className="list-group-item" href={`${routeViewAll.section.path}?section=${v.md5id}`}>
                                                                <span>{v.title}</span>
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        }

                                        <div className="panel-heading" style={{paddingTop:'30px'}}>Refine by</div>
                                        <div className="list-group pl-2" >
                                            {state.rsSidebarCategory4List.map((v,idx)=>
                                                <Form.Check
                                                    type={'checkbox'}
                                                    id={`checkbox${idx}`}
                                                    label={v.category_4}
                                                    key={idx}
                                                    className="checkbox-circle"
                                                    onChange={()=>filterData(v.category_4)}
                                                />
                                            )}
                                            
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-9" >
                                    <LoadingData loading={state.loading}/>
                                    <div className="tab-content" style={cssTarget(state.loading)}>
                                        <div className="tab-pane fade show active" id="function-tab1" role="tabpanel" aria-labelledby="home-tab1">
                                            <div className="row div-list-article">
                                                {/* foreach article list */}
                                                {state.articleList.map((v,idx)=>
                                                    <div className="col-md-4 item " key={idx}>
                                                        <object>
                                                            <a tabIndex="0" role="button" onClick={()=>onClickEvent('shareArticle',{content:'Article',articleId: v.article_id,id:v.id})} 
                                                            className="share-article"><i className="ion-share"></i>
                                                            </a>
                                                        </object>
                                                        <a onClick={
                                                            v.show_quiz==1?
                                                            ()=>onClickEvent('loadArticleQuiz',{content:'Article',articleId: v.article_id,id:v.id})
                                                            :
                                                            ()=>onClickEvent('logActivityArticle',{content:'Article',articleId: v.article_id,id:v.id,hyperlink_url:v.hyperlink_url})
                                                            } 
                                                            tabIndex="0" role="button"
                                                        >
                                                            <div className={`team_box white_bg team_hover_style2 social_white ${v.flag_read==1?`disabled-article`:``}`}>
                                                                {v.flag_quiz==1?
                                                                    <img className='poin-flag' src={`${state.assets}img/poin${v.show_quiz==0?`-grayscale`:``}.png`}/>
                                                                :
                                                                    null
                                                                }
                                                                <div className="team_img">
                                                                    <img src={`${state.userDocument}article/${v.article_image}`} alt={v.article_image} onError={(e)=>e.target.src = `${srcError}article/${v.article_image}`}/>
                                                                </div>
                                                                <div className="team_title">
                                                                    <h5>
                                                                        {securityData.Security_lang()=='ENG'?v.title:v.title_ind}
                                                                    </h5>
                                                                    <span>
                                                                        {securityData.Security_lang()=='ENG'?v.description:v.description_ind}
                                                                    </span>
                                                                    <h4>
                                                                        {v.category_title}
                                                                    </h4>
                                                                </div>
                                                            </div>
                                                            
                                                        </a>
                                                    </div>
                                                )}

                                                {/* end foreach */}
                                            </div>
                                        </div>
                                    </div>
                                    {{
                                        [false]:
                                        <div className="container submit-your-idea-containter">
                                            <div className="row align-items-center submit-your-idea">
                                                <div className="col-lg-12 col-md-12 col-sm-12" style={{padding:"5px"}}> 
                                                    <div className="mb-12 mb-lg-0 animation" data-animation="fadeInLeft" data-animation-delay="0.1s"> 
                                                        <p className="idea-intro">{defaultLang.lang.home_submit_idea_description}</p>

                                                        <div className="newsletter_form">
                                                            <form id="formSubmitIdea" style={{borderBottom:"2px solid #000000"}} onSubmit={
                                                                (e)=>{
                                                                    e.preventDefault();
                                                                    setState(state=>({...state, modalProp:{modalShow:true, id:state.messageSubmitIdea, type: 'submitIdea'}, messageSubmitIdea:""}))
                                                                }
                                                            }> 
                                                                <div className="">
                                                                    <textarea wrap="hard" cols="30" name="message" id="message" rows="1" type="text" autoComplete="off"  placeholder={defaultLang.lang.home_submit_idea_textbox} value={state.messageSubmitIdea} onChange={(e)=>setState(state=>({...state, messageSubmitIdea:e.target.value}))} required></textarea>
                                                                </div>
                                                                <button type="submit" title="Subscribe" className="btn btn-outline-black btn-radius" name="submit" value="Submit">
                                                                    {defaultLang.lang.general_Submit}
                                                                </button>
                                                            </form>
                                                        </div>


                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                    }[state.showIqosPage]
                                    }
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

export default SearchArticle;