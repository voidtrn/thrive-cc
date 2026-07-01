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
                        Period ID
                    </th>
                    <th>
                        From 
                    </th>
                    <th>
                        To
                    </th>
                    <th>
                        Allow Course
                    </th>
                    <th>
                        Claim Date
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
                        <td >{item.reg_from}</td>
                        <td >{item.reg_to}</td>
                        <td >{item.allow_course}</td>
                        <td >{item.claim_period}</td>
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

function RegPeriod(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const file_path = env.userDocument;

    const [sortByFilter, setSortByFilter] = useState('last_modified')
    const [resetFlag, setResetFlag] = useState(false)
    
    const pageRangeDisplayed = 10
    const limit = 20

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            sortBy:sortByFilter,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbRegPeriod/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset,sortByFilter])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            sortBy:sortByFilter,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbRegPeriod/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,sortByFilter])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.regPeriodDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id
        }
        let responseJson = await axiosLibrary.postData('awbRegPeriod/DeleteData',param);
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
        setSortByFilter(value);
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
                        <div className="row">
                            <div className="col-md-8">
                                <strong>{props.pageName}</strong> 
                            </div>
                            <div className="col-md-4">
                                <div className="float-end">
                                    <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.regPeriodDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel-body">

                        <div className="row">
                            
                            <div className="col-md-3">
                                <div className="mb-3">
                                        <label className="form-label">&nbsp;Sort By </label>
                                            <select value={sortByFilter} style={{width:"100%"}} 
                                                onChange={handleSearchInputChange} onKeyPress={handleKeypress}
                                                className="form-control filter-data"  id="sort_by" name="sort_by" >
                                                <option value="last_modified">last modified</option>
                                                <option value="earliest_from" >earliest from date</option>
                                                <option value="latest_from">latest from date</option>
                                                <option value="earliest_to" >earliest to date</option>
                                                <option value="latest_to" >latest to date</option>
                                            </select>
                                    </div>
                            </div>

                            <div className="col-md-1">
                                <div className="mb-3">
                                    <label className="form-label">&nbsp;</label>
                                    <div  style={{display:"inline-flex",position:"relative",top:"5px",right:"15px"}}>
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

export default RegPeriod;