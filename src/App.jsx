import { Input, message, Radio, Select, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { IoSettings, IoCloseCircleOutline } from "react-icons/io5";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getData } from "./action";
import { FaRegCopyright } from "react-icons/fa";
const teams = [
	{ type: "coverage", name: "Coverage", className: "text-green-500" },
	{ type: "conversion", name: "Conversion", className: "text-blue-500" },
	{ type: "com", name: "Communication", className: "text-pink-500" },
	{ type: "pm", name: "Project Management", className: "text-yellow-500" },
	{ type: "common", name: "Common", className: "text-purple-500" }
];
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
	const recentsInLocal = JSON.parse(localStorage.getItem("frequently-used") ?? "{}");
	const recents = useMemo(() => recentsInLocal, [recentsInLocal]);
	const [taskTypes, setTaskTypes] = useState(taskTypeInLocal);
	const projectsInLocal = JSON.parse(localStorage.getItem("projects") ?? "[]");
	const [projects, setProjects] = useState(projectsInLocal);
	const tasksInLocal = JSON.parse(localStorage.getItem("tasks") ?? "[]");
	const [tasks, setTasks] = useState(tasksInLocal);

	const handleSelectTaskType = e => {
		localStorage.setItem("taskType", JSON.stringify(e));
		setTaskTypes(e);
	};
	const handleAddRecents = (p, team) => {
		const data = recents?.data ?? [];
		const existing = data?.find(d => d?.code === p?.code);
		const currentData = { ...p, count: (existing?.count ?? 0) + 1, team };
		const updatedData = data?.filter(d => d?.code !== p?.code);
		updatedData?.push(currentData);
		const updatedRecents = {
			type: "recent",
			data: updatedData.sort((a, b) => b?.count - a?.count)
		};
		localStorage.setItem("frequently-used", JSON.stringify(updatedRecents));
		messageApi.info(`${p.code} copied to clipboard`);
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

		const selectedTasks = tasks
			.filter(task => taskTypes.includes(task.type))
			?.map(task => task?.data)
			?.flat();
		if (taskInput === "") return convertData(selectedTasks);
		return convertData(
			selectedTasks.filter(pj => pj.name.toLowerCase().includes(taskInput.toLowerCase()) || pj.code.toLowerCase().includes(taskInput.toLowerCase()))
		);
	}, [taskTypes, taskInput, tasks]);
	const handleModeChange = e => {
		setMode(e.target.value);
	};
	const filteredProjects = useMemo(() => {
		if (projectInput === "") return projects;
		return projects.filter(pj => pj.name.toLowerCase().includes(projectInput.toLowerCase()) || pj.code.toLowerCase().includes(projectInput.toLowerCase()));
	}, [projectInput, projects]);
	const isWeb = import.meta.env.VITE_APP_MODE === "web";

	const fetchData = async () => {
		try {
			const res = await getData();

			const projectArray = res?.data?.projects?.map(project => ({
				name: project?.["Project Name"],
				code: project?.["Task Code"].includes("[MONTH]")
					? project?.["Task Code"].replace("[MONTH]", dayjs().format("MMMM").toUpperCase())
					: project?.["Task Code"]
			}));
			localStorage.setItem("projects", JSON.stringify(projectArray));
			setProjects(projectArray);

			const taskArray = teams.map(team => ({
				type: team?.type,
				data: res?.data?.tasks
					?.filter(task => task?.["Department Code"] === team?.type && task?.["Active/Inactive"].toLowerCase() === "active")
					?.map(task => ({ name: task?.["Task Category"], team: team?.name, className: "text-purple-500", code: task?.["Category Code"] }))
			}));
			localStorage.setItem("tasks", JSON.stringify(taskArray));

			setTasks(taskArray);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<div className={cn(isWeb ? "w-screen h-screen flex justify-center items-center" : "")}>
			<main className="w-[350px] h-[600px] p-2 shadow-lg border relative">
				{contextHolder}
				{showSettings ? (
					<div>
						<div className="absolute right-3 top-3">
							<IoCloseCircleOutline size={20} className="cursor-pointer" onClick={() => setShowSettings(false)} />
						</div>
						<div className="flex justify-center pb-4 text-[20px] select-none">Settings</div>
						<div className="flex justify-center text-[20px] select-none">Goodday Helper</div>
						<div className="h-[20px] flex items-center justify-center gap-[5px] text-[10px] font-[600]">{`Version: ${import.meta.env.PACKAGE_VERSION}`}</div>
						<div className="grid grid-rows-[auto_10px] h-[480px] mt-[5px]">
							<div className="w-full">
								<label className="">Select Task types</label>
								<Select
									className="w-full mt-[8px]"
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
							<div className="flex items-center text-[14px] justify-end gap-x-[5px]">
								<FaRegCopyright /> Webdura
							</div>
						</div>
					</div>
				) : (
					<div className="h-full">
						<div className="absolute right-3 top-3">
							<IoSettings size={20} className="cursor-pointer" onClick={() => setShowSettings(true)} />
						</div>
						<div className="flex justify-center pb-4 pt-0 text-[20px] select-none">Goodday Helper</div>
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
								{mode === "projects" ? (
									<div className="flex flex-col gap-y-[10px]">
										<Input
											placeholder="Search for project code"
											onChange={e => setProjectInput(e.target.value)}
											value={projectInput}
											allowClear
											className="h-[40px]"
										/>

										<div className="h-[430px] bg-white rounded">
											<div className="h-[40px] flex justify-between text-[14px] font-[500] items-center border py-2 px-3">
												<span>Name</span>
												<span>Code</span>
											</div>
											<div className="h-[390px] overflow-y-auto py-2 px-3 flex flex-col gap-y-2">
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
										<Input placeholder="Search for task code" onChange={e => setTaskInput(e.target.value)} value={taskInput} allowClear className="h-[40px]" />
										<div className="h-[430px] bg-white rounded">
											<div className="h-[40px] flex justify-between text-[14px] font-[500] items-center border py-2 px-3">
												<span>Name</span>
												<span>Code</span>
											</div>
											<div className="h-[390px] overflow-y-auto py-2 px-3 flex flex-col gap-y-2">
												{recents?.data?.length > 0 && (
													<div>
														<span className={cn("text-[12px] font-[900] leading-[12px] rounded-md text-red-500")}>Frequently Used</span>
														<div className="py-2 px-3 flex flex-col gap-y-2">
															{recents?.data?.slice(0, 5)?.map(p => (
																<div className="flex justify-between items-center" key={p.code}>
																	<span className="flex flex-col  gap-y-1">
																		<span className="text-[12px] leading-[12px]">{p.name}</span>
																		<span className={cn("text-[8px] leading-[8px] font-[700]", p?.className)}>{p.team}</span>
																	</span>
																	<CopyToClipboard text={p.code} onCopy={() => handleAddRecents(p, p.team)}>
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
												)}
												{showableTask?.map(item => (
													<div key={item?.team}>
														<span className={cn("text-[12px] font-[900] leading-[12px] rounded-md", item.className)}>{item?.team}</span>
														<div className="py-2 px-3 flex flex-col gap-y-2">
															{item?.data?.map(p => (
																<div className="flex justify-between items-center" key={p.code}>
																	<span className="flex items-center gap-x-1">
																		<span className="text-[12px] leading-[12px]">{p.name}</span>
																	</span>
																	<CopyToClipboard text={p.code} onCopy={() => handleAddRecents(p, item?.team)}>
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
						<div className="h-[20px] flex items-center justify-end pe-[10px] gap-[5px] text-[10px] font-[600]">
							<FaRegCopyright /> {`Version: ${import.meta.env.PACKAGE_VERSION}`}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;

