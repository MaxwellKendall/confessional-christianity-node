import '../styles/index.scss';
import wlc from "../data/westminster/wlc.json";

export async function getStaticProps(context) {
    return {
      props: {
          wlc
      }, // will be passed to the page component as props
    }
}

const HomePage = ({
    wlc
}) => {
    console.log("data", wlc);
    return (
        <h1 className="text-center">Hello Guyz</h1>
    );
}

export default HomePage;
