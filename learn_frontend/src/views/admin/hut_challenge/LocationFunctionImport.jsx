import React, { useCallback, useEffect, useState } from 'react';
import axiosLibrary from '../../../helpers/axiosLibrary';
import routeAll from '../../../helpers/route';
import { useHistory } from '../../../helpers/useHistory';
import { env, securityData } from '../../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../../components/Loading';
import NavMenu from '../shared/navMenu.jsx';
import SideBarMenuAdmin from './adminMenu.jsx';

import { Tab, Row, Col, Nav } from 'react-bootstrap';

import BadgeMember from './../badgeMember';

function LocationFunctionImport(props) {

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

    const file_assets = env.assets
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
        const fd = new FormData();

        const IsFileAttached = fileInput.current.files.length > 0;
        if (IsFileAttached) {
            fd.append("import_file", fileInput.current.files[0]);
            fd.append("platform_id", platform_id);

            fd.append("user_created", user_id);
            let responseJson = await axiosLibrary.postData("awbHutZoneLocationFunction/ImportData", fd);
            if (responseJson.status === 200) {
                alert("DATA HAS BEEN CREATED");
                history.push(routeAdmin.AdminLocationFunction.path)
            } else {
                alert(responseJson);
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
    const formatSizeUnits = (bytes) => {

        if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + ' GB'; }
        else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + ' MB'; }
        else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + ' KB'; }
        else if (bytes > 1) { bytes = bytes + ' bytes'; }
        else if (bytes === 1) { bytes = bytes + ' byte'; }
        else { bytes = '0 byte'; }
        return bytes;
    }

    const setStateImage = (HtmlElement, stateFile, invalidImage) => {
        document.getElementById("upload-name").innerHTML = HtmlElement
        setInvalidImage(invalidImage)
    }

    const ajaxFileUploadImage = (upload_field) => {
        var re_text = /\.xls|\.xlsx|\.csv/i;
        var filename = upload_field.target.value;
        var imagename = filename == null ? "" : filename.replace("C:\\fakepath\\", "");
        if (filename.search(re_text) === -1) {
            alert("File must be an (xls, xlsx or csv)");
            upload_field.target.form.reset();
            return 0;
        }
        var FileSize = upload_field.target.files[0].size / 1024 / 1024; // in MB
        if (FileSize > 10) {
            alert('File size exceeds 10 MB');
            upload_field.target.form.reset();
            return 0;
        }

        setStateImage(imagename + ' (' + formatSizeUnits(upload_field.target.files[0].size) + ')', URL.createObjectURL(upload_field.target.files[0]), false)

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


                                    <form id="czfrom" onSubmit={validateImage} method="post" enctype="multipart/form-data" accept-charset="UTF-8" style={{ display: "block" }}>


                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Template File</label>
                                            <div className="col-sm-9">
                                                <a href={file_assets + "template/import_zone_location_function_template.xlsx"} className="text-black">
                                                    Download file
                                                </a>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label">Excel File</label>
                                            <div className="col-sm-9">
                                                <label className="control-label" for="usereditform-email">&nbsp;Import file   <span style={{ color: "#ff0404" }}>(*) </span>
                                                    <br />
                                                    <ul className="file-upload-requirement">
                                                        <li>
                                                            follow the instructions in the template
                                                        </li>
                                                        <li>
                                                            one file only
                                                        </li>
                                                        <li>
                                                            10 MB limit or no more than 50000 row
                                                        </li>
                                                        <li>
                                                            Allowed types for worksheet : xls, xlsx or csv
                                                        </li>
                                                    </ul>
                                                </label>
                                                <br />
                                                <input type="file" name="file" id="file" size="40"
                                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                    ref={fileInput} onChange={ajaxFileUploadImage.bind(this)} required />
                                                <br /><br /><br />
                                                <span className='badge badge-primary text-black' id="upload-name" name="upload-name"></span>
                                                <div className="help-block"></div>
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-10">
                                                <a href={routeAll.routesAdmin.AdminLocationFunction.path} className="nav-link color-white-dark50" >
                                                <span className="btn btn-sm btn-warning">Back</span>
                                                </a>
                                                
                                            </div>
                                        </div>
                                        <div className="row mb-3">
                                            <label for="inputEmail3" className="col-sm-2 col-form-label"></label>
                                            <div className="col-sm-10">
                                                
                                                <button type="submit" className="btn btn-primary" name="btnSubmit" value="save">Submit</button>
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

export default LocationFunctionImport;