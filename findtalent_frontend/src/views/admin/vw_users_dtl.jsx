import React, { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import {Tabs, Tab} from 'react-bootstrap';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

class vw_users_dtl extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:{
                id:"",
                name: "",
                account: "",
                email: "",
                status_active: "",
                status_enable: "",
                validity_start_date: "",
                validity_end_date: "",
                title: "",
                business_unit: "",
                directorate: "",
                division_p: "",
                division_q: "",
                department: "",
                first_login: "",
                last_login: "",
                dtlTab: "",
                dtlNewTab: "",
                tab: "",
            },
            platform_id:LoginData.Security_getPlatformId(),
            file:null,
            user_id:null,
            editData:false,
            deleteData:false,
            file_path: env.userDocument,
            doc_url: env.userDocument,
            assets_url: env.assets,
            user_account:null
        };
        this._isMounted = false;
        this.chgSelect = this.chgSelect.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.fileInput = React.createRef();
        this.onChange = this.onChange.bind(this);
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectAdmin();
            }
        });
      }

    getUserId(){
        var dataUser = AuthHelpers.getUserInfo();
        this.setState({user_id:dataUser.id, user_account:dataUser.account});
    }

    componentDidMount(){
        this.setState({
            dtlTab: "account",
            dtlNewTab: "general",
            tab: this.props.location.state,
        })
        this.getUserId();
        this._isMounted = true;
        
        this._isMounted && this.getDetail();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getDetail= async(e) =>{
        const {data} = this.props.location;

        if(data!== undefined){
            this.setState({editData:true})
            let response = await AuthHelpers.postData('thinkuser/SelectData',data);
            if(response.status = 200){
                this.setState({items:response.data.data});
            }else{
                alert(response);
            }
        }
    }

    componentDidUpdate(){
        const id =null;
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, this.state);
        stateCopy.items[key] = value;
        this.setState(stateCopy);
    }

    validateForm(){
        let formIsValid = true;
        if (this.state.items.valid_from > this.state.items.valid_to){
            formIsValid = false;
            alert("Start date can't bigger than end date");
        }
        return formIsValid;
    }   

    submit= async (e) => {
        e.preventDefault();
        if (this.validateForm()) {
            const param = {
                id: this.state.items.id,
                employee_id: this.state.items.employee_id,
                name: this.state.items.name,
                account: this.state.items.account,
                email: this.state.items.email,
                status_active: this.state.items.status_active,
                status_enable: this.state.items.status_enable,
                user_created: this.state.items.user_id,
                user_modified: this.state.items.user_id,
                validity_start_date: this.state.items.validity_start_date,
                validity_end_date: this.state.items.validity_end_date,
                title: this.state.items.title,
                business_unit: this.state.items.business_unit,
                directorate: this.state.items.directorate,
                division_p: this.state.items.division_p,
                division_q: this.state.items.division_q,
                department: this.state.items.department,
            };
    
            const fd = new FormData();
            fd.append("id", param.id);
            fd.append("employee_id", param.employee_id);
            fd.append("name", param.name);
            fd.append("account", param.account);
            fd.append("email", param.email);
            fd.append("validity_start_date", param.validity_start_date);
            fd.append("validity_end_date", param.validity_end_date);
            fd.append("title", param.title);
            fd.append("business_unit", param.business_unit);
            fd.append("directorate", param.directorate);
            fd.append("division_p", param.division_p);
            fd.append("division_q", param.division_q);
            fd.append("department", param.department);
            fd.append("status_active", param.status_active);
            fd.append("status_enable", param.status_enable);
            fd.append("user_modified", param.user_modified);
    
            if(!this.state.deleteData){
                if(this.state.editData){
                    // console.log(param);
                    let submitData = await AuthHelpers.postData("thinkuser/UpdateData", param);
                    // console.log(submitData);
                    if(submitData.status == 200){
                        alert("Data has been updated");
                        window.location.href = AllRoute.adminUsers;
                    }else{
                        alert("Failed to update data");
                    }
                } else{
                    //for insert data
                    fd.append("user_created", param.user_created);
                    let submitData = await AuthHelpers.postData("thinkuser/AddData",fd);
                    if(submitData.status == 200){
                        alert("Data has been created");
                        window.location.href = AllRoute.adminUsers;
                    }else{
                        alert("Failed to create data");
                    }
                }
            }else {
                const parameter = {
                    id:this.state.items.id
                }
                let responseJson = await AuthHelpers.postData("thinkuser/DeleteData", parameter);
               
                if(responseJson.status == 200){
                    alert("Data has been deleted");
                    window.location.href = AllRoute.adminusers;
                }else{
                    alert("Failed to delete data");
                }
            }
        }
            
    }

    DeleteConfirm=  async (param)=>{
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure to delete this data?")) 
        { 
          this.setState({deleteData:true})
        } 
        else
        {
          return 0
        } 
    }

    chgSelect(event){
        var newItems = this.state.items;
        var target = event.target.name;
        newItems[target] = event.target.value;
        this.setState({
            items: newItems
        })
    }

    onChange(e){
        var newItems = this.state.items;
        var name = e.target.name;
        this.setState({
            items: newItems
        })
    }

    changeTab(param){
        const name = param;

        if(name == 'account'){
            this.setState({
                dtlTab: "account",
                dtlNewTab: "general",
                
            }
            )
        
        }else{
            this.setState({
                dtlTab: "general",
                dtlNewTab: "account",
                
            }
            )
            
        }
    }

    render(){
        const {items, editData, tab, dtlTab, dtlNewTab} = this.state;
        return(
            <>
                    <style>{
                            `
                            .control-label{
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
                            <strong>User</strong> administration 
                        </div>

                        <Tabs
                            id="controlled-tab-example"
                            activeKey='edit'
                            >
                            <Tab eventKey="edit" 
                                title={this.state.editData ? 'Edit : '+items.name : 'New Data' }  >
                            </Tab>
                            
                        </Tabs> 

                        <div className="clearfix">
                            <div className="panel-body">
                                <a  className="fa-pull-right btn btn-default" label="Back to overview" data-ui-loader="" href={AllRoute.adminUsers} >
                                    <i className="fa fa-arrow-left aria-hidden=" true></i> Back to overview</a>        
                                    <h4 className="fa-pull-left"></h4>
                            </div>
                        </div>

                        <div className="panel-body">

                            <form id="czfrom"  encType="multipart/form-data" acceptCharset="UTF-8" style={{display: "block"}} onSubmit={this.submit}   method="post" >
                                
                            <Tabs
                                id="controlled-tab-example"
                                activeKey={dtlTab}
                                //activeKey='users'
                                onSelect= {this.changeTab.bind(this, dtlNewTab  )}
                                >
                                <Tab 
                                    eventKey="account" title="Account">
                                </Tab>
                                <Tab 
                                    eventKey="general" title="General"> 
                                </Tab>
                                
                            </Tabs>   
                            <div className="tab-content">
                                <div className={this.state.dtlTab=="account"? "tab-pane active": "tab-pane"} data-tab-index="0" id="tab-0">
                                    <div className="form-group field-usereditform-email">
                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Employee ID </label>
                                        <input type="text" id="usereditform-email" style={{width:"45%"}} className="form-control" name="id" value={items.id} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="50"/>
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-usereditform-email">
                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Account </label>
                                        <input type="text" id="usereditform-email" style={{width:"45%"}} className="form-control" name="account" value={items.account} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="50" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-usereditform-email">
                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Email </label>
                                        <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="email" value={items.email} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="250" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-usereditform-email">
                                    <label className="control-label">&nbsp;Status Active</label>
                                        <select id="status_active" style={{width:"150px"}} className="form-control" name="status_active" value={items.status_active} onChange={this.chgSelect} disabled={editData ? true : false } >
                                            <option value="">... Select this ...</option>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-usereditform-email">
                                    <label className="control-label">&nbsp;Status Enable</label>
                                        <select id="status_active" style={{width:"150px"}} className="form-control" name="status_enable" value={items.status_enable} onChange={this.chgSelect}>
                                            <option value="">... Select this ...</option>
                                            <option value="1">Enabled</option>
                                            <option value="0">Disabled</option>
                                        </select>
                                        <div className="help-block"></div>
                                    </div>
                                </div>
                                <div className={this.state.dtlTab=="general" ? "tab-pane active": "tab-pane" } data-tab-index="1" id="tab-1">
                                    <div className="form-group field-profile-firstname">
                                        <label className="control-label" htmlFor="profile-firstname">Name</label>
                                        <input type="text" id="profile-firstname" style={{width:"75%"}} className="form-control" name="name" value={items.name} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="100" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">Title</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="title" value={items.title} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">Business Unit</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="business_unit" value={items.business_unit} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">Directorate</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="directorate" value={items.directorate} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">Division P</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="division_p" value={items.division_p} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">Division Q</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="division_q" value={items.division_q} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">Department</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="department" value={items.department} onChange={this.handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                        <div className="help-block"></div> 
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">First Login</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="first_login" value={items.first_login} disabled aria-required="true" />
                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-profile-lastname">
                                        <label className="control-label" htmlFor="profile-lastname">Last Login</label>
                                        <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="last_login" value={items.last_login} disabled aria-required="true" />
                                        <div className="help-block"></div>
                                    </div>
                                </div>
                            </div>
                            <br/>
                            <input type="hidden" name="hdnkey" value={items.id}/>    
                            <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                            {/* <button type="submit" className={ tab == 'users' ? 'btn btn-primary' : 'btn btn-danger'} name="btnSubmit" value="save">
                                {tab == 'users' ? "Add role: Administrator" : 'Remove role: Administrator'}
                                </button>&nbsp; */}
                            {/*(editData==false ? null : <button className="btn btn-danger" name="btnDelete" onClick={this.DeleteConfirm.bind(this)} value="delete">Delete</button> )*/}       
                            </form>
                    </div>
                </div>
            </div>
        
            </>
        );
    }
}
export default withRouter(vw_users_dtl);
