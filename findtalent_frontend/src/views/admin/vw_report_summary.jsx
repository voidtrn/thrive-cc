import React, { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import ReactPaginate from "react-paginate";
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

class vw_activitylog extends Component{
    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit: 10,
            offset: 0 ,
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            loadData:true,
            id:"",
            totalData: 0,
            activePage: 1,
            startDate: "",
            endDate: "",
            resetData: false,
            filterDate: false,
            exportData: false
        };
        this._isMounted = false;
        this.onChange = this.onChange.bind(this);
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectAdmin();
            }
        });
    }

    componentDidMount(){
        this._isMounted = true;
        this._isMounted && this.getData() && this.getTotalPage();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    getData = async () => {
        const credentials = {
            limit: this.state.limit,
            offset: this.state.offset,
            platform_id: this.state.platform_id,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
        };
        let isi = await AuthHelpers.postData('findTalentReport/ListDataReportSummary',credentials);
        // this.setState({items:isi.data.data === undefined ? [] : isi.data.data});
        this._isMounted && this.setState({items:!isi.data.data ? [] : isi.data.data},()=>{
            this.props.loadingData(false);
        });
    }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset: this.state.offset,
            category:"COUNT",
            platform_id: this.state.platform_id,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
        }
        let isi = await AuthHelpers.postData('findTalentReport/ListDataReportSummary',credentials);
        /* console.log(isi); */
        if(isi.status == 200){
            this._isMounted && this.setState({totalData:isi.data.data === undefined ? 0 : isi.data.data});
        }else{
            alert(isi);
        }
    }

    handlePageChange(pageNumber) {
        var offsetNew = (pageNumber - 1) * this.state.limit;
        this.setState({activePage: pageNumber, offset: offsetNew}, () => {
            this.getData();
        });
    }

    onChange(e){
        this.setState({[e.target.name]:e.target.value});
    }

    getDetail= async(idParam) =>{
        let responseJson = await AuthHelpers.postData('GetMd5',{id:idParam});
        /*console.log(responseJson);*/
        const ID =responseJson.data.data; 
        this.props.history.push({
            pathname: AllRoute.adminActivitylog,
            data: {startDate: ID} 
          })
    }

    handleExport = async(e) => {
        e.preventDefault();
        const param = {
            platform_id: this.state.platform_id,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
        }
    
        let response = await AuthHelpers.postDataFile("findTalentReport/FormExportReportSummary", param);
        if(response.status == 200){            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'report_summary.xlsx');
            document.body.appendChild(link);
            link.click();
        }else{
            alert(response);
        }
    }

    handleReset(e){
        e.preventDefault();
        this.setState({startDate: '',endDate:''});
        this.getData() && this.getTotalPage();
    }
    
    handleSubmit = async(e) => {
        e.preventDefault();
        const param = {
            limit: this.state.limit,
            offset: this.state.offset,
            platform_id: this.state.platform_id,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
        }
        // console.log(param);
        let isi = await AuthHelpers.postData("findTalentReport/ListDataReportSummary", param);
        // console.log(isi);
        if(isi.status == 200){
            this.setState({items: isi.data.data},()=>{
                this.getTotalPage();
            } );
        }else{
            alert(isi);
        }
    }

    render(){
        const { limit, offset, category, exports, id, items } = this.state;
        return(
            <>
                <div className="col-md-9">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong>Report Summary</strong> Raw Data</div>
                            <div className="tab-menu">
                            <form id="czfrom" onSubmit={this.handleSubmit} method="post" >
                                <button onClick={this.handleExport.bind(this)} name="btnExport" value="export" 
                                    className="btn btn-primary btn-sm tt">
                                    <i className="far fa-file-excel"></i>&nbsp;Export </button>
                                <input type="date" id="access_date_from" style={{margin: "0 20px"}} 
                                    onChange={this.onChange} name="startDate" value={this.state.startDate} />
                                <input type="date" id="access_date_to" style={{margin: "0 20px"}} 
                                    onChange={this.onChange} name="endDate" value={this.state.endDate} />
                                <button onClick={this.handleReset.bind(this)} defaultValue="reset" style={{margin: "0px 40px"}} className="btn btn-primary btn-sm " >reset</button>
                                <button type="submit" value="filter" style={{margin: "0px 10px"}} className="btn btn-primary btn-sm fa-pull-right" >filter</button>
                            </form>
                            </div>
                        <div className="panel-body">
                            <div className="table-responsive">
                                <div id="h182093w0" className="grid-view">
                                    <div className="summary">Showing <b>{items.length}</b> of <b>{this.state.totalData}</b> records.</div>
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                            <th>
                                                Id
                                            </th>
                                            <th >
                                                Project Title
                                            </th>
                                            <th >
                                                Posted On
                                            </th>
                                            <th >
                                                Project Start Date
                                            </th>
                                            <th >
                                                Finish Date
                                            </th>
                                            <th >
                                                Number of Applicants
                                            </th>
                                            <th >
                                                Status Project
                                            </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {items.map(
                                        (item, id) =>
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.title}</td>
                                                <td>{item.date_created}</td>
                                                <td>{item.start_date}</td>
                                                <td>{item.registation_closed_by}</td>
                                                <td>{item.total_applicant}</td>
                                                <td>
                                                    <span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span>
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{textAlign:"center"}}>
                                    <ReactPaginate
                                    forcePage={this.state.activePage - 1}
                                    pageCount={Math.ceil(this.state.totalData / this.state.limit)}
                                    pageRangeDisplayed={5}
                                    marginPagesDisplayed={2}
                                    onPageChange={(e) => this.handlePageChange(e.selected + 1)}
                                    previousLabel="‹"
                                    nextLabel="›"
                                    breakLabel="…"
                                    containerClassName="pagination justify-content-center"
                                    pageClassName="page-item"
                                    pageLinkClassName="page-link"
                                    previousClassName="page-item"
                                    previousLinkClassName="page-link"
                                    nextClassName="page-item"
                                    nextLinkClassName="page-link"
                                    breakClassName="page-item"
                                    breakLinkClassName="page-link"
                                    activeClassName="active"
                                    />
                                </div>  
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default withRouter(vw_activitylog);
