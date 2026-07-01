import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import TrainingReportSchedule from './trainingReportSchedule';
import TrainingReportTrainingDetail from './trainingReportTrainingDetail';
import TrainingReportScheduleDetail from './trainingReportScheduleDetail';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const totalData = props.totalData

    return(
        <table className="table table-hover">
            <thead>
                <tr>
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

            {totalData>0?
                items.map(
                    (item) =>
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td style={{width:"100px"}}><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span></td>
                            
                            <td style={{width:"150px"}}>
                                <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; Detail</a> {" "}
                            </td>
                        </tr>
                )  
            :
                <tr><th colspan='3' style={{textAlign:'center'}}>No Data</th></tr>
            }
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function TrainingReport(){

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const [searchCriteria, setSearchCriteria] = useState('')
    const [trainingDetail, setTrainingDetail] = useState(false)
    const [scheduleDetail, setScheduleDetail] = useState(false)

    const [key, setKey] = useState('#tab-0');
    const [titleStr, setTitleStr] = useState("Users");
    const [searchClicked, setSearchClicked] = useState(false)
    const [trainingID, setTrainingID] = useState('')
    const [scheduleID, setScheduleID] = useState('')
    
    const pageRangeDisplayed = 10
    const limit = 1000

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            filter_search:searchCriteria,
            active_only: true,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbTraining/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[searchCriteria])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            filter_search:searchCriteria,
            active_only: true,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbTraining/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[searchCriteria])

    useEffect(()=>{
        handleBackToOverview()
    },[platform_id])

    const getDetail=async(param)=>{
        setTrainingID(param)
        setTrainingDetail(true)
    }
 
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const handleBackToOverview = () => {
        switch(key) {
            case "#tab-0":
                handleTabSelect('#tab-0')
                break;
            case "#tab-1":
                handleTabSelect('#tab-1')
                break;
            default:
                handleTabSelect('#tab-0')  
        }
    }

    const handleTabSelect = (tab) => {
        
        setKey(tab);
        switch(tab){
            case '#tab-0':
                setTitleStr(routeAdmin.trainingReportTraining.pageName);
               
                break;
            case '#tab-1':
                setTitleStr("Training Schedule Report Administration");
                
                break;
            default:
                setTitleStr(routeAdmin.trainingReportTraining.pageName);
        }

        setScheduleDetail(false)
        setTrainingDetail(false)
      
    }

    const doSearch = (e) => {
        e.preventDefault()
        getData()
        setSearchClicked(true)    
    }

    useEffect(()=>{
        if(trainingDetail){
            setTitleStr("Training Detail Report Administration");
        }
        if(scheduleDetail){
            setTitleStr("Training Schedule Detail Report Administration");
        }
    },[trainingDetail, scheduleDetail])

    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="col-md-8">
                            <strong>{titleStr}</strong> 
                        </div>   
                        {(trainingDetail && key==='#tab-0') || (scheduleDetail && key==='#tab-1')?
                            <div className="clearfix">
                                <a className="float-end btn btn-default" onClick={handleBackToOverview.bind(this)} label="Back to overview" data-ui-loader="">
                                    <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to overview</a>
                            </div>   
                        :''
                        }                  
                    </div>
                    <div className="panel-body">
                        <Tab.Container id="profile-tabs" 
                            defaultActiveKey="#tab-0"
                            activeKey={key}
                            onSelect={ handleTabSelect }
                            >
                            <Row className="clearfix">
                                <Col sm={12}>
                                    <Nav variant="tabs" className="tab-menu tab-main tab-header">
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-0">By Training</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="#tab-1">By Schedule Date</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                                <Col sm={12}>
                                    <Tab.Content animation="true">
                                        <Tab.Pane eventKey="#tab-0">
                                            {!trainingDetail?
                                                <div className="panel-body">
                                                    <form id="search-form" onSubmit={doSearch} method="post" style={{display: "block"}} encType='multipart/form-data' >
                                                        <div className="mb-3 field-usereditform-email required">
                                                            <label className="form-label" forHtml="usereditform-email">&nbsp;Training Name <span style={{color:"#ff0404"}}>(*)</span></label>
                                                            <input type="text" id="usereditform-email" required  style={{width:"75%"}} className="form-control" name="search" 
                                                                aria-required="true" aria-invalid="false" value={searchCriteria} onChange={(e) => (setSearchCriteria(e.target.value))} />

                                                            <div className="help-block"></div>
                                                        </div>
                                                        <div className="mb-3 field-usereditform-email required">
                                                            <button type="submit" className="btn btn-primary" name="btnSubmit" >Search</button>
                                                        </div>
                                                    </form>

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
                                            :
                                                <TrainingReportTrainingDetail trainingDetail={trainingDetail} setTrainingDetail={setTrainingDetail}
                                                    trainingID={trainingID} />
                                            }
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="#tab-1">
                                            {!scheduleDetail?
                                                <TrainingReportSchedule scheduleID={scheduleID} setScheduleID={setScheduleID} setScheduleDetail={setScheduleDetail} 
                                                    scheduleDetail={scheduleDetail}/>
                                            :
                                                <TrainingReportScheduleDetail scheduleDetail={scheduleDetail} setScheduleDetail={setScheduleDetail}
                                                    scheduleID={scheduleID} />
                                            }
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container>
                    </div>
                </div>
            </div>
    )
}

export default TrainingReport;