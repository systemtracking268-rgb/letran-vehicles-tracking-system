import Logo from "../dashboard/images/logo.png";
import Login from "../dashboard/login";

export default function Header({ onLogout }){

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        onLogout(); // trigger view back to login
    };

    return(
        <div className="flex z-999 items-center">
            <div className="sticky top-0 flex space-x-2 items-center py-4  w-full sm:pl-50">
                <img src={Logo} alt="" className="w-[3rem] h-[3rem]" />
                <h6 className="text-4xl font-[collegeFont] text-white">
                    Colegio de San Juan de Letran Vehicles
                </h6>
            </div>

            <button onClick={handleLogout} className="hover:bg-red-500 cursor-pointer text-white bg-red mr-10 rounded border-1 border-red-400 h-fit py-2 px-4">Logout</button>
        </div>
    );
}