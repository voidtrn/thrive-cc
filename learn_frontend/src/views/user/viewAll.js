/* 
Note :
- halaman view all gabungan dari page, article, cate, special page, menu special dan custom page
- function viewall adalah masternya
- function page untuk uri page, article, cate dan special page
- function menu_special untuk uri menu_special
- function customPage untuk uri custom_page
- perpindahan state antar function menggunakan globalstate, jadi usahakan untuk menambah state baru tambah ke stateglobal :D
- page?menu= => untuk halaman page yang menggunakan parameter menu_id
- cate?cate= => untuk halaman page yang menggunakan parameter category_id
- section?section= => untuk halaman page yang menggunakan section_id
- special_page?cate= => untuk halaman special_page di function page yang menggunakan parameter category_id (dari old awb hanya untuk financial wellbeing dengan category=735b90b4568125ed6c3f678819b6e058)
- menu_special?menu= => untuk halaman menu_special yang menggunakan parameter menu_id
- menu_special?cate= => untuk halaman menu_special yang menggunakan parameter category_id
- article?cate=<hash category_id>&articleId=<hash article_id> => untuk halaman page yang menampilkan 1 article, link ini didapatkan dari email. menggunakan parameter category_id dan article_id
- custom_page?cate=<hash category_id> => untuk halaman category yang tipenya custom page
- custom_page?cate=<hash category_id>&sub=<hash sub category id> => untuk halaman category ketika sub category di click
- trigger popup quiz, share article, submit idea, quiz iqos, dan alert lainnya ada di helper popupalert, cukup menggunakan setstate modal untuk menampilkan modal (ref: page/onClickEvent )
- popquiz sudah ada di master.js, jadi apabila mau tambah popup jangan ditambah disini!, tambah di master js componentnya dan functionnya di tambah di popupAlert.js,
- migrate to prod jangan lupa ganti state.userDocument dari srcerror ke env.userDocument
*/

