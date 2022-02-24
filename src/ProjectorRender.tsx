import React, { useEffect } from 'react';
import {useCurrentFrame, useVideoConfig, VideoConfig, random, AbsoluteFill} from 'remotion';

import { Img } from "remotion";
import { Video } from "remotion";
import styled from 'styled-components';
 
import { All_NFTS, Lucky_Imgs } from './nftImporter';
import background from './background.mp4';


function sineBetween(min: number, max: number, t: number) {
    const halfRange = (max - min) / 2;
    return min + halfRange + Math.sin(t / 100) * halfRange;
}


export const MovingNFT: React.FC<{nft: ObjectState, videoConf: VideoConfig}> = ({nft, videoConf}) => {
	const vW = videoConf.width,
				vH = videoConf.height

	// w and h are percentages of the screen width/height respectively, range 0..1
	const w = nft.w * vW + 'px',
			  h = nft.h * vH + 'px'

	// y and x are percentages of the TOTAL RENDERABLE AREA
	// Which is the size of the screen plus padding to account for the largest width
	const l = (nft.x * (vW + (2*SQUARE_LENGTH))) - SQUARE_LENGTH,
				t = (nft.y * (vH + (2*SQUARE_LENGTH))) - SQUARE_LENGTH

	return (
		<GlowBox
			color={nft.color}
			style={{
				position: 'absolute',
				width: w,
				height: h,
				top: t,
				left: l,
			}}
		>
			{nft.source.endsWith('.mp4') ?
				<Video
					src={nft.source}
					style={{
						width: w,
						height: h,
						zIndex: 1,
					}}
				/>
				:
				<Img
					src={nft.source}
					style={{
						width: w,
						height: h,
						zIndex: 1,
					}}
				/>
			}
		</GlowBox>
	)
}


const GlowBox = styled.div`
	border-radius: 10px;
	z-index: -1;

	box-shadow:

		0 0 7px #fff,
		0 0 10px #fff,
		0 0 21px #fff,

		0 0 42px ${props => props.color},
		0 0 82px ${props => props.color},
		0 0 92px ${props => props.color},
		0 0 102px ${props => props.color},
		0 0 151px ${props => props.color};
`


interface ObjectState {
	source: string,
	x: number,
	y: number,
	xStart: number,
	yStart: number,
	xVel: number, 
	yVel: number,
	w: number,
	h: number,
	color: string,
	tOffset: number, // For offseting sine value
}

// Pink, Yellow, Green, Blue, Purple
const COLORS = ['#FF69B4' , '#ff0', '#0fa', '#0ff', '#A020F0']
const SQUARE_LENGTH = 300

let ObjectStates: ObjectState[] = []

/**
 * Sets the value of ObjectStates[] to be rendered
 * @param videoConfig 
 */
function setup(videoConfig: VideoConfig) {

	ObjectStates = Lucky_Imgs.map((nftPath) => {
		const seed = nftPath

		const r = [
			// Seven random (distinct) values
			random(seed + 0),
			random(seed + 1),
			random(seed + 2),
			random(seed + 3),
			random(seed + 4),
			random(seed + 5),
			random(seed + 6),
			random(seed + 7),
		]

		// By decision, we'll use the 8 2:1 (rise:run) angles
		// Velocity and x value are percentages of the screen width and height
		let [xVelAbs, yVelAbs] = r[6] < 0.5 ? [.002, .001] : [.001, .002]
		// let [xVelAbs, yVelAbs] = r[6] < 0.5 ? [.0002, .0001] : [.0001, .0002]
		if (r[7] < 0.5) {
			// Randomly double the speed
			xVelAbs = 2 * xVelAbs
			yVelAbs = 2 * yVelAbs
		}

		return {
			source: nftPath,
			x: r[0],
			y: r[1],
			xStart: r[0],
			yStart: r[1],
			xVel: r[2] < 0.5 ? xVelAbs : -xVelAbs,
			yVel: r[3] < 0.5 ? yVelAbs : -yVelAbs,
			w: SQUARE_LENGTH / videoConfig.width,
			h: SQUARE_LENGTH / videoConfig.height,
			color: COLORS[Math.floor(r[4] * COLORS.length)],
			tOffset: Math.floor(r[5] * 1000)
		}
	})
}

/**
 * Run on every frame; updates the value of ObjectStates[]
 */
function update(videoConfig: VideoConfig, frame: number) {
	const vW = videoConfig.width,
				vH = videoConfig.height

	const MAX_W = SQUARE_LENGTH / (vW),
				MIN_W = SQUARE_LENGTH / (vW * 1.5),
				MAX_H = SQUARE_LENGTH / (vH),
				MIN_H = SQUARE_LENGTH / (vH * 1.5)

	ObjectStates.forEach((nft: ObjectState, ind, origArr) => {
		nft.w = sineBetween(MIN_W, MAX_W, frame + nft.tOffset)
		nft.h = sineBetween(MIN_H, MAX_H, frame + nft.tOffset)

		// Update the position based on velocity
		// x, y and xVel, yVel are percentages of total renderable area between 0..1
		nft.x = (nft.xStart + (frame * nft.xVel)) % 1
		if (nft.x < 0) {
			nft.x = 1 - Math.abs(nft.x)
		}
		nft.y = (nft.yStart + (frame * nft.yVel)) % 1
		if (nft.y < 0) {
			nft.y = 1 - Math.abs(nft.y)
		}

		// Update object in the rendered array
		origArr[ind] = nft
	})
}

// setup()

export const ProjectorRender: React.FC<{ /** props */ }> = () => {
	const frame = useCurrentFrame(); // Enable this line to force method to update every frame
	const videoConfig = useVideoConfig();

	useEffect(() => {
		setup(videoConfig)
	}, [videoConfig]) // Only re-runs if videoConfig changes (it won't)

	update(videoConfig, frame) // Call update every time ProjectorRender is rendered (every frame)


	return (
		<AbsoluteFill>
			<Video
				src={background}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: videoConfig.width + 'px',
					// height: videoConfig.height + 'px',
					zIndex: -2
				}}
			/>
			<Video
				src={background}
				style={{
					position: 'absolute',
					top: 0,
					left: '6000px',
					transform: 'scaleX(-1)',
					width: videoConfig.width + 'px',
					height: videoConfig.height + 'px',
					zIndex: -2
				}}
			/>
			{...ObjectStates.map((nft: ObjectState) => {
				return (
					<MovingNFT
						nft={nft}
						videoConf={videoConfig}
					/>
				)
			})}
		</ AbsoluteFill>
	);
};

