import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import { env, securityData } from '../../helpers/globalHelper';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function TrainingSubFunctionUsersExcel(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])

    const fileInput = React.createRef()
    // const [file, setFile] = useState(null)
    const [invalidFile, setInvalidFile] = useState(false)
    const file_path = env.assets + 'template/'
    //const [editData, setEditData] = useState(false)
    //const [loading, setLoading] = useState(true)

    var Columns = "";
    const [items, setItems] = useState([])

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const validateFile = (e) => {
        e.preventDefault();
        if(invalidFile){
            alert("ERROR IN THE UPLOAD FILE SECTION, PLEASE USE A VALID FILE");
            return false
        }else{
            submit();
            return true
        }
    }

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            //setEditData(true)
            let response = await axiosLibrary.postData('awbTrainingSubfunction/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                //setLoading(false)
            }else{
                alert(response);
                //setLoading(false)
            }
        }else{
           // setLoading(false)
        }
    },[props.location.search]);

    useEffect(()=>{
        getDetail();
        
    },[Columns]);


    const submit= async () =>{
        // e.preventDefault();
        
        const fd = new FormData();
        
        fd.append("platform_id", platform_id);
        fd.append("sub_function_id", items.id);

        const IsFileAttached = fileInput.current.files.length > 0;
        if(IsFileAttached){
            fd.append("user_sub_function_file", fileInput.current.files[0]);
        } 

        let responseJson = await axiosLibrary.postData("awbTrainingSubfunction/ImportDataSubFunctionUsers", fd);
        if(responseJson.status === 200){
            alert("Data has been Inserted");
            const idParam = items.id;
            let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
            const ID =responseJson.data.data; 
            let pathname    =   ''
            pathname        =   routeAdmin.trainingAdminSubFunctionUsers.path
            
            history.push({
                pathname: pathname,
                search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
            })
        }else{
            // alert(responseJson);
            alert("Import Process is failed, please check your File.");
        }
            
    }


    // useEffect(()=>{
    //     getDetail()
    // },[Columns])

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

    const setStateFile = (HtmlElement,stateFile,invalidFile) => {
        // document.getElementById("upload-name").innerHTML =  HtmlElement 

        // setFile(stateFile)
        setInvalidFile(invalidFile)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.xls|\.xlsx|\.csv/i;
        var filename = upload_field.target.value;
        var excelName = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) === -1) 
        {
            alert("File must be a worksheet file (excel)");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 10) {
            alert('File size exceeds 10 MB');
            upload_field.target.form.reset();
            return 0;
        }

        if(upload_field.target.files[0]!== undefined){
            setStateFile(excelName + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')',URL.createObjectURL(upload_field.target.files[0]),false)
        }
        
        return 1;       
    }
    const toUsers= async()=>{
        const idParam = new URLSearchParams(props.location.search).get('data');
        let pathname=''
            pathname = routeAdmin.trainingAdminSubFunctionUsers.path
        
        history.push({
            pathname: pathname,
            search: "?" + new URLSearchParams({data: idParam}).toString()// your data array of objects
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
                <span style={{marginRight:"5px",marginLeft:"5px"}}  onClick={toUsers.bind(this)}  className="float-right btn btn-default" label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</span>
                </div>
            </div>
            <div className="panel-body">
                <form id="czfrom" onSubmit={validateFile} method="post" style={{display: "block"}} encType='multipart/form-data'>
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">New Data Training from Excel</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" forHtml="usereditform-email">&nbsp;Template <span style={{color:"#ff0404"}}>(*)</span>
                                                <br/>  
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        <a href={file_path+'import_training_sub_function_users.xlsx'}>download</a>
                                                    </li>
                                                </ul>
                                                    
                                            </label>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Import file <span style={{color:"#ff0404"}}>(*) </span>
                                                <br/> 
                                                <ul className="file-upload-requirement">
                                                    <li>
                                                        one file only
                                                    </li>
                                                    <li>
                                                        10 MB limit
                                                    </li>
                                                    <li>
                                                        Allowed types for worksheet : xls, xlsx or csv
                                                    </li>
                                                </ul>
                                            </label>
                                            <br/>
                                            <input type="file"  
                                                name="file_name" id="file_name" size="40" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                ref={fileInput} className="form-control" onChange={ajaxFileUploadImage.bind(this)}  />
                                                    
                                            <div className="help-block"></div>
                                        </div>

                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
  
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Import</button>&nbsp;
                  

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default TrainingSubFunctionUsersExcel;