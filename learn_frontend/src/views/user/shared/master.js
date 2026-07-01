import React, { useEffect, useState } from 'react';
import Head from '../../../components/head';
import Footer from './footer';
import { Redirect, useLocation } from 'react-router-dom'
import routeAll from '../../../helpers/route';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { cssTarget } from '../../../components/Loading';
import GlobalState from '../../../helpers/globalState';

function Layout(props) {
    const location = useLocation();
    const platform_name = securityData.Security_getPlatformName() || "null platform"
    const param = axiosLibrary.getParamString(location.search)
    const [state, setState] = useState({
        showPlatform: false,
        showClosebutton: true
    })
    const [, setShowPlatform] = useState(null)

    const [globalState, setGlobalState] = useState({
        modalProp: {
            modalShow: false,
            id: null,
        },
        isLoadingUser: true,
        optionUser: [],
        optionSelectedUser: [],
        indexQuizArticle: 0,
        arrQuiz: [],
        answer_mode3: [],
        _PlaySoundFile: {},
        loading: true
    })


    useEffect(() => {
        //link dari email blast we miss you
        if (param && param.platform && param.points) {
            localStorage.setItem("loadingNow", true);
            props.setLoading(true)
            axiosLibrary.cekLinkWeMissYou()
        }


    }, [globalState])

    useEffect(async () => {
        if (!securityData.Security_getPlatformId()) {
            setState(state => ({ ...state, showPlatform: true, showClosebutton: false }))
            props.setLoading(false)
        } else {
            maintenanceMode()
            let currentUrl = window.location.href
            axiosLibrary.userTracking(currentUrl)
        }
    }, [securityData.Security_getPlatformId()])

    useEffect(() => {
        if (securityData.Security_getPlatformId()) {
            if (globalState) {
                setState(state => ({ ...state, showPlatform: globalState.showPlatform }))
            }
        }
    }, [globalState])

    const getCurrentPathWithoutLastPart = () => {
        const isi = location.pathname.slice(0, location.pathname.lastIndexOf('/'))
        return isi
    }


    const maintenanceMode = async () => {
        let isi = await axiosLibrary.postData('awbUser/CekMaintssssenance');
        if (isi.status === 200) {
            if (isi.data.data != 0) {
                window.location.href = routeAll.routesComponent.maintenanceMode.path
            }
        }
    }

    //console.log(props.children);

        return (
            <div style={cssTarget(false)}>
                <GlobalState.Provider value={[globalState, setGlobalState]}>
                    <Head.HeadUser />
                    {props.children}
                    <Footer />
                </GlobalState.Provider>

            </div>
        );
    

}

export default Layout;
