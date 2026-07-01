import React, { useEffect, useState, useContext } from 'react';
import defaultLang from '../../helpers/lang';
import { securityData } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import GlobalState from '../../helpers/globalState';

function home_subscribe(){
    const [setState] = useContext(GlobalState)

    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()

    const [layoutPage, setLayoutPage] = useState([])

    const getLayoutPage =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbHome/LayoutPageList',credentials);
        setLayoutPage(isi.data.data)
        
        setLoading(false)
    }
    
    useEffect(()=>{
        getLayoutPage()
    }, [])

    const subscribe = async ()=>{
        const param = {
            optionFlag: 1,
            platform_id: securityData.Security_getPlatformId()
        }
        let response = await axiosLibrary.postData('awbUser/SubscribeEmail',param);
        if(response.status===200){
            let dataUser = axiosLibrary.getUserInfo()
            const awbEmailSubscribe = {
                'Cz_awb_email_subscribe': 1
            }
            dataUser = {...dataUser,...awbEmailSubscribe};
            localStorage.setItem('userinfo',JSON.stringify(dataUser));
            if(response.data.data===2){
                //harusnya login ulang
                window.location.reload()
            }
            setState(state => ({...state, showBtnConfirm:false ,modalProp:{modalShow:true, id:null, type: 'Subscribe', messageTitlePopup: defaultLang.lang.subscribe_thank_you}}))
        }
    }

    return(
        <>
            <section id="subscribe section-bg-subscription" style={{padding: "20px 0"}}>
            </section>

            <div  className="cta_section_small bg-subscribe px-0" style={{paddingTop:"0px"}}>

                        <div className="container subscribe">
                            <div className="row align-items-center">
                                {
                                    securityData.Security_UserIsSubscribe() == true ?
                                        <div className="col-md-12 animation subscribed-quote"  id="div-subscribe">	

                                        { loading? "" :
                                            layoutPage.filter((item) => item.title == "Subscription - Quote").map(
                                                (item, index) =>
                                                <div key={index} dangerouslySetInnerHTML={{
                                                    __html: item.page_content
                                                }}>
                                                </div>
                                                
                                            )
                                        }
                                            <br/><br/>
                                            <div className="text-center" style={{marginTop:"30px"}}>
                                                <a href="mailto:people-culture.learning@pmi.com" className="btn btn-outline-white btn-view-more">
                                                    { defaultLang.lang.home_submit_your_quite }
                                                </a>
                                                    
                                            </div>
                                        </div>
                                    :
                                        <>
                                            <div className="col-md-7"  id="div-subscribe">	
                                                
                                            </div>
                                            <div className="col-md-5 text_white animation subscription-form">
                                                
                                                <p className="mb-md-0 subscribe-info"
                                                dangerouslySetInnerHTML={{
                                                    __html: defaultLang.lang.home_subscribe_description
                                                }}
                                                >
                                                </p>
                                                
                                                <span className="subscribe-info" id="subscribe1"  style={
                                                    
                                                    {fontSize:"17px"}+ securityData.Security_UserIsSubscribe()  == true ? {display: "block"} : {display:"none"}}>
                                                    Thank you for subscribing!</span>
                                                <a onClick={()=>subscribe()}
                                                id="subscribe0" href="#" className="btn btn-outline-white btn-subscribe" >
                                                { defaultLang.lang.home_subscribe_caption }
                                                </a>
                                            </div>
                                        </>
                                }
                                
                                
                                
                            </div>
                        </div>

                    </div>   
        </>
        );
    }
export default home_subscribe;