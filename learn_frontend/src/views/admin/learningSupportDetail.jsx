import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function LearningSupportDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [loading, setLoading] = useState(true)

    const routeAdmin = routeAll.routesAdmin

    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const file_path = env.userDocument
    const [invalidImage, setInvalidImage] = useState(false)

    const [initFlagStatus, setInitFlagStatus] = useState(1)
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbLearningSupport/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"learn_support/"+response.data.data.logo_image)
                setInitFlagStatus(response.data.data.flag_active)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const addDefaultSrc = (ev)=>{
        // ev.target.src =  file_path+"profile/resized/default.jpg";
        ev.target.src = "";
    }

    const validateImage = (e) => {
        // setLoading(true)
        e.preventDefault();
        if(validateForm()){
            if(invalidImage){
                alert("ERROR IN THE UPLOAD IMAGE FOR HOME PREVIEW SECTION, PLEASE USE A VALID IMAGE");
                return false
            }else{
                submit();
                return true
            }
        }else{
            return false
        }
    }

    const formatSizeUnits = (bytes) =>
    {

        if      (bytes>=1073741824) {bytes=(bytes/1073741824).toFixed(2)+' GB';}
        else if (bytes>=1048576)    {bytes=(bytes/1048576).toFixed(2)+' MB';}
        else if (bytes>=1024)       {bytes=(bytes/1024).toFixed(2)+' KB';}
        else if (bytes>1)           {bytes=bytes+' bytes';}
        else if (bytes===1)          {bytes=bytes+' byte';}
        else                        {bytes='0 byte';}
        return bytes;
    }

    const setStateImage = (HtmlElement,stateFile,invalidImage) => {
        document.getElementById("upload-name").innerHTML =  HtmlElement 

        setFile(stateFile)
        setInvalidImage(invalidImage)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        var filename = upload_field.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an image (png,jpg,jpeg,gif) or video (mp4)");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 4) {
            alert('File size exceeds 4 MB');
            upload_field.target.form.reset();
            return 0;
        }

        setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')',URL.createObjectURL(upload_field.target.files[0]),false)

        if(upload_field.target.files[0]!== undefined){
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')',URL.createObjectURL(upload_field.target.files[0]),false)
                }
                img.onerror = () => {
                    setStateImage('Invalid image content',null,true)
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(upload_field.target.files[0]);
        }
        
        return 1;       
    }

    const DeleteConfirm=  async ()=>{
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure to delete this data?")) 
        {
            setDeleteData(true)
            setCancelDelete(false)
        } 
        else
        {
            setCancelDelete(true)
        } 
    }

    const submit= async () =>{
        // e.preventDefault();
        if(!cancelDelete){
            if(!deleteData){
                const fd = new FormData();
                
                fd.append("title", items.title);
                // fd.append("title_ind", items.title_ind);
                if (items.hyperlink_url){
                    fd.append("hyperlink_url", items.hyperlink_url);
                }else{
                    fd.append("hyperlink_url", "");
                }
                
                fd.append("about_eng", items.about_eng);
                fd.append("about_ind", items.about_ind);
                fd.append("participant_eng", items.participant_eng);
                fd.append("participant_ind", items.participant_ind);
                fd.append("format_eng", items.format_eng);
                fd.append("format_ind", items.format_ind);
                fd.append("benefits_eng", items.benefits_eng);
                fd.append("benefits_ind", items.benefits_ind);
                fd.append("no_registration_flag", items.no_registration_flag);
                fd.append("free_flag", items.free_flag);
                fd.append("self_learn_flag", items.self_learn_flag);
                fd.append("no_pre_work_flag", items.no_pre_work_flag);
                fd.append("flag_active", items.flag_active);
                fd.append("user_account", user_account);

                fd.append("registration_eng", items.registration_eng);
                fd.append("registration_ind", items.registration_ind);
                fd.append("price_eng", items.price_eng);
                fd.append("price_ind", items.price_ind);
                fd.append("duration_eng", items.duration_eng);
                fd.append("duration_ind", items.duration_ind);
                fd.append("pre_work_eng", items.pre_work_eng);
                fd.append("pre_work_ind", items.pre_work_ind);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("logo_image", fileInput.current.files[0]);
                } 

                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                if(items.flag_active == '0'){
                    fd.append("sort_index", 999);
                }
                
                if(initFlagStatus == 0){
                    if(items.flag_active == 1){
                        fd.append("sort_index", 0);
                    }
                }

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbLearningSupport/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.learningSupport.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    if(items.flag_active == '1'){
                        fd.append("sort_index", 0);
                    }else{
                        fd.append("sort_index", 999);
                    }
                    let responseJson = await axiosLibrary.postData("awbLearningSupport/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.learningSupport.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbLearningSupport/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.learningSupport.path)
                }else{
                    alert(responseJson);
                }
            }
        }
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? (target.checked?1:0) : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;

        setItems(stateCopy)
    }

    useEffect(()=>{
        getDetail()
    },[Columns])

    const validateForm=()=>{

        // Put validation here
        return true;
    }

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-end btn btn-default" href={routeAdmin.learningSupport.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
                <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Title </label>
                                            <input type="text" id="usereditform-username" style={{width:"80%"}} className="form-control"
                                                name="title" value={items.title} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email ">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;URL <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index" placeholder="http://www.google.co.id"
                                                name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;About this programme Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea id="about_eng" name="about_eng" rows="3" style={{width:"100%"}} className="form-control" required
                                                maxLength="1000" value={items.about_eng} onChange={handleInputChange}></textarea>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;About this programme Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea id="about_ind" name="about_ind" rows="3" style={{width:"100%"}} className="form-control" required
                                                maxLength="1000" value={items.about_ind} onChange={handleInputChange}></textarea>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3">
                                            <div className='row'>
                                                <div className="col-md-6">
                                                    <div className="mb-3 field-usereditform-email required">
                                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Target Participant Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                                        <textarea id="participant_eng" name="participant_eng" rows="2" style={{width:"100%"}} className="form-control" required
                                                            maxLength="100" value={items.participant_eng} onChange={handleInputChange}></textarea>
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3 field-usereditform-email required">
                                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Target Participant Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                        <textarea id="participant_ind" name="participant_ind" rows="2" style={{width:"100%"}} className="form-control" required
                                                            maxLength="100" value={items.participant_ind} onChange={handleInputChange}></textarea>
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <div className='row'>
                                                <div className="col-md-6">
                                                    <div className="mb-3 field-usereditform-username required">
                                                        <label className="control-label" htmlFor="usereditform-username">&nbsp;Format Eng </label>
                                                        <textarea id="format_eng" name="format_eng" rows="2" style={{width:"100%"}} className="form-control" required
                                                            maxLength="100" value={items.format_eng} onChange={handleInputChange}></textarea>
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="mb-3 field-usereditform-username required">
                                                        <label className="control-label" htmlFor="usereditform-username">&nbsp;Format Ind </label>
                                                        <textarea id="format_ind" name="format_ind" rows="2" style={{width:"100%"}} className="form-control" required
                                                            maxLength="100" value={items.format_ind} onChange={handleInputChange}></textarea>
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                       

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Benefits Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea id="benefits_eng" name="benefits_eng" rows="4" style={{width:"100%"}} className="form-control" required
                                                maxLength="2000" value={items.benefits_eng} onChange={handleInputChange}></textarea>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Benefits Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea id="benefits_ind" name="benefits_ind" rows="4" style={{width:"100%"}} className="form-control" required
                                                maxLength="2000" value={items.benefits_ind} onChange={handleInputChange}></textarea>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3">
                                            <fieldset className="border p-2">
                                                <legend className="w-auto" style={{fontSize:'1rem',float:'none'}}>
                                                    <input type="checkbox" name="no_registration_flag" value="1" 
                                                        checked={items.no_registration_flag? true:false} onChange={handleInputChange}
                                                        />
                                                    <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;Show Registration</label>
                                                </legend>

                                                <div className='row'>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Registration Descr Eng </label>
                                                            <textarea id="registration_eng" name="registration_eng" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.registration_eng} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Registration Descr Ind </label>
                                                            <textarea id="registration_ind" name="registration_ind" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.registration_ind} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                            
                                        </div>

                                        <div className="mb-3">
                                            <fieldset className="border p-2">
                                                <legend className="w-auto" style={{fontSize:'1rem',float:'none'}}>
                                                    <input type="checkbox" name="free_flag" value="1" 
                                                        checked={items.free_flag? true:false} onChange={handleInputChange}
                                                    />
                                                    <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;Show Price</label>
                                                </legend>

                                                <div className='row'>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Price Descr Eng </label>
                                                            <textarea id="price_eng" name="price_eng" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.price_eng} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Price Descr Ind </label>
                                                            <textarea id="price_ind" name="price_ind" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.price_ind} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                            
                                        </div>

                                        <div className="mb-3">
                                            <fieldset className="border p-2">
                                                <legend className="w-auto" style={{fontSize:'1rem',float:'none'}}>
                                                    <input type="checkbox" name="self_learn_flag" value="1" 
                                                        checked={items.self_learn_flag? true:false} onChange={handleInputChange}
                                                    />
                                                    <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;Show Duration</label>
                                                </legend>

                                                <div className='row'>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Duration Descr Eng </label>
                                                            <textarea id="duration_eng" name="duration_eng" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.duration_eng} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Duration Descr Ind </label>
                                                            <textarea id="duration_ind" name="duration_ind" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.duration_ind} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                            
                                        </div>

                                        <div className="mb-3">
                                            <fieldset className="border p-2">
                                                <legend className="w-auto" style={{fontSize:'1rem',float:'none'}}>
                                                    <input type="checkbox" name="no_pre_work_flag" value="1" 
                                                        checked={items.no_pre_work_flag? true:false} onChange={handleInputChange}
                                                    />
                                                    <label className="control-label" style={{display:"inline",fontWeight:"normal"}} forHtml="usereditform-email">&nbsp;Show Pre-work</label>
                                                </legend>

                                                <div className='row'>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Pre-Work Descr Eng </label>
                                                            <textarea id="pre_work_eng" name="pre_work_eng" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.pre_work_eng} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3 field-usereditform-username required">
                                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Work Descr Ind </label>
                                                            <textarea id="pre_work_ind" name="pre_work_ind" rows="2" style={{width:"100%"}} className="form-control" required
                                                                maxLength="100" value={items.pre_work_ind} onChange={handleInputChange}></textarea>
                                                            <div className="help-block"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </fieldset>
                                            
                                        </div>

                                        <br/>
                                        <div className="mb-3">
                                            <div className="mb-3 field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Logo <span style={{color:"#ff0404"}}>(*) </span>
                                                    <br/> 
                                                    <ul className="file-upload-requirement">
                                                        <li>
                                                            one file only
                                                        </li>
                                                        <li>
                                                            1 MB limit
                                                        </li>
                                                        <li>
                                                            Allowed types for image : png jpg jpeg
                                                        </li>
                                                        
                                                    </ul>
                                                </label>
                                                <br/>
                                                <input type="file"  
                                                        name="logo_image" id="logo_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                                        ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />
                                                <br/>
                                                <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                                <br/>
                                                <span className='badge bg-primary' id="upload-name" name="upload-name">{items.logo_image}</span>
                                                            
                                                <div className="help-block"></div>
                                            </div>
                                        </div>

                                        <div className="mb-3 field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="1">active</option>
                                                <option value="0"> inactive</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>


                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>

                    <input type="hidden" name="hdnkey" value={items.id||''}/>    
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                    {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default LearningSupportDetail;