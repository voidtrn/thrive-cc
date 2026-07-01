import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function TrainingDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])
    const [listSubFunction, setListSubFunction] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [loading, setLoading] = useState(true)

    const routeAdmin = routeAll.routesAdmin
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getListSubFunction= useCallback(async() =>{
        const data = {
            limit: 1000,
            offset:0,
            category:"",
            platform_id:platform_id
        };

        let response = await axiosLibrary.postData('awbTrainingSubfunction/ListData',data);
        if(response.status === 200){
            setListSubFunction(response.data.data)              
        }else{
            alert(response);
        }

    },[platform_id])

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbTraining/SelectData',data);
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
                
                fd.append("name", items.name);
                fd.append("status_active", items.status_active);
                fd.append("sub_function_id", items.sub_function_id);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbTraining/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.trainingAdmin.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbTraining/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.trainingAdmin.path)
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
                let responseJson = await axiosLibrary.postData("awbTraining/DeleteData", parameter);
                if(responseJson.status === 200){
                    if (responseJson.data.data){
                        alert("DATA HAS BEEN DELETED");
                        history.push(routeAdmin.trainingAdmin.path)
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
        getListSubFunction()
    },[Columns])

    return( 
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-end btn btn-default" href={routeAdmin.trainingAdmin.path} label="Back to overview" data-ui-loader="">
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
                                            <div className="mb-3 field-usereditform-email required">
                                                <label className="form-label" htmlFor="usereditform-email">&nbsp;Sub Function </label>
                                          
                                                    <select value={items.sub_function_id} required
                                                        onChange={handleInputChange.bind(this)} id="sub_function_id" name="sub_function_id" style={{width:"300px"}} className="form-control">
                                                        <option value="">... Select this ...</option>
                                                        {listSubFunction.map(
                                                            (itemSection) =>
                                                            <option key={itemSection.id} value={itemSection.id}>{itemSection.sub_function}</option>
                                                        )
                                                        }
                                                    </select>
                                                
                                                
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="mb-3 field-usereditform-username required">
                                                <label className="form-label" htmlFor="usereditform-username">&nbsp;Training Name <span style={{color:"#ff0404"}}>(*)</span></label>
                                                <input type="text" id="usereditform-username" style={{width:"75%"}} className="form-control" required
                                                    name="name" value={items.name} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div>

                                            <div className="mb-3 field-profile-country">
                                                <label className="form-label" htmlFor="profile-country">&nbsp;Status Active</label>
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

export default TrainingDetail;