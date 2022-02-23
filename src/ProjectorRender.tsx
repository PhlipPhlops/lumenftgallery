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
	const w = nft.w * videoConf.width + 'px',
			  h = nft.h * videoConf.height + 'px'


	return (
		<GlowBox
			color={nft.color}
			style={{
				position: 'absolute',
				width: w,
				height: h,
				top: nft.y * videoConf.height,
				left: nft.x * videoConf.width,
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
// #0fa

interface ObjectState {
	source: string,
	x: number,
	y: number,
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

		const xVelAbs = r[6] * 0.01 + 0.001
		const yVelAbs = r[7] * 0.01 + 0.001

		return {
			source: nftPath,
			x: r[0],
			y: r[1],
			xVel: r[2] < 0.5 ? xVelAbs : -xVelAbs,
			yVel: r[3] < 0.5 ? yVelAbs : -yVelAbs,
			w: SQUARE_LENGTH / videoConfig.width,
			h: SQUARE_LENGTH / videoConfig.height,
			color: COLORS[Math.floor(r[4] * COLORS.length)],
			tOffset: Math.floor(r[5] * 1000)
		}
	})

	// const tempObjStates: ObjectState[] = Squishiverse_Vids.map((vid) => {
	// 	return {
	// 		source: vid,
	// 		x: Math.random(),
	// 		y: Math.random(),
	// 		xVel: Math.random() < 0.5 ? 0.002 : -0.002,
	// 		yVel: Math.random() < 0.5 ? 0.002 : -0.002,
	// 		w: SQUARE_LENGTH / videoConfig.width,
	// 		h: SQUARE_LENGTH / videoConfig.height,
	// 		color: COLORS[Math.floor(Math.random() * COLORS.length)],
	// 		tOffset: Math.floor(Math.random() * 1000)
	// 	}
	// })

	// ObjectStates = [...ObjectStates, ...tempObjStates]
}

/**
 * Run on every frame; updates the value of ObjectStates[]
 */
function update(videoConfig: VideoConfig, t: number) {

	ObjectStates.forEach((nft: ObjectState, ind, origArr) => {
		nft.w = sineBetween(SQUARE_LENGTH / (videoConfig.width * 2), SQUARE_LENGTH / videoConfig.width, t + nft.tOffset)
		nft.h = sineBetween(SQUARE_LENGTH / (videoConfig.height * 2), SQUARE_LENGTH / videoConfig.height, t + nft.tOffset)

		// Update the position based on velocity
		nft.x = nft.x + nft.xVel
		nft.y = nft.y + nft.yVel

		// If the image runs off the screen (all the way), move it to the other side
		// Right and left edges
		if (nft.x > 1) nft.x = 0 - nft.w
		if (nft.x + nft.w < 0) nft.x = 1
		// Top and bottom edges
		if (nft.y > 1) nft.y = 0 - nft.h
		if (nft.y + nft.h < 0) nft.y = 1

		// Update object in the rendered array
		origArr[ind] = nft
	})
}

// setup()

export const ProjectorRender: React.FC<{ /** props */ }> = () => {
	const frame = useCurrentFrame(); // Enable this line to force method to update every frame
	const videoConfig = useVideoConfig();
	// 			durationInFrames={150}
	// 			fps={30}
	// 			width={1920}
	// 			height={1080}

	useEffect(() => {
		setup(videoConfig)
	}, [videoConfig]) // Only re-runs if videoConfig changes (it won't)

	update(videoConfig, frame) // Call updatd every time ProjectorRender is rendered (every frame)


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


/**
 * 
 * 
 * Right now images pop up randomly around the page. Their x-y coordinates are 
 * passed in randomly by the setup function.
 * I want the setup function to have the video width and length
 * So I'm passing it in via hook
 * 
 * 
 * 
 */