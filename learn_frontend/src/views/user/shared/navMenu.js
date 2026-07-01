/*
Note :
1. search data => data yang di search dimasukan ke dalam session dengan key searchData, session searchData akan dihapus jika sudah masuk ke halaman viewall
*/

import React, { useContext, useEffect, useState } from 'react';
import routeAll from '../../../helpers/route';
import { env, securityData, typePageMenuNCategory, typePagesPBONDigitalCampus } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import GlobalState from '../../../helpers/globalState';


import '../../../i18n.js';

import { useTranslation , Trans } from "react-i18next";

import "../../../assets/css/navMenu.scss"
import moment from 'moment';
<Trans i18nKey="common.greeting" />

function NavMenu(props) {
    
    const [state, setState] = useState({
        lang: securityData.Security_lang(),
        activePeriod: null,
        sectionList: [],
        menuList: [],
        categoryList: [],
        showDropdown: false,
        contentFromYourNetwork: 0,
        moduleTopMenuName: "",
        linkModuleTopMenu: "",
        currentTab: 0,
        selectLanguage:"en",
        loading: true,
        txtSearch: "",
        linkGamification: "https://aabb.com",
        showPlatform: true,
        notificationData: [
            // {id_notif_admin:1,description_en:"test notification",description_ind:"test notification ind",url:"www.google.com",status_read:0, image:null}
        ],
        notificationDataUnread: []
    })
    const [global, setGlobal] = useContext(GlobalState)

    let notifBellRef = React.useRef(null)

    const numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    
    const getAdminAccess2 = async()=>{
        const credentials = {
            user_id: securityData.Security_UserId()
        };
        const isi = await axiosLibrary.postData('awbHutUser/CheckAdminAccess',credentials);
        if(isi.status===200){
            setState(state =>({...state, 
                moduleTopMenuName:  isi.data.moduleData[0].name,
                linkModuleTopMenu:  isi.data.moduleData[0].url
            }))          
      }
    }

    useEffect(()=>{
        getAdminAccess2();
    },[])


    const { t, i18n: { changeLanguage, language } } = useTranslation();    
    
    const changeLaguange = async (newLangSelect) => {
        setState({ ...state, selectLanguage: newLangSelect })
        handleChangeLanguage(newLangSelect);
    }
    const handleChangeLanguage = (newLangSelect) => {
        changeLanguage(newLangSelect);
    }



    return (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="growth-mainNav">
            <div className="container pt-3">
                <a className="navbar-brand" href="#"></a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    Menu <i className="fas fa-bars ms-1"></i>
                </button>
                <div className="collapse navbar-collapse " id="navbarResponsive">
                    <ul className="navbar-nav ms-auto py-4 py-lg-0 d-flex">
                        <li className="nav-item justify-content-center m-auto">
                            <a href={state.linkModuleTopMenu} className="nav-link">
                                {state.moduleTopMenuName}
                            </a>
                        </li>
                        <li className="nav-item  justify-content-center m-auto"><a className="nav-link" href="#learning-solution">{t('textMenuLearningSolution')}</a></li>
                        <li className="nav-item justify-content-center m-auto"><a className="nav-link" href="#capability-model">{t('textMenuCapabilityModel')}</a></li>
                        <li className="nav-item justify-content-center m-auto"><a className="nav-link" href="#other-resource">{t('textMenuOtherResource')}</a></li>
                        <li className="nav-item justify-content-center m-auto">
                            <a className="nav-link" href="#access-idp">
                                <button className="btn btn-white rounded-pill px-3 mb-2 mb-lg-0 d-flex">
                                    <span className="justify-content-center m-auto">
                                        {t('textMenuAccessIDP')}
                                    </span>
                                </button>
                            </a>
                        </li>
                        {/*

                        remove link redeem point 7 Jan 2025
                        <li className="nav-item justify-content-center m-auto">
                            <a className="nav-link" href="#redeem-point">
                                <img className="arrow-big" src={env.assets + "landingpage/assets/images/ri-coupon-2-fill-zjh.png"} /> {numberWithCommas(securityData.Security_PointLandingPage())}
                            </a>
                        </li>
                        <li className="nav-item justify-content-center m-auto">
                            <a className="nav-link" href="#">


                            </a>
                        </li>
                        */}
                        <li className="nav-item  justify-content-center m-auto">
                            <a role="button"
                                onClick={() => {
                                    changeLaguange('ind');
                                }}
                                id="textLangInd" className={state.selectLanguage == "ind" ?
                                    'nav-link-lang-activated' : 'nav-link-lang'}>
                                    ID
                            </a>
                            |
                            <a role="button"
                                onClick={() => {
                                    changeLaguange('en');
                                }}
                                id="textLangEng" className={state.selectLanguage == "en" ? 'nav-link-lang-activated' : 'nav-link-lang'}>
                                    ENG
                            </a>
                        </li>

                        
                       
                    </ul>
                </div>
            </div>
        </nav>

    )



}

export default NavMenu;