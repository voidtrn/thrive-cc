import React, { useCallback, useEffect, useState} from 'react';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';

import { Tab, Row, Col, Nav } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';

import Quiz from './quiz';

const routeAdmin = routeAll.routesAdmin

function ArticleDetail(props){
    const history = useHistory()
    const animatedComponents = makeAnimated();

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const [editData, setEditData] = useState(false)
    const user_account = securityData.Security_UserAccount()
    const hostname = window.location.protocol +'//'+ window.location.hostname + (window.location.port == 80?'':':'+window.location.port)

    // const [listSectionMenu, setListSectionMenu] = useState([])
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [listCategory, setListCategory] = useState([])
    const [key, setKey] = useState('')
    const [quizTabTitle, setQuizTabTitle] = useState('Quiz')

    const fileInput = React.createRef()
    const fileInputPreview = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [filePreview, setFilePreview] = useState(null)
    const file_path = env.userDocument
    const [invalidImage, setInvalidImage] = useState(false)
    const [invalidImagePreview, setInvalidImagePreview] = useState(false)
    const [md5CategoryId, setMd5CategoryId] = useState('')
    const [md5ArticleId, setMd5ArticleId] = useState('')
    const [allUserData, setAllUserData] = useState([])
    const [specificUser, setSpecificUser] = useState([])
    const [titlePage, setTitlePage] = useState(props.pageName)

    let articleLink = null

    const [contentTypeItems, setContentTypeItems] = useState([])

    const getContentType = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: 9999,
            offset:0,
            category:"",
            flag_active:1,
            table_name:'awb_trn_article',
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbContentType/ListData',credentials);
        setContentTypeItems(isi.data.data)
    },[platform_id])

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbArticle/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"article/"+response.data.data.article_image)
                setFilePreview(file_path+"article/"+response.data.data.article_preview_image)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[file_path,props.location.search])

    const getCategoryList = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbArticle/ListCategory',credentials);
        setListCategory(isi.data.data)
        // setLoading(false)
    })

    const getSpecificUser = useCallback(async () => {
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbArticle/GetDetailSpecificUser',data);
        var User = isi.data.data.map(({id, account, name})=>{
            return {
                value: id,
                label: '( '+account+' ) '+name
            }
        });
        setSpecificUser(User)
        // setLoading(false)
    })

    const getAllUser = useCallback(async () => {
        const credentials = {
            limit: 100000,
            offset:0,
            str_where:'',
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbUser/ListData',credentials);

        var allUser = isi.data.data.map(({id, account, name})=>{
        return {
            value: id,
            label: '( '+account+' ) '+name
        }
        });

        setAllUserData(allUser)
        // setLoading(false)
    })

    useEffect(() => {
        // if(categoryId !== 'null'){
        handleBackFromOverview()
        getContentType()
        getDetail()
        // getCategoryList()
        // getAllUser()
        // getSpecificUser()
        // }
    },[platform_id])

    useEffect(() => {
        // if(categoryId !== 'null'){
        if (key === '#tab-0'){
            getCategoryList()
            getAllUser()
            getSpecificUser()
        }
        // }
    },[key])

    const setLink=async(id, type)=>{
        const idParam = id;
        let md5Id = await axiosLibrary.getmd5FromBackend(idParam)
        if(type === 'category'){
            setMd5CategoryId(md5Id)
        }
        if(type === 'article'){
            setMd5ArticleId(md5Id)
        }
    }

    const getAutoIncrement = async()=>{
        let response = await axiosLibrary.postData('awbArticle/getNextId',{})
        if(response.status===200){
            setLink(response.data.data,'article')
        }
    }

    useEffect(() => {
        setLink(items.category_id,'category')
    },[items.category_id])

    useEffect(() => {
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!==null){
            setLink(items.id,'article')
        }else{
            getAutoIncrement()
        }
    },[editData,props.location.search,items.id])

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    const handleBackFromOverview = () => {
        if(props.location.pathname === routeAdmin.quiz.path){
            handleTabSelect('#tab-1')
        }else{
            handleTabSelect('#tab-0')
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
        if(!cancelDelete){
            if(!deleteData){
                const fd = new FormData();

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("article_image", fileInput.current.files[0]);
                } 

                const IsFileAttachedPreview = fileInputPreview.current.files.length > 0;
                if(IsFileAttachedPreview){
                    fd.append("article_preview_image", fileInputPreview.current.files[0]);
                } 

                // if(IsFileAttached && IsFileAttachedPreview){
                    // fd.append("menu_image", items.menu_image);
                    fd.append("category_id", items.category_id);
                    fd.append("category_4", items.category_4);
                    fd.append("title", items.title);
                    fd.append("title_ind", items.title_ind);
                    fd.append("description", items.description);
                    fd.append("description_ind", items.description_ind);
                    fd.append("hyperlink_url", items.hyperlink_url);
                    fd.append("article_id", items.article_id);
                    fd.append("flag_active", items.flag_active);
                    fd.append("tags", items.tags);
                    fd.append("user_account", user_account);
                    fd.append("user_modified", user_id);
                    fd.append("platform_id", platform_id);
                    fd.append('userSpecific',JSON.stringify(specificUser===null?[]:specificUser));
                    fd.append("content_type_id", items.content_type_id);

                    if(editData){
                        //for edit data
                        fd.append("id", items.id);
                        let responseJson = await axiosLibrary.postData("awbArticle/UpdateData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN UPDATED");
                            handleBackToOverview()
                        }else{
                            alert(responseJson);
                        }
                    } else {
                        //for insert data
                        if(IsFileAttached && IsFileAttachedPreview){
                            fd.append("user_created", user_id);
                            
                            let responseJson = await axiosLibrary.postData("awbArticle/InsertData", fd);
                            if(responseJson.status === 200){
                                alert("DATA HAS BEEN CREATED");
                                handleBackToOverview()
                            }else{
                                alert(responseJson);
                            }
                        }else{
                            alert("IMAGES ARE MANDATORY")
                        }
                    }
                // }else{
                //     alert("IMAGES ARE MANDATORY")
                // }
                
        } else {
            //for delete data
            const parameter = {
                id:items.id
            }
            let responseJson = await axiosLibrary.postData("awbArticle/DeleteData", parameter);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN DELETED");
                handleBackToOverview()
            }else{
                alert(responseJson);
            }
        }
    }
           
    }

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

    const loadOptions = (inputValue, callback) => {
        const requestResults = allUserData.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue.toLowerCase())
            ).slice(0,50)
               
        // const requestResults = this.state.optionAdHoc.slice(0,10);
        callback(requestResults)

    }

    const clearSpecificUser = () => {
        
        setSpecificUser([])
    }

    const handleTabSelect = (tab) => {
        
        setKey(tab);
        
        if (tab === '#tab-1'){
            setQuizTabTitle('Quiz Detail')
            setTitlePage(routeAdmin.quiz.pageName)
        }else{
            setQuizTabTitle('Quiz')
            setTitlePage(routeAdmin.articleDetail.pageName)
        }
    }

    const handleBackToOverview=()=>{
        var path=routeAdmin.article.path
        
        history.push({
            pathname: path,
            // search: "?" + new URLSearchParams({cat: items.category_id}).toString()// your data array of objects
        })
    }

    const customStyles = {
        indicatorsContainer: () => ({
          display: 'none',
        }),
        control: (provided) => ({
            ...provided,
            minHeight: '170px',
            alignItems: 'baseline',
        }),
    }

    const linkToClipboard = () => {
        articleLink.select();
        document.execCommand("copy");
        alert("copied link to clipboard");  
	} 

    return(
        <div className="col-md-9">
            <style>
                {`
                   .chosen-container-multi .chosen-choices{
                    background-color: transparent;
                    border: 2px solid #ededed;
                    }
                    ul.chosen-choices{
                        min-height:170px;
                    }
                `}
            </style>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{titlePage}</strong> 
                    <div className="clearfix">
                        <div className="panel-body">
                            <a className="float-end btn btn-default" href={routeAdmin.article.path} label="Back to overview" data-ui-loader="">
                                <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                        </div>
                    </div>
                </div>
                <LoadingAdmin loading={loading}/> 
                <div className="panel-body" style={cssTarget(loading)}>
                {/* <div className="panel-body"> */}
                    <Tab.Container id="profile-tabs" 
                        defaultActiveKey="#tab-0"
                        activeKey={key}
                        onSelect={ handleTabSelect }
                        >
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-main tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                    {editData ?
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">{quizTabTitle}</Nav.Link>
                                        </Nav.Item>
                                    : ''
                                    }
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;Menu - Category <span style={{color:"#ff0404"}}>(*)</span></label>
                                                
                                                <select value={items.category_id}
                                                    onChange={handleInputChange.bind(this)} id="category_id" name="category_id" style={{width:"100%"}} className="form-control">
                                                    <option value="">-select one-</option>
                                                    {listCategory.map(
                                                        (itemCategory) =>
                                                        <option key={itemCategory.id} value={itemCategory.id}>
                                                            {itemCategory.title}
                                                        </option>
                                                    )
                                                    }
                                                </select>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;Refine By (Category 4)</label>
                                                <input type="text" id="usereditform-email" style={{width:"500px"}} className="form-control" name="category_4" 
                                                    onChange={handleInputChange.bind(this)} maxLength="100" value={items.category_4} aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                        <li>
                                                        max 100 of chars
                                                        </li>
                                                    </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;Title Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"350px"}} className="form-control" name="title"
                                                    onChange={handleInputChange.bind(this)} maxLength="50" value={items.title} aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                        <li>
                                                        max 50 of chars
                                                        </li>
                                                    </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;Title Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"350px"}} className="form-control" name="title_ind" 
                                                    onChange={handleInputChange.bind(this)} maxLength="50" value={items.title_ind} aria-required="true" aria-invalid="false" />
                                                <ul className="file-upload-requirement">
                                                        <li>
                                                        max 50 of chars
                                                        </li>
                                                    </ul>
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;Short Description Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                    onChange={handleInputChange.bind(this)} name="description" maxLength="100" value={items.description} aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;Short Description Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="description_ind" 
                                                    onChange={handleInputChange.bind(this)} maxLength="100" value={items.description_ind} aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;URL <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" 
                                                    onChange={handleInputChange.bind(this)} name="hyperlink_url" value={items.hyperlink_url} aria-required="true" aria-invalid="false" />

                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="usereditform-email">&nbsp;Article ID <span style={{color:"#ff0404"}}>{editData? '' : '(*)'}</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"20%"}}  className="form-control" 
                                                    onChange={handleInputChange.bind(this)} name="article_id" value={items.article_id} aria-required="true" aria-invalid="false" />

                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email">
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
                                            </div>

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group field-usereditform-email required">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Home Preview <span style={{color:"#ff0404"}}>(*) </span>
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
                                                                name="article_image" id="article_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                                                ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />
                                                        <br/>
                                                        <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                                        <br/>
                                                        <span className='badge bg-primary' id="upload-name" name="upload-name">{items.article_image}</span>
                                                                    
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group field-usereditform-email required">
                                                        <label className="control-label" forHtml="usereditform-email">&nbsp;Article Preview <span style={{color:"#ff0404"}}>(*) </span>
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
                                                                    image resolution 265 x 200 pixels
                                                                </li>
                                                            </ul>
                                                        </label>
                                                        <br/>
                                                        <input type="file"  
                                                                name="article_preview_image" id="article_preview_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                                                ref={fileInputPreview} onChange={ajaxFileUploadImagePreview.bind(this)} />
                                                        <br/>
                                                        <img style={{width:"160px",height:"auto"}}  src={filePreview}    alt="" onError={addDefaultSrc} />

                                                        <br/>
                                                        <span className='badge bg-primary' id="upload-name-preview" name="upload-name-preview">{items.article_preview_image}</span>
                                                                    
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <br/>

                                            <div className="row" style={{position: "relative"}}>
                                                <div className="col-md-6" >
                                                    <div className="form-group field-usereditform-email required" >
                                                        <label className="control-label" forHtml="profile-country">&nbsp;Share to Spesific User </label> <span onClick={clearSpecificUser} className="btn btn-danger btn-xs">clear all users</span>
                                                        {/* <select id="initiate_participant" name="initiate_participant[]"  multiple data-placeholder="Choose Employee Name" className="chosen-select form-control" style={{width:"75%"}}></select> */}
                                                        <AsyncSelect
                                                            closeMenuOnSelect={false}
                                                            isMulti
                                                            styles={customStyles}
                                                            components={animatedComponents}
                                                            loadOptions={loadOptions.bind(this)}
                                                            defaultOptions={allUserData.slice(0,50)}
                                                            onChange={(e)=>setSpecificUser(e)}
                                                            value={specificUser}
                                                            placeholder="Choose Employee Name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group field-usereditform-email required">
                                                        <label className="control-label" forHtml="tags">&nbsp;Tags</label>
                                                        <textarea id="tags" style={{width:"100%",height:"100px"}} className="form-control" name="tags" 
                                                            onChange={handleInputChange.bind(this)} aria-required="true" aria-invalid="false" value={items.tags}></textarea>

                                                        <div className="help-block"></div>
                                                    </div>
                                                        
                                                    <div className="form-group field-profile-country">
                                                        <label className="control-label" forHtml="profile-country">&nbsp;Status Active</label>
                                                        <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                            value={items.flag_active} onChange={handleInputChange} required name="flag_active" aria-invalid="false">
                                                            {editData ? null: <option value="">... Select this ...</option> }
                                                            <option value="1">active</option>
                                                            <option value="0">inactive</option>
                                                        </select>

                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            <hr/>
                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" forHtml="profile-country">&nbsp;Copy Article Link</label><br/>
                                                <input type="text" id="txtarticleLink" style={{width:"85%",display:"unset"}} className="form-control"  
                                                    name="txtarticleLink" value={hostname+routeAll.routeViewAll.article.path + '?cate='+md5CategoryId + '&articleId=' +md5ArticleId} 
                                                    aria-required="true" aria-invalid="false"  ref={(ref) => articleLink = ref} />
                                                <span className="btn btn-default float-end" onClick={linkToClipboard}>Copy Link</span>

                                            </div>
                                            <hr/>

                                            <input type="hidden" name="hdnkey" value={items.id||''}/>    
                                            <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                                            {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}     
                                        </form>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="#tab-1">
                                        <Quiz md5ArticleId={new URLSearchParams(props.location.search).get('data')} keyTab={key} />
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

export default ArticleDetail;