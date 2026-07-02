import { Component } from 'react';
import AuthHelpers from '../../../helpers/AuthHelpers';
import TextSlider from './vw_text_slider';
import SSO from '../../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

export default class vw_home extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit:50,
            offset:0,
            activePage: 1,
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            user_function:LoginData.Security_UserDirectorate_3(),
            imdl_id:LoginData.Security_UserId(),
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
            email_contact_further_via_email:LoginData.Security_getTheme().email_contact_further_via_email,
            validation_not_allowed_to_rate:LoginData.Security_getTheme().validation_not_allowed_to_rate,

            
            text_home_page: LoginData.Security_getTheme().text_home_page,
        };
        this._isMounted = false;
        this.addDefaultSrcImg = this.addDefaultSrcImg.bind(this);
        this.addDefaultSrcImgAvailable= this.addDefaultSrcImgAvailable.bind(this);
        this.addDefaultSrcImgSelected=this.addDefaultSrcImgSelected.bind(this)
    }

    componentDidMount(){
        this.getData();
    }
    
    getData = async () => {
        
        const credentials = {
             limit: this.state.limit,
             offset:this.state.offset,
             category:this.state.category,
             platform_id: this.state.platform_id,
             imdl_id: this.state.imdl_id,
             user_function: this.state.user_function,
             items:this.state.items,
             status_active: 1,
         };
 
         let isi = await AuthHelpers.postData('findTalentProject/ListDataForHome',credentials);
         this.setState({items:!isi.data.data ? [] : isi.data.data});

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
    
    toUrl(id) {
        localStorage.setItem("projectDetailId", id);
        window.location.href = AllRoute.detailProject;       
    }


    render(){
        const   {   
            text_home_page,
            items
        } =  this.state;

        if(items.length < 1){
            return(
                <div class="col-md-9">
                    <div class="friend-list business-challenge"> 
                        <div class="row">
                            <div class="col-md-12" style={{marginBottom:'15px',fontSize:'15px'}}>
                                <div style={{color:'#282828',fontWeight:'700'}} dangerouslySetInnerHTML={{__html: text_home_page}}>
                                </div>                            
                            </div>
                            <div class="col-md-12" style={{marginBottom:'15px',fontSize:'15px',color:'#282828',fontWeight:'700'}}>
                                No Project List
                                                      
                            </div>
                        </div>
                    </div>
                    
                </div>
            );
        }
        return(
            <div class="col-md-9">
		
                <div class="friend-list business-challenge"> 
                    <div class="row">
                        <div class="col-md-12" style={{marginBottom:'15px',fontSize:'15px'}}>
                            <div style={{color:'#282828',fontWeight:'700'}} dangerouslySetInnerHTML={{__html: text_home_page}}></div>                            
                        </div>
                        {items.map(
                            (item, id) =>
                            <div class="col-md-3 col-sm-3" key={item.id} style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)}>
                                <div class="business-card">
                                    <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)}>
                                    </a>
                                    
                                    <div class="card-info">
                                        <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)}>
                                        </a>
                                        <div class="friend-info" style={{marginBottom:'-15px'}}>
                                            <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)}>
                                            </a>
                                            
                                            <h4 class="profile-title">
                                                <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)}></a>
                                                <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)} class="profile-link">{item.title}</a>
                                            </h4>  
                                            <h4 class="profile-department">
                                                <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)}>{item.user_function}</a>
                                            </h4>  
                                            <h4 class="profile-location">
                                                <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.id)}>{item.location}</a>
                                            </h4>   
                                            <hr class="profile-hr"/>
                                            <p class="profile-description">
                                                <i class="fa fa-clock-o" aria-hidden="true"></i>&nbsp;{LoginData.Security_getTheme().text_registration_closed_by} <br/>{item.registation_closed_by}
                                            </p>
                                        </div>
                                    </div>

                            </div>
                        </div>

                    )}   
                    </div>
                </div> 
            </div>
		
        );
    }
}