import Login from "../components/Login";

export const LoginPage = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center ">
      <Login />
      <section className="w-[35%] h-full p-8 flex flex-col justify-between bg-[url('/bg.svg')] bg-cover">
        <div className="">
          <h1>Sarkari Ping.</h1>
        </div>
        <div>
          <h2>Get into and get Your Curated Job</h2>
          <p>
            Describe your preference,customize your preference. Get email
            notification in Real-time.Get your Job at tip of your Phone.
          </p>
        </div>
      </section>
    </div>
  );
};
