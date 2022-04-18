import React, {FC} from 'react';
import { Box, Text, useInput, useApp } from "ink";
import useStdoutDimensions from "ink-use-stdout-dimensions";

import StatusBar from "./components/StatusBar";

const App: FC<{name?: string}> = ({name = 'Stranger'}) => {
	const inkApp = useApp();

	useInput((input, key) => {
		if (key.escape) {
			inkApp.exit();
		}
	});

	const [columns, rows] = useStdoutDimensions();
	return (
		<Box width={columns} height={rows} flexDirection="column">
			<Box flexGrow={1} padding={1}>
				<Text>
					Hello, <Text color="green">{name}</Text>
				</Text>
			</Box>
			<StatusBar />
		</Box>
	);
}

module.exports = App;
export default App;
