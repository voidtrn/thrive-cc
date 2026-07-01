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

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Employee Id
                    </th>
                    <th>
                        Employee Name 
                    </th>
                    <th>
                        Group Grade
                    </th>
                    <th>
                        Group Function
                    </th>
                    <th>
                        Generation
                    </th>
                    <th>
                        Gender
                    </th>
                    <th>
                        Group Basetown Location
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td >{item.id}</td>
                        <td >{item.name}</td>
                        <td >{item.group_grade}</td>
                        <td >{item.group_function}</td>
                        <td >{item.generation}</td>
                        <td >{item.gender}</td>
                        <td >{item.group_basetown_location}</td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function ImportUserInfo(props){
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

        let isi = await axiosLibrary.postData('awbUserInfo/ListData',credentials);
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

        let isi = await axiosLibrary.postData('awbUserInfo/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage])

    const exportData = useCallback(async () => {
        let d=new Date()
        let dateTimeStr = d.getFullYear() + ''+(d.getMonth()+1)+''+(d.getDay()+1)+''+d.getHours()+''+d.getMinutes()+''+d.getSeconds()
        const credentials = {
            platform_id:platform_id
        };

        let response = await axiosLibrary.postDataFile('awbUserInfo/ExportData',credentials);
        if(response.status === 200){
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            let fileNameStr='export_unmatched_user_data_' + dateTimeStr+'.xlsx'
            link.setAttribute('download', fileNameStr); //any other extension
            document.body.appendChild(link);
            link.click();
            link.remove();
        }else{
            alert(response)
        }
    })

    useEffect(()=>{
        getData()
    },[getData])

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
                                <a className="btn btn-warning btn-sm tt" onClick={exportData} style={{marginRight:"10px"}} ><i className="fa fa-file-excel-o aria-hidden"></i> Export - Unmatched User Data</a>  
                                <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.importUserInfoDetail.path} ><i className="fa fa-plus aria-hidden"></i> Upload</a>  
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

export default ImportUserInfo;