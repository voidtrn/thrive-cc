import React, { useCallback, useEffect, useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useNavigate } from 'react-router';
import { securityData } from '../../helpers/globalHelper';

function HofDetail(props){
    const history = useNavigate()
    const animatedComponents = makeAnimated();
    const routeAdmin = routeAll.routesAdmin
    const nameType = new URLSearchParams(props.location.search).get('type')

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [items, setItems] = useState([])
    const [user_id, setUser_id] = useState("")
    const [optionName, setOptionName] = useState([])
    const [isLoadingName, setIsLoadingName] = useState(true)
    const [isDisabledName, setIsDisabledName] = useState(true)
    const [optionSelectedName, setOptionSelectedName] = useState({})
    const [optionSelectedNameOnce, setOptionSelectedNameOnce] = useState(false)
    const [optionFunction, setOptionFunction] = useState([])
    const [isLoadingFunction, setIsLoadingFunction] = useState(true)
    const [optionSelectedFunction, setOptionSelectedFunction] = useState([])
    const [md5PlatformId, setMd5PlatformId] = useState("")
    
    const platform_id = securityData.Security_getPlatformId()

    const getAllFunction = async()=>{
        setIsLoadingFunction(true)

        let responseJson = await axiosLibrary.postData('GetMd5',{id:platform_id});
        if(responseJson.data.data !== ""){
            let responseJsonAllFunction = await axiosLibrary.postData('dialogueUserHof/GetAllFunction',{md5ID:responseJson.data.data});
            var response = responseJsonAllFunction.data.data.map(({directorate}) => {
                return {
                  value: directorate,
                  label: directorate
                }
              });
            setOptionFunction(response)
            setIsLoadingFunction(false)
            setMd5PlatformId(responseJson.data.data)
        }
    }

    const getDetail= async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            if(optionSelectedFunction.value){
                if(!optionSelectedNameOnce){
                    const indexName= optionName.findIndex(option => option.value===items.name)
                    setOptionSelectedName(optionName[indexName])
                    setOptionSelectedNameOnce(true)    
                }
            }else{
                let response = await axiosLibrary.postData('dialogueUserHof/SelectData',data);
                if(response.status === 200){
                    setItems(response.data.data)
                    const indexFunction = optionFunction.findIndex(option => option.value===response.data.data.directorate)
                    setOptionSelectedFunction(optionFunction[indexFunction])
                }else{
                    alert(response);
                }
            }
        }
    }

    const getUserId = () => {
        var dataUser = axiosLibrary.getUserInfo();
        setUser_id(dataUser.id)
        getAllFunction()
    }

    const getAllEmpl = useCallback(async()=>{
        setOptionSelectedName([])
        setIsDisabledName(false)
        setIsLoadingName(true)
        const param = {
            md5ID:md5PlatformId,
            directorate:optionSelectedFunction.value
        }
        let responseJson = await axiosLibrary.postData('dialogueUserHof/GetAllEmployee',param);
        var response = responseJson.data.data.map(({ account, name})=>{
            return {
                value: name,
                label: '( '+account+' ) '+name
            }
        })
        setOptionName(response)
        setIsLoadingName(false)
    },[optionSelectedFunction,md5PlatformId])

    useEffect(()=>{
        if(optionFunction.length > 0){
            getDetail()
        }
    },[optionFunction,optionName])

    useEffect(()=>{
        getUserId()
    },[])

    useEffect(()=>{
        if(optionSelectedFunction.value){
            getAllEmpl()
        }
    },[optionSelectedFunction])

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

    const submit = async (e) => {
        e.preventDefault();
        if(!cancelDelete){
            if(!deleteData){

                const fd = new FormData();
                fd.append("name", optionSelectedName.value);
                fd.append("directorate", optionSelectedFunction.value)
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                if(editData){
                    //for edit data
                    fd.append("id",items.id);
                    let responseJson = await axiosLibrary.postData("dialogueUserHof/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history(routeAdmin.hof.path)
                    }else{
                        alert(responseJson);
                    }
                }else{
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("dialogueUserHof/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history(routeAdmin.hof.path)
                    }else{
                        alert(responseJson);
                    }
                }
            }else{
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("dialogueUserHof/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history(routeAdmin.hof.path)
                }else{
                    alert(responseJson);
                }
            }
        }
        setCancelDelete(false)
    }

    return(
        <div className="col-md-9">
            <style>
                {`
                .basic-single{
                    width:75%;
                }
                `}
            </style>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>  
                </div>
                <div className="clearfix">
                    <div className="panel-body">
                        <a className="float-end btn btn-default" href={routeAdmin.hof.path} label="Back to overview" data-ui-loader="">
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
                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" >&nbsp;Function</label>
                                    <Select components={animatedComponents} isLoading={isLoadingFunction} options={optionFunction} className="basic-single" classNamePrefix="select" name="optionFunction" onChange={(e)=>setOptionSelectedFunction(e)} value={optionSelectedFunction}/>
                                    <div className="help-block"></div>
                                </div>

                                <div className="mb-3 field-usereditform-email required">
                                    <label className="form-label" >&nbsp;Name</label>
                                    <Select  components={animatedComponents} isLoading={isLoadingName} isDisabled={isDisabledName} options={optionName} className="basic-single"  classNamePrefix="select" name="optionName" onChange={(e)=>setOptionSelectedName(e)} value={optionSelectedName}/>
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

export default HofDetail;