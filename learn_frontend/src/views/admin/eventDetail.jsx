import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function EventDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = ""
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const file_path = env.userDocument
    
    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbEvent/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"event/"+response.data.data.event_image)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[file_path,props.location.search])

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

    const validateImage = (e) => {
        e.preventDefault();
        if(invalidImage){
            alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
            return false
        }else{
            submit();
            return true
        }
    }

    const submit= async () =>{
        // e.preventDefault();
        if(!cancelDelete){
            if(!deleteData){
                const fd = new FormData();
                
                fd.append("event_title", items.event_title);
                fd.append("event_date", items.event_date);
                fd.append("event_status", items.event_status);
                fd.append("event_title_ind", items.event_title_ind);
                fd.append("event_date_ind", items.event_date_ind);
                fd.append("event_status_ind", items.event_status_ind);
                // fd.append("menu_image", items.menu_image);
                fd.append("flag_active", items.flag_active);
                fd.append("hyperlink_url", items.hyperlink_url);
                fd.append("user_account", user_account);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("event_image", fileInput.current.files[0]);
                } 

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbEvent/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.event.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbEvent/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.event.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbEvent/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.event.path)
                }else{
                    alert(responseJson);
                }
            }
        }
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    useEffect(()=>{
        getDetail()        
    },[Columns])

    const setStateImage = (HtmlElement,stateFile,invalidImage) => {
        document.getElementById("upload-name").innerHTML =  HtmlElement 

        setFile(stateFile)
        setInvalidImage(invalidImage)
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

    const addDefaultSrc = (ev)=>{
        // ev.target.src =  file_path+"profile/resized/default.jpg";
        ev.target.src = "";
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        var filename = upload_field.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an image");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 1) {
            alert('File size exceeds 1 MB');
            upload_field.target.form.reset();
            return 0;
        }

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

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-end btn btn-default" href={routeAdmin.event.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
            {/* <div className="panel-body"> */}
                <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.event_title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Event Title Eng <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                name="event_title" aria-required="true" aria-invalid="false" value={items.event_title} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Event Title Ind <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                name="event_title_ind" aria-required="true" aria-invalid="false" value={items.event_title_ind} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Event Date Eng <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                name="event_date" aria-required="true" aria-invalid="false" value={items.event_date} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Event Date Ind <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                name="event_date_ind" aria-required="true" aria-invalid="false" value={items.event_date_ind} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Event Status Eng <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                name="event_status" aria-required="true" aria-invalid="false" value={items.event_status} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Event Status Ind <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                name="event_status_ind" aria-required="true" aria-invalid="false" value={items.event_status_ind} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;URL </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" placeholder="http://www.google.co.id"
                                                name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Preview Image <span style={{color:"#ff0404"}}>(*) </span>
                                                <br/> 
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        one file only
                                                    </li>
                                                    <li>
                                                        1 MB limit
                                                    </li>
                                                    <li>
                                                        Allowed types : png jpg jpeg
                                                    </li>
                                                    <li>
                                                        Image resolution 310 x 350 pixels<br/>
                                                    </li>
                                                </ul>
                                            </label>
                                            <br/>
                                            <input type="file"  
                                                    name="event_image" id="event_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)}  />
                                            <br/>
                                            <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                            <br/>
                                            <span className='badge bg-primary' id="upload-name" name="upload-name">{items.event_image===""? "images": items.event_image}</span>
                                                        
                                            <div className="help-block"></div>
                                        </div>
                                        
                                        <div className="mb-3 field-profile-country">
                                            <label className="form-label" htmlFor="profile-country">&nbsp;Status Active</label>
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

export default EventDetail;