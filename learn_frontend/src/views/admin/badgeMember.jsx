import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
// import {useHistory } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
// import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import AsyncSelect from 'react-select/async';
import makeAnimated from 'react-select/animated';

// const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Account
                    </th>
                    <th>
                        Email
                    </th>
                    <th style={{width:"200px"}}>
                        UserName
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
                        <td >{item.account}</td>
                        <td >{item.email}</td>
                        <td >{item.name}</td>
                        <td>
                            <a className="btn btn-danger btn-xs tt" style={{width:"100%"}}  onClick={props.deleteItem.bind(this,item.id)} ><i className="fa fa-times">&nbsp; remove</i></a>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function BadgeMember(props){
    // const history = useHistory()
    const animatedComponents = makeAnimated();

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const [member, setMember] = useState({})

    const [allUserData, setAllUserData] = useState([])
    
    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id,
            badge_id:props.badge_id,
        };

        let isi = await axiosLibrary.postData('awbBadge/ListMember',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[props.badge_id,offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id,
            badge_id:props.badge_id,
        };

        let isi = await axiosLibrary.postData('awbBadge/ListMember',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage,props.badge_id])

    const deleteItem = async(id)=>{
        const param = {
            id:id
        }
        let responseJson = await axiosLibrary.postData('awbBadge/RemoveMember',param);
        if(responseJson.status===200){
            alert('User has been removed')
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const addMember = useCallback(async()=>{
        // alert(member.value)
        if(props.badge_id){
            const param = {
                badge_id:props.badge_id,
                user_id:member.value,
                platform_id:platform_id,
            }
            let responseJson = await axiosLibrary.postData('awbBadge/MemberAdd',param);
            if(responseJson.status===200){
                if(responseJson.data.data==='exist'){
                    alert('User already exist')
                }else{
                    alert('User has been added')
                    getData()
                }
                
            }else{
                alert(responseJson.status)
            }
        }else{
            alert('Please save custom badge first')
        }
    },[member])

    useEffect(()=>{
        getData()
        getAllUser()
    },[getData])

    useEffect(()=>{
        setDefaultLookupMember()
    },[allUserData])

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const setDefaultLookupMember=()=>{
        const requestResults = allUserData.filter(
            x =>
            x.value.toLocaleLowerCase().includes(user_id)
            ).slice(0,1)
        setMember(requestResults[0])
    }

    const getAllUser = useCallback(async () => {
        const credentials = {
            limit: 100000,
            offset:0,
            str_where:'',
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbUser/ListData',credentials);

        var allUser = isi.data.data.map(({id, account, name})=>{
        return {
            value: id,
            label: '( '+account+' ) '+name
        }
        });

        setAllUserData(allUser)
        // setLoading(false)
    })

    const loadOptions = (inputValue, callback) => {
        const requestResults = allUserData.filter(
            x =>
            x.label.toLocaleLowerCase().includes(inputValue.toLowerCase())
            ).slice(0,50)
               
        // const requestResults = this.state.optionAdHoc.slice(0,10);
        callback(requestResults)

    }

    return(
        <div className="panel-body">

            <div className="mb-3 field-usereditform-email required" style={{position:"relative"}}>
                <label className="control-label" forHtml="usereditform-email" style={{width: "150px",display:"block"}}>&nbsp;Badge Name</label>
                <input type="text" id="usereditform-email" style={{width:"300px",display:"inline-block"}} disabled 
                    className="form-control" name="title" value={props.badge_title} aria-required="true" aria-invalid="false" />
                <img style={{width:"85px",height:"auto",position:"absolute",top:"0px"}}  src={props.image_file} alt="" />
                <div className="help-block"></div>
            </div>

            <div className="mb-3 field-usereditform-email required" style={{position:"relative"}}>
                <div className="mb-3 field-usereditform-email required" >
                <label className="control-label" forHtml="profile-country" style={{width:"150px"}}>&nbsp;Add User </label> 
                <div className="row">
                    <div className="col-md-9">
                        <AsyncSelect
                            closeMenuOnSelect={true}
                            components={animatedComponents}
                            loadOptions={loadOptions.bind(this)}
                            defaultOptions={allUserData.slice(0,50)}
                            onChange={(e)=>setMember(e)}
                            value={member}
                            placeholder="Choose Employee Name"
                        />
                    </div>
                    <div className="col-md-3">
                        <button type="submit" className="btn btn-primary" onClick={addMember} name="btnSubmit" style={{width:"150px",position:"relative",top:"3px"}} value="save">add user</button>
                    </div>
                </div>
                </div>
            </div>
            <br/>
            <hr/>
            <br/>
            <div className="table-responsive">
                <div id="h182093w0" className="grid-view">
                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                        <Table items={items} deleteItem={deleteItem} loading={loading}/>
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

export default BadgeMember;