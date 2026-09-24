import SignUp from "../components/SignUp";

export const SignUpPage = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center ">
      <section className="w-[35%] h-full p-8 flex flex-col justify-between bg-[url('/bg.svg')] bg-cover">
        <div className="">
          <h1>Sarkari Ping.</h1>
        </div>
        <div>
          <h2>Get Your Curated Job</h2>
          <p>
            Describe your preference,customize your preference. Get email
            notification in Real-time.Get your Job at tip of your Phone.
          </p>
        </div>
      </section>
      <SignUp />
    </div>
  );
};
