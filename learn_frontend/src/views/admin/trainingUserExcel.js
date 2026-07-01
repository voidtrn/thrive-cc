import React, { useState, useCallback, useEffect } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function TrainingUserExcel(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])

    const fileInput = React.createRef()
    // const [file, setFile] = useState(null)
    const [invalidFile, setInvalidFile] = useState(false)
    const [scheduleData, setScheduleData] = useState([])
    const [loading, setLoading] = useState(true)

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getScheduleData= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            let response = await axiosLibrary.postData('awbTrainingSchedule/SelectData',data);
            if(response.status === 200){
                setScheduleData(response.data.data)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }
    },[props.location.search])

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

    const submit= async () =>{
        // e.preventDefault();
        setLoading(true)
        const fd = new FormData();
        
        fd.append("platform_id", platform_id);
        fd.append("schedule_id", scheduleData.id);

        const IsFileAttached = fileInput.current.files.length > 0;
        if(IsFileAttached){
            fd.append("training_file", fileInput.current.files[0]);
        } 

        let responseJson = await axiosLibrary.postData("awbTraining/ImportDataEmployee", fd);
        if(responseJson.status === 200){
            alert("Data has been Inserted");
            backToOverview()
        }else{
            // alert(responseJson);
            alert("Import Process is failed, please check your File.");
            setLoading(false)
        }
            
    }

    const backToOverview= async()=>{
        let md5ScheduleId = new URLSearchParams(props.location.search).get('data')
        let trainingId= new URLSearchParams(props.location.search).get('uid')
        history.push({
            pathname: routeAdmin.trainingScheduleUserAdmin.path,
            search: "?" + new URLSearchParams({data:md5ScheduleId}) +'&'+new URLSearchParams({uid:trainingId})// your data array of objects
        })
        
    }

    useEffect(()=>{
        getScheduleData()
    },[platform_id])

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

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-right btn btn-default" onClick={backToOverview.bind(this)} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
                <form id="czfrom" onSubmit={validateFile} method="post" style={{display: "block"}} encType='multipart/form-data'>
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{scheduleData.training_name}</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                    <div className="form-group field-profile-country">
                                        <label className="control-label" forHtml="profile-country">&nbsp;Schedule Date : </label>
                                    
                                        <label className="control-label" forHtml="profile-country">{scheduleData.schedule_date +' '+scheduleData.schedule_start_time+ ' - '+scheduleData.schedule_end_time}</label>

                                        <div className="help-block"></div>
                                    </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;File Excel </label>
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
  
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                    {/* {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}        */}

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default TrainingUserExcel;