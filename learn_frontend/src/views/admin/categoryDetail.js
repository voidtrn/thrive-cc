import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import { env, securityData, typePageMenuNCategory } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function CategoryDetail(props){
    
    const [loading, setLoading] = useState(true)
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])
    const [listMenu, setListMenu] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const file_path = env.userDocument
    const [displayCss, setDisplayCss] = useState('none')

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
            let response = await axiosLibrary.postData('awbCategory/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"category/"+response.data.data.category_image)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const getListMenu= useCallback(async() =>{
        const data = {
            platform_id: platform_id
        }
        
            let response = await axiosLibrary.postData('awbCategory/ListMenu',data);
            if(response.status === 200){
                setListMenu(response.data.data)              
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
                if ( displayCss.toLowerCase() == 'none'){
                    items.title_ind=null;
                    items.description=null;
                    items.description_ind=null;
                }
                fd.append("title", items.title);
                fd.append("title_ind", items.title_ind);
                // fd.append("menu_image", items.menu_image);
                fd.append("description", items.description);
                fd.append("description_ind", items.description_ind);
                fd.append("flag_active", items.flag_active);
                fd.append("user_account", user_account);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);
                fd.append("flag_type_page", items.flag_type_page);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("category_image", fileInput.current.files[0]);
                } 

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbCategory/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.category.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("menu_id", items.menu_id);
                    fd.append("user_created", user_id);
                    fd.append("sort_index", 0);
                    let responseJson = await axiosLibrary.postData("awbCategory/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.category.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbCategory/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.category.path)
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
        getListMenu()
        
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
                setDisplayCss('block')
                
        }
    }

    useEffect(()=>{
        seeAnotherField(items.menu_id)
    },[items.menu_id])

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-right btn btn-default" href={routeAdmin.category.path} label="Back to overview" data-ui-loader="">
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
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Section - Menu <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            {/* <input disabled name="hdnkey" value={items.section_id}/>    */}
                                            {
                                                editData?
                                                    <div>
                                                        <input type="hidden" id="menu_id" name="menu_id" value={items.menu_id}></input>
                                                        <input type="text" id="usereditform-email" style={{width:"300px"}} className="form-control" disabled
                                                            name="section_menu" value={items.section_menu} aria-required="true" aria-invalid="false" />
                                                    </div>
                                                :
                                                <select value={items.menu_id} required
                                                    onChange={handleInputChange.bind(this)} id="menu_id" name="menu_id" style={{width:"300px"}} className="form-control">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    {listMenu.map(
                                                        (itemMenu) =>
                                                        <option key={itemMenu.id} value={itemMenu.id}>{itemMenu.title}</option>
                                                    )
                                                    }
                                                </select>
                                            }
                                            
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Category <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                name="title" value={items.title} onChange={handleInputChange}  aria-required="true" aria-invalid="false" maxLength="50" />
                                            <ul className="file-upload-requirement">
                                                <li>
                                                max 50 of chars
                                                </li>
                                            </ul>
                                            <div className="help-block"></div>
                                        </div>

                                        <div id="seeanotherfield" style={{display:displayCss}}>
                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Category Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"350px"}} className="form-control"
                                                    name="title_ind" maxLength="50" value={items.title_ind} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                    max 50 of chars
                                                    </li>
                                                </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                    name="description" value={items.description} maxLength="250" onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                    max 250 of chars
                                                    </li>
                                                </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                    name="description_ind" value={items.description_ind} maxLength="250" onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                    max 250 of chars
                                                    </li>
                                                </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Home Preview <span style={{color:"#ff0404"}}>(*) </span>
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
                                                            Main Topic : image resolution 330 x 460 pixels<br/>
                                                            Function Topic : image resolution 265 x 200 pixels
                                                        </li>
                                                    </ul>
                                                </label>
                                                <br/>
                                                <input type="file"  
                                                        name="category_image" id="category_image" size="80" accept="image/jpg,image/png,image/jpeg,image/gif" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />
                                                <br/>
                                                <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                                <br/>
                                                <span className='badge badge-primary' id="upload-name" name="upload-name">{items.category_image===""? "images": items.category_image}</span>
                                                            
                                                <div className="help-block"></div>
                                            </div>

                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="1">active</option>
                                                <option value="0"> inactive</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Type Page</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_type_page} onChange={handleInputChange.bind(this)} required name="flag_type_page" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                {typePageMenuNCategory.map((v,idx)=>
                                                    <option value={v.id} key={idx}>{v.title}</option>
                                                )}
                                                {/* <option value="0">Default Page</option>
                                                <option value="1">Custom Page</option>
                                                <option value="2">Special Page</option>
                                                <option value="3">Menu Special</option>
                                                <option value="4">Skill For Future Page</option> */}
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

export default CategoryDetail;