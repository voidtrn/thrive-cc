import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import {useHistory } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Question
                    </th>
                    <th >
                        Point
                    </th>
                    <th style={{width:"200px"}}>
                        Type
                    </th >
                    <th style={{width:"100px"}}>
                        Status
                    </th>
                    <th style={{width:"150px"}}>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.question}</td>
                        <td>{item.point}</td>
                        <td>{item.answer_mode === '2'? 'Multiple Choice':(item.answer_mode === '3'?'Multiple Answer':'Yes / No') }</td>
                        <td><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this, item.id)} >
                                <i className="fa fa-pencil"></i>&nbsp; edit</a> {""}
                            <a className="btn btn-danger btn-xs tt" onClick={props.deleteQuiz.bind(this, item.id)}>
                                <i className="fa fa-times"></i>&nbsp; delete</a>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function Quiz(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()
    const file_path = env.userDocument

    const articleId = props.md5ArticleId
    
    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            articleId:articleId,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbQuiz/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            articleId:articleId,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbQuiz/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.quizDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const addNew=async()=>{
        // const idParam = param;
        // let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        // const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.quizCreate.path,
            search: "?" + new URLSearchParams({data: props.md5ArticleId}).toString()// your data array of objects
        })
    }
    
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    useEffect(() => {
        // if(categoryId !== 'null'){
            getData();
        // }
    },[offset])

    const deleteQuiz= async (idParam) =>{
        // e.preventDefault();
        const fd = new FormData();
        
        fd.append("id", idParam);
        let responseJson = await axiosLibrary.postData("awbQuiz/DeleteData", fd);
        if(responseJson.status === 200){
            // filterButton()
            alert('Data has been deleted')
            getData()
        }else{
            alert(responseJson);
        }
            
    }

    return(        
        <div className="panel-body"> 
            <div className="pull-right">
                {totalData < 15?
                    <a className="pull-right btn btn-primary btn-sm tt" onClick={addNew} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                :
                    <span>max number of questions is 3 questions</span>
                }
            </div>
            <div className="table-responsive" >
                <div id="h182093w0" className="grid-view">
                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                        <Table items={items} edit={getDetail} totalData={totalData} file_path={file_path}
                            deleteQuiz={deleteQuiz} loading={loading}/>
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
                                    
    )
}

export default Quiz;