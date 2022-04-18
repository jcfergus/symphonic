import { Box, Spacer, Text } from "ink";
import React, { FC } from "react";

const StatusBar: FC = () => {
	const [ currentTime, setCurrentTime ] = React.useState<string>();

	const clockTimeInterval = setInterval(() => {
		setCurrentTime(new Date().toLocaleString());
	}, 1000);

	return (
		<Box padding={0} width="100%" height={1}>
			<Text color="#33AA33">
				Status Bar
			</Text>
			<Spacer />
			<Text color="#33AA33">
				{ currentTime }
			</Text>
		</Box>
	)
}

export default StatusBar;
