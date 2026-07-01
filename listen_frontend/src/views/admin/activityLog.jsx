import React, { useState, useEffect, useCallback } from 'react';
import Pagination from 'react-js-pagination';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

function Table(items){
    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>Log Id</th>
                    <th>User name</th>
                    <th>User Id Login</th>        
                    <th>User Id</th>
                    <th>User Email</th>
                    <th>Access Module</th>
                    <th>Access Device</th>
                    <th>Access Date</th>
                </tr>
            </thead>

            <tbody style={cssTarget(items.loading)}>
            {items.isi.map(
            (item) =>
                <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.user_name}</td>
                    <td>{item.user_account}</td>
                    <td>{item.user_id}</td>
                    <td>{item.user_email}</td>
                    <td>{item.access_module}</td>
                    <td>{item.access_device}</td>
                    <td>{item.access_date}</td>
                </tr>
            )}
            </tbody>

            <LoadingAdmin loading={items.loading}/> 
        </table>
    )
}

function ActivityLog(props){
    
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [submitFilter, setSubmitFilter] = useState(true)
    const [loading, setLoading] = useState(true)

    const platform_id = securityData.Security_getPlatformId()
    const limit = 10

    const getTotalPage = useCallback(async () => {
        if(submitFilter){
            const credentials = {
                limit: limit,
                offset:offset,
                category:"COUNT",
                platform_id:platform_id,
                startDate: startDate,
                endDate: endDate,
                module_name: 'Time to Listen'
            };
    
            let isi = await axiosLibrary.postData('thinkActivityLog/ListData',credentials);
            setTotalData(isi.data.data)
            setSubmitFilter(false)
            setLoading(false)
        }
        
    },[offset,startDate,endDate,submitFilter])

    const getData = useCallback(async () => {
        if(submitFilter){
            setLoading(true)
            const credentials = {
                limit: limit,
                offset:offset,
                platform_id:platform_id,
                startDate: startDate,
                endDate: endDate,
                module_name: 'Time to Listen'
            };
    
            let isi = await axiosLibrary.postData('thinkActivityLog/ListData',credentials);
            setItems(isi.data.data)
            getTotalPage()
        }

    },[offset,getTotalPage,startDate,endDate,submitFilter])

    useEffect(()=>{
        getData()
    },[getData])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
        setSubmitFilter(true)
    }

    const handleExport = async (e) => {
        e.preventDefault();
        const param = {
            platform_id: platform_id,
            startDate: startDate,
            endDate: endDate,
            module_name: 'Time to Listen',
        }
    
        let response = await axiosLibrary.postDataFile("thinkActivityLog/FormExport", param);
        if(response.status === 200){            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'activity_log.xlsx');
            document.body.appendChild(link);
            link.click();
        }else{
            alert(response);
        }
    }

    const handleReset = (e) => {
        e.preventDefault();
        setStartDate('')
        setEndDate('')
    }

    return(
    <>
        <style>
        {`
        .search-form .mb-3 {
        display: inline-table;
            width: 200px;
            height: 35px;
            font-size: 11px;
            margin-right: 30px;
            background-color: #ffffff;
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset;
            border-radius: 5px;
            border: 1px solid #ccc;
            padding: 0 5px;
        }
        .search-form .mb-3 input.form-control {
        padding-right: 20px;
        border: 0 none;
        background: transparent;
        box-shadow: none;
        display:block;
        }


        .search-form .mb-3 span.form-control-feedback {
        position: absolute;
        top: -1px;
        right: -2px;
        z-index: 2;
        display: block;
        width: 34px;
        height: 34px;
        line-height: 34px;
        text-align: center;
        color: #3596e0;
        left: initial;
        font-size: 11px;
        }

        .grid-view table tbody tr td {
            padding-left: 5px;
            vertical-align: text-top !important;
        }

        .filter {
            display: inline-grid;
            float: right;
        }
        `}
        </style>
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>
                </div>
                <form method="post" onSubmit={(e)=>{e.preventDefault();setSubmitFilter(true)}}>
                    <div className="filter">
                        <div className="search-form">
                            <div className="mb-3">
                                <label htmlFor="search" className="visually-hidden">Date</label>
                                <input autoComplete="off" type="date" id="access_date_from" className="form-control datepicker access_date_from" placeholder="access start date"  
                                            name="access_date_from" value={startDate} onChange={(e)=>setStartDate(e.target.value)}/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="search" className="visually-hidden">Date</label>
                                <input autoComplete="off" type="date" id="access_date_to" className="form-control datepicker access_date_to" placeholder="access end date"  
                                            name="access_date_to" value={endDate} onChange={(e)=>setEndDate(e.target.value)}/>
                            </div>
                            <div className="float-end" style={{position: "relative",top:"5px"}}>
                            <button onClick={handleReset} type="reset" className="btn btn-primary btn-sm" >reset</button>
                            <button type="submit" id="btnSearch" name="btnSearch" value="filter" style={{margin:"0px 10px"}} className="btn btn-primary btn-sm float-end">filter</button>
                            </div>
                        </div>
                    </div>
                    <div className="tab-menu">
                        <ul className="nav nav-tabs">            
                                <button onClick={handleExport} id="btnExport" name="btnExport" value="export" className="btn btn-primary btn-sm tt"><i className="fa fa-file-excel-o"></i>&nbsp;Export </button>               
                        </ul>
                    </div>
                </form>
                <div className="panel-body">
                    <div className="table-responsive">
                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{items.length}</b> of <b>{totalData}</b> records.</div>
                            <Table isi={items} loading={loading}/>
                        </div>
                        <div style={{textAlign:"center"}}>
                            <Pagination
                            activePage={activePage}
                            itemsCountPerPage={limit}
                            totalItemsCount={totalData}
                            pageRangeDisplayed={limit}
                            onChange={handlePageChange.bind(this)}
                            />
                        </div>  
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export default ActivityLog;