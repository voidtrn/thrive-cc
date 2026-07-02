import { Component } from 'react';
import AuthHelpers from '../../../helpers/AuthHelpers';
import{ Button , Modal, Image } from 'react-bootstrap';
import TextSlider from './vw_text_slider';
import SSO from '../../../helpers/SSO';
import md5 from 'md5';

var {LoginData, AllRoute, env} = SSO;
export default class vw_home extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[], 
            items2:{},
            itemsQuestionnaire:[], 
            itemsQuestionnaireForId:[], 
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
                status_project: "",
                status_active: ""
            },
            modalShow:false,
            saveMessageModalShow:false,
            applyMessageModalShow:false,
            applyLimitMessageModalShow:false,
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

            
            text_applying_to: LoginData.Security_getTheme().text_applying_to,
            text_about_yourself: LoginData.Security_getTheme().text_about_yourself,
            text_motivation: LoginData.Security_getTheme().text_motivation,
            text_info_head: LoginData.Security_getTheme().text_info_head,
        };
        this.handleChangeText = this.handleChangeText.bind(this);
        this._isMounted = false;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.addDefaultSrcImg = this.addDefaultSrcImg.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleCloseSaveProject = this.handleCloseSaveProject.bind(this);
        this.handleCloseApplyProject = this.handleCloseApplyProject.bind(this);
        this.addDefaultSrcImgAvailable= this.addDefaultSrcImgAvailable.bind(this);
        this.addDefaultSrcImgSelected=this.addDefaultSrcImgSelected.bind(this)
    }

   
    async  componentDidMount(){

        

        this._isMounted = true;
        this._isMounted 
            &&  this.getDetailProject() 
            &&  this.getListQuestionnaireForId() 
            && this.getListQuestionnaire();
    }
    
    getListQuestionnaire = async () => {        
        const credentials = {
            limit: this.state.limit,
            offset:this.state.offset,
            category:this.state.category,
            status_active:'1',
            projectIdForAdmin: localStorage.getItem("projectDetailId")
        };

        let isi        =   await AuthHelpers.postData('findTalentQuestionnaire/ListData',credentials);
        this._isMounted && this.setState({itemsQuestionnaire:!isi.data.data ? [] : isi.data.data});
    }
    getListQuestionnaireForId = async () => {
        let responseJson = await AuthHelpers.postData('findTalentQuestionnaire/ListDataForId',{projectIdForAdmin:localStorage.getItem("projectDetailId"), status_active :'1'});
        if (responseJson.status != 200){
            alert(responseJson);
            return;
        }

        this.setState({
            itemsQuestionnaireForId: responseJson.data.data
        }); 
    }


    renderAllFields(){
        
        if(this.state.Loading){
            return null;
        }

        var renderAllFields                 = [];
        const {itemsQuestionnaire,items2}   = this.state;

        for(var i = 0; i < itemsQuestionnaire.length; i++){

            var question                = itemsQuestionnaire[i].question;
            var id                      = itemsQuestionnaire[i].id;
            var question_type           = itemsQuestionnaire[i].question_type;
            var question_type_plus_id   = itemsQuestionnaire[i].question_type_plus_id;
            var radio_option_1   = itemsQuestionnaire[i].radio_option_1;
            var radio_option_2   = itemsQuestionnaire[i].radio_option_2;

            var defaultValue = items2[question_type_plus_id];
           

            if(question_type == 'freetext'){
                renderAllFields.push(
                    <div className="form-group field-useredit form-email required">
                        <label className="control-label" style={{color:'#000'}}>&nbsp; {question} 
                        
                            <span style={{color:"#ff0404"}}> (*)</span>
                        </label>
    
                        <textarea id={question_type_plus_id} style={{width:"100%"}} className="form-control" defaultValue={defaultValue} name={question_type_plus_id} onChange={this.handleChangeText}  required/>
                        <div className="help-block"></div>
    
                    </div>
                )
            }
            else{
                renderAllFields.push(
                    
                    <div className="form-group field-useredit form-email required">
                        
                        <label className="control-label" style={{color:'#000'}}>&nbsp; {question}                         
                            <span style={{color:"#ff0404"}}> (*)</span>
                        </label>
                        <br/>
                        <input for={question_type_plus_id+'_'+radio_option_1} type="radio" id={question_type_plus_id+'_'+radio_option_1} name={question_type_plus_id} value={radio_option_1} onChange={this.handleChangeText} required/>
                        <label for={question_type_plus_id+'_'+radio_option_1} style={{color:'#000'}}>
                            &nbsp;{radio_option_1}
                        </label>
                        <br/>
                        <input for={question_type_plus_id+'_'+radio_option_2} type="radio" id={question_type_plus_id+'_'+radio_option_2} name={question_type_plus_id} value={radio_option_2} onChange={this.handleChangeText} required/>
                        <label for={question_type_plus_id+'_'+radio_option_2} style={{color:'#000'}}>
                            &nbsp;{radio_option_2}
                        </label>
    
                    </div>
                )
            }
            

            itemsQuestionnaire[i].Default = items2[question_type_plus_id];
        
        }
        return renderAllFields;
    }
    handleChangeText(event){
        const {itemsQuestionnaireForId} = this.state;

        var tampung = itemsQuestionnaireForId;
        
        var idx = tampung.findIndex(v => v.question_type_plus_id == event.target.name);
        tampung[idx].Default = event.target.value;
        this.setState({itemsQuestionnaireForId: tampung});
        console.log(tampung);
    }
    submit= async (event) =>{
        event.preventDefault();
        const {itemsQuestionnaireForId} = this.state;        
        const fd = new FormData();
        for(var i = 0; i < itemsQuestionnaireForId.length; i++){
            var Field   = itemsQuestionnaireForId[i].question_type_plus_id;           
            var val     = itemsQuestionnaireForId[i].Default;                   
            fd.append(Field, val);            
        }
        fd.append('projectIdForAdmin', localStorage.getItem("projectDetailId"));   
        fd.append('imdl_id_applied', LoginData.Security_UserId());    
        fd.append('limit', this.state.limit);   
        fd.append('offset', this.state.offset);   
        fd.append('category', this.state.category);   

        let responseJson = await AuthHelpers.postData("findTalentProject/SubmitApplied", fd);
        if(responseJson.status == 200){
            if(responseJson.data.message == 'projectlimit'){
                this.setState({modalShow:false})            
                this.setState({applyMessageModalShow:false})
                this.setState({applyLimitMessageModalShow:true})
            }else{                
                this.setState({modalShow:false})            
                this.setState({applyMessageModalShow:true})
                this.setState({applyLimitMessageModalShow:false})
            }   

        }else{
            alert(responseJson.message);
        }       
                    
    }
    handleCloseApplyProject(){
        this.setState({applyMessageModalShow:false})
        this.setState({applyLimitMessageModalShow:false})
        window.location.href = AllRoute.detailProject;
    }


    saveAsDraft = async (event) =>{
             
        const fd = new FormData();
        fd.append('projectIdForAdmin', localStorage.getItem("projectDetailId"));   
        fd.append('imdl_id_applied', LoginData.Security_UserId());    

        let responseJson = await AuthHelpers.postData("findTalentProject/saveAsDraft", fd);
        if(responseJson.status == 200){
            this.setState({saveMessageModalShow:true})
        }else{
            alert(responseJson);
        }       
                    
    }
    handleCloseSaveProject(){
        this.setState({saveMessageModalShow:false})
        window.location.href = AllRoute.detailProject;
    }

    getDetailProject= async(e) =>{
        const credentials ={
            platform_id         :   this.state.platform_id,
            md5ID               :   md5(localStorage.getItem("projectDetailId")) ,
            imdl_id_applied     :   LoginData.Security_UserId()  
        }
        let response = await AuthHelpers.postData('findTalentProject/SelectData',credentials);            
        if(response.status = 200){
            this.setState({itemsDetailProject:response.data.data});
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

    handleShow(){
        this.setState({modalShow:true})
    }

    handleClose(){
        this.setState({modalShow:false})
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, this.state);
        stateCopy.items[key] = value;
        this.setState(stateCopy);
    }

    
    render(){
        const   {   
            text_home_page,
            itemsQuestionnaire,
            text_applying_to,
            text_about_yourself,
            text_motivation,
            text_info_head,
            saveMessageModalShow,
            applyMessageModalShow,
            applyLimitMessageModalShow,
            modalShow,
            assets,
            items,
            offset,limit, activePage, filterData
        } =  this.state;
        return(
           

            

            <div class="col-md-9" style={{ marginTop: "25px",fontSize:"13px"}}>
            <div class="panel panel-default">
                <div class="panel-heading">
                    <div class="row">
                        <div class="col-md-7">
                            <h5>
                                <a href="#" class="profile-link" style={{ fontSize:"15px"}}>
                                    {this.state.itemsDetailProject.title}
                                </a>
                            </h5>  
                            <h5 class="profile-department" style={{ fontSize:"14px"}}>
                                <a href="#">
                                    {this.state.itemsDetailProject.user_function}
                                </a>
                            </h5>  
                            <h5 class="profile-location" style={{ fontSize:"13px"}}>
                                <a href="#">
                                    {this.state.itemsDetailProject.location}
                                </a>    
                            </h5> 
                            
                        </div>
                        <div class="col-md-5">
                            <div class="pull-right btn-action-detail">
                                {
                                    this.state.itemsDetailProject.status_project == '' || this.state.itemsDetailProject.status_project == null ? 
                                        <span style={{ marginRight: "5px"}} class="saved-as-draft" id="btnSaveAsDraft" name="btnSaveAsDraft" value="Saved as Draft" onClick={this.saveAsDraft}>
                                            {LoginData.Security_getTheme().text_button_save_project}
                                        </span>
                                    :
                                        this.state.itemsDetailProject.status_project == 'Saved as Draft' ? 
                                            <span style={{ marginRight: "5px"}} class="saved-as-draft" id="btnSaveAsDraft" name="btnSaveAsDraft" value="Saved as Draft" >
                                                Has been Saved
                                            </span>
                                        :
                                            ''
                                            
                                            
                                    
                                }

                                {
                                    
                                    this.state.itemsDetailProject.status_project == '' || this.state.itemsDetailProject.status_project == null || this.state.itemsDetailProject.status_project == 'Saved as Draft' ? 
                                        <button  class="btn btnSubmit" onClick={this.handleShow}>
                                            {LoginData.Security_getTheme().text_button_applied_project}
                                        </button>
                                    :
                                        <button  class="btn btnSubmit" >
                                            Has been Applied with 
                                            Status : {this.state.itemsDetailProject.status_project}
                                        </button>     
                                }
                            </div>
                        </div>
                    
                    </div>
                </div>
                    
    
                <div class="panel-heading" >
                    <div class="row">
                            <div class="col-md-9" style={{ fontSize:"13px"}}>
                                <div dangerouslySetInnerHTML={ {__html:this.state.itemsDetailProject.description} } />
                            </div>
                            <div class="col-md-3">
                                <div class="post-container">
                                  <span class="profile-photo-md pull-left">
                                  <i class="fa fa-user fa-2x" aria-hidden="true"></i></span>
                                  <div class="post-detail">
                                    <h5>{LoginData.Security_getTheme().text_project_manager} </h5>
                                      <span>
                                      <span>{this.state.itemsDetailProject.project_manager}</span>
                                      </span>
                                  </div>
                                </div>
                                <div class="post-container">
                                  <span class="profile-photo-md pull-left">
                                  <i class="fa fa-clock-o fa-2x" aria-hidden="true"></i></span>
                                  <div class="post-detail">
                                    <h5>{LoginData.Security_getTheme().text_project_duration} </h5>
                                      <span>
                                      <span>{this.state.itemsDetailProject.duration_length} {this.state.itemsDetailProject.duration_period_type}</span>

                                      </span>
                                  </div>
                                </div>
                                <div class="post-container">
                                  <span class="profile-photo-md pull-left">
                                  <i class="fa fa-calendar-o fa-2x" aria-hidden="true"></i></span>
                                  <div class="post-detail">
                                    <h5>{LoginData.Security_getTheme().text_project_start_date} </h5>
                                    <span>{this.state.itemsDetailProject.start_date}</span>
                                  </div>
                                </div>
                                <div class="post-container">
                                  <span class="profile-photo-md pull-left">
                                  <i class="fa fa-pie-chart fa-2x" aria-hidden="true"></i></span>
                                  <div class="post-detail">
                                    <h5>{LoginData.Security_getTheme().text_avg_time_needed} </h5>
                                      <span>{this.state.itemsDetailProject.avg_time_needed}</span>
                                  </div>
                                </div>
                                <div class="post-container">
                                  <span class="profile-photo-md pull-left">
                                  <i class="fa fa-times-circle fa-2x" aria-hidden="true"></i></span>
                                  <div class="post-detail">
                                    <h5>{LoginData.Security_getTheme().text_registration_closed_by} </h5>
                                      <span>{this.state.itemsDetailProject.registation_closed_by}</span>
                                  </div>
                                </div>
                                
                          </div>
                    </div>
                    <div  style={{ textAlign: "center", marginTop:'10px'}}>

                        {
                            this.state.itemsDetailProject.status_project == '' || this.state.itemsDetailProject.status_project == null ? 
                                <span style={{ marginRight: "5px"}} class="saved-as-draft" id="btnSaveAsDraft" name="btnSaveAsDraft" value="Saved as Draft" onClick={this.saveAsDraft}>
                                    {LoginData.Security_getTheme().text_button_save_project}
                                </span>
                            :
                                this.state.itemsDetailProject.status_project == 'Saved as Draft' ? 
                                    <span style={{ marginRight: "5px"}} class="saved-as-draft" id="btnSaveAsDraft" name="btnSaveAsDraft" value="Saved as Draft" >
                                        Has been Saved
                                    </span>
                                :
                                    ''
                                    
                                    
                            
                        }

                        {
                            this.state.itemsDetailProject.status_project == '' || this.state.itemsDetailProject.status_project == null || this.state.itemsDetailProject.status_project == 'Saved as Draft' ? 
                                <button  class="btn btnSubmit " onClick={this.handleShow}>
                                    {LoginData.Security_getTheme().text_button_applied_project}
                                </button>
                            :
                                <button  class="btn btnSubmit" >
                                    Has been Applied with 
                                    Status : {this.state.itemsDetailProject.status_project}
                                </button>     
                        }
                        
                        
                    </div>
                </div>
            </div>


                <Modal
                   
                    show={modalShow}
                    onHide={this.handleClose}
                    backdrop="true"

                    

                    keyboard={false}
                >
                    <Modal.Body >
                            <center  style={{color:'#000'}}>
                            {text_applying_to} {this.state.itemsDetailProject.title}
                            <br/>
                            {text_about_yourself}
                            </center>
                            <hr/>
                            <br/>
                            <form id="czfrom"  encType="multipart/form-data" acceptCharset="UTF-8" style={{display: "block"}} onSubmit={this.submit}   method="post" >

                                {this.renderAllFields()} 

                                <button type="submit" className="btn btnSubmit" name="btnSubmit" value="save"> {LoginData.Security_getTheme().text_button_submit_applied_project}</button>
                                
                            </form>
                            
                            
                    </Modal.Body>
                </Modal>

                <Modal
                   
                    show={saveMessageModalShow}
                    onHide={this.handleCloseSaveProject}
                    backdrop="false"
                    keyboard={false}
                >
                    <Modal.Header closeButton></Modal.Header>
                    <Modal.Body >
                        <center  style={{color:'#000'}}>
                            {LoginData.Security_getTheme().text_saved_project}
                            <br/>
                            <br/>
                            <span className="btn btnSubmit" onClick={this.handleCloseSaveProject} name="" value="save">Ok</span>
                        </center>
                    </Modal.Body>
                </Modal>

                <Modal
                   
                    show={applyMessageModalShow}
                    onHide={this.handleCloseApplyProject}
                    backdrop="false"
                    keyboard={false}
                >
                    <Modal.Header closeButton></Modal.Header>
                    <Modal.Body >
                        <center  style={{color:'#000'}}>
                            {LoginData.Security_getTheme().text_applied_project}
                            <br/>
                            <br/>
                            <span className="btn btnSubmit" onClick={this.handleCloseApplyProject} name="" value="save">Ok</span>
                        </center>         
                    </Modal.Body>
                </Modal>


                <Modal
                   
                    show={applyLimitMessageModalShow}
                    onHide={this.handleCloseApplyProject}
                    backdrop="false"
                    keyboard={false}
                >
                    <Modal.Header closeButton></Modal.Header>
                    <Modal.Body >
                        <center  style={{color:'#000'}}>
                            <h4>Your Project has reached its limit 
                            <br/>( max 3 Project ).
                            </h4>
                            <br/>
                            <br/>
                            <span className="btn btnSubmit" onClick={this.handleCloseApplyProject} name="" value="save">Ok</span>
                        </center>         
                    </Modal.Body>
                </Modal>

            </div>


		
        );
    }
}