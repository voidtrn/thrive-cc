import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function TrainingScheduleDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    const [items, setItems] = useState([])
    const [trainingData, setTrainingData] = useState([])
    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [loading, setLoading] = useState(true)

    const routeAdmin = routeAll.routesAdmin
    
    // const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbTrainingSchedule/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                getTrainingData()
                // setLoading(false)
            }else{
                alert(response);
                // setLoading(false)
            }
        }else{
            // setLoading(false)
            getTrainingData()
        }
    },[props.location.search])

    const getTrainingData= useCallback(async() =>{
        let awb_training_id = new URLSearchParams(props.location.search).get('uid')
        const data = {
            md5ID: await axiosLibrary.getmd5FromBackend(awb_training_id)
        }
        if(data.md5ID!== null){
            let response = await axiosLibrary.postData('awbTraining/SelectData',data);
            if(response.status === 200){
                setTrainingData(response.data.data)
                if (!editData){
                    setItems(items=>({...items, awb_training_id: response.data.data.id}))
                }
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
                
                fd.append("schedule_date", items.schedule_date);
                // fd.append("schedule_start_time", items.schedule_date +' '+items.schedule_start_time);
                // fd.append("schedule_end_time", items.schedule_date +' '+items.schedule_end_time);

                fd.append("schedule_start_time", items.schedule_start_time);
                fd.append("schedule_end_time", items.schedule_end_time);
                fd.append("registration_end_date", items.registration_end_date+' 23:59:00');
                fd.append("capacity", items.capacity);
                fd.append("schedule_confirmation", items.schedule_confirmation);
                fd.append("hyperlink_url", items.hyperlink_url);
                fd.append("awb_training_id", items.awb_training_id);

                fd.append("user_modified", user_id);
                // fd.append("platform_id", platform_id);
                

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbTrainingSchedule/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        backToOverview()
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbTrainingSchedule/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        backToOverview()
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id,
                    user_deleted: user_id
                }
                let responseJson = await axiosLibrary.postData("awbTrainingSchedule/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    backToOverview()
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
    },[props.location.search])

    const backToOverview= async()=>{
        const idParam = items.awb_training_id
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.trainingScheduleAdmin.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+ "&" + new URLSearchParams({uid:idParam}) 
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
                    <a className="float-end btn btn-default" onClick={backToOverview.bind(this)} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
            {/* <div className="panel-body"> */}
                
                <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                    <Row className="clearfix">
                        <Col sm={12}>
                            <Nav variant="tabs" className="tab-menu tab-header">
                                <Nav.Item>
                                    <Nav.Link eventKey="#tab-0">{editData ? 'Edit Schedule : '+trainingData.name: 'New Schedule : '+trainingData.name }</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={12}>
                            <Tab.Content animation="true">
                                <Tab.Pane eventKey="#tab-0">
                                    <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Date <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="date" id="schedule_date" style={{width:"150px"}} className="form-control"
                                                name="schedule_date" value={items.schedule_date} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Start Time <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="schedule_start_time" style={{width:"150px"}} className="form-control" placeholder="hh:ii"
                                                name="schedule_start_time" value={items.schedule_start_time} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;End Time <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="schedule_end_time" style={{width:"150px"}} className="form-control" placeholder="hh:ii"
                                                name="schedule_end_time" value={items.schedule_end_time} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;End Date Registration <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="date" id="registration_end_date" style={{width:"150px"}} className="form-control"
                                                name="registration_end_date" value={items.registration_end_date} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Capacity <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="number" id="capacity" style={{width:"150px"}} className="form-control" required
                                                name="capacity" value={items.capacity} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Schedule Confirmation <span style={{color:"#ff0404"}}>(*)</span></label>
                                           
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                    value={items.schedule_confirmation} onChange={handleInputChange.bind(this)} required name="schedule_confirmation" aria-invalid="false">
                                                    {editData ? null: 
                                                    <option value="">... Select this ...</option> }
                                                    <option value="1">Yes</option>
                                                    <option value="0">No</option>
                                                </select>

                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Link Conference <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="hyperlink_url" className="form-control"
                                                name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>                                        
  
                                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                                        {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}

                                    </form>     
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>       
            </div>
        </div>
    </div>
    )
}

export default TrainingScheduleDetail;