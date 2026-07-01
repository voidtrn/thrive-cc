import React, { useEffect, useState } from 'react';
import { securityData, env } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
// import defaultLang from '../../helpers/lang';
// import { cssTarget, LoadingData } from '../../components/Loading';
// import routeAll from '../../helpers/route';
// import { useHistory } from 'react-router';
import Slider from "react-slick";
// import HomeSubscribe from './home_subscribe';
// import GlobalState from '../../helpers/globalState';

function PrevArrow(props){
    const { style, onClick } = props;
    return (
            <i className='fa fa-3x fa-angle-left' 
            style={{...style, 
                fontSize:'22px',
                color:'#0e93d8', 
                background:'#fff', 
                width:'35px', 
                height:'35px',
                borderRadius:'50%',
                padding:'6px 10px 0px 9px',
                position:'absolute',
                top:'40%',
                cursor: 'pointer',
                zIndex:'10'
            }} onClick={onClick}/>
    );
}

function NextArrow(props){
    const { style, onClick } = props;
    return (
            <i className='fa fa-3x fa-angle-right' 
            style={{...style, 
                fontSize:'22px',
                color:'#0e93d8', 
                background:'#fff', 
                width:'35px', 
                height:'35px',
                borderRadius:'50%',
                padding:'6px 10px 0px 9px',
                position:'absolute',
                top:'40%',
                right:'0%',
                cursor: 'pointer'
            }} onClick={onClick}/>
    );
}

