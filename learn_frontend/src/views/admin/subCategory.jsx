import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import ArticleSubCategory from './articleSubCategory';
import SliderCategory from './sliderCategory';
import ArticleOfMonthSpecial from './articleOfMonthSpecial';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const totalData = props.totalData

    var sortIndex = 0

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        {'Section & Menu'}
                    </th>
                    <th>
                        Title
                    </th>
                    <th>
                        Status Active
                    </th>
                    <th>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id_sub_category}>
                        <td>{item.title_section}<br/>{item.title_menu}<br/>{item.title_category}</td>
                        <td>{item.title_sub_category}</td>
                        <td style={{width:"150px"}}><span style={ item.flag_active_sub_category ? {} :{  color:"#ff0707" } }>{item.flag_active_sub_category ? 'active' :'inactive'}</span></td>
                        
                        <td style={{width:"150px"}}>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id_sub_category)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> {" "}
                            <a className="btn btn-danger btn-xs tt"  onClick={props.deleteItem.bind(this,item.id_sub_category)} ><i className="fa fa-times"></i>&nbsp; delete</a>
                            <span hidden>{sortIndex = sortIndex + 1}</span>
                            <p style={{paddingTop:"4px"}}>
                                {(sortIndex > 1) ?
                                    <div style={{display : 'inline-block'}}>
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id_sub_category,item.sort_index)} ><i className="fa fa-arrow-up"></i></a>
                                        &nbsp;
                                    </div>                        
                                : ''}
                                {(sortIndex < totalData) ?
                                    <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id_sub_category,item.sort_index)} ><i className="fa fa-arrow-down"></i></a>
                                : ''}  
                            </p>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function SubCategory(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()

    const [key, setKey] = useState('#tab-0');
    const [titleStr, setTitleStr] = useState("Users");

    const [listSectionMenu, setListSectionMenu] = useState([])
    const [categoryId, setCategoryId] = useState('null')
    var categoryIdStr = ''
    
    const pageRangeDisplayed = 10
    const limit = 10

    const getTotalPage = useCallback(async (categoryIdStr) => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            categoryId:categoryIdStr,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSubCategory/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    })

    const getData = useCallback(async (categoryIdStr) => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            categoryId:categoryIdStr,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSubCategory/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage(categoryIdStr)
    })

    const getSectionMenu = useCallback(async () => {
        const credentials = {
            platform_id:platform_id,
            type:2
        };

        let isi = await axiosLibrary.postData('awbSubCategory/ListSectionMenu',credentials);
        setListSectionMenu(isi.data.data)
        setLoading(false)
    })

    // useEffect(()=>{
    //     getData()
    // },[getData])

    useEffect(() => {
        getSectionMenu()
    },[platform_id])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.subCategoryDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    const moveUp = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            categoryId: categoryId,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSubCategory/MoveUp',param);
        if(responseJson.status===200){
            getData(categoryId)
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            categoryId: categoryId,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSubCategory/MoveDown',param);
        if(responseJson.status===200){
            getData(categoryId)
        }else{
            alert(responseJson.status)
        }
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSubCategory/DeleteData',param);
        if(responseJson.status===200){
            alert('Data has been deleted')
            getData(categoryId)
        }else{
            alert(responseJson.status)
        }
    }
    
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const handleSectionMenuChange = (event) => {
        const target = event.target;
        const value = target.value;
        categoryIdStr = value;
        setCategoryId(value)
        getData(categoryIdStr);
    }

    const handleBackToOverview = (pathname) => {
        switch(pathname) {
            case routeAdmin.subCategory.path:
                handleTabSelect('#tab-0')
                break;
            case routeAdmin.articleSubCategory.path:
                handleTabSelect('#tab-1')
                break;
            case routeAdmin.sliderCategory.path:
                handleTabSelect('#tab-2')
                break;
            case routeAdmin.articleOfMonthSpecial.path:
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
                setTitleStr(routeAdmin.subCategory.pageName);
                break;
            case '#tab-1':
                setTitleStr(routeAdmin.articleSubCategory.pageName);
                break;
            case '#tab-2':
                setTitleStr(routeAdmin.sliderCategory.pageName);
                break;
            case '#tab-3':
                setTitleStr(routeAdmin.articleOfMonthSpecial.pageName);
                break;
            default:
                setTitleStr(routeAdmin.subCategory.pageName);
        }
      
    }

    useEffect(() => {
        handleBackToOverview(props.location.pathname)
    },[props.location.pathname])

    return(
            <div className="col-md-9">
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
                            <div className="col-md-4">
                                {key=='#tab-0'?
                                    <div className="pull-right">
                                    <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.subCategoryDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                    </div>
                                :''
                                }
                                {key=='#tab-2'?
                                    <div className="pull-right">
                                    <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.sliderCategoryDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                    </div>
                                :''
                                }
                            </div>
                        
                        </div>
                    </div>
                    <div className="panel-body">
                        <Tab.Container id="profile-tabs" 
                            defaultActiveKey="#tab-0"
                            activeKey={key}
                            onSelect={ handleTabSelect }
                            >
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-main tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">Sub Category (Lvl 4)</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">Article Under Sub Category (Lvl 4)</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-2">Slider</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-3">Article of the Month</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                        <div className="panel-body">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="mb-3">
                                                        <label className="control-label">&nbsp;Section - Menu - Category </label>
                                                            <select value={categoryId} style={{width:"100%"}} className="form-control filter-data" id="cat" name="cat" onChange={handleSectionMenuChange.bind(this)}>
                                                            <option value="null">-select one-</option>
                                                            {listSectionMenu.map(
                                                                (itemSectionMenu) =>
                                                                <option key={itemSectionMenu.id} value={itemSectionMenu.id}>
                                                                    {itemSectionMenu.title_section+' > '+itemSectionMenu.title_menu+' > '+itemSectionMenu.title_category}
                                                                </option>
                                                            )
                                                            }
                                                            </select>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                            <hr/>

                                            <div className="table-responsive" style={categoryId=='null'?{display:"none"}:{}}>
                                                <div id="h182093w0" className="grid-view">
                                                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                                        <Table items={items} edit={getDetail} moveUp={moveUp} moveDown={moveDown} deleteItem={deleteItem} totalData={totalData} loading={loading}/>
                                                </div> 
                                                {totalData > limit ?
                                                    <div style={{display:"flex",justifyContent:"center"}}>
                                                        <Pagination
                                                        itemClass="page-item"
                                                        linkClass="page-link"
                                                        activePage={activePage}
                                                        itemsCountPerPage={limit}
                                                        totalItemsCount={totalData}
                                                        pageRangeDisplayed={pageRangeDisplayed}
                                                        onChange={handlePageChange.bind(this)}
                                                        />
                                                    </div>   
                                                :''
                                                }
                                            </div>
                                        </div>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-1">
                                            <ArticleSubCategory listSectionMenu={listSectionMenu} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-2">
                                            <SliderCategory listSectionMenu={listSectionMenu} />
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-3">
                                            <ArticleOfMonthSpecial listSectionMenu={listSectionMenu} />
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

export default SubCategory;