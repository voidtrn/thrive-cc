import { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

class vw_function extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit:5,
            offset:0,
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            activePage: 1,
            pageRangeDisplayed:10,
            totalData:0,
            loadData:true,
            file_path: env.userDocument
        };
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
            offset:this.state.offset,
            category:this.state.category,
            platform_id: this.state.platform_id,
            items:this.state.items
        };

        let isi = await AuthHelpers.postData('thinkFunctionMapping/ListData',credentials);
        
        this._isMounted && this.setState({items:!isi.data.data ? [] : isi.data.data});
      }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset:this.state.offset,
            category:"COUNT",
            platform_id: this.state.platform_id,
        }
        let isi = await AuthHelpers.postData('thinkFunctionMapping/ListData',credentials);
        if(isi.status == 200){
            this._isMounted && this.setState({totalData:isi.data.data === undefined ? 0 : isi.data.data});
        }else{
            alert(isi);
        }
    }


    getDetail= async (param)=>{
        const idParam = param;
        let responseJson = await AuthHelpers.postData('GetMd5',{id: idParam});
        const ID =responseJson.data.data;
        this.props.history.push({
            pathname: AllRoute.adminSliderdtl,
            data : { md5ID : ID  }
          })
    }

    handlePageChange(pageNumber) {
        var offsetNew = (pageNumber - 1) * this.state.limit;
        this.setState({activePage: pageNumber, offset: offsetNew}, () => {
            this.getData();
        });
    }

    render(){
        const { items, file_path } = this.state;
        return(
            <>
                <div className="col-md-10">
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <strong>Mapping Function</strong> administration   
                        </div>
                        <div className="panel-body">
                            <div className="table-responsive">
                                <div className="fa-pull-right">
                                    <a className="fa-pull-right btn btn-primary btn-sm tt" href="<?php echo site_url('admin/feature/create')?>" ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                </div>
                            <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{items.length}</b> of <b>{this.state.totalData}</b> records.</div>
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th style={{width:"200px"}}>
                                                    Function
                                                </th>
                                                <th>
                                                    Business Unit
                                                </th>
                                                <th>
                                                    Directorate
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
                                                        <td  style={{ width:"30%" }}> <p>{item.name}</p>  </td>
                                                        <td > <img  style={{ width:"160px", height:"auto" }} src={file_path+ "slider/" + item.slider_image}      alt="" />
                                                        </td>
                                                        <td ><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span></td>
                                                        <td  >{item.hyperlink ? 'yes' : 'no'}</td>
                                                        <td >
                                                        <a className="btn btn-primary btn-xs tt" onClick={this.getDetail.bind(this,item.id)} >
                                                                    <i className="fa fa-pencil"></i>&nbsp; edit</a> 
                                                        </td>
                                                    </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
    
export default withRouter(vw_function);