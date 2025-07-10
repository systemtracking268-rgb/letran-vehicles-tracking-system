import FuelConsumption from "../mapcomponents/fuel";
import Speed from "../mapcomponents/speed";
import TirePressure from "../mapcomponents/tirepressure";
import OilChangeMonitor from "../mapcomponents/oilchange";
import Gps from "../mapcomponents/gps";
import './fonts/font.css';
import Logo from "./images/logo.png"


function Admin(){
    return(
        <div className="flex h-screen bg-gray-900 justify-center">
            <div className="p-1 overflow-x-hidden">
            <div className="flex items-center space-x-4">
                <img src={Logo} alt="" className="w-[3rem] h-[3rem]"/>
                <h6 className="text-4xl font-[collegeFont] text-white">Colegio de San Juan de Letran Vehicles</h6>
            </div>

                <div className="flex gap-4 rounded-lg">
                    <div className="pt-2">
                        <Gps/>
                    </div>
                    <div className="grid grid-rows-2 grid-cols-2 gap-1">
                            <FuelConsumption/>
                            <Speed/>
                            <TirePressure/>
                            <OilChangeMonitor/>
                        </div>
                    </div>
                </div>            
            </div>
    );
}

export default Admin;