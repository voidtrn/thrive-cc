import React, { useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';

import { Tab, Row, Col, Nav } from 'react-bootstrap';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

function EventParticipantImportDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])

    const fileInput = React.createRef()
    // const [file, setFile] = useState(null)
    const [invalidFile, setInvalidFile] = useState(false)
    const file_path = env.assets + 'template/'
    const [loading, setLoading] = useState(false)

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

    const submit= async () =>{
        // e.preventDefault();
        setLoading(true)
        const fd = new FormData();
        
        fd.append("platform_id", platform_id);

        const IsFileAttached = fileInput.current.files.length > 0;
        if(IsFileAttached){
            fd.append("event_participant_file", fileInput.current.files[0]);
        } 

        let responseJson = await axiosLibrary.postData("awbEventParticipant/ImportData", fd);
        if(responseJson.status === 200){
            alert("DATA HAS BEEN IMPORTED, TOTAL RECORD : "+responseJson.data.data);
            setLoading(false)
            history.push(routeAdmin.eventParticipantImport.path)
        }else{
            // alert(responseJson);
            alert("FAILED TO IMPORT, PLEASE TRY AGAIN.");
            setLoading(false)
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

    return( 
        <div className="col-md-9">
            <LoadingAdmin loading={loading}/> 
            <div className="panel panel-default" style={cssTarget(loading)}>
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-right btn btn-default" href={routeAdmin.eventParticipantImport.path} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                    </div>
                </div>
                <div className="panel-body">
                    <form id="czfrom" onSubmit={validateFile} method="post" style={{display: "block"}} encType='multipart/form-data'>
                    
                        <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">Import Data</Nav.Link>
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
                                                            <a href={file_path+'import_event_participant_template.xlsx'}>download</a>
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
                                                    name="event_participant_file" id="event_participant_file" size="40" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                    ref={fileInput} onChange={ajaxFileUploadImage.bind(this)}  />
                                                        
                                                <div className="help-block"></div>
                                            </div>

                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
    
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Import</button>&nbsp;
                        {/* {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}        */}

                    </form>
                    
                </div>
            </div>
        </div>
    )
}

export default EventParticipantImportDetail;