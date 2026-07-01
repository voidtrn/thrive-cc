import React, { useCallback, useEffect, useState, useRef, createRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useHistory } from '../../../helpers/useHistory';
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



function AdminGrowthQuestion(props) {

  const history = useHistory()

  const [items, setItems] = useState([])
  const [items2, setItems2] = useState([])
  const [items3, setItems3] = useState([])
  const [offset, setOffset] = useState(0)
  const [totalData, setTotalData] = useState(0)
  const [activePage, setActivePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const platform_id = securityData.Security_getPlatformId()
  const file_path = env.userDocument;
  const [listQuarter, setListQuarter] = useState([])
  const [listQuest, setListQuest] = useState([])

  const pageRangeDisplayed = 10000
  const limit = 10000

  const getTotalPage = useCallback(async (quarterId = null, questId = null) => {
    const credentials = {
      limit: limit,
      offset: offset,
      category: "COUNT",
      platform_id: platform_id,
      quarterId: quarterId,
      questId: questId
    };

    let isi = await axiosLibrary.postData('awbGrowthQuestion/ListData', credentials);
    setTotalData(isi.data.data)
    setLoading(false)
  }, [offset])


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


  const getQuestList = useCallback(async () => {
    const credentials = {
      limit: limit,
      offset: offset,
      category: "",
      platform_id: securityData.Security_getPlatformId()
    };
    // alert(categoryId)
    let isi = await axiosLibrary.postData('awbGrowthQuest/ListData', credentials);
    setListQuest(isi.data.data)
    // setLoading(false)
  })

  const getData = useCallback(async (quarterId = null, questId = null) => {
    setLoading(true)
    const credentials = {
      limit: limit,
      offset: offset,
      category: "",
      platform_id: platform_id,
      quarterId: quarterId,
      questId: questId
    };

    let isi = await axiosLibrary.postData('awbGrowthQuestion/ListData', credentials);
    setItems(isi.data.data)
    getTotalPage(quarterId, questId)
  }, [offset, getTotalPage])

  const getDetail = async (param, question_type) => {
    const idParam = param;
    const questionType = question_type;
    
    let responseJson = await axiosLibrary.postData('GetMd5', { id: idParam });
    const ID = responseJson.data.data;

    switch (questionType) {
      case 2:
        history.push({
          pathname: routeAdmin.AdminGrowthQuestionDetail2.path,
          search: "?" + new URLSearchParams({ data: ID }).toString()// your data array of objects
        })
        break;
      case 3:
        history.push({
          pathname: routeAdmin.AdminGrowthQuestionDetail3.path,
          search: "?" + new URLSearchParams({ data: ID }).toString()// your data array of objects
        })
        break;
      default:
        history.push({
          pathname: routeAdmin.AdminGrowthQuestionDetail.path,
          search: "?" + new URLSearchParams({ data: ID }).toString()// your data array of objects
        })
    }

    
  }

  const deleteItem = async (id) => {
    const param = {
      id: id
    }
    let responseJson = await axiosLibrary.postData('awbGrowthQuestion/DeleteData', param);
    if (responseJson.status === 200) {
      alert('Data has been deleted')
      getData()
    } else {
      alert(responseJson.status)
    }
  }

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.name;

    var stateCopy = Object.assign({}, items2);
    stateCopy[key] = value;

    setItems2(stateCopy)
  }

  const search = useCallback(async () => {
    getData(items2.selectOrder2, items3.selectOrder3)
  })

  const handleInputChange2 = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const key = target.name;

    var stateCopy = Object.assign({}, items2);
    stateCopy[key] = value;

    setItems3(stateCopy)
  }

  



  const questionType = (question_type ) => {

    console.log("question_type = "+question_type);
    let text;
    
    switch (question_type) {
      case 1:
        text = 'Multiple Choice';
        break;
      case 2:
        text = 'Text';
        break;
      case 3:
        text = 'Text with Answer';
        break;
      default:
        text = 'Unknown Question Type';
    }
  
    return <div>{text}</div>;
  };
  
  useEffect(() => {
    getData()
    getQuestList()
    getQuarterList()
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
              Quarter Name <br />
              Quest Number <br />
              Quest Name
            </th>
            <th>
              Question Type
            </th>
            <th>
              Question Order
            </th>
            <th>
              Question
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
                  {item.quarterName}<br />
                  Quest {item.questNumber}<br />
                  {item.titleEng}<br />
                </td>
                <td >
                  {questionType(item.question_type)}
                </td>
                <td >
                  {item.question_order} 
                </td>
                <td >
                  {item.question}<br />
                  {item.question_eng}<br /> 
                </td>
                <td>
                  <span style={item.status_active ? {} : { color: "#ff0707" }}>{item.status_active === 1 ? 'Active' : 'Inactive'}</span>{item.default_flag === 1 ? <div>( Default )</div> : null}
                </td>
                <td align="right">
                  <a className="btn btn-warning btn-sm tt text-end" onClick={props.edit.bind(this, item.id, item.question_type)} >
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
                      Question - Admin
                    </span>
                  </div>
                </div>
                <div className="card-body ">

                  <div className="btn-group  mb-3">
                    <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    Add Question
                    </button>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href={routeAdmin.AdminGrowthQuestionDetail.path}>Multiple Choice</a></li>
                      <li><a className="dropdown-item" href={routeAdmin.AdminGrowthQuestionDetail2.path}>Text</a></li>
                      <li><a className="dropdown-item" href={routeAdmin.AdminGrowthQuestionDetail3.path}>Text With Answer</a></li>
                    </ul>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-8">
                      <select value={items2.selectOrder2}
                        onChange={handleInputChange.bind(this)} id="selectOrder2" name="selectOrder2" style={{ width: "100%" }} className="form-control">
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
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-8">
                      <select value={items3.selectOrder3}
                        onChange={handleInputChange2.bind(this)} id="selectOrder3" name="selectOrder3" style={{ width: "100%" }} className="form-control">
                        <option value="">-select quest-</option>
                        {listQuest.map(
                          (itemQuest) =>
                            <option key={itemQuest.id} value={itemQuest.id}>
                              {itemQuest.title} - {itemQuest.title_eng}
                            </option>
                        )
                        }
                      </select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-12">
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
                          itemclassName="page-item"
                          linkclassName="page-link"
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

export default AdminGrowthQuestion;
