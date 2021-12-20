import {
	chakra, useColorModeValue
} from '@chakra-ui/react';
import React, { ReactNode } from "react";
import { darkResizer, lightResizer } from "../../theme/consts";
import Nav from "./navbar";

const Scaffold = (props: { children: ReactNode, navChildren?: ReactNode }) => {

	return (
		<chakra.main display="flex" flexFlow="column" width="100%" height="100%" maxHeight="100%" overflow="hidden" sx={useColorModeValue(lightResizer, darkResizer)}>
			<Nav>
				{props.navChildren}
			</Nav>
			{props.children}
		</chakra.main>
	)
}

export default Scaffold