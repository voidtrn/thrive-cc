import React, { useCallback, useEffect, useState, useRef } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { useNavigate, useLocation } from 'react-router';

function GalleryDetail(props){
    const location = useLocation()
    const history = useNavigate()
    const routeAdmin = routeAll.routesAdmin
    const file_path = env.userDocument
    const fileInput = useRef(null)
    const reader = new FileReader()
    const nameType = new URLSearchParams(location.search).get('type')

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [items, setItems] = useState([])
    const [file, setFile] = useState(null)
    const [user_id, setUser_id] = useState("")
    const [user_account, setUser_account] = useState("")
    const [invalidImage, setInvalidImage] = useState(false)
    // const platform_id = securityData.Security_getPlatformId()||''
    const platform_id = securityData.Security_getPlatformId()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('dialogueGallery/SelectData',data);
            
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"gallery/"+response.data.data.gallery_image)
            }else{
                alert(response);
            }
        }
    },[file_path,location.search])

    const getUserId = useCallback(() => {
        var dataUser = axiosLibrary.getUserInfo();
        setUser_id(dataUser.id)
        setUser_account(dataUser.account)
        getDetail()
    },[getDetail])

    useEffect(()=>{
        getUserId()
    },[getUserId])

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

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
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
            if(!cancelDelete){
                if(!deleteData){

                    const fd = new FormData();
                    fd.append("title", items.title);
                    fd.append("status_active", items.status_active);
                    fd.append("user_modified", user_id);
                    fd.append("platform_id", platform_id);
                    fd.append("user_account", user_account)

                    const IsFileAttached = fileInput.current.files.length > 0;
                    if(IsFileAttached){
                        fd.append("gallery_file", fileInput.current.files[0]);
                    } 

                    if(editData){
                        //for edit data
                        fd.append("id",items.id);
                        let responseJson = await axiosLibrary.postData("dialogueGallery/UpdateData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN UPDATED");
                            history(routeAdmin.gallery.path)
                        }else{
                            alert(responseJson);
                        }
                    }else{
                        //for insert data
                        fd.append("user_created", user_id);
                        let responseJson = await axiosLibrary.postData("dialogueGallery/InsertData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN CREATED");
                            history(routeAdmin.gallery.path)
                        }else{
                            alert(responseJson);
                        }
                    }
                }else{
                    //for delete data
                    const parameter = {
                        id:items.id
                    }
                    let responseJson = await axiosLibrary.postData("dialogueGallery/DeleteData", parameter);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN DELETED");
                        history(routeAdmin.gallery.path)
                    }else{
                        alert(responseJson);
                    }
                }
            }
            setCancelDelete(false)
    }

    const addDefaultSrc = (ev)=>{
        ev.target.src =  file_path+"profile/resized/default.jpg";
    }
    return(
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-end btn btn-default" href={routeAdmin.gallery.path} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                    </div>
                </div>
                <div className="panel-body">
                    <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                        <ul id="profile-tabs" className="nav nav-tabs" data-tabs="tabs">
                            <li className="active">
                                <a href="#tab-0" data-toggle="tab" aria-expanded="true">{editData ? 'Edit : '+nameType: 'New Data' }</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Caption <span style={{color:"#ff0404"}}>(*) </span></label>
                                    <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="title" value={items.title||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Image <span style={{color:"#ff0404"}}>(*) max upload file size : 1 MB, image resolution : (760 px * 350 px)</span></label>
                                    <input type="file"  
                                            name="fup_image" id="fup_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} required={editData===false?true:false} />
                                    <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />
                                <br/>
                                <span className='label label-primary' id="upload-name" name="upload-name"> {items.gallery_image===""? "images": items.gallery_image} </span>
                                    
                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-profile-country">
                                        <label className="form-label">&nbsp;Status Active</label>
                                        <select id="profile-country" style={{width:"150px"}} className="form-control" name="status_active"  value={items.status_active||''} onChange={handleInputChange.bind(this)} required>
                                            {editData ? null: <option value="">... Select this ...</option> }
                                            <option value="0">inactive</option>
                                            <option value="1">active</option>
                                        </select>

                                        <div className="help-block"></div>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" name="hdnkey" value={items.id||''}/>    
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                        {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                    </form>
                </div>
            </div>
        </div>
    )
}

export default GalleryDetail;