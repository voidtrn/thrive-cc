import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.file_path
    const totalActiveData = props.totalActiveData

    var sortIndex = 0

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Title
                    </th>
                    <th>
                        Image
                    </th>
                    <th>
                        Hyperlink
                    </th>
                    <th >
                        Sequence
                    </th>
                    <th >
                        Status Active
                    </th>
                    <th >
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.title}</td>
                        <td> {item.file_type != 'mp4'?
                                <img  style={{width:"90px",height:"auto"}} src={file_path + 'slider_sff/' + item.slider_image} alt={item.slider_image} ></img>
                                :
                                (item.slider_video)
                            }
                        </td>
                        <td>{item.hyperlink_url}</td>
                        <td>{item.seqnum}</td>
                        <td style={{width:"100px"}}><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span></td>
                        <td style={{width:"150px"}}>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> {" "}
                            <a className="btn btn-danger btn-xs tt"  onClick={props.deleteItem.bind(this,item.id)} ><i className="fa fa-times"></i>&nbsp; delete</a>
                            <span hidden>{sortIndex = sortIndex + 1}</span>
                            <p style={{paddingTop:"4px"}}>

                                { (item.flag_active == 1) ? 
                                    (sortIndex > 1) ?
                                        <div style={{display : 'inline-block'}}>
                                            <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.seqnum)} ><i className="fa fa-arrow-up"></i></a>
                                            &nbsp;
                                        </div>                        
                                    : ''
                                : ''
                                } 
                                { (item.flag_active == 1) ? 
                                    (sortIndex < totalActiveData) ?
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id,item.seqnum)} ><i className="fa fa-arrow-down"></i></a>
                                    : ''
                                : ''
                                } 
                            </p>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function SliderSFF(props){
    const history = useHistory()
    
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [totalActiveData, setTotalActiveData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const pageRangeDisplayed = 10
    const limit = 10
    const file_path = env.userDocument

    const getTotalPage = useCallback(async () => {

        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderSff/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getTotalActive = useCallback(async () => {

        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            status_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderSff/ListData',credentials);
        setTotalActiveData(isi.data.data)
    },[offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderSff/ListData',credentials);
        setItems(isi.data.data)
        getTotalActive()
        getTotalPage()
    },[offset])

    useEffect(()=>{
        getData()
    },[getData])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.sliderSFFDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const moveUp = async(id,seqnum)=>{
        const param = {
            id:id,
            seqnum: seqnum,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSliderSff/MoveUp',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,seqnum)=>{
        const param = {
            id:id,
            seqnum: seqnum,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSliderSff/MoveDown',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSliderSff/DeleteData',param);
        if(responseJson.status===200){
            alert('Data has been deleted')
            getData()
        }else{
            alert(responseJson.status)
        }
    }

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
                            <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.sliderSFFDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                        </div>

                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                <Table items={items} edit={getDetail} moveUp={moveUp} moveDown={moveDown} deleteItem={deleteItem} 
                                    totalActiveData={totalActiveData} file_path={file_path} loading={loading}/>
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

export default SliderSFF;