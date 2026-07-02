import { Component, React } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AdminNavbar from '../vw_menu';
import Sidebar_menu from './vw_sidebar';
import AuthHelpers from '../../helpers/AuthHelpers';
import ReactPaginate from "react-paginate";
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;
class vw_theme extends Component{
    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit:10,
            offset:0,
            activePage: 1,
            pageRangeDisplayed:10,
            category:"",
            totalData:0,
            loadData:true,
            platform_id:LoginData.Security_getPlatformId(),
            file_path: env.userDocument
        };
        LoginData.Security_IsLogin().then((response)=>{
            if(response){
                LoginData.Security_RedirectAdmin();
            }
        });
    }

    componentDidMount(){
        this.getData();

    }

    getData = async () => {
        const credentials = {
            limit: this.state.limit,
            offset:this.state.offset,
            category:this.state.category,
            platform_id:this.state.platform_id
        };
        let isi = await AuthHelpers.postData('findTalentTheme/ListData',credentials);
        this.setState({items:isi.data.data === undefined ? [] : isi.data.data},()=>{
            this.getTotalPage();
            this.props.loadingData(false);
        });
    }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset:this.state.offset,
            category:"COUNT",
            platform_id:this.state.platform_id
        }
        let isi = await AuthHelpers.postData('findTalentTheme/ListData',credentials);
        if(isi.status == 200){
            this.setState({totalData:isi.data.data === undefined ? 0 : isi.data.data});
        }else{
            alert(isi);
        }
    }

    getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await AuthHelpers.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        this.props.history.push({
            pathname: AllRoute.adminThemeDtl,
            data: {md5ID: ID} // your data array of objects
          })
    }

    goTo(){
        if(this.state.totalData >= 2){
            alert("you have reached the maximum limit in creating the theme, maximum limit: 2")
            return false
        }

        this.props.history.push({
            pathname: AllRoute.adminThemeDtl,
        })
    }

    setDefault=async(param, idLoop)=>{
        const idParam = param;
        const parameter ={
            id: idParam,
            platform_id:this.state.platform_id
        }
        let responseJson = await AuthHelpers.postData('findTalentTheme/setAsDefault',parameter);
        
        if(responseJson.status==200){
            alert("SET DEFAULT SUCCESS");
            this.getData();
        }else{
            alert("SET DEFAULT FAILED");
            this.getData();
        }
    }

    handlePageChange(pageNumber) {
        var offsetNew = (pageNumber - 1) * this.state.limit;
        this.setState({activePage: pageNumber, offset: offsetNew}, () => {
            this.getData();
        });
    }

    render(){
        const { items, file_path, offset, limit, activePage } = this.state;
        return(
            <>
                            <div className="col-md-9">
                                <div className="panel panel-default">
                                    <div className="panel-heading">
                                        <strong>Theme</strong> administration    
                                    </div>
                                    <div className="panel-body">

                                        <div className="table-responsive">
                                            <div className="fa-pull-right">
                                                <a className="fa-pull-right btn btn-primary btn-sm tt" onClick={this.goTo.bind(this)} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                            </div>

                                            <div id="h182093w0" className="grid-view">
                                                <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{this.state.totalData}</b> records.</div>
                                                    <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                Theme Name
                                                            </th>
                                                            <th>
                                                                Language
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
                                                                <td style={{ width:"30%" }}>{item.theme_name}</td>
                                                                <td> {item.lang} </td>
                                                                <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active == 1 ? 'Active': 'Inactive'}</span>{item.default_flag==1 ? <div>( Default )</div> :null}</td>
                                                                <td>
                                                                    <a className="btn btn-primary btn-xs tt" onClick={this.getDetail.bind(this,item.id)} >
                                                                        <i className="fa fa-pencil-alt"></i>&nbsp; edit</a>
                                                                    &nbsp;
                                                                    {item.default_flag==0 ? 
                                                                        <a className="btn btn-primary btn-xs tt" onClick={this.setDefault.bind(this,item.id,id)} ><i className="fa fa-pencil-alt"></i>&nbsp; Set as Default</a>
                                                                        : 
                                                                        null
                                                                    }
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
    
    export default withRouter(vw_theme);