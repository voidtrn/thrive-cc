import React, {
  useEffect, useState
} from 'react';

import { env, securityData } from '../../helpers/globalHelper.js';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Image } from 'react-bootstrap';

import '../../i18n.js'

import { useTranslation } from "react-i18next";




function LeaderPhoto() {

  const settingSliders = {
    dots: true,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 10000,
  };

  const { t, i18n: { changeLanguage, language } } = useTranslation();



  const skills = () => document.getElementById('form-submit');
  const handleClick = async () => {
    skills().scrollIntoView({ behavior: 'smooth' })
  }
  return (


    <section className="page-section-2" id="leaders">

      <div className="text-center">
        <p className="text100">{t('textOurLeaders')}</p>
        <p className="subTitle">{t('textSubOurLeaders')}</p>
      </div>

      <div className="container mt-4">

        <div className="row">
          
        <div className="col-md-12"> <center>
        <Slider {...settingSliders}>
            <center><img src={env.assets + "_newdialogue/images/leaders-slider/slider1.png"} className="img-fluid img-thumbnail pointer" onClick={handleClick.bind(this,)}/></center>
            <center><img src={env.assets + "_newdialogue/images/leaders-slider/slider2.png"} className="img-fluid img-thumbnail pointer" onClick={handleClick.bind(this,)}/></center>
            <center> <img src={env.assets + "_newdialogue/images/leaders-slider/slider3-new-2.png"} className="img-fluid img-thumbnail pointer" onClick={handleClick.bind(this,)}/></center>
            
            
           
        </Slider></center>
        </div>
        </div>

      </div>

    </section>

  )
}

export default LeaderPhoto;