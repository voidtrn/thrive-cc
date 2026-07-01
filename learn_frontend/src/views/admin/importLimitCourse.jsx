import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props) {
    const items = props.items
    // const file_path = props.file_path

    return (
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        IMDL
                    </th>
                    <th>
                        Employee Account
                    </th>
                    <th>
                        Employee Name
                    </th>
                    <th>
                        Limit (Rp)
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

                {items.map(
                    (item) =>
                        <tr key={item.id}>
                            <td >{item.imdl}</td>
                            <td >{item.account}</td>
                            <td >{item.fullname}</td>
                            <td >{item.course_limit_thousand}</td>
                        </tr>
                )}
            </tbody>
            <LoadingAdmin loading={props.loading} />
        </table>
    )
}

function CourseLimit(props) {
    //const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const [searchFilter, setSearchFilter] = useState('')
    const file_path = env.userDocument;

    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset: offset,
            category: "COUNT",
            platform_id: platform_id,
            filter_search: searchFilter
        };

        let isi = await axiosLibrary.postData('awbCourseLimit/ListData', credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    }, [offset, searchFilter])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset: offset,
            category: "",
            platform_id: platform_id,
            filter_search: searchFilter
        };

        let isi = await axiosLibrary.postData('awbCourseLimit/ListData', credentials);
        setItems(isi.data.data)
        getTotalPage()
    }, [offset, getTotalPage, searchFilter])

    useEffect(() => {
        getData()
    }, [getData])

    const handlePageChange = (pageNumber) => {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchFilter(document.getElementById('search').value)
        setOffset(0)
    }

    const handleExport = async (e) => {
        e.preventDefault();
       
        const param = {
            platform_id: platform_id
        }
    
        let response = await axiosLibrary.postDataFile("awbCourseLimit/ExportData", param);
        if(response.status === 200){            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'course_limit - report.xlsx');
            document.body.appendChild(link);
            link.click();
        }else{
            alert(response);
        }
          
    }


    return (
        <>
            <style>
                {`
                    .search-form .form-group {
                        width: 250px;
                        margin-right:auto;
                        margin-top:1rem;
                    }               
                `}
            </style>
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-7">
                                <strong>{props.pageName}</strong>
                            </div>
                            <div className="col-md-5">
                                <div className="pull-right">
                                    <a style={{ marginRight: "5px", marginLeft: "5px" }} href={routeAdmin.importLimitCourseDetail.path} className="pull-right btn btn-success btn-sm tt" >
                                        <i className="fa fa-file-excel-o" ></i> New from Excel</a>
                                    <a style={{ marginRight: "5px", marginLeft: "5px" }} onClick={handleExport} className="pull-right btn btn-primary btn-sm tt" >
                                        <i className="fa fa-file-excel-o" ></i> Export</a>

                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-7">
                            </div>
                            <div className="col-md-5">
                                <div className="pull-right">
                                    <form className="search-form" method="post" onSubmit={handleSearch}>
                                        <div className="form-group has-feedback">
                                            <label htmlFor="search" className="sr-only">Search</label>
                                            <input type="text" className="form-control" name="search" id="search" placeholder="search" />
                                            <span className="lbl-primary fa fa-search form-control-feedback"></span>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr style={{ marginTop: "auto" }} />
                    <div className="panel-body">

                        <div className="table-responsive">
                            <div id="h182093w0" className="grid-view">
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
        </>
    )
}

export default CourseLimit;