
import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import DataTable from 'react-data-table-component';
import { LoadingDatatable } from '../../components/Loading';
import routeAll from '../../helpers/route';

const routeAdmin = routeAll.routesAdmin

function ClaimSFF(props){

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const [filterText, setFilterText] = useState("")
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const [claimStatus, setClaimStatus] = useState(null)
    const [id, setID] = useState(null)
    const [imdlID, setImdlID] = useState(null)

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            module_name: 'Learn',
            status_claim: 0
        };

        let isi = await axiosLibrary.postData('awbRegisterCourse/ListData',credentials);
        setItems(isi.data.data)
        setLoading(false)
    })

    const updateData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            status_claim: claimStatus,
            id: id,
            imdl_id: imdlID,
        };

        let isi = await axiosLibrary.postData('awbRegisterCourse/UpdateData',credentials);
        if(isi.status===200){
            setClaimStatus(null)
            setID(null)
            setImdlID(null)
            getData()
        }
    })

    const handleInputCheck = (event) =>{
        const target = event.target
        const value = target.value
        const name = target.name
        const checked = target.type === 'checkbox' ? target.checked : target.value;
        if (checked == true){
            setID(value)
            setClaimStatus(1)
            setImdlID(name)
        }else{
            setClaimStatus(null)
            setID(null)
            setImdlID(null)
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
            name: 'Claim Status',
            selector: row => row.status_claim == 1 ? 'Claimed' : 'Unclaimed',
            sortable: true,
            center: true,
            width: '15%'
        },
        {
            name: 'Actions',
            button: true,
            width: '10%',
            cell: row => (
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" 
                    name={row.imdl_id}
                    disabled={row.status_claim == 1 ? true : false}
                    checked={
                        claimStatus == null ?
                            row.status_claim == 1 ? true : false
                            :
                            claimStatus == 1 ? true : false
                    } 
                    onChange={handleInputCheck.bind(this)}  value={row.id} id="claim"/>
                    <label class="form-check-label" for="claim">
                        {row.status_claim == 1 ? 'Claimed' : 'Claim'}
                    </label>
                </div>
            ),
        }
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

    useEffect(()=>{
        if (claimStatus != null && id !=null && imdlID!=null){
            updateData()
        }
    }, [claimStatus, id])

    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>{props.pageName}</strong> 
                    </div>

                    <div className="panel-body">

                        <div className="table-responsive">
                            <div className="float-start">
                                <a className="float-start btn btn-primary btn-sm tt" href={routeAdmin.importClaimSFF.path} ><i className="fa fa-plus aria-hidden="></i> Import</a>  
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

export default ClaimSFF;