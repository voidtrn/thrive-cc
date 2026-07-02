import React, { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import {Tabs, Tab} from 'react-bootstrap';
import SSO from '../../helpers/SSO';
import md5 from 'md5';

var {LoginData, AllRoute, env} = SSO;


class vw_slider_dtl extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:{
                id:"",
                question:"",
                status_active:"",
                radio_option_1:"",
                radio_option_2:"",
                
            },
            itemsProject:[],
            platform_id:LoginData.Security_getPlatformId(),
            file:null,
            user_id:null,
            editData:false,
            deleteData:false,
            file_path: env.userDocument,
            doc_url: env.userDocument,
            assets_url: env.assets,
            user_account:null,
            cancelDelete:false,
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
        this.addDefaultSrc = this.addDefaultSrc.bind(this)
      }

      getUserId(){
        var dataUser = AuthHelpers.getUserInfo();
        this.setState({user_id:dataUser.id, user_account:dataUser.account});
    }

    componentDidMount(){
        if(!localStorage.getItem("projectIdForAdmin")){
            window.location.href = AllRoute.adminProject;   
        }
        
        this.getUserId();
        this._isMounted = true;
        
        this._isMounted && this.getDetail()  && this.getDetailProject();
        
        this.props.loadingData(false);

    }

    getDetailProject= async(e) =>{         
        const credentials ={
            platform_id         :this.state.platform_id,
            md5ID               :md5(localStorage.getItem("projectIdForAdmin"))
        }
        let response = await AuthHelpers.postData('findTalentProject/SelectData',credentials);              
        if(response.status = 200){
            this.setState({itemsProject:response.data.data});
        }else{
            alert(response);
        }
}

    componentWillUnmount() {
    this._isMounted = false;
    }


    getDetail= async(e) =>{
        const {data} = this.props.location;
        if(data!== undefined){
            this.setState({editData:true})
            let response = await AuthHelpers.postData('findTalentQuestionnaire/SelectData',data);
            
            if(response.status = 200){
                this.setState({items:response.data.data, file:this.state.file_path+"slider/"+response.data.data.slider_image});
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

        

    submit= async (e) => {
        e.preventDefault();
        if(!this.state.cancelDelete){
            if(!this.state.deleteData){
                if (this.validateForm()) {
                    const param = {
                        question        :   this.state.items.question,
                        project_id      :   localStorage.getItem("projectIdForAdmin"),
                        status_active   :   this.state.items.status_active,
                        radio_option_2   :   this.state.items.radio_option_2,
                        radio_option_1   :   this.state.items.radio_option_1,
                        user_created    :   this.state.user_id,
                        user_modified   :   this.state.user_id
                    };
            
                    const fd = new FormData();
                    fd.append("question", param.question);
                    fd.append("project_id", param.project_id);
                    fd.append("question_type", "radiobutton");
                    fd.append("status_active", param.status_active);
                    fd.append("radio_option_1", param.radio_option_1);
                    fd.append("radio_option_2", param.radio_option_2);
                  
                    
                    if(this.state.editData){
                        //for edit data
                        fd.append("id",this.state.items.id);
                        fd.append("user_modified", param.user_modified);
                        let submitData = await AuthHelpers.postData("findTalentQuestionnaire/UpdateData",fd);
                        if(submitData.status == 200){
                            alert("DATA HAS BEEN UPDATED");
                            window.location.href = AllRoute.adminQuestionnaire;
                        }else{
                            alert("FAILED TO UPDATE DATA");
                        }
                    } else{
                        //for insert data
                        fd.append("user_created", param.user_created);

                       

                        let submitData = await AuthHelpers.postData("findTalentQuestionnaire/InsertData",fd);
                    
                        if(submitData.status == 200){
                            alert("DATA HAS BEEN CREATED");
                            window.location.href = AllRoute.adminQuestionnaire;
                        }else{
                            alert("FAILED TO INSERT DATA");
                        }
                    }
                }
            }else {
                const parameter = {
                    id:this.state.items.id
                }
                let responseJson = await AuthHelpers.postData("findTalentQuestionnaire/DeleteData", parameter);
            
                if(responseJson.status == 200){
                    alert("DATA HAS BEEN DELETED");
                    window.location.href = AllRoute.adminQuestionnaire;
                }else{
                    alert("FAILED TO DELETE DATA");
                }
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
           // $(file).val(''); //for clearing with Jquery
        }
        document.getElementById("upload-name").innerHTML = imagename + ' (' + this.formatSizeUnits(upload_field.target.files[0].size) + ')';     
        
        this.setState({     
            file: URL.createObjectURL(upload_field.target.files[0])   
        })  
        
        return 1;       
      }

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
        ev.target.src =  this.state.doc_url+"profile/resized/default.jpg";
    }

    addDefaultSrcImg(ev){
        ev.target.src =  "https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=Image+Error"
    }



    render(){
        const {items, editData, file, itemsProject} = this.state;
        return(
            <>
                <style>{`.control-label{top: unset;}`}</style>
                <div className="col-md-9">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong>Questionaire Free Text</strong> administration 
                        </div>
                        <div className="clearfix">
                            <div className="panel-body">
                                <a  className="fa-pull-right btn btn-default" label="Back to overview" data-ui-loader="" href={AllRoute.adminQuestionnaire} >
                                    <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>        
                                    <h4 className="pull-left"></h4>
                            </div>
                        </div>
                        <div className="panel-body">
                            <form id="czfrom"  encType="multipart/form-data" acceptCharset="UTF-8" style={{display: "block"}} onSubmit={this.submit}   method="post" >
                            <div className="tab-content">
                                <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                
                                        <Tabs
                                        id="controlled-tab-example"
                                        activeKey='edit'
                                        >
                                            <Tab eventKey="edit" 
                                                title={this.state.editData ? 'Edit : '+items.question: 'New Data' }  >
                                            </Tab>
                                            
                                        </Tabs> 
                                    
                                    <div className="form-group field-usereditform-email required">
                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Project Title <span style={{color:"#ff0404"}}>(*) </span></label>
                                        <input type="text" id="usereditform-email" style={{width:"100%"}} className="form-control" name="name" value={itemsProject.title} disabled required aria-required="true" aria-invalid="false"/>

                                        <div className="help-block"></div>
                                    </div>
                                    <div className="form-group field-usereditform-email required">
                                        <label className="control-label" htmlFor="usereditform-question">&nbsp;Question <span style={{color:"#ff0404"}}>(* max : 200 characters) </span></label>
                                        <input type="text" id="usereditform-question" style={{width:"75%"}} className="form-control" name="question" value={items.question}  maxLength="200"  onChange={this.handleInputChange}  required aria-required="true" aria-invalid="false"/>

                                        <div className="help-block"></div>
                                    </div>

                                    <div className="form-group field-usereditform-email required">
                                        <label className="control-label" htmlFor="usereditform-radio_option_1">&nbsp;Option Answer 1 <span style={{color:"#ff0404"}}>(* max : 50 characters) </span></label>
                                        <input type="text" id="usereditform-radio_option_1" style={{width:"50%"}} className="form-control" name="radio_option_1" value={items.radio_option_1} onChange={this.handleInputChange}  maxLength="50"   required aria-required="true" aria-invalid="false"/>

                                        <div className="help-block"></div>
                                    </div>

                                    <div className="form-group field-usereditform-email required">
                                        <label className="control-label" htmlFor="usereditform-radio_option_2">&nbsp;Option Answer 2 <span style={{color:"#ff0404"}}>(* max : 50 characters) </span></label>
                                        <input type="text" id="usereditform-radio_option_2" style={{width:"50%"}} className="form-control" name="radio_option_2" value={items.radio_option_2} onChange={this.handleInputChange}  maxLength="50" required aria-required="true" aria-invalid="false"/>

                                        <div className="help-block"></div>
                                    </div>
                                    
                                    
                                    <div className="form-group field-usereditform-email required">
                                    <label className="control-label">&nbsp;Status Active</label>
                                        <select id="status_active" style={{width:"150px"}} className="form-control" name="status_active" value={items.status_active} required onChange={this.chgSelect}>
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