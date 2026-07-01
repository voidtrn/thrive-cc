import React, { 
    useEffect,
    useState 
  } from 'react';
import routeAll from '../../../helpers/route';
import { securityData } from '../../../helpers/globalHelper';
import navMenu from '../../../helpers/navMenu';
import{ Button , ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import PopupPlatform from '../../../components/popupPlatform';
import axiosLibrary from '../../../helpers/axiosLibrary';


function NavMenu(props){
    const [showFilter] = useState(false);
    const platform_name = securityData.Security_getPlatformName() || "null platform"
    const platform_lang = securityData.Security_getTheme().lang || "null language"
    const [showPlatform, setShowPlatform] = useState(false)
    const [showClosebutton, setShowCloseButton] = useState(true)
    const btnWizardPostColor = ""
    const theme = securityData.Security_getTheme()
    const [list_theme, setList_theme] = useState([])

    useEffect(()=>{
        if(!securityData.Security_getPlatformId()){
            setShowCloseButton(false)
            setShowPlatform(true)
        }
    })

    const handleClick = (val) =>{
        if(val===false){
            setShowPlatform(false)
        }else{
            setShowPlatform(true)
        }
    }

    const handleLogout =()=>{
        axiosLibrary.logOut()
    }

    const handleClickTheme = (val)=>{
        if(val.target.name !== ""){
            const param = {
                platform_id:securityData.Security_getPlatformId(),
                lang:val.target.name
            }
            axiosLibrary.changeThemeNull(param,window.location.href)
        }
    }

    useEffect( async ()=>{
        if(securityData.Security_getPlatformId())
        {
            let responseJson = await axiosLibrary.postData('dialogueTheme/SelectDataByPlatform',{platform_id:securityData.Security_getPlatformId(),listTheme:1});
            if(responseJson.status===200){
                setList_theme(responseJson.data.data)
            }
        }
    },[securityData.Security_getPlatformId()])
    
    const renderNav = ()=>{
        return (
            navMenu.menu.filter(navBar => navBar.adminLevel <= props.adminLevel).map((nav, idx)=>{
                    return(
                        <li className={nav.showMobile? "dropdown" : "dropdown hidden-xs"} id="lihome" key={idx}>
                            {nav.dropdown ?
                                    <> 
                                    <a href={nav.href} className="dropdown-toggle pages" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><img src={nav.imageMenu} className="img-menu" alt={nav.txtName}/></a>
                                    <ul className="dropdown-menu newsfeed-home">
                                        {nav.dropdownMenu.filter(list => list.adminLevel <= props.adminLevel).map((dropdownList, idxDropdown)=>{
                                            if(dropdownList.dropdown){
                                                return(
                                                    null
                                                )
                                            }else{
                                                return(
                                                    <li key={idxDropdown}>
                                                        {dropdownList.txtName==='Logout'?
                                                        // eslint-disable-next-line
                                                        <a onClick={dropdownList.eventOnClick}>
                                                            {dropdownList.txtName}
                                                        </a>
                                                        :
                                                        <a 
                                                        href={dropdownList.href} 
                                                        onClick={dropdownList.eventOnClick}
                                                        >
                                                            {dropdownList.txtName}
                                                        </a>
                                                        }
                                                        
                                                    </li>
                                                )                                            
                                            }
                                        })}
                                    </ul>
                                    </>
                                :
                                <a href={nav.href} ><img src={nav.imageMenu} className="img-menu" alt={nav.txtName}/></a>     
                            }
                        </li>
                    )
            })
            
        )
    }

    return(
    <header id="header">
        <style>{
            `.buttonGroupPlatform{
                border : 2px solid;
                color : `+btnWizardPostColor+`;
             }
             .buttonGroupPlatform:hover, .buttonGroupPlatform:focus, .buttonGroupPlatform:active, .buttonGroupPlatform:active:focus{
                color : #fff;
                background-color: `+btnWizardPostColor+`;
                border-color: `+btnWizardPostColor+`;
             }
             .cursor-enable{
                 cursor:pointer;
             }
             .bolder{
                 font-weight:bold;
             }
             .lang-menu {
                margin: 20px 0px 0 20px;
                }
            .menu{
                    background-color:${theme.clr_background_menu}
                }
            .menu ul.main-menu li ul.dropdown-menu {
                    background: ${theme.grd_background_color_dropdown_menu}
                }
            .menu ul.main-menu li ul.dropdown-menu li a, .menu ul.main-menu li.open ul.dropdown-menu li a {
                    color: ${theme.clr_color_font_dropdown_menu}
                }
            .menu {
                    border-image: ${theme.grd_border_bottom_menu} 0 0 100% 0/0 0 3px 0 stretch;
                }
            body {
                    background-color: ${theme.clr_background_body}
                }
            .event-profile {
                    background: ${theme.grd_dialogue_list_border_image_and_background_button}
                }
            .btn-event-submit {
                    background: ${theme.grd_dialogue_list_border_image_and_background_button}
                }
            .box-selected{
                    background: ${theme.grd_dialogue_list_border_image_and_background_button_hover}
                }
            .btn-selected{
                    background: ${theme.grd_dialogue_list_border_image_and_background_button_hover}
                }
            h4.modal-title{
                    color: ${theme.clr_dialogue_initiate_and_yawa_popup_title_font_color}
                } 
            .btn-style{
                    background: ${theme.grd_dialogue_initiate_and_yawa_popup_button_submit_background}
                    color: ${theme.clr_dialogue_initiate_and_yawa_popup_button_submit_font_color}
                }
            .yawa-event{
                background:${theme.grd_yawa_list_border_image}
            }
            .yawa-box-selected{
                background:${theme.grd_yawa_list_border_image_hover}
            }
            .yawa-question .detail-question{
                    border-left: 7px solid ${theme.clr_yawa_border_left_detail_question}
                }
            .dialogue-gallery p.title {
                    color: ${theme.clr_gallery_font_color}
                }
            #footer {
                    background: ${theme.clr_background_footer}
                }
            .copyright {     
                    color: ${theme.clr_color_font_footer}
                }
            `
            }
        </style>
      <nav className="navbar navbar-fixed-top navbar-default menu">
        <div className="container-header">

          {/* <!-- Brand and toggle get grouped for better mobile display --> */}
          <div className="navbar-header">

          
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" id="logo" href={routeAll.routesUser.home.path}><img src={theme.img_navbar_menu} alt="logo"/></a>
          </div>

          {/* <!-- Collect the nav links, forms, and other content for toggling --> */}
          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav navbar-right main-menu">
                {renderNav()} 
                <li className="dropdown" id="liContact">
                    <span>{theme.txt_email_menu_for_more_information} <a href={theme.txt_email_menu_mailto} >{theme.txt_email_menu_hms_internal_communications}</a></span>
                </li>

                <li id="lilang">

                <div className="lang-menu lang-desktop" style={{color:"black"}}>
                    <ButtonToolbar >
                        <ButtonGroup>
                            <Button className="buttonGroupPlatform bolder" onClick={handleClick}>{platform_name}</Button>
                            {list_theme.map((list, id)=>
                                <Button key={id} className={list.lang===platform_lang? "buttonGroupPlatform bolder":"buttonGroupPlatform" } name={list.lang} onClick={handleClickTheme}>{list.lang}</Button>
                            )}
                        </ButtonGroup>
                    </ButtonToolbar>   
                </div>
                </li>

                <li id="lilang" className="dropdown hidden-sm hidden-lg">

                    <div className="lang-menu lang-desktop" style={{color:"black"}}>
                        <ButtonToolbar >
                            <ButtonGroup>
                                <Button className="buttonGroupPlatform bolder" onClick={handleLogout.bind(this)}>Logout</Button>
                            </ButtonGroup>
                        </ButtonToolbar>   
                    </div>
                </li>
            </ul>

            {showFilter ?
                <form className="navbar-form navbar-right hidden-sm"  action="<?php echo site_url($filter_controller)?>" method="post">
                    <div className="form-group">
                        <i className="icon ion-android-search"></i>
                        <input type="text" className="form-control" id="txtFilter" name="txtFilter" placeholder="search user account"/>
                    </div>
                </form>
            : null }

            {showPlatform? <PopupPlatform canClose={showClosebutton} showPlatform={showPlatform} chgState={handleClick} {...props}/>:null}
          </div>
        </div>
      </nav>
    </header>

    )
}

export default NavMenu;