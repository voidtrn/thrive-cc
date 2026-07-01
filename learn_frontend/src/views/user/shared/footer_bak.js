import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env, securityData } from '../../../helpers/globalHelper';
import GlobalState from '../../../helpers/globalState';
import defaultLang from '../../../helpers/lang';
import routeAll from '../../../helpers/route';

function Footer(){
    const location = useLocation()
    const [footerLink, setFooterLink] = useState('')
    //from awb mst page with title contact us
    // const footerLink = 'People-Culture.Learning@pmi.com'
    const offset = 0
    const limit = 10
    const platform_id = securityData.Security_getPlatformId()

    const getFooterLink = async () =>{
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbPages/ListData',credentials);
        if(isi.status===200){
            const link = isi.data.data.filter(v=>v.title=='Contact Us')
            if(link.length > 0){
                setFooterLink(link[0].page_content)
            }else{
                setFooterLink('noemail@noemail.com')
            }
        }
    }

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getFooterLink()
        }

    },[securityData.Security_getPlatformId()])

    const [, setGlobal] = useContext(GlobalState)

    const showFaq = ()=>{
        // here to show popup modal faq
        setGlobal(global=>({...global,modalProp:{modalShow:true, id:null, type:'faq'}}))
    }

    if(location.pathname===routeAll.routesUser.movement.path){
        return null
    }else{
        return (
            <footer className="overlay_bg3 background_bg">
                <div className="top_footer text_white">
                    <div className="container section-footer">
                        <div className="row">
                            <div className="col-lg-6 col-md-6">  
                                <div className="row">
                                    <div className="col-lg-12 col-md-12">
    
                                    </div>
                                    <div className="col-lg-8 col-md-6 mb-6 mb-lg-0">
                                        <br/><br/><br/>
                                        <ul className="list_none footer-links-menu">
                                            <li><a href={`mailto:${footerLink}`}>{defaultLang.lang.footer_contact_us}</a></li>
                                            <li><a href={`mailto:${footerLink}`}>{defaultLang.lang.footer_feedback}</a></li>
                                            <li><a tabIndex="0" role="button" style={{cursor:'pointer'}} onClick={()=>showFaq()}>FAQ</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6">
                                <div className="footer_logo">
                                    <a href={routeAll.routesUser.home.path}><img alt="logo" src={env.assets+"img/logo-bottom.png"}/>
                                        <span style={{color:"#fff",display:'block',marginTop:"10px",marginRight:"3px",fontSize:"15px"}}>
                                            Powered by : 
                                            <img className="logo_footer_fuse" src={env.assets+"img/footer-fuse-2.png"} alt="fuse" />
                                        </span>
                                    </a>
                                </div>    
                                <p className="copyright m-md-0 text-center text-md-right">&copy; 2021 HM Sampoerna. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        )
    }

}

export default Footer;