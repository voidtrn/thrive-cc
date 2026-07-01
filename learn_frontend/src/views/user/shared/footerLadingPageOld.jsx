import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env, securityData } from '../../../helpers/globalHelper';
// import GlobalState from '../../../helpers/globalState';
// import defaultLang from '../../../helpers/lang';
import routeAll from '../../../helpers/route';
import "../../../assets/css/footer.css"

function Footer(){
    // const location = useLocation()
    
    const offset = 0
    const limit = 9
    const platform_id = securityData.Security_getPlatformId()
    const [shortcutLinks, setShortcutLinks] = useState([]);

    const getFooterLink = async () =>{
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id,
            flag_active:'1'
        };

        let isi = await axiosLibrary.postData('awbShortcutLink/ListData',credentials);
        if(isi.status===200){
               setShortcutLinks(isi.data.data)
        }
    }

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getFooterLink()
        }

    },[securityData.Security_getPlatformId()])

    // const [, setGlobal] = useContext(GlobalState)

    // const showFaq = ()=>{
    //     // here to show popup modal faq
    //     setGlobal(global=>({...global,modalProp:{modalShow:true, id:null, type:'faq'}}))
    // }

    // if(location.pathname===routeAll.routesUser.movement.path){
    //     return null
    // }else{
        return (
            <footer className="footer-container">
                <div className="top_footer text_white">
                    <div className="section-footer">
                        <div className="d-sm-flex flex-row align-items-center">
                            <div className="footer_logo pe-4">
                                <a href={routeAll.routesUser.home.path}><img alt="logo" src={env.assets+"img/AWB footer logo.svg"} width={140}/>
                                </a>
                            </div>
                            <div className="ps-4">
                                <div className="d-flex flex-column flex-wrap list-shortcut-link justify-content-between pt-2 pb-2">
                                    {shortcutLinks.map((v, idx)=>
                                        <div className="items-shortcut p-2 pe-3" key={idx}>
                                            <a href={v.hyperlink_url} className="a-link-shortcut" rel="noreferrer" target={"_blank"}>{securityData.Security_lang() == "ENG" ? v.title : v.title_ind}</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="copyright ms-auto">
                                <div id="copyright">
                                    <p className="copyright">AWB &copy; 2022</p>
                                </div>  
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        )
    // }

}

export default Footer;