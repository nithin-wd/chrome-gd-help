import { Input, message, Radio, Select, Tooltip } from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { IoSettings, IoCloseCircleOutline } from "react-icons/io5";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function App() {
	function cn(...inputs) {
		return twMerge(clsx(inputs));
	}

	const [messageApi, contextHolder] = message.useMessage();
	const [mode, setMode] = useState("task");
	const [projectInput, setProjectInput] = useState("");
	const [taskInput, setTaskInput] = useState("");
	const [showSettings, setShowSettings] = useState(false);
	const taskTypeInLocal = JSON.parse(localStorage.getItem("taskType") ?? '["common"]');
	const [taskTypes, setTaskTypes] = useState(taskTypeInLocal);

	const handleSelectTaskType = e => {
		localStorage.setItem("taskType", JSON.stringify(e));
		console.log(e);
		setTaskTypes(e);
	};
	const showableTask = useMemo(() => {
		function convertData(data) {
			const teams = {};

			// Iterate through each item in the data array
			data.forEach(item => {
				// Check if the team exists in the teams object
				if (!teams[item.team]) {
					// If the team doesn't exist, create it and initialize an empty array for its data
					teams[item.team] = { team: item.team, className: "", data: [] };
				}
				// Set the className property for the team if it's empty
				if (teams[item.team].className === "") {
					teams[item.team].className = item.className;
				}
				// Push the item's data to the corresponding team's data array
				teams[item.team].data.push({
					name: item.name,
					className: item.className,
					code: item.code
				});
			});

			// Convert the teams object to an array of team objects
			const result = Object.values(teams);

			return result;
		}
		const tasks = [
			{
				type: "coverage",
				data: [
					{ name: "Campaign Report", team: "Coverage", className: "text-green-500", code: "crep" },
					{ name: "Campaign Analysis", team: "Coverage", className: "text-green-500", code: "caan" },
					{ name: "Campaign Setup", team: "Coverage", className: "text-green-500", code: "case" },
					{ name: "Campaign Plan", team: "Coverage", className: "text-green-500", code: "capl" },
					{ name: "Campaign Review", team: "Coverage", className: "text-green-500", code: "care" },
					{ name: "Social Media Management", team: "Coverage", className: "text-green-500", code: "smm" },
					{ name: "Budget Management", team: "Coverage", className: "text-green-500", code: "bm" },
					{ name: "Report setup", team: "Coverage", className: "text-green-500", code: "rese" }
				]
			},
			{
				type: "conversion",
				data: [
					{ name: "On request report ", team: "Conversion", className: "text-blue-500", code: "orr" },
					{ name: "On request report internal", team: "Conversion", className: "text-blue-500", code: "orri" },
					{ name: "On request report external", team: "Conversion", className: "text-blue-500", code: "orre" },
					{ name: "Scheduled report", team: "Conversion", className: "text-blue-500", code: "scre" },
					{ name: "Data research & production", team: "Conversion", className: "text-blue-500", code: "drpr" },
					{ name: "GR Production", team: "Conversion", className: "text-blue-500", code: "grpr" },
					{ name: "Retention plan", team: "Conversion", className: "text-blue-500", code: "repl" },
					{ name: "Retention setup", team: "Conversion", className: "text-blue-500", code: "rese" },
					{ name: "Retention review", team: "Conversion", className: "text-blue-500", code: "rere" },
					{ name: "Conversion tracking", team: "Conversion", className: "text-blue-500", code: "cotr" },
					{ name: "Landing page development", team: "Conversion", className: "text-blue-500", code: "lpde" },
					{ name: "Client tech support", team: "Conversion", className: "text-blue-500", code: "clts" },
					{ name: "Documentation", team: "Conversion", className: "text-blue-500", code: "docu" },
					{ name: "Research", team: "Conversion", className: "text-blue-500", code: "rsch" },
					{ name: "General Meeting", team: "Conversion", className: "text-blue-500", code: "geme" },
					{ name: "Guidance", team: "Conversion", className: "text-blue-500", code: "guid" },
					{ name: "Lead form integration", team: "Conversion", className: "text-blue-500", code: "lfin" },
					{ name: "Creative production", team: "Conversion", className: "text-blue-500", code: "crpr" },
					{ name: "SEO support", team: "Conversion", className: "text-blue-500", code: "seos" },
					{ name: "Technology Audit", team: "Conversion", className: "text-blue-500", code: "teca" },
					{ name: "Misc", team: "Conversion", className: "text-blue-500", code: "misc" }
				]
			},
			{
				type: "com",
				data: [
					{ name: "Briefing", team: "Communication", className: "text-pink-500", code: "cobr" },
					{ name: "Content Creation", team: "Communication", className: "text-pink-500", code: "cocr" },
					{ name: "Image Production", team: "Communication", className: "text-pink-500", code: "impr" },
					{ name: "UGC Production", team: "Communication", className: "text-pink-500", code: "ugpr" },
					{ name: "Video Production", team: "Communication", className: "text-pink-500", code: "vipr" },
					{ name: "Client Approval", team: "Communication", className: "text-pink-500", code: "clap" },
					{ name: "Review", team: "Communication", className: "text-pink-500", code: "core" },
					{ name: "Internal Content [NR]", team: "Communication", className: "text-pink-500", code: "cone" },
					{ name: "Internal Image [NR]", team: "Communication", className: "text-pink-500", code: "imne" },
					{ name: "Internal Video [NR]", team: "Communication", className: "text-pink-500", code: "vine" },
					{ name: "Internal Content [CR]", team: "Communication", className: "text-pink-500", code: "icocr" },
					{ name: "Internal Image [CR]", team: "Communication", className: "text-pink-500", code: "imcr" },
					{ name: "Internal Video [CR]", team: "Communication", className: "text-pink-500", code: "vicr" },
					{ name: "Internal UGC [CR]", team: "Communication", className: "text-pink-500", code: "ugcr" },
					{ name: "External Content [NR]", team: "Communication", className: "text-pink-500", code: "xcone" },
					{ name: "External Image [NR]", team: "Communication", className: "text-pink-500", code: "ximne" },
					{ name: "External Video [NR]", team: "Communication", className: "text-pink-500", code: "xvine" },
					{ name: "External Content [CR]", team: "Communication", className: "text-pink-500", code: "xcocr" },
					{ name: "External Image [CR]", team: "Communication", className: "text-pink-500", code: "ximcr" },
					{ name: "External Video [CR]", team: "Communication", className: "text-pink-500", code: "xvicr" },
					{ name: "External UGC [CR]", team: "Communication", className: "text-pink-500", code: "xugcr" },
					{ name: "Vendor Management", team: "Communication", className: "text-pink-500", code: "vm" }
				]
			},
			{
				type: "pm",
				data: [
					{ name: "Project coordination", team: "Project Management", className: "text-yellow-500", code: "wdpc" },
					{ name: "Team work load & Task management", team: "Project Management", className: "text-yellow-500", code: "wdtm" },
					{ name: "Good day housekeeping", team: "Project Management", className: "text-yellow-500", code: "gdhk" },
					{ name: "Client approvals / activity", team: "Project Management", className: "text-yellow-500", code: "clap" }
				]
			},
			{
				type: "common",
				data: [
					{ name: "Internal meetings", team: "Common", className: "text-purple-500", code: "inme" },
					{ name: "HR Activities", team: "Common", className: "text-purple-500", code: "hrac" },
					{ name: "Learning & research", team: "Common", className: "text-purple-500", code: "lnr" },
					{ name: "Client meetings", team: "Common", className: "text-purple-500", code: "clme" },
					{ name: "CRM Activity", team: "Common", className: "text-purple-500", code: "crac" }
				]
			}
		];
		const selectedTasks = tasks
			.filter(task => taskTypes.includes(task.type))
			?.map(task => task?.data)
			?.flat();
		if (taskInput === "") return convertData(selectedTasks);
		return convertData(
			selectedTasks.filter(pj => pj.name.toLowerCase().includes(taskInput.toLowerCase()) || pj.code.toLowerCase().includes(taskInput.toLowerCase()))
		);
	}, [taskTypes, taskInput]);
	const handleModeChange = e => {
		setMode(e.target.value);
	};
	const filteredProjects = useMemo(() => {
		const projects = [
			{ name: "Canny Life Space", code: "CLS" },
			{ name: "Confident Group Kottayam", code: "CGKTYM" },
			{ name: "Confident Group Kochi", code: "CGK" },
			{ name: "Confident Group Kozhikode", code: "CGCLT" },
			{ name: "Confident Group Thrissur", code: "CGTHR" },
			{ name: "Confident Group Trivandrum", code: "CGTVM" },
			{ name: "Confident Group UAE", code: "CGUAE" },
			{ name: "Confident Group General", code: `CG-${dayjs().format("MMMM").toUpperCase()}` },
			{ name: "English Channel", code: "EC" },
			{ name: "Fair Future", code: "FF" },
			{ name: "Fortune Study Abroad", code: "FSA" },
			{ name: "Fortune Tours", code: "FT" },
			{ name: "Matglober", code: "MTG" },
			{ name: "Victoria Realtors", code: "VR" },
			{ name: "Webdura", code: "WD" },
			{ name: "Webdura Internal Processes", code: "WDPR" },
			{ name: "Asianet News", code: "ASNT" },
			{ name: "D2R Interiors", code: "D2R" },
			{ name: "Speed Infra", code: "SI" }
		];
		if (projectInput === "") return projects;
		return projects.filter(pj => pj.name.toLowerCase().includes(projectInput.toLowerCase()) || pj.code.toLowerCase().includes(projectInput.toLowerCase()));
	}, [projectInput]);

	return (
		// <div className="w-screen h-screen flex justify-center items-center">
		<main className="w-[350px] h-[600px] p-2 shadow-lg border relative">
			{contextHolder}
			{showSettings ? (
				<div>
					<div className="absolute right-3 top-3">
						<IoCloseCircleOutline size={20} className="cursor-pointer" onClick={() => setShowSettings(false)} />
					</div>
					<div className="flex justify-center py-4 text-[20px] select-none">Settings</div>
					<div className="w-full">
						<label>Select Task types</label>
						<Select
							className="w-full"
							mode="multiple"
							allowClear
							onChange={handleSelectTaskType}
							value={taskTypes}
							defaultValue={["common"]}
							options={[
								{ label: "Conversion", value: "conversion" },
								{ label: "Communication", value: "com" },
								{ label: "Coverage", value: "coverage" },
								{ label: "Project Management", value: "pm" },
								{ label: "Common", value: "common" }
							]}
							maxTagCount="responsive"
							maxTagPlaceholder={omittedValues => (
								<Tooltip title={omittedValues.map(({ label }) => label).join(", ")}>
									<span>{`+${omittedValues?.length} more`}</span>
								</Tooltip>
							)}
						/>
					</div>
				</div>
			) : (
				<div className="h-full">
					<div className="absolute right-3 top-3">
						<IoSettings size={20} className="cursor-pointer" onClick={() => setShowSettings(true)} />
					</div>
					<div className="flex justify-center py-4 text-[20px] select-none">Goodday Helper</div>
					<div className="w-full">
						<div className="flex w-full justify-evenly items-center">
							<Radio.Group
								className="grid grid-cols-2 w-full"
								onChange={handleModeChange}
								value={mode}
								style={{
									marginBottom: 8
								}}
							>
								<Radio.Button value="task" className="text-center">
									Task Codes
								</Radio.Button>
								<Radio.Button value="projects" className="text-center">
									Project Codes
								</Radio.Button>
							</Radio.Group>
						</div>

						<div className="h-[480px]">
							<div className="h-[30px]">
								{mode === "projects" ? (
									<div className="flex flex-col gap-y-[10px]">
										<Input placeholder="Search for project code" onChange={e => setProjectInput(e.target.value)} value={projectInput} allowClear />

										<div className="h-[440px] bg-white rounded">
											<div className="h-[40px] flex justify-between text-[14px] font-[500] items-center border py-2 px-3">
												<span>Name</span>
												<span>Code</span>
											</div>
											<div className="h-[400px] overflow-y-auto py-2 px-3 flex flex-col gap-y-2">
												{filteredProjects?.map(p => (
													<div className="flex justify-between items-center" key={p.code}>
														<span className="text-[12px]">{p.name}</span>
														<CopyToClipboard text={p.code} onCopy={() => messageApi.info(`${p.code} copied to clipboard`)}>
															<Tooltip title={`Click to copy ${p.code}`} placement="left">
																<span className="border rounded px-2 py-1 cursor-context-menu select-none hover:border-blue-400 hover:text-blue-400">
																	{p.code}
																</span>
															</Tooltip>
														</CopyToClipboard>
													</div>
												))}
											</div>
										</div>
									</div>
								) : (
									<div className="flex flex-col gap-y-[10px]">
										<Input placeholder="Search for task code" onChange={e => setTaskInput(e.target.value)} value={taskInput} allowClear />
										<div className="h-[440px] bg-white rounded">
											<div className="h-[40px] flex justify-between text-[14px] font-[500] items-center border py-2 px-3">
												<span>Name</span>
												<span>Code</span>
											</div>
											<div className="h-[400px] overflow-y-auto py-2 px-3 flex flex-col gap-y-2">
												{showableTask?.map(item => (
													<div key={item?.team}>
														<span className={cn("text-[12px] font-[900] leading-[12px] rounded-md", item.className)}>{item?.team}</span>
														<div className="py-2 px-3 flex flex-col gap-y-2">
															{item?.data?.map(p => (
																<div className="flex justify-between items-center" key={p.code}>
																	<span className="flex items-center gap-x-1">
																		<span className="text-[12px] leading-[12px]">{p.name}</span>
																	</span>
																	<CopyToClipboard text={p.code} onCopy={() => messageApi.info(`${p.code} copied to clipboard`)}>
																		<Tooltip title={`Click to copy ${p.code}`} placement="left">
																			<span className="border rounded px-2 py-1 cursor-context-menu select-none hover:border-blue-400 hover:text-blue-400">
																				{p.code}
																			</span>
																		</Tooltip>
																	</CopyToClipboard>
																</div>
															))}
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
		// </div>
	);
}

export default App;

