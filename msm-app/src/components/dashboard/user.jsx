// import FuelConsumption from "../mapcomponents/fuel";
// import Speed from "../mapcomponents/speed";
import TirePressure from "../mapcomponents/tirepressure";
import OilChangeMonitor from "../mapcomponents/oilchange";
import Gps from "../mapcomponents/gps";
import Logo from "./images/logo.png"


function Driver(){
    return(
        <div className="flex h-screen bg-gray-900 justify-center">
            <div className="pt-2 pl-2 pr-2 overflow-x-hidden">
                <div className="flex justify-between items-center pl-2 pr-2 ">
                    <div className="flex space-x-2 items-center">
                        <img src={Logo} alt="" className="w-[3rem] h-[3rem]"/>
                        <h6 className="text-4xl font-[collegeFont] text-white">Colegio de San Juan de Letran Vehicles</h6>
                    </div>
                                 
                    <p className="font-semibold mb-4 text-xs"></p>
                    <div className="flex gap-4 pr-2">
                        {/* <p className="text-xs font-semibold">Admin</p> */}
                        {/* <p className="text-xs font-semibold text-white">Maintenance</p> */}
                    </div>
                </div>

                <div className=" w-fit flex gap-4 rounded-lg">
                    <div className="pt-2">
                        <Gps/>
                    </div>
                    <div className="grid grid-rows-2 grid-cols-2 gap-1 h-fit">
                            {/* <FuelConsumption/> */}
                            {/* <Speed/> */}
                            <div className="col-span-2"><TirePressure/></div>
                            <div className="col-span-2"><OilChangeMonitor/></div>
                        </div>
                    </div>
                </div>            
            </div>
    );
}

export default Driver;