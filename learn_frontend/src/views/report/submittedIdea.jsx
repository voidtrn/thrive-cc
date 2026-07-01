import React, { useState, useEffect,   } from 'react';
import Pagination from 'react-js-pagination';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import defaultLang from '../../helpers/lang';


function SubmittedIdea(props){
    
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
    const pageRangeDisplayed = 10

    const validateForm = ()=>{
        let formIsValid = true;
        if (endDate < startDate){
            formIsValid = false;
            alert(defaultLang.lang.errorDate);
        }
        return formIsValid;
    }

    const getTotalPage =  async () => {
        if(submitFilter){
            const credentials = {
                limit: limit,
                offset:offset,
                category:"COUNT",
                platform_id:platform_id,
                filter_period_from: startDate,
                filter_period_to: endDate,
                module_name: 'Learn'
            };
    
            let isi = await axiosLibrary.postData('awbSubmittedIdea/ListData',credentials);
            setTotalData(isi.data.data)
            setSubmitFilter(false)
        }
        
    }

    const getData =  async () => {
        if(submitFilter){
            if(validateForm()){
                setLoading(true)
                const credentials = {
                    limit: limit,
                    offset:offset,
                    platform_id:platform_id,
                    filter_period_from: startDate,
                    filter_period_to: endDate,
                    module_name: 'Learn'
                };
        
                let isi = await axiosLibrary.postData('awbSubmittedIdea/ListData',credentials);
                setItems(isi.data.data)
                setLoading(false)
            }
        }

    }

    const table = () =>{
        return(
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>User Name </th>
                        <th>User Account </th>
                        <th>User Email</th>
                        <th>Submit Date</th>
                        <th>Message Idea</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody style={cssTarget(loading)}>
                {items.length<=0 ? "" :
                items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.user_name}</td>
                        <td>{item.user_account}</td>
                        <td>{item.user_email}</td>
                        <td>{item.submitted_date}</td>
                        <td>{item.message_idea}</td>
                        <td>
                            <a className="btn btn-danger btn-xs tt"  onClick={deleteItem.bind(this,item.id)} ><i className="fa fa-times">&nbsp; delete</i></a>
                        </td>
                    </tr>
                )}
                </tbody>

                <LoadingAdmin loading={loading}/> 
            </table>
        )
    }

    useEffect(()=>{
        if(startDate==''&&endDate==''){
            getData()
            getTotalPage()
        }
        if(startDate!=''&&endDate!=''){
            getData()
            getTotalPage()
        }
    },[offset,startDate,endDate,submitFilter])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
        setSubmitFilter(true)
    }

    const handleExport = async (e) => {
        e.preventDefault();
        if (startDate == "" || endDate == "") {
            alert("Please fill both date.")
        }else{
            if(validateForm()){
                const param = {
                    platform_id: platform_id,
                    filter_period_from: startDate,
                    filter_period_to: endDate,
                    module_name: 'Learn',
                }
            
                let response = await axiosLibrary.postDataFile("awbSubmittedIdea/ExportData", param);
                if(response.status === 200){            
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'subbmited_idea - report'+startDate+'.xlsx');
                    document.body.appendChild(link);
                    link.click();
                }else{
                    alert(response);
                }
            }
        }
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id
        }
        let responseJson = await axiosLibrary.postData('awbSubmittedIdea/DeleteData',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const handleReset = () => {
        setStartDate('')
        setEndDate('')
        setOffset(0)
        setSubmitFilter(true)
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

        .nav-tabs {
            border-bottom: unset;
        }
        `}
        </style>
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>
                </div>
                <form method="post" onSubmit={(e)=>{e.preventDefault();setSubmitFilter(true)}}>
                    <div className="row">
                        <div className="col-sm-2">
                            <div className="tab-menu">
                                <ul className="nav nav-tabs">            
                                        <button onClick={handleExport} id="btnExport" name="btnExport" value="export" className="btn btn-primary btn-sm tt"><i className="fa fa-file-excel-o"></i>&nbsp;Export </button>               
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-8">
                            <div className="filter">
                                <div className="search-form">
                                    <div className="mb-3">
                                        <label htmlFor="search" className="visually-hidden">Date</label>
                                        <input autoComplete="off" type="date" id="access_date_to" className="form-control datepicker access_date_to" placeholder="access end date"  
                                                    name="access_date_to" value={endDate} onChange={(e)=>setEndDate(e.target.value)}/>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="search" className="visually-hidden">Date</label>
                                        <input autoComplete="off" type="date" id="access_date_from" className="form-control datepicker access_date_from" placeholder="access start date"  
                                                    name="access_date_from" value={startDate} onChange={(e)=>setStartDate(e.target.value)}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div style={{position: "relative",top:"5px"}}>
                                <button onClick={()=>handleReset()} type="reset" className="btn btn-primary btn-sm" >reset</button>
                                <button type="submit" id="btnSearch" name="btnSearch" value="filter" style={{margin:"0px 10px"}} className="btn btn-primary btn-sm float-end">filter</button>
                            </div>
                        </div>
                    </div>
                    
                </form>
                <div className="panel-body">
                    <div className="table-responsive">
                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{items.length}</b> of <b>{totalData}</b> records.</div>
                            {table()}
                        </div>
                        {items.length >0 ?

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
                            : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export default SubmittedIdea;