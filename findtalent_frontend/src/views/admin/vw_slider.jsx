import { Component } from 'react';
import { Link } from "react-router-dom";
import withRouter from "../../helpers/withRouter";
import AuthHelpers from '../../helpers/AuthHelpers';
import ReactPaginate from "react-paginate";
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

class vw_slider extends Component{

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
        this.addDefaultSrcImg = this.addDefaultSrcImg.bind(this);
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

        let isi = await AuthHelpers.postData('findTalentSlider/ListData',credentials);
        this._isMounted && this.setState({items:!isi.data.data ? [] : isi.data.data},()=>{
            this.props.loadingData(false);
        });
      }

    getTotalPage = async () =>{
        const credentials ={
            limit: this.state.limit,
            offset:this.state.offset,
            category:"COUNT",
            platform_id: this.state.platform_id,
        }
        let isi = await AuthHelpers.postData('findTalentSlider/ListData',credentials);
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
            pathname: AllRoute.adminSliderDtl,
            data : { md5ID : ID  }
          })
    }

    handlePageChange(pageNumber) {
        var offsetNew = (pageNumber - 1) * this.state.limit;
        this.setState({activePage: pageNumber, offset: offsetNew}, () => {
            this.getData();
        });
    }

    addDefaultSrcImg(ev){
        ev.target.src =  "https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=Image+Error"
    }


    render(){
        const { items, file_path } = this.state;
        return(
            <>
            <div className="col-md-10">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <strong>Slider</strong> administration    
                    </div>
                <div className="panel-body">

                    <div className="table-responsive">
                        <div className="fa-pull-right">
                            <a className="fa-pull-right btn btn-primary btn-sm tt" href={AllRoute.adminSliderDtl} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                        </div>

                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{items.length}</b> of <b>{this.state.totalData}</b> records.</div>
                                <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>
                                            Description
                                        </th>
                                        <th>
                                            Slider Image
                                        </th>
                                        <th>
                                            Slider Image Mobile
                                        </th>
                                        <th style={{ width:"100px" }}>
                                            Status
                                        </th>
                                        <th style={{ width:"100px" }}>
                                            Hyperlink
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
                                            <td  style={{ width:"30%" }}> 
                                                <p>{item.name}</p>  
                                            </td>
                                            <td > 
                                                <img  style={{ width:"160px", height:"auto" }} src={file_path+ "slider/" + item.slider_image} alt="" onError={this.addDefaultSrcImg} />
                                            </td>
                                            <td > 
                                                <img  style={{ width:"160px", height:"auto" }} src={file_path+ "slider/" + item.slider_image_mobile} alt="" onError={this.addDefaultSrcImg} />
                                            </td>
                                            <td >
                                                <span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span></td>
                                            <td>
                                                {item.hyperlink ? 'yes' : 'no'}
                                            </td>
                                            <td>
                                                <a className="btn btn-primary btn-xs tt" onClick={this.getDetail.bind(this,item.id)} >
                                                    <i className="fa fa-pencil-alt"></i>&nbsp; edit
                                                </a> 
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
    
    export default withRouter(vw_slider);