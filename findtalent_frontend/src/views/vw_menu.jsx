import { Component } from 'react';
import { AuthenticationContext } from 'react-adal';
import { Link } from "react-router-dom";
import AuthContext from '../services/Auth';
import{ Button , Modal, ButtonToolbar, ButtonGroup, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import AuthHelpers from '../helpers/AuthHelpers';
import PlatformSelection from '../components/Platform';
import SSO from '../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

class vw_menu extends Component{
    constructor(props){
        super(props)
        this.state = {
            platform_name:"Null Platform",
            platform_lang:"Null Language",
            showPlatform : false,
            showClosebutton: true,
            menu_logo: env.assets + "img/menu/menu.png",
            image_logo: env.assets + "img/logo.png",
            home_logo: env.assets+"img/menu/menu_home_eng.png",
            report_logo: env.assets+"img/menu/menu_report.png",
            admin_logo: env.assets+"img/menu/menu_admin.png",
            report_record: "Individual Record",
            report_score: "Meeting Score",
            dashboard_logo:"",
            list_theme:[],
            id_theme:"",
            isAdmin:LoginData.Security_IsAdmin(),
            isSuperAdmin:LoginData.Security_IsLoginSuperAdmin()
        };
        this.handleClick = this.handleClick.bind(this)
        this.handleClickTheme = this.handleClickTheme.bind(this)
    }

    setTheme = () =>{
        if(LoginData.Security_getTheme()){
            var img = new Image();
            img.src = env.userDocument+"theme/"+LoginData.Security_getTheme().image_logo;
            img.onload = ()=>{
                this.setState({
                    image_logo: env.userDocument +"theme/"+LoginData.Security_getTheme().image_logo,
                    home_logo:env.userDocument+"theme/"+LoginData.Security_getTheme().image_home,
                    report_logo:env.userDocument+"theme/"+LoginData.Security_getTheme().image_report,
                    admin_logo:env.userDocument+"theme/"+LoginData.Security_getTheme().image_admin,
                    menu_logo: env.userDocument+"theme/"+LoginData.Security_getTheme().image_menu_available,
                })
            }

            this.setState({
                platform_name:LoginData.Security_getPlatformName(),
                platform_lang:LoginData.Security_getTheme().lang,
                id_theme:LoginData.Security_getTheme().id
            },()=>{
                this.getListTheme();
            })
                
        }
    }

    componentDidMount(){
        this.setTheme();
    }

    handleLogout = () =>{
        localStorage.clear();
        AuthContext.logOut();
    }

    getListTheme = async ()=>{
        if(LoginData.Security_getPlatformId()){
            const param = {
                platform_id:LoginData.Security_getPlatformId(),
                listTheme:1
            }
            let responseJson = await AuthHelpers.postData('findTalentTheme/SelectDataByPlatform',param);
            if(responseJson.status==200){
                this.setState({list_theme:responseJson.data.data});
            }
        }
    }

    handleClickTheme = async (val)=>{
        if(val.target.name !== ""){
            const param = {
                platform_id:LoginData.Security_getPlatformId(),
                lang: val.target.name
            }

            let responseJson = await AuthHelpers.postData('findTalentTheme/SelectDataByPlatform',param);
            // console.table(responseJson.data.data)
            if(responseJson.status==200){
                localStorage.setItem("platform_theme",JSON.stringify(responseJson.data.data));
                window.location.href=AllRoute.root;
            }else{
                alert("ERROR NO RESPONSE")
            }
        }
    }

    handleClick = (val)=>{
        if(val===false){
            this.setState({showPlatform:false});
        }else{
            this.setState({showPlatform:true});
        }
    }

  render(){
       const {
            menu_logo,
            platform_name,
            platform_lang,
            image_logo,
            home_logo,
            report_logo,
            admin_logo,
            list_theme,
            isAdmin,
            isSuperAdmin
        } = this.state
    return (
        <header id="header">
        <style>{
            `
            
            .cursor-enable{
                cursor:pointer;
            }
            .bolder{
                font-weight:bold;
            }
            .dropdown-toggle:after { content: none }
            .dropdown-item {
                font-size: 13px;
                line-height: 16px;
                list-style: none;
                padding: 8px 20px;
                border-bottom: 1px solid rgba(255,255,255, 0.1);
                font-weight: 600;
            }
            .dropdown-item:hover, .dropdown-item:focus {
                color: #e6e6e6;
                font-weight: 700;
                background-color: unset;
            }
            .navbar {
                padding-bottom: 0px;
                padding-left: 0px;
                padding-right: 0px;
            }
            .menu {
                border-image: `+LoginData.Security_getTheme().top_menu_border+` 0 0 100% 0/0 0 3px 0 stretch;
            }
            .friend-list .business-card:hover{
                -webkit-box-shadow: 0px 1px 12px 0px rgba(209,209,209,1);
                -moz-box-shadow: 0px 1px 12px 0px rgba(209,209,209,1);
                box-shadow: 0px 1px 12px 0px rgba(209,209,209,1);
                border-image: `+LoginData.Security_getTheme().top_menu_border+` 0 0 100% 0/0 0 3px 0 stretch;
            }
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                z-index: 1000;
                display: none;
                float: left;
                min-width: 10rem;
                padding: 0.5rem 0;
                margin: 0.125rem 0 0;
                font-size: 1rem;
                color: #212529;
                text-align: left;
                list-style: none;
                background-color: #fff;
                background-clip: padding-box;
                border: 1px solid rgba(0, 0, 0, 0.15);
                background-image: `+LoginData.Security_getTheme().top_menu_background+`;
            }
            .dropdown-item {
                color: `+LoginData.Security_getTheme().top_menu_color+`;
            }
            `
            }
        </style>
        <Navbar collapseOnSelect expand="lg" className="menu">
            
            <div className="container">
            <Navbar.Brand href={AllRoute.root}>
                <img src={image_logo} alt="logo" />
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="responsive-navbar-nav"  />
            
            <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-end" >
                <Nav >
                    <Nav.Item>
                        <Nav.Link href={AllRoute.root}>
                            <img src={home_logo} className="img-menu" />
                        </Nav.Link>
                    </Nav.Item>
                    {isAdmin ?
                        <> 
                        <NavDropdown title={<img src={report_logo} className="img-menu"/>}  id="collasible-nav-dropdown">
                            <NavDropdown.Item href={AllRoute.adminReportSummary}>
                                Project Summary
                            </NavDropdown.Item>
                            <NavDropdown.Item href={AllRoute.adminReportDetail}>
                                Project Detail
                            </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title={<img src={admin_logo} className="img-menu" />}  id="collasible-nav-dropdown">
                            {isSuperAdmin? 
                            <NavDropdown.Item href= {AllRoute.adminPlatform} >
                                Platform
                            </NavDropdown.Item>
                            :null}
                            <NavDropdown.Item href= {AllRoute.adminTheme} >
                                Theme
                            </NavDropdown.Item>
                            <NavDropdown.Item href= {AllRoute.adminUsers} >
                                Users
                            </NavDropdown.Item>
                            <NavDropdown.Item href= {AllRoute.adminSlider} >
                                Image Slider
                            </NavDropdown.Item>
                            <NavDropdown.Item href= {AllRoute.adminProject} >
                                Manage Project
                            </NavDropdown.Item>
                            <NavDropdown.Item href= {AllRoute.adminUserProject} >
                                User Project
                            </NavDropdown.Item>
                            <NavDropdown.Item href= {AllRoute.adminActivityLog} >
                                Activity Log
                            </NavDropdown.Item>
                        </NavDropdown>
                        </>
                    : 
                    null}
                    <NavDropdown title={<img src={menu_logo} className="img-menu"/>}  id="collasible-nav-dropdown">
                        <NavDropdown.Item onClick={this.handleLogout.bind(this)} >
                        Logout
                        </NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Item id="lilang" >
                            <Nav.Link className="lang-menu lang-desktop" style={{color:"black", margin: "0 auto"}} >
                                <ButtonToolbar >
                                    <ButtonGroup>
                                        <Button className="buttonGroupPlatform bolder btn-warning" onClick={this.handleClick}>{platform_name}</Button>
                                        {list_theme.map((list, id)=>
                                            <Button key={id} className={list.lang===platform_lang? "buttonGroupPlatform bolder":"buttonGroupPlatform" } name={list.lang} onClick={this.handleClickTheme}>{list.lang}</Button>
                                        )}
                                    </ButtonGroup>
                                </ButtonToolbar>   
                            </Nav.Link>   
                    </Nav.Item>
                    <Nav.Item>
                            {this.state.showPlatform ? <PlatformSelection canClose={this.state.showClosebutton} showPlatform={this.state.showPlatform} chgState={this.handleClick}/>:null} 
                    </Nav.Item>
                </Nav>
            </Navbar.Collapse>
            
             </div>       
       </Navbar>
           
    </header>
      
    );
  }
}


export default vw_menu;

