import React, { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import ReactPaginate from "react-paginate";
import {Helmet} from "react-helmet-async";
import {Tabs, Tab} from 'react-bootstrap';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

class vw_users extends Component{
    constructor(props){
        super(props)
        this.state = {
            items:[],
            items2:[],
            limit: 10,
            offset: 0 ,
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            loadData:true,
            id:"",
            totalData: 0,
            totalData2: 0,
            activePage: 1,
            tab: "users",
            newTab: "groups",
            str_where: '',
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
            str_where: this.state.str_where,
        };
        
        let isi = await AuthHelpers.postData('findTalentUser/ListData',credentials);
        
        this._isMounted && this.setState({items:!isi.data.data ? [] : isi.data.data},()=>{
            this.props.loadingData(false);
        });
    }

    getData2 = async () => {
        const credentials = {
            limit: this.state.limit,
            offset: this.state.offset,
            platform_id: this.state.platform_id,
            str_where: this.state.str_where,
        };
        
        let isi = await AuthHelpers.postData('findTalentUser/ListData',credentials);
        
        this.setState({items2:isi.data.data === undefined ? [] : isi.data.data});
    }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset: this.state.offset,
            category:"COUNT",
            platform_id: this.state.platform_id,
            str_where: this.state.str_where,
        }
        let isi = await AuthHelpers.postData('findTalentUser/ListData',credentials);
        
        if(isi.status == 200){
            this._isMounted && this.setState({totalData:isi.data.data === undefined ? 0 : isi.data.data});
        }else{
            alert(isi);
        }
    }

    getTotalPage2 = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset: this.state.offset,
            category:"COUNT",
            platform_id: this.state.platform_id,
            str_where: this.state.str_where,
        }
        let isi = await AuthHelpers.postData('findTalentUser/ListData',credentials);
        
        if(isi.status == 200){
            this._isMounted && this.setState({totalData2:isi.data.data === undefined ? 0 : isi.data.data});
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
        
        const ID = responseJson.data.data; 
        this.props.history.push({
            pathname: AllRoute.adminUsersdtl,
            data: {md5ID: ID},
            state: this.state.tab
        })
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
        
        let isi = await AuthHelpers.postData("findTalentUser/ListData", param);
        
        if(isi.status == 200){
            this.setState({items: isi.data.data},()=>{
                this.getTotalPage();
            } );
        }else{
            alert(isi);
        }
    }
    handleTextSearch(e){
        this.setState({
            str_where: e.target.value
        })
    }
    handleSearch = async(e) =>{
        e.preventDefault();
        this.getData() && this.getTotalPage();
    }

    changeTab(param){
        const name = param;
        

        if(name == 'users'){
            this.setState({
                tab: "users",
                newTab: "groups",
                
            }, () => this.getData() && this.getTotalPage()
            )
            
        }else{
            this.setState({
                tab: "groups",
                newTab: "users",
                
            }, () => this.getData2() && this.getTotalPage2()
            )
            
        }
    }

    header(){
        const { tab} = this.state;
        return(
            tab === 'users' ?
            <tr>
                <th>Account</th>
                <th>Email</th>
                <th style={{ width:"200px" }}>UserName</th>
                <th>Status Active</th>
                <th>Status Enable</th>
                <th style={{ width:"100px" }}>Last Login</th>
            </tr>
            :
            <tr>
                <th>Account</th>
                <th>Email</th>
                <th style={{ width:"200px" }}>UserName</th>
                <th style={{ width:"150px" }}>Actions</th>
            </tr>
        );
    }

    result(){
        const { items, items2, tab} = this.state;
        return(
            tab === 'users' ?
            items.map(
                (item, id) =>
                    <tr key={item.id}>
                        <td>{item.account}</td>
                        <td>{item.email}</td>
                        <td>{item.name}</td>
                        <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span></td>
                        <td><span style={ item.status_enable ? {} :{  color:"#ff0707" } }>{item.status_enable ? 'enabled' :'disabled'}</span></td>
                        <td>{item.last_login}</td>
                        <td>
                        </td>
                    </tr>
            )
            :
            items2.map(
                (item2, id) =>
                    <tr key={item2.id}>
                        <td>{item2.account}</td>
                        <td>{item2.email}</td>
                        <td>{item2.name}</td>
                        <td>
                        <a className="btn btn-primary btn-xs tt" onClick={this.getDetail.bind(this,item2.id)} >
                        <i className="fa fa-pencil-alt"></i>&nbsp; edit</a> 
                        &nbsp;
                        <a className="btn btn-danger btn-xs tt" onClick={this.getDetail.bind(this,item2.id)} >
                        <i className="fa fa-times"></i>&nbsp; revoke</a> 
                        </td>
                    </tr>
            )
        );
    }
    render(){        
        const { items, items2, tab, newTab} = this.state;
        return(
            <>
            <Helmet>
                <link href={env.assets+'css/pinned_style.css'} rel='stylesheet' type='text/css'/>
            </Helmet>
            <style>
                {`
                
                `}
            </style>

            <div className="col-md-10">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>User</strong> administration    
                    </div>

                    <div className="fa-pull-right">
                            <form onSubmit={this.handleSearch} className="search-form" method="post">
                                <div className="form-group has-feedback">
                                    <label htmlFor="search" className="visually-hidden">Search</label>
                                    <input type="text" className="form-control " name="search" onChange={this.handleTextSearch.bind(this)} 
                                    id="search" placeholder="search"/>
                                    {/* <span className="lbl-primary form-control-feedback fa fa-search "></span> */}
                                </div>
                            </form>
                        </div>

                        {/* <Tabs
                            id="controlled-tab-example"
                            activeKey={tab}
                            //activeKey='users'
                            onSelect= {this.changeTab.bind(this, newTab  )}
                            >
                            <Tab 
                                eventKey="users" title="Users">
                            </Tab>
                            <Tab 
                                eventKey="groups" title="Groups : Administrator"> 
                            </Tab>
                            
                        </Tabs>         */}

                        
                <div className="panel-body">
                    <div className="table-responsive">
                        
                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>

                                { tab == 'users' ? items.length : items2.length }
                                </b> of <b>
                                { tab == 'users' ? this.state.totalData : this.state.totalData2}</b> records.</div>

                                <table className="table table-hover">
                                <thead>
                                    {this.header()}
                                </thead>
                                <tbody>
                                
                                {this.result()}
                                
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

export default withRouter(vw_users);
