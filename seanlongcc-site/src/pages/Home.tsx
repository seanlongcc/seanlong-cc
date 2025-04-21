import WarpSpeed from "../components/WarpSpeed";
import TextWarp from "../components/TextWarp";

const Home = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <WarpSpeed starCount={1000} speed={5} speedOnHover={25} />
      <TextWarp/>

      {/* <div className="relative z-10 flex flex-col justify-center h-screen not-italic text-center">
        <span className="text-3xl font-thin text-white transition-all warp-hover hover:font-black lg:text-8xl">
          annyeonghaseyo, sean imnida
        </span>
      </div> */}
    </div>
  );
};

export default Home;
