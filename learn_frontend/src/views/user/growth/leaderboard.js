import React, { useEffect, useCallback, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import routeAll from '../../../helpers/route';
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import defaultLang from '../../../helpers/lang';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../../../views/user/shared/navMenu';

import '../../../i18n.js'

import { useTranslation } from "react-i18next";

function PointHistory(props) {

  const [state, setState] = useState({
    userDocument: env.userDocument,
    assets: env.assets,
    selectedCategory: "",
    selectedYear: "",
    totalPoint: 0,
    showSubFunction: 0,

    showGroupZone: 0,
    showBasetownLocation: 0,

    percentagePoint: 0,
    loading: true,
    selectLanguage: 'en',

    leaderboardRow_num: 11,
    leaderboardName: "",
    leaderboardGroup_function: "",
    leaderboardPoint: "",
    leaderboardDate_created_plus7: "",
    leaderboardShowMe: false
  });
  const user_id = securityData.Security_UserId()
  const emailId = securityData.Security_UserEmail()

  const changeLaguange = async (newLangSelect) => {
    setState({ ...state, selectLanguage: newLangSelect })
    handleChangeLanguage(newLangSelect);
  }
  const [loading, setLoading] = useState(true)
  const [showTextLeaderboardList, setShowTextLeaderboardList] = useState(false)
  const [items, setItems] = useState({
    selectAwbGrowthQuarterId: null,
    selectFunction: null,
    selectSubFunction: null,
    userId: null,
    selectBasetownLocation: null,
    selectGroupZone: null
  })

  const [itemsLeaderboardMore10, setItemsLeaderboardMore10] = useState({

  })

  const [listSubFunction, setListSubFunction] = useState([])
  const [listGroupZone, setListGroupZone] = useState([])
  const [listBasetownLocation, setListBasetownLocation] = useState([])

  const [itemsPointHistory, setItemsPointHistory] = useState([])
  const [listQuarter, setListQuarter] = useState([])
  const [itemsLeaderboard, setItemsLeaderboard] = useState([])
  const { t, i18n: { changeLanguage, language } } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const handleChangeLanguage = (newLangSelect) => {
    setCurrentLanguage(newLangSelect);
    changeLanguage(newLangSelect);
    //console.log("aaabbb : " + newLangSelect);
  }

  const getQuarterList = useCallback(async () => {
      const credentials = {
          limit: 50,
          offset: 0,
          category: "",
          platform_id: securityData.Security_getPlatformId()
      };
      // alert(categoryId)
      let isi = await axiosLibrary.postData('awbGrowthQuarter/ListData', credentials);
      setListQuarter(isi.data.data)
      // setLoading(false)
  })

  
  const getListPointHistory = async () => {
    const credentials = {
      limit: 3,
      offset: 0,
      category: "",
      orderby: "awb_growth_quest_user.id desc",
      user_id: user_id
    };

    let isi = await axiosLibrary.postData('awbGrowth/ListPointHistoryByuser', credentials);

    if (isi.status === 200) {

      setItemsPointHistory(isi.data.data);

      setState(state => ({ ...state, loading: false }))
      setState(state => ({ ...state, totalPoint: isi.data.totalPoint, percentagePoint: isi.data.percentagePoint }))

      setLoading(false)
    }
  };

  const leaderboardChange = useCallback(async () => {
    getListLeaderboard()
  })

  const getListLeaderboard = async () => {
    setLoading(true)
    let varSelectGroupZone;
    if (items.selectFunction === 'allFunction') {
      varSelectGroupZone = null;
    } else {
      varSelectGroupZone = items.selectGroupZone;
    }

    let varSelectBasetownLocation;
    if (items.selectGroupZone === 'allGroupZone') {
      varSelectBasetownLocation = null;
    } else {
      varSelectBasetownLocation = items.selectBasetownLocation;
    }

    const credentials = {
      user_id: user_id,
      selectAwbGrowthQuarterId: items.selectAwbGrowthQuarterId,
      selectFunction: items.selectFunction,
      selectSubFunction: items.selectSubFunction,
      selectGroupZone: varSelectGroupZone,
      selectBasetownLocation: varSelectBasetownLocation
    };

    let isi = await axiosLibrary.postData('awbGrowth/LeaderboardList', credentials);

    if (isi.status === 200) {
      //searchJson(isi.data.dataAllLeaderboard, user_id)
      
      setItemsLeaderboard(isi.data.data);
      setState(state => ({ ...state, showGroupZone: isi.data.showGroupZone }))
      setState(state => ({ ...state, showBasetownLocation: isi.data.showBasetownLocation }))

      setListGroupZone(isi.data.dataGroupZone)
      setListBasetownLocation(isi.data.dataBasetownLocation)
      //console.log("count "+isi.data.dataAllLeaderboard.length);
      if(isi.data.dataAllLeaderboard.length > 0){
        searchJson(isi.data.dataAllLeaderboard, user_id)
        setShowTextLeaderboardList(false)
      }
      else{        
        searchJson([], user_id)
        setShowTextLeaderboardList(true)
      }

      
      setLoading(false)
    }
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.name;

    var stateCopy = Object.assign({}, items);
    stateCopy[key] = value;

    setItems(stateCopy)

  }
  useEffect(() => {
    getListPointHistory()
    getListLeaderboard()
    getQuarterList()
  }, [])



  function searchJson(data, searchValue) {

    let filteredJsonArrayValues = data.find(item => item.imdl == searchValue );
    //setItemsLeaderboardMore10(filteredJsonArrayValues); 
    console.log("aaabb "+filteredJsonArrayValues);
    
    if (filteredJsonArrayValues !== undefined) {
      setState(state => ({ ...state, leaderboardRow_num: filteredJsonArrayValues.row_num }))
      setState(state => ({ ...state, leaderboardName: filteredJsonArrayValues.name }))
      setState(state => ({ ...state, leaderboardGroup_function: filteredJsonArrayValues.group_function }))
      setState(state => ({ ...state, leaderboardPoint: filteredJsonArrayValues.point }))
      setState(state => ({ ...state, leaderboardDate_created_plus7: filteredJsonArrayValues.date_created_plus7 }))
      setState(state => ({ ...state, leaderboardShowMe: true }))
    }
    else{      
      setState(state => ({ ...state, leaderboardShowMe: false }))
    }
    

  }

  return (
    <>
      <NavMenu adminLevel={props.adminLevel} {...props} />


      <header className="growth-masthead">
        <div className=" container ">
          <div className="row d-flex ">
            <div className="col-md-12  d-flex justify-content-center">
              <img src={env.assets + "growth/images/Logo Growth Quest_white.png"} style={{ maxHeight: "150px", marginTop: "25px" }} />
            </div>
          </div>
        </div>
      </header>
      {
          <>
            <section className="page-section"></section>

            <div className="container" style={{ marginTop: "-150px" }} id="access-idp">
              <div className="row d-flex ">
                <div className="col-lg-12">
                  <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
                    <div className="card card-white" style={{ padding: "10px" }}>
                      <div className="card-body ">
                        <div className="row d-flex  justify-content-center">

                          <div className="col-lg-2 justify-content-center">
                            <img src={env.assets + "growth/images/icon/daun-blue-big.png"} style={{ paddingTop: "10px" }} />
                          </div>
                          <div className="col-lg-7">

                            <div className="row d-flex ">
                              <div className="col-lg-12">
                                <p className="title-text-black">{t('textScoreBalance')} </p>
                              </div>
                            </div>
                            <div className="row d-flex ">
                              <div className="col-lg-12">
                                <p className="title-text-blue-growth">{state.totalPoint} {t('textPoint')} </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 text-end d-flex flex-column justify-content-center">
                            <div className="container ">
                              <div className="row align-items-center">
                                <div className="col-12 mx-auto">
                                  <div className=" justify-content-center">
                                    <div>
                                      <a className="submit-growth" href={routeAll.routesUser.Growth.path + "?scrollTo=quest-list"}>
                                        <span className="frame1-menit1-hari-landing-page-text005">
                                          <span>{t('textMoreQuest')}</span>
                                        </span>
                                        <img src={env.assets + "landingpage/assets/images/hut/arrow-right-white.svg"} className="frame1-menit1-hari-landing-page-arrowdown" />
                                      </a>
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
              </div>

              <div className="row d-flex ">
                <div className="col-lg-12">
                  <p className="title-text-black">{t('textPointHistory')}</p>
                </div>
              </div>

              {

                itemsPointHistory.map((item) => {

                  return (
                    <div className="row d-flex flex-column justify-content-center mb-2">
                      <div className="col-lg-12">
                        <div className="card card-white">
                          <div className="card-body ">
                            <div className="container ">
                              <div className="row d-flex  justify-content-center">
                                <div className="col-lg-6">
                                  <b className="text-black">
                                    {
                                      item.quarterName
                                    }
                                  </b>
                                </div>
                                <div className="col-lg-4   justify-content-center">
                                  {
                                    item.questTitle
                                  }
                                </div>
                                <div className="col-lg-2 text-end">
                                  <span className="text-blue-growth  text-end">{item.score} {t('textPoint')} </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  );

                })
              }



              <div className="row d-flex mb-5">
                <div className="col-lg-12">
                  <a href={routeAll.routesUser.GrowthPointHistory.path}>
                    <p className="text-blue-growth">{t('textLihatSelengkapnya')}</p>
                  </a>
                </div>
              </div>

              <div className="row d-flex mb-4">
                <div className="col-lg-12">
                  <div className="card card-white">
                    <div className="card-header bg-leaderboard-growth">
                      <div className="row d-flex  justify-content-center ">
                        <div className="col-lg-2 align-middle text-center parent p-2">

                          <div className="child-growth">
                            <img src={env.assets + "landingpage/assets/images/hut/leaderboard.svg"} />
                          </div>

                        </div>
                        <div className="col-lg-10">
                          <div className="p-4">

                            <span className="title-nav-page-text">
                              {t('textLeaderboard')}
                            </span>
                            <p className="title-text-white mt-3">Top 112</p>

                            
                            {/**
                            <span className="title-nav-page-text">
                              {t('textLeaderboard2')}
                            </span>
                            <p className="title-text-white mt-3">
                             <a href="https://pmicloud-my.sharepoint.com/:x:/g/personal/ytandoro1_pmintl_net/ETzvRIt8U65IjH33MWfx_CkBLlvYcbpPep4UzNwYcqlkqA?e=fe9u4d&ovuser=8b86a65e-3c3a-4406-8ac3-19a6b5cc52bc%2Casantoso9%40PMINTL.NET&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI0OS8yNTA3MDMxODgwNiIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D" className="a-leaderboardstage2" target="_BLANK" rel="noreferrer">{t('clickDisiniLeaderboardStage2')}</a>
                            </p>**/}
                          </div>

                        </div>
                      </div>
                    </div>
                    <div className="card-body ">
                      <div className="row d-flex  justify-content-center">

                        <div className="col-lg-12 mb-4">
                          <div className="row d-flex flex-column justify-content-center mt-2">
                            <div className="col-lg-12">
                              <div className="row mb-3">
                                
                                <div className="col-sm-5  mb-3">
                                   <select value={items.selectAwbGrowthQuarterId}
                                      onChange={handleInputChange.bind(this)} id="selectAwbGrowthQuarterId" name="selectAwbGrowthQuarterId" style={{ width: "100%" }} className="form-control">
                                      <option value="">All Stage</option>
                                      {listQuarter.map(
                                          (itemQuarter) =>
                                              <option key={itemQuarter.id} value={itemQuarter.id}>
                                                  {itemQuarter.name}
                                              </option>
                                      )
                                      }
                                  </select>
                                </div>
                                <div className="col-sm-5  mb-3">
                                  <select className="form-control" value={items.selectFunction} onChange={handleInputChange.bind(this)} required name="selectFunction" aria-invalid="false">
                                    <option value="allFunction">All Function</option>
                                    <option value="myFunction">My Function</option>
                                  </select>
                                </div>

                                {
                                  state.showGroupZone == 1 ?
                                    <div className="col-sm-5 mb-3">
                                      <select value={items.selectGroupZone}
                                        onChange={handleInputChange.bind(this)} id="selectGroupZone" name="selectGroupZone" style={{ width: "100%" }} className="form-control">
                                        <option value="allGroupZone">All Group Zone</option>
                                        {
                                          listGroupZone.map(
                                            (items) =>
                                              <option key={items.id} value={items.group_zone}>
                                                {items.group_zone}
                                              </option>
                                          )
                                        }
                                      </select>
                                    </div>
                                    :
                                    <></>
                                }

                                {
                                  state.showBasetownLocation == 1 ?
                                    <div className="col-sm-5">
                                      <select value={items.selectBasetownLocation}
                                        onChange={handleInputChange.bind(this)} id="selectBasetownLocation" name="selectBasetownLocation" style={{ width: "100%" }} className="form-control">
                                        <option value="allBasetownLocation">All Basetown Location</option>
                                        {
                                          listBasetownLocation.map(
                                            (items) =>
                                              <option key={items.id} value={items.hms_basetown}>
                                                {items.hms_basetown}
                                              </option>
                                          )
                                        }
                                      </select>
                                    </div>
                                    :
                                    <></>
                                }

                                <div className="col-sm-1">
                                  <div className="submit-growth-go" onClick={() => leaderboardChange()}> Go </div>
                                </div>
                              </div>
                            </div>
                          </div>
                    
                        {

                          showTextLeaderboardList ?
                          <div className="col-lg-12 text-center">
                            {t('textNoLeaderboard')}
                          </div>
                          :
                          <></>

                        }

                        {
                        loading ?
                          <div className="col-lg-12 text-center">
                            <img src={`${env.assets}img/loading.gif`} style={{ width: "50px", marginBottom: '40px' }} />
                          </div>
                          :
                          
                            itemsLeaderboard.map((item, nomor) => {

                              return (
                                <div className="row d-flex flex-column justify-content-center mt-2">
                                  <div className="col-lg-12">
                                    <div className="card card-white">
                                      <div className="card-body ">
                                        <div className="row d-flex justify-content-center">
                                          <div className="col-lg-1 ">
                                            <span className="title-text-white-dark">{nomor + 1}</span>
                                          </div>
                                          <div className="col-lg-8">
                                            <div className="text-black ">
                                              <b>{item.name}</b>
                                            </div>
                                            <div className="text-black ">
                                              {item.group_function}
                                            </div>
                                          </div>
                                          <div className="col-lg-3 text-end">
                                            <span className="text-blue-growth  text-end">
                                              {item.point} {t('textPoint')}
                                            </span>
                                            <br />
                                            <sup className="text-black ">
                                              {item.date_created_plus7}
                                            </sup>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                              );

                            })
                          }



                          {
                              
                        loading ?
                          <div className="col-lg-12 text-center"> </div>
                          :
                          state.leaderboardShowMe ?
                          
                            state.leaderboardRow_num > 112 ?
                              <>
                              <div className="row d-flex flex-column justify-content-center mt-2">
                                <div className="col-lg-12">
                                <div className="card card-white">
                                <div className="card-body ">
                                  ...
                                </div>
                                </div>
                                </div>
                              </div>
                              <div className="row d-flex flex-column justify-content-center mt-2">
                                <div className="col-lg-12">
                                  <div className="card card-white">
                                    <div className="card-body ">
                                      <div className="row d-flex justify-content-center">
                                        <div className="col-lg-1 ">
                                          <span className="title-text-white-dark">
                                            {state.leaderboardRow_num}
                                          </span>
                                        </div>
                                        <div className="col-lg-8">
                                          <div className="text-black ">
                                            <b>
                                              {state.leaderboardName}
                                            </b>
                                          </div>
                                          <div className="text-black ">

                                            {state.leaderboardGroup_function}
                                          </div>
                                        </div>
                                        <div className="col-lg-3 text-end">
                                          <span className="text-blue-growth  text-end">

                                            {state.leaderboardPoint} {t('textPoint')}
                                          </span>
                                          <br />
                                          <sup className="text-black ">

                                            {state.leaderboardDate_created_plus7}
                                          </sup>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              </>
                                :
                                <></>
                          :
                          <></>

                          }
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </>
      }
    </>
  );
}

export default PointHistory;