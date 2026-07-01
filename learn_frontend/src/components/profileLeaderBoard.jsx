import React, { useContext, useEffect, useState } from 'react';
import axiosLibrary from '../helpers/axiosLibrary';
import { securityData } from '../helpers/globalHelper';
import defaultLang from '../helpers/lang';
import crownLeaderboard from '../assets/img/crown-leaderboard-1.png';
import crownLeaderboard2 from '../assets/img/crown-leaderboard-2.png';
import crownLeaderboard3 from '../assets/img/crown-leaderboard-3.png';
import buttonNext from '../assets/img/button-next.png';
import { cssTarget, LoadingData } from './Loading';
import Pagination from 'react-js-pagination';
import { Card } from 'react-bootstrap';
import GlobalState from '../helpers/globalState';
import buttonExit from '../assets/img/button-exit.png';
import backgroundLeaderboard from '../assets/img/backgroundLeaderboard123.jpg';

export function Leaderboard(){
    const [state, setState] = useState({
        leaderboard123:[],
        leaderboardWithout123:[],
        myLeaderboard:[],
        leaderBoard:[],
        paginationDataLeaderboard:[],
        activePage:1,
        showPopup123:false,
        showPopupLeaderboard:false,
        dataPopup:[]
    });
    const [global] = useContext(GlobalState)
    const platform_id = securityData.Security_getPlatformId();
    const [loading, setLoading] = useState(true);
    const limit = 20
    const pageRangeDisplayed = 10

    const getLeaderboard = async () => {
        setLoading(true);
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbProfile/readLeaderboard',credentials);
        if(isi.status===200){
            const getLeaderboard123 = isi.data.data.slice(0,3)
            let mappingLeaderboard = []
            const leaderboardWithout123 = isi.data.data.slice(3,100)

            let currentUserLeaderboard = isi.data.data.filter(v=>v.user_modified === securityData.Security_UserId())
            const currentIndexUserLeaderboard = isi.data.data.findIndex(v=>v.user_modified === securityData.Security_UserId())
            if(currentUserLeaderboard.length > 0){
                let additerator = { iterator:currentIndexUserLeaderboard+1}
                currentUserLeaderboard[0] = {...currentUserLeaderboard[0],...additerator}
            }

            if(leaderboardWithout123.length>0){
                mappingLeaderboard = leaderboardWithout123.map((v,idx)=>{
                    return{...v,iterator:idx+4}
                })
            }

            setState(state=>({...state, leaderboard123:getLeaderboard123, leaderboardWithout123: mappingLeaderboard, myLeaderboard:currentUserLeaderboard,  leaderBoard:isi.data.data}))
            setLoading(false)
        }

    }

    const changePagination = (pageNumber)=>{
        var offsetNew = (pageNumber - 1) * limit;
        const paginationDataLeaderboard = state.leaderboardWithout123.slice(offsetNew,offsetNew+limit)
        setState(state=>({...state, activePage:pageNumber,paginationDataLeaderboard:paginationDataLeaderboard}))
    }
    
    useEffect(()=>{
        if(platform_id){
            getLeaderboard()
        }
    },[platform_id])

    useEffect(()=>{
        if(global.loadContentSidebarProfile){
            getLeaderboard()
        }
    },[global.loadContentSidebarProfile])

    useEffect(()=>{
        if(state.leaderboardWithout123){
            changePagination(state.activePage)
        }
    },[state.leaderboardWithout123])

    const ComponentPopup = props =>{
        const {type} = props
        const userData = state.dataPopup
        const lang = defaultLang.lang
        const renderValueCard = [
            [{label:lang.lblPopupLeaderboardName,value:userData.name},{label:lang.lblPopupLeaderboardDepartment,value:userData.department}],
            [{label:lang.lblPopupLeaderboardTierLevel,value:userData.title},{label:lang.lblPopupLeaderboardGroupBasetownLocation,value:userData.group_basetown_location}],
            [{label:lang.lblPopupLeaderboardPoints,value:`${userData.historypoint} P`},{label:lang.lblPopupLeaderboardReportTo,value:userData.report_to}]
        ]
        return(
            <Card body className={`popup-leaderboard ${type=="me" && `popup-leaderboard-active`} ${type=="123" && `popup-leaderboard-123`}`}>
                <img src={buttonExit} className="buttonExit" onClick={()=>setState(state=>({...state, showPopupLeaderboard:""}))}/>
                <div className="pt-4 pb-2 pr-2 pl-2">
                    {renderValueCard.map((v,idv)=>
                        <div className="row group-popup " key={idv}>
                            {v.map((x,idx)=>
                                <div className="col-sm-6 pb-3" key={idx}>
                                    <div className="lbl">{x.label}</div>
                                    <div className="val">{x.value}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        )
    }    

    const componentLeaderboard123 = (data,idx)=>{
        if(data.name){
            return(
                // <div className={`leaderboard-${idx} d-flex flex-column flex-fill align-items-center`}>
                //     {idx===1 && <div className="crown"><img src={crownLeaderboard}/></div>}
                //     <div className="profilePhotos p-2">
                //         <img src={data.profile_picture}/>
                //         <span>{idx}</span>
                //     </div>
                //     <div className="nameUser pt-1">{data.name}</div>
                //     <div className="levelUser pb-2">{data.title}</div>
                //     <div className={`totalPoint ${idx===1 && `first-place`}`}>
                //         {data.historypoint}
                //         <img src={buttonNext} onClick={()=>setState(state=>({...state,dataPopup:data,showPopupLeaderboard:"L-123"}))}/>
                //     </div>
                // </div>

            <div className={`leaderboard-${idx} d-flex flex-column flex-fill align-items-center justify-content-end`}>
                {{
                    [1]:<div className="crown"><img src={crownLeaderboard}/></div>,
                    [2]:<div className="crown"><img src={crownLeaderboard2}/></div>,
                    [3]:<div className="crown"><img src={crownLeaderboard3}/></div>
                }[idx]}
                <div className="profilePhotos p-2">
                    <img src={data.profile_picture}/>
                    <span>{idx}</span>
                </div>
                <div className="group-leaderboard mt-4">
                    <div className="d-flex flex-column flex-fill align-items-center">
                        <div className="nameUser pt-1">{data.name}</div>
                        <div className="levelUser pt-2 pb-2">{data.title}</div>
                        <div className={`totalPoint ${idx===1 && `first-place`}`}>
                            {data.historypoint}
                            <img src={buttonNext} onClick={()=>setState(state=>({...state,dataPopup:data,showPopupLeaderboard:"L-123"}))}/>
                        </div>
                    </div>
                </div>
            </div>
            )
        }
    }

    const ComponentAllLeaderboard = (props)=>{
        const {data} = props
        const {userData} = data
        return(
            <>
                <div className="row align-items-center">
                    <div className="col-sm-1 text-align-center iterator">{data.index}</div>
                    <div className="col-sm-2 profilePicture"><img src={userData.profile_picture}/></div>
                    <div className="col-sm-5 nameUser">{userData.name}<div className="levelUser">{userData.title}</div></div>
                    <div className="col-sm-1 buttonNext">
                        <img src={buttonNext} onClick={()=>setState(state=>({...state,dataPopup:userData,showPopupLeaderboard:userData.iterator+"-"+data.type}))}/>
                    </div>
                    <div className="col-sm-3 totalPoint">{userData.historypoint}&nbsp;P</div>
                </div>
                {state.showPopupLeaderboard===userData.iterator+"-"+data.type && 
                    <ComponentPopup type={data.type}/>
                }
            </>

        )
    }

    const componentList = (data,idx,type)=>{
        const dataUsers = {index:data.iterator, userData:data,type:type}
        // console.log(state.dataPopup);
        // console.log(data);
        let component = <></>
        if(type=="me"){
            component = <li className="list-group-item active" aria-current="true" key={idx}><ComponentAllLeaderboard data={dataUsers}/></li>
        }else{
            component = <li className="list-group-item" key={idx}><ComponentAllLeaderboard data={dataUsers}/></li>
        }
        return(
            <>
                {component}
            </>
            
        )
    }

    return(
        <div className="d-flex flex-column">
            <div className="header-title-level-progress pb-4">{defaultLang.lang.headerTitleLeaderboard}</div>
            <LoadingData loading={loading}/>
            <div className="content-level-progress d-flex flex-column content-leaderboard" style={cssTarget(loading)}>
                <div className="leaderboard-1-2-3 d-flex flex-row" style={{backgroundImage:`url(${backgroundLeaderboard})`}}>
                    {componentLeaderboard123(state.leaderboard123 && state.leaderboard123[1]? state.leaderboard123[1]:[],2)}
                    {componentLeaderboard123(state.leaderboard123 && state.leaderboard123[0]? state.leaderboard123[0]:[],1)}
                    {componentLeaderboard123(state.leaderboard123 && state.leaderboard123[2]? state.leaderboard123[2]:[],3)}
                </div>
                <div className="list-another-leaderboard">
                    {state.showPopupLeaderboard==="L-123" && 
                        <ComponentPopup type={"123"}/>
                    }
                    <ul className="list-group">
                        {state.myLeaderboard && state.myLeaderboard.map((v,idx)=>
                            componentList(v,idx,"me")
                        )}
                        {state.paginationDataLeaderboard && state.paginationDataLeaderboard.map((v,idx)=>
                            componentList(v,idx,"all")
                        )}
                        {state.leaderboardWithout123.length > 0 && 
                            <li className="list-group-item d-flex justify-content-end">
                                <Pagination
                                    itemClass="page-item"
                                    linkClass="page-link"
                                    activePage={state.activePage}
                                    itemsCountPerPage={limit}
                                    totalItemsCount={state.leaderboardWithout123?.length}
                                    pageRangeDisplayed={pageRangeDisplayed}
                                    onChange={(e)=>changePagination(e)}
                                    hideDisabled={true}
                                    hideNavigation={true}
                                />
                            </li>
                        }
                    </ul>
                </div>
            </div>
        </div>
    )
}