import React, { createRef, useContext, useEffect, useRef, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import GlobalState from '../../helpers/globalState';
import routeAll from '../../helpers/route';
import defaultLang from '../../helpers/lang';
import { cssTarget, LoadingAdmin, LoadingData } from '../../components/Loading';
import { Card, Form } from 'react-bootstrap';
import { useLocation, useHistory } from 'react-router-dom';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { RenderCourseList } from './sff/viewcourseDetail';
import { ConsoleView, isMobile } from 'react-device-detect';

var _ = require('lodash');

//must remark because link not valid anymore
// const srcError = 'https://thrive.pmiapps.biz/thrive/awb/_user_document/'
const srcError = ''


const routeViewAll = routeAll.routeViewAll;

// setting slider for financial wellbeing (special_page)
const settings = {
    className: 'your-class',
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 5000,
    centerPadding: '22%',
    slidesToShow: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    arrows: true,
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
// end setting slider for financial wellbeing (special_page)

// setting slider for custom_page
const settingsCustomPage = {
    className: 'custom-page-slider-class',
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    nextArrow: <PrevArrowCustomPage fromSource="slider" />,
    prevArrow: <NextArrowCustomPage fromSource="slider" />,
    arrows: true,
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


function PrevArrowCustomPage(props) {
    const { style, onClick, fromSource } = props;
    return (
        <i className='fa fa-3x fa-angle-left'
            style={{
                ...fromSource != "slider" && style,
                fontSize: '30px',
                color: '#0e93d8',
                background: '#fff',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                padding: '9px 17px',
                position: 'absolute',
                top: fromSource === "slider" ? '38%' : '40%',
                left: fromSource === "slider" ? '1%' : '-2%',
                cursor: 'pointer',
                zIndex: '10'
            }} onClick={onClick} />
    );
}

function NextArrowCustomPage(props) {
    const { style, onClick, fromSource } = props;
    return (
        <i className='fa fa-3x fa-angle-right'
            style={{
                ...fromSource != "slider" && style,
                fontSize: '30px',
                color: '#0e93d8',
                background: '#fff',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                padding: '9px 20px',
                position: 'absolute',
                top: fromSource === "slider" ? '40%' : '40%',
                right: fromSource === "slider" ? '1%' : '-2%',
                cursor: 'pointer',
                zIndex: '10'
            }} onClick={onClick} />
    );
}
// end setting slider for custom_page

function PrevArrow(props) {
    const { style, onClick } = props;
    return (
        <i className='fa fa-3x fa-angle-left'
            style={{
                ...style,
                fontSize: '22px',
                color: '#0e93d8',
                background: '#fff',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                padding: '6px 10px 0px 9px',
                position: 'absolute',
                top: '40%',
                cursor: 'pointer',
                zIndex: '1'
            }} onClick={onClick} />
    );
}

function NextArrow(props) {
    const { style, onClick } = props;
    return (
        <i className='fa fa-3x fa-angle-right'
            style={{
                ...style,
                fontSize: '22px',
                color: '#0e93d8',
                background: '#fff',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                padding: '6px 10px 0px 9px',
                position: 'absolute',
                top: '40%',
                right: '0%',
                cursor: 'pointer'
            }} onClick={onClick} />
    );
}

function ViewAll(props) {
    const [state, setState] = useState({
        assets: env.assets,
        userDocument: env.userDocument,
        // userDocument: srcError,
        user_data: null,
        showIqosPage: false,
        param: axiosLibrary.getParamString(props.location.search),
        articleList: [],
        refineBy: [],
        checkedRefineBy: [],
        layoutPageList: [],
        layoutMenuList: [],
        layoutSectionList: [],
        layoutCategoryList: [],
        rsSidebarMenuList: [
            { id: 1, title: 'Please Wait...', show_submenu: 1, controller: 'None' }
        ],
        rsSidebarSubMenuList: [
            { id: 1, title: 'Please Wait...', controller: 'NoneSubmenu' },
        ],
        rsSidebarCategory4List: [
            { category_4: 'Please Wait...' },

        ],
        relatedTopic: [
            { awb_mst_menu_id_title: 'Please Wait...' },

        ],
        raIqosQuiz: [],
        sortData: 1,
        configBannerUrl: '',
        showSearchResult: '',
        searchKeyword: '',
        loading: true,
        modalProp: {
            modalShow: false,
            id: null,
        },
        flagShowArticle: false,
        messageSubmitIdea: "",
        tabMenu: [
            { type: "0", text: "Info", btnId: "info", active: true, showDisplay: true },
            { type: "1", text: "Online Content", btnId: "online_content", active: false, showDisplay: true },
            { type: "2", text: "Workshop", btnId: "workshop", active: false, showDisplay: true },
            { type: "3", text: "Sharing Session", btnId: "sharing_session", active: false, showDisplay: true },
            { type: "5", text: "SFF", btnId: "sff", active: false, showDisplay: true },
            { type: "4", text: "Challenge Card", btnId: "challenge_card", active: false, showDisplay: true },
        ],
        contentDetail: <>please wait...</>,
        special_page_sliders: [],
        layoutTabSubCategory: [],
        upperArticleListSpecialPage: [],
        titlePage: 'title',
        custom_page_sliders: [],
        slidestoShowSubCategory: 4,
        allCardBodyRef: [],
        contentTypeID: null,
        listCategorySFF: [
            { type: 1, text: "Short Course", btnId: "short_course", active: true },
            { type: 2, text: "Executive Education", btnId: "executive_education", active: false },
            { type: 3, text: "Certification", btnId: "certification", active: false },
            { type: 0, text: "#AWB Online Content", btnId: "awb_online_content", active: false },
        ],
        scrollLeftArrowMenuSpecial:true,
        scrollRightArrowMenuSpecial:false
    })

    const [global, setGlobal] = useContext(GlobalState)

    useEffect(() => {
        if (!state.param) {
            if (!(window.location.pathname === routeAll.routesUser.search.path) || state.searchKeyword === '') {
                window.location.href = routeAll.routesUser.home.path
            }
        }
        fnRaIqosQuiz()
    }, [])

    useEffect(() => {
        if (state.modalProp) {
            const modalProp = state.modalProp
            setGlobal(global => ({ ...global, modalProp }))
        }
    }, [state.modalProp])

    useEffect(() => {
        getPageContent()
        localStorage.removeItem('searchData')
    }, []);

    useEffect(() => {
        if (global.loadContent) {
            fnRaIqosQuiz()
        }
    }, [global])

    const fnRaIqosQuiz = async () => {
        const param = {
            platform_id: securityData.Security_getPlatformId(),
            user_id: securityData.Security_UserId(),
        }
        let response = await axiosLibrary.postData('awbHome/CheckAndGetDataIqosQuiz', param);
        if (response.status === 200) {
            setState(state => ({ ...state, raIqosQuiz: response.data.data }))
        }
    }

    const getPageContent = async () => {
        const param = {
            menu_id: state.param.menu,
            platform_id: securityData.Security_getPlatformId(),
            category_id: state.param.cate,
            section_id: state.param.section
        };

        let isi = await axiosLibrary.postData('awbHome/MenuPageContent', param);
        if (isi.status === 200) {
            if (isi.data.data.length > 0) {
                setState(state => ({
                    ...state,
                    pageContent: isi.data.data,
                    titlePage: isi.data.data[0].title,
                    showIqosPage: isi.data.data3 === state.param.cate ? true : false,
                    configBannerUrl: isi.data.data4
                }))
            }

            /// permintaan jason .. lngsng hardcode ... hidden selain tab info dan online content untuk menuid 54
            if (isi.data.data[0].id == 54 || isi.data.data[0].menu_id == 54) {
                setState(state => ({
                    ...state,
                    tabMenu: [
                        { type: "0", text: "Info", btnId: "info", active: true, showDisplay: true },
                        { type: "1", text: "Online Content", btnId: "online_content", active: false, showDisplay: true },
                        { type: "2", text: "Workshop", btnId: "workshop", active: false, showDisplay: false },
                        { type: "3", text: "Sharing Session", btnId: "sharing_session", active: false, showDisplay: false },
                        { type: "5", text: "SFF", btnId: "sff", active: false, showDisplay: false },
                        { type: "4", text: "Challenge Card", btnId: "challenge_card", active: false, showDisplay: false },
                    ]
                }))
            }

        }
    }

    return (
        <GlobalState.Provider value={[state, setState]}>
            {
                {
                    [routeViewAll.menuSpecial.path]: <MenuSpecial {...props} thisStateGlobal={global} />,
                    [routeViewAll.customPage.path]: <Custom_page {...props} thisStateGlobal={global} />
                }[props.location.pathname]
                || <Page {...props} thisStateGlobal={global} />
            }
        </GlobalState.Provider>
    )
}

function Page(props) {
    const [state, setState] = useContext(GlobalState)
    const location = useLocation();

    useEffect(() => {
        if (props.thisStateGlobal.modalProp.loadContent) {
            getArticle()
            upperArticleListData()
        }
    }, [props.thisStateGlobal.modalProp])

    useEffect(() => {
        if (state.pageContent) {
            getSidebarMenu()
            if (location.pathname === routeViewAll.specialPage.path) {
                getSliderData()
                getLayoutSubCategory()
            }
        }
    }, [state.pageContent]);

    useEffect(() => {
        if (state.pageContent) {
            getArticle()
        }
    }, [state.sortData, state.refineBy, state.pageContent])

    useEffect(() => {
        if (state.specialPageIdSubCategory) {
            upperArticleListData()
        }
    }, [state.specialPageIdSubCategory]);

    // start for special page
    const getSliderData = async () => {
        const param = {
            categoryId: state.param.cate,
            platform_id: securityData.Security_getPlatformId(),
            flag_active: '1',
            limit: 200,
            offset: 0
        }
        let response = await axiosLibrary.postData('awbSliderCategory/ListData', param)
        if (response.status === 200) {
            setState(state => ({ ...state, special_page_sliders: response.data.data, totalSlider: response.data.data.length }))
        }
    }

    const getLayoutSubCategory = async () => {
        const param = {
            md5CategoryId: state.param.cate,
            platform_id: securityData.Security_getPlatformId(),
            limit: 1000,
            offset: 0
        }
        let response = await axiosLibrary.postData('awbSubCategory/ListData', param)
        if (response.status === 200) {
            setState(state => ({ ...state, layoutTabSubCategory: response.data.data, widthStyleTabSubCategory: 100 / response.data.data.length, specialPageIdSubCategory: response.data.data[0].id_sub_category }))
        }
    }

    const upperArticleListData = async () => {
        setState(state => ({ ...state, upperArticleLoading: true }))
        const param = {
            platform_id: securityData.Security_getPlatformId(),
            sub_category_id: state.specialPageIdSubCategory,
            user_id: securityData.Security_UserId(),
        }
        let response = await axiosLibrary.postData('awbHome/ListArticleBySubCategoryIdOftheMonth', param)
        if (response.status === 200) {
            setState(state => ({ ...state, upperArticleListSpecialPage: response.data.data, upperArticleLoading: false }))
        }
    }
    // end for special page

    const getSidebarMenu = async () => {

        let md5Id = await axiosLibrary.getmd5FromBackend(state.param.menu ?
            state.pageContent[0].id
            :
            state.pageContent[0].menu_id
        );
        let param = {
            platform_id: securityData.Security_getPlatformId(),
        }
        if (state.param.menu || state.param.cate) {
            param = { ...param, menu_id: md5Id }
        }
        if (state.param.section) {
            param = { ...param, section_id: state.param.section }
        }

        let isi = await axiosLibrary.postData('awbHome/rsSidebarMenuLevelList', param);
        if (isi.status === 200) {
            if (isi.data.data.length > 0) {
                const paramGetsubMenu = {
                    platform_id: securityData.Security_getPlatformId(),
                    menu_id: isi.data.data[0].md5id,
                    category: state.param.cate || '0',
                    section_id: state.param.section
                }
                let response = await axiosLibrary.postData('awbHome/rsSidebarCategoryList', paramGetsubMenu);
                if (response.status === 200) {
                    const paramGetRefineBy = {
                        platform_id: securityData.Security_getPlatformId(),
                        menu_id: isi.data.data[0].md5id,
                        category_id: state.param.cate
                    }
                    let responseRefineBy = await axiosLibrary.postData('awbHome/rsSidebarCategory4List', paramGetRefineBy);
                    if (responseRefineBy.status === 200) {
                        setState(state => ({
                            ...state,
                            rsSidebarMenuList: isi.data.data,
                            rsSidebarSubMenuList: response.data.data,
                            rsSidebarCategory4List: responseRefineBy.data.data,
                            checkedRefineBy: new Array(responseRefineBy.data.data.length).fill(false)
                        }))
                    }

                }
            }
        }
    }

    const getArticle = async () => {
        setState(state => ({ ...state, loading: true }))
        const tabMenuActive = state.tabMenu.filter(v => v.active == true)

        if (tabMenuActive[0].type == 4) {
            state.contentTypeID = 6
        } else {
            state.contentTypeID = null
        }

        let paramGetArticle = {
            platform_id: securityData.Security_getPlatformId(),
            user_id: securityData.Security_UserId(),
            sortBy: state.sortData,
            filter_search: state.searchKeyword,
            category4: JSON.stringify(state.refineBy),
            lang: securityData.Security_lang(),
            contentTypeID: state.contentTypeID
        }

        if (state.param.menu) {
            paramGetArticle = { ...paramGetArticle, menu_id: state.pageContent[0].id }
        }
        if (state.param.cate) {
            paramGetArticle = { ...paramGetArticle, category_id: state.pageContent[0].id }
        }
        if (state.param.articleId) {
            paramGetArticle = { ...paramGetArticle, article_id: state.param.articleId }
        }
        if (state.param.section) {
            paramGetArticle = { ...paramGetArticle, section_id: state.pageContent[0].id }
        }

        let response = await axiosLibrary.postData('awbHome/ListArticleByMenuId', paramGetArticle);
        if (response.status === 200) {
            setState(state => ({ ...state, articleList: response.data.data, totalSearch: response.data.data.length, loading: false }))
            props.loading(false)
        }
    }

    const sorting = (e) => {
        setState(state => ({ ...state, sortData: e.target.value }))
    }

    const filterData = (category_4) => {
        let isi = []
        if (state.refineBy.includes(category_4)) {
            isi = state.refineBy.filter(v => v !== category_4)
        } else {
            isi = [...state.refineBy, category_4]
        }

        setState(state => ({ ...state, refineBy: isi }))
    }

    const onClickEvent = async (type, param) => {
        switch (type) {
            case 'shareArticle':
                setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'article' }, flagShowArticle: true }))
                break;
            case 'loadArticleQuiz':
                // if(!state.flagShowArticle){
                //     await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                // }
                setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'quiz', param: param }, flagShowArticle: false }))
                break;
            case 'logActivityArticle':
                if (!state.flagShowArticle) {
                    let isi = await axiosLibrary.contentAccessLog({ contenType: param.content, articleId: param.articleId, trnId: param.id })
                    if (isi) {
                        if (isi.status === 200) {
                            setState(state => ({ ...state, modalProp: { modalShow: false, id: null, loadContent: true } }))
                        }
                    }
                }
                window.open(param.hyperlink_url, '_blank')
                break;
            case 'loadIqosQuiz':
                if (param.allowJoin) {
                    if (!state.flagShowArticle) {
                        await axiosLibrary.contentAccessLog({ contenType: param.content, articleId: param.articleId, trnId: param.id })
                        setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'quiz', iqosQuiz: 1 }, flagShowArticle: false }))
                    }
                } else {
                    let alertSuccess =
                        <div dangerouslySetInnerHTML={{
                            __html: defaultLang.lang.alreadySubmitQuizIqos
                        }} />
                    setState(state => ({ ...state, modalProp: { modalShow: true, id: null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle: false, messageSubtitlePopup: "" } }))
                }
                break;
            default:
                break;
        }

    }

    return (
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
                    .checkbox label 
                    {
                        display: inline-block;
                        position: relative;
                        padding-left: 5px; 
                        margin:0;
                        display: inline-block;
                        font-family: 'poppinsmedium', sans-serif;
                        font-size: 12px;
                        border: 0;
                        padding:0;
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
                    .checkbox input[type="checkbox"]:checked + label::before {
                        display: inline-block;
                        position: absolute;
                        width: 17px;
                        height: 17px;
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
                    .checkbox input[type="checkbox"]:checked + label::before {
                        font-family: 'FontAwesome';
                        content: '\\f00c'; 
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

                    ${state.showIqosPage ?
                        `
                        .iqos-top-banner {
                            background-size: cover;
                            background-position: center;
                            height: 400px;
                            display: block;
                            position: relative;
                            top: -12px;
                            margin-top:3%;
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
                    .your-class .slick-slide{
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
                        <a href={state.configBannerUrl != '' ? state.configBannerUrl : '#'} target="_blank" rel="noreferrer">
                            <div className="iqos-top-banner" style={{ backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${state.userDocument}iqos/banner-top.png)` }} data-img-src={`${state.userDocument}iqos/banner-top.png`}>
                            </div>
                        </a>
                        <a id="aHrefLoadIqosQuiz"
                            onClick={() => onClickEvent('loadIqosQuiz', { allowJoin: state.raIqosQuiz.total_user_answer <= 0 ? 1 : 0, content: 'Beliver`s Quiz', articleId: state.raIqosQuiz.article_id, id: state.raIqosQuiz.id })}
                            target="_blank" rel="noreferrer"
                        >
                            <div className="iqos-top-quiz" style={{ backgroundImage: `url(${state.userDocument}iqos/banner-quiz.png)` }} data-img-src={`${state.userDocument}iqos/banner-quiz.png`}></div>
                        </a>
                    </>
            }[state.showIqosPage]
            }
            {{
                [routeViewAll.specialPage.path]:
                    <>
                        <div id="topic" className="section-topic">
                            <div className="container web-tour-section-topic">
                                <div className="row justify-content-center2">
                                    <div className="col-md-12">
                                        <div className=" text-center">
                                            <h2 className="section-title">{state.titlePage}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Slider {...settings}>
                            {state.special_page_sliders.map((v, idx) =>
                                <div key={idx}>
                                    <a href={v.hyperlink_url} target="_blank" rel="noreferrer">
                                        <img src={`${state.userDocument}slider_category/${v.slider_video}`} alt={v.slider_video} onError={(e) => e.target.src = `${srcError}daily_feeds/${v.slider_video}`} />
                                        <div className="inner">
                                            <div dangerouslySetInnerHTML={{
                                                __html: securityData.Security_lang() === 'ENG' ? v.headline : v.headline_ind
                                            }} />
                                            <div id="inner-p">
                                                <div dangerouslySetInnerHTML={{
                                                    __html: securityData.Security_lang() === 'ENG' ? v.short_description : v.short_description_ind
                                                }} />
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </Slider>
                        <div style={{ marginTop: '30px' }}>
                            <div className="container web-tour-section-topic">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="tab-style4 tab-function">
                                            <ul className="nav nav-tabs" role="tablist" id="nav-function" >
                                                {state.layoutTabSubCategory.map((v, idx) =>
                                                    <li className="nav-item " style={{ width: `${state.widthStyleTabSubCategory}%` }} key={idx}>
                                                        <a className={state.specialPageIdSubCategory === v.id_sub_category ? "nav-link active" : "nav-link"} id={`profile-tab${idx}`} data-toggle="tab" href="javascript:void(0)" onClick={() => setState(state => ({ ...state, specialPageIdSubCategory: v.id_sub_category }))} role="tab" aria-controls={`trans${idx}`} aria-selected="true">
                                                            {v.title_sub_category}
                                                        </a>
                                                    </li>
                                                )}

                                            </ul>
                                            <div className="tab-content">
                                                <LoadingAdmin loading={state.upperArticleLoading} />
                                                <div className="tab-pane active" style={cssTarget(state.upperArticleLoading)}>
                                                    {
                                                        state.upperArticleListSpecialPage.length && (
                                                            <OwlCarousel
                                                                key={`upperArticle_${state.upperArticleListSpecialPage.length}`}
                                                                center={false}
                                                                margin={10}
                                                                items={2}
                                                                dots={false}
                                                                nav={true}
                                                                loop={false}
                                                                autoPlay={false}
                                                                className={'carousel_slide_function owl-carousel owl-theme text-center'}
                                                                navText={["<i className='ion-ios-arrow-back prev-nav'></i>", "<i className='ion-ios-arrow-forward next-nav'></i>"]}
                                                                responsive={{
                                                                    600: {
                                                                        items: 3
                                                                    }
                                                                }}

                                                            >

                                                                {state.upperArticleListSpecialPage.map((v, idx) =>
                                                                    <div key={idx}>
                                                                        <object>
                                                                            <a tabIndex="0" role="button" onClick={() => onClickEvent('shareArticle', { content: 'Article', articleId: v.article_id, id: v.id })}
                                                                                className="share-article">
                                                                                <i className="ion-share"></i>
                                                                            </a>
                                                                        </object>
                                                                        <a onClick={
                                                                            v.show_quiz == 1 ?
                                                                                () => onClickEvent('loadArticleQuiz', { content: 'Article', articleId: v.article_id, id: v.id })
                                                                                :
                                                                                () => onClickEvent('logActivityArticle', { content: 'Article', articleId: v.article_id, id: v.id, hyperlink_url: v.hyperlink_url })
                                                                        }
                                                                            tabIndex="0" role="button"
                                                                        >
                                                                            <div className={`item ${v.flag_read == 1 ? `disabled-article` : ``}`}>
                                                                                <div className="home_topic_box white_bg home_topic_hover_style2 social_white" style={{ backgroundImage: `url(${state.userDocument}article/${v.article_image})` }}>
                                                                                    {v.flag_quiz == 1 ?
                                                                                        <img className='poin-flag' src={`${state.assets}img/poin${v.show_quiz == 0 ? `-grayscale` : ``}.png`} />
                                                                                        :
                                                                                        null
                                                                                    }
                                                                                    <div className="home_topic_title">
                                                                                        <h5>
                                                                                            {securityData.Security_lang() == 'ENG' ? v.title : v.title_ind}
                                                                                        </h5>
                                                                                        <span className="article-descr">
                                                                                            {securityData.Security_lang() == 'ENG' ? v.description : v.description_ind}
                                                                                        </span>
                                                                                        <p className="article-category">
                                                                                            {v.category_title}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </OwlCarousel>
                                                        )
                                                    }

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
            }[location.pathname]}

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
                                            state.showSearchResult && <h3 className="section-title search-result">Showing result for: {state.searchKeyword ? state.searchKeyword : ''}</h3>
                                        }
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div style={{ maxWidth: "250px" }}>
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
                                        <br />
                                        <div id="admin-menu" className="panel panel-default">
                                            {location.pathname === routeViewAll.specialPage.path ? null :
                                                <>
                                                    <div className="panel-heading">Category</div>
                                                    <div className="list-group">
                                                        {state.rsSidebarMenuList.map((v, idx) =>
                                                            <div className="" key={idx}>
                                                                <a className="list-group-item" href={v.controller === 'section' ? `${routeViewAll.section.path}?section=${v.md5id}` : `${routeViewAll.page.path}?menu=${v.md5id}`}>
                                                                    <span>{v.title}</span>
                                                                </a>
                                                                {{
                                                                    [1]: state.rsSidebarSubMenuList.map((x, idxSubMenu) =>
                                                                        <div className="list-group" key={idxSubMenu}>
                                                                            <a className={x.md5id == state.param.cate ? 'active list-group-item sub-menu' : 'list-group-item sub-menu'} href={
                                                                                x.controller === 'menu' ?
                                                                                    `${routeViewAll.page.path}?menu=${x.md5id}`
                                                                                    :
                                                                                    {
                                                                                        [0]: `${routeViewAll.cate.path}?cate=${x.md5id}`,
                                                                                        [1]: `${routeViewAll.customPage.path}?cate=${x.md5id}`,
                                                                                        [2]: `${routeViewAll.specialPage.path}?cate=${x.md5id}`,
                                                                                        [3]: `${routeViewAll.menuSpecial.path}?cate=${x.md5id}`
                                                                                    }[x.flag_type_page]
                                                                            }
                                                                            >
                                                                                <span>
                                                                                    <div dangerouslySetInnerHTML={{
                                                                                        __html: x.title
                                                                                    }} />
                                                                                </span>
                                                                            </a>
                                                                        </div>
                                                                    )
                                                                }[v.show_submenu]}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            }

                                            <div className="panel-heading" style={{ paddingTop: '30px' }}>Refine by</div>
                                            <div className="list-group pl-2" >
                                                {state.rsSidebarCategory4List.map((v, idx) =>
                                                    <Form.Check
                                                        type={'checkbox'}
                                                        id={`checkbox${idx}`}
                                                        key={idx}
                                                        className="checkbox checkbox-circle"
                                                    >
                                                        <Form.Check.Input type={'checkbox'} onChange={() => filterData(v.category_4)} />
                                                        <Form.Check.Label>{v.category_4}</Form.Check.Label>
                                                    </Form.Check>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-9" >
                                        <LoadingData loading={state.loading} />
                                        <div className="tab-content" style={cssTarget(state.loading)}>
                                            <div className="tab-pane fade show active" id="function-tab1" role="tabpanel" aria-labelledby="home-tab1">
                                                <div className="row div-list-article">
                                                    {/* foreach article list */}
                                                    {state.articleList.map((v, idx) =>
                                                        <div className="col-md-4 item " key={idx}>
                                                            <object>
                                                                <a tabIndex="0" role="button" onClick={() => onClickEvent('shareArticle', { content: 'Article', articleId: v.article_id, id: v.id })}
                                                                    className="share-article"><i className="ion-share"></i>
                                                                </a>
                                                            </object>
                                                            <a onClick={
                                                                v.show_quiz == 1 ?
                                                                    () => onClickEvent('loadArticleQuiz', { content: 'Article', articleId: v.article_id, id: v.id })
                                                                    :
                                                                    () => onClickEvent('logActivityArticle', { content: 'Article', articleId: v.article_id, id: v.id, hyperlink_url: v.hyperlink_url })
                                                            }
                                                                tabIndex="0" role="button"
                                                            >
                                                                <div className={`team_box white_bg team_hover_style2 social_white ${v.flag_read == 1 ? `disabled-article` : ``}`}>
                                                                    {v.flag_quiz == 1 ?
                                                                        <img className='poin-flag' src={`${state.assets}img/poin${v.show_quiz == 0 ? `-grayscale` : ``}.png`} />
                                                                        :
                                                                        null
                                                                    }
                                                                    <div className="team_img">
                                                                        <img src={`${state.userDocument}article/${v.article_image}`} alt={v.article_image} onError={(e) => e.target.src = `${srcError}article/${v.article_image}`} />
                                                                    </div>
                                                                    <div className="team_title">
                                                                        <h5>
                                                                            {securityData.Security_lang() == 'ENG' ? v.title : v.title_ind}
                                                                        </h5>
                                                                        <span>
                                                                            {securityData.Security_lang() == 'ENG' ? v.description : v.description_ind}
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
                                                        <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: "5px" }}>
                                                            <div className="mb-12 mb-lg-0 animation" data-animation="fadeInLeft" data-animation-delay="0.1s">
                                                                <p className="idea-intro">{defaultLang.lang.home_submit_idea_description}</p>

                                                                <div className="newsletter_form">
                                                                    <form id="formSubmitIdea" style={{ borderBottom: "2px solid #000000" }} onSubmit={
                                                                        (e) => {
                                                                            e.preventDefault();
                                                                            setState(state => ({ ...state, modalProp: { modalShow: true, id: state.messageSubmitIdea, type: 'submitIdea' }, messageSubmitIdea: "" }))
                                                                        }
                                                                    }>
                                                                        <div className="">
                                                                            <textarea wrap="hard" cols="30" name="message" id="message" rows="1" type="text" autoComplete="off" placeholder={defaultLang.lang.home_submit_idea_textbox} value={state.messageSubmitIdea} onChange={(e) => setState(state => ({ ...state, messageSubmitIdea: e.target.value }))} required></textarea>
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

function MenuSpecial(props) {
    const [state, setState] = useContext(GlobalState)

    useEffect(() => {
        if (props.thisStateGlobal.modalProp.loadContent) {
            getContentDetail()
        }
    }, [props.thisStateGlobal.modalProp])

    useEffect(() => {
        if (state.pageContent) {
            getSidebarMenu()
        }
    }, [state.pageContent]);

    useEffect(() => {
        if (state.pageContent) {
            getContentDetail()
        }
    }, [state.sortData, state.refineBy, state.pageContent, state.tabMenuTypeActive, state.tabMenuTypeActiveSFF])

    const getSidebarMenu = async () => {

        let menu_id = await axiosLibrary.getmd5FromBackend(state.param.menu ? state.pageContent[0].id : state.pageContent[0].menu_id);
        const param = {
            platform_id: securityData.Security_getPlatformId(),
            menu_id: menu_id
        }
        let isi = await axiosLibrary.postData('awbHome/rsSidebarMenuLevelList', param);
        if (isi.status === 200) {
            if (isi.data.data.length > 0) {
                const paramGetsubMenu = {
                    platform_id: securityData.Security_getPlatformId(),
                    menu_id: isi.data.data[0].md5id,
                    category: state.param.cate || '0'
                }
                let response = await axiosLibrary.postData('awbHome/rsSidebarCategoryList', paramGetsubMenu);
                if (response.status === 200) {
                    const paramGetRelatedTopic = {
                        platform_id: securityData.Security_getPlatformId(),
                        menu_id: state.param.menu ? state.pageContent[0].id : state.pageContent[0].menu_id,
                    }
                    let responseRelatedTopic = await axiosLibrary.postData('awbHome/RelatedTopic', paramGetRelatedTopic);
                    if (responseRelatedTopic.status === 200) {
                        setState(state => ({
                            ...state,
                            rsSidebarMenuList: isi.data.data,
                            rsSidebarSubMenuList: response.data.data,
                            relatedTopic: responseRelatedTopic.data.data
                        }))
                    }

                }
            }
        }
    }

    const getContentDetail = async () => {
        setState(state => ({ ...state, loading: true }))

        const tabMenuActive = state.tabMenu.filter(v => v.active == true)

        switch (tabMenuActive[0].type) {
            case "0":
                getInfo()
                break;
            case "1":
                getArticle()
                break;
            case "2":
                getWorkShop()
                break;
            case "3":
                getSharing()
                break;
            case "4":
                getArticle()
                break;
            case "5":
                getSFF()
                break;
            default:
                break;
        }

        props.loading(false)
    }

    const getArticle = async () => {
        setState(state => ({ ...state, loading: true }))

        const tabMenuActive = state.tabMenu.filter(v => v.active == true)

        if (tabMenuActive[0].type == 4) {
            state.contentTypeID = 6
        } else {
            state.contentTypeID = null
        }

        let paramGetArticle = {
            platform_id: securityData.Security_getPlatformId(),
            menu_id: state.pageContent[0].id,
            user_id: securityData.Security_UserId(),
            sortBy: state.sortData,
            filter_search: state.searchKeyword,
            category4: JSON.stringify(state.refineBy),
            lang: securityData.Security_lang(),
            contentTypeID: state.contentTypeID
        }

        if (state.param.cate) {
            paramGetArticle = { ...paramGetArticle, category_id: state.pageContent[0].id }
        }

        let response = await axiosLibrary.postData('awbHome/ListArticleByMenuId', paramGetArticle);
        if (response.status === 200) {
            setState(state => ({
                ...state, articleList: response.data.data, totalSearch: response.data.data.length, loading: false,
                renderContentDetail:
                    response.data.data.map((v, idx) =>
                        <div className="col-md-4 item " key={idx}>
                            <object>
                                <a tabIndex="0" role="button" onClick={() => onClickEvent('shareArticle', { content: 'Article', articleId: v.article_id, id: v.id })}
                                    className="share-article"><i className="ion-share"></i>
                                </a>
                            </object>
                            <a onClick={
                                v.show_quiz == 1 ?
                                    () => onClickEvent('loadArticleQuiz', { content: 'Article', articleId: v.article_id, id: v.id })
                                    :
                                    () => onClickEvent('logActivityArticle', { content: 'Article', articleId: v.article_id, id: v.id, hyperlink_url: v.hyperlink_url })
                            }
                                tabIndex="0" role="button"
                            >
                                <div className={`team_box white_bg team_hover_style2 social_white ${v.flag_read == 1 ? `disabled-article` : ``}`}>
                                    {v.flag_quiz == 1 ?
                                        <img className='poin-flag' src={`${state.assets}img/poin${v.show_quiz == 0 ? `-grayscale` : ``}.png`} />
                                        :
                                        null
                                    }
                                    <div className="team_img">
                                        <img src={`${state.userDocument}article/${v.article_image}`} alt={v.article_image} onError={(e) => e.target.src = `${srcError}article/${v.article_image}`} />
                                    </div>
                                    <div className="team_title">
                                        <h5>
                                            {securityData.Security_lang() == 'ENG' ? v.title : v.title_ind}
                                        </h5>
                                        <span>
                                            {securityData.Security_lang() == 'ENG' ? v.description : v.description_ind}
                                        </span>
                                        <h4>
                                            {v.category_title}
                                        </h4>
                                    </div>
                                </div>

                            </a>
                        </div>
                    )
            }))
        }
    }

    const getInfo = async () => {
        const paramGetInfo = {
            platform_id: securityData.Security_getPlatformId(),
            menuId: state.param.menu,
            categoryId: state.param.cate
        }

        let response = await axiosLibrary.postData('awbTextInfo/SelectDataByMenu', paramGetInfo);
        if (response.status === 200) {
            setState(state => ({
                ...state, loading: false,
                renderContentDetail: <div dangerouslySetInnerHTML={{
                    __html: response.data.data.text_info
                }} />
            }))
        }
    }

    const getWorkShop = async () => {
        const paramGetInfo = {
            platform_id: securityData.Security_getPlatformId(),
            menu_id: state.param.menu,
            category_id: state.param.cate,
            user_id: securityData.Security_UserId(),
            type: 'W'
        }

        let response = await axiosLibrary.postData('awbHome/ListWorkShopSharing', paramGetInfo);
        if (response.status === 200) {
            setState(state => ({
                ...state, articleList: response.data.data, totalSearch: response.data.data.length, loading: false,
                renderContentDetail: response.data.data.length > 0 ?
                    response.data.data.map((v, idx) =>
                        <div className="col-md-4 item " key={idx}>
                            <div className={`redeem_box team_box white_bg team_hover_style2 social_white ${v.flag_read == 1 ? `disabled-article` : ``}`}>
                                <a href={v.hyperlink_url} target="_blank" rel="noreferrer">
                                    <div className="team_img">
                                        <img src={`${state.userDocument}workshop/${v.workshop_image}`} alt={v.workshop_image} onError={(e) => e.target.src = `${srcError}article/${v.workshop_image}`} />
                                    </div>
                                </a>
                                <div className="redeem_title">
                                    <h5>
                                        {securityData.Security_lang() == 'ENG' ? v.title : v.title_ind}
                                    </h5>
                                    <span className="description">
                                        <div dangerouslySetInnerHTML={{
                                            __html: securityData.Security_lang() == 'ENG' ? v.description : v.description_ind
                                        }} />
                                    </span>
                                    {!v.ready_in_this ?
                                        <>
                                            {v.total_user >= v.capacity ?
                                                <a onClick={() => setState(state => ({ ...state, modalProp: { modalShow: true, id: v.id, type: 'redeem', name: "WorkShop" } }))} className="btn btn-outline-white popup-btn-cta redeem-disabled mt-0" style={{ backgroundColor: 'rgb(243, 214, 86)', color: '#000' }}>
                                                    {defaultLang.lang.workShopButtonJoinWaitingList}
                                                </a>
                                                :
                                                <a onClick={() => setState(state => ({ ...state, modalProp: { modalShow: true, id: v.id, type: 'redeem', name: "WorkShop" } }))} className="btn btn-outline-white popup-btn-cta redeem-disabled mt-0" style={{ backgroundColor: 'rgb(95, 171, 207)', color: '#000' }}>
                                                    {defaultLang.lang.workShopButtonRegister}
                                                </a>
                                            }<br />
                                            <span className="redeem-available-qty">{defaultLang.lang.workShopTxtRemainingQuota} = {
                                                v.capacity - v.total_user < 0 ? 0 : v.capacity - v.total_user
                                            }</span>
                                        </>
                                        :
                                        v.ready_in_this === 'WAITING' ?
                                            <span className="redeem-available-qty">{defaultLang.lang.workShopTxtRegisteredWaitingList}</span>
                                            :
                                            <span className="redeem-available-qty">{defaultLang.lang.workShopTxtRegistered}</span>
                                    }
                                </div>
                            </div>
                        </div>
                    ) : <center><span className="search-info"><br /><br />{defaultLang.lang.workShopTxtNotFound}</span></center>
            }))

        }
    }

    const getSharing = async () => {
        const paramGetInfo = {
            platform_id: securityData.Security_getPlatformId(),
            menu_id: state.param.menu,
            category_id: state.param.cate,
            user_id: securityData.Security_UserId(),
            type: 'S'
        }

        let response = await axiosLibrary.postData('awbHome/ListWorkShopSharing', paramGetInfo);
        if (response.status === 200) {
            setState(state => ({
                ...state, articleList: response.data.data, totalSearch: response.data.data.length, loading: false,
                renderContentDetail: response.data.data.length > 0 ?
                    response.data.data.map((v, idx) =>
                        <div className="col-md-4 item " key={idx}>
                            <div className={`redeem_box team_box white_bg team_hover_style2 social_white ${v.flag_read == 1 ? `disabled-article` : ``}`}>
                                <a href={v.hyperlink_url} target="_blank" rel="noopener noreferrer">
                                    <div className="team_img">
                                        <img src={`${state.userDocument}workshop/${v.workshop_image}`} alt={v.workshop_image} onError={(e) => e.target.src = `${srcError}article/${v.workshop_image}`} />
                                    </div>
                                </a>
                                <div className="redeem_title">
                                    <h5>
                                        {securityData.Security_lang() == 'ENG' ? v.title : v.title_ind}
                                    </h5>
                                    <span className="description">
                                        <div dangerouslySetInnerHTML={{
                                            __html: securityData.Security_lang() == 'ENG' ? v.description : v.description_ind
                                        }} />
                                    </span>
                                    {!v.ready_in_this ?
                                        <>
                                            {v.total_user >= v.capacity ?
                                                <a onClick={() => setState(state => ({ ...state, modalProp: { modalShow: true, id: v.id, type: 'redeem', name: "Sharing Session" } }))} className="btn btn-outline-white popup-btn-cta redeem-disabled mt-0" style={{ backgroundColor: 'rgb(243, 214, 86)', color: '#000' }}>
                                                    {defaultLang.lang.sharingSessionButtonJoinWaitingList}
                                                </a>
                                                :
                                                <a onClick={() => setState(state => ({ ...state, modalProp: { modalShow: true, id: v.id, type: 'redeem', name: "Sharing Session" } }))} className="btn btn-outline-white popup-btn-cta redeem-disabled mt-0" style={{ backgroundColor: 'rgb(95, 171, 207)', color: '#000' }}>
                                                    {defaultLang.lang.sharingSessionButtonRegister}
                                                </a>
                                            }<br />
                                            <span className="redeem-available-qty">{defaultLang.lang.sharingSessionTxtRemainingQuota} = {
                                                v.capacity - v.total_user < 0 ? 0 : v.capacity - v.total_user
                                            }</span>
                                        </>
                                        :
                                        v.ready_in_this === 'WAITING' ?
                                            <span className="redeem-available-qty">{defaultLang.lang.sharingSessionTxtRegisteredWaitingList}</span>
                                            :
                                            <span className="redeem-available-qty">{defaultLang.lang.sharingSessionTxtRegistered}</span>
                                    }
                                </div>
                            </div>
                        </div>
                    ) : <center><span className="search-info"><br /><br />{defaultLang.lang.sharingSessionTxtNotFound}</span></center>
            }))
        }
    }

    const getSFF = async () => {
        setState(state => ({ ...state, loading: true }))
        const tabMenuActiveSFF = state.listCategorySFF.filter(v => v.active == true)

        let param = {
            platform_id: securityData.Security_getPlatformId(),
            course_type: tabMenuActiveSFF[0].type
        }
        if (state.param && state.param.menu) {
            param = { ...param, md5Menu: state.param.menu }
        }

        if (state.param && state.param.cate) {
            param = { ...param, md5id: state.param.cate }
        }
        if (state.param && state.param.course) {
            //select course by id
            param = { ...param, course: state.param.course }
        }

        let response = await axiosLibrary.postData('awbViewCourse/ListCourse', param)
        if (response.status === 200) {
            let tempCourseList = response.data.data
            switch (state.sortData) {
                case "1":
                    tempCourseList = tempCourseList.sort((a, b) => b.id - a.id);
                    break;
                case "2":
                    var emptyList = tempCourseList.filter(w => w.price_type == "")
                    emptyList = emptyList.sort((a, b) => a.price_amt - b.price_amt)

                    var nullList = tempCourseList.filter(w => w.price_type == null)
                    nullList = nullList.sort((a, b) => a.price_amt - b.price_amt)

                    var idrList = tempCourseList.filter(w => w.price_type == 'IDR')
                    idrList = idrList.sort((a, b) => a.price_amt - b.price_amt)

                    var usdList = tempCourseList.filter(w => w.price_type == 'USD')
                    usdList = usdList.sort((a, b) => a.price_amt - b.price_amt)

                    var eurList = tempCourseList.filter(w => w.price_type == 'EUR')
                    eurList = eurList.sort((a, b) => a.price_amt - b.price_amt)

                    var audList = tempCourseList.filter(w => w.price_type == 'AUD')
                    audList = audList.sort((a, b) => a.price_amt - b.price_amt)

                    tempCourseList = [...emptyList, ...nullList, ...idrList, ...audList, ...usdList, ...eurList]
                    break;
                case "3":
                    tempCourseList = tempCourseList.sort((a, b) => a.duration_amt - b.duration_amt);
                    break;
                case "4":
                    tempCourseList = _.sortBy(tempCourseList, ['enroll_from']);
                    break;
                case "5":
                    tempCourseList = tempCourseList.sort((a, b) => a.language_avail - b.language_avail);
                    break;
                case "6":
                    tempCourseList = _.orderBy(tempCourseList, ['date_created'], ['desc']);
                    break;
                default:
                    tempCourseList = tempCourseList.sort((a, b) => b.id - a.id);
                    break;
            }
            setState(state => ({
                ...state, sortedCourse: tempCourseList, loading: false, totalSearch: tempCourseList.length, renderContentDetail:
                    <>
                        <style>
                            {`
                    .select_sort_data{
                        display: inline-block;
                        margin: 0 15px 0 0;
                    }
                    .label_select_sort_data{
                        color: #000000;
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
                    @media only screen and (max-width: 767px){
                        .select_sort_data{
                            display: block;
                            width: max-content;
                            margin: 0 0 1rem 0;
                        }
                    }
                    `}
                        </style>
                        <RenderCourseList {...props} />
                    </>
            }))
        }
    }

    const onClickEvent = async (type, param) => {
        switch (type) {
            case 'shareArticle':
                setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'article' }, flagShowArticle: true }))
                break;
            case 'loadArticleQuiz':
                // if(!state.flagShowArticle){
                //     await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                // }
                setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'quiz', param: param }, flagShowArticle: false }))
                break;
            case 'logActivityArticle':
                if (!state.flagShowArticle) {
                    let isi = await axiosLibrary.contentAccessLog({ contenType: param.content, articleId: param.articleId, trnId: param.id })
                    if (isi) {
                        if (isi.status === 200) {
                            setState(state => ({ ...state, modalProp: { modalShow: false, id: null, loadContent: true } }))
                        }
                    }
                }
                window.open(param.hyperlink_url, '_blank', 'noopener,noreferrer')
                break;
            case 'loadIqosQuiz':
                if (param.allowJoin > 1) {
                    if (!state.flagShowArticle) {
                        await axiosLibrary.contentAccessLog({ contenType: param.content, articleId: param.articleId, trnId: param.id })
                        setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'quiz', iqosQuiz: 1 }, flagShowArticle: false }))
                    }
                } else {
                    let alertSuccess =
                        <div dangerouslySetInnerHTML={{
                            __html: defaultLang.lang.alreadySubmitQuizIqos
                        }} />
                    setState(state => ({ ...state, modalProp: { modalShow: true, id: null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle: false, messageSubtitlePopup: "" } }))
                }
                break;
            default:
                break;
        }

    }

    const sorting = (e) => {
        setState(state => ({ ...state, sortData: e.target.value }))
    }

    const changeTab = (value) => {
        const getIndexOldTab = state.tabMenu.findIndex(v => v.active === true)
        state.tabMenu[getIndexOldTab].active = false
        const getIndexCurrentTab = state.tabMenu.findIndex(v => v.type == value)
        state.tabMenu[getIndexCurrentTab].active = true
        setState(state => ({ ...state, sortData: 0, tabMenuTypeActive: state.tabMenu[getIndexCurrentTab].type }))
    }

    const changeTabSFF = (e) => {
        const getIndexOldTab = state.listCategorySFF.findIndex(v => v.active === true)
        state.listCategorySFF[getIndexOldTab].active = false
        const getIndexCurrentTab = state.listCategorySFF.findIndex(v => v.type == e.target.value)
        state.listCategorySFF[getIndexCurrentTab].active = true
        setState(state => ({ ...state, tabMenuTypeActiveSFF: state.listCategorySFF[getIndexCurrentTab].type }))
    }

    const scrollableElement = useRef(null);

    const handleScroll = () => {
        const { scrollLeft, scrollWidth } = scrollableElement.current;
        const atStart = scrollLeft === 0;
        const atEnd = scrollLeft > scrollWidth - window.innerWidth;

        setState(state => ({ ...state, scrollLeftArrowMenuSpecial:atStart, scrollRightArrowMenuSpecial:atEnd }))
    };

    const renderMenuSpecialNavigation = () =>{
        return(
            <>
                <div className="row mb-4">
                    <div className="col-md-3 d-none-mobile">
                        &nbsp;
                    </div>
                    <div className="col-md-9">
                        <div className="container" style={{ borderBottom: "1px solid #3356d4" }}>
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
                                    <ul className="nav nav-tabs profile-tabs list " id="myPrsofileTab">
                                        {state.tabMenu.map((v, idx) =>
                                            <li id="registered" className={v.active ? 'active show' : ''} style={{ display: v.showDisplay ? 'block' : 'none', cursor: 'pointer' }} key={idx} >
                                                <a tabIndex={v.type} role="button" onClick={() => changeTab(v.type)}>{v.text}</a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                        </div>
                        {/* {isMobile && 
                            <div className="mt-4" style={{ maxWidth: "250px" }}>
                                <select className="form-control select-filter" name="sortData" onChange={(e) => changeTab(e.target.value)} value={state.tabMenuTypeActive}>
                                    {state.tabMenu.map((v, idx) =>
                                        <option value={v.type} key={idx}>{v.text}</option>
                                    )}
                                </select>
                            </div>
                        } */}
                    </div>
                </div>
                {
                    state.tabMenuTypeActive == 1 || state.tabMenuTypeActive == 4 || state.tabMenuTypeActive == 5 ?
                        <div className="row" style={cssTarget(state.loading)}>
                            <div className="col-md-3 d-none-mobile">
                                &nbsp;
                            </div>
                            <div className="col-md-9">
                                {
                                    state.showSearchResult && <h3 className="section-title search-result">Showing result for: {state.searchKeyword ? state.searchKeyword : ''}</h3>
                                }
                                <div className="row">
                                    <div className="col-md-9">
                                        {state.tabMenuTypeActive == 5 ?
                                            <>
                                                <label htmlFor="sortData" className="label_select_sort_data">{defaultLang.lang.sort_by}</label>
                                                <div className="select_sort_data">
                                                    <select className="form-control select-filter" name="sortData" onChange={sorting} value={state.sortData}>
                                                        <option value={1}>DEFAULT SORTING</option>
                                                        <option value={2}>PRICE</option>
                                                        <option value={3}>ESTIMATE COMPLETION</option>
                                                        <option value={4}>START DATE</option>
                                                        <option value={5}>LANGUAGE</option>
                                                        <option value={6}>NEWEST</option>
                                                    </select>
                                                </div>
                                                {/* <label htmlFor="sortData" className="label_select_sort_data">{defaultLang.lang.courseType}</label> */}
                                                <div className="select_sort_data">
                                                    <select className="form-control select-filter" name="sortData" onChange={changeTabSFF} value={state.tabMenuTypeActiveSFF}>
                                                        {state.listCategorySFF.map((item, id) =>
                                                            <option value={item.type} key={id}>{item.text}</option>
                                                        )}
                                                    </select>
                                                </div>
                                            </>
                                            :
                                            <div style={{ maxWidth: "250px" }}>
                                                <select className="form-control select-filter" name="sortData" onChange={sorting} value={state.sortData}>
                                                    <option value={1}>DEFAULT SORTING</option>
                                                    <option value={2}>SORT A - Z</option>
                                                    <option value={3}>SORT Z - A</option>
                                                    <option value={4}>MOST POPULAR</option>
                                                </select>
                                            </div>
                                        }

                                    </div>
                                    <div className="col-md-3">
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
                        : <div></div>
                }

            </>
        )
    }

    return (
        <>
            <style>
                {
                    `
                    .tab-style4 .nav-tabs .nav-link {
    
                    }
                    
                    .tab-style4 .nav-tabs .nav-link.active {
                        border-bottom-color: transparent;
                        color: #000000;
                    }
                    
                    
                    .div-list-article {
                        margin: 0 auto;
                    }
                    
                    .div-list-article .col-md-4{
                        padding: 7px 5px;
                        cursor: pointer;
                    }
                    
                    .team_title{
                        padding: 15px 25px;
                    }
                    
                    .team_img img {
                        height: 200px;
                    }
                    
                    .tab-style4 .nav-tabs li.nav-item a{
                        margin: 0;
                        border-right: 2px solid #000000;
                        border-radius: 0;
                        font-family: 'poppinsmedium', sans-serif;
                        color: #4d4d4d !important;
                    }
                    
                    .tab-style4 .nav-tabs li.nav-item:last-child a{
                        border-right: 0px;
                    }
                    
                    .tab-style4 .nav-tabs li.nav-item {
                        margin-right: 0px;
                        padding: 0;
                        margin: 0;
                        line-height: 0;
                    }
                    
                    .search-container {
                        max-width: 1080px !important;
                        margin: 50px auto 60px;
                    }
                    
                    .row.justify-content-center {
                        padding: 80px 0 70px;
                    }
                    
                    span.search_info {
                        font-family: 'poppinsmedium', sans-serif;
                        font-size: 14px;
                        float: right;
                        margin-top: 10px;
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
                    
                    .search-result {
                        padding: 30px 5px 80px;
                    }
                    
                    .checkbox {
                        padding-left: 10px; 
                    }
                    .checkbox label 
                    {
                        display: inline-block;
                        position: relative;
                        padding-left: 5px; 
                        margin:0;
                        display: inline-block;
                        font-family: 'poppinsmedium', sans-serif;
                        font-size: 12px;
                        border: 0;
                        padding:0;
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
                    .checkbox input[type="checkbox"]:checked + label::before {
                        display: inline-block;
                        position: absolute;
                        width: 17px;
                        height: 17px;
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
                    .checkbox input[type="checkbox"]:checked + label::before {
                        font-family: 'FontAwesome';
                        content: '\\f00c'; 
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
                    ${state.showIqosPage ?
                        ` .iqos-top-banner{
                        background-size: cover;
                        background-position: center;
                        height: 400px;
                        display: block;
                        position: relative;
                        top: -12px;
                       }
                    
                       .iqos-top-quiz{
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
                        }`
                        : ``}
                    
                    .redeem_box {
                        background-color:#f2f2f2;
                        height: 450px;
                        font-family: 'poppinssemibold';
                        color: #fff;
                        text-align: left;
                        margin: 0 0px;;
                        border-radius:5px;
                    }
                    .redeem-reward-title{
                        padding:50px 0 20px;
                    }
                    
                    
                    .btn-redeem-code {
                        padding: 5px 15px 5px 20px;
                        color: #5277dd !important;
                        border: 1px solid #5277dd;
                        font-style: normal;
                        font-size: 12px;
                        text-transform: none;
                        font-family: 'poppinssemibold', sans-serif;
                        background-color: #fafafa;
                        border-radius: 25px 0 0 25px;
                        border-right-width: 4px;
                    }
                    
                    .btn-redeem-code:hover {
                        background-color: #1083c8;
                        color: #fff !important;
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
                            margin-top: 10%;
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
                        .select_sort_data{
                            display: block;
                            width: max-content;
                            margin: 0 0 1rem 0;
                        }
                    }
                    `
                }
            </style>
            {
                {
                    [true]:
                        <>
                            <a href={state.configBannerUrl != '' ? state.configBannerUrl : '#'} target="_blank" rel="noreferrer">
                                <div className="iqos-top-banner" style={{ backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${state.userDocument}iqos/banner-top.png)` }} data-img-src={`${state.userDocument}iqos/banner-top.png`}>
                                </div>
                            </a>
                            <a id="aHrefLoadIqosQuiz"
                                onClick={() => onClickEvent('loadIqosQuiz', { allowJoin: state.raIqosQuiz.total_user_answer <= 0 ? 1 : 0, content: 'Beliver`s Quiz', articleId: state.raIqosQuiz.article_id, id: state.raIqosQuiz.id })}
                                target="_blank" rel="noreferrer"
                            >
                                <div className="iqos-top-quiz" style={{ backgroundImage: `url(${state.userDocument}iqos/banner-quiz.png)` }} data-img-src={`${state.userDocument}iqos/banner-quiz.png`}></div>
                            </a>
                        </>
                }[state.showIqosPage]
            }
            <section id="function" className="section-view-all" >
                <div className="container containter-view-all">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tab-style4">
                                {!isMobile && renderMenuSpecialNavigation()}
                                <div className="row">
                                    <div className="col-md-3">
                                        <br />
                                        <div id="admin-menu" className="panel panel-default">
                                            <div className="panel-heading">Category</div>
                                            <div className="list-group">
                                                {state.rsSidebarMenuList.map((v, idx) =>
                                                    <div key={idx}>
                                                        <a className="list-group-item" href={`${routeViewAll.menuSpecial.path}?menu=${v.md5id}`}>
                                                            <span>{v.title}</span>
                                                        </a>
                                                        {{
                                                            [1]: state.rsSidebarSubMenuList.map((x, idx) =>
                                                                <div className="list-group" key={idx}>
                                                                    <a className={x.md5id == state.param.cate ? 'active list-group-item sub-menu' : 'list-group-item sub-menu'} href={`${routeViewAll.menuSpecial.path}?cate=${x.md5id}`}>
                                                                        <span>{x.title}</span>
                                                                    </a>
                                                                </div>
                                                            )
                                                        }[v.show_submenu]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="panel-heading mt-4">Related Topic</div>
                                            <div className="list-group" >
                                                {state.relatedTopic.map((v, idx) =>
                                                    <a className="list-group-item" href={`${routeViewAll.menuSpecial.path}?menu=${v.awb_mst_menu_id}`} key={idx}>
                                                        <span>{v.awb_mst_menu_id_title}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-9" >
                                        {isMobile && renderMenuSpecialNavigation()}
                                        <LoadingData loading={state.loading} />
                                        <div className="tab-content" style={cssTarget(state.loading)}>
                                            <div className="tab-pane fade show active" id="function-tab1" role="tabpanel" aria-labelledby="home-tab1" >
                                                <div className={`row ${state.tabMenuTypeActive == 5 ? `div-list-course` : `div-list-article`}`}>
                                                    {state.renderContentDetail}
                                                </div>
                                            </div>
                                        </div>

                                        {{
                                            [false]: {
                                                ["1"]: <div className="container submit-your-idea-containter" style={cssTarget(state.loading)}>
                                                    <div className="row align-items-center submit-your-idea">
                                                        <div className="col-lg-12 col-md-12 col-sm-12" style={{ padding: "5px" }}>
                                                            <div className="mb-12 mb-lg-0 animation" data-animation="fadeInLeft" data-animation-delay="0.1s">
                                                                <p className="idea-intro">{defaultLang.lang.home_submit_idea_description}</p>

                                                                <div className="newsletter_form">
                                                                    <form id="formSubmitIdea" style={{ borderBottom: "2px solid #000000" }} onSubmit={
                                                                        (e) => {
                                                                            e.preventDefault();
                                                                            setState(state => ({ ...state, modalProp: { modalShow: true, id: state.messageSubmitIdea, type: 'submitIdea' }, messageSubmitIdea: "" }))
                                                                        }
                                                                    }>
                                                                        <div className="">
                                                                            <textarea wrap="hard" cols="30" name="message" id="message" rows="1" type="text" autoComplete="off" placeholder={defaultLang.lang.home_submit_idea_textbox} value={state.messageSubmitIdea} onChange={(e) => setState(state => ({ ...state, messageSubmitIdea: e.target.value }))} required></textarea>
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
                                            }[state.tabMenuTypeActive]
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

function Custom_page(props) {
    const [state, setState] = useContext(GlobalState)
    const history = useHistory();
    const articleRef = useRef(null);
    const subCategoryRef = useRef();
    const cardBodyRef = useRef([]);
    const cardHeaderRef = useRef([]);
    const settingsSubCategoryPage = {
        className: 'sub-category',
        autoplay: false,
        slidesToShow: state.slidestoShowSubCategory,
        slidesToScroll: 1,
        infinite: state.rsSidebarSubMenuList.length < state.slidestoShowSubCategory ? false : true,
        arrows: false,
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
        ],
        swipeToSlide: true
    }
    // const dummyData = [
    //     {title:"Consumer Centricity 101", image:"https://dummyimage.com/300x150/000000/fff.png",upperTitle:"I just joined the company <br/> (Within my 1st month of onboarding)",color:'#facecb'},
    //     {title:"Employee Centricity 101", image:"https://dummyimage.com/300x150/000000/fff.png",upperTitle:"I'm in the middle of onboarding <br/> (Within my first 3 months)",color:'#74aba9'},
    //     {title:"Contextual Employee Centricity", image:"https://dummyimage.com/300x150/000000/fff.png",upperTitle:"I am performing my day-to-day tasks",color:'#ffa500'},
    //     {title:"Consumer / Employee Centric Project", image:"https://dummyimage.com/300x150/000000/fff.png",upperTitle:"I am assigned on a project",color:'#00ffd0'},
    // ]
    const lang = securityData.Security_lang()
    
    useEffect(() => {
        if (state.pageContent) {
            const load_all_data = [
                getSliderData(),
                getSidebarMenu(),
                updateHeight()
            ]
            Promise.allSettled(
                load_all_data
            ).then(() =>
                props.loading(false)
            )

        }
    }, [state.pageContent]);

    useEffect(() => {
        if (state.pageContent) {
            getArticle()
        }
    }, [state.sortData, state.refineBy, state.pageContent, state.param, state.subCategoryActive])

    // useEffect(()=>{
    //     if(state.pageContent){
    //         if(state.forLoop && state.forLoop.length > 0){
    //             updateHeight()
    //         }
    //     }
    // },[])

    const updateHeight = () => {
        if (state.forLoop && state.forLoop.length === cardHeaderRef.current.length) {
            let maxHeightBody = 0;
            let maxHeightHeader = 0;
            for (var i = 0; i < state.forLoop.length; i++) {
                if (maxHeightBody < cardBodyRef.current[i].current.clientHeight) {
                    maxHeightBody = cardBodyRef.current[i].current.clientHeight;
                }
                if (maxHeightHeader < cardHeaderRef.current[i].current.clientHeight) {
                    maxHeightHeader = cardHeaderRef.current[i].current.clientHeight;
                }
            }
            setState(state => ({ ...state, cardBodyHeightSubCategory: maxHeightBody, cardHeaderHeightSubCategory: maxHeightHeader }))
        }
    }

    const getSliderData = async () => {
        const param = {
            categoryId: state.param.cate,
            platform_id: securityData.Security_getPlatformId(),
            flag_active: '1',
            limit: 200,
            offset: 0
        }
        let response = await axiosLibrary.postData('awbSliderCustomPage/ListData', param)
        if (response.status === 200) {
            setState(state => ({ ...state, custom_page_sliders: response.data.data, totalSlider: response.data.data.length }))
        }
    }

    const getSidebarMenu = async () => {
        let menu_id = await axiosLibrary.getmd5FromBackend(state.param.menu ? state.pageContent[0].id : state.pageContent[0].menu_id);
        
        let param = {
            platform_id: securityData.Security_getPlatformId(),
            category: state.param.cate,

            is_myperf: (state.titlePage.toLowerCase().trim() == "my performance" ? "1" : "0"),
            menu_id: menu_id,
        }

        let response = await axiosLibrary.postData('awbCustomPage/SidebarMenuList', param);
        if (response.status === 200) {
            cardBodyRef.current = response.data.data2.map((_, i) => cardBodyRef.current[i] ?? createRef())
            cardHeaderRef.current = response.data.data2.map((_, i) => cardHeaderRef.current[i] ?? createRef())
            
            setState(state => ({ ...state, 
                rsSidebarMenuList: response.data.data, 
                rsSidebarSubMenuList: response.data.data2, 
                forLoop: response.data.data2, 
                rsTopbarCategory4List: response.data.data4, 
                rsSlider:  response.data.data5,
                is_myperf: (response.data.data4 != undefined && response.data.data4 != null) 
            }))

            if (!state.rsTopbarCategory4List) {
                setState(state => ({ ...state, 
                    rsTopbarCategory4List: response.data.data4
                }))
    
            }

        }
    }

    const getArticle = async () => {
        setState(state => ({ ...state, loading: true }))
        const tabMenuActive = state.tabMenu.filter(v => v.active == true)

        if (tabMenuActive[0].type == 4) {
            state.contentTypeID = 6
        } else {
            state.contentTypeID = null
        }

        let paramGetArticle = {
            platform_id: securityData.Security_getPlatformId(),
            user_id: securityData.Security_UserId(),
            sortBy: state.sortData,
            filter_search: state.searchKeyword,
            category4: JSON.stringify(state.refineBy),
            lang: securityData.Security_lang(),
            contentTypeID: state.contentTypeID
        }

        if (state.param.cate) {
            paramGetArticle = { ...paramGetArticle, category_id: state.pageContent[0].id }
        }
        if (state.param.articleId) {
            paramGetArticle = { ...paramGetArticle, article_id: state.param.articleId }
        }
        if (state.param.sub) {
            paramGetArticle = { ...paramGetArticle, sub_category: state.param.sub }
        }

        let response = await axiosLibrary.postData('awbHome/ListArticleByMenuId', paramGetArticle);
        if (response.status === 200) {
            setState(state => ({ ...state, rsSidebarCategory4List: response.data.data2, articleList: response.data.data, totalSearch: response.data.data.length, loading: false }))
            props.loading(false)
        }
    }

    const sorting = (e) => {
        setState(state => ({ ...state, sortData: e.target.value }))
    }

    const filterData = (category_4) => {
        let isi = []
        if (state.refineBy.includes(category_4)) {
            isi = state.refineBy.filter(v => v !== category_4)
        } else {
            isi = [...state.refineBy, category_4]
        }

        setState(state => ({ ...state, refineBy: isi }))
    }

    const onClickEvent = async (type, param) => {
        switch (type) {
            case 'shareArticle':
                setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'article' }, flagShowArticle: true }))
                break;
            case 'loadArticleQuiz':
                // if(!state.flagShowArticle){
                //     await axiosLibrary.contentAccessLog({contenType: param.content,articleId: param.articleId,trnId: param.id})
                // }
                setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'quiz', param: param }, flagShowArticle: false }))
                break;
            case 'logActivityArticle':
                if (!state.flagShowArticle) {
                    let isi = await axiosLibrary.contentAccessLog({ contenType: param.content, articleId: param.articleId, trnId: param.id })
                    if (isi) {
                        if (isi.status === 200) {
                            setState(state => ({ ...state, modalProp: { modalShow: false, id: null, loadContent: true } }))
                        }
                    }
                }
                window.open(param.hyperlink_url, '_blank')
                break;
            case 'loadIqosQuiz':
                if (param.allowJoin) {
                    if (!state.flagShowArticle) {
                        await axiosLibrary.contentAccessLog({ contenType: param.content, articleId: param.articleId, trnId: param.id })
                        setState(state => ({ ...state, modalProp: { modalShow: true, id: param.id, type: 'quiz', iqosQuiz: 1 }, flagShowArticle: false }))
                    }
                } else {
                    let alertSuccess =
                        <div dangerouslySetInnerHTML={{
                            __html: defaultLang.lang.alreadySubmitQuizIqos
                        }} />
                    setState(state => ({ ...state, modalProp: { modalShow: true, id: null, type: 'alertShow', messageTitlePopup: alertSuccess, needSubtitle: false, messageSubtitlePopup: "" } }))
                }
                break;
            default:
                break;
        }

    }

    const addSubCategory = (param) => {
        //change link every click in sidebar category
        history.push({
            pathname: routeViewAll.customPage.path,
            search: "?" + new URLSearchParams({ cate: state.param.cate }).toString() + "&" + new URLSearchParams({ sub: param.idPage }).toString()
        })
        setState(state => ({ ...state, param: { cate: state.param.cate, sub: param.idPage } }))
        window.scrollTo({ top: articleRef.current.offsetTop - 60, behavior: 'smooth' })

        
        //end
    }

    // eslint-disable-next-line
    const arrowSubCategoryClick = (type) => {
        if (state.param.sub) {
            if (state.rsSidebarSubMenuList.length > 0) {
                const currentIdPage = state.param.sub
                let getIndexCurrentPage = state.rsSidebarSubMenuList.findIndex(v => v.idPage === currentIdPage)
                switch (type) {
                    case 'left':
                        if (getIndexCurrentPage === 0) {
                            getIndexCurrentPage = state.rsSidebarSubMenuList.length - 1
                        } else {
                            getIndexCurrentPage = getIndexCurrentPage - 1
                        }
                        // subCategoryRef.current.slickPrev()
                        break;
                    case 'right':
                        if (getIndexCurrentPage === state.rsSidebarSubMenuList.length - 1) {
                            getIndexCurrentPage = 0
                        } else {
                            getIndexCurrentPage = getIndexCurrentPage + 1
                        }
                        // subCategoryRef.current.slickNext()
                        break;
                    default:
                        break;
                }
                const newIdPage = state.rsSidebarSubMenuList[getIndexCurrentPage].idPage
                addSubCategory({ idPage: newIdPage })
            }
        } else {
            const getIdPageIndexZero = state.rsSidebarSubMenuList[0].idPage
            addSubCategory({ idPage: getIdPageIndexZero })
        }

    }

    const sliderSettings = {
        dots: true,
        arrows: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000
    };

    return (
        <>
            <style>
                {`
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
                    .checkbox label 
                    {
                        display: inline-block;
                        position: relative;
                        padding-left: 5px; 
                        margin:0;
                        display: inline-block;
                        font-family: 'poppinsmedium', sans-serif;
                        font-size: 12px;
                        border: 0;
                        padding:0;
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
                    .checkbox input[type="checkbox"]:checked + label::before {
                        display: inline-block;
                        position: absolute;
                        width: 17px;
                        height: 17px;
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
                    .checkbox input[type="checkbox"]:checked + label::before {
                        font-family: 'FontAwesome';
                        content: '\\f00c'; 
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

                    .custom-page-slider-class i.fa {
                        display:none
                    }

                    .custom-page-slider-class:hover i.fa {
                        display:block
                    }
                    .upperTitle {
                        // min-height:6vh;
                        color:#fff;
                        font-size: 80%;
                    }
                    .sub-category-card{
                        filter:brightness(40%);
                        transition-duration:0.5s;
                        cursor:pointer;
                    }
                    .sub-category-card:hover{
                        opacity:1;
                        filter:brightness(100%);
                        transition-duration:0.5s;
                    }
                    .marker-sub-category-card{
                        visibility:hidden;
                    }
                    .sub-category-card:hover .marker-sub-category-card{
                        visibility:visible;
                    }
                    .card-deck-sub-category{
                        justify-content: space-between;
                    }
                    .active-card{
                        opacity:1;
                        filter:brightness(100%);
                        visibility:visible;
                    }
                    .button-sub-category{
                        color:#fff
                        transition-duration:0.5s;
                        cursor:pointer;
                    }
                    .button-sub-category:hover{
                        opacity:1;
                    }
                    .header-sub-category{
                        background-color:unset !important;
                        // flex: 0 1 auto !important;
                    }
                    .inner{
                        position:absolute;
                        font-size:20px;color:#fff; font-weight:bold;text-decoration:none; transition:.3s ease border-color
                    }
                    .inner #inner-p{
                        font-size:14px;color:#fff; text-decoration:none; transition:.3s ease border-color
                    }
                    .custom-page-slider-class{
                        margin-bottom: -7px;
                    }
                    ${state.rsSidebarSubMenuList.length <= state.slidestoShowSubCategory &&
                    `.sub-category .slick-track{
                        width:100% !important;
                        display:flex;
                        justify-content: space-between;
                    }`
                    }

                    .my-perf-header {
                        background-color: #efefef;
                        text-align: center;
                        position: relative;
                        
                    }
                    .my-perf-header-main {
                        border-radius: 15px;
                        background: #fff;
                        width: 88%;
                        padding: 5.3% 0 2% 0;
                        margin: auto;
                        box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
                        position: relative;
                        z-index: 11;
                    }
                    .my-perf-item {
                        cursor: pointer;
                    }
                    .my-perf-item:hover {
                        cursor: pointer;
                        animation: my-perf-hover 1s ease;
                    }
                    .my-perf-item.active {
                        animation: my-perf-active 2s ease infinite;
                    }
                    .my-perf-header-additional {
                        
                    }
                    .my-perf-slider {
                        width: 26%;
                        position: absolute;
                        z-index: 12;
                        left: 13.9%;
                        top: 121.5%;
                        text-align: left;
                        height: 30%;
                    }
                    .myperf-item-slider {
                        display: flex !important;
                        
                    }
                    .my-perf-slider h3 {
                        color: #fff;
                        margin-top: 2%;
                    }
                    .my-perf-slider P {
                        color: #fff;
                        font-size: 9pt;
                    }
                    .my-perf-slider img {
                        width: 21.9%;
                        height: 21.9%;
                        border-radius: 50%;
                        margin: 1%;
                    }
                    .slick-dots {
                        position: absolute !important; 
                        top: 86% !important;
                    }
                    .slick-list {
                        border-top-left-radius: 57px  !important;
                        border-bottom-left-radius: 57px  !important;
                    }
                    @media (max-width: 1280px) {
                        .slick-list {
                            border-top-left-radius: 57px  !important;
                            border-bottom-left-radius: 57px  !important;
                        }
                        .my-perf-slider h3 {
                            color: #fff;
                            margin-top: 1%;
                            margin-bottom: 7px;
                            font-size: 14pt;
                        }
                        .my-perf-slider P {
                            color: #fff;
                            font-size: 6.5pt;
                        }
                        .slick-dots {
                            position: absolute !important; 
                            top: 75% !important;
                        }
                        .slick-dots li {
                            width: 10px;
                            height: 10px;
                            margin: 0 2px;
                        }
                        .my-perf-slider {
                            top: 121%;
                        }
                    }
                    @keyframes my-perf-active {
                        0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                        50% {transform: translateY(-5px);}
                        100% {transform: translateY(0);}
                    }
                    @keyframes my-perf-hover {
                        0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                        50% {transform: translateY(-5px);}
                        100% {transform: translateY(0);}
                    }
                `}
            </style>
            <div id="topic" className="section-topic">
                <div className="container web-tour-section-topic">
                    <div className="row justify-content-center2">
                        <div className="col-md-12">
                            <div className=" text-center">
                                <h2 className="section-title pb-3">{state.titlePage}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {
                state.is_myperf ?
                <>
                    <img src={`${state.userDocument}sub_category/header_bg.png`} className='img-fluid' style={{marginTop: -100}} />
                    <div className='my-perf-header'>
                        <div className='my-perf-header-main' >
                            {
                                state.rsTopbarCategory4List.filter(w => (w.action_type == 'filter' || w.action_type == 'image' || w.action_type == 'link') && (w.category_image.indexOf("header_bg") < 0 && w.category_image.indexOf("header_bg") < 0)).map((item, index) => 
                                    <>
                                        <style>{`.my-perf-item-${index} { ${item.custom_style} }`}</style>
                                        <img onClick={() => item.action_type == "filter" ? addSubCategory(item) : window.location.replace(item.action_link) } 
                                            src={`${state.userDocument}sub_category/${item.category_image}`} 
                                            className={`img-fluid ${item.action_type == "filter" || item.action_type == "link" ? "my-perf-item" : ""} my-perf-item-${index} ${state.param.sub == item.idPage ? "active" : ""}`} />        
                                    </>
                                    
                                )
                            }
                        </div>
                        <div className='my-perf-header-additional'>
                            <div className='my-perf-slider' >
                                <Slider {...sliderSettings}>
                                    {
                                        state.rsSlider.map((item, index) => 
                                            <div className='myperf-item-slider' >
                                                <img src={`${state.userDocument}slider_custom_page/${item.slider_video}`} onError={(e) => e.target.src = `${state.userDocument}sub_category/photo_default.jpg`}  />
                                                <div style={{paddingLeft: '4%'}}>
                                                    <h3>{item.headline}</h3>
                                                    <p>{item.short_description}</p>
                                                </div>
                                            </div>
                                        )
                                    }
                                </Slider>
                            </div>
                        </div>
                    </div>
                    
                    <img src={`${state.userDocument}sub_category/footer_bg.png`} className='img-fluid' style={{ 'maxWidth': '100%', 'height': 'auto', 'marginTop': '-80px', 'zIndex': '10', 'position': 'relative' }} />
                </>
                :
                <>
                    <Slider {...settingsCustomPage}>
                        {state.custom_page_sliders.map((v, idx) =>
                            <div key={idx}>
                                {v.hyperlink_url == '<br/>' ?
                                    <div>
                                        <img src={`${state.userDocument}slider_custom_page/${v.slider_video}`} alt={v.slider_video} onError={(e) => e.target.src = `${srcError}daily_feeds/${v.slider_video}`} style={{ width: '100%', height: '40vh' }} />
                                        <div className="inner">
                                            <div dangerouslySetInnerHTML={{
                                                __html: securityData.Security_lang() === 'ENG' ? v.headline : v.headline_ind
                                            }} />
                                            <div id="inner-p">
                                                <div dangerouslySetInnerHTML={{
                                                    __html: securityData.Security_lang() === 'ENG' ? v.short_description : v.short_description_ind
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    <a href={v.hyperlink_url} target="_blank" rel="noreferrer">
                                        <img src={`${state.userDocument}slider_custom_page/${v.slider_video}`} alt={v.slider_video} onError={(e) => e.target.src = `${srcError}daily_feeds/${v.slider_video}`} style={{ width: '100%', height: '40vh' }} />
                                        <div className="inner">
                                            <div dangerouslySetInnerHTML={{
                                                __html: securityData.Security_lang() === 'ENG' ? v.headline : v.headline_ind
                                            }} />
                                            <div id="inner-p">
                                                <div dangerouslySetInnerHTML={{
                                                    __html: securityData.Security_lang() === 'ENG' ? v.short_description : v.short_description_ind
                                                }} />
                                            </div>
                                        </div>
                                    </a>
                                }

                            </div>
                        )}
                        
                    </Slider>
                    {
                        state.rsSidebarSubMenuList.length > 0 &&
                        <div className="sub-category row pb-3 pt-3" style={{ backgroundImage: `url(${state.assets}images/background-custom-page.png)`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', marginRight: 0 }}>
                            <div className="col-md-1 text-center align-self-center" style={{ top: '5vh' }}>
                                <i className={`fa fa-angle-left fa-5x button-sub-category`} style={{ color: '#fff', visibility: state.rsSidebarSubMenuList.length <= state.slidestoShowSubCategory ? 'hidden' : 'visible' }} aria-hidden="true" onClick={() =>
                                    // arrowSubCategoryClick('left')
                                    subCategoryRef.current.slickPrev()
                                }></i>
                            </div>
                            <div className="col-md-10 col-sub-category">
                                {/* <CardDeck className="pt-3 pb-5 card-deck-sub-category"> */}
                                <Slider {...settingsSubCategoryPage} ref={subCategoryRef}>
                                    {state.rsSidebarSubMenuList.map((value, index) =>
                                        <Card key={index} className={`border-0 sub-category-card ${state.param.sub === value.idPage && `active-card`} header-sub-category pb-2 pr-2 pl-2`} onClick={() => addSubCategory(value)}>
                                            <Card.Header className="text-center border-0 header-sub-category pt-0 pb-0" style={{ borderRadius: '0' }} >
                                                <div className="upperTitle" style={{ height: state.cardHeaderHeightSubCategory }} ref={cardHeaderRef.current[index]} dangerouslySetInnerHTML={{
                                                    __html: lang === 'ENG' ? value.description : value.description_ind
                                                }} />
                                                <i className={`fa fa-map-marker fa-2x marker-sub-category-card ${state.param.sub === value.idPage && `active-card`}`} style={{ color: '#d61212' }} aria-hidden="true"></i>
                                            </Card.Header>
                                            <Card.Body className="text-center p-3" style={{ backgroundColor: value.background_color }} >
                                                <div className="col-md-12 align-items-center justify-content-center pb-3" style={{ height: state.cardBodyHeightSubCategory, display: 'flex' }} ref={cardBodyRef.current[index]}>
                                                    <h6 className="mb-0">{lang === 'ENG' ? value.title : value.title_ind}</h6>
                                                </div>
                                                <img src={`${state.userDocument}sub_category/${value.category_image}`} style={{
                                                    width: '-webkit-fill-available',
                                                    // maxWidth:'300px', 
                                                    // height:'150px'
                                                }} onLoad={() => updateHeight()} />
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Slider>
                                {/* </CardDeck> */}
                            </div>
                            <div className="col-md-1 text-center align-self-center" style={{ top: '5vh' }}>
                                <i className={`fa fa-angle-right fa-5x button-sub-category`} style={{ color: '#fff', visibility: state.rsSidebarSubMenuList.length <= state.slidestoShowSubCategory ? 'hidden' : 'visible' }} aria-hidden="true" onClick={() =>
                                    // arrowSubCategoryClick('right')
                                    subCategoryRef.current.slickNext()
                                }></i>
                            </div>
                            <div className="col-md-12">
                                <div className="d-flex flex-row justify-content-between pl-3">
                                    <div><img src={`${state.assets}images/icon-text-subcategory-custompage.png`} alt="icon-text-subcategory-custompage" style={{ width: '50vw' }} /></div>
                                    <div><img src={`${state.assets}images/icon-subcategory-custom-page.png`} alt="icon-subcategory-custompage" style={{ width: '26vw' }} /></div>
                                </div>
                            </div>
                        </div>
                    }
                </>
            }

            {/* slider sub category */}
            <section id="function content-article" ref={articleRef} className="section-view-all pt-4" >
                <div className="container containter-view-all">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="tab-style4">
                                <div className="row">
                                    <div className="col-md-3">
                                        &nbsp;
                                    </div>
                                    <div className="col-md-9">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div style={{ maxWidth: "250px" }}>
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
                                        <br />
                                        <div id="admin-menu" className="panel panel-default">
                                            <>
                                                <div className="panel-heading">Category</div>
                                                <div className="list-group">
                                                    
                                                    {
                                                        
                                                        state.is_myperf ? 
                                                        state.rsSidebarMenuList.map((v, idx) =>
                                                            <div className="" key={idx}>
                                                                <h4 className={"active list-group-item"} >
                                                                    <span>{v.titleMenu}</span>
                                                                </h4>
                                                                {state.rsSidebarSubMenuList.map((x, idxSubMenu) =>
                                                                    <div className="list-group" key={idxSubMenu}>
                                                                        <a className={x.idPage == state.param.cate ? 'active list-group-item sub-menu' : 'list-group-item sub-menu'} role="button" tabIndex="0" style={{ cursor: 'pointer' }} href={`viewall/${x.idPage != state.param.cate ? "cate" : "custom_page"}?cate=${x.idPage}`}>
                                                                            <span>
                                                                                <div dangerouslySetInnerHTML={{
                                                                                    __html: x.title
                                                                                }} />
                                                                            </span>
                                                                        </a>
                                                                    </div>
                                                                )
                                                                }
                                                            </div>
                                                        )
                                                        :
                                                        state.rsSidebarMenuList.map((v, idx) =>
                                                            <div className="" key={idx}>
                                                                <a className={v.idPage === state.param.cate && !state.param.sub ? "active list-group-item" : "list-group-item"} href={`${routeViewAll.customPage.path}?cate=${v.idPage}`}>
                                                                    <span>{v.title}</span>
                                                                </a>
                                                                {state.rsSidebarSubMenuList.map((x, idxSubMenu) =>
                                                                    <div className="list-group" key={idxSubMenu}>
                                                                        <a className={x.idPage == state.param.sub ? 'active list-group-item sub-menu' : 'list-group-item sub-menu'} role="button" tabIndex="0" style={{ cursor: 'pointer' }} onClick={() => addSubCategory(x)}>
                                                                            <span>
                                                                                <div dangerouslySetInnerHTML={{
                                                                                    __html: x.title
                                                                                }} />
                                                                            </span>
                                                                        </a>
                                                                    </div>
                                                                )
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </>

                                            <div className="panel-heading" style={{ paddingTop: '30px' }}>Refine by</div>
                                            <div className="list-group pl-2" >
                                                {state.rsSidebarCategory4List.map((v, idx) =>
                                                    <Form.Check
                                                        type={'checkbox'}
                                                        id={`checkbox${idx}`}
                                                        key={idx}
                                                        className="checkbox checkbox-circle"
                                                    >
                                                        <Form.Check.Input type={'checkbox'} onChange={() => filterData(v.category_4)} />
                                                        <Form.Check.Label>{v.category_4}</Form.Check.Label>
                                                    </Form.Check>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-9" >
                                        <LoadingData loading={state.loading} />
                                        <div className="tab-content" style={cssTarget(state.loading)}>
                                            <div className="tab-pane fade show active" id="function-tab1" role="tabpanel" aria-labelledby="home-tab1">
                                                <div className="row div-list-article">
                                                    {/* foreach article list */}
                                                    {state.articleList.map((v, idx) =>
                                                        <div className="col-md-4 item " key={idx}>
                                                            <object>
                                                                <a tabIndex="0" role="button" onClick={() => onClickEvent('shareArticle', { content: 'Article', articleId: v.article_id, id: v.id })}
                                                                    className="share-article"><i className="ion-share"></i>
                                                                </a>
                                                            </object>
                                                            <a onClick={
                                                                v.show_quiz == 1 ?
                                                                    () => onClickEvent('loadArticleQuiz', { content: 'Article', articleId: v.article_id, id: v.id })
                                                                    :
                                                                    () => onClickEvent('logActivityArticle', { content: 'Article', articleId: v.article_id, id: v.id, hyperlink_url: v.hyperlink_url })
                                                            }
                                                                tabIndex="0" role="button"
                                                            >
                                                                <div className={`team_box white_bg team_hover_style2 social_white ${v.flag_read == 1 ? `disabled-article` : ``}`}>
                                                                    {v.flag_quiz == 1 ?
                                                                        <img className='poin-flag' src={`${state.assets}img/poin${v.show_quiz == 0 ? `-grayscale` : ``}.png`} />
                                                                        :
                                                                        null
                                                                    }
                                                                    <div className="team_img">
                                                                        <img src={`${state.userDocument}article/${v.article_image}`} alt={v.article_image} onError={(e) => e.target.src = `${srcError}article/${v.article_image}`} />
                                                                    </div>
                                                                    <div className="team_title">
                                                                        <h5>
                                                                            {securityData.Security_lang() == 'ENG' ? v.title : v.title_ind}
                                                                        </h5>
                                                                        <span>
                                                                            {securityData.Security_lang() == 'ENG' ? v.description : v.description_ind}
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

export default ViewAll;