function video(props){
    // const history = useHistory()
    // const [global, setGlobal] = useContext(GlobalState)

    // const [state, setState] = useState({
    //     layoutSectionList:[],
    //     layoutMenuList:[],
    //     layoutCategoryList: [],
    //     modalProp:{
    //         modalShow:false,
    //         id:null,
    //     },
    //     flagShowArticle: false,
    // })

    useEffect(()=>{
         props.loading(false)
    },[props])
    

    const [, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()

    const file_path = env.userDocument
    // const file_assets= env.assets

    const [sliders, setSliders] = useState([]) 

    const settingsSlider = {
        className:'your-class',
        autoplay: true,
        autoplaySpeed: 5000,
        slidesToShow: 1,
        nextArrow: <NextArrow />,
        prevArrow:<PrevArrow />,
        arrows:true,
        responsive: [
            {
            breakpoint: 768,
            settings: {
                arrows: true,
                slidesToShow: 1
            }
            },
            {
            breakpoint: 480,
            settings: {
                arrows: false,
                slidesToShow: 1
            }
            }
        ]
    }

    const getHomeSlider =  async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            user_id:user_id
        };

        let isi = await axiosLibrary.postData('awbHome/HomeSlider',credentials);
        setSliders(isi.data.data)
        
         
    }
    useEffect(() => {
        getHomeSlider()
    }, [])

    return(
        <>
            <style>
                {`	
                    html[data-useragent*='MSIE 10.0'] .headtopic {	
                    color: #617dbc;	
                    }	
                    #containerTopic {		
                        display: flex;		
                        flex-direction: row;		
                        flex-wrap: wrap;	
                        text-align: center;		
                        justify-content: center;	
                    }		
                    #containerTopic label {		
                    flex-basis: 15%;	
                    border: 1px solid #fff;	
                    padding: 10px 0px 0px 0px;	
                    display: block;	
                    position: relative;	
                    margin: 0px;	
                    cursor: pointer;		
                    }	
                    .btntopic{	
                        border: 2px solid #617dbc;	
                        color: #617dbc;	
                        width: 30%;	
                        font-weight: 900;	
                        padding: 0px 0px;	
                        border-radius: 20px;	
                    }	
                    .btntopic:hover{	
                    /* border: 2px solid #ffffff; */	
                    background: #617dbc;/* Old Browsers */	
                    background: -moz-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* FF3.6+ */	
                    background: -webkit-gradient(left top, right top, color-stop(0%, #617dbc), color-stop(32%, #617dbc), color-stop(87%, #5cb3d1), color-stop(100%, #5cb3d1));/* Chrome, Safari4+ */	
                    background: -webkit-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Chrome10+,Safari5.1+ */	
                    background: -o-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Opera 11.10+ */	
                    background: -ms-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* IE 10+ */	
                    background: linear-gradient(to right, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%);/* W3C */	
                    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#617dbc', endColorstr='#5cb3d1', GradientType=1 );/* IE6-9 */	
                    }	
                    .headtopic{	
                        text-align: center;	
                        background: -moz-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* FF3.6+ */	
                    background: -webkit-gradient(left top, right top, color-stop(0%, #617dbc), color-stop(32%, #617dbc), color-stop(87%, #5cb3d1), color-stop(100%, #5cb3d1));/* Chrome, Safari4+ */	
                    background: -webkit-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Chrome10+,Safari5.1+ */	
                    background: -o-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Opera 11.10+ */	
                    /* background: -ms-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); IE 10+ */	
                    /* background: linear-gradient(to right, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); */	
                    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#617dbc', endColorstr='#5cb3d1', GradientType=1 );/* IE6-9 */	
                        -webkit-background-clip:text;	
                        -webkit-text-fill-color: transparent;	
                        -moz-background-clip:text;	
                        -moz-text-fill-color: transparent;	
                        -o-background-clip:text;	
                        -o-text-fill-color: transparent;	
                        background-clip:text;	
                            
                    }	
                    input[type="checkbox"][id^="cb"] {	
                    display: none;	
                    }	
                    .titletopic{	
                        margin-top: 14px;	
                        font-size: 9pt;	
                        color: black;	
                    }	
                    .itemTopic:before {	
                    background-color: white;	
                    color: white;	
                    content: " ";	
                    display: block;	
                    border-radius: 50%;	
                    border: 2px solid #617dbc;	
                    position: absolute;	
                    left: 70px;	
                    top: 4px;	
                    width: 25px;	
                    height: 25px;	
                    text-align: center;	
                    font-size: 10pt;	
                    line-height: 24px;	
                    transition-duration: 0.4s;	
                    transform: scale(0);	
                    }	
                    .itemTopic img {	
                        width: 80px;	
                        border-radius: 10px 10px 10px 10px;	
                        -moz-border-radius: 10px 10px 10px 10px;	
                        -webkit-border-radius: 10px 10px 10px 10px;	
                        -webkit-box-shadow: 4px 4px 0px 1px rgb(216, 219, 221);	
                        -moz-box-shadow: 4px 4px 0px 1px rgb(216, 219, 221);	
                        box-shadow: 4px 4px 0px 1px rgb(216, 219, 221);	
                        transition-duration: 0.2s;	
                        transform-origin: 50% 50%;	
                    }	
                    :checked + .itemTopic:before{	
                        content: "✔";	
                        font-weight: 900;	
                        color: #617dbc;	
                    color: -moz-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* FF3.6+ */	
                    color: -webkit-gradient(left top, right top, color-stop(0%, #617dbc), color-stop(32%, #617dbc), color-stop(87%, #5cb3d1), color-stop(100%, #5cb3d1));/* Chrome, Safari4+ */	
                    color: -webkit-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Chrome10+,Safari5.1+ */	
                    color: -o-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* Opera 11.10+ */	
                    color: -ms-linear-gradient(left, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%); /* IE 10+ */	
                    color: linear-gradient(to right, #617dbc 0%, #617dbc 32%, #5cb3d1 87%, #5cb3d1 100%);/* W3C */	
                        background: #ffffff;	
                        background: -moz-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: -webkit-gradient(radial, center center, 0px, center center, 100%, color-stop(0%, #ffffff), color-stop(47%, #f6f6f6), color-stop(100%, #ededed));	
                        background: -webkit-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: -o-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: -ms-radial-gradient(center, ellipse cover, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        background: radial-gradient(ellipse at center, #ffffff 0%, #f6f6f6 47%, #ededed 100%);	
                        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#ededed', GradientType=1 );	
                    transform: scale(1);	
                    left: 70px;	
                    top: 4px;	
                    }	
                    :checked + .itemTopic img { 	
                    border: 4px solid transparent;	
                    background: #5cb3d1;/* Old Browsers */	
                    background: -moz-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* FF3.6+ */	
                    background: -webkit-gradient(left top, right bottom, color-stop(0%, #5cb3d1), color-stop(13%, #5cb3d1), color-stop(68%, #617dbc), color-stop(100%, #617dbc));/* Chrome, Safari4+ */	
                    background: -webkit-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* Chrome10+,Safari5.1+ */	
                    background: -o-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* Opera 11.10+ */	
                    background: -ms-linear-gradient(-45deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%); /* IE 10+ */	
                    background: linear-gradient(135deg, #5cb3d1 0%, #5cb3d1 13%, #617dbc 68%, #617dbc 100%);/* W3C */	
                    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#5cb3d1', endColorstr='#617dbc', GradientType=1 );/* IE6-9 fallback on horizontal gradient */	
                    /* border-image-slice: 1; */	
                    /* transform: scale(0.9); */	
                    z-index: -1;	
                    }	
                    @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {	
                    /* IE10+ CSS styles go here */	
                    }	
                    ul.file-upload-requirement {		
                        font-size: 11px;		
                        font-weight: normal;		
                        padding: 5px 0 5px 25px;		
                        list-style: circle;		
                    }		
                    .chosen-container-multi .chosen-choices{		
                            background-color: transparent;		
                            border: 2px solid #ededed;		
                    }		
                    ul.chosen-choices{		
                        min-height:170px;		
                    }	

                    #sliderContent{
                        padding: 0px 5px;
                    }

                    #event .slick-slide{
                        padding: 0px 20px;
                    }

                    #event{
                        margin-bottom: 5%;
                    }
                    
                    .share-article{
                        margin: 0px 0px;
                        float: right;
                        position:unset;
                        right: 0px;
                     }
                     img.poin-flag {
                         z-index: 9;
                         width: 40px !important;
                         top: 10px;
                         right: 0px;
                         position:unset;
                         float: right;
                     }
                     object{
                         float: right;
                         width: unset;
                         z-index: 2;
                         margin-top: 5px;
                         margin-right: 5px;
                     }

                    .slider-item{
                        height: 100vh;
                        width: 100%;
                        max-height: 450px;
                        margin-top: 60px;
                        cursor: pointer;
                        background-size: cover;
                    }

                    .hover{
                        color:white;
                    }

                    .hover:hover{
                        color: black;
                    }
                `}	
            </style>
            

            <section className="banner_section p-0 full_screen home-slider"
            >
                <div id="awbSlider" className="banner_content_wrap">
                <Slider {...settingsSlider}>
                {
                    sliders.map(
                        (slider, index) =>
                            {
                                if(slider.file_type == 'mp4')
                                {
                                    return(
                                        <div>
                                            <a>
                                                <div className="banner_slide_content">
                                                    <div className="container subscribe">
                                                        <div className="row">
                                                            <div className="col-lg-12 col-md-12 col-sm-12 text-start">
                                                                <div className="banner_content text_white">
                                                                    <h2 className="animation" data-animation="fadeInDown" data-animation-delay="1s"
                                                                    dangerouslySetInnerHTML={{ __html:securityData.Security_lang() == "ENG" ? slider.headline : slider.headline_ind}}
                                                                    > 
                                                                    </h2>
                                                                    <p className="animation my-4" data-animation="fadeInUp" data-animation-delay="1.5s"
                                                                        dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? slider.short_description : slider.short_description_ind  }}
                                                                    > 
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="video-wrap">
                                                    
                                                    <video className="video-center"  style={{height:"100%", width: "100%"}} 
                                                    loop={true} autoPlay={true} muted={true} poster={`${env.assets}img/video_poster.jpg`}
                                                    >
                                                        <source src={file_path+'slider/'+slider.slider_video} type="video/mp4" />
                                                        
                                                    </video>
                                                </div>
                                                
                                            </a>
                                        </div>
                                            
                                        );
                                } 
                                else
                                {
                                    return(                      
                                        <div key={index} className="background_bg overlay_bg">
                                            <div className="slider-item"
                                            style={{background: "url('"+file_path+"slider/"+slider.slider_video+"')", backgroundSize: "cover"}}>
                                                <a>
                                            <div className="banner_slide_content" >
                                                <div className="container subscribe">
                                                    <div className="row">
                                                        <div className="col-lg-12 col-md-12 col-sm-12 text-start">
                                                            <div className="banner_content text_white">
                                                                <h2 className="animation" data-animation="fadeInDown" data-animation-delay="1s"
                                                                dangerouslySetInnerHTML={{ __html:securityData.Security_lang() == "ENG" ? slider.headline : slider.headline_ind}}
                                                                > 
                                                                </h2>
                                                                <p className="animation my-4" data-animation="fadeInUp" data-animation-delay="1.5s"
                                                                dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? slider.short_description : slider.short_description_ind  }}
                                                                > 
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                            </div>
                                        </div> 
                                    );
                                }
                                
                            }
                            
                    )   
                }
            </Slider>
                    {sliders.length>1 ?
                        <div>
                            <a className="carousel-control-prev" href="#awbSlider" role="button" data-slide="prev"><i className="ion-chevron-left"></i></a>
                            <a className="carousel-control-next" href="#awbSlider" role="button" data-slide="next"><i className="ion-chevron-right"></i></a>
                        </div>
                        : ""
                    }
                </div>
                
            </section>


            <div>
                <Slider {...settingsSlider}>
                {
                    sliders.map(
                        (slider) =>
                            {
                                if(slider.file_type == 'mp4')
                                {
                                    return(
                                        <video className="video-center"  style={{height:"100%", width: "100%"}} 
                                        loop={true} autoPlay={true} muted={true} poster={`${env.assets}img/video_poster.jpg`}
                                        >
                                            <source src={file_path+'slider/'+slider.slider_video} type="video/mp4" />
                                            
                                        </video>
                                    )
                                }
                            }
                    )
                }
                </Slider>
            </div>
            
            <Slider {...settingsSlider}>
            {
                    sliders.map(
                        (slider) =>
                            {
                                if(slider.file_type == 'mp4')
                                {
                                    return(
                                        <div>
                                            <a>
                                                <div className="banner_slide_content">
                                                    <div className="container subscribe">
                                                        <div className="row">
                                                            <div className="col-lg-12 col-md-12 col-sm-12 text-start">
                                                                <div className="banner_content text_white">
                                                                    <h2 className="animation" data-animation="fadeInDown" data-animation-delay="1s"
                                                                    dangerouslySetInnerHTML={{ __html:securityData.Security_lang() == "ENG" ? slider.headline : slider.headline_ind}}
                                                                    > 
                                                                    </h2>
                                                                    <p className="animation my-4" data-animation="fadeInUp" data-animation-delay="1.5s"
                                                                        dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? slider.short_description : slider.short_description_ind  }}
                                                                    > 
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    
                                                    <video className="video-center"  style={{height:"100%", width: "100%"}} 
                                                    loop={true} autoPlay={true} muted={true} poster={`${env.assets}img/video_poster.jpg`}
                                                    >
                                                        <source src={file_path+'slider/'+slider.slider_video} type="video/mp4" />
                                                        
                                                    </video>
                                                </div>
                                                
                                            </a>
                                        </div>
                                    )
                                }
                            }
                    )
            }
            </Slider>

            <Slider {...settingsSlider}>
            {
                    sliders.map(
                        (slider, index) =>
                            {
                                if(slider.file_type == 'mp4')
                                {
                                    return(
                                        <div key={index} id="sliderContent" className="background_bg overlay_bg">
                                            <div className="slider-item">
                                                <a>
                                                    <div className="banner_slide_content">
                                                        <div className="container subscribe">
                                                            <div className="row">
                                                                <div className="col-lg-12 col-md-12 col-sm-12 text-start">
                                                                    <div className="banner_content text_white">
                                                                        <h2 className="animation" data-animation="fadeInDown" data-animation-delay="1s"
                                                                        dangerouslySetInnerHTML={{ __html:securityData.Security_lang() == "ENG" ? slider.headline : slider.headline_ind}}
                                                                        > 
                                                                        </h2>
                                                                        <p className="animation my-4" data-animation="fadeInUp" data-animation-delay="1.5s"
                                                                            dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? slider.short_description : slider.short_description_ind  }}
                                                                        > 
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="">
                                                        
                                                        <video className="video-center"  style={{height:"100%", width: "100%"}} 
                                                        loop={true} autoPlay={true} muted={true} poster={`${env.assets}img/video_poster.jpg`}
                                                        >
                                                            <source src={file_path+'slider/'+slider.slider_video} type="video/mp4" />
                                                            
                                                        </video>
                                                    </div>
                                                    
                                                </a>
                                            </div>
                                        </div>
                                    )
                                }
                                else
                                {
                                    return(                      
                                        <div key={index} className="background_bg overlay_bg">
                                            <div className="slider-item"
                                            style={{background: "url('"+file_path+"slider/"+slider.slider_video+"')", backgroundSize: "cover"}}>
                                                <a>
                                            <div className="banner_slide_content" >
                                                <div className="container subscribe">
                                                    <div className="row">
                                                        <div className="col-lg-12 col-md-12 col-sm-12 text-start">
                                                            <div className="banner_content text_white">
                                                                <h2 className="animation" data-animation="fadeInDown" data-animation-delay="1s"
                                                                dangerouslySetInnerHTML={{ __html:securityData.Security_lang() == "ENG" ? slider.headline : slider.headline_ind}}
                                                                > 
                                                                </h2>
                                                                <p className="animation my-4" data-animation="fadeInUp" data-animation-delay="1.5s"
                                                                dangerouslySetInnerHTML={{ __html: securityData.Security_lang() == "ENG" ? slider.short_description : slider.short_description_ind  }}
                                                                > 
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                            </div>
                                        </div> 
                                    );
                                }
                            }
                    )
            }
            </Slider>
        </>

    )
}

export default video;