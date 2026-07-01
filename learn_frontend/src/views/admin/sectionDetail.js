import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from 'react-router';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function SectionDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = ""
    const [items, setItems] = useState([])

    const [editData, setEditData] = useState(false)
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
            let response = await axiosLibrary.postData('awbSection/SelectData',data);
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
        fd.append("id", items.id);
        fd.append("_code", items._code);
        fd.append("title", items.title);
        fd.append("navbar_active", items.navbar_active);
        fd.append("flag_active", items.flag_active);
        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);

        if(editData){
            //for edit data
            let responseJson = await axiosLibrary.postData("awbSection/UpdateData", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN UPDATED");
                history.push(routeAdmin.section.path)
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
                    <a className="float-right btn btn-default" href={routeAdmin.section.path} label="Back to overview" data-ui-loader="">
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
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items._code: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Section </label>
                                            <input type="text" id="usereditform-email" style={{width:"300px"}} className="form-control" disabled
                                                name="_code" value={items._code} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Title <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input style={{width:"100%",height:"75%"}} className="form-control"
                                                name="title" aria-required="true" aria-invalid="false" value={items.title} onChange={handleInputChange} />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
                                                {/* {editData ? null: <option value="">... Select this ...</option> } */}
                                                <option value="1">active</option>
                                                <option value="0"> inactive</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>
                                        
                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Navbar Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.navbar_active} onChange={handleInputChange.bind(this)} required name="navbar_active" aria-invalid="false">
                                                {/* {editData ? null: <option value="">... Select this ...</option> } */}
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
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit">Update</button>&nbsp;
                    {/* {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}        */}

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default SectionDetail;