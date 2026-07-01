import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function SliderCategoryDetail(props){
    
    const [loading, setLoading] = useState(true)
    const [buttonLoading, setButtonLoading] = useState(false)
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = ""
    
    const [items, setItems] = useState([])
    const [itemsCategory, setItemsCategory] = useState([])
    const [listSectionMenu, setListSectionMenu] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)

    const fileInput = React.createRef()
    // const fileInputMobile = React.createRef()
    // const reader = new FileReader()
    const [file, setFile] = useState(null)
    // const [fileMobile, setFileMobile] = useState(null)
    const file_path = env.userDocument
    const [invalidImage, setInvalidImage] = useState(false)
    // const [invalidImageMobile, setInvalidImageMobile] = useState(false)

    const [totalActiveData, setTotalActiveData] = useState(0)

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
            let response = await axiosLibrary.postData('awbSliderCustomPage/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"slider_custom_page/"+response.data.data.slider_video)
                // setFileMobile(file_path+"slider_category/"+response.data.data.slider_video_mobile)
                getCategoryData(response.data.data.category_id)
            }else{
                alert(response);
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const getCategoryData= useCallback(async(categoryIdParam) =>{
        const data = {
            md5ID: await axiosLibrary.getmd5FromBackend(categoryIdParam)
        }
        if(data.md5ID!== null){
            let response = await axiosLibrary.postData('awbCategory/SelectData',data);
            if(response.status === 200){
                setItemsCategory(response.data.data)
            }else{
                alert(response);
            }
        }
        setLoading(false)
    })

    const getListSectionMenu= useCallback(async() =>{
        const data = {
            platform_id: platform_id,
            type:1
        }
        
            let response = await axiosLibrary.postData('awbSubCategory/ListSectionMenu',data);
            if(response.status === 200){
                setListSectionMenu(response.data.data)              
            }else{
                alert(response);
            }

    },[platform_id])

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
            alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE/VIDEO");
            return false
        }else{
            // if(invalidImageMobile){
            //     alert("ERROR IN THE UPLOAD IMAGE FOR MOBILE VIEW SECTION, PLEASE USE A VALID IMAGE/VIDEO");
            //     return false
            // }else{
                submit();
                return true
            // }
            
        }
    }

    const submit= async () =>{
        // e.preventDefault();
        if(!cancelDelete){
            if(!deleteData){
                setButtonLoading(true)
                const fd = new FormData();
                
                fd.append("sort_index", items.sort_index);
                // fd.append("menu_image", items.menu_image);
                fd.append("headline", items.headline);
                fd.append("headline_ind", items.headline_ind);
                fd.append("short_description", items.short_description);
                fd.append("short_description_ind", items.short_description_ind);
                fd.append("hyperlink_url", items.hyperlink_url);
                // fd.append("article_id", items.article_id);
                fd.append("flag_active", items.flag_active);
                fd.append("user_account", user_account);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    const fileName = fileInput.current.files[0].name;
                    fd.append("file_type", fileName.split('.').pop());
                    fd.append("slider_video", fileInput.current.files[0]);
                } 

                // const IsFileAttachedMobile = fileInputMobile.current.files.length > 0;
                // if(IsFileAttachedMobile){
                //     fd.append("slider_video_mobile", fileInputMobile.current.files[0]);
                // } 

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbSliderCustomPage/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        setButtonLoading(false)
                        history.push(routeAdmin.customPageSliderCategory.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("category_id", items.category_id);
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbSliderCustomPage/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        setButtonLoading(false)
                        history.push(routeAdmin.customPageSliderCategory.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbSliderCustomPage/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.customPageSliderCategory.path)
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
        getDetail();
        getListSectionMenu();
        // setLoading(false))
    },[Columns])

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

    // const setStateImageMobile = (HtmlElement,stateFileMobile,invalidImageMobile) => {
    //     document.getElementById("upload-name-mobile").innerHTML =  HtmlElement 

    //     setFileMobile(stateFileMobile)
    //     setInvalidImageMobile(invalidImageMobile)
    // }

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

        // if(upload_field.target.files[0]!== undefined){
        //     reader.onload = (e) => {
        //         const img = new Image();
        //         img.onload = () => {
        //             setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')',URL.createObjectURL(upload_field.target.files[0]),false)
        //         }
        //         img.onerror = () => {
        //             setStateImage('Invalid image content',null,true)
        //         }
        //         img.src = e.target.result;
        //     }
        //     reader.readAsDataURL(upload_field.target.files[0]);
        // }
        
        return 1;       
    }

    // const ajaxFileUploadImageMobile=(upload_field_mobile)=>{
    //     var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;
    //     var filename = upload_field_mobile.target.value;
    //     var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
    //     if (filename.search(re_text) === -1) 
    //     {
    //         alert("File must be an image (png,jpg,jpeg,gif) or video (mp4)");
    //         upload_field_mobile.target.form.reset();
    //         return 0;
    //     }
    //     var FileSize = upload_field_mobile.target.files[0].size / 1024 / 1024; // in MB
    //     if (FileSize > 2) {
    //         alert('File size exceeds 2 MB');
    //         upload_field_mobile.target.form.reset();
    //         return 0;
    //     }

    //     setStateImageMobile(imagename + ' (' + formatSizeUnits(upload_field_mobile.target.files[0].size) + ')',URL.createObjectURL(upload_field_mobile.target.files[0]),false)

    //     // if(upload_field_mobile.target.files[0]!== undefined){
    //     //     reader.onload = (e) => {
    //     //         const img = new Image();
    //     //         img.onload = () => {
    //     //             setStateImageMobile(imagename + ' (' + formatSizeUnits(upload_field_mobile.target.files[0].size) + ')',URL.createObjectURL(upload_field_mobile.target.files[0]),false)
    //     //         }
    //     //         img.onerror = () => {
    //     //             setStateImageMobile('Invalid image content',null,true)
    //     //         }
    //     //         img.src = e.target.result;
    //     //     }
    //     //     reader.readAsDataURL(upload_field_mobile.target.files[0]);
    //     // }
        
    //     return 1;       
    // }

    const getTotalActive = useCallback(async (categoryIdParam) => {
        let md5CategoryId = await axiosLibrary.getmd5FromBackend(categoryIdParam)
        const credentials = {
            limit: 200,
            offset:0,
            category:"COUNT",
            categoryId:md5CategoryId,
            flag_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderCustomPage/ListData',credentials);
        setTotalActiveData(isi.data.data)
    })

    const changeSequence=(status)=>{
        if(status==0){
            setItems(items=>({
                ...items, 
                sort_index:999
            }))
        }else{
            getTotalActive(items.category_id)
        }
    }

    useEffect(()=>{
        setItems(items=>({
            ...items, 
            sort_index:totalActiveData+1
        }))
    },[totalActiveData])

    useEffect(()=>{
        if(!editData){
            changeSequence(1)
        }
    },[items.category_id])

    const changeFlagActive=(event)=>{
        handleInputChange(event)
        changeSequence(event.target.value)
    }

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-right btn btn-default" href={routeAdmin.customPageSliderCategory.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                        <h4 className="float-left"></h4>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            {/* <div className="panel-body" style={cssTarget(loading)}> */}
            <div className="panel-body" style={cssTarget(loading)}>
                <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.headline: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Section - Menu - Category <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            {/* <input disabled name="hdnkey" value={items.section_id}/>    */}
                                            {
                                                editData?
                                                    <div>
                                                        <input type="hidden" id="category_id" name="category_id" value={items.category_id}></input>
                                                        <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" disabled
                                                            name="section_menu" value={itemsCategory.section_title +' > ' + itemsCategory.section_menu + ' - ' + itemsCategory.title} 
                                                            aria-required="true" aria-invalid="false" />
                                                    </div>
                                                :
                                                <select value={items.category_id} required
                                                    onChange={handleInputChange.bind(this)} id="category_id" name="category_id" style={{width:"75%"}} className="form-control">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    {listSectionMenu.map(
                                                        (itemSectionMenu) =>
                                                        <option key={itemSectionMenu.id} value={itemSectionMenu.id}>
                                                            {itemSectionMenu.title_section +' > ' + itemSectionMenu.title_menu + ' > ' + itemSectionMenu.title_category}
                                                        </option>
                                                    )
                                                    }
                                                </select>
                                            }
                                            
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Sort Number</label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index"
                                                name="sort_index" value={items.sort_index} onChange={handleInputChange} readOnly required aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Headline Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index"
                                                name="headline" value={items.headline} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Headline Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index"
                                                name="headline_ind" value={items.headline_ind} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index"
                                                name="short_description" value={items.short_description} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index"
                                                name="short_description_ind" value={items.short_description_ind} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;URL <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index" placeholder="http://www.google.co.id"
                                                name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        {/* <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Article ID <span style={{color:"#ff0404"}}>{editData? '':'(*)'}</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"20%"}} className="form-control" 
                                                name="article_id" value={items.article_id} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div> */}
                                        
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;File Media (image / video) <span style={{color:"#ff0404"}}>(*)</span>
                                                <br/> 
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        one file only
                                                    </li>
                                                    <li>
                                                        4 MB limit
                                                    </li>
                                                    <li>
                                                        Allowed types for image : png jpg jpeg gif or video : mp4
                                                    </li>
                                                    <li>
                                                        Images larger than 1350 x 450 pixels will be resized.
                                                    </li>
                                                </ul>
                                            </label>
                                            <br/>
                                            <input type="file"  
                                                    name="slider_video" id="slider_video" size="40" accept="image/jpg,image/png,image/jpeg,image/gif,video/mp4"
                                                    ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />
                                            <br/>
                                            <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                            <br/>
                                            <span className='badge badge-primary' id="upload-name" name="upload-name">{items.slider_video}</span>
                                                        
                                            <div className="help-block"></div>
                                        </div>

                                        {/* <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;File Media (image / video) for Mobile View <span style={{color:"#ff0404"}}>(*) </span>
                                                <br/> 
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        one file only
                                                    </li>
                                                    <li>
                                                        2 MB limit
                                                    </li>
                                                    <li>
                                                        Allowed types for image : png jpg jpeg gif or video : mp4
                                                    </li>
                                                    <li>
                                                        Images larger than 768 x 411 pixels will be resized.
                                                    </li>
                                                </ul>
                                            </label>
                                            <br/>
                                            <input type="file"  
                                                    name="slider_video_mobile" id="slider_video_mobile" size="40" accept="image/jpg,image/png,image/jpeg,image/gif,video/mp4"
                                                    ref={fileInputMobile} onChange={ajaxFileUploadImageMobile.bind(this)} />
                                            <br/>
                                            <img style={{width:"160px",height:"auto"}}  src={fileMobile}    alt="" onError={addDefaultSrc} />

                                            <br/>
                                            <span className='badge badge-primary' id="upload-name-mobile" name="upload-name-mobile">{items.slider_video_mobile}</span>
                                                        
                                            <div className="help-block"></div>
                                        </div> */}

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={changeFlagActive.bind(this)} required name="flag_active" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="1">active</option>
                                                <option value="0">inactive</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>


                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>

                    <input type="hidden" name="hdnkey" value={items.id||''}/>    
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save" disabled={buttonLoading}>{buttonLoading?'Please wait':'Save'}</button>&nbsp;
                    {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default SliderCategoryDetail;