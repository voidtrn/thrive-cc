import React, { useState, useEffect } from 'react';
import Pagination from 'react-js-pagination';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import defaultLang from '../../helpers/lang';

function Table(items){
    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Article
                    </th>
                    <th >
                        Question
                    </th>
                    <th >
                        Answer
                    </th>
                    <th >
                        User Name
                    </th>
                    <th >
                        User Answer & Date
                    </th>
                    <th>
                        User Point
                    </th>
                </tr>
            </thead>

            <tbody style={cssTarget(items.loading)}>
            {items.isi.map(
            (item) =>
                <tr key={item.index}>
                    <td>{item.article_title}</td>
                    <td>{item.question}</td>
                    <td>
                        {
                            item.answer_mode == 3 ?
                            <>
                            { item.answer_choice_mode_3.indexof('A') !== false ? '<p style="margin:0">a) '+ item.choice_1.slice(0, 150) +'</p>' : '' }
                            { item.answer_choice_mode_3.indexof('B') !== false ? '<p style="margin:0">a) '+ item.choice_2.slice(0, 150) +'</p>' : '' }
                            { item.answer_choice_mode_3.indexof('C') !== false ? '<p style="margin:0">a) '+ item.choice_3.slice(0, 150) +'</p>' : '' }
                            { item.answer_choice_mode_3.indexof('D') !== false ? '<p style="margin:0">a) '+ item.choice_4.slice(0, 150) : '' }
                            
                            </>
                            : 
                                item.quiz_answer
                        }
                    </td>
                    <td>
                        {item.user_name} <br/> {item.user_id}
                    </td>
                    <td>
                        { item.answer_mode == 3 ? item.answer_choice_mode_3 : item.user_answer }
                        <strong> { item.quiz_result }</strong>
                        <br/> { item.date_modified }
                         
                    </td>
                    <td>
                        {
                            item.quiz_result == "Correct" ? item.point : 0
                        }
                    </td>
                </tr>
            )}
            </tbody>

            <LoadingAdmin loading={items.loading}/> 
        </table>
    )
}

function answeredQuiz(props){
    
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [category, setCategory] = useState("all")
    const [submitFilter, setSubmitFilter] = useState(true)
    const [loading, setLoading] = useState(true)

    const platform_id = securityData.Security_getPlatformId()
    const pageRangeDisplayed = 10
    const limit = 10

    const validateForm = ()=>{
        let formIsValid = true;
        if (endDate < startDate){
            formIsValid = false;
            alert(defaultLang.lang.errorDate);
        }
        return formIsValid;
    }

    const getTotalPage = async () => {
        if(submitFilter){
            const credentials = {
                limit: limit,
                offset:offset,
                category:"COUNT",
                platform_id:platform_id,
                filter_period_from: startDate,
                filter_period_to: endDate,
                filter_category: category,
                module_name: 'Learn'
            };
    
            let isi = await axiosLibrary.postData('awbAnsweredQuiz/ListData',credentials);
            setTotalData(isi.data.data)
            setSubmitFilter(false)
        }
        
    }

    const getData = async () => {
        if(submitFilter){
            if(validateForm()){
                setLoading(true)
                const credentials = {
                    limit: limit,
                    offset:offset,
                    platform_id:platform_id,
                    filter_period_from: startDate,
                    filter_period_to: endDate,
                    filter_category: category,
                    module_name: 'Learn'
                };
        
                let isi = await axiosLibrary.postData('awbAnsweredQuiz/ListData',credentials);
                setItems(isi.data.data)
                setLoading(false)
            }
        }

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
                    filter_category: category,
                    module_name: 'Learn',
                }
            
                let response = await axiosLibrary.postDataFile("awbAnsweredQuiz/ExportData", param);
                if(response.status === 200){            
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'answered_quiz - report'+startDate+'.xlsx');
                    document.body.appendChild(link);
                    link.click();
                }else{
                    alert(response);
                }
            }
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
                <form method="post" onSubmit={(e)=>{e.preventDefault();setSubmitFilter(true);setOffset(0)}}>
                    <div className="row">
                        <div className="col-sm-1">
                            <div className="tab-menu">
                                <ul className="nav nav-tabs">            
                                        <button onClick={handleExport} id="btnExport" name="btnExport" value="export" className="btn btn-primary btn-sm tt"><i className="fa fa-file-excel-o"></i>&nbsp;Export </button>               
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-9">
                            <div className="filter">
                                <div className="search-form">
                                    <div className="mb-3 has-feedback" style={{width:"auto"}}>
                                        <label htmlFor="search" className="visually-hidden">Date</label>
                                        <input autoComplete="off" type="date" id="access_date_to" className="form-control datepicker access_date_to" placeholder="access end date"  
                                                    name="access_date_to" value={endDate} onChange={(e)=>setEndDate(e.target.value)}/>
                                    </div>

                                    <div className="mb-3 has-feedback" style={{width:"auto"}}>
                                        <label htmlFor="search" className="visually-hidden">Date</label>
                                        <input autoComplete="off" type="date" id="access_date_from" className="form-control datepicker access_date_from" placeholder="access start date"  
                                                    name="access_date_from" value={startDate} onChange={(e)=>setStartDate(e.target.value)}/>
                                    </div>
                                    
                                    <div className="mb-3 has-feedback" style={{width:"auto"}}>
                                        <select onChange={(e)=>setCategory(e.target.value)}  style={{width:"150px", border: 'none'}} className="form-control filter-data" id="filterCategory" name="filterCategory">
                                            <option value="all"  {...category != "iqos" ? "selected" : ""} >all category</option>
                                            <option value="iqos" {...category == "iqos" ? "selected" : ""} >IQOS Beliver</option>
                                        </select>
                                    </div>  
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-2">
                            <div style={{position: "relative",top:"5px"}}>
                                <button onClick={()=>handleReset()} type="reset" className="btn btn-primary btn-sm" >reset</button>
                                <button type="submit" id="btnSearch" name="btnSearch" value="filter" style={{margin:"0px 10px"}} className="btn btn-primary btn-sm pull-right">filter</button>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="panel-body">
                    <div className="table-responsive">
                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{items.length}</b> of <b>{totalData}</b> records.</div>
                            <Table isi={items} loading={loading}/>
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

export default answeredQuiz;