import React, {  useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';

function ImportClaimSFF(props){
    const history = useHistory()
    

    const fileInput = React.createRef()
    const file_assets = env.assets
    const [invalidImage, setInvalidImage] = useState(false)

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()

    const validateImage = (e) => {
        e.preventDefault();
        if(invalidImage){
            alert("ERROR IN THE UPLOAD FILE SECTION, PLEASE USE A VALID FILE");
            return false
        }else{
                submit();
                return true
            
        }
    }

    const submit= async () =>{
        const fd = new FormData();
        

        const IsFileAttached = fileInput.current.files.length > 0;
        if(IsFileAttached){
            fd.append("import_file", fileInput.current.files[0]);
            fd.append("platform_id", platform_id);

            fd.append("user_created", user_id);
            let responseJson = await axiosLibrary.postData("awbRegisterCourse/ImportData", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN CREATED");
                history.push(routeAdmin.claimSFF.path)
            }else{
                alert(responseJson);
            }
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
        setInvalidImage(invalidImage)
    }

    const ajaxFileUploadImage=(upload_field)=>{
        var re_text = /\.xls|\.xlsx|\.csv/i;
        var filename = upload_field.target.value;
        var imagename = filename==null? "": filename.replace("C:\\fakepath\\","");
        if (filename.search(re_text) === -1) 
        {
            alert("File must be an (xls, xlsx or csv)");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 10) {
            alert('File size exceeds 10 MB');
            upload_field.target.form.reset();
            return 0;
        }

        setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')',URL.createObjectURL(upload_field.target.files[0]),false)
        
        return 1;       
    }
    
    return(
        <>
            <style>{`
                ul.file-upload-requirement {
                    font-size: 11px;
                    font-weight: normal;
                    padding: 5px 0 5px 25px;
                    list-style: circle;
                }`
            }
            </style>

            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>
                        
                    <div className="clearfix">
                        <div className="panel-body">
                            <a className="float-right btn btn-default" href={routeAdmin.claimSFF.path} label="Back to overview" data-ui-loader="">
                                <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                                <h4 className="float-left"></h4>
                        </div>
                    </div>
                    
                    <div className="panel-body">
                        <form id="czfrom" onSubmit={validateImage}  method="post" enctype="multipart/form-data" accept-charset="UTF-8" style={{display: "block"}}>
                            <ul id="profile-tabs" className="nav nav-tabs" data-tabs="tabs">
                                <li className="active">
                                    <a href="#tab-0" data-toggle="tab" aria-expanded="true"></a>
                                </li>
                            </ul>

                            <div className="tab-content">
                                <div className="tab-pane active" data-tab-index="0" id="tab-0">

                                    <div className="form-group field-usereditform-email required">
                                        <label className="control-label" for="usereditform-email">&nbsp;Template <span style={{color:"#ff0404"}}>(*) </span>
                                            <br/>  
                                            <ul className="file-upload-requirement">
                                                <li>
                                                    <a href={file_assets+"template/import_template_claimSFF.xlsx"}>download</a>
                                                </li>
                                            </ul>
                                        </label>
                                    </div>


                                    <div className="form-group field-usereditform-email required">
                                        <label className="control-label" for="usereditform-email">&nbsp;Import file   <span style={{color:"#ff0404"}}>(*) </span>
                                            <br/> 
                                            <ul className="file-upload-requirement">
                                                <li>
                                                    follow the instructions in the template
                                                </li>
                                                <li>
                                                    one file only
                                                </li>
                                                <li>
                                                    10 MB limit or no more than 50000 row
                                                </li>
                                                <li>
                                                    Allowed types for worksheet : xls, xlsx or csv
                                                </li>
                                            </ul>
                                        </label>
                                        <br/>
                                        <input type="file" name="file" id="file" size="40" 
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                                        ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} required/>
                                        <br/><br/><br/>
                                        <span className='badge badge-primary' id="upload-name" name="upload-name"></span>
                                        <div className="help-block"></div>
                                    </div>


                                </div>

                            </div>
                            <input type="hidden" name="hdnkey" value="{/*php echo $drow['id']; */}"/>    
                            <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Import</button>&nbsp;
                        </form>

                        </div>
                    </div>
                </div>
        </>
    )
}
export default ImportClaimSFF;





