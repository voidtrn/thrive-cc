import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import moment from 'moment';

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th >
                        Employee
                    </th>
                    <th >
                        Initiator
                    </th>
                    <th >
                        Title
                    </th>
                    <th >
                        Place <br/>Date & Time
                    </th>
                    <th >
                        Total Participants
                    </th>
                    <th >
                        Submit Datetime
                    </th>
                    <th >
                        Action
                    </th>
                    <th >
                        Confirmation Email
                    </th>
                    <th >
                        Hold Email
                    </th>
                    <th >
                        Congratulatory Email
                    </th>
                    <th >
                        Feedback Email
                    </th>
                </tr>
            </thead>
            <tbody>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>
                            {`${item.employee_name} (${item.user_id})`}<br/>{item.employee_func}
                        </td>
                        <td>
                            {`${item.initiator_name} (${item.initiator_id})`}<br/>{item.initiator_func}
                        </td>
                        <td>
                            {item.title}
                        </td>
                        <td style={{width:150}}>
                            {item.place}<br/>{item.schedule_date}<br/>{item.schedule_time}
                        </td>
                        <td>
                            {item.total_participant}
                        </td>
                        <td>
                            {moment(item.date_created).format('LLL')}
                        </td>
                        <td>
                            <select name="status" defaultValue={item.flag_check_mark} data-id={item.id} onChange={props.actionChange.bind(this)}>
                                <option value="0">-select-</option>
                                <option value="1">Done</option>
                                <option value="2">Cancelled</option>
                            </select>
                        </td>
                        <td>
                            <button type="button" className={item.email_confirmation_flag===0 && item.flag_check_mark !==2? "btn btn-primary btn-xs tt":"btn btn-default btn-xs tt"} onClick={props.sentEmail.bind(this,{type:1,id:item.id})} disabled={item.email_confirmation_flag===0 && item.flag_check_mark !==2? false : true}>
                                <i className="fa fa-envelope"></i>&nbsp; {item.email_confirmation_flag===1? 'Sent' : 'Send'}
                            </button> 
                        </td>
                        <td>
                            <button type="button" className={item.email_hold_flag===0 && item.flag_check_mark !==2? "btn btn-primary btn-xs tt":"btn btn-default btn-xs tt"} onClick={props.sentEmail.bind(this,{type:2,id:item.id})} disabled={item.email_hold_flag===0 && item.flag_check_mark !==2? false : true}>
                                <i className="fa fa-envelope"></i>&nbsp; {item.email_hold_flag===1? 'Sent' : 'Send'}
                            </button> 
                        </td>
                        <td>
                            <button type="button" className={item.email_congratulatory_flag===0 && item.flag_check_mark === 1 ? "btn btn-primary btn-xs tt":"btn btn-default btn-xs tt"} onClick={props.sentEmail.bind(this,{type:3,id:item.id})} disabled={item.email_congratulatory_flag===0 && item.flag_check_mark ===1? false : true}>
                                <i className="fa fa-envelope"></i>&nbsp; {item.email_congratulatory_flag===1? 'Sent' : 'Send'}
                            </button> 
                        </td>
                        <td>
                            <button type="button" className={item.email_feedback_flag===0 && item.flag_check_mark === 1 ? "btn btn-primary btn-xs tt":"btn btn-default btn-xs tt"} onClick={props.sentEmail.bind(this,{type:4,id:item.id})} disabled={item.email_feedback_flag===0 && item.flag_check_mark === 1? false : true} >
                                <i className="fa fa-envelope"></i>&nbsp; {item.email_feedback_flag===1? 'Sent' : 'Send'}
                            </button> 
                        </td>
                    </tr>
            )}   
            </tbody>
        </table>
    )
}

