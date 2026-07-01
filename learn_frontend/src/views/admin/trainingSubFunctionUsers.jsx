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
    // const file_path = props.file_path

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Sub Function Name
                    </th>
                    <th>
                        IMDL
                    </th>
                    <th>
                        EmployeeId
                    </th>
                    <th>
                        Name
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td >{item.sub_function}</td>
                        <td >{item.id}</td>
                        <td >{item.employee_id}</td>
                        <td >{item.name}</td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function TrainingSubFunction(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const [searchFilter, setSearchFilter] = useState('')
    const file_path = env.userDocument;
    
    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id,
            md5ID: new URLSearchParams(props.location.search).get('data'),
            filter_search:searchFilter
        };

        let isi = await axiosLibrary.postData('awbTrainingSubfunction/ListDataUsers',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset, searchFilter])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id,
            md5ID: new URLSearchParams(props.location.search).get('data'),
            filter_search:searchFilter
        };

        let isi = await axiosLibrary.postData('awbTrainingSubfunction/ListDataUsers',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage, searchFilter])

    useEffect(()=>{
        getData()
    },[getData])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const handleSearch = async(e) =>{
        e.preventDefault();
        setSearchFilter(document.getElementById('search').value)
        setOffset(0)
    }

    const toExcel= async()=>{
        const idParam = new URLSearchParams(props.location.search).get('data');
        let pathname=''
            pathname = routeAdmin.trainingAdminSubFunctionUsersExcel.path
        
        history.push({
            pathname: pathname,
            search: "?" + new URLSearchParams({data: idParam}).toString()// your data array of objects
        })
    }
    
    const getDetail= async(param, mode)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        let pathname=''
        if(mode === 'detail'){
            pathname = routeAdmin.trainingAdminSubFunctionDetail.path
        }
        history.push({
            pathname: pathname,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const getUsers= async(param, mode)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        let pathname=''
        if(mode === 'users'){
            pathname = routeAdmin.trainingAdminSubFunctionUsers.path
        }
        history.push({
            pathname: pathname,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    return(
        <>
            <style>
                {`
                    .search-form .mb-3 {
                        width: 250px;
                        margin-right:auto;
                        margin-top:1rem;
                    }               
                `}
            </style>
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-4">
                                <strong>Users in Sub Function Training</strong> 
                            </div>
                            <div className="col-md-8">
                                <div className="float-end">
                                <span style={{marginRight:"5px",marginLeft:"5px"}}  onClick={toExcel.bind(this, '', 'users')} className="float-end btn btn-success btn-sm tt" >
                                    <i className="fa fa-file-excel-o" ></i> New from Excel
                                </span>                             
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                            </div>
                            <div className="col-md-8">
                                <div className="float-end">
                                    <form className="search-form" method="post" onSubmit={handleSearch}>
                                        <div className="mb-3">
                                            <label htmlFor="search" className="visually-hidden">Search</label>
                                            <input type="text" className="form-control" name="search" id="search" placeholder="search"/>
                                            <span className="lbl-primary fa fa-search form-control-feedback"></span>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr style={{marginTop:"auto"}}/>
                    <div className="panel-body">

                        <div className="table-responsive">
                            <div id="h182093w0" className="grid-view">
                                <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                    <Table items={items} file_path={file_path} loading={loading} edit={getDetail} users={getUsers}/>
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
        </>
    )
}

export default TrainingSubFunction;