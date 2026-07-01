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
                        Sub Function
                    </th>
                    <th>
                        Name
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
                        <td >{item.sub_function}</td>
                        <td >{item.name}</td>
                        <td style={{width:"100px"}}><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span></td>
                        <td style={{width:"150px"}}>
                            {item.user_deleted > 0?
                                <span className='btn btn-danger btn-sm'>{"Delete in " + item.date_deleted}</span>
                            :
                                <span>
                                    <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this, item.id, 'detail')}>
                                        <i className="fa fa-pencil"></i>&nbsp; edit
                                    </a> {' '}
                                    <a className="btn btn-warning btn-xs tt" onClick={props.edit.bind(this, item.id, 'schedule')} >
                                        <i className="fa fa-calendar"></i>&nbsp; Schedule
                                    </a>
                                </span>
                            }
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function Training(props){
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
            filter_search:searchFilter
        };

        let isi = await axiosLibrary.postData('awbTraining/ListData',credentials);
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
            filter_search:searchFilter
        };

        let isi = await axiosLibrary.postData('awbTraining/ListData',credentials);
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

    const getDetail= async(param, mode)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        let pathname=''
        if(mode === 'detail'){
            pathname = routeAdmin.trainingAdminDetail.path
        }
        if(mode === 'schedule'){
            pathname = routeAdmin.trainingScheduleAdmin.path
        }
        history.push({
            pathname: pathname,
            search: "?" + new URLSearchParams({data: ID}).toString()+ "&" + new URLSearchParams({uid:idParam})
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
                                <strong>{props.pageName}</strong> 
                            </div>
                            <div className="col-md-8">
                                <div className="pull-right">
                                <a style={{marginRight:"5px",marginLeft:"5px"}} href={routeAdmin.trainingAdminExcel.path} className="pull-right btn btn-success btn-sm tt" >
                                    <i className="fa fa-file-excel-o" ></i> New from Excel</a>   
                                <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.trainingAdminDetail.path} ><i class="fa fa-plus aria-hidden="></i> Add new</a>  
                                
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                            </div>
                            <div className="col-md-8">
                                <div className="pull-right">
                                    <form className="search-form" method="post" onSubmit={handleSearch}>
                                        <div className="mb-3 has-feedback">
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
                                    <Table items={items} file_path={file_path} loading={loading} edit={getDetail}/>
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

export default Training;