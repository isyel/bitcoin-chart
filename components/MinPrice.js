import { LinePath } from "@vx/shape";
import formatPrice from "../utils/formatPrice";

function MinPrice({ prices, label, yText, yScale, xScale, getTime, getPrice }) {
	return (
		<g>
			<LinePath
				x={(d) => xScale(getTime(d))}
				y={(d) => yScale(getPrice(d))}
				data={prices}
				stroke="#ffffff"
				strokeWidth={1}
				strokeOpacity={0.4}
				strokeDasharray={(4, 4)}
			/>
			<text y={yText} fontSize="8" fill="white" dy="-0.5em" dx="1em">
				{formatPrice(label)}
			</text>
		</g>
	);
}

export default MinPrice;
