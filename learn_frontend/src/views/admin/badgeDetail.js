import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import BadgeMember from './badgeMember';

function BadgeDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const file_path = env.userDocument
    const [loading, setLoading] = useState(true)

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
            let response = await axiosLibrary.postData('awbBadge/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"badge/"+response.data.data.badge_image)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

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
                fd.append("short_descr", items.short_descr);
                fd.append("title_ind", items.title_ind);
                fd.append("short_descr_ind", items.short_descr_ind);
                fd.append("flag_publish", items.flag_publish);
                fd.append("flag_active", items.flag_active);

                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);
                fd.append("user_account", user_account);
                fd.append("user_id", user_id);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("badge_image", fileInput.current.files[0]);
                } 

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbBadge/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.badge.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    fd.append("category", items.category);
                    let responseJson = await axiosLibrary.postData("awbBadge/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.badge.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbBadge/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.badge.path)
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

    useEffect(()=>{
        if (!editData){
            setItems(items =>({...items, category:'Custom'}))
        }
    },[editData])

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
                    <a className="float-right btn btn-default" href={routeAdmin.badge.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
            {/* <div className="panel-body"> */}
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-main tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                    {items.category==='Custom'?
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">Member</Nav.Link>
                                        </Nav.Item>
                                    :''
                                    }
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Category </label>
                                                <input type="text" disabled id="usereditform-email" style={{width:"30%"}} className="form-control"
                                                    name="category" value={items.category} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Badge Name Eng<span style={{color:"#ff0404"}}>(*)</span> </label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                    name="title" value={items.title} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Badge Name Ind<span style={{color:"#ff0404"}}>(*)</span> </label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                    name="title_ind" value={items.title_ind} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Eng<span style={{color:"#ff0404"}}>(*)</span> </label>
                                                <textarea type="text" id="usereditform-email" style={{width:"75%",height:"100px"}} className="form-control" maxLength="500"
                                                    name="short_descr" value={items.short_descr} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Ind<span style={{color:"#ff0404"}}>(*)</span> </label>
                                                <textarea type="text" id="usereditform-email" style={{width:"75%",height:"100px"}} className="form-control" maxLength="500"
                                                    name="short_descr_ind" value={items.short_descr_ind} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;File Image <span style={{color:"#ff0404"}}>(*) </span>
                                                    <br/> 
                                                    <ul className="file-upload-requirement">
                                                        <li>
                                                            image file only (allowed extension : png jpg jpeg)
                                                        </li>
                                                        <li>
                                                            max of size : 1 MB
                                                        </li>
                                                        <li>
                                                            Required resolution : 200 x 200 pixels
                                                        </li>
                                                    </ul>
                                                </label>
                                                <br/>
                                                <input type="file"  
                                                        name="badge_image" id="badge_image" size="40" accept="image/jpg,image/png,image/jpeg" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)}  />
                                                <br/>
                                                <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                                <br/>
                                                <span className='badge badge-primary' id="upload-name" name="upload-name">{items.reward_image===""? "images": items.badge_image}</span>
                                                            
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-profile-country">
                                                <label className="control-label" htmlFor="profile-country">&nbsp;Flag Publish</label>
                                                <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                    value={items.flag_publish} onChange={handleInputChange.bind(this)} required name="flag_publish" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="1">yes</option>
                                                    <option value="0">no</option>
                                                </select>

                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-profile-country">
                                                <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                                <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                    value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="1">active</option>
                                                    <option value="0">inactive</option>
                                                </select>

                                                <div className="help-block"></div>
                                            </div>

                                            {/* <input type="hidden" name="hdnkey" value={items.id||''}/>     */}
                                            <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                                            {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}    
                                        </form>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="#tab-1">
                                        <BadgeMember badge_id={items.id} image_file={file} badge_title={items.title} />
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>   
                
        </div>
        </div>
    </div>
    )
}

export default BadgeDetail;