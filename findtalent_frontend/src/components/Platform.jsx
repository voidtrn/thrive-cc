import React, { Component } from 'react';
import{ Button , Modal, Image } from 'react-bootstrap';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import AuthHelpers from '../helpers/AuthHelpers';
import GlobalHelper from '../helpers/GlobalHelper';
import {isMobile} from 'react-device-detect';
import AuthContext from '../services/Auth'
import SSO from '../helpers/SSO';

// import { Modal, Button, ModalBody, ModalFooter } from 'reactstrap';

var {LoginData, AllRoute, env} = SSO;

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
class PlatformSelection extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[],
            user_id:'',
            user_account:'',
            user_country:'',
            user_directorate:'',
            platform_id:LoginData.Security_getPlatformId(),
            file_path: env.userDocument,
            openModal:false,
            autoModal:true,
            modalShow:false,
            infinite:true,
            slideToShow:3,
            assets_path:env.assets,
            canClose: this.props.canClose ? true : false
        };
        this.handleClose = this.handleClose.bind(this);
        this.addDefaultSrc = this.addDefaultSrc.bind(this);
        this.selectionPlatform();
      }

    handleClose() {
        this.setState({ modalShow: false });
    }
    
    selectionPlatform(){
        if(this.props.showPlatform){
            this.setState({modalShow:true})
        }
    }
    
    componentDidMount(){
        LoginData.Security_IsLogin().then((response)=>{
            this.getUserId();
        });
        
    }

    getUserId(){
            
        // this.login().then(()=>{
            this.setState({user_id:LoginData.Security_UserId(), user_account:LoginData.Security_UserAccount(),user_country:LoginData.Security_UserCountry(),user_directorate:LoginData.Security_UserDirectorate_3()},()=>{
                this.getUserPlatform();
            });
        // });
    }

    getUserPlatform= async ()=>{
        const {user_country,user_directorate,user_id} = this.state;
        let responseJson = await AuthHelpers.postData('findTalentPlatform/GetPlatformAccess',{country:user_country,directorate:user_directorate, user_id:user_id});
        if(responseJson?.status == 200){
            if(responseJson.data.data2 > 1){
                this.setState({items:responseJson.data.data},()=>{
                   this.setState({modalShow:true})
                })
            }

            if(responseJson.data.data2 == 1){
                const id = responseJson.data.data[0].id;
                const name = responseJson.data.data[0].name;
                // const point = responseJson.data.data[0].energy_point;
                AuthHelpers.setPlatformTheme(id,name,AllRoute.root);

            }

            if(responseJson.data.data2 < this.state.slideToShow){
                this.setState({infinite:false})
            }

            if(responseJson.data.data2 == 0){
                window.location.href=AllRoute.denied;
            }
        }
    }

    setPlatformForUser = async (props)=>{
        const { name, id, src, attributes } = props.target;
        AuthHelpers.setPlatformTheme(id,name,AllRoute.root);
    }

    addDefaultSrc(ev){
        const { name, id, src } = ev.target;
        ev.target.src =  "https://dummyimage.com/200x200/000000/ffffff.png&text=Platform+"+name;
    }

    render(){
        const settings = {
            infinite:this.state.infinite,
            slidesToShow: this.state.slideToShow,
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
        const modalBackground = env.assets + "images/frame-box.png";
        const {items,assets_path,file_path} = this.state;
        return(
            <div>
            <style>
                {`
                .slick-slider {
                    padding: 0px 3%
                }
                .slick-slide{
                    text-align: -webkit-center
                }
                .modal-content {
                    /* background-image: url(`+modalBackground+`); */
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
                    cursor: pointer;
                }
                .modal{
                    width: 100% !important;
                    padding-left:unset !important;
                    padding-right:unset !important;
                }
                `}
            </style>

            <Modal
            show={this.state.modalShow}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            onHide={this.handleClose}
            onExited={()=>{this.props.chgState(false)}}
            backdrop={this.state.canClose ? true:"static"}
            keyboard={false}
            centered
            >
            <Modal.Body style={{margin:"1% 1%"}}>
                {this.state.canClose ? 
                <span className="close" onClick={this.handleClose}>
                   
                </span>
                :
                null
                }
                
                <h3 style={{textAlign:"center",paddingBottom:"2%", color:"black"}}>
                    CHOOSE YOUR PLATFORM
                </h3>

                <Slider {...settings}>
                    {items.map((platform, id)=>
                        <div className="module-icon">
                            <Image src={file_path+"platform/"+platform.platform_image} height={200} width={200} name={platform.name} id={platform.id} onClick={this.setPlatformForUser.bind(this)} rounded onError={this.addDefaultSrc}></Image>
                        </div>
                    )}
                    {/* <div className="module-icon">
                        <Image src="https://dummyimage.com/200x200/000000/ffffff.png&text=Platform+1" rounded></Image>                    
                    </div>
                    <div className="module-icon">
                        <Image src="https://dummyimage.com/200x200/000000/ffffff.png&text=Platform+1" rounded></Image>                    
                    </div>
                    <div className="module-icon">
                        <Image src="https://dummyimage.com/200x200/000000/ffffff.png&text=Platform+1" rounded></Image>                    
                    </div>
                    <div className="module-icon">
                        <Image src="https://dummyimage.com/200x200/000000/ffffff.png&text=Platform+1" rounded></Image>                    
                    </div>
                    <div className="module-icon">
                        <Image src="https://dummyimage.com/200x200/000000/ffffff.png&text=Platform+1" rounded></Image>                    
                    </div> */}
                </Slider>
            </Modal.Body>
            </Modal>
            </div>

        );
    }
}
    
    export default PlatformSelection;
