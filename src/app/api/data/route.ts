export const dynamic = "force-dynamic";
import { googleClient } from "@gd-helper/utils/googleClient";
import { cookies } from "next/headers";

export async function GET() {
	const cookieStore = cookies();
	const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID!;
	const GOOGLE_SHEET_PROJECT_NAME = process.env.GOOGLE_SHEET_PROJECT_NAME!;
	const GOOGLE_SHEET_TASK_NAME = process.env.GOOGLE_SHEET_TASK_NAME!;
	const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;

	try {
		let credentialsFromCookiesString: string = (await cookieStore.get("google_access_token")?.value) ?? "{}";
		let credentialsFromCookies: any = JSON.parse(credentialsFromCookiesString);

		let cookieHeader = "";
		const refreshToken = GOOGLE_REFRESH_TOKEN; // Replace with actual stored refresh token
		let accessToken = credentialsFromCookies?.access_token;
		const expiryDate = parseInt(credentialsFromCookies?.expiry_date) ?? 0; // Replace with actual stored expiry date

		if (!accessToken || googleClient.isTokenExpired(expiryDate)) {
			const credentials: any = await googleClient.refreshAccessToken(refreshToken);
			accessToken = credentials?.access_token;
			cookieHeader = `google_access_token=${JSON.stringify(credentials)}; Path=/; Expires=${new Date(
				credentials?.expiry_date
			).toUTCString()}; HttpOnly; SameSite=Strict`;
		}

		googleClient.auth.setCredentials({ access_token: accessToken });

		const spreadsheetId = GOOGLE_SHEET_ID;

		// getting project data
		const projectRange = `${GOOGLE_SHEET_PROJECT_NAME}!A:Z`;

		const projectRes = await googleClient.sheets.spreadsheets.values.get({
			spreadsheetId,
			range: projectRange
		});
		const projectRows = projectRes.data.values;

		const projectDataHeader: any[] = projectRows?.[0] ?? [];
		const projectDataBody: any[] = projectRows?.slice(1) ?? [];

		const projects = projectDataBody.map(dataEntry => {
			return projectDataHeader.reduce((acc, header, index) => {
				acc[header] = dataEntry[index];
				return acc;
			}, {});
		});
		// getting task data
		const taskRange = `${GOOGLE_SHEET_TASK_NAME}!A:Z`;

		const taskRes = await googleClient.sheets.spreadsheets.values.get({
			spreadsheetId,
			range: taskRange
		});
		const taskRows = taskRes.data.values;

		const taskDataHeader: any[] = taskRows?.[0] ?? [];
		const taskDataBody: any[] = taskRows?.slice(1) ?? [];

		const tasks = taskDataBody.map(dataEntry => {
			return taskDataHeader.reduce((acc, header, index) => {
				acc[header] = dataEntry[index];
				return acc;
			}, {});
		});

		return new Response(
			JSON.stringify({
				status: true,
				message: "success",
				data: { projects, tasks }
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Set-Cookie": cookieHeader
				}
			}
		);
	} catch (error: any) {
		console.log(error);
		return new Response(JSON.stringify({ error }), {
			status: 500,
			headers: {
				"Content-Type": "application/json"
			}
		});
	}
}
