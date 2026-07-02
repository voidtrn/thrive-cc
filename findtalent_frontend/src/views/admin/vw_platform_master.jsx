import { Component, React } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import ReactPaginate from "react-paginate";
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env, LoginData} = SSO;
class vw_platform_master extends Component{
    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit:5,
            offset:0,
            activePage: 1,
            pageRangeDisplayed:10,
            category:"",
            totalData:0,
            loadData:true,

            file_path: env.userDocument
        };
        this._isMounted = false;
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectSuperAdmin();
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
            offset:this.state.offset,
            category:this.state.category,
        };
        let isi = await AuthHelpers.postData('findTalentPlatform/ListData',credentials);
        //this._isMounted && this.setState({items:!isi.data.data ? [] : isi.data.data});
        this._isMounted && this.setState({items:!isi.data.data ? [] : isi.data.data},()=>{
            this.props.loadingData(false);
        });
    }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset:this.state.offset,
            category:"COUNT",
        }
        let isi = await AuthHelpers.postData('findTalentPlatform/ListData',credentials);
        this._isMounted && this.setState({totalData:!isi.data.data ? 0 : isi.data.data});
    }

    getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await AuthHelpers.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        this.props.history.push({
            pathname: AllRoute.adminPlatformDtl,
            data: {md5ID: ID} // your data array of objects
          })
    }

    handlePageChange(pageNumber) {
        var offsetNew = (pageNumber - 1) * this.state.limit;
        this.setState({activePage: pageNumber, offset: offsetNew}, () => {
            this.getData();
        });
    }

    render(){
        const { items, file_path, offset,limit,activePage } = this.state;
        return(
            <>
                            <div className="col-md-9">
                                <div className="panel panel-default">
                                    <div className="panel-heading">
                                        <strong>Platform</strong> administration    
                                    </div>
                                    <div className="panel-body">

                                        <div className="table-responsive">
                                            <div className="fa-pull-right">
                                                <a className="fa-pull-right btn btn-primary btn-sm tt" href={AllRoute.adminPlatformDtl} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                            </div>

                                            <div id="h182093w0" className="grid-view">
                                                <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{this.state.totalData}</b> records.</div>
                                                    <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                Name
                                                            </th>
                                                            <th>
                                                                Image Platform
                                                            </th>
                                                            <th>
                                                                IMDL
                                                            </th>
                                                            <th style={{ width:"100px" }}>
                                                                Status
                                                            </th>
                                                            <th >
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                    {items.map(
                                                        (item, id) =>
                                                            <tr key={item.id}>
                                                                <td style={{ width:"30%" }}>{item.name}</td>
                                                                <td> 
                                                                    <img  style={{ width:"160px", height:"auto" }} src={file_path+ "platform/" + item.platform_image}    alt="" />
                                                                </td>
                                                                <td>
                                                                    {item.imdl_param}
                                                                </td>
                                                                <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span>
                                                                </td>
                                                                <td>
                                                                    <a className="btn btn-primary btn-xs tt" onClick={this.getDetail.bind(this,item.id)} ><i className="fa fa-pencil-alt"></i>&nbsp; edit</a> 
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
    
    export default withRouter(vw_platform_master);