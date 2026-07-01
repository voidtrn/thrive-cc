import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tabs, Tab } from 'react-bootstrap';

function WebConfigDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = ""
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const [editData, setEditData] = useState(false)
    
    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    // const limit = 10

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbWebConfig/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const submit= async (e) =>{
        e.preventDefault();
        const fd = new FormData();
        fd.append("_code", items._code);
        fd.append("value", items.value);
        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);

        if(editData){
            //for edit data
            fd.append("id", items.id);
            let responseJson = await axiosLibrary.postData("awbWebConfig/UpdateData", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN UPDATED");
                history.push(routeAdmin.webConfig.path)
            }else{
                alert(responseJson);
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
    },[Columns])

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-right btn btn-default" href={routeAdmin.webConfig.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
                <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                    <Tabs  
                        id="tab-menu"
                        activeKey="detail"
                        onSelect=""
                        className="mb-3 tab-menu tab-header">

                        <Tab eventKey="detail" title={editData ? 'Edit: ' + items._code: 'New Data' }>
                        </Tab>
                    </Tabs>
                    <div className="form-group field-usereditform-email">
                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Config </label>
                        <input type="text" id="usereditform-email" style={{width:"80%"}} className="form-control" name="code" value={items._code || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" />
                        <div className="help-block"></div>
                    </div>

                    <div className="form-group field-usereditform-email">
                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Value </label>
                        <input type="text" id="usereditform-email" style={{width:"100%"}} className="form-control" name="value" value={items.value || ''} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                        <div className="help-block"></div>
                    </div>

                    <div style={{textAlign:"center"}}>

                    </div>

                    <input type="hidden" name="hdnkey" value={items._code||''}/>    
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit">Update</button>&nbsp;
                    {/* {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}        */}

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default WebConfigDetail;