import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import routeAll from '../../helpers/route';
import { useHistory } from '../../helpers/useHistory';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

function SubCategoryDetail(props){
    
    const [loading, setLoading] = useState(true)
    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])
    const [listSectionMenu, setListSectionMenu] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const [displayCss, setDisplayCss] = useState('none')

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
            let response = await axiosLibrary.postData('awbSubCategory/SelectData',data);
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

    const getListSectionMenu= useCallback(async() =>{
        const data = {
            platform_id: platform_id,
            type:2
        }
        
            let response = await axiosLibrary.postData('awbSubCategory/ListSectionMenu',data);
            if(response.status === 200){
                setListSectionMenu(response.data.data)              
            }else{
                alert(response);
            }

    },[platform_id])

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
                fd.append("flag_active", items.flag_active);
                fd.append("user_modified", user_id);
                fd.append("platform_id", platform_id);
                fd.append("typePage", "special_page");

                if(editData){
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbSubCategory/UpdateData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.subCategory.path)
                    }else{
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("category_id", items.category_id);
                    fd.append("user_created", user_id);
                    fd.append("sort_index", 0);
                    let responseJson = await axiosLibrary.postData("awbSubCategory/InsertData", fd);
                    if(responseJson.status === 200){
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.subCategory.path)
                    }else{
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id:items.id
                }
                let responseJson = await axiosLibrary.postData("awbSubCategory/DeleteData", parameter);
                if(responseJson.status === 200){
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.subCategory.path)
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
        getDetail();
        getListSectionMenu();
        // setLoading(false))
    },[Columns])

    const seeAnotherField=(value) => {
        value = value+''
        switch(value) {
            case '27':
            //execute code block 1
                setDisplayCss('block')
                break;
            case '34':
            //execute code block 2
                setDisplayCss('block')
                break;
            case '35':
            //execute code block 2
                setDisplayCss('block')
                break;
            default:
            // code to be executed if n is different from case 1 and 2
                setDisplayCss('none')
                
        }
    }

    useEffect(()=>{
        seeAnotherField(items.category_id)
    },[items.category_id])

    return( 
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong>  
            </div>
            <div className="clearfix">
                <div className="panel-body">
                    <a className="float-end btn btn-default" href={routeAdmin.subCategory.path} label="Back to overview" data-ui-loader="">
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
                                        <Nav.Link eventKey="#tab-0">{editData ? 'Edit : '+items.title: 'New Data' }</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Section - Menu - Category <span style={{color:"#ff0404"}}>(*)</span> </label>
                                            {/* <input disabled name="hdnkey" value={items.section_id}/>    */}
                                            {
                                                editData?
                                                    <div>
                                                        <input type="hidden" id="category_id" name="category_id" value={items.category_id}></input>
                                                        <input type="text" id="usereditform-email" style={{width:"600px"}} className="form-control" disabled
                                                            name="section_menu" value={items.title_section +' > ' + items.title_menu + ' > ' + items.title_category} 
                                                            aria-required="true" aria-invalid="false" />
                                                    </div>
                                                :
                                                <select value={items.category_id} required
                                                    onChange={handleInputChange.bind(this)} id="category_id" name="category_id" style={{width:"600px"}} className="form-control">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    {listSectionMenu.map(
                                                        (itemSectionMenu) =>
                                                        <option key={itemSectionMenu.id} value={itemSectionMenu.id}>
                                                            {itemSectionMenu.title_section +' > ' + itemSectionMenu.title_menu + ' > ' + itemSectionMenu.title_category}
                                                        </option>
                                                    )
                                                    }
                                                </select>
                                            }
                                            
                                            <div className="help-block"></div>
                                        </div>

                                        <div className="form-group field-usereditform-email required">
                                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Sub Category <span style={{color:"#ff0404"}}>(*)</span></label>
                                            <input type="text" id="usereditform-email" style={{width:"75%"}} className="form-control"
                                                name="title" value={items.title} onChange={handleInputChange}  aria-required="true" aria-invalid="false" />
                                            <div className="help-block"></div>
                                        </div>

                                        <div id="seeanotherfield" style={{display:displayCss}}>
                                            {/* reserve for later */}
                                        </div>

                                        <div className="form-group field-profile-country">
                                            <label className="control-label" htmlFor="profile-country">&nbsp;Status Active</label>
                                            <select id="profile-country" style={{width:"150px"}} className="form-control" 
                                                value={items.flag_active} onChange={handleInputChange.bind(this)} required name="flag_active" aria-invalid="false">
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

                    <input type="hidden" name="hdnkey" value={items.id||''}/>    
                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                    {(editData===false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button> )}       

                </form>
                
        </div>
        </div>
    </div>
    )
}

export default SubCategoryDetail;