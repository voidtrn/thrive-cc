import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../../helpers/axiosLibrary';
import routeAll from '../../../helpers/route';
import { useHistory } from '../../../helpers/useHistory';
import { env, securityData } from '../../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../../components/Loading';
import NavMenu from '../shared/navMenu.js';
import SideBarMenuAdmin from './adminMenu.js';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import BadgeMember from './../badgeMember';

function DateChallengeDetail(props) {

    const history = useHistory()
    // const [Columns, setColumns] = useState([])
    var Columns = "";
    const [items, setItems] = useState([])

    const [editData, setEditData] = useState(false)
    const [deleteData, setDeleteData] = useState(false)
    const [cancelDelete, setCancelDelete] = useState(false)
    const fileInput = React.createRef()
    const reader = new FileReader()
    const [file, setFile] = useState(null)
    const [invalidImage, setInvalidImage] = useState(false)
    const file_path = env.userDocument
    const [loading, setLoading] = useState(true)

    const routeAdmin = routeAll.routesAdmin

    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const user_account = securityData.Security_UserAccount()

    const getDetail = useCallback(async () => {
        const data = {
            md5ID: new URLSearchParams(props.location.search).get('data')
        }
        if (data.md5ID !== null) {
            setEditData(true)
            let response = await axiosLibrary.postData('awbHutZoneLocationFunction/SelectData', data);
            if (response.status === 200) {
                setItems(response.data.data)
                setLoading(false)
            } else {
                alert(response);
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }, [props.location.search])

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

    const DeleteConfirm = async () => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm("Are you sure to delete this data?")) {
            setDeleteData(true)
            setCancelDelete(false)
        }
        else {
            setCancelDelete(true)
        }
    }

    const submit = async () => {
        // e.preventDefault();
        if (!cancelDelete) {
            if (!deleteData) {
                const fd = new FormData();

                fd.append("location", items.location);
                fd.append("function", items.function);
                fd.append("zone", items.zone);
                fd.append("imdl", items.imdl);


                {/*
                const IsFileAttached = fileInput.current.files.length > 0;
                if (IsFileAttached) {
                    fd.append("badge_image", fileInput.current.files[0]);
                }
                */}
                if (editData) {
                    //for edit data
                    fd.append("id", items.id);
                    let responseJson = await axiosLibrary.postData("awbHutZoneLocationFunction/UpdateData", fd);
                    if (responseJson.status === 200) {
                        alert("DATA HAS BEEN UPDATED");
                        history.push(routeAdmin.AdminDateChallenge.path)
                    } else {
                        alert(responseJson);
                    }
                } else {
                    //for insert data
                    fd.append("user_created", user_id);
                    let responseJson = await axiosLibrary.postData("awbHutZoneLocationFunction/InsertData", fd);
                    if (responseJson.status === 200) {
                        alert("DATA HAS BEEN CREATED");
                        history.push(routeAdmin.AdminDateChallenge.path)
                    } else {
                        alert(responseJson);
                    }
                }
            } else {
                //for delete data
                const parameter = {
                    id: items.id
                }
                let responseJson = await axiosLibrary.postData("awbHutZoneLocationFunction/DeleteData", parameter);
                if (responseJson.status === 200) {
                    alert("DATA HAS BEEN DELETED");
                    history.push(routeAdmin.AdminDateChallenge.path)
                } else {
                    alert(responseJson);
                }
            }
        }
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, items);
        stateCopy[key] = value;

        setItems(stateCopy)
    }

    useEffect(() => {
        getDetail()
    }, [Columns])

    useEffect(() => {
        if (!editData) {
            setItems(items => ({ ...items, category: 'Custom' }))
        }
    }, [editData])

    const setStateImage = (HtmlElement, stateFile, invalidImage) => {
        document.getElementById("upload-name").innerHTML = HtmlElement

        setFile(stateFile)
        setInvalidImage(invalidImage)
    }

    const formatSizeUnits = (bytes) => {

        if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + ' GB'; }
        else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + ' MB'; }
        else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + ' KB'; }
        else if (bytes > 1) { bytes = bytes + ' bytes'; }
        else if (bytes === 1) { bytes = bytes + ' byte'; }
        else { bytes = '0 byte'; }
        return bytes;
    }

    const addDefaultSrc = (ev) => {
        // ev.target.src =  file_path+"profile/resized/default.jpg";
        ev.target.src = "";
    }

    const ajaxFileUploadImage = (upload_field) => {
        var re_text = /\.jpg|\.gif|\.jpeg|\.png/i;
        var filename = upload_field.target.value;
        var imagename = filename == null ? "" : filename.replace("C:\\fakepath\\", "");
        if (filename.search(re_text) === -1) {
            alert("File must be an image");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 1) {
            alert('File size exceeds 1 MB');
            upload_field.target.form.reset();
            return 0;
        }

        if (upload_field.target.files[0] !== undefined) {
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')', URL.createObjectURL(upload_field.target.files[0]), false)
                }
                img.onerror = () => {
                    setStateImage('Invalid image content', null, true)
                }
                img.src = e.target.result;
            }
            reader.readAsDataURL(upload_field.target.files[0]);
        }

        return 1;
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
                                        Zone, Location & Function - Admin
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body ">

                                    

                                    <form id="czfrom" onSubmit={validateImage} method="post" style={{ display: "block" }} encType='multipart/form-data'>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">IMDL</label>
                                            <div className="col-sm-3">
                                                <input type="number" required className="form-control" name="imdl" id="inputEmail3"  value={items.imdl} onChange={handleInputChange}/>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Account Name</label>
                                            <div className="col-sm-3">
                                                <input type="text" required className="form-control" name="account" id="inputEmail3"  value={items.account} onChange={handleInputChange}/>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Name</label>
                                            <div className="col-sm-6">
                                                <input type="text" required className="form-control" name="full_name" id="inputEmail3"  value={items.full_name} onChange={handleInputChange}/>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Zone</label>
                                            <div className="col-sm-9">
                                                <select  className="form-control" 
                                                    value={items.zone}  onChange={handleInputChange.bind(this)} required name="zone" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="Area">Area</option>
                                                    <option value="Surabaya">Surabaya</option>
                                                    <option value="Jakarta">Jakarta</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Location</label>
                                            <div className="col-sm-9">
                                                <select  className="form-control" 
                                                    value={items.zone}  onChange={handleInputChange.bind(this)} required name="zone" aria-invalid="false">
                                                    {editData ? null: <option value="">... Select this ...</option> }
                                                    <option value="Area">Area</option>
                                                    <option value="Surabaya">Surabaya</option>
                                                    <option value="Jakarta">Jakarta</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Function</label>
                                            <div className="col-sm-9">
                                                <input type="text" required className="form-control" name="function" id="inputEmail3"  value={items.function} onChange={handleInputChange}/>
                                            </div>
                                        </div>

                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-10">
                                                <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Save</button>&nbsp;
                                                {(editData === false ? null : <button className="btn btn-danger" name="btnDelete" onClick={DeleteConfirm.bind(this)} value="delete">Delete</button>)}
                                            </div>
                                        </div>

                                        
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DateChallengeDetail;