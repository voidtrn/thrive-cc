import React, {
    useEffect, useState
} from 'react';

import { env, securityData } from './../../helpers/globalHelper';

import './../../i18n.js'

import { useTranslation } from "react-i18next";

function Header() {

    const [state, setState] = useState({
        selectLanguage: 'en',
    });
    const clickLanguage = async (newLangSelect) => {
        setState({ ...state, selectLanguage: newLangSelect })
        handleChangeLanguage(newLangSelect);
    }

    const { t, i18n: { changeLanguage, language } } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(language)
    const handleChangeLanguage = (newLangSelect) => {
        setCurrentLanguage(newLangSelect);
        changeLanguage(newLangSelect);
    }

    return (

        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
            <div className="container">
                <a className="navbar-brand" href="#"><img src={env.assets + "_newdialogue/images/logo-size-small.png"} /></a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    Menu
                    <i className="fas fa-bars ms-1"></i>
                </button>
                <div className="collapse navbar-collapse " id="navbarResponsive">
                    <ul className="navbar-nav ms-auto py-4 py-lg-0 d-flex">
                        <li className="nav-item  justify-content-center m-auto">
                            <a className="nav-link" href="#leaders">{t('textMenuOurLeaders')}</a>
                        </li>
                        <li className="nav-item justify-content-center m-auto">
                            <a className="nav-link" href="#list-submit">{t('textMenuSeeSubmitQuestions')}</a>
                        </li>

                        <li className="nav-item justify-content-center m-auto">
                            <a className="nav-link" href="#form-submit">
                                <div className="pre-submitted-question-page-alt4eng-button-primary-button2">
                                    <span className="pre-submitted-question-page-alt4eng-text282">
                                        <span>{t('textMenuSubmitYourQuestion')}</span>
                                    </span>
                                </div>
                            </a>
                        </li>

                        <li className="nav-item  justify-content-center m-auto">
                            <a role="button"
                                onClick={() => {
                                    clickLanguage('ind');
                                }}
                                id="textLangInd" className={state.selectLanguage == "ind" ?
                                    'nav-link-lang-activated' : 'nav-link-lang'}>ID</a>
                            |
                            <a role="button"
                                onClick={() => {
                                    clickLanguage('en');
                                }}
                                id="textLangEng" className={state.selectLanguage == "en" ? 'nav-link-lang-activated' : 'nav-link-lang'}>ENG</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Header;