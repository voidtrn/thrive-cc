import React, { useCallback, useEffect, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router';
import routeAll from '../../../helpers/route.js';
import { env, securityData } from '../../../helpers/globalHelper.js';
import axiosLibrary from '../../../helpers/axiosLibrary.js';
import defaultLang from '../../../helpers/lang.js';
// import { isMobile, isDesktop } from 'react-device-detect';
import NavMenu from '../shared/navMenu.js';
import SideBarMenuAdmin from './adminMenu.js';
import Pagination from 'react-js-pagination';


import '../../../i18n.js'

import { useTranslation } from "react-i18next";



function AdminDateChallenge(props) {

  const history = useHistory()

  const [items, setItems] = useState([])
  const [offset, setOffset] = useState(0)
  const [totalData, setTotalData] = useState(0)
  const [activePage, setActivePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const platform_id = securityData.Security_getPlatformId()
  const file_path = env.userDocument;

  const pageRangeDisplayed = 50
  const limit = 50

  const getTotalPage = useCallback(async () => {
    const credentials = {
      limit: limit,
      offset: offset,
      category: "COUNT",
      platform_id: platform_id
    };

    let isi = await axiosLibrary.postData('awbHutDateChallenge/ListData', credentials);
    setTotalData(isi.data.data)
    setLoading(false)
  }, [offset])

  const getData = useCallback(async () => {
    setLoading(true)
    const credentials = {
      limit: limit,
      offset: offset,
      category: "",
      platform_id: platform_id
    };

    let isi = await axiosLibrary.postData('awbHutDateChallenge/ListData', credentials);
    setItems(isi.data.data)
    getTotalPage()
  }, [offset, getTotalPage])

  const getDetail = async (param) => {
    const idParam = param;
    let responseJson = await axiosLibrary.postData('GetMd5', { id: idParam });
    const ID = responseJson.data.data;
    history.push({
        pathname: routeAdmin.AdminQuestionChallengeDetail.path,
        search: "?" + new URLSearchParams({dateId: ID}).toString()// your data array of objects
    })
  }

  const deleteItem = async (id) => {
    const param = {
      id: id
    }
    let responseJson = await axiosLibrary.postData('awbHutDateChallenge/DeleteData', param);
    if (responseJson.status === 200) {
      alert('Data has been deleted')
      getData()
    } else {
      alert(responseJson.status)
    }
  }

  useEffect(() => {
    getData()
  }, [getData])

  const handlePageChange = (pageNumber) => {
    var offsetNew = (pageNumber - 1) * limit;
    setActivePage(pageNumber)
    setOffset(offsetNew)
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
              Date
            </th>
            <th>
              Challenge Type
            </th>
            <th>
              Title
            </th>
            <th>
              Count of Question
            </th>
            <th>
            </th>
          </tr>
        </thead>
        <tbody >

          {items.map(
            (item) =>
              <tr key={item.id}>
                <td >{item.date}</td>
                <td >
                  <span style={ item.challenge_type === 0 ? {} : item.challenge_type === 1 ? { color:"#0d6efd" } : {  color:"orange" } }>
                    {item.challenge_type === 0 ? 'Daily Challenge' : item.challenge_type === 1 ? 'Additional Challenge' :'Weekly Challenge'}
                  </span>

                </td>
                <td >{item.title_challenge}</td>
                <td >{item.question_count}</td>
                <td align="right">
                  <a className="btn btn-warning btn-sm tt text-end" onClick={props.edit.bind(this, item.id)} >
                    <i className="fa fa-eye"></i>&nbsp; Detail Question 
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
                      Question Challenge  - Admin
                    </span>
                  </div>
                </div>
                <div className="card-body ">

                  
                  <div className="table-responsive">

                    <div id="h182093w0" className="grid-view mt-4">
                      
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

export default AdminDateChallenge;
