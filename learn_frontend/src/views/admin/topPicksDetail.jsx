import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';

function TopPicksDetail(props){
    
    const history = useHistory()
    const animatedComponents = makeAnimated();
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])
    const [contentTypeItems, setContentTypeItems] = useState([])
    // const [contentData, setContentData] = useState([])
    const [allContent, setAllContent] = useState([]);
    const [contentDataList, setContentDataList] = useState([])
    const [contentSelected, setContentSelected] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingContent, setLoadingContent] = useState(true);
    const [disabledContent, setDisabledContent] = useState(true);

    const routeAdmin = routeAll.routesAdmin

    const [initFlagStatus, setInitFlagStatus] = useState(1)
    
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    // const user_account = securityData.Security_UserAccount()

    const getDetail= useCallback(async() =>{
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if(data.md5ID!== null){
            setEditData(true)
            let response = await axiosLibrary.postData('awbTopPicks/SelectData',data);
            if(response.status === 200){
                setItems(response.data.data)
                setInitFlagStatus(response.data.data.flag_active)
                var content_tmp={
                    value: response.data.data.content_id,
                    label: response.data.data.content_title
                }
                setContentSelected(content_tmp)
                setLoading(false)
            }else{
                alert(response);
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    },[props.location.search])

    const getContentType = useCallback(async () => {
        setLoading(true)

        const credentials = {
            limit: 9999,
            offset:0,
            category:"",
            flag_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbContentType/ListData',credentials);
        if(isi.status===200){
            setContentTypeItems(isi.data.data)
        }
    },[platform_id])


    const loadOptions = (inputValue, callback) => {
        const requestResults = contentDataList.filter(
            x =>
            x.label?
            x.label.toLowerCase().includes(inputValue.toLowerCase())
            :
            []
            ).slice(0,50)
               
        // const requestResults = this.state.optionAdHoc.slice(0,10);
        callback(requestResults)

    }

    const getContentFromType = useCallback(async () => {

        const param = {
            // content_type_id: items.content_type_id,
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbContentType/GetContentFromType',param);
        if(isi.status===200){
            // var content_data_tmp = isi.data.data.map(({id, label})=>{
            //     return {
            //         value: id,
            //         label: label
            //     }
            //     });
        
            setAllContent(isi.data.data)

        }
        // setContentData(isi.data.data)

        // setLoading(false)
    },[platform_id])

    useEffect(()=>{
        if(items.content_type_id){
            setLoadingContent(true)
            setDisabledContent(true)
            const listDataOptionModule = allContent.filter(v=>v.contentId==items.content_type_id).map(v=>{
                return{
                    value:v.id,label:v.title
                }
            })
            setContentDataList(listDataOptionModule)
            setContentSelected([])
            setLoadingContent(false)
            setDisabledContent(false)
        }else{
            setDisabledContent(true)
        }
        
    },[items.content_type_id])

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
                
                fd.append("content_type_id", items.content_type_id);
                fd.append("content_id", contentSelected.value);
                fd.append("flag_active", items.flag_active);

                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);

                if(items.flag_active == '0'){
                    fd.append("sort_index", 999);
                }
                
                if(initFlagStatus == 0){
                    if(items.flag_active == 1){
                        fd.append("sort_index", 0);
                    }
                }

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbTopPicks/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.topPicks.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    if(items.flag_active == '1'){
                        fd.append("sort_index", 0);
                    }else{
                        fd.append("sort_index", 999);
                    }
                    let responseJson = await axiosLibrary.postData("awbTopPicks/InsertData", fd);
                    if(responseJson.status === 200){
                        if(responseJson.data.data === 'DUPLICATE'){
                            alert("CONTENT ALREADY EXIST IN TOP PICK LIST");
                        }else{
                            alert("DATA HAS BEEN CREATED");
                            history.push(routeAdmin.topPicks.path)
                        }
                        
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbTopPicks/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.topPicks.path)
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
        getContentType()
        getContentFromType()
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
                    <a className="float-right btn btn-default" href={routeAdmin.topPicks.path} label="Back to overview" data-ui-loader="">
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
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit Data': 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Content Type <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            {/* <input disabled name="hdnkey" value={items.section_id}/>    */}
                                            {
                                                editData?
                                                    <div>
                                                        <input type="hidden" id="content_type_id" name="content_type_id" value={items.content_type_id}></input>
                                                        <input type="text" id="usereditform-email" style={{width:"300px"}} className="form-control" disabled
                                                            name="content_type_title" value={items.content_type_title} aria-required="true" aria-invalid="false" />
                                                    </div>
                                                :
                                                <select value={items.content_type_id} required
                                                    onChange={handleInputChange.bind(this)} id="content_type_id" name="content_type_id" style={{width:"300px"}} className="form-control">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    {contentTypeItems.map(
                                                        (contentTypeItem) =>
                                                        <option key={contentTypeItem.id} value={contentTypeItem.id}>{contentTypeItem.title}</option>
                                                    )
                                                    }
                                                </select>
                                            }
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required" >
                                            <label className="control-label" forHtml="profile-country">Content </label>
                                            {/* <select id="initiate_participant" name="initiate_participant[]"  multiple data-placeholder="Choose Employee Name" className="chosen-select form-control" style={{width:"75%"}}></select> */}
                                            <AsyncSelect
                                                closeMenuOnSelect={true}
                                                isLoading={loadingContent}
                                                isDisabled={disabledContent}
                                                // styles={customStyles}
                                                components={animatedComponents}
                                                loadOptions={loadOptions.bind(this)}
                                                defaultOptions={contentDataList.slice(0,50)}
                                                onChange={(e)=>setContentSelected(e)}
                                                value={contentSelected}
                                                // placeholder="Choose Employee Name"
                                            />
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
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

export default TopPicksDetail;