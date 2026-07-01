import React, { 
    useCallback, 
    useEffect, 
    useState
} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../../helpers/useHistory';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { securityData } from '../../../helpers/globalHelper';
import routeAll from '../../../helpers/route';
import { 
    cssTarget, 
    LoadingAdmin 
} from '../../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Title
                    </th>
                    <th>
                        Status
                    </th>
                    <th style={{width: '13%'}}>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.title_menu}</td>
                        <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'ACTIVE' :'INACTIVE'}</span></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.getDetail.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a>&nbsp;
                            <p style={{paddingTop:"4px", display:'inline-block'}}>
                            { (item.status_active == 1) ? 
                                (item.seqnum > 1) ?
                                    <div style={{display : 'inline-block'}}>
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.seqnum)} ><i className="fa fa-arrow-up"></i></a>
                                        &nbsp;
                                    </div>                        
                                : ''
                            : ''
                            } 
                            { (item.status_active == 1) ? 
                                (item.seqnum < props.totalData) ?
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

function LearningMainFocus(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [paginate, setPaginate] = useState([])
    const [activePage, setActivePage] = useState(new URLSearchParams(props.location.search).get('page') ?? 1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const limit = 10

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            platform_id:platform_id,
            from:'admin'
        };

        let isi = await axiosLibrary.postData(`awbLearningMainFocus/ListData?page=${activePage}`,credentials);
        setItems(isi.data.data.data)
        setActivePage(isi.data.data.current_page)
        setPaginate(isi.data.data)
        setLoading(false)
    },[activePage])

    useEffect(()=>{
        getData()
    },[getData])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.learningMainFocusDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()+"&"+new URLSearchParams({page: activePage})// your data array of objects
        })
    }

    const moveUp = async(id,sort_index)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbLearningMainFocus/MoveUp',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbLearningMainFocus/MoveDown',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    return(
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong> 
                </div>
                <div className="panel-body">

                    <div className="table-responsive">
                        <div className="pull-right">
                            <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.learningMainFocusDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                        </div>

                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{paginate.from} - {paginate.to}</b> of <b>{paginate.total}</b> records.</div>
                                <Table items={items} getDetail={getDetail} moveUp={moveUp} moveDown={moveDown} loading={loading} totalData={paginate.total}/>
                        </div> 
                        {paginate.total > limit ?
                            <div style={{display:"flex",justifyContent:"center"}}>
                                <Pagination
                                itemClass="page-item"
                                linkClass="page-link"
                                activePage={activePage}
                                itemsCountPerPage={limit}
                                totalItemsCount={paginate.total}
                                pageRangeDisplayed={paginate.per_page}
                                onChange={(e)=>setActivePage(e)}
                                />
                            </div> : ''
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearningMainFocus;