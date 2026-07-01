import React, { useCallback, useEffect, useState} from 'react';
// import {useHistory } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
// import GlobalState from '../../helpers/globalState';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import WorkshopSharingInfoMenu from './workshopSharingInfoMenu';
import WorkshopSharingWorkshop from './workshopSharingWorkshop';

const routeAdmin = routeAll.routesAdmin

function WorkshopSharing(props){
    // const history = useHistory()

    const [textInfo, setTextInfo] = useState([])
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()

    const [key, setKey] = useState('#tab-0');
    const [titleStr, setTitleStr] = useState("Users");
    const [displayText, setDisplayText] = useState(false)

    const [listCatMenu, setListCatMenu] = useState([])
    const [categoryId, setCategoryId] = useState(new URLSearchParams(props.location.search).get('cat'))

    const getTextInfo = useCallback(async (categoryIdStr) => {
        let md5CategoryId = await axiosLibrary.getmd5FromBackend(categoryIdStr)
        const credentials = {
            md5ID:md5CategoryId
        };

        let isi = await axiosLibrary.postData('awbTextInfo/SelectData',credentials);
        setTextInfo(isi.data.data)
    })

    const getCategoryMenu = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCategory/MenuSpecial',credentials);
        setListCatMenu(isi.data.data)
    })

    // useEffect(()=>{
    //     getData()
    // },[getData])

    useEffect(() => {
        getCategoryMenu()
        handleBackToOverview(props.location.pathname)
        // setCategoryId(new URLSearchParams(props.location.search).get('cat'))
    },[platform_id])
    
    const handleCatMenuChange = (event) => {
        const target = event.target;
        const value = target.value;
        setCategoryId(value)
    }

    const onCategoryChange = (value) => {
        setCategoryId(value)
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, textInfo);
        stateCopy[key] = value;

        setTextInfo(stateCopy)
    }

    useEffect(() => {
        if (key === '#tab-0'){
            if(categoryId !== 'null' && categoryId !== '' && categoryId !== null){
                setDisplayText(true)
            }else{
                setDisplayText(false)
            }
            getTextInfo(categoryId);
        }
    },[categoryId, key])

    const updateData= async ( categoryIdParam) =>{
        // e.preventDefault();
        const fd = new FormData();
        fd.append("awb_trn_category_id", categoryIdParam);
        fd.append("text_info",textInfo.text_info);
        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);
        if(categoryIdParam){
            setLoading(true)
            //for edit data
            let responseJson = await axiosLibrary.postData("awbTextInfo/SubmitDataCategory", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN UPDATED");
                // history.push(routeAdmin.pages.path)
                setLoading(false)
            }else{
                alert(responseJson);
                setLoading(false)
            }
        }
    }

    const handleBackToOverview = (pathname) => {
        switch(pathname) {
            case routeAdmin.workshopSharing.path:
                handleTabSelect('#tab-0')
                break;
            case routeAdmin.workshopSharingWorkshop.path:
                handleTabSelect('#tab-1')
                break;
            case routeAdmin.workshopSharingSession.path:
                handleTabSelect('#tab-2')
                break;
            case routeAdmin.workshopSharingInfoMenu.path:
                handleTabSelect('#tab-3')
                break;
            default:
                handleTabSelect('#tab-0')  
        }
    }

    const handleTabSelect = (tab) => {
        
        setKey(tab);
        
        switch(tab){
            case '#tab-0':
                setTitleStr(routeAdmin.workshopSharing.pageName);
                break;
            case '#tab-1':
                setTitleStr(routeAdmin.workshopSharingWorkshop.pageName);
                break;
            case '#tab-2':
                setTitleStr(routeAdmin.workshopSharingSession.pageName);
                break;
            case '#tab-3':
                setTitleStr(routeAdmin.workshopSharingInfoMenu.pageName);
                break;
            default:
                setTitleStr(routeAdmin.workshopSharing.pageName);
        }
                
    }

    return(
            <div className="col-md-9" >
                 
                <style>
                    {`
                        .table-responsive {
                            overflow-x: unset !important;
                        }

                    `}
                </style>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-8">
                                <strong>{titleStr}</strong> 
                            </div>
                            <div className="col-md-6">
                                
                            </div>
                        
                        </div>
                    </div>
                    <div className="panel-body" >
                        <Tab.Container id="profile-tabs" 
                            defaultActiveKey="#tab-0"
                            activeKey={key}
                            onSelect={ handleTabSelect }
                            >
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-main tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">Info</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">Workshop</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-2">Sharing Session</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-3">Info for Menu</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                        <LoadingAdmin loading={loading}/>                                  
                                        <div className="panel-body" style={cssTarget(loading)}>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="control-label">&nbsp;Menu - Category </label>
                                                            <select value={categoryId} style={{width:"100%"}} className="form-control filter-data" id="id_cat" name="id_cat" onChange={handleCatMenuChange.bind(this)}>
                                                            <option value="null">-select one-</option>
                                                            {listCatMenu.map(
                                                                (itemCatMenu) =>
                                                                <option key={itemCatMenu.awb_trn_category_id} value={itemCatMenu.awb_trn_category_id}>
                                                                    {itemCatMenu.awb_mst_menu_title + ' > ' +itemCatMenu.awb_trn_category_title}
                                                                </option>
                                                            )
                                                            }
                                                            </select>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            <hr/>
                                            {displayText?
                                                <div>
                                                    <div className="mb-3 field-usereditform-email required">
                                                        <label className="control-label" htmlFor="usereditform-email">&nbsp;Text Info </label>
                                                        <textarea style={{width:"100%",height:"250px"}} className="form-control" rows='10' cols='50'
                                                            name="text_info" aria-required="true" aria-invalid="false" value={textInfo.text_info?textInfo.text_info:''} onChange={handleInputChange} ></textarea>
                                                        <div className="help-block"></div>
                                                    </div>
                                    
                                                    <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit" onClick={updateData.bind(this,categoryId)}>Update</button>
                                                </div>
                                            :''
                                            }
                                            
                                        </div>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-1">
                                            <WorkshopSharingWorkshop tab='W' keyTab={key} listCatMenu={listCatMenu} categoryId={categoryId} onCategoryChange={onCategoryChange} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-2">
                                            <WorkshopSharingWorkshop tab='S' keyTab={key} listCatMenu={listCatMenu} categoryId={categoryId} onCategoryChange={onCategoryChange} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-3">
                                            <WorkshopSharingInfoMenu keyTab={key} />
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </div>
                </div>
            </div>
    )
}

export default WorkshopSharing;