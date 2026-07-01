import React, {
  useEffect, useState
} from 'react';
import { useLocation } from 'react-router-dom';
import routeAll from './helpers/route';
import { env, securityData } from './helpers/globalHelper';
import axiosLibrary from './helpers/axiosLibrary';
import defaultLang from './helpers/lang';
// import { isMobile, isDesktop } from 'react-device-detect';


import './i18n.js'

import { useTranslation } from "react-i18next";

function App(props) {


  const totalPoint = securityData.Security_point();
  const [state, setState] = useState({
    anotherUserData: false,
    isMaintenanceMode: false,
    dataUserLearningPlan: [],
    dataUserLearningPlanCompleted: [],
    dataLearningSkillsMaster: [],
    ratingValue: [],
    userDocument: env.userDocument,
    assets: env.assets,
    category: [],
    categoryCompleted: [],
    selectedCategory: "",
    year: [],
    yearCompleted: [],
    selectedYear: "",
    loading: true,
    selectLanguage: 'en',
  });

  //filter user only in dev (to prevent another user access dev)
  // const filterUser = ()=>{
  //   const getUrl = window.location.href;
  //   if(!getUrl.includes('error')){
  //     if(getUrl.includes("dev")||getUrl.includes("localhost")){
  //       const listUser = [1000470279,1000451879,1000501855,1000209913,1000494053,1000173608,1000359749,1000215122]
  //       if(listUser.findIndex(v=>v==securityData.Security_UserId()) === -1){
  //         if(confirm('you go to the wrong link, please go to https://learn.culture.pmicloud.biz/')){
  //           window.location.href = 'https://learn.culture.pmicloud.biz/'
  //         }else{
  //           window.location.href = routeAll.routesComponent.notFound.path
  //         }
  //       }
  //     }
  //   }
  // }


  const maintenanceMode = async () => {
    let isi = await axiosLibrary.postData('awbUser/CekMaintenance');
    if (isi.status === 200) {
      if (isi.data.data != 0) {
        setState({ ...state, isMaintenanceMode: true })
      }
    }
  }

  const openInNewTab = (url) => {
    openNewTabSaveDatabase(url);
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  const openNewTabSaveDatabase = async (url) => {
    let response = await axiosLibrary.postData('awbHome/createHistoryLandingPage', { url: url, platform_id: state.platformId, user_id: securityData.Security_UserId() })
    if (response.status === 200) {
      setState(currentState => ({ ...currentState, sliderSff: response.data.data }))
    }
  }

  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(async () => {
    maintenanceMode();
  })


  const changeLaguange = async (newLangSelect) => {
    setState({ ...state, selectLanguage: newLangSelect })
    handleChangeLanguage(newLangSelect);
  }

  const { t, i18n: { changeLanguage, language } } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const handleChangeLanguage = (newLangSelect) => {
    setCurrentLanguage(newLangSelect);
    changeLanguage(newLangSelect);
    console.log("aaabbb : "+newLangSelect);
  }

  function UnderMaintenance() {
    return <div>

      <div id="layout-content">
        <br /><br />
        <div className="container" style={{ textAlign: "center" }}>
          <center>
            <img className="img-rounded" style={{ height: "400px" }} src={env.assets + 'img/UnderMaintenance.png'} />
          </center>
          <i>AWB is currently under maintenance started from March 1st and will be available on April 1st.<br /> For learning inquiries please contact people-culture.learning@pmi.com</i>

        </div>
      </div>
    </div>;
  }

  function ShowContent() {
    return <div>

      <div id="page-top" >
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
          <div className="container">
            <a className="navbar-brand" href="#"><img src={env.assets + "landingpage/assets/images/awb-logo.png"} /></a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
              Menu
              <i className="fas fa-bars ms-1"></i>
            </button>
            <div className="collapse navbar-collapse " id="navbarResponsive">
              <ul className="navbar-nav ms-auto py-4 py-lg-0 d-flex">
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
                <li className="nav-item justify-content-center m-auto">
                  <a className="nav-link" href="#redeem-point">
                    <img className="arrow-big" src={env.assets + "landingpage/assets/images/ri-coupon-2-fill-zjh.png"} /> {numberWithCommas(totalPoint)} {t('textMenuAWBPoints')}
                  </a>
                </li>
                <li className="nav-item justify-content-center m-auto">
                  <a className="nav-link" href="#">

                    <img
                      src={securityData.Security_UserProfilePicture()}
                      fluid={true}
                      thumbnail={true}
                      title="Click for Change"
                      height="25px"
                      onClick={() => axiosLibrary.getPhoto(securityData.Security_UserAccount())}

                    />
                  </a>
                </li>
                <li className="nav-item  justify-content-center m-auto">
                  <a role="button" 
                  onClick={() => { 
                    changeLaguange('ind');
                  }}
                  id="textLangInd" className={ state.selectLanguage == "ind" ?  
                  'nav-link-lang-activated' :'nav-link-lang' }>ID</a>
                  |
                  <a role="button"                   
                  onClick={() => { 
                    changeLaguange('en');
                  }}
                  id="textLangEng" className={ state.selectLanguage == "en" ?  'nav-link-lang-activated' :'nav-link-lang' }>ENG</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <header className="masthead">
          <div className="overlay">
            <div className=" container ">

              <div className="row d-flex ">
                <div className="col-md-6   m-auto">
                  <div className="text-content-7Gb ">
                    <div className="title-2eT ">
                      <div className="adawaktunyabelajar-afy">#{t('textAdaWaktunyaBelajar')}</div>
                      <div className="on-pmi-campus-W3q">{t('textOnPMICampus')}</div>
                    </div>
                    <div className=" access-the-variety-of-learning-available-on-our-platform-Rgb ">
                      {t('textAccessTheVariety')}
                    </div>
                    

                    <a className="btn btn-white rounded-pill px-3 nav-item" href="#learning-solution">
                      <span className="justify-content-center m-auto">
                        {t('textBtnVisitPage')}
                        <img className="arrow" src={env.assets + "landingpage/assets/images/arrow-down-egf.png"} />
                      </span>
                      </a>
                  </div>
                </div>
                <div className="col-md-6 p-4">
                  <img className="img-fluid rounded mb-5" src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-top-hms.jpg"} />
                </div>
              </div>
            </div>
          </div>
        </header>


        <div className="container page-section" style={{ marginTop: "-70px" }} id="access-idp">
          <div className="card card-white" style={{ padding: "10px" }}>
            <div className="card-body ">
              <div className="row d-flex">
                <div className="col-9 justify-content-center m-auto">
                  <img className="arrow-big ml-3" src={env.assets + "landingpage/assets/images/ph-paper-plane-right-light-bcK.png"} />
                  <b>{t('textLetsKeep')}</b>
                </div>
                <div className="col-3 text-end">
                  <button className="btn btn-blue rounded-pill" onClick={() => openInNewTab('https://performancemanager.successfactors.eu/sf/goals?bplte_company=PMIProd&_s.crb=sMbnqXq0493pfPXzGYyKoE7MKLU01OCOgGzk9K%252brZi4%253d#/goal-list?targetUserId=B292475A16FC4EA3B520EDCA575E0804&templateId=2090&templateType=cdp')}>
                    <span className="d-flex align-items-center">
                      Access IDP
                      <img className="arrow ml-3" src={env.assets + "landingpage/assets/images/arrow-forward-Jxf.png"} />
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>


        <div className="container page-section " id="learning-solution">
          <div className="text-center">
            <p className="text-head-blue">{t('textHeaderOurLearningSolutions')}</p>
          </div>
        </div>

        <div className="container mt-3" >
          <div className="row ">
            <div className="col-md-6 our-learning-solutions p-2 our-learning-solutions-1" style={{ cursor: "pointer" }} onClick={() => openInNewTab('https://pmi.fuseuniversal.com/')}>
              <div className="row m-2  d-flex">
                <div className="col-md-6  justify-content-center m-auto">
                  <img className="img-thumbnail" src={env.assets + "landingpage/assets/images/image-8By.png"} id="image-learning-solution-1" />
                </div>
                <div className="col-md-6 justify-content-center m-auto" >
                  <h5>{t('textOurLearningSolutionsHeading1')}</h5>
                  <p>{t('textOurLearningSolutionsContent1')}</p>

                  <button className="btn btn-blue rounded-pill " id="btn-visit-1" onClick={() => openInNewTab('https://pmi.fuseuniversal.com/')}>
                    <span className="d-flex align-items-center">
                    {t('textBtnVisitPage')}
                      <img className="arrow ml-3" src={env.assets + "landingpage/assets/images/arrow-forward-Jxf.png"} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6  our-learning-solutions p-2 our-learning-solutions-2" style={{ cursor: "pointer" }} onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/22099')}>
              <div className="row m-2 d-flex">
                <div className="col-md-6 justify-content-center m-auto">
                  <img className="img-thumbnail" src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-indonesia-community.png"} id="image-learning-solution-2" />
                </div>
                <div className="col-md-6 justify-content-center m-auto">
                  <h5>{t('textOurLearningSolutionsHeading2')}</h5>
                  <p>{t('textOurLearningSolutionsContent2')}</p>

                  <button className="btn btn-blue rounded-pill " id="btn-visit-2" onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/22099')}>
                    <span className="d-flex align-items-center">
                    {t('textBtnVisitPage')}
                      <img className="arrow ml-3" src={env.assets + "landingpage/assets/images/arrow-forward-Jxf.png"} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-3">
          <div className="row ">
            <div className="col-md-6 our-learning-solutions p-2 our-learning-solutions-3" style={{ cursor: "pointer" }} onClick={() => openInNewTab('https://pmicloud.sharepoint.com/sites/RefPCHub/SitePages/People-Manager-Hub/1.0-PMH-Home.aspx?xsdata=MDV8MDJ8fDIyYmU1MDFkMTQzYTQ0ZWM3YjdhMDhkYzBiNGNkNmE0fDhiODZhNjVlM2MzYTQ0MDY4YWMzMTlhNmI1Y2M1MmJjfDB8MHw2MzgzOTc2NzE4MjYyOTE1Nzh8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKV0lqb2lNQzR3TGpBd01EQWlMQ0pRSWpvaVYybHVNeklpTENKQlRpSTZJazkwYUdWeUlpd2lWMVFpT2pFeGZRPT18MXxMMk5vWVhSekx6RTVPakF4TnpBNE56WmhMVFJqWkdJdE5EaGxNaTFpWXpZMkxUQXpNemt4TnpCaU1UWXpZbDlsTTJNMU1HTmpPQzAwTnpZM0xUUmhNekF0WWpZM01TMDJNelZsWW1KbVpUUXdNek5BZFc1eExtZGliQzV6Y0dGalpYTXZiV1Z6YzJGblpYTXZNVGN3TkRFM01ETTRNakExTkE9PXw3MzRhYmEyMWYxOTY0MmNkN2I3YTA4ZGMwYjRjZDZhNHwyNWVmZGRmZGE3N2Q0NmU5OTA5MDJjMTRkNmZkYTU2Ng%3D%3D&sdata=TXJuU05rTStCOHd0VFE4Um1qNzRIYUN2M0hPa2FkRDgzbDl3K1RjTGlwST0%3D&ovuser=8b86a65e-3c3a-4406-8ac3-19a6b5cc52bc%2Cayodo%40PMINTL.NET&OR=Teams-HL&CT=1704170422603&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiIyNy8yMzExMDIyNDcwNSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D')}>
              <div className="row m-2  d-flex">
                <div className="col-md-6 justify-content-center m-auto">
                  <div className="bg-image shadow-1-strong rounded">
                    <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-indonesia-journey.png"} id="image-learning-solution-3" className="img-thumbnail" alt="Sample" />
                  </div>
                </div>
                <div className="col-md-6 justify-content-center m-auto">
                  <h5>{t('textOurLearningSolutionsHeading3')}</h5>
                  <p>{t('textOurLearningSolutionsContent3')}</p>

                  <button className="btn btn-blue rounded-pill " id="btn-visit-3" onClick={() => openInNewTab('https://pmicloud.sharepoint.com/sites/RefPCHub/SitePages/People-Manager-Hub/1.0-PMH-Home.aspx?xsdata=MDV8MDJ8fDIyYmU1MDFkMTQzYTQ0ZWM3YjdhMDhkYzBiNGNkNmE0fDhiODZhNjVlM2MzYTQ0MDY4YWMzMTlhNmI1Y2M1MmJjfDB8MHw2MzgzOTc2NzE4MjYyOTE1Nzh8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKV0lqb2lNQzR3TGpBd01EQWlMQ0pRSWpvaVYybHVNeklpTENKQlRpSTZJazkwYUdWeUlpd2lWMVFpT2pFeGZRPT18MXxMMk5vWVhSekx6RTVPakF4TnpBNE56WmhMVFJqWkdJdE5EaGxNaTFpWXpZMkxUQXpNemt4TnpCaU1UWXpZbDlsTTJNMU1HTmpPQzAwTnpZM0xUUmhNekF0WWpZM01TMDJNelZsWW1KbVpUUXdNek5BZFc1eExtZGliQzV6Y0dGalpYTXZiV1Z6YzJGblpYTXZNVGN3TkRFM01ETTRNakExTkE9PXw3MzRhYmEyMWYxOTY0MmNkN2I3YTA4ZGMwYjRjZDZhNHwyNWVmZGRmZGE3N2Q0NmU5OTA5MDJjMTRkNmZkYTU2Ng%3D%3D&sdata=TXJuU05rTStCOHd0VFE4Um1qNzRIYUN2M0hPa2FkRDgzbDl3K1RjTGlwST0%3D&ovuser=8b86a65e-3c3a-4406-8ac3-19a6b5cc52bc%2Cayodo%40PMINTL.NET&OR=Teams-HL&CT=1704170422603&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiIyNy8yMzExMDIyNDcwNSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D')}>
                    <span className="d-flex align-items-center">
                    {t('textBtnVisitPage')}
                      <img className="arrow ml-3" src={env.assets + "landingpage/assets/images/arrow-forward-Jxf.png"} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6  our-learning-solutions p-2 our-learning-solutions-4" style={{ cursor: "pointer" }} onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/22099/contents/1319625')}>
              <div className="row m-2 d-flex">

                <div className="col-md-6 justify-content-center m-auto" id="div-image-learning-solution-4">
                  <div className="">
                    <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-sff.png"} className="img-thumbnail" id="image-learning-solution-4" alt="Sample" />
                  </div>
                </div>
                <div className="col-md-6 justify-content-center m-auto">
                  <h5>{t('textOurLearningSolutionsHeading4')}</h5>
                  <p>{t('textOurLearningSolutionsContent4')}</p>

                  <button className="btn btn-blue rounded-pill " id="btn-visit-4" onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/22099/contents/1319625')}>
                    <span className="d-flex align-items-center">
                    {t('textBtnVisitPage')}
                      <img className="arrow ml-3" src={env.assets + "landingpage/assets/images/arrow-forward-Jxf.png"} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="page-section"></section>

        <header className="masthead-2 p-5 page-section" id="capability-model">
          <div className="container">
            <div className="row ">
              <div className="col-md-1"></div>
              <div className="col-md-10">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-core.png"} width="70%" className="img-fluid" />
                    <p className="text-head-white">{t('textCapabilityModelHeading1')}</p>
                    <p className="text-white">{t('textCapabilityModelContent1')}</p>
                    <button className="btn btn-white  rounded-pill px-3 " onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/33186')}>
                      <span className="justify-content-center m-auto">
                      {t('textBtnVisitPage')}
                        <img className="arrow" src={env.assets + "landingpage/assets/images/arrow-forward-b3m.png"} />
                      </span>
                    </button>
                  </div>
                  <div className="col-md-4 text-center">
                    <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-journey.png"} width="70%" className="img-fluid" />
                    <p className="text-head-white">{t('textCapabilityModelHeading2')}</p>
                    <p className="text-white">{t('textCapabilityModelContent2')}</p>
                    <button className="btn btn-white  rounded-pill px-3 " onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/33187')}>
                      <span className="justify-content-center m-auto">
                      {t('textBtnVisitPage')}
                        <img className="arrow" src={env.assets + "landingpage/assets/images/arrow-forward-b3m.png"} />
                      </span>
                    </button>
                  </div>
                  <div className="col-md-4 text-center">
                    <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-Technical.png"} width="70%" className="img-fluid" />
                    <p className="text-head-white">{t('textCapabilityModelHeading3')}</p>
                    <p className="text-white">{t('textCapabilityModelContent3')}</p>
                    <button className="btn btn-white  rounded-pill px-3 " onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/33188')}>
                      <span className="justify-content-center m-auto">
                        {t('textBtnVisitPage')}
                        <img className="arrow" src={env.assets + "landingpage/assets/images/arrow-forward-b3m.png"} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-md-1"></div>
            </div>
          </div>
        </header>


        <div className="container page-section mt-5" id="other-resource">
          <div className="text-center">
            <p className="text-head-blue">{t('textHeaderOurLearningResources')}</p>
          </div>
        </div>

        <div className="container">
          <div className="row ">
            <div className="col-md-1"></div>
            <div className="col-md-10">
              <div className="row">
                <div className="our-learning-resources col-md-4 text-center p-5" role="button"    onClick={() => openInNewTab('https://pmi.udemy.com/')}>
                  <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-udemy.png"} className="img-fluid" />
                </div>
                <div className="our-learning-resources col-md-4 text-center p-5" role="button" onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/21541 /contents/1036207')}>
                  <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-rosetta.png"} className="img-fluid" />
                </div>
                <div className="our-learning-resources col-md-4 text-center p-5" role="button" onClick={() => openInNewTab('https://pmi.fuseuniversal.com/communities/21541/contents/1765955')}>
                  <img src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-edx.png"} className="img-fluid" />
                </div>
              </div>
            </div>
            <div className="col-md-1"></div>
          </div>

        </div>

        <section className="page-section"></section>

        <div className="container" id="redeem-point">
          <div className="row ">
            <div className="col-md-12">
              <div className="card card-white">
                <div className="card-body ">
                  <div className="row d-flex ">

                    <div className="col-md-6">
                      <img className="img-fluid rounded " src={env.assets + "landingpage/assets/images/ada-waktunya-belajar-box.png"} />
                    </div>
                    <div className="col-md-6 justify-content-center m-auto ">
                      <div className="text-content-7Gb  m-5 ">
                        <button className="btn-square btn-white px-3 d-flex mb-3">
                          <span className="justify-content-center m-auto">
                            <img className="arrow-big" src={env.assets + "landingpage/assets/images/ri-coupon-2-fill-EB1.png"} />
                            {numberWithCommas(totalPoint)} {t('textMenuAWBPoints')}
                          </span>
                        </button>
                        <h5>
                        {t('textHeaderRedeemPoints')}
                        </h5>
                        <p className="mb-3">
                        {t('textRedeemPointsContent')}
                        </p>
                        <button className="btn btn-blue  rounded-pill px-3 " onClick={() => openInNewTab('https://forms.office.com/Pages/ResponsePage.aspx?id=XqaGizo8BkSKwxmmtcxSvNhGeguotyJPv0dSReSoI4ZUM1JVMFhWOVFCU1VNUUU4RVhBUjlTWlBIRS4u')}>
                          <span className="justify-content-center m-auto">
                          {t('textBtnRedeemNow')}
                            <img className="arrow" src={env.assets + "landingpage/assets/images/arrow-forward-J8P.png"} />
                          </span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <section className="page-section-2" >
          <hr />
        </section>

        <div className="container">
          <div className="text-center">
            <p className="">&copy; 2024 PT HM Sampoerna</p>
          </div>
        </div>
      </div>

    </div>;

  }

  if (!state.isMaintenanceMode) {
    return <ShowContent />;
  }
  return <UnderMaintenance />;
}

export default App;
