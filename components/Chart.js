import { withParentSize } from "@vx/responsive";
import chartStyles from "../styles/Chart.module.css";
import formatPrice from "../utils/formatPrice";
import formatDate from "../utils/formatDate";
import { scaleTime, scaleLinear } from "@vx/scale";
import { AreaClosed, Bar, Line, LinePath } from "@vx/shape";
import { useRef } from "react";
import { GridColumns, GridRows } from "@vx/grid";
import { extent } from "d3-array";
import { curveMonotoneX } from "@vx/curve";
import { LinearGradient } from "@vx/gradient";
import MaxPrice from "./MaxPrice";
import MinPrice from "./MinPrice";
import { AxisBottom } from "@vx/axis";
import { Tooltip, withTooltip } from "@vx/tooltip";
import { bisector } from "d3-array";
import { localPoint } from "@vx/event";

function Chart({
	data,
	parentWidth,
	parentHeight,
	tooltipLeft,
	tooltipTop,
	tooltipData,
	showTooltip,
	hideTooltip,
}) {
	console.log("Data: ", data);
	const svgRef = useRef(null);
	const margin = {
		top: 15,
		bottom: 75,
		left: 0,
		right: 0,
	};
	const width = parentWidth - margin.left - margin.right;
	const height = parentHeight - margin.top - margin.bottom;

	const bisectDate = bisector((d) => getTime(d)).left;

	if (!data?.bpi) return <div>Loading...</div>;
	const prices = Object.keys(data?.bpi).map((key) => {
		return {
			time: key,
			price: data?.bpi[key],
		};
	});

	console.log("Prices: ", prices);

	const currentPrice = prices[prices.length - 1]?.price;
	const firstPrice = prices[0]?.price;
	const differenceInPrice = currentPrice - firstPrice;
	const hasIncreased = differenceInPrice > 0 ? true : false;

	//Calculations for Chart
	const getTime = (d) => new Date(d.time);
	const getPrice = (d) => d.price;
	const xScale = scaleTime({
		range: [0, width],
		domain: extent(prices, getTime),
	});

	const minPrice = Math.min(...prices.map(getPrice));
	const maxPrice = Math.max(...prices.map(getPrice));
	const maxPriceData = [
		{
			time: getTime(prices[0]),
			price: maxPrice,
		},
		{
			time: getTime(prices[prices.length - 1]),
			price: maxPrice,
		},
	];
	const minPriceData = [
		{
			time: getTime(prices[0]),
			price: minPrice,
		},
		{
			time: getTime(prices[prices.length - 1]),
			price: minPrice,
		},
	];

	const yScale = scaleLinear({
		range: [height, 0],
		domain: [minPrice, maxPrice],
		nice: true,
	});

	const handleTooltip = (event) => {
		const { x } = localPoint(svgRef.current, event) || { x: 0 };
		const x0 = xScale.invert(x);
		const index = bisectDate(prices, x0, 1);
		const d0 = prices[index - 1];
		const d1 = prices[index];
		let d = d0;
		if (d1 && getTime(d1)) {
			d =
				x0.valueOf() - getTime(d0).valueOf() >
				getTime(d1).valueOf() - x0.valueOf()
					? d1
					: d0;
		}
		showTooltip({
			tooltipData: d,
			tooltipLeft: xScale(getTime(d)),
			tooltipTop: yScale(getPrice(d)),
		});
	};

	return (
		<div>
			<div className={chartStyles.titlebar}>
				<div className={chartStyles.title}>
					Bitcoin Price
					<small>last 30 days</small>
				</div>

				<div className={chartStyles.currentprice}>
					{formatPrice(currentPrice)}
					<small
						className={
							hasIncreased ? chartStyles.increased : chartStyles.decreased
						}>
						{hasIncreased ? "+" : "-"}
						{formatPrice(differenceInPrice)}
					</small>
				</div>
			</div>

			<svg width={width} height={parentHeight} ref={svgRef}>
				<GridRows
					scale={yScale}
					width={width}
					strokeDasharray="3,3"
					strokeOpacity={0.3}
					pointerEvents="none"
				/>
				<GridColumns
					scale={xScale}
					height={height}
					strokeDasharray="3,3"
					strokeOpacity={0.3}
					pointerEvents="none"
				/>
				<LinePath
					x={(d) => xScale(getTime(d))}
					y={(d) => yScale(getPrice(d))}
					data={prices}
					stroke="#ffffff"
					strokeWidth={2}
					strokeOpacity={0.6}
					// curve={curveMonotoneX}
				/>
				<AreaClosed
					x={(d) => xScale(getTime(d))}
					y={(d) => yScale(getPrice(d))}
					data={prices}
					yScale={yScale}
					fill="url(#area-fill)"
					// curve={curveMonotoneX}
					stroke="transparent"
				/>
				<LinearGradient
					id="area-fill"
					from="#777782"
					to="#000000"
					fromOpacity={1}
					toOpacity={0.3}
				/>
				<MaxPrice
					prices={maxPriceData}
					yScale={yScale}
					xScale={xScale}
					getPrice={getPrice}
					getTime={getTime}
					label={maxPrice}
					yText={yScale(maxPrice)}
				/>
				<MinPrice
					prices={minPriceData}
					yScale={yScale}
					xScale={xScale}
					getPrice={getPrice}
					getTime={getTime}
					label={minPrice}
					yText={yScale(minPrice)}
				/>
				<AxisBottom
					data={prices}
					scale={xScale}
					x={getTime}
					top={yScale(minPrice)}
					numTicks={4}
					hideTicks
					hideAxisLine
					labelClassName={chartStyles.axisbottom}
					//tickLabelComponent={<text fill="#ffffff" fontSize={10} />}
					tickLabelProps={() => ({
						fill: "white",
						fontSize: "9px",
					})}
				/>
				<Bar
					data={prices}
					width={width}
					height={height}
					fill="transparent"
					onMouseMove={handleTooltip}
					onTouchMove={handleTooltip}
					onTouchStart={handleTooltip}
					onMouseLeave={() => hideTooltip()}
				/>
				{tooltipData && (
					<g>
						<Line
							from={{ x: tooltipLeft, y: 0 }}
							to={{ x: tooltipLeft, y: height }}
							stroke="#ffffff"
							strokeWidth={1}
							pointerEvents="none"
							strokeDasharray="5,2"
						/>
						<circle
							r="8"
							cx={tooltipLeft}
							cy={tooltipTop}
							fill="white"
							opacity={0.4}
							style={{ pointerEvents: "none" }}
						/>
						<circle
							r="4"
							cx={tooltipLeft}
							cy={tooltipTop}
							fill="white"
							style={{ pointerEvents: "none" }}
						/>
					</g>
				)}
			</svg>
			{tooltipData && (
				<div>
					<Tooltip
						top={tooltipTop + 30}
						left={tooltipLeft}
						className={chartStyles.tooltip}>
						{formatPrice(getPrice(tooltipData))}
					</Tooltip>
					<Tooltip left={tooltipLeft} top={yScale(minPrice) + 60}>
						{`${formatDate(getTime(tooltipData))}`}
					</Tooltip>
				</div>
			)}
		</div>
	);
}

export default withTooltip(withParentSize(Chart));
