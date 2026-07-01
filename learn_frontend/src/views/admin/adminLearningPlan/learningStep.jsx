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
                        Sub Title
                    </th>
                    <th>
                        Description
                    </th>
                    <th>
                        Popup Description
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
                        <td>{item.title_eng}<br/><br/>{item.title_ind}</td>
                        <td>{item.sub_title_eng}<br/><br/>{item.sub_title_ind}</td>
                        <td><div dangerouslySetInnerHTML={{__html: item.description_eng}}/><br/><br/><div dangerouslySetInnerHTML={{__html: item.description_ind}}/></td>
                        <td><div dangerouslySetInnerHTML={{__html: item.popup_description_eng}}/><br/><br/><div dangerouslySetInnerHTML={{__html: item.popup_description_ind}}/></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.getDetail.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> 
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function LearningStep(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()

    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbLearningPlanStep/ListData',credentials);
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

        let isi = await axiosLibrary.postData('awbLearningPlanStep/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage])

    useEffect(()=>{
        getData()
    },[getData])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.learningStepDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
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
                            {/* <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.learningStepDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>   */}
                        </div>

                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                <Table items={items} getDetail={getDetail} loading={loading}/>
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
                            </div> : ''
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearningStep;