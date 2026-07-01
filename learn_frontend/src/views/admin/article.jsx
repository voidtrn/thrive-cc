import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import ArticlePinned from './articlePinned';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.file_path

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Article ID
                    </th>
                    <th >
                        {'Section, Menu & Category'}
                    </th>
                    <th>
                        {'Title & Image Preview'}
                    </th>
                    <th>
                        Description <br/>
                        Flag Share Spesific User
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
                    <tr key={item.id}>
                        <td>{item.article_id}</td>
                        <td style={{width:"300px"}}>{item.section_title === 'Content from your Network' ? item.section_title : 
                            item.section_title + ' > ' + item.menu_title + ' > ' +item.category_title}</td>
                        <td style={{maxWidth:"300px"}}>{item.title}
                            <br/><img  style={{width:"90px",height:"auto"}} src={file_path + 'article/' + item.article_image}  alt={item.article_image} />
                        </td>
                        <td style={{width:"250px"}}>{item.description}<br/>
                            <strong>Shared Mode :</strong>{item.flag_show_spesific_user ? 'spesific ' + item.total_show_spesific_user + ' users' : 'all user'}
                        </td>
                        <td style={{width:"150px"}}><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this, item.id)}>
                                <i className="fa fa-pencil"></i>&nbsp; edit</a> 
                            <a className="btn btn-danger btn-xs tt" onClick={props.deleteArticle.bind(this, item.id)}>
                                <i className="fa fa-times"></i>&nbsp; delete</a>
                            {item.flag_pinned == '1'?
                                <a className="btn btn-danger btn-xs tt" onClick={props.pinArticle.bind(this, item.id, 0)} style={{marginTop:"3px"}}>
                                    <i className="fa fa-times"></i>&nbsp; un-pinned</a> 
                            :
                                <a className="btn btn-primary btn-xs tt" onClick={props.pinArticle.bind(this, item.id, 1)} style={{marginTop:"3px"}}>
                                    <i className="fa fa-thumb-tack"></i>&nbsp; pinned</a> 
                            }  

                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function Article(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const file_path = env.userDocument

    // const [listSectionMenu, setListSectionMenu] = useState([])
    const [listMenu, setListMenu] = useState([])
    const [keywordFilter, setKeywordFilter] = useState('')
    const [sortByFilter, setSortByFilter] = useState('last_modified')
    const [menuIdFilter, setMenuIdFilter] = useState('')
    const [key, setKey] = useState('#tab-0')
    const [resetFlag, setResetFlag] = useState(false)
    
    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            menuId:menuIdFilter,
            keyword:keywordFilter,
            sortBy:sortByFilter,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbArticle/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[menuIdFilter,keywordFilter,sortByFilter, offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            menuId:menuIdFilter,
            keyword:keywordFilter,
            sortBy:sortByFilter,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbArticle/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[menuIdFilter,keywordFilter,sortByFilter,offset])

    const getMenuList = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbCategory/ListSectionMenu',credentials);
        setListMenu(isi.data.data)
        // setLoading(false)
    })

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.articleDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }
    
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    useEffect(() => {
        // if(categoryId !== 'null'){
            getData();
            getMenuList();
        // }
    },[offset])

    const handleSearchInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        switch(target.name){
            case 'menu_id':
                setMenuIdFilter(value);
                break;
            case 'keyword':
                setKeywordFilter(value);
                break;
            case 'sort_by':
                setSortByFilter(value);
                break;
            default:      
        }
    }

    const deleteArticle= async (idParam) =>{
        // e.preventDefault();
        const fd = new FormData();
        
        fd.append("id", idParam);
        let responseJson = await axiosLibrary.postData("awbArticle/DeleteData", fd);
        if(responseJson.status === 200){
            alert('Data has been deleted')
            filterButton()
        }else{
            alert(responseJson);
        }
            
    }

    const pinArticle= async (idParam, flagPinned) =>{
        // e.preventDefault();
        const fd = new FormData();
        
        fd.append("flag_pinned", flagPinned);
        fd.append("id", idParam);
        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);
        let responseJson = await axiosLibrary.postData("awbArticle/UpdateData", fd);
        if(responseJson.status === 200){
            if (flagPinned == 1){
                alert('Data has been pinned')
            }
            if (flagPinned == 0){
                alert('Data has been unpinned')
            }
            filterButton()
        }else{
            alert(responseJson);
        }
            
    }

    const handleTabSelect = (tab) => {
        
        setKey(tab);
        // switch(tab){
        //     case '#tab-0':
        //         setTitleStr(routeAdmin.article.pageName);
        //         break;
        //     case '#tab-1':
        //         setTitleStr(routeAdmin.articleSubCategory.pageName);
        //         break;
        //     default:
        //         setTitleStr(routeAdmin.article.pageName);
        // }
      
    }

    const filterButton = () => {
        getData();
    }

    const resetButton = () => {
        setMenuIdFilter('')
        setKeywordFilter('')
        setSortByFilter('')
        setResetFlag(true)
    }

    useEffect(() => {
        if(resetFlag){
            getData();
            setResetFlag(false)
        }
    },[resetFlag])

    const handleKeypress = (e) => {
        //it triggers by pressing the enter key
      if (e.key === 'Enter') {
        filterButton();
      }
    }

    return(
        <div className="col-md-9">
            <style>
               
            </style>
            <div className="panel panel-default">
                <div className="panel-heading">
                    <div className="row">
                        <div className="col-md-8">
                            <strong>{props.pageName}</strong> 
                        </div>
                        <div className="col-md-4">
                            <div className="float-end">
                                <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.articleDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                            </div>
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
                                        <Nav.Link eventKey="#tab-0">All Article</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="#tab-1">Pinned Article on Homepage</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content animation="true">
                                    <Tab.Pane eventKey="#tab-0">
                                        <div className="panel-body"> 

                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="mb-3">
                                                        <label className="form-label">&nbsp;Section - Menu </label>
                                                        <select value={menuIdFilter} style={{width:"100%"}} className="form-control filter-data" 
                                                            id="menu_id" name="menu_id" onKeyPress={handleKeypress} onChange={handleSearchInputChange}>
                                                            <option value="">-select all-</option>
                                                            {listMenu.map(
                                                                (itemMenu) =>
                                                                <option key={itemMenu.id} value={itemMenu.id}>
                                                                    {itemMenu.description}
                                                                </option>
                                                            )
                                                            }
                                                        </select>
                                                        <div className="help-block"></div>
                                                    </div>   
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                            <label className="form-label">&nbsp;Sort By </label>
                                                                <select value={sortByFilter} style={{width:"100%"}} 
                                                                    onChange={handleSearchInputChange} onKeyPress={handleKeypress}
                                                                    className="form-control filter-data"  id="sort_by" name="sort_by" >
                                                                    <option value="last_modified">last modified</option>
                                                                    <option value="section">section</option>
                                                                    <option value="menu">menu</option>
                                                                    <option value="article">article</option>
                                                                </select>
                                                        </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label className="form-label">&nbsp;Search by keyword </label>
                                                        <input type="text" style={{width:"100%"}} className="form-control filter-data" placeholder="search article"
                                                            name="keyword" value={keywordFilter} onKeyPress={handleKeypress} onChange={handleSearchInputChange} />
                                                        <div className="help-block"></div>
                                                    </div>
                                                </div>

                                                <div className="col-md-1">
                                                    <div className="mb-3">
                                                        <label className="form-label">&nbsp;</label>
                                                        <div  style={{display:"inline-flex",position:"relative",top:"5px",right:"15px"}}>
                                                            <button type="submit" id="btnReset" className="btn btn-outline btn-sm btn-danger" onClick={resetButton}><i className="fa fa-refresh"></i>&nbsp;reset</button>&nbsp;
                                                            <button type="submit" id="btnFilter" className="btn btn-outline btn-sm btn-warning" 
                                                                onClick={filterButton}><i className="fa fa-search"></i>&nbsp;filter</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <hr/>

                                            <div className="table-responsive" >
                                                <div id="h182093w0" className="grid-view">
                                                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                                        <Table items={items} edit={getDetail} pinArticle={pinArticle} totalData={totalData} 
                                                            deleteArticle={deleteArticle} file_path={file_path} loading={loading}/>
                                                </div> 
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
                                            </div>
                                        </div> 
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="#tab-1">
                                        <ArticlePinned articleItems={items} />
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

export default Article;