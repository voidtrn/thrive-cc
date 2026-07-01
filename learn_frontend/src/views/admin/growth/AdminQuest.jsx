import React, { useCallback, useEffect, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from '../../../helpers/useHistory';
import routeAll from '../../../helpers/route.jsx';
import { env, securityData } from '../../../helpers/globalHelper.js';
import axiosLibrary from '../../../helpers/axiosLibrary.js';
import defaultLang from '../../../helpers/lang.js';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../shared/navMenu.jsx';
import SideBarMenuAdmin from './adminMenu.jsx';
import Pagination from 'react-js-pagination';


import '../../../i18n.js'

import { useTranslation } from "react-i18next";



function AdminGrowthQuest(props) {

  const history = useHistory()

  const [items, setItems] = useState([])
  const [items2, setItems2] = useState([])
  const [offset, setOffset] = useState(0)
  const [totalData, setTotalData] = useState(0)
  const [activePage, setActivePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const platform_id = securityData.Security_getPlatformId()
  const file_path = env.userDocument;

  const pageRangeDisplayed = 10000
  const limit = 10000
  const [listQuarter, setListQuarter] = useState([])


  
    const getQuarterList = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset: offset,
            category: "",
            platform_id: securityData.Security_getPlatformId()
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbGrowthQuarter/ListData', credentials);
        setListQuarter(isi.data.data)
        // setLoading(false)
    })



    

  const getTotalPage = useCallback(async (quarterid = null) => {
    const credentials = {
      limit: limit,
      offset: offset,
      category: "COUNT",
      platform_id: platform_id,
      quarterId: quarterid
    };

    let isi = await axiosLibrary.postData('awbGrowthQuest/ListData', credentials);
    setTotalData(isi.data.data)
    setLoading(false)
  }, [offset])

  const getData = useCallback(async (quarterid = null) => {
    setLoading(true)
    const credentials = {
      limit: limit,
      offset: offset,
      category: "",
      platform_id: platform_id,
      quarterId: quarterid
    };

    let isi = await axiosLibrary.postData('awbGrowthQuest/ListData', credentials);
    setItems(isi.data.data)
    getTotalPage(quarterid)
  }, [offset, getTotalPage])

  const getDetail = async (param) => {
    const idParam = param;
    let responseJson = await axiosLibrary.postData('GetMd5', { id: idParam });
    const ID = responseJson.data.data;
    history.push({
        pathname: routeAdmin.AdminGrowthQuestDetail.path,
        search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
    })
  }

  const deleteItem = async (id) => {
    const param = {
      id: id
    }
    let responseJson = await axiosLibrary.postData('awbGrowthQuest/DeleteData', param);
    if (responseJson.status === 200) {
      alert('Data has been deleted')
      getData()
    } else {
      alert(responseJson.status)
    }
  }

  useEffect(() => {
    getData()
    getQuarterList()
  }, [getData])

  const handlePageChange = (pageNumber) => {
    var offsetNew = (pageNumber - 1) * limit;
    setActivePage(pageNumber)
    setOffset(offsetNew)
  }

  const search = useCallback(async () => {
    getData(items2.selectOrder)
  })

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.name;

    var stateCopy = Object.assign({}, items2);
    stateCopy[key] = value;

    setItems2(stateCopy)
  }

  const routeAdmin = routeAll.routesAdmin;

  function Table(props) {
    const items = props.items
    const file_path = props.file_path

    return (
      <table className="table table-hover">
        <thead>
          <tr>
            <th>
              Quarter Name
            </th>
            <th>
              Quest Number
            </th>
            <th>
              Quest
            </th>
            <th>
              Start - End Date
            </th>
            <th>
              Status Active
            </th>
            <th>
            </th>
          </tr>
        </thead>
        <tbody >

          {items.map(
            (item) =>
              <tr key={item.id}>
                <td >
                    {item.quarterName}<br/>
                </td>
                <td >
                    {item.number}<br/>
                </td>
                <td >
                    {item.title_eng}<br/>
                    {item.title}
                </td>
                <td >{item.start_date} <br/> {item.end_date}</td>
                <td>
                  <span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active === 1 ? 'Active': 'Inactive'}</span>{item.default_flag===1 ? <div>( Default )</div> :null}
                </td>
                <td align="right">
                  <a className="btn btn-warning btn-sm tt text-end" onClick={props.edit.bind(this, item.id)} >
                    <i className="fa fa-edit"></i>&nbsp; Edit 
                  </a>
                </td>
                       
              </tr>
          )}
        </tbody>
      </table>
    )
  }

  return (
    <>
      <NavMenu adminLevel={props.adminLevel} {...props} />


      <header className="masthead">
        <div className="overlay">
          <div className=" container ">
            <div className="row d-flex ">
              <div className="col-md-12  d-flex justify-content-center title-nav-page-text" style={{ paddingTop: "5px", paddingBottom: "5px" }} >
                Admin Page
              </div>
            </div>
          </div>
        </div>
      </header>


      <section className="page-section"></section>

      <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
        <div className="row d-flex ">
          <div className="col-lg-3">
            <SideBarMenuAdmin adminLevel={props.adminLevel} {...props} />
          </div>
          <div className="col-lg-9">
            <div className="container page-section" style={{ marginTop: "-50px" }} id="access-idp">
              <div className="card card-white">
                <div className="card-header ">
                  <div className="row d-flex ">
                    <span className="text-blue">
                      Quest - Admin
                    </span>
                  </div>
                </div>
                <div className="card-body ">

                  
                    <div className="pull-right  mb-3">
                      <a href={routeAdmin.AdminGrowthQuestDetail.path}  className="pull-right btn btn-primary btn-sm tt" ><i className="fa fa-plus aria-hidden"></i> Add Quest </a>
                    </div>

                    <div className="row mb-3">
                        <div className="col-sm-8">
                            <select value={items2.selectOrder} 
                                onChange={handleInputChange.bind(this)} id="selectOrder" name="selectOrder" style={{ width: "100%" }} className="form-control">
                                <option value="">-select stage-</option>
                                {listQuarter.map(
                                    (itemQuarter) =>
                                        <option key={itemQuarter.id} value={itemQuarter.id}>
                                            {itemQuarter.name}
                                        </option>
                                )
                                }
                            </select>
                        </div>
                        <div className="col-sm-4">
                          <div className='btn btn-success' onClick={() => search()}>Search</div>
                        </div>
                    </div>



                  <div className="table-responsive">
                    <div id="h182093w0" className="grid-view mt-4">
                      <div className="summary">Showing <b>{offset + 1} - {limit * (activePage - 1) + items.length}</b> of <b>{totalData}</b> records.</div>
                      <Table items={items} file_path={file_path} edit={getDetail} deleteItem={deleteItem} loading={loading} />
                    </div>
                    {totalData > limit ?
                      <div style={{ display: "flex", justifyContent: "center" }}>
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
                      : ''
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default AdminGrowthQuest;
