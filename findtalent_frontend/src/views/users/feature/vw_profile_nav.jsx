import { Component } from 'react';
import AuthHelpers from '../../../helpers/AuthHelpers';
import TextSlider from './vw_text_slider';
import {isMobile} from 'react-device-detect';
import SSO from '../../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

export default class vw_home extends Component{

    constructor(props){
        super(props)
        this.state = {
            itemApplied:[],
            itemSaved:[],
            limit:"",
            offset:"",
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            activePage: 1,
            pageRangeDisplayed:10,
            totalData:0,
            loadData:true,
            assets: env.assets,
            file_path: env.userDocument,
            show: 'block',
            show2: 'none',
            image_available:LoginData.Security_getTheme().image_menu_available,
            image_hover:LoginData.Security_getTheme().image_menu_hover,
            lang:LoginData.Security_getTheme().default_flag,
            text_save_projects: LoginData.Security_getTheme().text_save_projects,
            text_applied_projects: LoginData.Security_getTheme().text_applied_projects,
            
            photos:LoginData.Security_UserProfilePicture(),



        };
        this._isMounted = false;
        this.addDefaultSrcImg = this.addDefaultSrcImg.bind(this);
        this.addDefaultSrcImgAvailable= this.addDefaultSrcImgAvailable.bind(this);
        this.addDefaultSrcImgSelected=this.addDefaultSrcImgSelected.bind(this)
    }

    componentDidMount(){
        
        this._isMounted = true;
        this.getCountDataSaved() && this.getCountDataApplied();

        console.log("mobile == "+isMobile);
    }

    getCountDataSaved= async(e) =>{
        const credentials = {
            platform_id : this.state.platform_id,
            imdl_id     : LoginData.Security_UserId(),
            status_active       :1,
            status_project      :'Saved as Draft',
            category:"COUNT",
        };
        
        let response = await AuthHelpers.postData('findTalentProject/ListDataForUserByStatusProject',credentials);
        
        if(response.status = 200){
            this.setState({itemSaved:response.data.data});                
        }else{
            alert(response);
        }
            
    }

    getCountDataApplied= async(e) =>{
        const credentials = {
            platform_id : this.state.platform_id,
            imdl_id     : LoginData.Security_UserId(),
            status_active       :1,
            status_project      :'Applied',
            category:"COUNT",
        };
        
        let response = await AuthHelpers.postData('findTalentProject/ListDataForUserByStatusProject',credentials);
        
        if(response.status = 200){
            this.setState({itemApplied:response.data.data});                
        }else{
            alert(response);
        }
            
    }

    addDefaultSrcImg(ev){
        ev.target.src =  "https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=Image+Error"
    }

    addDefaultSrcImgAvailable(ev){
        ev.target.src =  this.state.assets+"assets/img/btn-available.png"
    }

    addDefaultSrcImgSelected(ev){
        ev.target.src =  this.state.assets+"assets/img/btn-selected.png"
    }

    changeShow(param){
        if(param == 'show'){
            this.setState({
                show : 'none',
                show2 : 'block'
            })
        }else{
            this.setState({
                show : 'block',
                show2 : 'none'
            })
        }
    }

    addDefaultSrc(ev){
        ev.target.src =  this.state.assets_url+"assets/images/default.jpg";
    }

    render(){
        const {items, assets, file_path, show, show2, image_available, image_hover, lang, validation_not_allowed_to_rate, email_contact_further_via_email,assets_url,
            photos,
            text_save_projects,
            text_applied_projects,
        } = this.state;
        return(
            
            <div class="col-md-3 static hidden-xs">

                <div class="profile-card"  style={{ marginTop: "35px"}} id="user-profile-bar">
                    <div class="row">
                        {isMobile ? 
                                <div class="col-md-4" style={{marginBottom:"-30px"}}>
                                    <img src={photos===null ? assets_url+"images/icon-avatar-big.png": photos} alt="user" className="profile-photo" id="profile-picture" onError={this.addDefaultSrc} />
                                    
                                </div>
                            : 
                                <div class="col-md-4" >
                                    <img src={photos===null ? assets_url+"images/icon-avatar-big.png": photos} alt="user" className="profile-photo" id="profile-picture" onError={this.addDefaultSrc} />
                                    
                                </div>
                        }
                        
                        
                        <div class="col-md-8">
                            
                            <span style={{fontSize: "13px", marginTop: "10px", fontWeight:"bold" }}>
                                { LoginData.Security_UserName() } ({ LoginData.Security_UserAccount() })
                            </span>
                            <br/>

                            <span style={{fontSize: "14px",marginTop: "13px",display: "block",lineHeight: "15px",display: "table"}}>
                                {LoginData.Security_UserTitle() == '' ? '-' : LoginData.Security_UserTitle()}
                            </span>
                            <span style={{display: "block",marginTop: "8px",lineHeight: "15px",fontSize:"11px",display: "table"}}>
                                {LoginData.Security_UserBusinessUnit_2() === 'PMI HMS General Management' ? LoginData.Security_UserDirectorate_3() : LoginData.Security_UserBusinessUnit_2() }
                            </span>

                        </div>
                         
                    </div>
                </div>
                
                <div class="panel leaderboard panel-default" id="mostactiveusers-panel">
                

                    <div class="panel-body">
                        <ul class="edit-menu">
                            <li><a href={AllRoute.savedProject}><i class="icon ion-ios-information-outline"></i><strong>{text_save_projects} </strong>({this.state.itemSaved})</a></li>
                            <li><a href={AllRoute.appliedProject}><i class="icon ion-ios-information-outline"></i><strong>{text_applied_projects} </strong>({this.state.itemApplied})</a></li>
                        </ul>
                    </div>


                </div> 
            </div>     
  
        );
    }
}