import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

function WorkshopSharingCreateWorkshop(props){
    
    const [loading, setLoading] = useState(true)
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    
    const [items, setItems] = useState([])
    const [listCatMenu, setListCatMenu] = useState([])

    const [editData, setEditData] = useState(false)
    
    const fileInput = React.createRef()
    const fileInputPreview = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [filePreview, setFilePreview] = useState(null)
    const file_path = env.userDocument
    const [invalidImage, setInvalidImage] = useState(false)
    const [invalidImagePreview, setInvalidImagePreview] = useState(false)

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
            let response = await axiosLibrary.postData('awbWorkshopSharing/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"workshop/"+response.data.data.workshop_image)
                setFilePreview(file_path+"workshop/"+response.data.data.workshop_preview_image)
            }else{
                alert(response);
            }
        }else{
            setLoading(false)
        }
    })

    const getCategoryMenu = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbCategory/MenuSpecial',credentials);
        setListCatMenu(isi.data.data)
        setLoading(false)
    })

    const validateImage = (e) => {
        e.preventDefault();
        if(invalidImage){
            alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
            return false
        }else{
            if(invalidImagePreview){
                alert("ERROR IN THE UPLOAD IMAGE FOR MOBILE VIEW SECTION, PLEASE USE A VALID IMAGE");
                return false
            }else{
                submit();
                return true
            }
            
        }
    }

    const submit= async () =>{
        // e.preventDefault();
        
        const fd = new FormData();

        const IsFileAttached = fileInput.current.files.length > 0;
        const IsFileAttachedPreview = fileInputPreview.current.files.length > 0;

        if(IsFileAttached){
            fd.append("workshop_image", fileInput.current.files[0]);
        }

        if(IsFileAttachedPreview){
            fd.append("workshop_preview_image", fileInputPreview.current.files[0]);
        } 
        
        if(IsFileAttached && IsFileAttachedPreview){
            // fd.append("menu_image", items.menu_image);
            fd.append("category_id", items.category_id);
            fd.append("sub_category_type", items.sub_category_type);
            fd.append("title", items.title);
            fd.append("title_ind", items.title_ind);
            fd.append("description", items.description);
            fd.append("description_ind", items.description_ind);
            fd.append("hyperlink_url", items.hyperlink_url);
            fd.append("flag_active", items.flag_active);
            fd.append("capacity", items.capacity);
            fd.append("user_account", user_account);
            fd.append("user_modified", user_id);
            fd.append("platform_id", platform_id);

            if(editData){
                //for edit data
                fd.append("id", items.id);
                let responseJson = await axiosLibrary.postData("awbWorkshopSharing/UpdateData", fd);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN UPDATED");
                    handleBackToOverview()
                }else{
                    alert(responseJson);
                }
            } else {
                //for insert data
                fd.append("user_created", user_id);
                fd.append("article_id", 0);
                fd.append("tags", 0);
                fd.append("category_4", 0);
                let responseJson = await axiosLibrary.postData("awbWorkshopSharing/InsertData", fd);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN CREATED");
                    handleBackToOverview()
                }else{
                    alert(responseJson);
                }
            }
        }else{
            alert("IMAGES ARE MANDATORY")
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

    const onPageCreateLoad = () => {
        if(props.location.pathname === routeAdmin.workshopSharingWorkshopCreate.path){
            var catId = new URLSearchParams(props.location.search).get('cat')
            var subCatType = new URLSearchParams(props.location.search).get('tab')
            setItems(items=>({...items,category_id:catId, sub_category_type:subCatType}))
        }
    }

    useEffect(()=>{
        getDetail();
        // getListSectionMenu();
        // setLoading(false))
        onPageCreateLoad()
        getCategoryMenu()
    },[platform_id])

    const addDefaultSrc = (ev)=>{
        // ev.target.src =  file_path+"profile/resized/default.jpg";
        ev.target.src = "";
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

    const setStateImagePreview = (HtmlElement,stateFilePreview,invalidImagePreview) => {
        document.getElementById("upload-name-preview").innerHTML =  HtmlElement 

        setFilePreview(stateFilePreview)
        setInvalidImagePreview(invalidImagePreview)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;
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

    const ajaxFileUploadImagePreview=(upload_field_preview)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;
        var filename = upload_field_preview.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an image (png,jpg,jpeg,gif) or video (mp4)");
            upload_field_preview.target.form.reset();
            return 0;
        }
        var FileSize = upload_field_preview.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 1) {
            alert('File size exceeds 1 MB');
            upload_field_preview.target.form.reset();
            return 0;
        }

        setStateImagePreview(imagename + ' (' + formatSizeUnits(upload_field_preview.target.files[0].size) + ')',URL.createObjectURL(upload_field_preview.target.files[0]),false)

        if(upload_field_preview.target.files[0]!== undefined){
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setStateImagePreview(imagename + ' (' + formatSizeUnits(upload_field_preview.target.files[0].size) + ')',URL.createObjectURL(upload_field_preview.target.files[0]),false)
                }
                img.onerror = () => {
                    setStateImagePreview('Invalid image content',null,true)
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(upload_field_preview.target.files[0]);
        }
        
        return 1;       
    }

    const handleBackToOverview=()=>{
        var path=''
        if (items.sub_category_type === 'W'){
            path=routeAdmin.workshopSharingWorkshop.path
        }
        if (items.sub_category_type === 'S'){
            path=routeAdmin.workshopSharingSession.path
        }
        history.push({
            pathname: path,
            search: "?" + new URLSearchParams({cat: items.category_id}).toString()// your data array of objects
        })
    }

    return( 
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-end btn btn-default" onClick={handleBackToOverview} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                            <h4 className="float-start"></h4>
                    </div>
                </div>
                <LoadingAdmin loading={loading}/> 
                {/* <div className="panel-body" style={cssTarget(loading)}> */}
                <div className="panel-body" style={cssTarget(loading)}>
                    <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                
                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Menu - Category <span style={{color:"#ff0404"}}>(*)</span> </label>
                            
                            <select value={items.category_id} required
                                onChange={handleInputChange.bind(this)} id="category_id" name="category_id" style={{width:"100%"}} className="form-control">
                                <option value="null">-select one-</option>
                                {listCatMenu.map(
                                    (itemCatMenu) =>
                                    <option key={itemCatMenu.awb_trn_category_id} value={itemCatMenu.awb_trn_category_id}>
                                        {itemCatMenu.awb_mst_menu_title + ' > ' +itemCatMenu.awb_trn_category_title}
                                    </option>
                                )
                                }
                            </select>
                            
                            <div className="help-block"></div>
                        </div>

                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Title Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                            <input type="text" id="usereditform-email" style={{width:"350px"}} className="form-control"
                                name="title" maxLength="50" value={items.title} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                            <ul className="file-upload-requirement">
                                <li>
                                    max 50 of chars
                                </li>
                            </ul>
                            <div className="help-block"></div>
                        </div>

                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Title Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                            <input type="text" id="usereditform-email" style={{width:"350px"}} className="form-control"
                                name="title_ind" maxLength="50" value={items.title_ind} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                            <ul className="file-upload-requirement">
                                <li>
                                    max 50 of chars
                                </li>
                            </ul>
                            <div className="help-block"></div>
                        </div>

                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Short Description Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                name="description" maxLength="100" value={items.description} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                            <div className="help-block"></div>
                        </div>

                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Short Description Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                name="description_ind" maxLength="100" value={items.description_ind} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                            <div className="help-block"></div>
                        </div>

                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;URL <span style={{color:"#ff0404"}}>(*)</span></label>
                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                            <div className="help-block"></div>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Home Preview <span style={{color:"#ff0404"}}>(*) </span>
                                        <br/> 
                                        <ul className="file-upload-requirement-no">
                                            <li>
                                                one file only
                                            </li>
                                            <li>
                                                1 MB limit
                                            </li>
                                            <li>
                                                Allowed types for image : png jpg jpeg
                                            </li>
                                            <li>
                                                Main Topic : image resolution 330 x 460 pixels<br/>
                                                Function Topic : image resolution 265 x 200 pixels
                                            </li>
                                        </ul>
                                    </label>
                                    <br/>
                                    <input type="file"  
                                            name="workshop_image" id="workshop_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                            ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />
                                    <br/>
                                    <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                    <br/>
                                    <span className='badge bg-primary' id="upload-name" name="upload-name">{items.workshop_image}</span>
                                                
                                    <div className="help-block"></div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Article Preview <span style={{color:"#ff0404"}}>(*) </span>
                                        <br/> 
                                        <ul className="file-upload-requirement-no">
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
                                                image resolution 265 x 200 pixels
                                            </li>
                                        </ul>
                                    </label>
                                    <br/>
                                    <input type="file"  
                                            name="workshop_preview_image" id="workshop_preview_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                            ref={fileInputPreview} onChange={ajaxFileUploadImagePreview.bind(this)} />
                                    <br/>
                                    <img style={{width:"160px",height:"auto"}}  src={filePreview}    alt="" onError={addDefaultSrc} />

                                    <br/>
                                    <span className='badge bg-primary' id="upload-name-preview" name="upload-name-preview">{items.workshop_preview_image}</span>
                                                
                                    <div className="help-block"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Capacity User <span style={{color:"#ff0404"}}>(*)</span></label>
                            <input type="number" id="capacity" style={{width:"350px"}} className="form-control"
                                name="capacity" maxLength="50" value={items.capacity} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                            <div className="help-block"></div>
                        </div>

                        <div className="mb-3 field-profile-country">
                            <label className="form-label" htmlFor="profile-country">&nbsp;Status Active</label>
                            <select id="profile-country" style={{width:"200px"}} className="form-control" 
                                value={items.flag_active} onChange={handleInputChange} required name="flag_active" aria-invalid="false">
                                {editData ? null: <option value="">... Select this ...</option> }
                                <option value="1">active</option>
                                <option value="0">inactive</option>
                            </select>

                            <div className="help-block"></div>
                        </div>

                        <input type="hidden" name="hdnkey" value={items.id||''}/>    
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                        {/* {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}        */}

                    </form>
                    <hr/>
                </div>
            </div>
        </div>
    )
}

export default WorkshopSharingCreateWorkshop;