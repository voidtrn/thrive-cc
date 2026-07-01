import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Slider from 'react-slick';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env, securityData } from '../../../helpers/globalHelper';
import defaultLang from '../../../helpers/lang';
import routeAll from '../../../helpers/route';

// setting slider for financial wellbeing (special_page)
const settings = {
    className:'your-class',
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 5000,
    centerPadding: '22%',
    slidesToShow: 1,
    nextArrow: <NextArrow />,
    prevArrow:<PrevArrow />,
    arrows:true,
    responsive: [
        {
        breakpoint: 768,
        settings: {
                arrows: true,
                centerMode: false,
                slidesToShow: 1
            }
        },
        {
        breakpoint: 480,
        settings: {
                arrows: false,
                centerMode: false,
                slidesToShow: 1
            }
        }
    ]
}
// end setting slider for financial wellbeing (special_page)

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
                zIndex:'1'
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

function Viewcourse(props){
    const history = useHistory()
    const [state, setState] = useState({
        titlePage: props.pageName,
        userDocument:env.userDocument,
        // userDocument:env.oldUserDocument,
        sliderSff:[],
        rsSidebarCategory4List:[],
        platformId: securityData.Security_getPlatformId()
    })

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getSlider()
            getCategory()

        }
    },[])

    const getSlider = async ()=>{
        let response = await axiosLibrary.postData('awbViewCourse/getSlider',{platform_id:state.platformId})
        if(response.status===200){
            setState(currentState=>({...currentState, sliderSff:response.data.data}))
        }
    }

    const getCategory = async ()=>{
        let response = await axiosLibrary.postData('awbViewCourse/getCategory',{platform_id:state.platformId})
        if(response.status===200){
            props.loading(false)
            setState(currentState=>({...currentState, rsSidebarCategory4List:response.data.data}))
        }
    }

    const changeCategory = (param) => {
        history.push({
            pathname: routeAll.routesUser.viewcourseDetail.path,
            search: "?" + new URLSearchParams({category: param}).toString()// your data array of objects
        })
        // go to viewcourse/courselist?data=<id>
        // lebih bagus di encode
    }
    return(
    <>
        <style>
            {
                `
                .your-class .slick-slide{
                    padding: 4rem 4rem 2rem 4rem;
                }
                
                .your-class img{
                    opacity: 0.4;
                    transition: all 300ms ease;
                    width: 100%;
                }
                
                .your-class .slick-center img{
                    /* padding: 1rem; */
                    -webkit-transform: scale(1.2);
                    opacity: 1;
                    transform: scale(1.2);
                }
                .header-category {
                    color: #3255d5;
                }
                .category-background{
                    background-repeat: no-repeat; 
                    background-position: center center;
                    background-size: cover;
                    height: 100px;
                    cursor: pointer;
                    opacity: 1;
                    transition: all 300ms ease;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                }
                
                .category-background:hover, 
                .category-background_active{
                    opacity: 1;
                }
                .btn_title_sff{
                    color:#fff;
                }
                @media only screen and (max-width: 767px){
                    .col, .col-1, .col-10, .col-11, .col-12, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-auto, .col-lg, .col-lg-1, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-auto, .col-md, .col-md-1, .col-md-10, .col-md-11, .col-md-12, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-auto, .col-sm, .col-sm-1, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-auto, .col-xl, .col-xl-1, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-auto{
                        padding-right: 15px;
                    }
                    .your-class .slick-slide{
                        padding: 30px 0 0 0;
                    }
                    .your-class img{
                        opacity: 1;
                    }
                    .section-view-all {
                        margin-top: 0;
                    }
                }
                `
            }
        </style>              
        <div id="topic" className="section-topic">
            <div className="container web-tour-section-topic">
                <div className="row justify-content-center2">
                    <div className="col-md-12">
                        <div className=" text-center">
                            <h2 className="section-title">&nbsp;</h2>
                            {/* <h2 className="section-title">{state.titlePage}</h2> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Slider {...settings}>
            {state.sliderSff.map((v, idx)=>
                <div key={idx}>
                    <a href={v.hyperlink_url}>
                        <img src={`${state.userDocument}slider_sff/${v.slider_image}`} alt={v.title} style={{marginTop:'-8px'}}/>
                    </a>
                </div>
            )}
        </Slider>
        <section id="function" className="section-view-all" >
            <div className="container containter-view-all">
                <div className="row">
                        <div className="col-md-12 pb-4 text-center">
                            <h3 className="header-category">{defaultLang.lang.choose_category}</h3>
                        </div>
                        <div className="col-md-12 pb-2 text-center">
                            <div className="row">
                                    {state.rsSidebarCategory4List.map((v,idx)=>
                                        <div className="col-md-3 pb-4" key={idx}>
                                            <div className="category-background" style={{backgroundImage:`url('${state.userDocument}category/${v.category_image}')`}} onClick={()=>changeCategory(v.pageId)}>
                                                <div className="p-2 btn_title_sff"><strong>{v.title}</strong></div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                </div>
            </div>
        </section>
    </>
    )
}

export default Viewcourse;