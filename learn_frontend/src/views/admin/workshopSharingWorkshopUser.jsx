import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
// import GlobalState from '../../helpers/globalState';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import { Tab, Row, Col, Nav } from 'react-bootstrap';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Account
                    </th>
                    <th>
                        eMail
                    </th>
                    <th>
                        Name
                    </th>
                    <th>
                        Register Type
                    </th>
                    <th>
                        Date
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.account}</td>
                        <td>{item.email}</td>
                        <td>{item.name}</td>
                        <td>{item.register_type == 'WAITING'? 'WAITING LIST': 'REGISTERED' }</td>
                        <td>{item.date_created}</td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function WorkshopSharingWorkshopUser(props){
  
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()

    const [key, setKey] = useState('');
    const [titleStr, setTitleStr] = useState("");
    const [listCatMenu, setListCatMenu] = useState([])
    const [categoryId, setCategoryId] = useState('')
    const [workshopId, setWorkshopId] = useState('')
    const [tabWorkshop, setTabWorkshop] = useState('')
    // const [displayText, setDisplayText] = useState(false)

    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async (workshopIdStr) => {
        // let md5WorkshopId = await axiosLibrary.getmd5FromBackend(workshopIdStr)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            workshopId:workshopIdStr,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbWorkshopSharingUser/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    })

    const getData = useCallback(async (workshopIdStr) => {
        // let md5WorkshopId = await axiosLibrary.getmd5FromBackend(workshopIdStr)
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            workshopId:workshopIdStr,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbWorkshopSharingUser/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage(workshopIdStr)
    })
    
    const getCategoryMenu = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCategory/MenuSpecial',credentials);
        setListCatMenu(isi.data.data)
    })

    // const handleCatMenuChange = (event) => {
    //     // const target = event.target;
    //     // const value = target.value;
    //     // setCategoryId(value)
    //     // props.onCategoryChange(value)
    //     // for this page, user cannot change category id. Set back category Id to default value from props
        
    // }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    useEffect(() => {
        if(workshopId !== ''){
            getData(workshopId);
        }
    },[offset])

    useEffect(() =>{
        if(workshopId!==''){
            getData(workshopId)
        }
    },[workshopId])
   
    const handleTabSelect = (tab) => {
        
        setKey(tab);
        
        switch(tab){
            case '#tab-0':
                backToMain(categoryId,routeAdmin.workshopSharing.path)
                break;
            case '#tab-1':
                if(tabWorkshop==='W'){
                    setTitleStr(routeAdmin.workshopSharingWorkshopUser.pageName);
                }else{
                    backToMain(categoryId,routeAdmin.workshopSharingWorkshop.path)
                }
                break;
            case '#tab-2':
                if(tabWorkshop==='S'){
                    setTitleStr(routeAdmin.workshopSharingWorkshopUser.pageName);
                }else{
                    backToMain(categoryId,routeAdmin.workshopSharingSession.path)
                }
                break;
            case '#tab-3':
                backToMain(categoryId,routeAdmin.workshopSharingInfoMenu.path)
                break;
            default:
                setTitleStr(routeAdmin.workshopSharing.pageName);
        }
                
    }

    const backToMain=async(catId, path)=>{
        // const idParam = catId;
        // let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        // const ID =responseJson.data.data; 
        const ID = catId
        history.push({
            pathname: path,
            search: "?" + new URLSearchParams({cat: ID}).toString()
        })
    }

    const backToOverview = () => {
        
        if(key==='#tab-1'){
            backToMain(categoryId,routeAdmin.workshopSharingWorkshop.path)
        }
        if(key==='#tab-2'){
            backToMain(categoryId,routeAdmin.workshopSharingSession.path)
        }
    }

    const loadTab = (keyTab) => {
        setKey(keyTab)
        setTitleStr(routeAdmin.workshopSharingWorkshopUser.pageName)
    }

    useEffect(() => {
       
        setCategoryId(new URLSearchParams(props.location.search).get('cat'))
        setWorkshopId(new URLSearchParams(props.location.search).get('data'))
        var tab = new URLSearchParams(props.location.search).get('tab')
        setTabWorkshop(tab) 
        if(tab==='W'){
            loadTab('#tab-1')
        }
        if(tab==='S'){
            loadTab('#tab-2')
        }
        getCategoryMenu()
    //    alert(props.location.pathname + ' '+workshopId)
    },[props.location.pathname])

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
                            <div className="col-md-6">
                                <strong>{titleStr}</strong> 
                            </div>
                            <div className="col-md-6">
                                <div className="clearfix">
                                    <div className="panel-body">
                                        <a className="float-end btn btn-default" onClick={backToOverview} label="Back to overview" data-ui-loader="">
                                            <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                                    </div>
                                </div>
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
                                        {/* <Nav.Item>
                                            <Nav.Link eventKey="#tab-3">Info for Menu</Nav.Link>
                                        </Nav.Item> */}
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <LoadingAdmin loading={loading}/>                                  
                                    <div className="panel-body" style={cssTarget(loading)}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="control-label">&nbsp;Menu - Category </label>
                                                        <select value={categoryId} style={{width:"100%"}} className="form-control filter-data" id="id_cat" name="id_cat" >
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
                                        <div className="table-responsive">
                                            <label className="control-label">&nbsp;List User </label>
                                            <div id="h182093w0" className="grid-view">
                                                <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                                    <Table items={items} loading={loading}/>
                                            </div> 
                                            <div style={{display:"flex",justifyContent:"center"}}>
                                                { totalData > limit?
                                            
                                                <Pagination
                                                itemClass="page-item"
                                                linkClass="page-link"
                                                activePage={activePage}
                                                itemsCountPerPage={limit}
                                                totalItemsCount={totalData}
                                                pageRangeDisplayed={pageRangeDisplayed}
                                                onChange={handlePageChange.bind(this)}
                                                />
                                                :
                                                ''
                                            }
                                            </div>   
                                        </div>
                                        
                                    </div>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </div>
                </div>
            </div>

    )
}

export default WorkshopSharingWorkshopUser;