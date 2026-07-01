import React, { useCallback, useState} from 'react';
import Pagination from 'react-js-pagination';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';
//import ReactHTMLTableToExcel from 'react-html-table-to-excel';


function Table(props){
    const items = props.items
    const totalData = props.totalData

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Training Name
                    </th>
                    <th>
                        Schedule Date
                    </th>
                    <th>
                        Capacity
                    </th>
                    <th>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {totalData>0?
                items.map(
                    (item) =>
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.schedule_date_indo}</td>
                            <td>{item.capacity}</td>
                            <td style={{width:"150px"}}>
                                <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; Detail</a> {" "}
                            </td>
                        </tr>
                )  
            :
                <tr><th colSpan='4' style={{textAlign:'center'}}>No Data</th></tr>
            }
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function TrainingReportSchedule(props){

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const [startDateCriteria, setStartDateCriteria] = useState('')
    const [endDateCriteria, setEndDateCriteria] = useState('')
    const [htmlTable, setHtmlTable] = useState('')
    const [excelFileName, setExcelFileName] = useState('')

    const [searchClicked, setSearchClicked] = useState(false)
    
    const pageRangeDisplayed = 10
    const limit = 1000

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            startDate:startDateCriteria,
            endDate:endDateCriteria,
            active_only: true,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbTrainingSchedule/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[startDateCriteria, endDateCriteria])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            startDate:startDateCriteria,
            endDate:endDateCriteria,
            active_only: true,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbTrainingSchedule/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
        excelHtml()
    },[startDateCriteria, endDateCriteria])

    // useEffect(()=>{
    //     getData()
    // },[getData])

    const getDetail=async(param)=>{
        props.setScheduleID(param)
        props.setScheduleDetail(true)
    }
 
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const doSearch = (e) => {
        e.preventDefault()
        getData()
        setSearchClicked(true)    
    }

    const excelHtml = async () => {
        setLoading(true)
        const credentials = {
            filter_period_from:startDateCriteria,
            filter_period_to:endDateCriteria,
            platform_id:platform_id
        };

        let response = await axiosLibrary.postData('awbTrainingReport/ExportDataScheduleRange',credentials);
        if(response.status === 200){
           setHtmlTable(response.data.data1)
           setExcelFileName(response.data.data2.replace(/\..+$/, ''))
           setLoading(false)
        }else{
            alert(response)
            setLoading(false)
        }

    }
    const handleExport = async (e) => {
        e.preventDefault();
        const param = {
            schedule_id:props.scheduleID,
            platform_id:platform_id,
            filter_period_from:startDateCriteria,
            filter_period_to:endDateCriteria,
        }
    
        let response = await axiosLibrary.postDataFile("awbTrainingReport/ExportDataScheduleRangeXlsx", param);
        if(response.status === 200){            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Report Schedule - '+startDateCriteria+' - '+endDateCriteria+'.xlsx');
            document.body.appendChild(link);
            link.click();
        }else{
            alert(response);
        }   
    
    }

    return(
        <div className="panel-body">
            <form id="search-form" onSubmit={doSearch} method="post" style={{display: "block"}} encType='multipart/form-data' >
                <div className="mb-3 field-usereditform-email required">
                    <label className="control-label" forHtml="usereditform-email">&nbsp;Date <span style={{color:"#ff0404"}}>(*)</span></label>
                    <input type="date" id="start_date" required  style={{width:"150px"}} className="form-control" name="startDateCriteria" 
                        aria-required="true" aria-invalid="false" value={startDateCriteria} onChange={(e) => (setStartDateCriteria(e.target.value))} />
                    {'s/d'}
                    <input type="date" id="end_date" required  style={{width:"150px"}} className="form-control" name="endDateCriteria" 
                        aria-required="true" aria-invalid="false" value={endDateCriteria} onChange={(e) => (setEndDateCriteria(e.target.value))} />
                    <div className="help-block"></div>
                </div>
                <div className="mb-3 field-usereditform-email required">
                    <button type="submit" className="btn btn-primary" name="btnSubmit" >Search</button>{' '}
                    {searchClicked?
                       <button onClick={handleExport} type="reset" className="btn btn-primary" ><i className="fa fa-file-excel-o"></i>&nbsp;Export XLSX</button>
                    :''
                    }
                    
                </div>
            </form>
            <div hidden dangerouslySetInnerHTML={{__html: htmlTable}}></div>
            {searchClicked?
                <div className="table-responsive" >
                    <div id="h182093w0" className="grid-view">
                        {/* <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div> */}
                            <Table items={items} edit={getDetail} totalData={totalData} loading={loading}/>
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
            :''
            }
        </div>                                   
    )
}

export default TrainingReportSchedule;