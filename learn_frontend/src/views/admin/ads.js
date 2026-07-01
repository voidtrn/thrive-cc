
import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import DataTable from 'react-data-table-component';
import { LoadingDatatable } from '../../components/Loading';
import { env } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import {useHistory } from 'react-router';

const routeAdmin = routeAll.routesAdmin

function Ads(props){

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const [filterText, setFilterText] = useState("")
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

    const limit = 10
    const offset = 0
    const category = ""

    const file_path= env.userDocument
    const history = useHistory()

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            platform_id : platform_id,
            limit : limit,
            offset : offset,
            category : category
        };

        let isi = await axiosLibrary.postData('awbAds/ListData',credentials);
        setItems(isi.data.data)
        setLoading(false)
    })

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id: idParam});
        const ID =responseJson.data.data;
        history.push({
            pathname: routeAdmin.adsDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    //datatables
    const columns = [
        
        {
            name: 'Title',
            //selector: row => row.title,
            sortable: true,
            cell: row=>(
                <>
                    {row.title}
                    <br />
                    {row.title_ind}
                </>
            )
        },
        {
            name: 'Ads Image',
            sortable: true,
            cell: row=>(
                <>
                    <img  style={{width:"100px",height:"auto"}} src={file_path+ "ads/" + row.image}     alt="" />
                </>
            )
        },
        {
            name: 'Status',
            sortable: true,
            center: true,
            cell: row=>(
                <span style={ row.status_active ? {} :{  color:"#ff0707" } }>{row.status_active ? 'active' :'inactive'}</span>
            )
        },
        {
            name: 'Period',
            sortable: true,
            center: true,
            cell: row=>(
                <>
                    {'start :   '+ row.period_from}
                    <br />
                    {'end   :   '+ row.period_to}
                </>
            )
        },
        {
            name: 'Link',
            selector: row => row.hyperlink_url,
            sortable: true
        },
        {
            name: 'Actions',
            button: true,
            width: '10%',
            cell: row => (
                <div>
                    <button type="button" className="btn btn-primary btn-sm"  onClick={()=>{getDetail(row.id)}}>Edit</button>
                </div>
            ),
        }
    ];
    
    const filteredItems = items.length >0 ? items.filter(
        item => (item.title && item.title.toLowerCase().includes(filterText.toLowerCase()) )
                || (item.title_ind && item.title_ind.toLowerCase().includes(filterText.toLowerCase()) )
                || (item.hyperlink_url && item.hyperlink_url.toLowerCase().includes(filterText.toLowerCase()) )
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
                                <a className="pull-left btn btn-primary btn-sm tt" href={routeAdmin.adsDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
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

export default Ads;