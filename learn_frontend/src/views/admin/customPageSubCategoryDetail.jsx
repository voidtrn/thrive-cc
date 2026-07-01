import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function SubCategoryDetail(props){
    
    const [loading, setLoading] = useState(true)
    const [buttonLoading, setButtonLoading] = useState(false)
    const history = useHistory()
    const fileInput = React.createRef()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [file, setFile] = useState(null)
    const file_path = env.userDocument
    const [invalidImage, setInvalidImage] = useState(false)

    const [items, setItems] = useState([])
    const [listSectionMenu, setListSectionMenu] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [displayCss, setDisplayCss] = useState('none')

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()


    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbSubCategory/SelectData',data);
            if(response.status === 200){
                setFile(file_path+"sub_category/"+response.data.data.category_image)
                setItems(response.data.data)
                setLoading(false)
                console.log("response:", response)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

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
            submit();
            return true
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
        
        return 1;       
    }

    const addDefaultSrc = (ev)=>{
        // ev.target.src =  file_path+"profile/resized/default.jpg";
        ev.target.src = "";
    }

    const submit= async () =>{
        if(!cancelDelete){
            if(!deleteData){
                setButtonLoading(true)
                const fd = new FormData();
                
                fd.append("title", items.title);
                fd.append("title_ind", items.title_ind);
                fd.append("description", items.description);
                fd.append("description_ind", items.description_ind);
                fd.append("flag_active", items.flag_active);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);
                fd.append("background_color", items.background_color);
                fd.append("typePage", "custom_page");

                fd.append("action_type", items.action_type);
                fd.append("action_link", (items.action_type == "link" ? items.action_link : ""));
                fd.append("custom_style", items.custom_style);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("category_image", fileInput.current.files[0]);
                }

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbSubCategory/UpdateData", fd);
                    if(responseJson.status === 200){
                        setButtonLoading(false)
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.customPageSubCategory.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("category_id", items.category_id);
                    fd.append("user_created", user_id);
                    fd.append("sort_index", 0);
                    let responseJson = await axiosLibrary.postData("awbSubCategory/InsertData", fd);
                    if(responseJson.status === 200){
                        setButtonLoading(false)
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.customPageSubCategory.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbSubCategory/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.customPageSubCategory.path)
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
        console.log("stateCopy", stateCopy)
        setItems(stateCopy)
    }

    useEffect(()=>{
        getDetail();
        getListSectionMenu();
        // setLoading(false))
        
    },[Columns])

    useEffect(()=>{
        new window.lc_color_picker('.mb-3 input[class="form-control pickerColor"]',{
            modes:['solid'],
            wrap_width:'100%',
            on_change:function(new_value, target_field) {
                var stateCopy = Object.assign({}, items);
                stateCopy[target_field.name] = new_value
                setItems(stateCopy)
            },
            preview_style : { 
                input_padding   : 50, // extra px padding eventually added to the target input to not cover text
                side            : 'right', // right or left
                width           : 100,
                separator_color : '#fff', // (string) CSS color applird to preview element as separator
            },
        })
    },[items])

    const seeAnotherField=(value) => {
        value = value+''
        switch(value) {
            case '27':
            //execute code block 1
                setDisplayCss('block')
                break;
            case '34':
            //execute code block 2
                setDisplayCss('block')
                break;
            case '35':
            //execute code block 2
                setDisplayCss('block')
                break;
            default:
            // code to be executed if n is different from case 1 and 2
                setDisplayCss('none')
                
        }
    }

    useEffect(()=>{
        seeAnotherField(items.category_id)
    },[items.category_id])

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-end btn btn-default" href={routeAdmin.customPageSubCategory.path} label="Back to overview" data-ui-loader="">
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
                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Section - Menu - Category <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            {/* <input disabled name="hdnkey" value={items.section_id}/>    */}
                                            {
                                                editData?
                                                    <div>
                                                        <input type="hidden" id="category_id" name="category_id" value={items.category_id}></input>
                                                        <input type="text" id="usereditform-email" style={{width:"600px"}} className="form-control" disabled
                                                            name="section_menu" value={items.title_section +' > ' + items.title_menu + ' > ' + items.title_category} 
                                                            aria-required="true" aria-invalid="false" />
                                                    </div>
                                                :
                                                <select value={items.category_id} required
                                                    onChange={handleInputChange.bind(this)} id="category_id" name="category_id" style={{width:"600px"}} className="form-control">
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

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Sub Category Title EN <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                name="title" value={items.title} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Sub Category Title ID <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                name="title_ind" value={items.title_ind} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Sub Category Description EN <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                name="description" value={items.description} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Sub Category Description ID <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                name="description_ind" value={items.description_ind} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-profile-country">
                                            <label className="form-label" htmlFor="profile-country">&nbsp;Action Type</label>
                                            <div style={{display: 'flex'}}>
                                                <select id="profile-country" style={{width:"20%", marginRight:"2%"}} className="form-control" 
                                                    value={items.action_type} onChange={handleInputChange.bind(this)} required name="action_type" aria-invalid="false">

                                                    <option value="filter">Filter</option>
                                                    <option value="link">Link</option>
                                                    <option value="image">Image</option>
                                                </select>
                                                <input type="text" hidden={items.action_type == "link" ? false : true} id="usereditform-email" style={{width:"53%"}} className="form-control" placeholder='https://...'
                                                    name="action_link" value={items.action_link} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            </div>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;File Media (image / video) <span style={{color:"#ff0404"}}>(*) </span>
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
                                                        Images must have size 300px x 150px
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
                                            <span className='badge bg-primary' id="upload-name" name="upload-name">{items.category_image}</span>
                                                        
                                            <div className="help-block"></div>
                                        </div>
                                        
                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Background Color Card Sub Category<span style={{color:"#ff0404"}}>(*)</span></label>
                                            <div className="col-sm-6 ps-0">
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control pickerColor"
                                                name="background_color" value={items.background_color}  readOnly={true}/>
                                            </div>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email" hidden={true}>
                                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Styling (CSS Code)</label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                name="custom_style" value={items.custom_style} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div id="seeanotherfield" style={{display:displayCss}}>
                                            {/* reserve for later */}
                                        </div>

                                        <div className="mb-3 field-profile-country">
                                            <label className="form-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
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
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save" disabled={buttonLoading}>{buttonLoading?'Please Wait':'Save'}</button>&nbsp;
                    {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default SubCategoryDetail;