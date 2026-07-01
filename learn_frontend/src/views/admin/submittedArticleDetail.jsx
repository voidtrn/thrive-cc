import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { env, securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function SubmittedArticleDetail(props){
    
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns= "";
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const file_path = env.userDocument
    
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
            let response = await axiosLibrary.postData('awbSubmittedArticle/SelectData',data);
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
                
                fd.append("title", items.title);
                fd.append("title_ind", items.title_ind);
                fd.append("status", items.status);
                fd.append("description", items.description);
                fd.append("description_ind", items.description_ind);

                fd.append("user_modified", user_id);
                fd.append("user_created", items.user_created);
                fd.append("platform_id", platform_id);

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbSubmittedArticle/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.submittedArticle.path)
                    }else{
                        alert(responseJson);
                    }
                // } else {
                //     //for insert data
                //     fd.append("user_created", user_id);
                //     let responseJson = await axiosLibrary.postData("awbSubmittedArticle/InsertData", fd);
                //     if(responseJson.status === 200){
                //         alert("DATA HAS BEEN CREATED");
                //         history.push(routeAdmin.submittedArticle.path)
                //     }else{
                //         alert(responseJson);
                //     }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbSubmittedArticle/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.submittedArticle.path)
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
                    <a className="float-end btn btn-default" href={routeAdmin.submittedArticle.path} label="Back to overview" data-ui-loader="">
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
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Title <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"350px"}} maxLength="50" className="form-control"
                                                name="title" value={items.title} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <ul className="file-upload-requirement">
                                                <li>
                                                max 50 of chars
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Short Description <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" maxLength="100"
                                                name="description" value={items.description} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Submitter </label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" maxLength="100" disabled
                                                name="name_created" value={items.name_created} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <input type="hidden"  name="user_created" value={items.user_created}></input>
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Document </label><br/>
                                            <input type="text" id="download" style={{width:"75%",display:"inline"}} className="form-control" disabled
                                                name="article_doc" value={items.article_doc} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <span>&nbsp;</span>
                                            <a href={file_path + 'article/' + items.article_doc}>
                                                <i className="fa fa-download" ></i>
                                            </a>
                                        </div>

                                        <div className="mb-3 field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.status} onChange={handleInputChange.bind(this)} required name="status" aria-invalid="false">
                                                <option value="1">submitted</option>
                                                <option value="2">on going</option>
                                                <option value="3">completed</option>
                                                <option value="4">rejected</option>
                                            </select>

                                            <div className="help-block"></div>
                                        </div>

                                        <div className="mb-3 field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Date Submitted Article </label>
                                            <input type="text" id="sub_article" style={{width:"75%"}} className="form-control" disabled
                                                name="date_created" value={items.date_created} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>

                    {/* <input type="hidden" name="hdnkey" value={items._code||''}/>     */}
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                    {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default SubmittedArticleDetail;