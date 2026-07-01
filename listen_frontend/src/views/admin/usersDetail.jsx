import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useNavigate } from 'react-router';

function UsersDetail(props){
    const history = useNavigate()
    const routeAdmin = routeAll.routesAdmin
    const nameType = new URLSearchParams(props.location.search).get('type')

    const [items, setItems] = useState([])
    const [editData, setEditData] = useState(false)
    const [user_id, setUser_id] = useState("")

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('dialogueUser/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
            }else{
                alert(response);
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
            fd.append("status_enable", items.status_enable);
            fd.append("user_modified", user_id);

            if(editData){
                //for edit data
                let responseJson = await axiosLibrary.postData("dialogueUser/UpdateData", fd);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN UPDATED");
                    history.push(routeAdmin.users.path)
                }else{
                    alert(responseJson);
                }
            }else{
                //for insert data
                fd.append("user_created", user_id);
                let responseJson = await axiosLibrary.postData("dialogueUser/InsertData", fd);
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
                            <a  className="float-end btn btn-default" label="Back to overview" data-ui-loader="" href={routeAdmin.users.path} >
                                <i className="fa fa-arrow-left aria-hidden=" true></i> Back to overview</a>        
                        </div>
                    </div>
                    <div className="panel-body">

                        <form id="czfrom"  encType="multipart/form-data" acceptCharset="UTF-8" style={{display: "block"}} onSubmit={submit}   method="post" >
                            <ul id="profile-tabs" className="nav nav-tabs" data-tabs="tabs">
                                <li className="active">
                                    <a href="#tab-0" data-toggle="tab" aria-expanded="true">{editData ? 'Edit ' + nameType: 'New' } Data</a>
                                </li>
                            </ul>
                            <ul id="profile-tabs" className="nav nav-tabs" data-tabs="tabs">
                                <li className="active">
                                    <a href="#tab-0" data-toggle="tab" aria-expanded="true">Account</a>
                                </li>
                                <li className="">
                                    <a href="#tab-1" data-toggle="tab" aria-expanded="false">General</a>
                                </li>
                            </ul>    
                        <div className="tab-content">
                            <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                <div className="mb-3 field-usereditform-email">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Employee ID </label>
                                    <input type="text" id="usereditform-email" style={{width:"45%"}} className="form-control" name="id" value={items.id || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="50"/>
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-usereditform-email">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Account </label>
                                    <input type="text" id="usereditform-email" style={{width:"45%"}} className="form-control" name="account" value={items.account || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="50" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-usereditform-email">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Email </label>
                                    <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="email" value={items.email || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="250" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-usereditform-email">
                                <label className="form-label">&nbsp;Status Active</label>
                                    <select id="status_active" style={{width:"150px"}} className="form-control" name="status_active" value={items.status_active || ''} onChange={handleInputChange} disabled={editData ? true : false } >
                                    {editData ? null: <option value="">... Select this ...</option> }
                                            <option value="0">inactive</option>
                                            <option value="1">active</option>
                                    </select>
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-usereditform-email">
                                <label className="form-label">&nbsp;Status Enable</label>
                                    <select id="status_active" style={{width:"150px"}} className="form-control" name="status_enable" value={items.status_enable || ''} onChange={handleInputChange}>
                                    {editData ? null: <option value="">... Select this ...</option> }
                                        <option value="1">Enabled</option>
                                        <option value="0">Disabled</option>
                                    </select>
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-usereditform-email">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Start Date </label>
                                    <input type="date" id="usereditform-email" style={{width:"45%"}} className="form-control" name="validity_start_date" value={items.validity_start_date || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false"  />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-usereditform-email">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;End Date </label>
                                    <input type="date" id="usereditform-email" style={{width:"45%"}} className="form-control" name="validity_end_date" value={items.validity_end_date || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" />
                                    <div className="help-block"></div>
                                </div>
                            </div>
                            <div className="tab-pane" data-tab-index="1" id="tab-1">
                                <div className="mb-3 field-profile-firstname">
                                    <label className="form-label" htmlFor="profile-firstname">Name</label>
                                    <input type="text" id="profile-firstname" style={{width:"75%"}} className="form-control" name="name" value={items.name || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" aria-invalid="false" maxLength="100" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">Title</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="title" value={items.title || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">Business Unit</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="business_unit" value={items.business_unit || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">Directorate</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="directorate" value={items.directorate || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">Division P</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="division_p" value={items.division_p || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">Division Q</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="division_q" value={items.division_q || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">Department</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="department" value={items.department || ''} onChange={handleInputChange} disabled={editData ? true : false } aria-required="true" maxLength="500" />
                                    <div className="help-block"></div> 
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">First Login</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="first_login" value={items.first_login || ''} disabled aria-required="true" />
                                    <div className="help-block"></div>
                                </div>
                                <div className="mb-3 field-profile-lastname">
                                    <label className="form-label" htmlFor="profile-lastname">Last Login</label>
                                    <input type="text" id="profile-lastname" style={{width:"75%"}} className="form-control" name="last_login" value={items.last_login || ''} disabled aria-required="true" />
                                    <div className="help-block"></div>
                                </div>
                            </div>
                        </div>
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