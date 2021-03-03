import { useEffect, useState } from "react";
import pageStyles from "../styles/Bitcoin.module.css";
import { withScreenSize } from "@vx/responsive";
import { LinearGradient } from "@vx/gradient";
import Chart from "../components/Chart";

function Background({ width, height }) {
	return (
		<svg width={width} height={height}>
			<LinearGradient id="fill" vertical={false}>
				<stop stopColor="#a943e4" offset="0%" />
				<stop stopColor="#f55989" offset="50%" />
				<stop stopColor="#ffaf84" offset="100%" />
			</LinearGradient>
			<rect width={width} height={height} fill="url(#fill)" />
		</svg>
	);
}

function bitcoin(props) {
	const [data, setData] = useState({});
	const { screenWidth, screenHeight } = props;

	useEffect(() => {
		fetch("https://api.coindesk.com/v1/bpi/historical/close.json")
			.then((res) => res.json())
			.then((json) => setData(json));
	}, []);

	return (
		<div className={pageStyles.app}>
			<Background width={screenWidth} height={screenHeight} />
			<div className={pageStyles.center}>
				<div className={pageStyles.chart}>
					<Chart data={data} />
				</div>
				<p className={pageStyles.disclaimer}>{data.disclaimer}</p>
			</div>
		</div>
	);
}

export default withScreenSize(bitcoin);
