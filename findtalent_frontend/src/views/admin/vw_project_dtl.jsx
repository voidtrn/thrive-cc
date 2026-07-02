import React, { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AdminNavbar from '../vw_menu';
import Sidebar_menu from './vw_sidebar';
import AuthHelpers from '../../helpers/AuthHelpers';
import Select from 'react-select';
import AsyncSelect from 'react-select/async'
import makeAnimated from 'react-select/animated';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
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
                    // theme_id: "",
                    status_active: "",

                    functionPublish: ""
                }
            ,
            platform_id:LoginData.Security_getPlatformId(),
            loadData:true,
            txtBtnSUbmit:"Save",
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
            text: '',

            
            showSelectUser:false,
            showSelectFunction:false
            //end here
        };
        this._isMounted = false;
        this.optionNull = this.optionNull.bind(this);
        this.fnOptionCountry = this.fnOptionCountry.bind(this);
        this.fnOptionFunction = this.fnOptionFunction.bind(this);
        this.handleChange = this.handleChange.bind(this)
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
        this._isMounted  && this.getListFunctionByUsersTable() &&  this.getAllEmpl();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getListFunctionByUsersTable = async () => {
        
        const fd = new FormData();
        
        fd.append("platform_id", this.state.platform_id);
        let isi = await AuthHelpers.postData('findTalentProject/ListDataUserDirectorateByPlatform',fd);
        this._isMounted && this.setState({listFunctionByUsersTable:!isi.data.data ? [] : isi.data.data},()=>{
            //this.props.loadingData(false);
        });
    }

    getAllFunction= async (e) =>{
        const config = AuthHelpers.getAuthHeader();
        let responseJson = await AuthHelpers.getData("findTalentPlatform/GetAllFunction",config);
        if(responseJson.status == 200){
            var hasil = responseJson.data.data;
            var response = hasil.map(({directorate}) => {
                return {
                  value: directorate,
                  label: directorate
                }
              });
            this._isMounted && this.setState({optionFunction:response, isLoadingFunction:false});
        }else{
            alert(responseJson);
        }
    }

    getAllEmpl= async (e) =>{
        this.setState({isLoadingUser:true});
       
        const param = {
            country : LoginData.Security_UserCountry()
        }
        //delete update di admin platform
        let responseJson = await AuthHelpers.postData("findTalentPlatform/GetAllEmployeeByCountry",param);
        if(responseJson.status == 200){
            // var hasil = responseJson.data.data;
            // var response = hasil.map(({id, account, name}) => {
            //     return {
            //       value: id,
            //       label: '( '+account+' ) '+name
            //     }
            //   });
            
            var hasil2 = responseJson.data.data2;
            var response2 = hasil2.map(({id, account, name}) => {
                return {
                  value: id,
                  label: '( '+account+' ) '+name
                }
              });

            // this._isMounted && this.setState({optionUser:response, isLoadingUser:false, optionEmployee:response2});
            this._isMounted && this.setState({isLoadingUser:false, optionEmployee:response2});
            
            this.props.loadingData(false);
        }else{
            alert(responseJson);
        }
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

        if(!this.state.cancelDelete){
            if(!this.state.deleteData){
                if(this.state.items.flag_publish_by_employee == 2 && this.state.items.functionPublish == ''){
                    alert("Select Publish for Function");
                }
                else if(this.state.items.flag_publish_by_employee == 3 && this.state.optionSelectedEmployee===null){
                    alert("Select Publish for Employee");
                }
                else{
                    

                    const param = {
                        title: this.state.items.title,
                        user_function :this.state.items.user_function,
                        duration_length : this.state.items.duration_length,
                        location : this.state.items.location,
                        duration_period_type : this.state.items.duration_period_type,
                        start_date : this.state.items.start_date,
                        registation_closed_by : this.state.items.registation_closed_by,
                        avg_time_needed : this.state.items.avg_time_needed,
                        description:this.state.text,
                        flag_publish_by_employee : this.state.items.flag_publish_by_employee,
                        project_manager : this.state.items.project_manager,
                        status_active : this.state.items.status_active,
                        
                        functionPublish :this.state.items.functionPublish,

                        user_created : this.state.user_id,
                        user_modified : this.state.user_id,
                        id : this.state.items.id,
                        user_account: this.state.user_account,
                        
                        employeePublish: this.state.optionSelectedEmployee===null?[]:this.state.optionSelectedEmployee,
                        
                    }
                    const fd = new FormData();

                    fd.append("title", param.title);
                    fd.append("user_function", param.user_function);
                    fd.append("duration_length", param.duration_length);
                    fd.append("location", param.location);
                    fd.append("duration_period_type", param.duration_period_type);
                    fd.append("start_date", param.start_date);
                    fd.append("registation_closed_by", param.registation_closed_by);
                    fd.append("avg_time_needed", param.avg_time_needed);
                    fd.append("description", param.description);
                    fd.append("flag_publish_by_employee", param.flag_publish_by_employee);
                    fd.append("status_active", param.status_active);                    
                    fd.append("project_manager", param.project_manager);                    
                    fd.append("platform_id", this.state.platform_id);                    
                    
                    fd.append("employeePublish",  JSON.stringify(param.employeePublish));
                    fd.append("functionPublish",  param.functionPublish);
                    fd.append("themeId",  LoginData.Security_getTheme().id);

                    
                    this.setState({txtBtnSUbmit:"Loading .. please wait !"});
                    
                    if(this.state.editData){
                        //for edit data
                        fd.append("id",param.id);
                        fd.append("user_id",param.user_created);
                        //console.log(JSON.stringify(Object.fromEntries(fd)));
                        let responseJson = await AuthHelpers.postData("findTalentProject/UpdateData", fd);
                        if(responseJson.status == 200){
                            alert("DATA HAS BEEN UPDATED");
                            window.location.href = AllRoute.adminProject;
                        }else{
                            alert(responseJson);
                        }
                    }else{
                        //for insert data
                        fd.append("user_created", param.user_created);
                        //console.log(JSON.stringify(Object.fromEntries(fd)));
                        let responseJson = await AuthHelpers.postData("findTalentProject/InsertData", fd);
                        if(responseJson.status == 200){
                            alert("DATA HAS BEEN CREATED");
                            window.location.href = AllRoute.adminProject;
                        }else{
                            alert(responseJson);
                        }
                    }
                }
            }else{
                //for delete data
                const parameter = {
                    id:this.state.items.id
                }
                let responseJson = await AuthHelpers.postData("findTalentPlatform/DeleteData", parameter);
                if(responseJson.status == 200){
                    alert("DATA HAS BEEN DELETED");
                    window.location.href = AllRoute.adminProject;
                }else{
                    alert(responseJson);
                }
            }
        }
        this.setState({cancelDelete:false})
    }
    handleChange(value) {
        this.setState({ text: value })
    }
    getDetail= async(e) =>{
        const {data} = this.props.location;
        if(data!== undefined){
            this.setState({editData:true})
            let response = await AuthHelpers.postData('findTalentProject/SelectData',data);
            
            if(response.status = 200){
                this.setState({items:response.data.data, text:response.data.data.description});

                if(response.data.data.flag_publish_by_employee == 3){
                    this.setState({showSelectUser:true});
                    this.setState({showSelectFunction:false});

                    let responseEmployee    = await AuthHelpers.postData('findTalentProject/ListDataParticipantByProjectId',this.props.location.data);

                    var responseEmployees       = responseEmployee.data.data;
                    var returnEmployees         = responseEmployees.map(({id, account, name})=>{
                    return {
                        value: id,
                        label: '( '+account+' ) '+name
                    }
                    });

                    this.setState({
                        optionSelectedEmployee:returnEmployees
                    
                    });

                }
                else if(response.data.data.flag_publish_by_employee == 2){
                    this.setState({showSelectUser:false});
                    this.setState({showSelectFunction:true});

                    
                    let responseParticipant = await AuthHelpers.postData('findTalentProject/SelectDataParticipantByProjectId',this.props.location.data);

                   
                    const key               = "functionPublish";
                    var stateCopy           = Object.assign({}, this.state);
                    stateCopy.items[key]    = responseParticipant.data.data.user_function;
                    this.setState(stateCopy);

                    
                }
                else{
                    this.setState({showSelectUser:false});
                    this.setState({showSelectFunction:false});
                }
                
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
    toUrl(id) {
        localStorage.setItem("projectIdForAdmin", id);
        window.location.href = AllRoute.adminQuestionnaire;       
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
                                    <strong>Project</strong> administration 
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
                                                    <label className="control-label">&nbsp;Title <span style={{color:"#ff0404"}}>(* max : 200 characters)</span></label>
                                                    <input type="text" id="title" style={{width:"75%"}} className="form-control" name="title" value={items.title} onChange={this.handleInputChange}  maxlength="200"  required/>

                                                    <div className="help-block"></div>
                                                </div>
                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" for="usereditform-email">&nbsp; User Function <span style={{color:"#ff0404"}}>(*)</span></label>
                                                
                                                    <select className="form-control" style={{width:"400px"}}  required onChange={this.handleInputChange} name="user_function" value={items.user_function}>
                                                        <option value="">Choose</option>
                                                        {
                                                            this.state.listFunctionByUsersTable.map((obj) => {
                                                                return <option value={obj.directorate}>{obj.directorate}</option>
                                                            })
                                                        }
                                                    </select>



                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-location required">
                                                    <label className="control-label">&nbsp;Project Location <span style={{color:"#ff0404"}}>(* max : 200 characters)</span></label>
                                                    <input type="text"  maxlength="200"  id="location" style={{width:"75%"}} className="form-control" name="location" value={items.location} onChange={this.handleInputChange} required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-profile-country">
                                                    <label className="control-label">&nbsp;Project Duration <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <br/>
                                                    <input type="number" id="duration_length"  maxlength="2"  style={{ width:"100px",display:"inline-block" }}class="form-control" name="duration_length" value="" aria-required="true" required aria-invalid="false"  value={items.duration_length} onChange={this.handleInputChange}/>

                                                    <select id="duration_period_type" style={{ width:"20%",display:"inline-block" }} class="form-control" name="duration_period_type" value={items.duration_period_type} onChange={this.handleInputChange}  required aria-invalid="false">
                                                        <option value="">... Select this ...</option>
                                                        <option value="week">week</option>
                                                        <option value="month">month</option>
                                                        <option value="year">year</option>
                                                    </select>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-project_manager required">
                                                    <label className="control-label">&nbsp;Project Manager <span style={{color:"#ff0404"}}>(* max : 100 characters)</span></label>
                                                    <input type="text" id="project_manager" style={{width:"75%"}} className="form-control" name="project_manager" value={items.project_manager} onChange={this.handleInputChange}  maxlength="200"  required/>

                                                    <div className="help-block"></div>
                                                </div>
                                               
                                                <div className="form-group field-usereditform-start_date required">
                                                    <label className="control-label">&nbsp;Project Start Date <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="date" id="start_date" style={{width:"25%"}} className="form-control" name="start_date" value={items.start_date} onChange={this.handleInputChange} required/>

                                                    <div className="help-block"></div>
                                                </div>
                                                <div className="form-group field-usereditform-registation_closed_by required">
                                                    <label className="control-label">&nbsp;Registration Closed By <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="date" id="registation_closed_by" style={{width:"25%"}} className="form-control" name="registation_closed_by" value={items.registation_closed_by} onChange={this.handleInputChange} required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-avg_time_needed required">
                                                    <label className="control-label">&nbsp;Avg. Time Needed <span style={{color:"#ff0404"}}>(* max : 100 characters)</span></label>
                                                    <input type="text" id="avg_time_needed" style={{width:"75%"}} className="form-control" name="avg_time_needed" maxlength="100" value={items.avg_time_needed} onChange={this.handleInputChange} required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-description required">
                                                <label className="control-label">&nbsp;Project Description <span style={{color:"#ff0404"}}>(* max : 5000 characters)</span></label>

                                                    
                                                    <ReactQuill value={this.state.text} onChange={this.handleChange} />
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-profile-country">
                                                    <label className="control-label">&nbsp;Status Active</label>
                                                    <select id="profile-country" style={{width:"150px"}} className="form-control" name="status_active"  value={items.status_active} onChange={this.handleInputChange} required>
                                                        <option value="">... Select this ...</option>
                                                        <option value="0">inactive</option>
                                                        <option value="1">active</option>
                                                    </select>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-profile-flag_publish_by_employee">
                                                    <label className="control-label">&nbsp;Publish For</label>
                                                    <select id="flag_publish_by_employee" style={{width:"150px"}} className="form-control" name="flag_publish_by_employee"  value={items.flag_publish_by_employee} onChange={this.handleInputChangePublish} required>
                                                        <option value="">... Select this ...</option>
                                                        <option value="1">All Employee</option>
                                                        <option value="2">For Function</option>
                                                        <option value="3">For Employee</option>
                                                    </select>

                                                    <div className="help-block"></div>
                                                </div>

                                                { this.state.showSelectUser ? 

                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Publish for User</label>
                                                    
                                                    <AsyncSelect
                                                        onChange={this.fnOptionEmployee}
                                                        className="basic-multi-select" classNamePrefix="select" name="optionEmployee" value={optionSelectedEmployee} isMulti components={animatedComponents} isLoading={isLoadingUser} loadOptions={this.loadOptions.bind(this)}
                                                    />
                                                    <div className="help-block"></div>
                                                </div>

                                                : null }

                                                { this.state.showSelectFunction ? 

                                                <div className="form-group field-usereditform-email required">
                                                <label className="control-label" for="usereditform-email">&nbsp; Publish for Function </label>

                                                <select className="form-control" style={{width:"400px"}} onChange={this.handleInputChange} name="functionPublish" value={items.functionPublish} >
                                                    <option value="">Choose</option>
                                                    {
                                                        this.state.listFunctionByUsersTable.map((obj) => {
                                                            return <option value={obj.directorate}>{obj.directorate}</option>
                                                        })
                                                    }
                                                </select>



                                                <div className="help-block"></div>
                                                </div>

                                                : null }
                                                
                                            </div>
                                        </div>
                                        <input type="hidden" name="hdnkey" value={items.id}/>    
                                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">{this.state.txtBtnSUbmit}</button>&nbsp;<br/><br/>
                                       
                                        {(editData==false ? null : 
                                            
                                            <button className="btn btn-warning" name="btnDelete"   onClick={() => this.toUrl(items.id)} value="delete">Questionaire</button> 
                                        
                                        )}       
                                    </form>
                                </div>
                            </div>
                        </div>

            </>
        );
    }
}
    
    export default withRouter(vw_platform_master_dtl);