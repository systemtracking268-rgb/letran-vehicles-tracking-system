import Logo from "../dashboard/images/logo.png";

export default function Header(){
    return(
        <div className="sticky top-0 flex space-x-2 items-center py-4 z-999 w-full justify-center">
            <img src={Logo} alt="" className="w-[3rem] h-[3rem]" />
            <h6 className="text-4xl font-[collegeFont] text-white">
                Colegio de San Juan de Letran Vehicles
            </h6>
        </div>
    );
}