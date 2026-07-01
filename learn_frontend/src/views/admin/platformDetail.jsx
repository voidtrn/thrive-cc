import React, { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function PlatformDetail(props){
    const history = useHistory()
    const animatedComponents = makeAnimated();
    const routeAdmin = routeAll.routesAdmin
    const config = axiosLibrary.getAuthHeader();
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
    const [optionCountry, setOptionCountry] = useState([])
    const [isLoadingCountry, setIsLoadingCountry] = useState(true)
    const [optionSelectedCountry, setOptionSelectedCountry] = useState([])
    const [optionFunction, setOptionFunction] = useState([])
    const [isLoadingFunction, setIsLoadingFunction] = useState(true)
    const [optionSelectedFunction, setOptionSelectedFunction] = useState([])
    const [isLoadingUser, setIsLoadingUser] = useState(true)
    const [optionSelectedUsers, setOptionSelectedUsers] = useState([])
    const [optionAdHoc, setOptionAdHoc] = useState([])
    const [optionSelectedAdHoc, setOptionSelectedAdHoc] = useState([])
    const [optionSelectedUsersSuper, setOptionSelectedUsersSuper] = useState([])
    const [optionSelectedUsersTrainingReportAdmin, setOptionSelectedUsersTrainingReportAdmin] = useState([])
    const [optionSelectedUsersTrainingAdmin, setOptionSelectedUsersTrainingAdmin] = useState([])
    const [invalidImage, setInvalidImage] = useState(false)
    const [loading, setLoading] = useState(true)

    const getAllEmpl= useCallback(async () =>{
        var selectedfunction = []
        var selectedCountry = []
        if(optionSelectedFunction!==null){
            selectedfunction = optionSelectedFunction.map(({value}) => {
                return value
            });
        }else{
            selectedfunction = []
        }
        
        if(optionSelectedCountry!==null){
            selectedCountry = optionSelectedCountry.map(({value}) => {
                return value
            });
        }else{
            selectedCountry = []
        }
        const param = {
            country : selectedCountry,
            directorate : selectedfunction
        }
        //delete update di admin platform
        let responseJson = await axiosLibrary.postData("awbPlatform/GetAllEmployee",param);
        if(responseJson.status === 200){
            var hasil2 = responseJson.data.data2;
            var response2 = hasil2.map(({id, account, name}) => {
                return {
                  value: id,
                  label: '( '+account+' ) '+name
                }
              });
            setIsLoadingUser(false)
            setOptionAdHoc(response2)
        }else{
            alert(responseJson);
        }
    },[optionSelectedFunction,optionSelectedCountry])

    const getAllFunction= useCallback(async () =>{
        let responseJson = await axiosLibrary.getData("awbPlatform/GetAllFunction",config);
        if(responseJson.status === 200){
            var hasil = responseJson.data.data;
            var response = hasil.map(({directorate}) => {
                return {
                  value: directorate,
                  label: directorate
                }
              });
            setOptionFunction(response)
            setIsLoadingFunction(false)
        }else{
            alert(responseJson);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.pageName])

    const getPlatformDtl=useCallback(async()=>{
        //get data for edit in here
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let responseJson = await axiosLibrary.postData("awbPlatform/SelectData",data);
            if(responseJson.status === 200){
               var responseCountry = responseJson.data.data2;
               var hasilCountry = responseCountry.map(({country})=>{
                   return {
                        value : country,
                        label : country
                   }
               });
               var responseFunction = responseJson.data.data3;
               var hasilFunction = responseFunction.map(({directorate})=>{
                return {
                     value : directorate,
                     label : directorate
                }
                });
                var responseAdmin = responseJson.data.data4;
                var hasilAdmin = responseAdmin.map(({id, account, name})=>{
                 return {
                    value: id,
                    label: '( '+account+' ) '+name
                 }
                 });
                var responseSuperAdmin = responseJson.data.data6;
                var hasilSuperAdmin = responseSuperAdmin.map(({id, account, name})=>{
                return {
                    value: id,
                    label: '( '+account+' ) '+name
                }
                });
                var responseAdhoc = responseJson.data.data5;
                var hasilAdhoc = responseAdhoc.map(({id, account, name})=>{
                  return {
                     value: id,
                     label: '( '+account+' ) '+name
                  }
                });

                var responseTrainingReportAdmin = responseJson.data.data7;
                var hasilTrainingReportAdmin = responseTrainingReportAdmin.map(({id, account, name})=>{
                 return {
                    value: id,
                    label: '( '+account+' ) '+name
                 }
                 });

                var responseTrainingAdmin = responseJson.data.data8;
                var hasilTrainingAdmin = responseTrainingAdmin.map(({id, account, name})=>{
                 return {
                    value: id,
                    label: '( '+account+' ) '+name
                 }
                 });

                setItems(responseJson.data.data)
                setFile(file_path+"platform/"+responseJson.data.data.platform_image)
                setOptionSelectedCountry(hasilCountry)
                setOptionSelectedFunction(hasilFunction)
                setOptionSelectedUsers(hasilAdmin)
                setOptionSelectedAdHoc(hasilAdhoc)
                setOptionSelectedUsersSuper(hasilSuperAdmin)
                setOptionSelectedUsersTrainingReportAdmin(hasilTrainingReportAdmin)
                setOptionSelectedUsersTrainingAdmin(hasilTrainingAdmin)
            }else{
                // alert(responseJson.data.message);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[file_path,props.location.search])

    const getAllCountry= useCallback(async () =>{
        let responseJson = await axiosLibrary.getData("awbPlatform/GetAllCountry",config);
        if(responseJson.status === 200){
            var hasil = responseJson.data.data;
            var response = hasil.map(({country}) => {
                return {
                  value: country,
                  label: country
                }
              });
            setOptionCountry(response)
            setIsLoadingCountry(false)
        }else{
            alert(responseJson);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[props.pageName])

    const getUserId = useCallback(() => {
        var dataUser = axiosLibrary.getUserInfo();
        setUser_id(dataUser.id)
        setUser_account(dataUser.account)
        getAllCountry()
        getAllFunction();
        getPlatformDtl();
        getAllEmpl()
        setLoading(false)
    },[getAllCountry,getAllFunction,getPlatformDtl])

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
        if (FileSize > 3) {
            alert('File size exceeds 3 MB');
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

    const optionNull =()=>{
        var optionFunction = document.getElementsByName('optionFunction');
        var optionCountry = document.getElementsByName('optionCountry');
        if(optionFunction[0].defaultValue==="" && optionCountry[0].defaultValue===""){
             // this.setState({isDisabled:true})
        }else{
            getAllEmpl();
        }
     }

    const loadOptions = (inputValue, callback) => {
        // perform a request
        const requestResults = optionAdHoc.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue)
            ).slice(0,20)
        //const requestResults = this.state.optionAdHoc.slice(0,10);
        callback(requestResults)
    }

    const submit= async () =>{

        if(!cancelDelete){
            if(!deleteData){

                const fd = new FormData();
                fd.append("name", items.name);
                fd.append("imdl_param", items.imdl_param);
                fd.append("status_active", items.status_active);
                fd.append("platform_file", fileInput.current.files.length === 0 ? null : fileInput.current.files[0]);
                fd.append("user_modified", user_id);
                fd.append("user_account", user_account)
                fd.append("country", JSON.stringify(optionSelectedCountry===null?[]:optionSelectedCountry));
                fd.append("function",  JSON.stringify(optionSelectedFunction===null?[]:optionSelectedFunction));
                fd.append("adhoc", JSON.stringify(optionSelectedAdHoc===null?[]:optionSelectedAdHoc));

                if(editData){
                    //for edit data
                    fd.append("id",items.id);
                    let responseJson = await axiosLibrary.postData("awbPlatform/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.platform.path)
                    }else{
                        alert(responseJson);
                    }
                }else{
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbPlatform/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.platform.path)
                    }else{
                        alert(responseJson);
                    }
                }
            }else{
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbPlatform/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.platform.path)
                }else{
                    alert(responseJson);
                }
            }
        }
        setCancelDelete(false)
    }

    return(
        <>
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong>  
                    </div>
                    <div className="clearfix">
                        <div className="panel-body">
                            <a className="float-end btn btn-default" href={routeAdmin.platform.path} label="Back to overview" data-ui-loader="">
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
                                                <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+nameType: 'New Data' }</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                        </Col>
                                        <Col sm={12}>
                                        <Tab.Content animation="true">
                                            <Tab.Pane eventKey="#tab-0">
                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label">&nbsp;Platform Name <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="text" id="name" style={{width:"75%"}} className="form-control" name="name" value={items.name||''} onChange={handleInputChange.bind(this)} required/>

                                                    <div className="help-block"></div>
                                                </div>


                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Platform Image <span style={{color:"#ff0404"}}>(*) max upload file size : 300 KB, image resolution : (200 px * 200 px)</span></label>
                                                    <input type="file"  
                                                            name="platform_image" id="platform_image" size="40" accept="image/jpg,image/png,image/jpeg,image/gif" ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} required={editData===false?true:false} className="form-control-file"/>
                                                    <br/>
                                                    <img style={{width:"160px",height:"auto"}} id="newimage" src={file}  alt="" />
                                                <br/>
                                                <br/>
                                                    <span className='label label-primary' id="upload-name" name="upload-name">{items.platform_image===""? "images": items.platform_image}</span>
                                                    
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label">&nbsp;IMDL <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="text" id="imdl_param" style={{width:"75%"}} className="form-control" name="imdl_param" value={items.imdl_param||''} onChange={handleInputChange.bind(this)} required/>

                                                    <div className="help-block"></div>
                                                </div>

                                                {/* <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label">&nbsp;Energy Points <span style={{color:"#ff0404"}}>(*)</span></label>
                                                    <input type="number" id="energy_point" style={{width:"75%"}} className="form-control" name="energy_point" value={items.energy_point} onChange={this.handleInputChange} required/>

                                                    <div className="help-block"></div>
                                                </div> */}

                                                <div className="mb-3 field-profile-country">
                                                    <label className="control-label">&nbsp;Status Active</label>
                                                    <select id="profile-country" style={{width:"150px"}} className="form-control" name="status_active"  value={items.status_active||''} onChange={handleInputChange.bind(this)} required>
                                                        {editData ? null: <option value="">... Select this ...</option> }
                                                        <option value="0">inactive</option>
                                                        <option value="1">active</option>
                                                    </select>

                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Country</label>
                                                    <Select  components={animatedComponents} isMulti isLoading={isLoadingCountry} options={optionCountry} className="basic-multi-select" classNamePrefix="select" name="optionCountry" onBlur={optionNull.bind(this)} onChange={(e)=>setOptionSelectedCountry(e)} value={optionSelectedCountry}/>
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Function</label>
                                                    <Select components={animatedComponents} isMulti isLoading={isLoadingFunction} options={optionFunction} className="basic-multi-select" classNamePrefix="select" name="optionFunction" onBlur={optionNull.bind(this)} onChange={(e)=>setOptionSelectedFunction(e)} value={optionSelectedFunction}/>
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Training Report Admin</label>
                                                    <Select components={animatedComponents} isMulti className="basic-multi-select" classNamePrefix="select" name="optionUser" isDisabled={true} onChange={(e)=>setOptionSelectedUsersTrainingReportAdmin(e)} value={optionSelectedUsersTrainingReportAdmin} />
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Training Admin</label>
                                                    <Select components={animatedComponents} isMulti className="basic-multi-select" classNamePrefix="select" name="optionUser" isDisabled={true} onChange={(e)=>setOptionSelectedUsersTrainingAdmin(e)} value={optionSelectedUsersTrainingAdmin} />
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Admin</label>
                                                    <Select components={animatedComponents} isMulti className="basic-multi-select" classNamePrefix="select" name="optionUser" isDisabled={true} onChange={(e)=>setOptionSelectedUsers(e)} value={optionSelectedUsers} />
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Super Admin</label>
                                                    <Select components={animatedComponents} isMulti className="basic-multi-select" classNamePrefix="select" name="optionUserSuper" isDisabled={true} onChange={(e)=>setOptionSelectedUsersSuper(e)} value={optionSelectedUsersSuper} />
                                                    <div className="help-block"></div>
                                                </div>

                                                <div className="mb-3 field-usereditform-email required">
                                                    <label className="control-label" >&nbsp;Ad Hoc User</label>
                                                    {/* <Select components={animatedComponents} isMulti isLoading={isLoadingUser} options={optionAdHoc.slice(0,10)} className="basic-multi-select" classNamePrefix="select" name="optionAdHoc" isDisabled={false} onChange={this.fnOptionAdHoc} value={optionSelectedAdHoc}/> */}
                                                    <AsyncSelect
                                                        onChange={(e)=>setOptionSelectedAdHoc(e)}
                                                        className="basic-multi-select" classNamePrefix="select" name="optionAdHoc" value={optionSelectedAdHoc} isMulti components={animatedComponents} isLoading={isLoadingUser} loadOptions={loadOptions.bind(this)}
                                                    />
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
        </>
    )
}

export default PlatformDetail;