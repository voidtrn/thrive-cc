import React, { useState, useEffect, useCallback } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>Account</th>
                    <th>Email</th>
                    <th style={{ width:"200px" }}>UserName</th>
                    <th>Status Active</th>
                    <th>Status Enable</th>
                    <th style={{ width:"100px" }}>Last Login</th>
                    <th style={{ width:"70px" }}>Actions</th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>
            
            {props.items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.account}</td>
                        <td>{item.email}</td>
                        <td>{item.name}</td>
                        <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span></td>
                        <td><span style={ item.status_enable ? {} :{  color:"#ff0707" } }>{item.status_enable ? 'enabled' :'disabled'}</span></td>
                        <td>{item.last_login}</td>
                        <td style={{width:"130px"}}>
                        <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this, item.id)} >
                            <i className="fa fa-pencil"></i>&nbsp; edit</a> {' '}
                        <a className="btn btn-primary btn-xs tt" onClick={props.pointsDetail.bind(this, item.id)} >
                            <i className="fa fa-ticket"></i>&nbsp; point</a>
                        </td>
                    </tr>
            )}
            
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function Users(props){
    const history = useHistory()
    
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [str_where, setStr_where] = useState("")
    const platform_id = securityData.Security_getPlatformId()
    const [loading, setLoading] = useState(true)
    
    const pageRangeDisplayed = 10
    const limit = 10

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            str_where:str_where,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbUser/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset,str_where])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            str_where:str_where,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbUser/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage,str_where])

    useEffect(()=>{
        getData()
    },[getData])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const getDetail= async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.usersDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    const pointsDetail= async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.pointDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const handleSearch = async(e) =>{
        e.preventDefault();
        setStr_where(document.getElementById('search').value)
        setOffset(0)
    }

    return(
        <>
        <style>
            {`
                .search-form .form-group {
                    width: 450px;
                }

                .grid-view table td {
                    vertical-align: text-top !important;
                }
                                
            `}
        </style>
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong> 
                </div>
                <div className="panel-body">

                    <div className="table-responsive">
                        <div className="pull-right">
                            <form className="search-form" method="post" onSubmit={handleSearch}>
                                <div className="form-group has-feedback">
                                    <label htmlFor="search" className="sr-only">Search</label>
                                    <input type="text" className="form-control" name="search" id="search" placeholder="search"/>
                                    <span className="lbl-primary fa fa-search form-control-feedback"></span>
                                </div>
                            </form>
                        </div>

                        <div id="h182093w0" className="grid-view">
                            <br/>
                            <br/>
                            <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                <Table items={items} edit={getDetail} pointsDetail={pointsDetail} loading={loading}/>
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

export default Users;