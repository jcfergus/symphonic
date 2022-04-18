import React from 'react';
import { render } from 'ink';
import App from "./ui";

export default class SymphonicInkUi {
	public ink: React.ReactElement;

	public create = () => {
		this.ink = <App name={"test"} />;
	}

	public run = () => {
		render(this.ink);
	}
}
