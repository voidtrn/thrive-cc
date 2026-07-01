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
    const [invalidImage, setInvalidImage] = useState(false)

    const [items, setItemTable] = useState([])
    const [itemsInput, setItemsInput] = useState([])

    const [itemsDateChallenge, setItemsDateChallenge] = useState([])
    const [itemsDateChallengeDetail, setItemsDateChallengeDetail] = useState([])
    
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const file_path = env.userDocument;

    const pageRangeDisplayed = 10
    const limit = 10

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset: offset,
            category: "COUNT",
            platform_id: platform_id,            
            dateId: new URLSearchParams(props.location.search).get('dateId')
        };

        let isi = await axiosLibrary.postData('awbHutQuestion/ListDataByDateId', credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    }, [offset])


  

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset: offset,
            category: "",
            platform_id: platform_id,            
            dateId: new URLSearchParams(props.location.search).get('dateId')
        };

        let isi = await axiosLibrary.postData('awbHutQuestion/ListDataByDateId', credentials);
        setItemTable(isi.data.data)
        getTotalPage()
    }, [offset, getTotalPage])


    
    const getDetail = useCallback(async (param) => {
        const dateId = new URLSearchParams(props.location.search).get('dateId');

        const data = {
            id: dateId
        }
        let response = await axiosLibrary.postData('awbHutDateChallenge/SelectDataByMd5', data);
        if (response.status === 200) {
            setItemsDateChallengeDetail(response.data.data)
            setLoading(false)
        } else {
            alert(response);
            setLoading(false)
        }
    }, [])


    const getDetailQuestion = async (param) => {
        let responseJson = await axiosLibrary.postData('GetMd5', { id: param });
        const ID = responseJson.data.data;


        const data = {
            md5ID: ID
        }
        let response = await axiosLibrary.postData('awbHutQuestion/SelectDataForEdit', data);
        if (response.status === 200) {
            setItemsInput(response.data.data)
            setItemsDateChallenge(response.data.data)
            setLoading(false)
        } else {
            alert(response);
            setLoading(false)
        }


    }

    const deleteItem = async (id) => {
        if (confirm("Are you sure to delete this data?")) {
            const param = {
                id: id
            }
            let responseJson = await axiosLibrary.postData('awbHutQuestion/DeleteData', param);
            if (responseJson.status === 200) {
                getData()
                alert('Data has been deleted')

            } else {
                alert(responseJson.status)
            }
        }
      
    }

    useEffect(() => {
        getData();
        getDetail();
    }, [getData])

    const handlePageChange = (pageNumber) => {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const routeAdmin = routeAll.routesAdmin;

    function Table(props) {

        return (
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>
                            Order
                        </th>
                        <th>
                            Question
                        </th>
                        <th>
                            Correct Point
                        </th>
                        <th>
                            Answer
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
                                    {item.question_order}
                                </td>
                                <td>

                                    <span  dangerouslySetInnerHTML={{ __html: item.question  }}></span><br/>
                                    <span  dangerouslySetInnerHTML={{ __html: item.question_eng  }}></span>
                                </td>
                                <td >
                                    {item.correct_point}
                                </td>
                                <td >
                                    {
                                        item.answer.map(
                                            (answerList) =>

                                            answerList.correct === 1 ? (
                                                <b>
                                                 <div dangerouslySetInnerHTML={{__html: answerList.answer+"<br/>( "+answerList.answer_eng +" )"
                                                    }}/>    
                                                    
                                                </b>
                                                ) : 
                                                
                                                (
                                                <>- <div dangerouslySetInnerHTML={{__html: answerList.answer+"<br/>( "+answerList.answer_eng +" )"
                                                }}/>    </>
                                                )
                                            
                                                
                                        )
                                    }
                                </td>
                                <td align="right">
                                    
                                    <a className="btn btn-warning btn-sm tt text-end" onClick={props.edit.bind(this, item.id)} >
                                        <i className="fa fa-edit"></i>
                                    </a>

                                    &nbsp;&nbsp;
                                    <a className="btn btn-danger btn-sm tt text-end" onClick={props.delete.bind(this, item.id)} >
                                        <i className="fa fa-trash"></i>
                                    </a>

                                    
                                </td>
                            </tr>
                    )}
                </tbody>
            </table>
        )
    }

    const validateImage = (e) => {
        e.preventDefault();
        if (invalidImage) {
            alert("ERROR IN THE UPLOAD IMAGE SECTION, PLEASE USE A VALID IMAGE");
            return false
        } else {
            submit();
            return true
        }
    }

    const submit = async () => {
        
        const user_id = securityData.Security_UserId()
        const fd = new FormData();
        const dateId = new URLSearchParams(props.location.search).get('dateId');
        let responseJson = [];

        console.log(itemsDateChallenge.correct_answer);

        if(itemsInput.id !=undefined || itemsInput.id !=null){
            fd.append("id", itemsInput.id);           
            fd.append("date_id", itemsDateChallenge.id);
            fd.append("question_order", itemsInput.question_order);
            fd.append("question", itemsInput.question);
            fd.append("question_eng", itemsInput.question_eng);
            fd.append("correct_answer", itemsInput.correct_answer);
            fd.append("correct_answer_eng", itemsInput.correct_answer_eng);
            fd.append("correct_answer_old", itemsDateChallenge.correct_answer);
            fd.append("correct_answer_old_eng", itemsDateChallenge.correct_answer_eng);
            fd.append("answer_1", itemsInput.answer_1);
            fd.append("answer_1_eng", itemsInput.answer_1_eng);
            fd.append("answer_1_old", itemsDateChallenge.answer_1);
            fd.append("answer_1_old_eng", itemsDateChallenge.answer_1_eng);
            fd.append("answer_2", itemsInput.answer_2);
            fd.append("answer_2_eng", itemsInput.answer_2_eng);
            fd.append("answer_2_old", itemsDateChallenge.answer_2);
            fd.append("answer_2_old_eng", itemsDateChallenge.answer_2_eng);
            fd.append("answer_3", itemsInput.answer_3);
            fd.append("answer_3_eng", itemsInput.answer_3_eng);
            fd.append("answer_3_old", itemsDateChallenge.answer_3);
            fd.append("answer_3_old_eng", itemsDateChallenge.answer_3_eng);
            fd.append("correct_point", itemsInput.correct_point);
            fd.append("user_created", user_id);

            responseJson = await axiosLibrary.postData("awbHutQuestion/UpdateData", fd);
       
            if (responseJson.status === 200) {
                resetForm();
                alert("DATA HAS BEEN UPDATED");
                getData();
            }
            else{
                alert(responseJson);
            }
                    
        }
        else{        
            fd.append("date_id", itemsDateChallengeDetail.id);
            fd.append("question_order", itemsInput.question_order);
            fd.append("question", itemsInput.question);
            fd.append("question_eng", itemsInput.question_eng);
            fd.append("correct_answer", itemsInput.correct_answer);
            fd.append("correct_answer_eng", itemsInput.correct_answer_eng);
            fd.append("answer_1", itemsInput.answer_1);
            fd.append("answer_1_eng", itemsInput.answer_1_eng);
            fd.append("answer_2", itemsInput.answer_2);
            fd.append("answer_2_eng", itemsInput.answer_2_eng);
            fd.append("answer_3", itemsInput.answer_3);
            fd.append("answer_3_eng", itemsInput.answer_3_eng);
            fd.append("correct_point", itemsInput.correct_point);
            fd.append("user_created", user_id);
            responseJson = await axiosLibrary.postData("awbHutQuestion/InsertData", fd);
       
            if (responseJson.status === 200) {
                resetForm();
                alert("DATA HAS BEEN CREATED");
                getData();
            }
            else{
                alert(responseJson);
            }
                    
        }

    }
    const resetForm = () => { 
        
        var stateCopy = Object.assign({}, itemsInput);
        stateCopy['question_order'] = '';
        stateCopy['question'] = '';
        stateCopy['question_eng'] = '';
        stateCopy['correct_point'] = '';
        stateCopy['correct_answer'] = '';
        stateCopy['answer_1'] = '';
        stateCopy['answer_2'] = '';
        stateCopy['answer_3'] = '';
        stateCopy['correct_answer_eng'] = '';
        stateCopy['answer_1_eng'] = '';
        stateCopy['answer_2_eng'] = '';
        stateCopy['answer_3_eng'] = '';

        setItemsInput(stateCopy)
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, itemsInput);
        stateCopy[key] = value;

        setItemsInput(stateCopy)
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

                                    <form id="czfrom"  onSubmit={validateImage} method="post" style={{ display: "block" }} encType='multipart/form-data'>
                                    
                                    <input type="hidden" name="id" id="inputEmail3"   value={itemsInput.id}  />
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Challenge Detail</label>
                                            <div className="col-sm-10">
                                               <b>{itemsDateChallengeDetail.title_challenge}</b><br/>
                                               {itemsDateChallengeDetail.date}<br/>
                                               {itemsDateChallengeDetail.challenge_type === 0 ? 'Daily Challenge' : itemsDateChallengeDetail.challenge_type === 1 ? 'Additional Challenge' : 'Weekly Challenge' }<br/>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Question Order</label>
                                            <div className="col-sm-2">
                                                <input type="number" required className="form-control" name="question_order" id="inputEmail3"   value={itemsInput.question_order}   onChange={handleInputChange} />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Question</label>
                                            <div className="col-sm-10">
                                                <textarea placeholder="Bahasa Indonesia"   type="text" required className="form-control" name="question" id="inputEmail3"  onChange={handleInputChange}  value={itemsInput.question}  />
                                            </div>
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-10">
                                                <textarea type="text"  placeholder="English" required className="form-control mt-2" name="question_eng" id="inputEmail3"  onChange={handleInputChange}  value={itemsInput.question_eng}  />
                                            </div>
                                        </div>

                                        
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Correct Point</label>
                                            <div className="col-sm-2">
                                                <input type="number" required className="form-control" name="correct_point" id="inputEmail3"   value={itemsInput.correct_point}   onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Correct Answer</label>
                                            <div className="col-sm-10">
                                                <input type="text" placeholder="Bahasa Indonesia"  required className="form-control" name="correct_answer" id="inputEmail3"  onChange={handleInputChange}  value={itemsInput.correct_answer}  />
                                            </div>
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-10">
                                                <input type="text"   placeholder="English" required className="form-control mt-2" name="correct_answer_eng" id="inputEmail3"  onChange={handleInputChange}  value={itemsInput.correct_answer_eng}  />
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Another Answer 1</label>
                                            <div className="col-sm-9">
                                                <input type="text" required className="form-control" name="answer_1"  placeholder="Bahasa Indonesia" value={itemsInput.answer_1}  id="inputEmail3"  onChange={handleInputChange} />
                                            </div>
                                            <label for="inputEmail3" className="col-sm-3 col-form-label"></label>
                                            <div className="col-sm-9">
                                                <input type="text"  placeholder="English" required className="form-control mt-2" name="answer_1_eng" value={itemsInput.answer_1_eng}  id="inputEmail3"  onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Another Answer 2</label>
                                            <div className="col-sm-9">
                                                <input type="text" required className="form-control" name="answer_2" placeholder="Bahasa Indonesia" value={itemsInput.answer_2}  id="inputEmail3"  onChange={handleInputChange} />
                                            </div>                                            
                                            <label for="inputEmail3" className="col-sm-3 col-form-label"></label>
                                            <div className="col-sm-9">
                                                <input type="text"  placeholder="English" required className="form-control mt-2" name="answer_2_eng" value={itemsInput.answer_2_eng}  id="inputEmail3"  onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label">Another Answer 3</label>
                                            <div className="col-sm-9">
                                                <input type="text" placeholder="Bahasa Indonesia"  required className="form-control" name="answer_3" value={itemsInput.answer_3} id="inputEmail3" onChange={handleInputChange} />
                                            </div>
                                            <label for="inputEmail3" className="col-sm-3 col-form-label"></label>
                                            <div className="col-sm-9">
                                                <input type="text"  placeholder="English" required className="form-control mt-2" name="answer_3_eng" value={itemsInput.answer_3_eng} id="inputEmail3" onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label"></label>
                                            <div className="col-sm-9">
                                                <a href={routeAll.routesAdmin.AdminQuestionChallenge.path} className="nav-link color-white-dark50" >
                                                <span className="btn btn-sm btn-warning">Back</span>
                                                </a>
                                                
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-3 col-form-label"></label>
                                            <div className="col-sm-9">
                                                <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>
                                            </div>
                                        </div>


                                    </form>
                                    <div className="table-responsive">

                                        <div id="h182093w0" className="grid-view mt-4">

                                            <Table items={items} file_path={file_path} delete={deleteItem} loading={loading}  edit={getDetailQuestion} />
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
