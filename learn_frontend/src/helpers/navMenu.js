import { env, securityData } from './globalHelper';
import routeAll from './route';

const routeAdmin = routeAll.routesAdmin
const routeUser = routeAll.routesUser

const theme = securityData.Security_getTheme()

const menu = []

const sidebar = [
           
]

const navMenu = {
    menu,
    sidebar
}

export default navMenu;