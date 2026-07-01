import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { useNavigate, useLocation } from 'react-router';

function UftConfigDetail(props){
    const location = useLocation()
    const history = useNavigate()
    const routeAdmin = routeAll.routesAdmin
    const file_path = env.userDocument

    const [editData, setEditData] = useState(false)
    const deleteData = false
    const [cancelDelete, setCancelDelete] = useState(false)
    const [items, setItems] = useState([])
    const [user_id, setUser_id] = useState("")
    const [user_account, setUser_account] = useState("")

    // const platform_id = securityData.Security_getPlatformId()||''
    const platform_id = securityData.Security_getPlatformId()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(location.search).get('data'),
            platform_id: platform_id
        }
        if(data.platform_id !== null){
            setEditData(true)
            let response = await axiosLibrary.postData('uftConfig/SelectData',data);
            
            if(response.status === 200){
                setItems(response.data.data)
            }else{
                alert(response);
            }
        }
    },[file_path,location.search])

    const getUserId = useCallback(() => {
        var dataUser = axiosLibrary.getUserInfo();
        setUser_id(dataUser.id)
        setUser_account(dataUser.account)
        getDetail()
    },[getDetail])

    useEffect(()=>{
        getUserId()
    },[getUserId])

    const validateImage = (e) => {
        e.preventDefault();
            submit();
            return true
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;
        setItems(stateCopy)
    }

    const validateForm = ()=>{
        let formIsValid = true;
        if (items.valid_from > items.valid_to){
            formIsValid = false;
            alert("Start date cannot be later than end date");
        }
        return formIsValid;
    }

    const submit= async () =>{
        if(validateForm()){
            if(!cancelDelete){
                if(!deleteData){

                    const fd = new FormData();
                    fd.append("parameter", items.parameter);
                    fd.append("value", items.value);
                    fd.append("user_modified", user_id);
                    fd.append("platform_id", platform_id);
                    fd.append("user_account", user_account)

                    if(editData){
                        //for edit data
                        fd.append("id",items.id);
                        let responseJson = await axiosLibrary.postData("uftConfig/UpdateData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN UPDATED");
                            history(routeAdmin.uftConfigDetail.path)
                        }else{
                            alert(responseJson);
                        }
                    }else{
                        //for insert data
                        fd.append("user_created", user_id);
                        let responseJson = await axiosLibrary.postData("uftConfig/InsertData", fd);
                        if(responseJson.status === 200){
                            alert("DATA HAS BEEN CREATED");
                            history(routeAdmin.uftConfigDetail.path)
                        }else{
                            alert(responseJson);
                        }
                    }
                }else{
                    //for delete data
                    const parameter = {
                        id:items.id
                    }
                    let responseJson = await axiosLibrary.postData("uftConfig/DeleteData", parameter);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN DELETED");
                        history(routeAdmin.uftConfigDetail.path)
                    }else{
                        alert(responseJson);
                    }
                }
            }
            setCancelDelete(false)
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
                        <a className="float-end btn btn-default" href={routeAdmin.slider.path} label="Back to overview" data-ui-loader="">
                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                    </div>
                </div>
                <div className="panel-body">
                    <form id="czfrom" onSubmit={validateImage} method="post" style={{display: "block"}} encType='multipart/form-data'>
                        <ul id="profile-tabs" className="nav nav-tabs" data-tabs="tabs">
                            <li className="active">
                                <a href="#tab-0" data-toggle="tab" aria-expanded="true">{editData ? 'Edit: '+ items.parameter : 'New Data' }</a>
                            </li>
                        </ul> 
                        <div className="tab-content">
                            <div className="tab-pane active" data-tab-index="0" id="tab-0">
                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Parameter <span style={{color:"#ff0404"}}>(*) </span></label>
                                    <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="parameter" value={items.parameter||''} onChange={handleInputChange}  aria-required="true" aria-invalid="false" disabled/>

                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" htmlFor="usereditform-email">&nbsp;Value <span style={{color:"#ff0404"}}>(*) </span></label>
                                    <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control" name="value" value={items.value||''} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />

                                    <div className="help-block"></div>
                                </div>

                            </div>
                        </div>
                        <input type="hidden" name="hdnkey" value={items.id||''}/>    
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Update</button>&nbsp;
                        { editData===false ? null : '' }
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UftConfigDetail;