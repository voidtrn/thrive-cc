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
                    name: "",
                    imdl_param: "",
                    platform_image: "",
                    status_active: "",
                }
            ,
            loadData:true,
            file: null,
            user_id:null,
            isLoadingCountry: true,
            isLoadingFunction: true,
            isLoadingUser: true,
            optionCountry : [],
            optionSelectedCountry: [],
            optionFunction: [],
            optionSelectedFunction:[],
            optionUser: [],
            optionSelectedUsers:[],
            optionUserSuper: [],
            optionSelectedUsersSuper:[],
            optionAdHoc: [],
            optionSelectedAdHoc: [],
            isDisabled: true,
            selectedCountry:[],
            selectedFunction:[],
            selectedAdmin:[],
            //this state must include in every component
            editData:false,
            deleteData:false,
            file_path: env.userDocument,
            user_account:null,
            cancelDelete:false,
            //end here
        };
        this._isMounted = false;
        this.optionNull = this.optionNull.bind(this);
        this.fnOptionCountry = this.fnOptionCountry.bind(this);
        this.fnOptionFunction = this.fnOptionFunction.bind(this);
        this.fnOptionAdmin = this.fnOptionAdmin.bind(this);
        this.fnOptionSuperAdmin = this.fnOptionSuperAdmin.bind(this);
        this.fnOptionAdHoc = this.fnOptionAdHoc.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.fileInput = React.createRef();
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectSuperAdmin();
            }
        });
    }
    
    componentDidMount(){
        this.getUserId();
        this._isMounted = true;
        this._isMounted && this.getAllCountry();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getPlatformDtl=async()=>{
        //get data for edit in here
        const { data } = this.props.location;
        if(data!== undefined){
            this.setState({editData:true});
            let responseJson = await AuthHelpers.postData("findTalentPlatform/SelectData",data);
            if(responseJson.status == 200){
               var responseCountry = responseJson.data.data2;
               var hasilCountry = responseCountry.map(({id, country})=>{
                   return {
                        value : country,
                        label : country
                   }
               });
               var responseFunction = responseJson.data.data3;
               var hasilFunction = responseFunction.map(({id, directorate})=>{
                return {
                     value : directorate,
                     label : directorate
                }
                });
                var responseAdmin = responseJson.data.data4;
                var hasilAdmin = responseAdmin.map(({id, account, name})=>{
                 return {
                    value: id,
                    label: '( '+account+' ) '+name
                 }
                 });
                var responseSuperAdmin = responseJson.data.data6;
                var hasilSuperAdmin = responseSuperAdmin.map(({id, account, name})=>{
                return {
                    value: id,
                    label: '( '+account+' ) '+name
                }
                });
                var responseAdhoc = responseJson.data.data5;
                var hasilAdhoc = responseAdhoc.map(({id, account, name})=>{
                  return {
                     value: id,
                     label: '( '+account+' ) '+name
                  }
                });

                this.setState(
                    {
                        items:responseJson.data.data, 
                        file:this.state.file_path+"platform/"+responseJson.data.data.platform_image, optionSelectedCountry:hasilCountry,
                        optionSelectedFunction:hasilFunction, 
                        optionSelectedUsers:hasilAdmin, 
                        optionSelectedAdHoc:hasilAdhoc,
                        optionSelectedUsersSuper:hasilSuperAdmin
                    },()=>{
                        this.getAllEmpl();
                    }
                );
            }else{
                // alert(responseJson.data.message);
            }

        }
        
        //console.log("asd "+this.state.items);
    }

    getAllCountry= async (e) =>{
        const config = AuthHelpers.getAuthHeader();
        let responseJson = await AuthHelpers.getData("findTalentPlatform/GetAllCountry",config);
        if(responseJson.status == 200){
            var hasil = responseJson.data.data;
            var response = hasil.map(({country}) => {
                return {
                  value: country,
                  label: country
                }
              });
            this._isMounted && this.setState({optionCountry:response, isLoadingCountry:false},()=>{
                this.getAllFunction();
                this.getPlatformDtl();
            });
        }else{
            alert(responseJson);
        }
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
        if(this.state.optionSelectedFunction!==null){
            var selectedfunction = this.state.optionSelectedFunction.map(({value}) => {
                return value
            });
        }else{
            var selectedfunction = []
        }
        
        if(this.state.optionSelectedCountry!==null){
            var selectedCountry = this.state.optionSelectedCountry.map(({value}) => {
                return value
            });
        }else{
            var selectedCountry = []
        }
        const param = {
            country : selectedCountry,
            directorate : selectedfunction
        }
        //delete update di admin platform
        let responseJson = await AuthHelpers.postData("findTalentPlatform/GetAllEmployee",param);
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

            // this._isMounted && this.setState({optionUser:response, isLoadingUser:false, optionAdHoc:response2});
            this._isMounted && this.setState({isLoadingUser:false, optionAdHoc:response2});
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

    fnOptionAdHoc(e){
        this.setState({optionSelectedAdHoc:e});
    }

    getUserId(){
        var dataUser = AuthHelpers.getUserInfo();
        this.setState({user_id:dataUser.id, user_account:dataUser.account});
        
        this.props.loadingData(false);
    }

    submit= async (e) =>{
        e.preventDefault();

        if(!this.state.cancelDelete){
            if(!this.state.deleteData){
                const param = {
                    name: this.state.items.name,
                    platform_image : this.fileInput.current.files.length == 0 ? null : this.fileInput.current.files[0],
                    imdl_param :this.state.items.imdl_param,
                    energy_point : this.state.items.energy_point,
                    status_active : this.state.items.status_active,
                    user_created : this.state.user_id,
                    user_modified : this.state.user_id,
                    country : this.state.optionSelectedCountry===null?[]:this.state.optionSelectedCountry,
                    function : this.state.optionSelectedFunction===null?[]:this.state.optionSelectedFunction,
                    // admin : this.state.optionSelectedUsers===null?[]:this.state.optionSelectedUsers,
                    adhoc: this.state.optionSelectedAdHoc===null?[]:this.state.optionSelectedAdHoc,
                    id : this.state.items.id,
                    user_account: this.state.user_account
                }
                const fd = new FormData();
                fd.append("name", param.name);
                fd.append("imdl_param", param.imdl_param);
                fd.append("energy_point", param.energy_point)
                fd.append("status_active", param.status_active);
                fd.append("platform_image", param.platform_image);
                fd.append("user_modified", param.user_modified);
                fd.append("user_account", param.user_account)
                fd.append("country", JSON.stringify(param.country));
                fd.append("function",  JSON.stringify(param.function));
                // fd.append("admin", JSON.stringify(param.admin));
                fd.append("adhoc", JSON.stringify(param.adhoc));

                if(this.state.editData){
                    //for edit data
                    fd.append("id",param.id);
                    //console.log(JSON.stringify(Object.fromEntries(fd)));
                    let responseJson = await AuthHelpers.postData("findTalentPlatform/UpdateData", fd);
                    if(responseJson.status == 200){
                        alert("DATA HAS BEEN UPDATED");
                        window.location.href = AllRoute.adminPlatform;
                    }else{
                        alert(responseJson);
                    }
                }else{
                    //for insert data
                    fd.append("user_created", param.user_created);
                    //console.log(JSON.stringify(Object.fromEntries(fd)));
                    let responseJson = await AuthHelpers.postData("findTalentPlatform/InsertData", fd);
                    if(responseJson.status == 200){
                        alert("DATA HAS BEEN CREATED");
                        window.location.href = AllRoute.adminPlatform;
                    }else{
                        alert(responseJson);
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
                    window.location.href = AllRoute.adminPlatform;
                }else{
                    alert(responseJson);
                }
            }
        }
        this.setState({cancelDelete:false})
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



    ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        var filename = upload_field.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) == -1) 
        {
            alert("File must be an image");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 3) {
            alert('File size exceeds 3 MB');
            upload_field.target.form.reset();
            return 0;
        }
        document.getElementById("upload-name").innerHTML = imagename + ' (' + this.formatSizeUnits(upload_field.target.files[0].size) + ')';     
        
        this.setState({     
            file: URL.createObjectURL(upload_field.target.files[0])   
        })  
        
        return 1;       
    }

    formatSizeUnits(bytes){

        if      (bytes>=1073741824) {bytes=(bytes/1073741824).toFixed(2)+' GB';}
        else if (bytes>=1048576)    {bytes=(bytes/1048576).toFixed(2)+' MB';}
        else if (bytes>=1024)       {bytes=(bytes/1024).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes==1)          {bytes=bytes+' byte';}
        else                        {bytes='0 byte';}
        return bytes;
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, this.state);
        stateCopy.items[key] = value;
        this.setState(stateCopy);
    }
    loadOptions = (inputValue, callback) => {
        // perform a request
        const requestResults = this.state.optionAdHoc.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue)
            ).slice(0,20)
        //const requestResults = this.state.optionAdHoc.slice(0,10);
        //console.log(this.state.optionAdHoc)
        callback(requestResults)
    }
    render(){

        const {isLoadingCountry, isLoadingFunction, isLoadingUser, optionCountry, optionFunction, optionUser, isDisabled, items, editData, file, optionSelectedCountry, optionSelectedFunction, optionSelectedUsers, optionAdHoc, optionSelectedAdHoc, optionUserSuper, optionSelectedUsersSuper} = this.state;

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
                                    <strong>Platform</strong> administration 
                                </div>
                                <div className="clearfix">
                                    <div className="panel-body">
                                        <a className="fa-pull-right btn btn-default" href={AllRoute.adminPlatform} label="Back to overview" data-ui-loader="">
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
                                            title={editData ? 'Edit : Platform': 'New Data' }  >
                                        </Tab>
                                    </Tabs> 
                                    <form id="czfrom" onSubmit={this.submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                        <div className="tab-content">
                                            <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label">&nbsp;Platform Name <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="text" id="name" style={{width:"75%"}} className="form-control" name="name" value={items.name} onChange={this.handleInputChange} required/>

                                                    <div className="help-block"></div>
                                                </div>


                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Platform Image <span style={{color:"#ff0404"}}>(*) max upload file size : 300 KB, image resolution : (200 px * 200 px)</span></label>
                                                    <input type="file"  
                                                            name="platform_image" id="platform_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={this.fileInput} onChange={this.ajaxFileUploadImage.bind(this)} required={editData==false?true:false} class="form-control-file"/>
                                                    <br/>
                                                    <img style={{width:"160px",height:"auto"}} id="newimage" src={file}  alt="" />
                                                <br/>
                                                <br/>
                                                    <span className='label label-primary' id="upload-name" name="upload-name">{items.platform_image==""? "images": items.platform_image}</span>
                                                    
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label">&nbsp;IMDL <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="text" id="imdl_param" style={{width:"75%"}} className="form-control" name="imdl_param" value={items.imdl_param} onChange={this.handleInputChange} required/>

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

                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Country</label>
                                                    <Select  components={animatedComponents} isMulti isLoading={isLoadingCountry} options={optionCountry} className="basic-multi-select" classNamePrefix="select" name="optionCountry" onBlur={this.optionNull} onChange={this.fnOptionCountry} value={optionSelectedCountry}/>
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Function</label>
                                                    <Select components={animatedComponents} isMulti isLoading={isLoadingFunction} options={optionFunction} className="basic-multi-select" classNamePrefix="select" name="optionFunction" onBlur={this.optionNull} onChange={this.fnOptionFunction} value={optionSelectedFunction}/>
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Admin</label>
                                                    <Select components={animatedComponents} isMulti options={optionUser} className="basic-multi-select" classNamePrefix="select" name="optionUser" isDisabled={true} onChange={this.fnOptionAdmin} value={optionSelectedUsers} />
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Super Admin</label>
                                                    <Select components={animatedComponents} isMulti options={optionUserSuper} className="basic-multi-select" classNamePrefix="select" name="optionUserSuper" isDisabled={true} onChange={this.fnOptionSuperAdmin} value={optionSelectedUsersSuper} />
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="form-group field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Ad Hoc User</label>
                                                    {/* <Select components={animatedComponents} isMulti isLoading={isLoadingUser} options={optionAdHoc.slice(0,10)} className="basic-multi-select" classNamePrefix="select" name="optionAdHoc" isDisabled={false} onChange={this.fnOptionAdHoc} value={optionSelectedAdHoc}/> */}
                                                    <AsyncSelect
                                                        onChange={this.fnOptionAdHoc}
                                                        className="basic-multi-select" classNamePrefix="select" name="optionAdHoc" value={optionSelectedAdHoc} isMulti components={animatedComponents} isLoading={isLoadingUser} loadOptions={this.loadOptions.bind(this)}
                                                    />
                                                    <div className="help-block"></div>
                                                </div>
                                                
                                            </div>
                                        </div>
                                        <input type="hidden" name="hdnkey" value={items.id}/>    
                                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                                        {(editData==false ? null : <button className="btn btn-danger" name="btnDelete" onClick={this.DeleteConfirm.bind(this)} value="delete">Delete</button> )}       
                                    </form>
                                </div>
                            </div>
                        </div>

            </>
        );
    }
}
    
    export default withRouter(vw_platform_master_dtl);