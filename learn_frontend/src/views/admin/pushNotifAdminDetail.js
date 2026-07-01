import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function PushNotifAdminDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns= "";
    const [items, setItems] = useState([])

    const [editData, setEditData] = useState(false)
    const [loading, setLoading] = useState(true)
    const [postNotifAct, setPostNotifAct] = useState(false)
    const [cancelPostNotif, setCancelPostNotif] = useState(false)

    
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
            let response = await axiosLibrary.postData('awbNotifAdmin/SelectData',data);
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

    const PostNotif=  async ()=>{
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure to push this notification?")) 
        {
            if(items.flag_active==1){
                setPostNotifAct(true)
                setCancelPostNotif(false)
            }else{
                setCancelPostNotif(true)
                alert("Status must be active to push this notification")
            }
            
        } 
        else
        {
            setCancelPostNotif(true)
        } 
    }

    const submit= async (e) =>{
        e.preventDefault();

        if(!cancelPostNotif){
            const fd = new FormData();
            
            fd.append("title", items.title);
            fd.append("title_ind", items.title_ind);

            if(items.hyperlink_url){
                fd.append("hyperlink_url", items.hyperlink_url);
            }else{
                fd.append("hyperlink_url", '');
            }
            
            fd.append("user_id", user_id);
            fd.append("platform_id", platform_id);

            if(postNotifAct){
                fd.append("flag_posted", 1);
            }

            if(editData){
                //for edit data
                fd.append("id", items.id);
                
                let responseJson = await axiosLibrary.postData("awbNotifAdmin/UpdateData", fd);
                if(responseJson.status === 200){

                    if(postNotifAct){
                        alert("NOTIFICATION HAS BEEN PUSHED");
                    }else{
                        alert("DATA HAS BEEN UPDATED");
                    }
                    
                    history.push(routeAdmin.pushNotifAdmin.path)
                }else{
                    alert(responseJson);
                }
            }else{
                //for insert data
                fd.append("user_created", user_id);
                
                let responseJson = await axiosLibrary.postData("awbNotifAdmin/InsertData", fd);
                if(responseJson.status === 200){
                    
                    if(postNotifAct){
                        alert("NOTIFICATION HAS BEEN PUSHED");
                    }else{
                        alert("DATA HAS BEEN CREATED");
                    }

                    history.push(routeAdmin.pushNotifAdmin.path)
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
                    <a className="float-right btn btn-default" href={routeAdmin.pushNotifAdmin.path} label="Back to overview" data-ui-loader="">
                        <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                </div>
            </div>
            <LoadingAdmin loading={loading}/> 
            <div className="panel-body" style={cssTarget(loading)}>
                <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                   
                    <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                        <Row className="clearfix">
                            <Col sm={12}>
                                <Nav variant="tabs" className="tab-menu tab-header">
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit ': 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Notif Eng <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea style={{width:"100%",height:"75px"}} className="form-control"  disabled={items.flag_posted===1?true:false}
                                                name="title" aria-required="true" aria-invalid="false" value={items.title} onChange={handleInputChange} required></textarea>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-username required">
                                            <label className="control-label" htmlFor="usereditform-username">&nbsp;Notif Ind <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <textarea style={{width:"100%",height:"75px"}} className="form-control" disabled={items.flag_posted===1?true:false}
                                                name="title_ind" aria-required="true" aria-invalid="false" value={items.title_ind} onChange={handleInputChange} required></textarea>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;URL </label>
                                            <input type="text" id="hyperlink_url" style={{width:"75%"}} className="form-control" disabled={items.flag_posted===1?true:false}
                                                name="hyperlink_url" value={items.hyperlink_url} onChange={handleInputChange} aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Posted</label>
                                            <select id="profile-country" style={{width:"200px"}} className="form-control" disabled
                                                value={items.flag_posted} onChange={handleInputChange} required name="flag_posted" aria-invalid="false">
                                                {editData ? null: <option value="">new</option> }
                                                <option value="1">posted</option>
                                                <option value="0">not posted</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"200px"}} className="form-control"  disabled={items.flag_posted===1?true:false}
                                                value={items.flag_active} onChange={handleInputChange} required name="flag_active" aria-invalid="false">
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                <option value="1">active</option>
                                                <option value="0">inactive</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>

                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>

                    <input type="hidden" name="hdnkey" value={items._code||''}/>    
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit">Save</button>&nbsp;
                    <button className="btn btn-warning" name="btnDelete" onClick={PostNotif.bind(this)} value="delete" disabled={items.flag_posted===1?true:false}>Push</button>
                    {/* {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}        */}

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default PushNotifAdminDetail;