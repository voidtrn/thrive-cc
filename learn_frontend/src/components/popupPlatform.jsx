import React, { useContext, useEffect, useState } from 'react';
import{  Modal, Image } from 'react-bootstrap';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { env, securityData } from '../helpers/globalHelper';
import axiosLibrary from '../helpers/axiosLibrary';
import routeAll from '../helpers/route';
import { useHistory } from '../helpers/useHistory';
import GlobalState from '../helpers/globalState';
import { cssTarget, LoadingAdmin } from './Loading';

function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
          <img src={env.assets + "images/nav-right-hover.png"} className={className} style={{ ...style, display: "block", width:60, height:60}} onClick={onClick}/>
    );
  }
  
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
          <img src={env.assets + "images/nav-left-hover.png"} className={className} style={{ ...style, display: "block", width:60, height:60 }} onClick={onClick}/>
    );
  }

function PopupPlatform(props){
    const history = useHistory()
    const [modalShow, setModalShow] = useState(false)
    const [canClose, setCanClose] = useState(props.canClose || false)
    const [infinite, setInfinite] = useState(true)
    const [slideToShow] = useState(3)
    const [items, setItems] = useState([])
    const user_id = securityData.Security_UserId();
    const user_country = securityData.Security_UserCountry();
    const user_directorate = securityData.Security_UserDirectorate_3();
    const [, setGlobal] = useContext(GlobalState);
    const [loading, setLoading] = useState(false)

    const file_path = env.userDocument

    const settings = {
        infinite: infinite,
        slidesToShow: slideToShow,
        slidesToScroll: 1,
        speed: 500,
        nextArrow: <SampleNextArrow/>,
        prevArrow: <SamplePrevArrow/>,
        responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                nextArrow: <SampleNextArrow/>,
                prevArrow: <SamplePrevArrow/>,
              }
            },
            {
              breakpoint: 600,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                nextArrow: <SampleNextArrow/>,
                prevArrow: <SamplePrevArrow/>,
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                nextArrow: <SampleNextArrow/>,
                prevArrow: <SamplePrevArrow/>,
              }
            }
          ]
      };

    const setPlatformForUser = async (props) => {
        setLoading(true)
        setCanClose(false)
        const { name, id} = props.target;
        axiosLibrary.setPlatformTheme(id,name,window.location.href);
    }

    const getUserPlatform = async () => {
        let responseJson = await axiosLibrary.postData('awbPlatform/GetPlatformAccess',{country:user_country,directorate:user_directorate, user_id:user_id});
        var test_return = false;
        if(responseJson.status == 200){
            if(!securityData.Security_getPlatformId()){
                test_return = await axiosLibrary.cekLinkSource(responseJson.data.data)
            }

            if(!test_return){
                if(responseJson.data.data2 > 1){
                    setItems(responseJson.data.data)
                    setModalShow(true)
                }
    
                if(responseJson.data.data2 == 1){
                    const id = responseJson.data.data[0].id;
                    const name = responseJson.data.data[0].name;
                    axiosLibrary.setPlatformTheme(id,name,window.location.href);
                }
    
                if(responseJson.data.data2 < slideToShow){
                    setInfinite(false)
                }
    
                if(responseJson.data.data2 == 0){
                    history.push({
                        pathname: routeAll.routesComponent.accessDenied.path,
                        data: {accessPlatform: false}// your data array of objects
                    })
                }
            }
        }
    }

    useEffect(()=>{
        getUserPlatform()
    },[])

    const addDefaultSrc = (ev) => {
        const {id} = ev.target
        ev.target.src =  "https://dummyimage.com/200x200/000000/ffffff.png&text=Platform+"+id;
    }
    
    return(
        <div>
            <style>
                {`
                .slick-slider {
                    // padding: 0px 3%
                }
                .slick-slide{
                    text-align: -webkit-center
                }
                .modal-content {
                    background-position: center;
                    background-size: 100% 100%;
                    z-index: 100000;
                  }
                .module-icon{
                    box-shadow: 2px 3px 5px 0px rgba(128,125,128,1);
                    border: 1px solid #e5e5e5;
                    height:200px;
                    width:200px !important;
                    cursor: pointer;
                    margin: 10px 5px;
                    border-radius: 7px;
                }

                .module-icon:hover{
                    box-shadow: 1px 3px 24px 0px rgba(128,125,128,1);
                }

                .module-icon img:hover{
                    transform: scale(0.9);
                }
                .close {
                    opacity:.8;
                }
                .custom {
                    position: absolute;
                    float: right;
                    right: -300px;
                    top: -100px;
                }
                .modal-backdrop.show {
                    opacity: 0.9;
                }
                `}
            </style>

        <Modal
        show={modalShow}
        aria-labelledby="contained-modal-title-vcenter"
        onHide={()=>{setModalShow(false)}}
        onExited={()=>{setGlobal(global=>({...global, showPlatform:false}));props.chgState(false)}}
        backdrop={canClose ? true:"static"}
        keyboard={false}
        size="lg"
        dialogClassName=""
        >
        <Modal.Body style={{margin:"1% 1%"}}>
            {canClose ? 
            <span className="close" onClick={()=>setModalShow(false)}>
                <i className="fa fa-close custom" ></i>
            </span>
            :
            null
            }
            
            <h3 style={{textAlign:"center",paddingBottom:"2%", color:"black"}}>
                CHOOSE YOUR PLATFORM
            </h3>
            <LoadingAdmin loading={loading}/>
            <div style={cssTarget(loading)}>
                <Slider {...settings}>
                    {items.map((platform, id)=>
                        <div className="module-icon" key={id}>

                            <Image src={file_path+"platform/"+platform.platform_image} height={200} width={200} name={platform.name} id={platform.id} onClick={setPlatformForUser.bind(this)} rounded onError={addDefaultSrc}></Image>
                        </div>
                    )}
                </Slider>
            </div>
        </Modal.Body>
        </Modal>
        </div>
    )
}

export default PopupPlatform;