import * as fs from "node:fs";
import * as yaml from "js-yaml";
import path from "node:path";

function getConfigPath() {
    // 开发环境
    if (import.meta.env.MODE === "development") {
        return path.join(process.cwd(), "resources", "config.yaml");
    }
    // 生产环境
    return path.join(process.resourcesPath, "config.yaml");
}

// 读取YAML文件
export function loadConfig() {
    const configPath = getConfigPath();
    try {
        const configFile = fs.readFileSync(
            configPath,
            "utf8"
        );
        const config = yaml.load(configFile);
        return config;
    } catch (e) {
        console.error("Error reading games config:", e);    
    }
}

