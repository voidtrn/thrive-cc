import { Component } from 'react';
import AuthHelpers from '../../../helpers/AuthHelpers';

import { Slide } from 'react-slideshow-image';
import SSO from '../../../helpers/SSO';
import 'react-slideshow-image/dist/styles.css'

var {LoginData, AllRoute, env} = SSO;
const Loader = () => (
    <div class="divLoader">
      <svg class="svgLoader" viewBox="0 0 100 100" width="10em" height="10em">
        <path stroke="none" d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50" fill="#51CACC" transform="rotate(179.719 50 51)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 51;360 50 51" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></path>
      </svg>
    </div>
  );

class vw_user_slider extends Component{

    constructor(props){
        super(props)
        this.state = {
            items:[],
            limit:"50",
            offset:"0",
            category:"",
            platform_id:LoginData.Security_getPlatformId(),
            file_path: env.userDocument,
            resizeWidth: 1300,

            loading:true
        };
        this.addDefaultSrcImg = this.addDefaultSrcImg.bind(this);
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
 
        let isi = await AuthHelpers.postData('findTalentSlider/ListData',credentials);
        var sliderAktif = isi.data.data || [];//.filter(x=>x.status_active == 1);
        this._isMounted && this.setState({items: sliderAktif, IsLoading: false},
            ()=> {this.ScaleSlider()});

            this.setState({  loading: false });


            
            this.props.loadingData(false);
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.ScaleSlider());
    }

    addDefaultSrcImg(ev){
        ev.target.src =  "https://dummyimage.com/600%20x%20200/6b686b/911616.png&text=Image+Error"
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
                
                        <div id="jssor_1" style={{position: "relative", margin: "0 auto", top: "0px", left: "0px", width: resizeWidth+"px", overflow: "hidden", visibility: "visible"}}>
                        
                            <div className="slide-container" data-u="slides" style={{cursor: "default", position: "relative", top: "0px", left: "0px", width: resizeWidth+"px", overflow: "hidden"}}>
                            <Slide {...propertiesSlide}
                            >
                                {items.map(
                                    (item, id) =>
                                    <div className="each-slide">
                                        {/* className="each-slide" */}
                                        <a href={item.hyperlink == null ? "#" : item.hyperlink} target={item.hyperlink == null ? '' : '_blank'}>
                                            <img data-u="image" src={file_path+ "slider/" + item.slider_image} style={{width:"100%"}} 
                                            onError={this.addDefaultSrcImg}
                                            />
                                        </a>
                                    </div>
                                )}
                            </Slide>
                            </div>
                    
                        </div>
                    </div>
                </div>
                
            </div>
        );
    }
}
    export default vw_user_slider;