import React, { 
    useEffect,
    useState 
  } from 'react';
import routeAll from '../../../helpers/route';
import { securityData } from '../../../helpers/globalHelper';
// import navMenu from '../../../helpers/navMenu';
import{ Button , ButtonToolbar, ButtonGroup } from 'react-bootstrap';
import PopupPlatform from '../../../components/popupPlatform';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { env } from '../../../helpers/globalHelper';


function NavMenu(props){
    const [showFilter] = useState(false);
    const platform_name = securityData.Security_getPlatformName() || "null platform"
    // const platform_lang = securityData.Security_getTheme().lang || "null language"
    const [showPlatform, setShowPlatform] = useState(false)
    const [showClosebutton, setShowCloseButton] = useState(true)
    // const btnWizardPostColor = ""
    // const theme = securityData.Security_getTheme()
    // const [list_theme, setList_theme] = useState([])

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

    // const handleClickTheme = (val)=>{
    //     if(val.target.name !== ""){
    //         const param = {
    //             platform_id:securityData.Security_getPlatformId(),
    //             lang:val.target.name
    //         }
    //         axiosLibrary.changeThemeNull(param,window.location.origin)
    //     }
    // }

    // useEffect( async ()=>{
    //     if(securityData.Security_getPlatformId())
    //     {
    //         let responseJson = await axiosLibrary.postData('dialogueTheme/SelectDataByPlatform',{platform_id:securityData.Security_getPlatformId(),listTheme:1});
    //         if(responseJson.status===200){
    //             setList_theme(responseJson.data.data)
    //         }
    //     }
    // },[securityData.Security_getPlatformId()])
    
    // const renderNav = ()=>{
    //     return (
    //         navMenu.menu.filter(navBar => navBar.adminLevel <= props.adminLevel).map((nav, idx)=>{
    //                 return(
    //                     <li className={nav.showMobile? "dropdown" : "dropdown hidden-xs"} id="lihome" key={idx}>
    //                         {nav.dropdown ?
    //                                 <> 
    //                                 <a href={nav.href} className="dropdown-toggle pages" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><img src={nav.imageMenu} className="img-menu" alt={nav.txtName}/></a>
    //                                 <ul className="dropdown-menu newsfeed-home">
    //                                     {nav.dropdownMenu.filter(list => list.adminLevel <= props.adminLevel).map((dropdownList, idxDropdown)=>{
    //                                         if(dropdownList.dropdown){
    //                                             return(
    //                                                 null
    //                                             )
    //                                         }else{
    //                                             return(
    //                                                 <li key={idxDropdown}>
    //                                                     {dropdownList.txtName==='Logout'?
    //                                                     // eslint-disable-next-line
    //                                                     <a onClick={dropdownList.eventOnClick}>
    //                                                         {dropdownList.txtName}
    //                                                     </a>
    //                                                     :
    //                                                     <a 
    //                                                     href={dropdownList.href} 
    //                                                     onClick={dropdownList.eventOnClick}
    //                                                     >
    //                                                         {dropdownList.txtName}
    //                                                     </a>
    //                                                     }
                                                        
    //                                                 </li>
    //                                             )                                            
    //                                         }
    //                                     })}
    //                                 </ul>
    //                                 </>
    //                             :
    //                             <a href={nav.href} ><img src={nav.imageMenu} className="img-menu" alt={nav.txtName}/></a>     
    //                         }
    //                     </li>
    //                 )
    //         })
            
    //     )
    // }

    return(
    <header id="header">
        <style>{
            `.lang-menu{
              /* margin: 20px -70px 0 20px;
                display:block;
                position:relative;
                float:right;
                margin:-45px 70px 0 0;*/
              }
              .lang-menu a{
                color: #000;
                
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                font-size: 14px;
                line-height: 1.42857143;
              }
              .lang-menu a.active{
                font-weight: bold;
              }
            
              .lang-mobile{
                position: absolute;
                right: 80px;
                top: -7px;
                color: #000;
              }

              #lihome a{
                color:#6252bd;
              }

              .container {
                width: 1200px;
                }
            
              div#layout-content {
                  padding: 5px 0 0px;
                  background: #fff;
              }
              #platform-button{
                background-color: transparent;
                color: #5f6ec3 !important;
                border-color: #5f6ec3;
                border: 2px solid;
                font-weight: bold;
                /*border-radius: 20px;*/
              }
            `
            }
        </style>
      <nav className="navbar navbar-expand-lg navbar-fixed-top navbar-default menu">
        <div className="container">

          {/* <!-- Brand and toggle get grouped for better mobile display --> */}
          <div className="navbar-header">

          
            <button type="button" className="navbar-toggler collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" id="logo" href={routeAll.routesUser.home.path}><img src={env.assets+"img/logo.png"} alt="logo"/></a>
          </div>

          {/* <!-- Collect the nav links, forms, and other content for toggling --> */}
          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav ms-auto main-menu">
                {/* {renderNav()}  */}

                <li id="lilang">
                  <div className="lang-menu lang-desktop" style={{color:"black"}}>
                      <ButtonToolbar >
                          <ButtonGroup>
                            {platform_name && platform_name !== 'null platform'?
                              <Button id='platform-button' className="buttonGroupPlatform bolder" onClick={()=>handleClick(true)}>{platform_name}</Button>
                            :
                              <Button id='platform-button' className="buttonGroupPlatform bolder" ><i className='fa fa-circle-o-notch fa-spin'></i>&nbsp; Getting Platform</Button>
                            }
                              {/* {list_theme.map((list, id)=>
                                  <Button key={id} className={list.lang===platform_lang? "buttonGroupPlatform bolder":"buttonGroupPlatform" } name={list.lang} onClick={handleClickTheme}>{list.lang}</Button>
                              )} */}
                          </ButtonGroup>
                      </ButtonToolbar>   
                  </div>
                </li>

                <li className="dropdown" id="lihome" style={{paddingTop:"5px",cursor:'pointer'}}>
                <a onClick={handleLogout.bind(this)} tabIndex="0" role="button">
                  <i className="fa fa-arrow-left"></i> &nbsp;&nbsp; Logout
                </a>   
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