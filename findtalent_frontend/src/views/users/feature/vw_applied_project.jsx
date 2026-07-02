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
            itemsDetailProject:{
                id: "",
                title: "",
                user_function: "",
                location: "",
                duration_length: "",
                duration_period_type: "",
                project_manager: "",
                start_date: "",
                registation_closed_by: "",
                avg_time_needed: "",
                description: "",
                flag_publish_by_employee: "",
                status_active: ""
            },
            limit:10,
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
        this._isMounted = true;
        this.getData() && this.getTotalPage();
    }
    

    getData = async () => {
        const credentials = {
            limit: this.state.limit,
            offset:this.state.offset,
            category:this.state.category,
            status_active:'1',
            platform_id: this.state.platform_id,
            status_project: 'Applied',
            imdl_id: LoginData.Security_UserId(),
        };
        let isi = await AuthHelpers.postData('findTalentProject/ListDataForUserByStatusProject',credentials);
        this._isMounted && this.setState({items:!isi.data.data ? [] : isi.data.data});
    }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset:this.state.offset,
            status_project: 'Applied',
            status_active:'1',
            category:"COUNT",
            platform_id: this.state.platform_id,
            imdl_id: LoginData.Security_UserId(),
        }
        let isi = await AuthHelpers.postData('findTalentProject/ListDataForUserByStatusProject',credentials);
        this._isMounted && this.setState({totalData:!isi.data.data ? 0 : isi.data.data});
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


            assets,
            items,
            offset,limit, activePage, filterData
        } =  this.state;
        return(
           
            <div class="col-md-9">
                <div class="panel panel-default" style={{ marginTop: "20px"}}>
                    <div class="panel-heading">
                        <h4>{LoginData.Security_getTheme().text_applied_projects}</h4>
                    </div>


                    <div class="panel-body panel-table">


                        <div class="table-responsive">
                    

                        <div class="grid-view">

                            <table class="table table-hover">
                                <thead>
                                <th>
                                    Title
                                </th>
                                <th>
                                    Start Date
                                </th>
                                <th>
                                    Registration <br/>Closed Date
                                </th>
                                <th>
                                    Status
                                </th>
                                <th >
                                    
                                </th>
                                </thead>
                                <tbody>
                                    {
                                        items.length == 0 ?
                                            <tr>
                                                <td colspan='6' align='center'>
                                                    No Data
                                                </td>
                                            </tr>
                                        :
                                            ''
                                    }
                                    {items.map(
                                        (item, id) =>
                                        <tr key={item.id}>
                                            <td>
                                                {item.title}
                                                <br/>
                                                {item.user_function}
                                                <br/>
                                                {item.location}
                                            </td>
                                            <td>
                                                {item.start_date}
                                            </td>
                                            <td>
                                                {item.registation_closed_by}
                                            </td>
                                            <td>
                                                {item.status_project}
                                            </td>
                                            <td>
                                                <a style={{cursor:'pointer'}}  onClick={() => this.toUrl(item.project_id)} class="btn btnSubmit">Details</a>
                                            </td>
                                            
                                        </tr>
                                    )}   

                                </tbody>
                            </table>

                    

                        </div>    
                        </div>
                    </div>
                </div>
            </div>
		
        );
    }
}