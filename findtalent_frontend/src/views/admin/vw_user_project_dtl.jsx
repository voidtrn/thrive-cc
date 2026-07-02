import React, { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AdminNavbar from '../vw_menu';
import Sidebar_menu from './vw_sidebar';
import AuthHelpers from '../../helpers/AuthHelpers';
import Select from 'react-select';
import AsyncSelect from 'react-select/async'
import makeAnimated from 'react-select/animated';
import {Tabs, Tab, Modal, Button} from 'react-bootstrap';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

const animatedComponents = makeAnimated();

class vw_platform_master_dtl extends Component{
    constructor(props){
        super(props)
        this.state = {
            items:
                {
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

                    full_name: "",
                    date_applied: "",
                    project_user_id: "",
                    
                    status_active: "",

                    functionPublish: ""
                }
            ,
            platform_id:LoginData.Security_getPlatformId(),
            loadData:true,
            file: null,
            user_id:null,
            isLoadingCountry: true,
            isLoadingFunction: true,
            isLoadingUser: true,
            optionCountry : [],
            listFunctionByUsersTable:[],
            optionFunction: [],
            optionSelectedFunction:[],
            optionUser: [],
            optionSelectedUsers:[],
            optionUserSuper: [],
            optionEmployee: [],
            optionSelectedEmployee: [],
            isDisabled: true,
            selectedFunction:[],
            selectedAdmin:[],
            //this state must include in every component
            editData:false,
            deleteData:false,
            file_path: env.userDocument,
            user_account:null,
            cancelDelete:false,

            
            showSelectUser:false,
            showSelectFunction:false
            //end here
        };
        this._isMounted = false;
        this.optionNull = this.optionNull.bind(this);
        this.fnOptionCountry = this.fnOptionCountry.bind(this);
        this.fnOptionFunction = this.fnOptionFunction.bind(this);
        this.fnOptionAdmin = this.fnOptionAdmin.bind(this);
        this.fnOptionSuperAdmin = this.fnOptionSuperAdmin.bind(this);
        this.fnOptionEmployee = this.fnOptionEmployee.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputChangePublish = this.handleInputChangePublish.bind(this);
        this.fileInput = React.createRef();
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectAdmin();
            }
        });
    }
    
    componentDidMount(){
        this.getUserId();
        this._isMounted = true;
        this.getDetail();
    
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    optionNull(e){
       var optionFunction = document.getElementsByName('optionFunction');
       var optionCountry = document.getElementsByName('optionCountry');
       if(optionFunction[0].defaultValue=="" && optionCountry[0].defaultValue==""){
            // this.setState({isDisabled:true})
       }else{
            // this.setState({isDisabled:true},()=>{
                this.getAllEmpl();
            // })
       }
    }

    fnOptionCountry(e){
        this.setState({optionSelectedCountry: e});
    }

    fnOptionFunction(e){
        this.setState({optionSelectedFunction:e});
    }

    fnOptionAdmin(e){
        this.setState({optionSelectedUsers:e});
    }

    fnOptionSuperAdmin(e){
        this.setState({optionSelectedUsersSuper:e});
    }

    fnOptionEmployee(e){
        this.setState({optionSelectedEmployee:e});
    }

    getUserId(){
        var dataUser = AuthHelpers.getUserInfo();
        this.setState({user_id:dataUser.id, user_account:dataUser.account});
    }

    submit= async (e) =>{
        e.preventDefault();

            const param = {
                status_project: this.state.items.status_project,
                user_created : this.state.user_id,
                project_user_id : this.state.items.project_user_id,
                
            }
            const fd = new FormData();

            fd.append("status_project", param.status_project);
            fd.append("themeId",  LoginData.Security_getTheme().id);
            fd.append("id",param.project_user_id);
            fd.append("user_id",param.user_created);
            
            let responseJson = await AuthHelpers.postData("findTalentProject/UpdateStatusProject", fd);
            if(responseJson.status == 200){
                alert("DATA HAS BEEN UPDATED");
                window.location.href = AllRoute.adminUserProject;
            }else{
                alert(responseJson);
            }
            
    }
    getDetail= async(e) =>{
        const {data} = this.props.location;
        if(data!== undefined){
            this.setState({editData:true})
            let response = await AuthHelpers.postData('findTalentReport/SelectData',data);
            
            if(response.status = 200){
                this.setState({items:response.data.data});
                
            }else{
                alert(response);
            }
        }
    }
    DeleteConfirm=  async (param)=>{
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure to delete this data?")) 
        { 
          this.setState({deleteData:true,cancelDelete:false})
        } 
        else
        {
          this.setState({cancelDelete:true})
        } 
    }


    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, this.state);
        stateCopy.items[key] = value;
        this.setState(stateCopy);
    }
    handleInputChangePublish(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, this.state);
        stateCopy.items[key] = value;
        this.setState(stateCopy);

        if(target.value == '3'){
            this.setState({showSelectUser:true});
            this.setState({showSelectFunction:false});
        }
        else if(target.value == '2'){
            this.setState({showSelectUser:false});
            this.setState({showSelectFunction:true});
        }
        else{
            this.setState({showSelectUser:false});
            this.setState({showSelectFunction:false});
        }
        
    }
    loadOptions = (inputValue, callback) => {
        // perform a request
        const requestResults = this.state.optionEmployee.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue)
            ).slice(0,20)
        //const requestResults = this.state.optionEmployee.slice(0,10);
        //console.log(this.state.optionEmployee)
        callback(requestResults)
    }
    render(){

        const {isLoadingCountry, isLoadingFunction, isLoadingUser, optionCountry, optionFunction, optionUser, isDisabled, items, editData, file, optionSelectedCountry, optionSelectedFunction, optionSelectedUsers, optionEmployee, optionSelectedEmployee, optionUserSuper, optionSelectedUsersSuper} = this.state;

        return(
            <>
                        <style>{
                            `.control-label{
                                top: unset;
                            }
                            .form-control-file{
                                margin-bottom: 1%;
                            }
                            `
                            }
                        </style>
                        <div className="col-md-9">
                            <div className="panel panel-default">
                                <div className="panel-heading">
                                    <strong>User Project (Submitted List) </strong> administration 
                                </div>
                                <div className="clearfix">
                                    <div className="panel-body">
                                        <a className="fa-pull-right btn btn-default" href={AllRoute.adminProject} label="Back to overview" data-ui-loader="">
                                            <i className="fa fa-arrow-left aria-hidden="></i> Back to overview</a>        
                                            <h4 className="pull-left"></h4>
                                    </div>
                                </div>
                                <div className="panel-body">
                                    <Tabs
                                        id="controlled-tab-example"
                                        activeKey='edit'
                                        >
                                        <Tab eventKey="edit" 
                                            title={editData ? 'Edit : '+items.title : 'New Data' }  >
                                        </Tab>
                                    </Tabs> 
                                    <form id="czfrom" onSubmit={this.submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                        <div className="tab-content">
                                            <div className="tab-pane active" data-tab-index="0" id="tab-0">


                                                <div className="form-group field-usereditform-title required">
                                                    <label className="control-label">&nbsp; Applicant's Name </label>
                                                    <input type="text" id="title" style={{width:"75%"}} className="form-control" readOnly value={items.full_name}  maxlength="200"  required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-title required">
                                                    <label className="control-label">&nbsp; Applied On</label>
                                                    <input type="text" id="title" style={{width:"25%"}} className="form-control" readOnly value={items.date_applied}  maxlength="200"  required/>

                                                    <div className="help-block"></div>
                                                </div>


                                                <div className="form-group field-usereditform-title required">
                                                    <label className="control-label">&nbsp;Title <span style={{color:"#ff0404"}}>(* max : 200 characters)</span></label>
                                                    <input type="text" id="title" style={{width:"75%"}} className="form-control" readOnly value={items.title}  maxlength="200"  required/>

                                                    <div className="help-block"></div>
                                                </div>
                                               

                                                <div className="form-group field-usereditform-location required">
                                                    <label className="control-label">&nbsp;Project Location <span style={{color:"#ff0404"}}>(* max : 200 characters)</span></label>
                                                    <input type="text"  maxlength="200"  id="location" style={{width:"75%"}} className="form-control" radonly value={items.location} readOnly required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-profile-country">
                                                    <label className="control-label">&nbsp;Project Duration <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <br/>
                                                    <input type="number" id="duration_length"  maxlength="2"  style={{ width:"100px",display:"inline-block" }}class="form-control" aria-required="true" required aria-invalid="false"  value={items.duration_length} readOnly/>

                                                    <select id="duration_period_type" style={{ width:"20%",display:"inline-block" }} class="form-control" readonly value={items.duration_period_type} readOnly required aria-invalid="false">
                                                        <option value="">... Select this ...</option>
                                                        <option value="week">week</option>
                                                        <option value="month">month</option>
                                                        <option value="year">year</option>
                                                    </select>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-project_manager required">
                                                    <label className="control-label">&nbsp;Project Manager <span style={{color:"#ff0404"}}>(* max : 100 characters)</span></label>
                                                    <input type="text" id="project_manager" style={{width:"75%"}} className="form-control" name="project_manager" value={items.project_manager} readOnly maxlength="200"  required/>

                                                    <div className="help-block"></div>
                                                </div>
                                               
                                                <div className="form-group field-usereditform-start_date required">
                                                    <label className="control-label">&nbsp;Project Start Date <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="date" id="start_date" style={{width:"25%"}} className="form-control" name="start_date" value={items.start_date} readOnly required/>

                                                    <div className="help-block"></div>
                                                </div>
                                                <div className="form-group field-usereditform-registation_closed_by required">
                                                    <label className="control-label">&nbsp;Registration Closed By <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="date" id="registation_closed_by" style={{width:"25%"}} className="form-control" name="registation_closed_by" value={items.registation_closed_by} readOnly required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-avg_time_needed required">
                                                    <label className="control-label">&nbsp;Avg. Time Needed <span style={{color:"#ff0404"}}>(* max : 100 characters)</span></label>
                                                    <input type="text" id="avg_time_needed" style={{width:"75%"}} className="form-control" name="avg_time_needed" maxlength="100" value={items.avg_time_needed} readOnly required/>

                                                    <div className="help-block"></div>
                                                </div>
                                                <div className="form-group field-usereditform-description required">
                                                    <label className="control-label">&nbsp;Project Description <span style={{color:"#ff0404"}}>(* max : 5000 characters)</span></label>
                                                    <textarea id="description" style={{width:"100%"}} className="form-control" name="description" value={items.description} maxlength="5000" readOnly required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-profile-country">
                                                    <label className="control-label">&nbsp;Status Project</label>
                                                    <select id="profile-country" style={{width:"150px"}} className="form-control" name="status_project"  value={items.status_project} onChange={this.handleInputChange} required>
                                                        <option value="">On Hold</option>
                                                        <option value="Accepted">Accepted</option>
                                                        <option value="Rejected" selected="">Rejected</option>
                                                    </select>

                                                    <div className="help-block"></div>
                                                </div>

                                            </div>

                                        </div>
                                        <input type="hidden" name="hdnkey" value={items.id}/>    
                                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                                            
                                    </form>
                                </div>
                            </div>
                        </div>

            </>
        );
    }
}
    
    export default withRouter(vw_platform_master_dtl);