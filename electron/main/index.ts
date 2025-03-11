import { app, BrowserWindow, shell, ipcMain, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { buildCustomMenu } from "./menu";
import * as fs from "node:fs";
import * as yaml from "js-yaml";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");
console.log(process.env);

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
	? path.join(process.env.APP_ROOT, "public")
	: RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
	win = new BrowserWindow({
		title: "Main window",
		icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
		webPreferences: {
			preload,
		},
	});

	// 自定义Menu
	const menu = buildCustomMenu();
	Menu.setApplicationMenu(menu);

	if (VITE_DEV_SERVER_URL) {
		// #298
		win.loadURL(VITE_DEV_SERVER_URL);
		// Open devTool if the app is not packaged
		win.webContents.openDevTools();
	} else {
		win.loadFile(indexHtml);
	}

	// Test actively push message to the Electron-Renderer
	win.webContents.on("did-finish-load", () => {
		win?.webContents.send(
			"main-process-message",
			new Date().toLocaleString()
		);
	});

	// Make all links open with the browser, not with the application
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("https:")) shell.openExternal(url);
		return { action: "deny" };
	});
	// win.webContents.on('will-navigate', (event, url) => { }) #344
}

function getConfigPath() {
	// 开发环境
	if (import.meta.env.DEV === "development") {
		return path.join(process.cwd(), "resources", "config.yaml");
	}
	// 生产环境
	return path.join(process.resourcesPath, "config.yaml");
}

// 读取YAML文件
function loadGamesConfig() {
	const configPath = getConfigPath();
	console.log("Current directory:", __dirname);
	console.log("Attempting to read file at :", configPath);
	try {
		const configFile = fs.readFileSync(
			path.join(__dirname, "config.yaml"),
			"utf8"
		);
		const config = yaml.load(configFile);
		return config.games;
	} catch (e) {
		console.error("Error reading games config:", e);
		return [
			{
				gameId: 1,
				displayName: "默认游戏",
			},
		];
	}
}

app.whenReady().then(() => {
	createWindow();

	ipcMain.handle("get-games", async () => {
		return loadGamesConfig();
	});
});

app.on("window-all-closed", () => {
	win = null;
	if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
	if (win) {
		// Focus on the main window if the user tried to open another
		if (win.isMinimized()) win.restore();
		win.focus();
	}
});

app.on("activate", () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		createWindow();
	}
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
	const childWindow = new BrowserWindow({
		webPreferences: {
			preload,
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (VITE_DEV_SERVER_URL) {
		childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
	} else {
		childWindow.loadFile(indexHtml, { hash: arg });
	}
});
