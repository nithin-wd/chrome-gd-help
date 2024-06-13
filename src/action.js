const baseURL = import.meta.env.VITE_API_BASE_URL;

export const getData = async () => {
	try {
		const myHeaders = new Headers();
		const requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow"
		};
		const response = await fetch(`${baseURL}/api/data`, requestOptions);
		if (!response.ok) throw new Error("failed to fetch data");
		const data = await response.json();
		return data;
	} catch (error) {
		console.log(error);
		throw error;
	}
};
