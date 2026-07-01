import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import { Tab, Row, Col, Nav } from 'react-bootstrap';

function SliderSFFDetail(props){
    const [loading, setLoading] = useState(true)
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = ""
    
    const [items, setItems] = useState([])
   
    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)

    const fileInput = React.createRef()
    // const reader = new FileReader()
    const [file, setFile] = useState(null)
    const file_path = env.userDocument
    const [invalidImage, setInvalidImage] = useState(false)

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
            let response = await axiosLibrary.postData('awbSliderSff/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"slider_sff/"+response.data.data.slider_image)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            getTotalActive()
            setLoading(false)
        }
    },[props.location.search])

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
                
                fd.append("seqnum", items.seqnum);
                // fd.append("menu_image", items.menu_image);
                fd.append("title", items.title);
                fd.append("hyperlink_url", items.hyperlink_url);
                fd.append("flag_active", items.flag_active);
                fd.append("user_account", user_account);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                fd.append("user_id", user_id);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("slider_image", fileInput.current.files[0]);
                } 

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbSliderSff/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.sliderSFF.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbSliderSff/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.sliderSFF.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbSliderSff/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.sliderSFF.path)
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

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.jpg|\.gif|\.jpeg|\.png|\.mp4/i;
        var filename = upload_field.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an image (png,jpg,jpeg,gif)");
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

    const getTotalActive = useCallback(async () => {
        const credentials = {
            offset:0,
            category:"COUNT",
            status_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderSff/ListData',credentials);
        setTotalActiveData(isi.data.data)
    })

    const changeSequence=(status)=>{
        if(status==0){
            setItems(items=>({
                ...items, 
                seqnum:999
            }))
        }else{
            getTotalActive()
        }
    }

    useEffect(()=>{
        setItems(items=>({
            ...items, 
            seqnum:totalActiveData+1
        }))
    },[totalActiveData])

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
                        <a className="float-right btn btn-default" href={routeAdmin.sliderSFF.path} label="Back to overview" data-ui-loader="">
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
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Sequence</label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control sort_index"
                                                    name="seqnum" value={items.seqnum} onChange={handleInputChange} readOnly required aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Title <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                    name="title" value={items.title} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;URL <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" placeholder="http://www.google.co.id"
                                                    name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>
                                            
                                            <div className="form-group field-usereditform-email required">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Image <span style={{color:"#ff0404"}}>(*) </span>
                                                    <br/> 
                                                    <ul className="file-upload-requirement">
                                                        <li>
                                                            one file only
                                                        </li>
                                                        <li>
                                                            4 MB limit
                                                        </li>
                                                        <li>
                                                            Allowed types for image : png jpg jpeg gif
                                                        </li>
                                                        <li>
                                                            Images larger than 600 x 200 pixels will be resized.
                                                        </li>
                                                    </ul>
                                                </label>
                                                <br/>
                                                <input type="file"  
                                                        name="slider_image" id="slider_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif"
                                                        ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} />
                                                <br/>
                                                <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                                <br/>
                                                <span className='badge badge-primary' id="upload-name" name="upload-name">{items.slider_image}</span>
                                                            
                                                <div className="help-block"></div>
                                            </div>

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
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                        {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                    </form>
                    
                </div>
            </div>
        </div>
    )
}
export default SliderSFFDetail;