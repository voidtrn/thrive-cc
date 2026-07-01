import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function RewardDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = ""
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const file_path = env.userDocument
    const [levelList, setLevelList] = useState([])
    const [functionList, setFunctionList] = useState([])
    
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
            let response = await axiosLibrary.postData('awbReward/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setFile(file_path+"reward/"+response.data.data.reward_image)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[file_path,props.location.search])

    const getLevel= useCallback(async() =>{
        const data = {
            platform_id:platform_id
        }
        
        let response = await axiosLibrary.postData('awbReward/DropdownLevel',data);
        if(response.status === 200){
            setLevelList(response.data.data)
        }else{
            alert(response);
        }
       
    })

    const getFunction= useCallback(async() =>{
        const data = {
            platform_id:platform_id
        }
        
        let response = await axiosLibrary.postData('awbReward/DropdownFunction',data);
        if(response.status === 200){
            setFunctionList(response.data.data)
        }else{
            alert(response);
        }
       
    })

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
                
                fd.append("title", items.title);
                fd.append("short_descr", items.short_descr);
                fd.append("title_ind", items.title_ind);
                fd.append("short_descr_ind", items.short_descr_ind);
                fd.append("qty_stock", items.qty_stock);
                fd.append("claim_point", items.claim_point);
                // fd.append("menu_image", items.menu_image);
                fd.append("flag_active", items.flag_active);
                fd.append("user_account", user_account);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                fd.append("promo_point", items.promo_point);
                fd.append("minimum_claim_level", items.minimum_claim_level);
                fd.append("minimum_loginstreak", items.minimum_loginstreak);
                fd.append("minimum_total_content", items.minimum_total_content);
                fd.append("flag_claim", items.flag_claim);
                fd.append("directorate", items.directorate);

                const IsFileAttached = fileInput.current.files.length > 0;
                if(IsFileAttached){
                    fd.append("reward_image", fileInput.current.files[0]);
                } 

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbReward/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.reward.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbReward/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.reward.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbReward/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.reward.path)
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
        getLevel()
        getFunction()      
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

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-end btn btn-default" href={routeAdmin.reward.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
            {/* <div className="panel-body"> */}
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
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Reward Eng <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" required
                                                name="title" aria-required="true" aria-invalid="false" value={items.title} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Reward Ind <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" required
                                                name="title_ind" aria-required="true" aria-invalid="false" value={items.title_ind} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Eng <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" required
                                                name="short_descr" aria-required="true" aria-invalid="false" value={items.short_descr} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description Ind <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" required
                                                name="short_descr_ind" aria-required="true" aria-invalid="false" value={items.short_descr_ind} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Qty Stock <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"25%"}} className="form-control" required
                                                name="qty_stock" aria-required="true" aria-invalid="false" value={items.qty_stock} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Claim point <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"25%"}} className="form-control" required
                                                name="claim_point" aria-required="true" aria-invalid="false" value={items.claim_point} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Promo point </label>
                                            <input type="text" id="usereditform-email" style={{width:"25%"}} className="form-control"
                                                name="promo_point" aria-required="true" aria-invalid="false" value={items.promo_point} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Minimum Claim Level <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <select id="profile-country" style={{width:"300px"}} className="form-control" 
                                                value={items.minimum_claim_level} onChange={handleInputChange.bind(this)} required name="minimum_claim_level" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                {levelList.map(
                                                    (itemLevel) =>
                                                        <option key={itemLevel.id} value={itemLevel.points_needed}>
                                                            {itemLevel.title}
                                                        </option>
                                                    )
                                                }
                                            </select>

                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Minimum Loginstreak <span style={{color:"#ff0404"}}>(*)</span> 
                                            <br/> 
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        The Local Hero level need 10 days loginstreak
                                                    </li>
                                                    <li>
                                                        The Rising Star level need 15 days loginstreak
                                                    </li>
                                                    <li>
                                                        The Superstar level need 20 days loginstreak
                                                    </li>
                                                    <li>
                                                        The North Star level need 25 days loginstreak
                                                    </li>
                                                </ul>
                                            </label>
                                            <input type="number" min="0" max="100" id="usereditform-email" style={{width:"10%"}} className="form-control" required
                                                name="minimum_loginstreak" aria-required="true" aria-invalid="false" value={items.minimum_loginstreak} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Minimum Total Content <span style={{color:"#ff0404"}}>(*)</span> 
                                            <br/> 
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        The Superstar level need 1 of total user content
                                                    </li>
                                                    <li>
                                                        The North Star level need 3 of total user content
                                                    </li>
                                                </ul>
                                            </label>
                                            <input type="number" min="0" max="10" id="usereditform-email" style={{width:"10%"}} className="form-control" required
                                                name="minimum_total_content" aria-required="true" aria-invalid="false" value={items.minimum_total_content} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Allow More Than 1 Claim?</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_claim} onChange={handleInputChange.bind(this)} required name="flag_claim" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="1">Yes</option>
                                                <option value="0">No</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Function <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <select id="profile-country" style={{width:"300px"}} className="form-control" 
                                                value={items.directorate} onChange={handleInputChange.bind(this)} required name="directorate" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="All">All Function</option>
                                                {functionList.map(
                                                    (itemFunction) =>
                                                        <option key={itemFunction.id} value={itemFunction.directorate}>
                                                            {itemFunction.directorate}
                                                        </option>
                                                    )
                                                }
                                            </select>

                                            <div className="help-block"></div>
                                        </div>
                                        
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Preview Image <span style={{color:"#ff0404"}}>(*) </span>
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
                                                    name="reward_image" id="reward_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)}  />
                                            <br/>
                                            <img style={{width:"160px",height:"auto"}}  src={file}    alt="" onError={addDefaultSrc} />

                                            <br/>
                                            <span className='badge bg-primary' id="upload-name" name="upload-name">{items.reward_image===""? "images": items.reward_image}</span>
                                                        
                                            <div className="help-block"></div>
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

export default RewardDetail;