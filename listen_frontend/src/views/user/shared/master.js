import React, { useEffect, useState } from 'react';
import Head from '../../../components/head';
import NavMenu from '../../user/shared/navMenu';
import Footer from './footer';
import { Navigate, useLocation } from 'react-router-dom'
import routeAll from '../../../helpers/route';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Image } from 'react-bootstrap';
import { env, securityData } from '../../../helpers/globalHelper';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { cssTarget } from '../../../components/Loading';

function Layout(props){
    const location = useLocation();

    if(Object.values(routeAll.routesUser).findIndex(list => list.path === location.pathname) < 0){
        return(
            <Navigate to={routeAll.routesComponent.notFound.path} exact/>
        )
    }else{
        return(
            <div style={cssTarget(false)}>
                <Head.HeadUser/>
                <div className="header-wrapper">
                    <NavMenu adminLevel={props.adminLevel} {...props}/>
                    <SliderFunc homePath={props.homePath} currentPath={location.pathname} {...props}/>
                    <div id="main-contents">
                        {props.children}
                    </div>
                    <Footer/>
                </div>
            </div>
        );
    }
    
}

function SliderFunc(props){
    const [sliderItems, setSliderItems] = useState([])
    const settings = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        className: 'sliderHome'
      };
    
    const filePath = env.userDocument

    const platform_id = securityData.Security_getPlatformId()

    const getSlider = async () =>{
        let response = await axiosLibrary.postData('dialogueSlider/RsSlider',{platform:platform_id});
        if(response.status === 200){
            setSliderItems(response.data.data)
            props.loading(false)
        }
    }

    const goTo = (hyperlink) => {
        window.open(hyperlink,'_blank')
    }

    useEffect(()=>{
        getSlider()
    },[props])

    if(props.homePath===props.currentPath){
        return(
            <div>
                <style>
                {`
                    .sliderHome{
                        cursor:pointer;
                    }
                `}
                </style>
                
                <Slider {...settings}>
                    {sliderItems.map(value =>
                        <Image src={`${filePath}slider/${value.slider_image}`} key={value.id} name={value.name} onClick={goTo.bind(this,value.hyperlink)}  alt={`slider-image-${value.name}`} style={{cursor:'pointer'}}></Image>
                    )}
                </Slider>
            </div>
        )
    }else{
        return(
            null
        )
    }
    
}

export default Layout;
