import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env, securityData } from '../../../helpers/globalHelper';
// import GlobalState from '../../../helpers/globalState';
// import defaultLang from '../../../helpers/lang';
import routeAll from '../../../helpers/route';
import "../../../assets/css/footer.css"

function Footer(){

    const [state, setState] = useState({
        adminAccess: false,
        urlAdmin: "",

    });
    // const location = useLocation()
    const user_id = securityData.Security_UserId()
    
    const offset = 0
    const limit = 9
    const platform_id = securityData.Security_getPlatformId()
    const [shortcutLinks, setShortcutLinks] = useState([]);

    const getAdminAccess = async () =>{
        const credentials = {
            user_id: user_id,
        };

        let isi = await axiosLibrary.postData('awbHutUser/CheckAdminAccess',credentials);
        
        //console.log(isi.data);
        if(isi.status===200){
            if(isi.data.statusAdmin === 'Admin'){
                setState(state => ({ ...state, adminAccess: true,  urlAdmin: isi.data.moduleData[0].url_admin  }))
            }
            else{
                setState(state => ({ ...state, adminAccess: false }))
            }
            
        }
    }

    useEffect(()=>{
            getAdminAccess();

    },[])

    // const [, setGlobal] = useContext(GlobalState)

    // const showFaq = ()=>{
    //     // here to show popup modal faq
    //     setGlobal(global=>({...global,modalProp:{modalShow:true, id:null, type:'faq'}}))
    // }

    // if(location.pathname===routeAll.routesUser.movement.path){
    //     return null
    // }else{
        return (
            <footer className="footer-container-growth">
              
                &copy; 2024 PT HM Sampoerna

                {
                    state.adminAccess === true ? 
                    <a href={state.urlAdmin} className="nav-link text-blue-growth" >Admin</a>
                    :
                    <></>
                }
                            
            </footer>
        )
    // }

}

export default Footer;