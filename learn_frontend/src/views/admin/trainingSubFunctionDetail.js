import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function SubFunctionTrainingDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [loading, setLoading] = useState(true)

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbTrainingSubfunction/SelectData',data);
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

    const submit= async (e) =>{
        e.preventDefault();
        if(!cancelDelete){
            if(!deleteData){
                const fd = new FormData();
                
                fd.append("sub_function", items.sub_function);
                fd.append("status_active", items.status_active);

                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbTrainingSubfunction/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.trainingAdminSubFunction.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbTrainingSubfunction/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.trainingAdminSubFunction.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    training_id:items.id,
                    platform_id:platform_id
                }
                let responseJson = await axiosLibrary.postData("awbTrainingSubfunction/DeleteData", parameter);
                if(responseJson.status === 200){
                    if (responseJson.data.data){
                        alert("DATA HAS BEEN DELETED");
                        history.push(routeAdmin.trainingAdminSubFunction.path)
                    }else{
                        alert("CANNOT BE DELETED");
                    }
                    
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
    },[Columns])

    return( 
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-right btn btn-default" href={routeAdmin.trainingAdminSubFunction.path} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                    </div>
                </div>
                <LoadingAdmin loading={loading}/> 
                <div className="panel-body" style={cssTarget(loading)}>
                {/* <div className="panel-body"> */}
                    <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                    
                        <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.name: 'New Data' }</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <div className="form-group field-usereditform-username required">
                                                <label className="control-label" htmlFor="usereditform-username">&nbsp;Sub Function Name <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-username" style={{width:"75%"}} className="form-control" required
                                                    name="sub_function" value={items.sub_function} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="form-group field-profile-country">
                                                <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                                <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                    value={items.status_active} onChange={handleInputChange.bind(this)} required name="status_active" aria-invalid="false">
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

export default SubFunctionTrainingDetail;