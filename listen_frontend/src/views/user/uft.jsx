import React, { useEffect, useState } from 'react';
import { env, securityData } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Image } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';

const file_path = env.userDocument
const recognitionUrl = env.recognitionUrl
const platform_id = securityData.Security_getPlatformId()
const platform_name = securityData.Security_getPlatformName()
const theme = securityData.Security_getTheme()

function Uft(props){

    const [items, setItems] = useState([])
    const [sliders, setSliders] = useState([])
    const [loading, setLoading] = useState(true)
    const [dashboardLink, setDashboardLink] = useState([])
    const settings = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        className: 'sliderHome'
      };

    const getSlider = async () => {
        setLoading(true)
        const credentials = {
            limit: 1,
            offset: 0,
            status_active: 1,
            category: "",
            platform_id: platform_id
        };
        let isi = await axiosLibrary.postData('uftSlider/ListData', credentials);
        setSliders(isi.data.data)
        setLoading(false)
    }

    const getFeature = async () => {
        setLoading(true)
        const credentials = {
            limit: 3,
            offset: 0,
            status_active: 1,
            category: "",
            platform_id: platform_id
        };
        let isi = await axiosLibrary.postData('uftFeature/ListData', credentials);
        setItems(isi.data.data)
        setLoading(false)
    }

    const getDashboardLink = async () => {
        const credentials = {
            platform_id: platform_id
        };
        let link = await axiosLibrary.postData('uftConfig/SelectData', credentials);
        setDashboardLink(link.data.data.value)
        // console.log(recognitionUrl)
    }

    const insertLogPage= async()=>{
        const param = {
            userName: securityData.Security_UserName(),
            userId: securityData.Security_UserId(),
            userAccount: securityData.Security_UserAccount(),
            userEmail: securityData.Security_UserEmail(),
            isMobile: isMobile,
            moduleName: 'Dialogue - ' + securityData.Security_getPlatformName(),
            feature: props.pageName
        }
        if(securityData.Security_getPlatformName()){
            let response = await axiosLibrary.postData("user/ActivityLog",param);
            if(response.status===200){
                let dataUser = axiosLibrary.getUserInfo();
                let dataLogYawa = {
                    Cz_dlg_uft:'1'
                }
                dataUser = {...dataUser, ...dataLogYawa}
                localStorage.setItem('userinfo',JSON.stringify(dataUser));
            }
        }
    }

    useEffect(()=>{
        getSlider()
        getDashboardLink()
        getFeature()
        if(!securityData.Security_getInsertLogUft()){
            insertLogPage()
        }
    },[])

    const insertLog = async(textFeature)=>{
        const param = {
            userName: securityData.Security_UserName(),
            userId: securityData.Security_UserId(),
            userAccount: securityData.Security_UserAccount(),
            userEmail: securityData.Security_UserEmail(),
            isMobile: isMobile,
            moduleName: 'Dialogue - ' + platform_name,
            feature: textFeature
        }
        // console.log(param)
        await axiosLibrary.postData("user/ActivityLog",param);
    }



    return(
    <>
        <style>
            {`
                .list-group{
                    padding:0;
                }

                .list-group-item:first-child {
                    border-top: 0px solid #f4f4f4;
                }
            
                .list-group-item {
                    border-top: 1px solid #f4f4f4;
                }
                .tbl-feedback-response{
                    width: 60%;
                    text-align: center;
                    margin: 0px 20% 20px;
            
                }
            
                .a-not-now{
                    color: #5d5c5c;
                    font-size: 17px;
                    text-align: right;
                    font-family: 'ubuntumedium';
                }
            
                .title-choose-reason{
                    padding-bottom:12px;
                }
            
                a.list-group-item:hover{
                    background-color: #d7f5d2;
                }
            
                a.a-disabled:hover,a.a-disabled{
                    background-color: #f4f4f4;
                }
            
                .container{
                    width:100%;
                }

                .row-centered {
                    text-align:center;
                }

                .col-centered {
                    display: inline-block;
                    float: none;
                    text-align: left;
                    margin-right: -4px;
                    text-align: center;
                }

                .col-md-3 {
                    position: relative;
                    min-height: 1px;
                    padding-right: 10px;
                    padding-left: 10px;
                }

                .box-feature img {
                    max-width: 100%;
                }
                
                a.cta-say-thank-you img {
                    height: 40px;
                }
                
                a.cta-go-to-your-dashboard img {
                    height: 40px;
                }
                
                .box-feature:hover {
                    -webkit-filter: grayscale(100%);
                }
                
                .box-feature img {
                -webkit-transition: all 1s ease;
                    -moz-transition: all 1s ease;
                        -o-transition: all 1s ease;
                    -ms-transition: all 1s ease;
                        transition: all 1s ease;
                }
            `}
        </style>
        <br/>
        <Slider {...settings}>
            {sliders.map(value =>
                <Image src={`${file_path}uft_slider/${value.slider_image}`} key={value.id} name={value.name} alt={`slider-image-${value.name}`} ></Image>
            )}
        </Slider>
        <div id="page-contents">
            <div className="container">
                <div className="row row-centered">
                { loading ? 
                    <div className="text-center"><img src={env.assets+"images/lazyloading.gif"} alt="loading_img"/></div> : 
                    items.map((item) =>
                        <div className="col-sm-6 col-md-3 col-centered" key={item.id}>
                            <div className="box-feature">
                                <a href={item.hyperlink}><img src={file_path+ "feature/" + item.feature_image} /> 
                                </a>
                            </div>
                        </div>
                    )
                }
                </div>
            </div>
            <br/>
            <div className="container">
                <div className="row-fluid">
                    <div className="col-xs-12 col-sm-6">
                        <a href={recognitionUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={insertLog.bind(this, 'Say Thank You!')} 
                            className="cta-say-thank-you" 
                            >
                            <img src={theme.img_uft_thank_you } />
                        </a>
                    </div>
                    <div className="col-xs-12 col-sm-6">
                        <a href={dashboardLink}
                            onClick={insertLog.bind(this, 'Go to Your Dashboard')} 
                            className="cta-go-to-your-dashboard float-end" 
                            >
                            <img src={theme.img_uft_dashboard } />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export default Uft;