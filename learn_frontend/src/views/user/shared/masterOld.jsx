import React, { useEffect, useState } from 'react';
import Head from '../../../components/head';
import NavMenu from '../../user/shared/navMenu';
import Footer from './footer';
import { Redirect, useLocation } from 'react-router-dom'
import routeAll from '../../../helpers/route';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { cssTarget } from '../../../components/Loading';
import PopupPlatform from '../../../components/popupPlatform';
import { Alert, PopupChangeStatusForSupervisor, PopupQuiz, PopupRedeem, PopupRegisterCourse, PopupRegisterTraining, PopupSaveAgreeTraining, PopupShareArticle, PopupSubmitIdea, PopupSubscribe, PopupNetworkSubmit, PopupPreferredTopic, PopupFaq, PopupProfileRedeemPoints, PopupFinishSetLearningPlan, PopupSff, PopupWorkShop, PopupChooseTypeLearningPlan, PopupAds, PopupFormCustomLearningPlan } from '../../../components/popupAlert';
import GlobalState from '../../../helpers/globalState';
import { SidebarProfile } from '../../../components/sidebarProfile';
import { SidebarLearningDetail } from '../../../components/sidebarLearningDetail';

function Layout(props){
    const location = useLocation();
    const platform_name = securityData.Security_getPlatformName() || "null platform"
    const param = axiosLibrary.getParamString(location.search)
    const [state, setState] = useState({
        showPlatform: false,
        showClosebutton: true
    })
    const [, setShowPlatform] = useState(null)

    const [globalState, setGlobalState] = useState({
        modalProp:{
            modalShow:false,
            id:null,
        },
        isLoadingUser: true,
        optionUser: [],
        optionSelectedUser:[],
        indexQuizArticle:0,
        arrQuiz:[],
        answer_mode3:[],
        _PlaySoundFile:{},
        loading:true
    })

    const playSound = () =>{
        if(globalState._PlaySoundFile.event){
            var audioElement = document.createElement('audio');
            audioElement.setAttribute('src', env.assets+'audio/'+ globalState._PlaySoundFile.name + '.mp3');
            audioElement.setAttribute('autoplay', 'autoplay');
            audioElement.load();
            audioElement.play();
        }
        
    }

    useEffect(()=>{
        //link dari email blast we miss you
        if(param && param.platform && param.points){
            localStorage.setItem("loadingNow", true);
            props.setLoading(true)
            axiosLibrary.cekLinkWeMissYou()
        }

        //set false untuk loading page
        if(!localStorage.getItem("loadingNow") && (location.pathname===routeAll.routesUser.home.path || location.pathname===routeAll.routesUser.profile.path) ){
            props.setLoading(globalState.loading)
        }
        //end

    },[globalState])

    useEffect(async()=>{
        if(!securityData.Security_getPlatformId()){
            setState(state => ({...state, showPlatform: true, showClosebutton:false}))
            props.setLoading(false)
        }else{
            maintenanceMode()
            let currentUrl = window.location.href
            axiosLibrary.userTracking(currentUrl)
        }
    },[securityData.Security_getPlatformId()])

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            if(globalState){
                setState(state =>({...state, showPlatform:globalState.showPlatform}))       
            }    
        }
    },[globalState])

    const getCurrentPathWithoutLastPart = () => {
        const isi = location.pathname.slice(0, location.pathname.lastIndexOf('/'))
        return isi
    }

    const handleClick = (val) =>{
        setShowPlatform(val)
    }

    const maintenanceMode = async () =>{
        let isi = await axiosLibrary.postData('awbUser/CekMaintenance');
        if(isi.status===200){
              if(isi.data.data!=0){
                window.location.href = routeAll.routesComponent.maintenanceMode.path
              }
        }
    }

    if(Object.values({...routeAll.routesUser, ...routeAll.routeViewAll, ...routeAll.routeTrainingTeam}).findIndex(list => getCurrentPathWithoutLastPart() === "/training_team"? list.parentPath === getCurrentPathWithoutLastPart():list.path === location.pathname) < 0){
        return(
            <Redirect to={routeAll.routesComponent.notFound.path} exact/>
        )
    }else{

        return(
            <div style={cssTarget(false)}>
                {playSound()}
                <GlobalState.Provider value={[globalState,setGlobalState]}>
                    <PopupShareArticle {...props}/>
                    <PopupQuiz {...props}/>
                    <PopupSubmitIdea {...props}/>
                    <PopupRedeem {...props}/>
                    <PopupSubscribe {...props}/>
                    <PopupRegisterCourse {...props}/>
                    <PopupRegisterTraining {...props}/>
                    <PopupSaveAgreeTraining {...props}/>
                    <PopupChangeStatusForSupervisor {...props}/>
                    <PopupNetworkSubmit {...props}/>
                    <PopupPreferredTopic {...props}/>
                    <PopupFaq {...props}/>
                    <PopupProfileRedeemPoints {...props}/>
                    <PopupFinishSetLearningPlan {...props}/>
                    <Alert {...props}/>
                    <SidebarProfile {...props} placement={"end"}/>
                    <SidebarLearningDetail {...props} placement={"end"} thisStateGlobal={globalState}/>
                    <PopupSff {...props}/>
                    <PopupWorkShop {...props}/>
                    <PopupAds {...props}/>
                    <PopupChooseTypeLearningPlan {...props}/>
                    <PopupFormCustomLearningPlan {...props}/>
                    <Head.HeadUser/>
                    {state.showPlatform? <PopupPlatform canClose={state.showClosebutton} showPlatform={state.showPlatform} chgState={handleClick}/> : null }
                    {platform_name&&platform_name !=='null platform'?
                        <div className="header-wrapper">
                            <NavMenu adminLevel={props.adminLevel} {...props}/>
                            <div id="main-contents">
                                {props.children}
                            </div>
                            <Footer/>
                                <a tabIndex="0" role="button" className="scrollup" style={{display:'none', cursor:'pointer'}} onClick={()=>window.scrollTo({top: 0, behavior: 'smooth'})}><i className="ion-ios-arrow-up"></i></a>
                        </div>
                        :
                        <div style={{position: 'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}>
                            <i className='fa fa-circle-o-notch fa-spin'></i>&nbsp; Getting Platform
                        </div>
                    }
                </GlobalState.Provider>
                
            </div>
        );
    }
    
}

export default Layout;
