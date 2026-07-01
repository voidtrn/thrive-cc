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
    <>
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
      <div className="container">
        <a className="navbar-brand" href="#"><img src={env.assets + "landingpage/assets/images/awb-logo.png"} /></a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
          Menu <i className="fas fa-bars ms-1"></i>
        </button>
        <div className="collapse navbar-collapse " id="navbarResponsive">
          <ul className="navbar-nav ms-auto py-4 py-lg-0 d-flex">
            <li className="nav-item justify-content-center m-auto">
              <a href={routeAll.routesUser.home.path} className="nav-link">
                <u>Home Page</u>
              </a>
            </li>

          </ul>
        </div>
      </div>
    </nav>
    </>

    )
}

export default NavMenu;