import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
// import {useHistory } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import {  env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.file_path

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Filename
                    </th>
                    <th>
                        Total Processed Data 
                    </th>
                    <th>
                        Total Data
                    </th>
                    <th>
                        Imported By
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
                        <td >{item.file_name}</td>
                        <td >{item.data_inserted + item.data_updated}</td>
                        <td >{item.count_data}</td>
                        <td >{item.user_created_name}</td>
                        <td style={{width:"150px"}}>
                            <a className="btn btn-primary btn-xs tt" href={file_path+'event_participant/'+item.file_name} ><i className="fa fa-file-excel-o"></i>&nbsp; export</a> {" "}
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function EventParticipantImport(props){
    // const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const file_path = env.userDocument;
    
    const pageRangeDisplayed = 10
    const limit = 20

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbEventParticipant/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbEventParticipant/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage])

    useEffect(()=>{
        getData()
    },[platform_id])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>
                    <div className="panel-body">

                        <div className="table-responsive">
                            <div className="float-end">
                                <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.eventParticipantImportDetail.path} ><i className="fa fa-plus aria-hidden"></i> Upload</a>  
                            </div>

                            <div id="h182093w0" className="grid-view">
                                <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                    <Table items={items} file_path={file_path} loading={loading}/>
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
    )
}

export default EventParticipantImport;