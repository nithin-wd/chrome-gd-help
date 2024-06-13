import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";



export const cn: any = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs));
};
