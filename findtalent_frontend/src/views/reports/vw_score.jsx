import { Component } from 'react';
import withRouter from '../../helpers/withRouter';
import ReactPaginate from "react-paginate";
import AuthHelpers from '../../helpers/AuthHelpers';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

class vw_score extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit:10,
            offset:0,
            exportData: false,
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            validity_period_from: "",
            validity_period_to: "",
            activePage: 1,
            pageRangeDisplayed:10,
            totalData:0,
            loadData:true,
            assets: env.assets,
            file_path: env.userDocument
        };
        this.addDefaultSrcImg = this.addDefaultSrcImg.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount(){
        this.getData() && this.getTotalPage();
    }
    
    getData = async () => {
        
        const credentials = {
             limit: this.state.limit,
             offset:this.state.offset,
             category:this.state.category,
             platform_id: this.state.platform_id,
         };
 
         let isi = await AuthHelpers.postData('thinkReport/ListDataScore',credentials);
         //console.log(isi)
         this.setState({items:!isi.data.data ? [] : isi.data.data});
    }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset: this.state.offset,
            category:"COUNT",
            platform_id: this.state.platform_id,
            filter_period_from: this.state.validity_period_from,
            filter_period_to: this.state.validity_period_to,
            filter_search: this.state.filter_search,
        }
        let isi = await AuthHelpers.postData('thinkReport/ListDataScore',credentials);
        //console.log(isi.data.data);
        if(isi.status == 200){
            this.setState({totalData:isi.data.data === undefined ? 0 : isi.data.data},()=>{
                this.props.loadingData(false);
            });
        }else{
            alert(isi);
        }
    }

    addDefaultSrcImg(ev){
        ev.target.src =  "https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=Image+Error"
    }

    onChange(e){
        this.setState({[e.target.name]:e.target.value});
    }

    handlePageChange(pageNumber) {
        var offsetNew = (pageNumber - 1) * this.state.limit;
        this.setState({activePage: pageNumber, offset: offsetNew}, () => {
            this.getData();
        });
    }

    handleExport = async(e) => {
        e.preventDefault();
        const param = {
            platform_id: this.state.platform_id,
            filter_period_from: this.state.validity_period_from,
            filter_period_to: this.state.validity_period_to,
            filter_search: this.state.filter_search,
            module_name: 'Time to Think',
            report_name: 'score'
        }
    
        let response = await AuthHelpers.postDataFile("thinkReport/FormExport", param);
        if(response.status == 200){            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'meeting_score.xlsx');
            document.body.appendChild(link);
            link.click();
        }else{
            alert(response);
        }
    }

    handleSubmit = async(e) => {
        e.preventDefault();
        const param = {
            limit: this.state.limit,
            offset: this.state.offset,
            platform_id: this.state.platform_id,
            filter_period_from: this.state.validity_period_from,
            filter_period_to: this.state.validity_period_to,
            filter_search: this.state.filter_search,
        }
        // console.log(param);
        let isi = await AuthHelpers.postData("thinkReport/ListDataScore", param);
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
        const {items, assets, file_path } = this.state;
        return(

            <div className="col-md-12">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>Report</strong> Meeting Score   
                    </div>

                    <form  onSubmit={this.handleSubmit}  method="post" >
                        <div className="filter">
                            <div className="search-form">
                                <div className="form-group has-feedback">
                                    <label htmlFor="search" className="visually-hidden">Date</label>
                                        <input autoComplete="off" type="date" id="validity_period_from" className="form-control datepicker validity_period_from" placeholder="meeting start date"  
                                         onChange={this.onChange} name="validity_period_from" value={this.state.validity_period_from} />
                                        {/* <span className="lbl-primary fa fa-calendar-times-o form-control-feedback"></span> */}
                                    </div>
                                    <div className="form-group has-feedback">
                                        <label htmlFor="search" className="visually-hidden">Date</label>
                                        <input autoComplete="off" type="date" id="validity_period_to" className="form-control datepicker validity_period_to" placeholder="meeting end date"  
                                         onChange={this.onChange} name="validity_period_to" value="$validity_period_to"  value={this.state.validity_period_to} />
                                        {/* <span className="lbl-primary fa fa-calendar-times-o form-control-feedback"></span> */}
                                    </div>

                                    <div className="form-group has-feedback">
                                        <label htmlFor="search" className="visually-hidden">Search</label>
                                        <input type="text" autoComplete="off" className="form-control" name="filter_search" id="search"
                                         onChange={this.onChange}  placeholder="search" />
                                        {/* <span className="lbl-primary fa fa-search form-control-feedback"></span> */}
                                    </div>
                                <button type="submit" id="btnSearch" name="btnSearch" value="filter" style={{margin: "5px 10px"}} className="btn btn-primary btn-sm pull-right"
                                 name="btnSubmit" value="save">filter</button>
                            </div>
                        </div>
                        <div className="tab-menu">
                            <ul className="nav nav-tabs" style={{borderBottom: "unset"}}>            
                                <button onClick={this.handleExport.bind(this)} type="submit" id="btnExport" name="btnExport" value="export" className="btn btn-primary btn-sm tt">
                                    <i className="far fa-file-excel"></i>&nbsp;Export </button>               
                            </ul>
                        </div>
                    </form>
        
            
                    <div className="panel-body">
                        <div className="table-responsive">
                            <div className="pull-right">
                            </div>

                            <div className="grid-view">
                                <div className="summary">
                                    Showing <b>{items.length}</b> of <b>{this.state.totalData}</b> records.
                                </div>
                            <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th >
                                        Session Closed Time
                                    </th>
                                    <th >
                                        Meeting Subject
                                    </th>        
                                    <th >
                                        Meeting Date
                                    </th>
                                    <th >
                                        Average Meeting Score
                                    </th>
                                    <th >
                                        Participants
                                    </th>
                                    <th>
                                        Leader Name
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            { items.map((item, id) => 
                                <tr key={id}>
                                    <td>{item.submit_time}</td>
                                    <td>{item.subject}</td>
                                    <td>{item.meeting_date}</td>
                                    <td>{item.summary_score_rating}</td>
                                    <td>{item.total_participant}</td>
                                    <td>{item.user_organizer_name}</td>
                                </tr>
                            )}
                            </tbody>
                            </table>
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
        </div>
        );
    }
}
export default withRouter(vw_score);
