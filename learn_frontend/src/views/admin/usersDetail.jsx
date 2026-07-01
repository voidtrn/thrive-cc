import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tabs, Tab, Row, Col, Nav } from 'react-bootstrap'; 
import { securityData } from '../../helpers/globalHelper';

function UsersDetail(props){
    const history = useHistory()
    const routeAdmin = routeAll.routesAdmin
    const nameType = new URLSearchParams(props.location.search).get('type')

    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    const [editData, setEditData] = useState(false)
    const [user_id, setUser_id] = useState("")

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            const param = {
                md5ID: data.md5ID,
                platform_id:securityData.Security_getPlatformId()
            }
            let response = await axiosLibrary.postData('awbUser/SelectData',param);
            if(response.status === 200){
                setItems(response.data.data)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }
    },[props.location.search])

    const getUserId = useCallback(() => {
        var dataUser = axiosLibrary.getUserInfo();
        setUser_id(dataUser.id)
        getDetail()
    },[getDetail])

    useEffect(()=>{
        getUserId()
    },[getUserId])

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    const submit = async (e) =>{
        e.preventDefault();

            const fd = new FormData();
            fd.append("id", items.id);
            fd.append("employee_id", items.employee_id);
            fd.append("name", items.name);
            fd.append("account", items.account);
            fd.append("email", items.email);
            fd.append("validity_start_date", items.validity_start_date);
            fd.append("validity_end_date", items.validity_end_date);
            fd.append("title", items.title);
            fd.append("business_unit", items.business_unit);
            fd.append("directorate", items.directorate);
            fd.append("division_p", items.division_p);
            fd.append("division_q", items.division_q);
            fd.append("department", items.department);
            fd.append("status_active", items.status_active);
            // fd.append("status_enable", items.status_enable);
            fd.append("user_modified", user_id);

            if(editData){
                //for edit data
                let responseJson = await axiosLibrary.postData("awbUser/UpdateData", fd);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN UPDATED");
                    history.push(routeAdmin.users.path)
                }else{
                    alert(responseJson);
                }
            }else{
                //for insert data
                fd.append("user_created", user_id);
                let responseJson = await axiosLibrary.postData("awbUser/InsertData", fd);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN CREATED");
                    history.push(routeAdmin.users.path)
                }else{
                    alert(responseJson);
                }
            }
    }

    return(
        <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>
                    <div className="clearfix">
                        <div className="panel-body">
                            <a  className="float-right btn btn-default" label="Back to overview" data-ui-loader="" href={routeAdmin.users.path} >
                                <i className="fa fa-arrow-left aria-hidden=" true></i> Back to overview</a>        
                        </div>
                    </div>
                    <LoadingAdmin loading={loading}/> 
                    <div className="panel-body" style={cssTarget(loading)}>

                        <form id="czfrom"  encType="multipart/form-data" acceptCharset="UTF-8" style={{display: "block"}} onSubmit={submit}   method="post" >
                            
                            <Tabs  
                                id="tab-header"
                                activeKey="users"
                                onSelect=""
                                className="mb-3 tab-menu tab-header">

                                <Tab eventKey="users" title={editData ? 'Edit ' + nameType + ' Data': 'New Data' }>
                                </Tab>
                                
                            </Tabs>
                            
                            <Tab.Container id="profile-tabs" defaultActiveKey="#tab-0">
                                <Row className="clearfix">
                                    <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">Account</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">General</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                    </Col>
                                    <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;IMDL ID </label>
                                                <input type="text" id="usereditform-email" style={{width:"45%"}} className="form-control" name="id" value={items.id || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="50"/>
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-usereditform-username required">
                                                <label className="control-label" style={{display:"block"}} forHtml="usereditform-username">{'Redeem Points, Tier Points & Level'}</label>
                                                <p>
                                                    <input type="text" id="usereditform-username" style={{width:"20%",display:"inline-table",textAlign:"right"}} 
                                                        className="form-control" name="id" placeholder="redeem point" 
                                                        value={items.redeem_point?items.redeem_point:0} 
                                                        disabled aria-required="true" aria-invalid="false" maxLength="50" />{' '}
                                                    <input type="text" id="usereditform-username" style={{width:"20%",display:"inline-table",textAlign:"right"}} 
                                                        className="form-control" name="id" placeholder="tier point" 
                                                        value={items.tier_point?items.tier_point:0} 
                                                        disabled aria-required="true" aria-invalid="false" maxLength="50" />
                                                </p>
                                                <input type="text" id="usereditform-username" style={{width:"65%",display:"inline-table"}} className="form-control" name="id" 
                                                    placeholder="user level" value={items.user_level? items.user_level:'new kids on the block'} 
                                                    disabled aria-required="true" aria-invalid="false" maxLength="50" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Account </label>
                                                <input type="text" id="usereditform-email" style={{width:"45%"}} className="form-control" name="account" value={items.account || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="50" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Email </label>
                                                <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="email" value={items.email || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="250" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-usereditform-email">
                                            <label className="control-label">&nbsp;Status Active</label>
                                                <select id="status_active" style={{width:"150px"}} className="form-control" name="status_active" value={items.status_active || ''} onChange={handleInputChange} disabled={editData ? true : false } >
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                        <option value="0">inactive</option>
                                                        <option value="1">active</option>
                                                </select>
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Category User </label>
                                                <input type="text" id="usereditform-email" style={{width:"40%"}} className="form-control" name="group_id" value={{
                                                    [0]:'USER',
                                                    [1]:'TRAINING ADMIN REPORT',
                                                    [2]:'TRAINING ADMIN',
                                                    [3]:'ADMINISTRATOR',
                                                    [4]:'SUPER ADMIN'
                                                }[items.group_id]} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="250" />
                                                <div className="help-block"></div>
                                            </div>
                                            {/*<div className="form-group field-usereditform-email">
                                            <label className="control-label">&nbsp;Status Enable</label>
                                                <select id="status_active" style={{width:"150px"}} className="form-control" name="status_enable" value={items.status_enable || ''} onChange={handleInputChange}>
                                                {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="1">Enabled</option>
                                                    <option value="0">Disabled</option>
                                                </select>
                                                <div className="help-block"></div>
                                            </div>*/}
                                            {/* <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;Start Date </label>
                                                <input type="date" id="usereditform-email" style={{width:"45%"}} className="form-control" name="validity_start_date" value={items.validity_start_date || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false"  />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-usereditform-email">
                                                <label className="control-label" htmlFor="usereditform-email">&nbsp;End Date </label>
                                                <input type="date" id="usereditform-email" style={{width:"45%"}} className="form-control" name="validity_end_date" value={items.validity_end_date || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" />
                                                <div className="help-block"></div>
                                            </div> */}
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-1">
                                            <div className="form-group field-profile-firstname">
                                                <label className="control-label" htmlFor="profile-firstname">Name</label>
                                                <input type="text" id="profile-firstname" style={{width:"75%"}} className="form-control" name="name" value={items.name || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="100" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">Title</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="title" value={items.title || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">Business Unit</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="business_unit" value={items.business_unit || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">Directorate</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="directorate" value={items.directorate || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">Division P</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="division_p" value={items.division_p || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">Division Q</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="division_q" value={items.division_q || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">Department</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="department" value={items.department || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                                <div className="help-block"></div> 
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">First Login</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="first_login" value={items.awb_first_login || ''} disabled aria-required="true" />
                                                <div className="help-block"></div>
                                            </div>
                                            <div className="form-group field-profile-lastname">
                                                <label className="control-label" htmlFor="profile-lastname">Last Login</label>
                                                <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="last_login" value={items.awb_last_access || ''} disabled aria-required="true" />
                                                <div className="help-block"></div>
                                            </div>
                                        </Tab.Pane>
                                    </Tab.Content>
                                    </Col>
                                </Row>
                            </Tab.Container>
                            
                        <input type="hidden" name="hdnkey" value={items.id || ''}/>    
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                        {/*(editData==false ? null : <button className="btn btn-danger" name="btnDelete" onClick={this.DeleteConfirm.bind(this)} value="delete">Delete</button> )*/}       
                        </form>
                </div>
            </div>
        </div>

    )
}

export default UsersDetail;