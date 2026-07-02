import React, { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import {Tabs, Tab, Modal, Button} from 'react-bootstrap';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;


class vw_slider_dtl extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:{
                id:"",
                name:"",
                status_active:"",
                hyperlink:"",
                slider_image:"",
                slider_image_mobile:"",
            },
            platform_id:LoginData.Security_getPlatformId(),
            file:null,
            file_mobile:null,
            user_id:null,
            editData:false,
            deleteData:false,
            file_path: env.userDocument,
            doc_url: env.userDocument,
            assets_url: env.assets,
            user_account:null,
            cancelDelete:false,
            // fixing pentest by syofian 170321
            invalidImage:false,
            invalidImage_mobile:false
            // end fixing
        };
        this._isMounted = false;
        this.chgSelect = this.chgSelect.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.fileInput = React.createRef();
        this.fileInput_mobile = React.createRef();
        // fixing pentest by syofian 170321;
        this.validateImage = this.validateImage.bind(this);
        this.reader = new FileReader();
        // end fixing
        this.onChange = this.onChange.bind(this);
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectAdmin();
            }
        });
        this.addDefaultSrc = this.addDefaultSrc.bind(this)
      }

    getUserId(){
        var dataUser = AuthHelpers.getUserInfo();
        this.setState({user_id:dataUser.id, user_account:dataUser.account});
    }

    componentDidMount(){
    this.getUserId();
    this._isMounted = true;
    
    this._isMounted && this.getDetail();
    
    this.props.loadingData(false);

    }

    componentWillUnmount() {
    this._isMounted = false;
    }


    getDetail= async(e) =>{
        const {data} = this.props.location;
        if(data!== undefined){
            this.setState({editData:true})
            let response = await AuthHelpers.postData('findTalentSlider/SelectData',data);
            
            if(response.status = 200){
                this.setState({items:response.data.data, file:this.state.file_path+"slider/"+response.data.data.slider_image, file_mobile:this.state.file_path+"slider/"+response.data.data.slider_image_mobile});
            }else{
                alert(response);
            }
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

    validateForm(){
        let formIsValid = true;
        if (this.state.items.valid_from > this.state.items.valid_to){
            formIsValid = false;
            alert("Start date can't bigger than end date");
        }
        return formIsValid;
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

        

    submit= async () => {
        if (this.validateForm()) {
            if(!this.state.cancelDelete){
                    const param = {
                        name: this.state.items.name,
                        slider_image : this.fileInput.current.files.length == 0 ? null : this.fileInput.current.files[0],
                        hyperlink:this.state.items.hyperlink,
                        status_active:this.state.items.status_active,
                        user_created : this.state.user_id,
                        user_modified : this.state.user_id,
                        platform_id : this.state.platform_id
                    };
            
                    const fd = new FormData();
                    fd.append("name", param.name);
                    fd.append("hyperlink", param.hyperlink)
                    fd.append("status_active", param.status_active);
                    //fd.append("slider_file", param.slider_image);
                    fd.append("platform_id", param.platform_id);
            
                    const IsFileAttached = this.fileInput.current.files.length > 0;
                    const IsFile2Attached = this.fileInput_mobile.current.files.length > 0;

                    if(IsFileAttached) 
                    fd.append("slider_file", this.fileInput.current.files[0]);
                    if(IsFile2Attached)
                    fd.append("slider_file_mobile", this.fileInput_mobile.current.files[0]);
                    if(!this.state.deleteData){
                        if(this.state.editData){
                            //for edit data
                            fd.append("id",this.state.items.id);
                            fd.append("user_modified", param.user_modified);
                            let submitData = await AuthHelpers.postData("findTalentSlider/UpdateData",fd);
                            if(submitData.status == 200){
                                alert("DATA HAS BEEN UPDATED");
                                window.location.href = AllRoute.adminSlider;
                            }else{
                                alert("FAILED TO UPDATE DATA");
                            }
                        } else{
                            //for insert data
                            fd.append("user_created", param.user_created);

                            if (!IsFileAttached || !IsFile2Attached){
                                alert("PLEASE ATTACH PREVIEW IMAGE");
                                return 0;
                            }

                            let submitData = await AuthHelpers.postData("findTalentSlider/InsertData",fd);
                        
                            if(submitData.status == 200){
                                alert("DATA HAS BEEN CREATED");
                                window.location.href = AllRoute.adminSlider;
                            }else{
                                alert("FAILED TO INSERT DATA");
                            }
                        }
                    }else {
                        const parameter = {
                            id:this.state.items.id
                        }
                        let responseJson = await AuthHelpers.postData("slider/DeleteData", parameter);
                    
                        if(responseJson.status == 200){
                            alert("DATA HAS BEEN DELETED");
                            window.location.href = AllRoute.adminSlider;
                        }else{
                            alert("FAILED TO DELETE DATA");
                        }
                    }
            }
            this.setState({cancelDelete:false})
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


    ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        // fixing pentest by syofian 170321
        if(upload_field.target.files[0]!== undefined){
            this.reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    var filename = upload_field.target.value;
                    var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
                    var flag = upload_field.target.name;
                    if (filename.search(re_text) == -1) 
                    {
                        alert("File must be an image");
                        upload_field.target.form.reset();
                        return 0;
                    }
                    var FileSize = upload_field.target.files[0].size / 1024 / 1024 / 1024; // in KB
                    if (FileSize > 300) {
                        alert('File size exceeds 300 KB');
                        upload_field.target.form.reset();
                        return 0;
                    }
                    if (flag === 'slider_image'){
                        document.getElementById("upload-name").innerHTML = imagename + ' (' + this.formatSizeUnits(upload_field.target.files[0].size) + ')'; 
                            
                        this.setState({     
                            file: URL.createObjectURL(upload_field.target.files[0]),
                            invalidImage:false
                        })
                    }
                    else{
                        document.getElementById("upload-name-mobile").innerHTML = imagename + ' (' + this.formatSizeUnits(upload_field.target.files[0].size) + ')';     
                        this.setState({     
                            file_mobile: URL.createObjectURL(upload_field.target.files[0]),
                            invalidImage_mobile:false
                        })
                    }
                    return 1; 
                };
                img.onerror = () => {
                    var flag = upload_field.target.name;
                    if (flag === 'slider_image'){
                        document.getElementById("upload-name").innerHTML = "Invalid image content";     
                        this.setState({     
                            file: null,
                            invalidImage: true
                        })
                    }
                    else{
                        document.getElementById("upload-name-mobile").innerHTML = "Invalid image content";     
                        this.setState({     
                            file_mobile: null,
                            invalidImage_mobile: true
                        })
                    }
                    return false;
                };
                img.src = e.target.result;
            };
            
            this.reader.readAsDataURL(upload_field.target.files[0]);
        }
        // end fixing     
      }

    // fixing pentest by syofian 170321
    validateImage(e){
        e.preventDefault();
        const { invalidImage, invalidImage_mobile } = this.state

        if(invalidImage || invalidImage_mobile ){
            alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
            return false
        }else{
            this.submit();
            return true
        }
    }
    // end fixing 

    onChange(e){
        var newItems = this.state.items;
        var name = e.target.name;
        this.setState({
            items: newItems
        })
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

    addDefaultSrc(ev){
        ev.target.src =  "https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=No+Image+";
    }

    addDefaultSrcImg(ev){
        ev.target.src =  "https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=No+Image+"
    }
      



    render(){
        const {items, editData, file, file_mobile} = this.state;
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
                            <strong>Slider</strong> administration 
                        </div>
                        <div className="clearfix">
                            <div className="panel-body">
                                <a  className="pull-right btn btn-default" label="Back to overview" data-ui-loader="" href={AllRoute.adminSlider} >
                                    <i className="fa fa-arrow-left aria-hidden=" true></i> Back to overview</a>        
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
                            <form id="czfrom"  enctype="multipart/form-data" accept-charset="UTF-8" style={{display: "block"}} onSubmit={this.validateImage}   method="post" >
                                
                            <div className="tab-content">
                                <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                    <div className="form-group field-usereditform-email required">
                                        <label className="control-label" for="usereditform-email">&nbsp;Slider <span style={{color:"#ff0404"}}>(*) </span></label>
                                        <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="name" value={items.name} onChange={this.handleInputChange}   aria-required="true" aria-invalid="false"/>

                                        <div className="help-block"></div>
                                    </div>

                                    <div className="form-group field-usereditform-hyperlink required">
                                        <label className="control-label" for="usereditform-hyperlink">&nbsp;Hyperlink (optional, sample : http://www.google.co.id)</label>
                                        <input type="text" id="usereditform-hyperlink" style={{width:"75%"}} className="form-control" name="hyperlink" value={items.hyperlink} onChange={this.handleInputChange}  aria-required="true" aria-invalid="false" />

                                        <div className="help-block"></div>
                                    </div>

                                    <div className="form-group field-usereditform-slider_image required">
                                        <label className="control-label" for="usereditform-slider_image">&nbsp;Slider Image <span style={{color:"#ff0404"}}>(*) max upload file size : 300 KB, image resolution : (1300 px * 400 px)</span></label>
                                        <br/>
                                        <input type="file"  
                                                name="slider_image" id="slider_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={this.fileInput} onChange={this.ajaxFileUploadImage.bind(this)} required={editData==false?true:false} />
                                                <br/>
                                        <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={this.addDefaultSrc} />
                                    <br/>
                                    <span className='label label-primary' id="upload-name" name="upload-name"> {items.slider_image==""? "images": items.slider_image} </span>
                                        
                                        <div className="help-block"></div>
                                    </div>

                                    <div className="form-group field-usereditform-slider_image_mobile required">
                                        <label className="control-label" for="usereditform-slider_image_mobile">&nbsp;Slider Image Mobile<span style={{color:"#ff0404"}}>(*) max upload file size : 300 KB, image resolution : (1300 px * 400 px)</span></label>
                                        <br/>
                                        <input type="file"  
                                                name="slider_image_mobile" id="slider_image_mobile" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={this.fileInput_mobile} onChange={this.ajaxFileUploadImage.bind(this)} required={editData==false?true:false} />
                                                <br/>
                                        <img style={{width:"160px",height:"auto"}}  src={file_mobile}    alt="" onError={this.addDefaultSrc} />
                                    <br/>
                                    <span className='label label-primary' id="upload-name-mobile" name="upload-name-mobile"> {items.slider_image_mobile==""? "images": items.slider_image_mobile} </span>
                                        
                                        <div className="help-block"></div>
                                    </div>

                                    <div className="form-group field-usereditform-status_active required">
                                    <label className="control-label">&nbsp;Status Active</label>
                                        <select id="status_active" style={{width:"150px"}} className="form-control" name="status_active" value={items.status_active} onChange={this.chgSelect}>
                                            <option value="">... Select this ...</option>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
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
    
    export default withRouter(vw_slider_dtl);