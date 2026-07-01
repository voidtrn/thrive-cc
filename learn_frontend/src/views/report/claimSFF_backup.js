
import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import DataTable from 'react-data-table-component';
import { LoadingDatatable } from '../../components/Loading';
function ClaimSFF(props){

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const [filterText, setFilterText] = useState("")
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const [claimStatus, setClaimStatus] = useState(null)
    const [id, setID] = useState(null)
    
    const [DataHasil, setDataHasil] = useState([])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            platform_id:platform_id,
            module_name: 'Learn'
        };

        let isi = await axiosLibrary.postData('awbRegisterCourse/ListData',credentials);
        setItems(isi.data.data)
        setLoading(false)
    })

    const updateData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            status_claim: claimStatus,
            id: id
        };

        let isi = await axiosLibrary.postData('awbRegisterCourse/UpdateData',credentials);
        setItems(isi.data.data)
        setLoading(false)
    })

    const changeFlag=(key, check, values)=>{
            items.flag1 = 0;
            items.flag2 = 0;
            items.flag3 = 0;
            items.flag4 = 0;
            items.flag5 = 0;

        if(check == true){
            switch (key){
                case "flag1":
                    items.flag1 = values;
                    break;
                case "flag2":
                    items.flag2 = values;
                    break;
                case "flag3":
                    items.flag3 = values;
                    break;
                case "flag4":
                    items.flag4 = values;
                    break;
                case "flag5":
                    items.flag5 = values;
                    break;
                default:
                    break
            }
        }else{
            switch (key){
                case "flag1":
                    items.flag1 = 0;
                    break;
                case "flag2":
                    items.flag2 = 0;
                    break;
                case "flag3":
                    items.flag3 = 0;
                    break;
                case "flag4":
                    items.flag4 = 0;
                    break;
                case "flag5":
                    items.flag5 = 0;
                    break;
                default:
                    break
            }
        }
    }

    const handleInputCheck = (event) =>{
        const target = event.target;
        const values = target.value;
        const checked = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;
        let isi = []
        var stateCopy=""

        //const idx = editData ? key.replace("flag",'') : values.replace("flag",'')
        const idx = values.replace(key,'')
        const nameKey = key.replace(idx, '')

        console.log([target, values, key, idx, nameKey])

        stateCopy = Object.assign({}, DataHasil[idx]);
        stateCopy["id"] = key;
        stateCopy["status_claim"] = 1;

        if(checked == false){
            isi = DataHasil.filter((hasil) => hasil.id!=key)
        }else{
            
            if(DataHasil.filter((hasil) => hasil.flag == values && hasil.id==key).length>0){
                isi = DataHasil.filter((hasil) => hasil.flag != values && hasil.id==idx)
            }else{
                if( items.type_question == 1 || items.type_question == 3) {
                        DataHasil.fill([])
                }
                isi = [...DataHasil,stateCopy]
            }
        }
        setDataHasil(isi)
        //changeFlag(key, checked, values)
    }

    console.log(DataHasil)

    //datatables
    const columns = [
        
        {
            name: 'IMDL ID',
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
                    name={row.id} values={row.status_claim}
                    onChange={handleInputCheck.bind(this)}  
                    checked={ DataHasil.filter((hasil) => hasil.status_claim == 1 && hasil.id==row.id).length>0 ? true : false}/>
                    <label class="form-check-label" for="claim">
                        {
                            row.status_claim == 1 ? 'Claimed' : 'Claim'
                        }
                    </label>
                </div>
            ),
        }
    ];
    console.log(items.length)
    const filteredItems = items.length >0 ? items.filter(
        item => (item.user_name && item.user_name.toLowerCase().includes(filterText.toLowerCase()) )
                || (item.imdl_id && item.imdl_id.toLowerCase().includes(filterText.toLowerCase()) )
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
        if (claimStatus != null && id !=null){
            updateData()
            getData()
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