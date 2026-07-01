import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import {  env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Article ID
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
                        Date Submit Article
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
                        <td >{item.title}</td>
                        <td style={{width:"250px"}}>{item.description}</td>
                        <td >{item.status === 3 ? "completed" : (item.status === 2 ? "on going" : (item.status === 4 ? "rejected" :"submitted"))}</td>
                        <td >{item.date_created}</td>
                        <td style={{width:"150px"}}>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> {" "}
                            <a className="btn btn-danger btn-xs tt"  onClick={props.deleteItem.bind(this,item.id)} ><i className="fa fa-times"></i>&nbsp; delete</a>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function SubmittedArticle(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const file_path = env.userDocument;

    const [keywordFilter, setKeywordFilter] = useState('')
    const [sortByFilter, setSortByFilter] = useState('last_modified')
    const [resetFlag, setResetFlag] = useState(false)
    
    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            keyword:keywordFilter,
            sortBy:sortByFilter,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSubmittedArticle/ListData',credentials);
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

        let isi = await axiosLibrary.postData('awbSubmittedArticle/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,keywordFilter,sortByFilter])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.submittedArticleDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id
        }
        let responseJson = await axiosLibrary.postData('awbSubmittedArticle/DeleteData',param);
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

    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>
                    <div className="panel-body">

                        <div className="row">
                            
                            <div className="col-md-3">
                                <div className="form-group">
                                        <label className="control-label">&nbsp;Sort By </label>
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
                                <div className="form-group">
                                    <label className="control-label">&nbsp;Search by keyword </label>
                                    <input type="text" style={{width:"100%"}} className="form-control filter-data" placeholder="search article"
                                        name="keyword" value={keywordFilter} onKeyPress={handleKeypress} onChange={handleSearchInputChange} />
                                    <div className="help-block"></div>
                                </div>
                            </div>

                            <div className="col-md-1">
                                <div className="form-group">
                                    <label className="control-label">&nbsp;</label>
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
                                    <Table items={items} file_path={file_path} edit={getDetail} deleteItem={deleteItem} loading={loading}/>
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
                </div>
            </div>
    )
}

export default SubmittedArticle;