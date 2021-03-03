import Link from "next/link";
import homeStyles from "../styles/Home.module.css";

function index() {
	return (
		<div className={homeStyles.container}>
			<Link href="/bitcoin">
				<button className={homeStyles.button}>View Bitcoin Chart</button>
			</Link>
		</div>
	);
}

export default index;
