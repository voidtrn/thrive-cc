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

import XlsxPopulate from "xlsx-populate";
import { saveAs } from "file-saver";

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

    let isi = await axiosLibrary.postData('awbGrowthReport/LeaderboardPoint', credentials);
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

    let isi = await axiosLibrary.postData('awbGrowthReport/LeaderboardPoint', credentials);
    setItems(isi.data.data)
    getTotalPage()
  }, [offset, getTotalPage])

  useEffect(() => {
    getData()
  }, [getData])

  const handlePageChange = (pageNumber) => {
    var offsetNew = (pageNumber - 1) * limit;
    setActivePage(pageNumber)
    setOffset(offsetNew)
  }



  function getSheetData(data, header) {
    var fields = Object.keys(data[0]);
    var sheetData = data.map(function (row) {
        return fields.map(function (fieldName) {
            return row[fieldName] ? row[fieldName] : "";
        });
    });
    sheetData.unshift(header);
    return sheetData;
  }

  const saveAsExcel = () => {
    var data  = items;
    var header = ["imdl", "name", "function", "title", "point", "percentage", "last_date_of_work"]

    XlsxPopulate.fromBlankAsync().then(async (workbook) => {
        const sheet1 = workbook.sheet(0);
        const sheetData = getSheetData(data, header); 
        const totalColumns = sheetData[0].length;

        sheet1.cell("A1").value(sheetData);
        const range = sheet1.usedRange();
        const endColumn = String.fromCharCode(64 + totalColumns);
        sheet1.row(1).style("bold", true);
        sheet1.range("A1:" + endColumn + "1").style("fill", "BFBFBF");
        range.style("border", true);
        return workbook.outputAsync().then((res) => {
            saveAs(res, "Leaderboard - Point.xlsx");
        });
    });
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
              
            </th>
            <th>
              Name
            </th>
            <th>
              Function
            </th>
            <th>
              Point
            </th>
            <th>
              Percentage (All Quest)
            </th>
            <th>
              Last Date of Work
            </th>
            <th>
            </th>
          </tr>
        </thead>
        <tbody >

          {items.map(
            (item, i) =>
              <tr key={item.id}>
                <td > {++i}.</td>
                <td > {item.name}</td>
                <td >{item.group_function}<br/>{item.title}</td>
                <td >{item.point}</td>
                <td >{item.percentage}</td>
                <td >{item.date_created}</td>
                       
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
                      Leaderboard - Point 
                    </span>
                  </div>
                </div>
                <div className="card-body ">
                  <div className="table-responsive">
                    <div className="float-end">
                      <button onClick={saveAsExcel} id="btnExport" name="btnExport" value="export" className="btn btn-primary btn-sm tt"><i className="fa fa-file-excel-o"></i>&nbsp;Export </button>   
                    </div>

                    <div id="h182093w0" className="grid-view mt-4">
                      <div className="summary">Showing <b>{offset + 1} - {limit * (activePage - 1) + items.length}</b> of <b>{totalData}</b> records.</div>
                      <Table items={items} file_path={file_path} loading={loading} />
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
