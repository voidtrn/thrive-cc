import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { useNavigate } from 'react-router';

function QnaDetail(props){
    const history = useNavigate()
    const routeAdmin = routeAll.routesAdmin
    const file_path = env.userDocument
    const fileInput = React.createRef()
    const reader = new FileReader()
    const nameType = new URLSearchParams(props.location.search).get('type')

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
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('dialogueQna/SelectData',data);
            
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"qna/"+response.data.data.qna_image)
            }else{
                alert(response);
            }
        }
    },[file_path,props.location.search])

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
        if (FileSize > 0.5) {
            alert('File size exceeds 500 KB');
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
                    fd.append("question", items.question);
                    fd.append("question_sec", items.question_sec);
                    fd.append("answer", items.answer);
                    fd.append("answer_sec", items.answer_sec);
                    fd.append("answered_by", items.answered_by)
                    fd.append("status_active", items.status_active); 
                    fd.append("user_modified", user_id);
                    fd.append("user_account", user_account)
                    fd.append("platform_id", platform_id);

                    const IsFileAttached = fileInput.current.files.length > 0;
                    if(IsFileAttached){
                        fd.append("qna_file", fileInput.current.files[0]);
                    } 

                    if(editData){
                        //for edit data
                        fd.append("id",items.id);
                        let responseJson = await axiosLibrary.postData("dialogueQna/UpdateData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN UPDATED");
                            history(routeAdmin.qna.path)
                        }else{
                            alert(responseJson);
                        }
                    }else{
                        //for insert data
                        fd.append("user_created", user_id);
                        let responseJson = await axiosLibrary.postData("dialogueQna/InsertData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN CREATED");
                            history(routeAdmin.qna.path)
                        }else{
                            alert(responseJson);
                        }
                    }
                }else{
                    //for delete data
                    const parameter = {
                        id:items.id
                    }
                    let responseJson = await axiosLibrary.postData("dialogueQna/DeleteData", parameter);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN DELETED");
                        history(routeAdmin.qna.path)
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
                        <a className="float-end btn btn-default" href={routeAdmin.qna.path} label="Back to overview" data-ui-loader="">
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
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Question (Primary) <span style={{color:"#ff0404"}}>(*) max 5000 chars</span></label>
                                    <textarea id="usereditform-email" style={{width:"100%",height:150}} maxLength="5000" className="form-control" name="question" value={items.question||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Question (Secondary) <span style={{color:"#ff0404"}}>(*) max 5000 chars</span></label>
                                    <textarea id="usereditform-email" style={{width:"100%",height:150}} maxLength="5000" className="form-control" name="question_sec" value={items.question_sec||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Answer (Primary) <span style={{color:"#ff0404"}}>(*) max 5000 chars</span></label>
                                    <textarea id="usereditform-email" style={{width:"100%",height:150}} maxLength="5000" className="form-control" name="answer" value={items.answer||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Answer (Secondary) <span style={{color:"#ff0404"}}>(*) max 5000 chars</span></label>
                                    <textarea id="usereditform-email" style={{width:"100%",height:150}} maxLength="5000" className="form-control" name="answer_sec" value={items.answer_sec||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Answered By <span style={{color:"#ff0404"}}>(*) </span></label>
                                    <input type="text" id="usereditform-email" style={{width:"40%"}} maxLength="200" className="form-control" name="answered_by" value={items.answered_by||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false"/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Profile Image <span style={{color:"#ff0404"}}>(*) max upload file size : 500 KB, image resolution : (200 px * 200 px)</span></label>
                                    <input type="file"  
                                            name="fup_image" id="fup_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} required={editData===false?true:false} />
                                    <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />
                                <br/>
                                <span className='label label-primary' id="upload-name" name="upload-name"> {items.qna_image===""? "images": items.qna_image} </span>
                                    
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

export default QnaDetail;