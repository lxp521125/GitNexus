// src/core/plugins/plugin-loader.ts

import * as fs from 'fs';
import * as path from 'path';
import { pluginManager } from './plugin-manager.js';
import { PluginLoadOptions } from './types.js';

/**
 * 插件配置
 */
export interface PluginsConfig {
  /** 插件列表 */
  plugins: PluginConfigEntry[];
}

/**
 * 插件加载配置项
 */
export interface PluginConfigEntry {
  /** 插件名称 */
  name: string;
  /** 是否启用 */
  enabled: boolean;
  /** 插件配置 */
  config?: Record<string, any>;
  /** 插件路径 */
  path?: string;
}

/**
 * 从配置文件加载插件
 */
export async function loadPluginsFromConfig(configPath?: string): Promise<void> {
  const configPaths = [
    configPath || path.join(process.cwd(), '.gitnexus', 'plugins.json'),
    path.join(require('os').homedir(), '.gitnexus', 'plugins.json')
  ];
  
  for (const path of configPaths) {
    if (fs.existsSync(path)) {
      await loadPluginsFromFile(path);
    }
  }
}

/**
 * 从文件加载插件配置
 */
async function loadPluginsFromFile(filePath: string): Promise<void> {
  try {
    const configContent = fs.readFileSync(filePath, 'utf8');
    const config: PluginsConfig = JSON.parse(configContent);
    
    if (Array.isArray(config.plugins)) {
      for (const pluginConfig of config.plugins) {
        await loadPluginFromConfig(pluginConfig);
      }
    }
  } catch (error) {
    console.error(`Failed to load plugins from ${filePath}:`, error);
  }
}

/**
 * 从配置加载插件
 */
async function loadPluginFromConfig(pluginConfig: PluginConfigEntry): Promise<void> {
  try {
    const { name, enabled = true, config = {}, path: pluginPath } = pluginConfig;
    
    let resolvedPath: string;
    if (pluginPath) {
      // 使用配置中指定的路径
      resolvedPath = path.isAbsolute(pluginPath) 
        ? pluginPath 
        : path.resolve(path.dirname(require.main?.filename || process.cwd()), pluginPath);
    } else {
      // 尝试从 node_modules 加载
      resolvedPath = name;
    }
    
    await pluginManager.loadPlugin({
      pluginPath: resolvedPath,
      config,
      enabled
    });
  } catch (error) {
    console.error(`Failed to load plugin ${pluginConfig.name}:`, error);
  }
}

/**
 * 保存插件配置
 */
export function savePluginsConfig(config: PluginsConfig, configPath?: string): void {
  const savePath = configPath || path.join(process.cwd(), '.gitnexus', 'plugins.json');
  
  // 确保目录存在
  const dir = path.dirname(savePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(savePath, JSON.stringify(config, null, 2));
}

/**
 * 获取插件配置
 */
export function getPluginsConfig(configPath?: string): PluginsConfig {
  const configPathToUse = configPath || path.join(process.cwd(), '.gitnexus', 'plugins.json');
  
  if (fs.existsSync(configPathToUse)) {
    const configContent = fs.readFileSync(configPathToUse, 'utf8');
    return JSON.parse(configContent);
  }
  
  return { plugins: [] };
}

/**
 * 添加插件到配置
 */
export function addPluginToConfig(pluginConfig: PluginConfigEntry, configPath?: string): void {
  const config = getPluginsConfig(configPath);
  
  // 检查是否已存在
  const existingIndex = config.plugins.findIndex(p => p.name === pluginConfig.name);
  if (existingIndex >= 0) {
    // 更新现有插件
    config.plugins[existingIndex] = pluginConfig;
  } else {
    // 添加新插件
    config.plugins.push(pluginConfig);
  }
  
  savePluginsConfig(config, configPath);
}

/**
 * 从配置中移除插件
 */
export function removePluginFromConfig(pluginName: string, configPath?: string): void {
  const config = getPluginsConfig(configPath);
  config.plugins = config.plugins.filter(p => p.name !== pluginName);
  savePluginsConfig(config, configPath);
}

/**
 * 启用插件
 */
export function enablePluginInConfig(pluginName: string, configPath?: string): void {
  const config = getPluginsConfig(configPath);
  const plugin = config.plugins.find(p => p.name === pluginName);
  if (plugin) {
    plugin.enabled = true;
    savePluginsConfig(config, configPath);
  }
}

/**
 * 禁用插件
 */
export function disablePluginInConfig(pluginName: string, configPath?: string): void {
  const config = getPluginsConfig(configPath);
  const plugin = config.plugins.find(p => p.name === pluginName);
  if (plugin) {
    plugin.enabled = false;
    savePluginsConfig(config, configPath);
  }
}