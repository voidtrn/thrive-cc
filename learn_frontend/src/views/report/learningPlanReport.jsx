import React, { useState, useEffect } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { LoadingDatatable } from '../../components/Loading';
import defaultLang from '../../helpers/lang';
import DataTable from 'react-data-table-component';

function LearningPlanReport(props){
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true)
    const [loadingButton, setLoadingButton] = useState(false);
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [submitFilter, setSubmitFilter] = useState(true)


    const platform_id = securityData.Security_getPlatformId()

    const getData = async () => {
        if(validateForm()){
            setLoading(true)
            const credentials = {
                platform_id:platform_id,
                filter_period_from: startDate,
                filter_period_to: endDate,
            };

            let isi = await axiosLibrary.postData('awbLearningPlan/ListData',credentials);
            setItems(isi.data.data)
            setLoading(false)
            setSubmitFilter(false)
        }
    }

    const validateForm = ()=>{
        let formIsValid = true;
        if (endDate < startDate){
            formIsValid = false;
            alert(defaultLang.lang.errorDate);
        }
        return formIsValid;
    }

    const columns = [
        {
            name: 'User ID',
            selector: row => row.user_id,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Directorate',
            selector: row => row.directorate,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Main Focus',
            selector: row => row.main_focus_title,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Key Behavior En',
            selector: row => row.key_behavior_eng,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Key Behavior Id',
            selector: row => row.key_behavior_ind,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Skills',
            selector: row => row.key_behavior_dtl,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Progress',
            selector: row => `${row.progress_lp||0}%`,
            sortable: true,
        },
        {
            name: 'Rating by user',
            selector: row => row.val_rating,
            sortable: true,
        },
        {
            name: 'Complete date',
            selector: row => row.complete_date,
            sortable: true,
            wrap:true,
        },
        {
            name: 'Created date',
            selector: row => row.date_created,
            sortable: true,
            wrap:true,
        },
    ];

    const handleExport = async (e) => {
        e.preventDefault();
        if(validateForm()){
            setLoadingButton(true)
            const param = {
                platform_id: platform_id,
                filter_period_from: startDate,
                filter_period_to: endDate,
            }
        
            let response = await axiosLibrary.postDataFile("awbLearningPlan/ExportData", param);
            if(response.status === 200){            
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'learning plan.xlsx');
                document.body.appendChild(link);
                link.click();
            }else{
                alert(response);
            }
            setLoadingButton(false)
        }
    }

    const handleReset = () => {
        setStartDate('')
        setEndDate('')
        setSubmitFilter(true)
    }
    
    useEffect(()=>{
        if(platform_id){
            if(submitFilter){
                getData()
            }
        }
    },[submitFilter])

    return(
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong>
                </div>
                <form method="post" onSubmit={(e)=>{e.preventDefault();setSubmitFilter(true);}}>
                    <div className="row">
                        <div className="col-sm-2">
                            <div className="tab-menu">
                                <ul className="nav">            
                                        <button onClick={handleExport} id="btnExport" name="btnExport" value="export" className="btn btn-primary btn-sm tt" disabled={loadingButton}>
                                            <i className="fa fa-file-excel-o"></i>&nbsp;{loadingButton?`Please Wait`:`Export`} 
                                        </button>               
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
                            <DataTable
                                columns={columns}
                                data={items}
                                progressPending={loading}
                                progressComponent={<LoadingDatatable/>}
                                pagination
                                fixedHeader
                                highlightOnHover
                            />
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}

export default LearningPlanReport;