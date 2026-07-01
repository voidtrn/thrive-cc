import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';
import {durationPicker} from './shared/durationPicker';
import { ButtonSubmitAdmin } from '../../components/buttonSubmitAdmin';

function CourseDetail(props){
    
    const [durationArray, setDurationArray] = useState([])

    const [loading, setLoading] = useState(true)
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    
    const [items, setItems] = useState([])
    const [listCatMenu, setListCatMenu] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    
    const fileInput = React.createRef()
    const fileInputCourse = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [fileCourse, setFileCourse] = useState(null)
    const file_path = env.userDocument
    const [invalidImage, setInvalidImage] = useState(false)
    const [invalidImageCourse, setInvalidImageCourse] = useState(false)
    const [loadingButton, setLoadingButton] = useState(false);

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()

    // const [contentTypeItems, setContentTypeItems] = useState([])

    // const getContentType = useCallback(async () => {
    //     setLoading(true)
    //     const credentials = {
    //         limit: 9999,
    //         offset:0,
    //         category:"",
    //         flag_active:1,
    //         table_name:'awb_mst_course',
    //         platform_id:platform_id
    //     };

    //     let isi = await axiosLibrary.postData('awbContentType/ListData',credentials);
    //     setContentTypeItems(isi.data.data)
    // },[platform_id])

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbCourse/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"course/"+response.data.data.home_image)
                setFileCourse(file_path+"course/"+response.data.data.course_image)
                setDurationArray(durationPicker.setDurationPicker(response.data.data.duration_amt,false))
            }else{
                alert(response);
            }
        }else{
            setDefaultValue()
            setDurationArray(durationPicker.setDurationPicker(0,false))
            setLoading(false)
        }
    })

    const getCategoryMenu = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbCourse/ListCategory',credentials);
        let filteredList = isi.data.data
        // .filter(
        //     x =>
        //     (x.title.toLocaleLowerCase().includes('skill for future') ||
        //     x.title.toLocaleLowerCase().includes('skills for future'))
        //     )
        setListCatMenu(filteredList)
        setLoading(false)
    })

    const validateImage = (e) => {
        setLoadingButton(true)
        e.preventDefault();
        if(validateForm()){
            if(invalidImage){
                alert("ERROR IN THE UPLOAD IMAGE FOR HOME PREVIEW SECTION, PLEASE USE A VALID IMAGE");
                setLoadingButton(false)
                return false
            }else{
                if(invalidImageCourse){
                    alert("ERROR IN THE UPLOAD IMAGE FOR COURSE PREVIEW SECTION, PLEASE USE A VALID IMAGE");
                    setLoadingButton(false)
                    return false
                }else{
                    submit();
                    return true
                }
                
            }
        }else{
            setLoadingButton(false)
            return false
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
                
                // fd.append("menu_image", items.menu_image);
                fd.append("category_id", items.category_id);
                fd.append("article_id", items.article_id);
                fd.append("title", items.title);
                fd.append("title_ind", items.title_ind);
                fd.append("description", items.description);
                fd.append("description_ind", items.description_ind);
                fd.append("hyperlink_url", items.hyperlink_url);
                fd.append("flag_active", items.flag_active);
                fd.append("course_type", items.course_type);
                fd.append("language_avail", items.language_avail);
                fd.append("group_yos", items.group_yos);
                fd.append("group_grade", items.group_grade);
                fd.append("enroll_from", items.enroll_from);
                fd.append("enroll_to", items.enroll_to);
                fd.append("close_date", items.close_date);
                fd.append("price_type", items.price_type);
                fd.append("price_amt", items.price_amt);
                fd.append("provider", items.provider);
                fd.append("duration_amt", items.duration_amt);
                fd.append("user_account", user_account);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);
                fd.append("user_id", user_id);
                // fd.append("content_type_id", items.content_type_id);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("home_image", fileInput.current.files[0]);
                } 

                const IsFileAttachedCourse = fileInputCourse.current.files.length > 0;
                if(IsFileAttachedCourse){
                    fd.append("course_image", fileInputCourse.current.files[0]);
                } 

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbCourse/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.course.path)
                    }else{
                        alert(responseJson);
                        setLoadingButton(false)
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbCourse/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.course.path)
                    }else{
                        alert(responseJson);
                        setLoadingButton(false)
                    }
                }
        } else {
            //for delete data
            const parameter = {
                id:items.id
            }
            let responseJson = await axiosLibrary.postData("awbCourse/DeleteData", parameter);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN DELETED");
                history.push(routeAdmin.course.path)
            }else{
                alert(responseJson);
                setLoadingButton(false)
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
        // getContentType()
        getDetail()
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

    const setStateImageCourse = (HtmlElement,stateFileCourse,invalidImageCourse) => {
        document.getElementById("upload-name-course").innerHTML =  HtmlElement 

        setFileCourse(stateFileCourse)
        setInvalidImageCourse(invalidImageCourse)
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

    const ajaxFileUploadImageCourse=(upload_field_course)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;
        var filename = upload_field_course.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an image (png,jpg,jpeg,gif)");
            upload_field_course.target.form.reset();
            return 0;
        }
        var FileSize = upload_field_course.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 1) {
            alert('File size exceeds 1 MB');
            upload_field_course.target.form.reset();
            return 0;
        }

        setStateImageCourse(imagename + ' (' + formatSizeUnits(upload_field_course.target.files[0].size) + ')',URL.createObjectURL(upload_field_course.target.files[0]),false)

        if(upload_field_course.target.files[0]!== undefined){
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setStateImageCourse(imagename + ' (' + formatSizeUnits(upload_field_course.target.files[0].size) + ')',URL.createObjectURL(upload_field_course.target.files[0]),false)
                }
                img.onerror = () => {
                    setStateImageCourse('Invalid image content',null,true)
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(upload_field_course.target.files[0]);
        }
        
        return 1;       
    }

    const durPickerChange=(e)=>{    
        setDurationArray(durationArray =>({...durationArray,e}))
        const totalSeconds = durationPicker.getTotalSecondDuration(e)
        setItems(items => ({...items, duration_amt:totalSeconds}))
    }

    const setDefaultValue=()=>{
        setItems(items=>({
            ...items,
            course_type:'0',
            price_amt:0
        }))
    }

    useEffect(()=>{
        if (items.course_type === '0' || items.course_type === 0){
            setItems(items=>({
                ...items,
                price_type:'',
                price_amt:0
            }))
        }
    },[items.course_type])

    const validateForm=()=>{

        if(items.title === '' || items.title === null)
        {
            alert('Title Eng is mandatory');
            return false;
        }
        if(items.title_ind === '' || items.title_ind === null)
        {
            alert('Title Ind is mandatory');
            return false;
        }
        if(items.description === '' || items.description === null)
        {
            alert('Description Eng is mandatory');
            return false;
        }
        if(items.description_ind === '' || items.description_ind === null)
        {
            alert('Description Ind is mandatory');
            return false;
        }
        if(items.provider === '' || items.provider === null)
        {
            alert('Provider is mandatory');
            return false;
        }
        if(items.hyperlink_url === '' || items.hyperlink_url === null)
        {
            alert('URL is mandatory');
            return false;
        }
        if(items.price > 0 && (items.price_type==="" || items.price_type===null)
             && (items.course_type !=='0' || items.course_type !==0) )
        {
            alert('Currency is mandatory');
            return false;
        }

        if (file === null){
            alert("Home Preview is mandatory")
            return false;
        }

        if (fileCourse === null){
            alert("Course Preview is mandatory")
            return false;
        }

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
                        <a className="float-right btn btn-default" href={routeAdmin.course.path} label="Back to overview" data-ui-loader="">
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
                                            <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title: 'New Data' }</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Menu - Category <span style={{color:"#ff0404"}}>(*)</span> </label>
                                                
                                                <select value={items.category_id} required
                                                    onChange={handleInputChange.bind(this)} id="category_id" name="category_id" style={{width:"100%"}} className="form-control">
                                                    <option value="">-select one-</option>
                                                    {listCatMenu.map(
                                                        (itemCatMenu) =>
                                                        <option key={itemCatMenu.id} value={itemCatMenu.id}>
                                                            {itemCatMenu.title}
                                                        </option>
                                                    )
                                                    }
                                                </select>
                                                
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Title Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="title" style={{width:"50%"}} className="form-control"
                                                    name="title" maxLength="100" value={items.title} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        max 100 of chars
                                                    </li>
                                                </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Title Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="title_ind" style={{width:"50%"}} className="form-control"
                                                    name="title_ind" maxLength="100" value={items.title_ind} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        max 100 of chars
                                                    </li>
                                                </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Description Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <textarea id="descr" name="description" rows="2" style={{width:"100%"}} className="form-control" required
                                                    maxLength="255" value={items.description} onChange={handleInputChange}></textarea>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Description Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <textarea id="descr_ind" name="description_ind" rows="2" style={{width:"100%"}} className="form-control" required
                                                    maxLength="255" value={items.description_ind} onChange={handleInputChange}></textarea>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Provider <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="provider" style={{width:"50%"}} className="form-control"
                                                    name="provider" maxLength="50" value={items.provider} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;URL <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="hyperlink_url" style={{width:"75%"}} className="form-control"
                                                    name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange} required aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Article ID <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="article_id" style={{width:"75%"}} className="form-control"
                                                    name="article_id" value={items.article_id} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-profile-country">
                                                <label className="control-label" htmlFor="profile-country">&nbsp;Type</label>
                                                <select id="profile-country" style={{width:"25%"}} className="form-control" 
                                                    value={items.course_type} onChange={handleInputChange.bind(this)} required name="course_type" aria-invalid="false">
                                                    <option value="0">#AWB Online Content</option>
                                                    <option value="1">Online Short Course</option>
                                                    <option value="2">Online Executive Education</option>
                                                    <option value="3">Certification</option>
                                                </select>

                                                <div className="help-block"></div>
                                            </div>

                                            {items.course_type!=='0' && items.course_type!==0?
                                                <div className="form-group field-usereditform-email required" id="form-price">
                                                    <label className="control-label" htmlFor="usereditform-email">&nbsp;Price</label>
                                                    <br/>
                                                    <select id="price_type" style={{width:"20%",display:"inline"}} className="form-control" 
                                                        value={items.price_type} onChange={handleInputChange.bind(this)} name="price_type" aria-invalid="false">
                                                        {items.price_type!==null && items.price_type!=='' ? null: <option value="">Choose Currency</option> }
                                                        <option value="USD">USD</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="AUD">AUD</option>
                                                        <option value="IDR">IDR</option>
                                                    </select>{' '}
                                                    <input type="text" id="price" style={{width:"25%",display:"inline"}} className="form-control" name="price_amt" 
                                                        maxLength="200" value={items.price_amt} onChange={handleInputChange.bind(this)} aria-required="true" aria-invalid="false" />
                                                    
                                                    <div className="help-block"></div>
                                                </div>
                                            :''
                                            }
                                            
                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Estimate Completion</label>
                                                <input type="hidden" id="duration_amt" style={{width:"50%"}} className="form-control"
                                                    name="duration_amt" value={items.duration_amt} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                                <durationPicker.durationPickerUI durationArray={durationArray} onChange={(e)=>durPickerChange(e)}/>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Start Date and End Date</label>
                                                <br/>
                                                <input type="date" id="enroll_from" style={{width:"25%", display:"inline"}} className="form-control"
                                                    name="enroll_from" value={items.enroll_from} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                                {' '}
                                                <input type="date" id="enroll_to" style={{width:"25%", display:"inline"}} className="form-control"
                                                    name="enroll_to" value={items.enroll_to} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Registration Close Date</label>
                                                <input type="date" id="close_date" style={{width:"25%"}} className="form-control"
                                                    name="close_date" value={items.close_date} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            </div>

                                            <div className="form-group field-usereditform-email required" >
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Minimum Salary Group</label>
                                                <select id="group_grade" style={{width:"25%"}} className="form-control" required
                                                    value={items.group_grade} onChange={handleInputChange.bind(this)} name="group_grade" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="0">SG 01-09</option>
                                                    <option value="1">SG 10+</option>
                                                </select>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required" >
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Minimum Year of Service</label>
                                                <select id="group_yos" style={{width:"25%"}} className="form-control" required
                                                    value={items.group_yos} onChange={handleInputChange.bind(this)} name="group_yos" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="0">Under 1 Years</option>
                                                    <option value="1">1 Years and Above</option>
                                                </select>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required" >
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Language Availability</label>
                                                <select id="language_avail" style={{width:"25%"}} className="form-control" required
                                                    value={items.language_avail} onChange={handleInputChange.bind(this)} name="language_avail" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="0">Bahasa Indonesia</option>
                                                    <option value="1">English</option>
                                                    <option value="2">Both</option>
                                                </select>
                                                <div className="help-block"></div>
                                            </div>

                                            {/* <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Content Type </label>
                                                
                                                    <select value={items.content_type_id} required
                                                        onChange={handleInputChange.bind(this)} id="content_type_id" name="content_type_id" style={{width:"300px"}} className="form-control">
                                                        <option value="">-- None --</option>
                                                        {contentTypeItems.map(
                                                            (contentTypeItem) =>
                                                            <option key={contentTypeItem.id} value={contentTypeItem.id}>{contentTypeItem.title}</option>
                                                        )
                                                        }
                                                    </select>
                                               
                                                <div className="help-block"></div>
                                            </div> */}

                                            <div className="form-group field-profile-country">
                                                <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                                <select id="profile-country" style={{width:"200px"}} className="form-control" 
                                                    value={items.flag_active} onChange={handleInputChange} required name="flag_active" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="1">active</option>
                                                    <option value="0">inactive</option>
                                                </select>

                                                <div className="help-block"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
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
                                                                name="home_image" id="home_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                                                ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />
                                                        <br/>
                                                        <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                                        <br/>
                                                        <span className='badge badge-primary' id="upload-name" name="upload-name">{items.home_image}</span>
                                                                    
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group field-usereditform-email required">
                                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Course Preview <span style={{color:"#ff0404"}}>(*) </span>
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
                                                                    image resolution 380 x 268 pixels
                                                                </li>
                                                            </ul>
                                                        </label>
                                                        <br/>
                                                        <input type="file"  
                                                                name="course_image" id="course_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                                                ref={fileInputCourse} onChange={ajaxFileUploadImageCourse.bind(this)} />
                                                        <br/>
                                                        <img style={{width:"160px",height:"auto"}}  src={fileCourse}    alt="" onError={addDefaultSrc} />

                                                        <br/>
                                                        <span className='badge badge-primary' id="upload-name-course" name="upload-name-course">{items.course_image}</span>
                                                                    
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                            </div>                                           

                                            <input type="hidden" name="hdnkey" value={items.id||''}/>    
                                            <ButtonSubmitAdmin txt={"Save"} loading={loadingButton}/>
                                            {/* <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp; */}
                                            {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </form>
                    <hr/>
                </div>
            </div>
        </div>
    )
}

export default CourseDetail;