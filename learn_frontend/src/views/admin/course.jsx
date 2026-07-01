import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import {  env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

import CoursePinned from './coursePinned';
import { Tab, Row, Col, Nav } from 'react-bootstrap';

function Table(props){
    const items = props.items
    const file_path = props.file_path

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Course ID
                    </th>
                    <th>
                        Title 
                    </th>
                    <th>
                        Description
                    </th>
                    <th>
                        Status
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
                        <td >{item.id}</td>
                        <td >{item.title}<br/>
                            <img  style={{width:"90px",height:"auto"}} src={file_path + 'course/' + item.course_image}  alt={item.course_image} />
                        </td>
                        <td style={{width:"250px"}}>{item.description}</td>
                        <td ><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span></td>
                        <td style={{width:"150px"}}>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> {" "}
                            <a className="btn btn-danger btn-xs tt"  onClick={props.deleteItem.bind(this,item.id)} ><i className="fa fa-times"></i>&nbsp; delete</a>{" "}
                            {item.flag_pinned == '1'?
                                <a className="btn btn-danger btn-xs tt" onClick={props.pinCourse.bind(this, item.id, 'U')} style={{marginTop:"3px"}}>
                                    <i className="fa fa-times"></i>&nbsp; un-pinned</a> 
                            :
                                <a className="btn btn-primary btn-xs tt" onClick={props.pinCourse.bind(this, item.id, 'P')} style={{marginTop:"3px"}}>
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

function Course(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const file_path = env.userDocument;
    const [reloadPinned, setReloadPinned] = useState(false)

    const [keywordFilter, setKeywordFilter] = useState('')
    const [sortByFilter, setSortByFilter] = useState('last_modified')
    const [resetFlag, setResetFlag] = useState(false)
    const [key, setKey] = useState('#tab-0')
    
    const pageRangeDisplayed = 10
    const limit = 20

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            keyword:keywordFilter,
            sortBy:sortByFilter,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCourse/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset,keywordFilter,sortByFilter])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            keyword:keywordFilter,
            sortBy:sortByFilter,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCourse/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,keywordFilter,sortByFilter])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.courseDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id
        }
        let responseJson = await axiosLibrary.postData('awbCourse/DeleteData',param);
        if(responseJson.status===200){
            alert('Data has been deleted')
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    useEffect(()=>{
        getData()
    },[platform_id, offset])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const handleSearchInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        switch(target.name){
            case 'keyword':
                setKeywordFilter(value);
                break;
            case 'sort_by':
                setSortByFilter(value);
                break;
            default:      
        }
    }

    const handleKeypress = (e) => {
        //it triggers by pressing the enter key
      if (e.key === 'Enter') {
        filterButton();
      }
    }

    const filterButton = () => {
        setActivePage(1)
        setOffset(0)
        getData()
    }

    const resetButton = () => {
        setKeywordFilter('')
        setSortByFilter('last_modified')
        setActivePage(1)
        setOffset(0)
        setResetFlag(true)
    }

    useEffect(() => {
        if(resetFlag){
            getData()
            setResetFlag(false)
        }
    },[resetFlag])

    const pinCourse= async (idParam, mode) =>{
        // e.preventDefault();
        const fd = new FormData();
        
        fd.append("mode", mode);
        fd.append("course_id", idParam);
        fd.append("user_id", user_id);
        fd.append("platform_id", platform_id);
        let responseJson = await axiosLibrary.postData("awbCourse/PinUnpinCourse", fd);
        if(responseJson.status === 200){
            if (mode == 'P'){
                alert('Data has been pinned')
            }
            if (mode == 'U'){
                alert('Data has been unpinned')
            }
            getData()
            setReloadPinned(true)
        }else{
            alert(responseJson);
        }
            
    }

    const handleTabSelect = (tab) => {
        
        setKey(tab);
       
    }

    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-8">
                                <strong>{props.pageName}</strong> 
                            </div>
                            <div className="col-md-4">
                                <div className="float-end">
                                    <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.courseDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
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
                                            <Nav.Link eventKey="#tab-0">All Course</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">Pinned Course on Homepage</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            <div className="row">
                                                
                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                            <label className="form-label">&nbsp;Sort By </label>
                                                                <select value={sortByFilter} style={{width:"100%"}} 
                                                                    onChange={handleSearchInputChange} onKeyPress={handleKeypress}
                                                                    className="form-control filter-data"  id="sort_by" name="sort_by" >
                                                                    <option value="last_modified">last modified</option>
                                                                    <option value="article">title</option>
                                                                    <option value="status">status</option>
                                                                </select>
                                                        </div>
                                                </div>

                                                <div className="col-md-3">
                                                    <div className="mb-3">
                                                        <label className="form-label">&nbsp;Search by keyword </label>
                                                        <input type="text" style={{width:"100%"}} className="form-control filter-data" placeholder="search course"
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
                                            <div className="table-responsive">
                                                
                                                <div id="h182093w0" className="grid-view">
                                                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                                        <Table items={items} file_path={file_path} edit={getDetail} deleteItem={deleteItem} loading={loading} pinCourse={pinCourse}/>
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
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-1">
                                            <CoursePinned reloadPinned={reloadPinned} setReloadPinned={setReloadPinned} getDataCourse={getData} />
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

export default Course;