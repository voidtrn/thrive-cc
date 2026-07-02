import { Component } from 'react';
import AuthHelpers from '../../../helpers/AuthHelpers';

import { Slide } from 'react-slideshow-image';
import SSO from '../../../helpers/SSO';
import 'react-slideshow-image/dist/styles.css'

var {LoginData, AllRoute, env} = SSO;


export default class vw_text_slider extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit:"50",
            offset:"0",
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            file_path: env.userDocument,
            IsLoading: true,
            resizeWidth: 1300,
        };
        //window.onresize(this.ScaleSlider());
      }

    componentDidMount(){
        this._isMounted = true;
        this._isMounted && this.getData();
        window.addEventListener('resize', this.ScaleSlider());
        //document.getElementsByClassName("navbar")
    }
    
    ScaleSlider = () => {
        var jssor_1_slider = document.getElementById("jssor_1");
        
        if(!jssor_1_slider){
            return;
        }
        
        var refSize = jssor_1_slider.parentNode.clientWidth;
        // console.log(refSize);
        if (refSize) {
            //refSize = Math.min(refSize, 1920);
            this.setState({
                resizeWidth: refSize
            })
        }
        else {
            //window.setTimeout(this.ScaleSlider(), 30);
        }
    }

    getData = async () => {
        const credentials = {
             limit: this.state.limit,
             offset:this.state.offset,
             category:this.state.category,
             platform_id: this.state.platform_id,
             status_active: 1,
             items:this.state.items
        };
 
        let isi = await AuthHelpers.postData('thinkSliderComment/ListData',credentials);
        var sliderAktif = isi.data.data || [];//.filter(x=>x.status_active == 1);
        this._isMounted && this.setState({items: sliderAktif, IsLoading: false},
            ()=> {this.ScaleSlider()});
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.ScaleSlider());
    }

    render(){
        const { items, file_path, IsLoading, resizeWidth } = this.state;
        const propertiesSlide = {
            arrows : items.length === 1 ? false : true,
            autoplay: items.length === 1 ? false : true,
            canSwipe: items.length === 1 ? false : true,
        }
        if(items.length < 1){
            return null;
        }
        return(
            <div style={{overflow: "hidden"}}>
            <div className="scrollbar-scrollbar scrollbar-dynamic">
            <div className="header-with-bg">
                
                <div id="jssor_2" style={{width: "100%", height: "80px", color:"black"}}>
                    {/* <!-- Loading Screen --> */}
                    {
                        IsLoading ?
                        <div data-u="loading">
                           <div style={{filter: "alpha(opacity=70)", opacity: "0.7", position: "absolute", display: "block", top: "0px", left: "0px", width: "100%", height: "100%", textAlign: "center"}}>

                            </div>
                        </div>
                        :
                        <div data-u="slides" style={{cursor: "default", position:"relative", top: "0px", left: "0px", width: "100%", height: "80px", overflow: "hidden"}} >
                        <Slide {...propertiesSlide}
                            // data-u="slides" 
                            // style={{cursor: "default", position: "relative", top: "0px", left: "0px", width: "1300px", height: "400px", overflow: "hidden", borderWidth: 1}}
                        >
                            {items.map(
                                (item, id) =>
                                <div className="each-slide">
                                    {/* className="each-slide" */}
                                    <div data-p="225.00" style={{textAlign: "center"}} >
                                        {'"'+item.comment+'"'} – {item.name}
                                    </div>  
                                </div>
                            )}
                        </Slide>
                        </div>
                    }
                </div>
           
            </div>
        </div>
    </div>

        );
    }
}