function ReportSubmittedEvents(props){

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [search, setSearch] = useState("")
    const [submitFilter, setSubmitFilter] = useState(true)
    const [loading, setLoading] = useState(true)

    const pageRangeDisplayed = 10
    const platform_id = securityData.Security_getPlatformId()
    const userId = securityData.Security_UserId()
    const limit = 10

    const handleReset = (e) => {
        e.preventDefault();
        setStartDate('')
        setEndDate('')
        setSearch('')
    }

    const handleExport = async (e) => {
        e.preventDefault();
        const param = {
            platform_id:platform_id,
            filter_period_from: startDate,
            filter_period_to: endDate,
            filter_search: search
        }
    
        let response = await axiosLibrary.postDataFile("dialogueEvent/FormExport", param);
        if(response.status === 200){            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_dialogue_event_${moment().format('YYYYMMDDHHmmss')}.xlsx`);
            document.body.appendChild(link);
            link.click();
        }else{
            alert(response);
        }
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
        setSubmitFilter(true)
    }

    const getTotalPage = useCallback(async () => {
        if(submitFilter){
            const credentials = {
                limit: limit,
                offset:offset,
                category:"COUNT",
                platform_id:platform_id,
                filter_period_from: startDate,
                filter_period_to: endDate,
                filter_search: search
            };
    
            let isi = await axiosLibrary.postData('dialogueEvent/ListData',credentials);
            setTotalData(isi.data.data)
            setLoading(false)
            setSubmitFilter(false)
        }
    },[offset,submitFilter])

    const getData = useCallback(async () => {
        if(submitFilter){
            setLoading(true)
            const credentials = {
                limit: limit,
                offset:offset,
                category:"",
                platform_id:platform_id,
                filter_period_from: startDate,
                filter_period_to: endDate,
                filter_search: search
            };
    
            let isi = await axiosLibrary.postData('dialogueEvent/ListData',credentials);
            setItems(isi.data.data)
            getTotalPage()
        }
    },[offset,getTotalPage,submitFilter])

    useEffect(()=>{
        getData()
    },[getData])

    const updateStatus = async (selectProp) => {
        const idParam = selectProp.target.dataset['id'];
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data;

        const param = {
            id: ID,
            flag_check_mark: selectProp.target.value
        }
        let isi = await axiosLibrary.postData('dialogueEvent/UpdateFlagCheckMark',param);
        if(isi.status===200){
            setSubmitFilter(true)
        }else{
            alert('error update flag')
        }
    }

    const sentEmail = async (paramEmail) => {
        //change to md5
        const idParam = paramEmail.id
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const md5ID =responseJson.data.data;

        const paramToApi = {
            id: md5ID,
            user_id: userId,
            platform_id:platform_id,
            theme_id: securityData.Security_getTheme().id || 1,
            case: paramEmail.type
        }

        await axiosLibrary.postData('dialogueEvent/SendEmail',paramToApi);

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
            `}
        </style>
        <div className="col-md-12">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>
                </div>
                <form method="post" onSubmit={(e)=>{e.preventDefault();setSubmitFilter(true)}}>
                    <div className="filter">
                        <div className="search-form">
                            <div className="mb-3">
                            {/* <DateRangePicker
                            initialSettings={{ singleDatePicker: true, showDropdowns: true, minYear: 1901, maxYear: parseInt(moment().format('YYYY'),10) }}
                            >
                                <input type="text" className="form-control" />
                            </DateRangePicker> */}
                                <label htmlFor="search" className="visually-hidden">Date</label>
                                <input autoComplete="off" type="date" id="access_date_from" className="form-control datepicker access_date_from" placeholder="access start date"  
                                            name="access_date_from" value={startDate} onChange={(e)=>setStartDate(e.target.value)}/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="search" className="visually-hidden">Date</label>
                                <input autoComplete="off" type="date" id="access_date_to" className="form-control datepicker access_date_to" placeholder="access end date"  
                                            name="access_date_to" value={endDate} onChange={(e)=>setEndDate(e.target.value)}/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="search" className="visually-hidden">Search</label>
                                <input autoComplete="off" type="text" id="search" className="form-control" placeholder="search" name="search" value={search} onChange={(e)=>setSearch(e.target.value)}/>
                                <span className="lbl-primary fa fa-search form-control-feedback"></span>
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
                        <div className="grid-view">
                            <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                            {loading? <div className="text-center"><img src={env.assets+"images/lazyloading.gif"} alt="loading_img"/></div> :
                                    <Table items={items} actionChange={updateStatus} sentEmail={sentEmail}/>
                            }
                        </div> 
                        <div style={{textAlign:"center"}}>
                            <Pagination
                            activePage={activePage}
                            itemsCountPerPage={limit}
                            totalItemsCount={totalData}
                            pageRangeDisplayed={pageRangeDisplayed}
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

export default ReportSubmittedEvents;