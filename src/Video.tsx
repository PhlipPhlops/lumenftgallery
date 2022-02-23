import {Composition} from 'remotion';
import { ProjectorRender } from './ProjectorRender';

export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Composition
				id="ProjectorRender"
				component={ProjectorRender}
				// durationInFrames={2 * 314}
				durationInFrames={2 * 31}
				fps={30}
				// Wall width are 1080H x 3000W
				// height={1080}
				// width={3000}
				height={2160}
				width={6000}
				defaultProps={{
						titleText: 'Welcome to Remotion',
						titleColor: 'black',
				}}
			/>
		</>
	);
};
