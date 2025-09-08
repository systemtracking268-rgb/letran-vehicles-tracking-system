/* eslint-disable no-unused-vars */
import Logo from "../dashboard/images/logo.png";
import userIcon from "../dashboard/images/usericon.webp";

export default function Header(){

    const username = localStorage.getItem("loggedInUser");

    return(
        <div className="flex z-999 items-center px-10 bg-blue-700 justify-between">
            <div className="sticky top-0 flex space-x-2 items-center py-4  w-full">
                <img src={Logo} alt="" className="w-[3rem] h-[3rem]" />
                <h6 className="text-4xl font-[collegeFont] text-white">
                    Colegio de San Juan de Letran Vehicles
                </h6>
            </div>
            
            <h1 className="flex text-white shrink-0 gap-2 items-center">
                <span>
                    <img src={userIcon} alt="" className="h-12 w-12"/>
                </span>
                {username}
            </h1>
        </div>
    );
}