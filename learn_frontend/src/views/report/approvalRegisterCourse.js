
import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import DataTable from 'react-data-table-component';
import { LoadingDatatable } from '../../components/Loading';
import routeAll from '../../helpers/route';

const routeAdmin = routeAll.routesAdmin

function ApprovalRegisterCourse(props){

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const [filterText, setFilterText] = useState("")
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);


    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            module_name: 'Learn',
            approval: 1
        };

        let isi = await axiosLibrary.postData('awbRegisterCourse/ListData',credentials);
        setItems(isi.data.data)
        setLoading(false)
    })

    const approved=async(param)=>{
        const idParam = param;
        setLoading(true)
        const credentials = {
            id: idParam,
            platform_id:platform_id,
            status: 1,
        };
        let isi = await axiosLibrary.postData('awbRegisterCourse/ApprovalCourse',credentials);
        if(isi.status===200){
            getData()
        }
    }

    const rejected=async(param)=>{
        const idParam = param;
        setLoading(true)
        const credentials = {
            id: idParam,
            platform_id:platform_id,
            status: 0,
        };
        let isi = await axiosLibrary.postData('awbRegisterCourse/ApprovalCourse',credentials);
        if(isi.status===200){
            getData()
        }
    }

   

    //datatables
    const columns = [
        
        {
            name: 'Employee ID',
            selector: row => row.imdl_id,
            sortable: true,
            width: '15%'
        },
        {
            name: 'Name',
            selector: row => row.user_name,
            sortable: true,
            width: '20%'
        },
        {
            name: 'Course Title',
            selector: row => row.title,
            sortable: true,
            width: '40%'
        },
        {
            name: 'Actions',
            button: true,
            width: '15%',
            cell: row => (
                <div>
                    {
                        row.flag_active == 2 ? 
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" 
                            name={row.imdl_id}
                            onClick={()=>{approved(row.id)}} id="claimApprove"/>
                            <label class="form-check-label" for="claimApprove">
                                Approve
                            </label>
                            <br/>
                            <br/>
                            <input class="form-check-input" type="checkbox" 
                            name={row.imdl_id}
                            onClick={()=>{rejected(row.id)}}  id="claimReject"/>
                            <label class="form-check-label" for="claimReject">
                               Rejected
                            </label>
                            <br/>
                            <br/>
                        </div>
                        :
                        row.flag_active == 0 ? <p>Rejected</p> : <p>Registered</p>
                    }
                </div>
                
            ),
        },
    ];
    
    /**
    const filteredItems = items.length >0 ? items.filter(
        item => (item.user_name && item.user_name.toLowerCase().includes(filterText.toLowerCase()) )
                || (item.imdl_id && item.imdl_id.toLowerCase().includes(filterText.toLowerCase()) )
                || (item.title && item.title.toLowerCase().includes(filterText.toLowerCase()) )
    ) : "";
    */


    const filteredItems = items.length >0 ? items.filter(
        item => (item.user_name && item.user_name.toLowerCase().includes(filterText.toLowerCase()) )
                || (String(item.imdl_id) && String(item.imdl_id).toLowerCase().includes(filterText.toLowerCase()) )
                || (item.title && item.title.toLowerCase().includes(filterText.toLowerCase()) )
    ) : "";

    const subHeaderComponent = 
    <>
        <input type="text" id="name" style={{width:"25%"}} placeholder="Filter table data..." className="form-control" name="name" maxLength="100" value={filterText} onChange={(e)=>setFilterText(e.target.value)}/>
        <button className="btn btn-danger " onClick={()=>{setFilterText("");setResetPaginationToggle(!resetPaginationToggle);}}>X</button>
    </>

    //end datatables


    useEffect(()=>{
        getData()
    }, [])

 
    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>

                    <div className="panel-body">

                        <div className="table-responsive">
                            <div className="pull-left">
                                <a className="pull-left btn btn-primary btn-sm tt" href={routeAdmin.importClaimSFF.path} ><i className="fa fa-plus aria-hidden="></i> Import</a>  
                            </div>

                            <div id="h182093w0" className="grid-view">
                                <DataTable
                                    //title="Contact List"
                                    columns={columns}
                                    data={filteredItems}
                                    progressPending={loading}
                                    progressComponent={<LoadingDatatable/>}
                                    pagination
                                    paginationResetDefaultPage={resetPaginationToggle}
                                    subHeader
                                    subHeaderComponent={subHeaderComponent}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
    
    )
}

export default ApprovalRegisterCourse;