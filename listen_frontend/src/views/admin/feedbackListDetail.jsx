import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useNavigate } from 'react-router';
import { securityData } from '../../helpers/globalHelper';


function FeedbackListDetail(props){
    const history = useNavigate()

    const routeAdmin = routeAll.routesAdmin
    const nameType = new URLSearchParams(props.location.search).get('type')

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [items, setItems] = useState([])
    const [user_id, setUser_id] = useState("")

    const platform_id = securityData.Security_getPlatformId()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('dialogueFeedback/SelectData',data);
            
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

    const DeleteConfirm = ()=>{
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

    const submit = async(e) => {
        e.preventDefault();
        if(!cancelDelete){
            if(!deleteData){

                const fd = new FormData();
                fd.append("flag_is_like", items.flag_is_like);
                fd.append("reason", items.reason)
                fd.append("status_active", items.status_active);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                if(editData){
                    //for edit data
                    fd.append("id",items.id);
                    let responseJson = await axiosLibrary.postData("dialogueFeedback/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.feedbackList.path)
                    }else{
                        alert(responseJson);
                    }
                }else{
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("dialogueFeedback/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.feedbackList.path)
                    }else{
                        alert(responseJson);
                    }
                }
            }else{
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("dialogueFeedback/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.feedbackList.path)
                }else{
                    alert(responseJson);
                }
            }
        }
        setCancelDelete(false)
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    return(
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-end btn btn-default" href={routeAdmin.feedbackList.path} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                    </div>
                </div>
                <div className="panel-body">
                    <form id="czfrom" onSubmit={submit} method="post" style={{display: "block"}} encType='multipart/form-data'>
                        <ul id="profile-tabs" className="nav nav-tabs" data-tabs="tabs">
                            <li className="active">
                                <a href="#tab-0" data-toggle="tab" aria-expanded="true">{editData ? 'Edit : '+nameType: 'New Data' }</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                <div className="mb-3 field-profile-country">
                                        <label className="form-label">&nbsp;Feedback Flag</label>
                                        <select id="profile-country" style={{width:"150px"}} className="form-control" name="flag_is_like"  value={items.flag_is_like||''} onChange={handleInputChange.bind(this)} required>
                                            {editData ? null: <option value="">... Select this ...</option> }
                                            <option value="0">Don’t Like</option>
                                            <option value="1">Like</option>
                                        </select>

                                        <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Reason <span style={{color:"#ff0404"}}>(*) </span></label>
                                    <input type="text" id="reason" style={{width:"75%"}} className="form-control" name="reason" value={items.reason||''} onChange={handleInputChange}   aria-required="true" aria-invalid="false" required/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-profile-country">
                                        <label className="form-label">&nbsp;Status Active</label>
                                        <select id="profile-country" style={{width:"150px"}} className="form-control" name="status_active"  value={items.status_active||''} onChange={handleInputChange.bind(this)} required>
                                            {editData ? null: <option value="">... Select this ...</option> }
                                            <option value="0">inactive</option>
                                            <option value="1">active</option>
                                        </select>

                                        <div className="help-block"></div>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" name="hdnkey" value={items.id||''}/>    
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                        {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                    </form>
                </div>
            </div>
        </div>
    )
}

export default FeedbackListDetail;