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



function AdminDateChallenge(props) {

  const history = useHistory()

  const [items, setItems] = useState([])
  const [offset, setOffset] = useState(0)
  const [totalData, setTotalData] = useState(0)
  const [activePage, setActivePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const platform_id = securityData.Security_getPlatformId()
  const file_path = env.userDocument;

  const pageRangeDisplayed = 10000
  const limit = 10000

  const getTotalPage = useCallback(async () => {
    const credentials = {
      limit: limit,
      offset: offset,
      category: "COUNT",
      platform_id: platform_id
    };

    let isi = await axiosLibrary.postData('awbHutZoneLocationFunction/ListData', credentials);
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

    let isi = await axiosLibrary.postData('awbHutZoneLocationFunction/ListData', credentials);
    setItems(isi.data.data)
    getTotalPage()
  }, [offset, getTotalPage])

  const getDetail = async (param) => {
    const idParam = param;
    let responseJson = await axiosLibrary.postData('GetMd5', { id: idParam });
    const ID = responseJson.data.data;
    history.push({
        pathname: routeAdmin.AdminDateChallengeDetail.path,
        search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
    })
  }

  const deleteItem = async (id) => {
    const param = {
      id: id
    }
    let responseJson = await axiosLibrary.postData('awbHutZoneLocationFunction/DeleteData', param);
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
              IMDL
            </th>
            <th>
              Name
            </th>
            <th>
              Zone
            </th>
            <th>
              Location
            </th>
            <th>
              Function
            </th>
            <th>
              Last Point
            </th>
          </tr>
        </thead>
        <tbody >

          {items.map(
            (item) =>
              <tr key={item.id}>
                <td >{item.imdl}</td>
                <td >
                    {item.name}<br/>
                    {item.account}<br/>
                    {item.email}<br/>
                </td>
                <td >{item.zone}</td>
                <td >{item.location}</td>
                <td >{item.function}</td>
                <td >{item.last_point}</td>
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
                      Zone, Location & Function  - Admin
                    </span>
                  </div>
                </div>
                <div className="card-body ">
                  <div className="table-responsive">
                    <div className="float-end">
                      <a href={routeAdmin.AdminLocationFunctionImport.path}  className="float-end btn btn-primary btn-sm tt" ><i className="fa fa-plus aria-hidden"></i> Import Data </a>
                    </div>

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

export default AdminDateChallenge;
