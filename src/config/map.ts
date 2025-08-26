/**
 * 地图配置文件
 * 支持高德地图API和模拟地图两种模式
 */

export const mapConfig = {
  // 高德地图配置
  amap: {
    // API密钥（需要从环境变量获取）
    apiKey: import.meta.env.VITE_AMAP_API_KEY || 'YOUR_AMAP_KEY',
    // API版本
    version: '2.0',
    // 默认中心点（济宁港坐标）
    defaultCenter: [116.5800, 35.3800],
    // 默认缩放级别
    defaultZoom: 12,
    // 地图样式
    mapStyle: 'amap://styles/normal',
    // 视图模式
    viewMode: '2D',
    // 地图特性
    features: ['bg', 'road', 'building', 'point'],
    // 插件列表
    plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.MapType']
  },
  
  // 模拟地图配置
  mock: {
    // 地图中心点（相对坐标）
    center: [50, 50],
    // 默认缩放级别
    zoom: 1,
    // 地图样式
    mapStyle: 'water',
    // 视图模式
    viewMode: '2D'
  }
}

/**
 * 获取高德地图配置
 */
export const getAmapConfig = () => {
  return mapConfig.amap
}

/**
 * 获取模拟地图配置
 */
export const getMockConfig = () => {
  return mapConfig.mock
}

/**
 * 获取地图配置（默认返回高德地图配置）
 */
export const getMapConfig = () => {
  return mapConfig.amap
}

/**
 * 检查高德地图API是否可用
 */
export const isAmapApiAvailable = (): boolean => {
  return typeof (window as any).AMap !== 'undefined'
}

/**
 * 检查模拟地图是否可用（始终可用）
 */
export const isMockMapAvailable = (): boolean => {
  return true
}

/**
 * 地图类型枚举
 */
export enum MapType {
  AMAP = 'amap',
  MOCK = 'mock'
}

/**
 * 默认地图类型
 */
export const defaultMapType = MapType.AMAP

/**
 * 检查配置是否有效
 */
export const validateConfig = () => {
  const errors: string[] = []
  
  // 检查高德地图配置
  if (!mapConfig.amap.apiKey || mapConfig.amap.apiKey === 'YOUR_AMAP_KEY') {
    errors.push('高德地图API密钥未配置，请设置VITE_AMAP_API_KEY环境变量')
  }
  
  if (!mapConfig.amap.defaultCenter || !Array.isArray(mapConfig.amap.defaultCenter)) {
    errors.push('高德地图默认中心点配置无效')
  }
  
  if (!mapConfig.amap.defaultZoom || typeof mapConfig.amap.defaultZoom !== 'number') {
    errors.push('高德地图默认缩放级别配置无效')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 获取高德地图API URL
 */
export const getAmapApiUrl = (): string => {
  const config = mapConfig.amap
  return `https://webapi.amap.com/maps?v=${config.version}&key=${config.apiKey}&plugin=${config.plugins.join(',')}`
}

/**
 * 获取地图样式选项
 */
export const getMapStyleOptions = () => {
  return [
    { value: 'amap://styles/normal', label: '标准地图' },
    { value: 'amap://styles/dark', label: '深色地图' },
    { value: 'amap://styles/light', label: '浅色地图' },
    { value: 'amap://styles/whitesmoke', label: '白烟地图' },
    { value: 'amap://styles/fresh', label: '清新地图' },
    { value: 'amap://styles/grey', label: '灰色地图' },
    { value: 'amap://styles/graffiti', label: '涂鸦地图' },
    { value: 'amap://styles/midnight', label: '午夜地图' },
    { value: 'amap://styles/blue', label: '蓝色地图' },
    { value: 'amap://styles/red', label: '红色地图' }
  ]
}

/**
 * 获取视图模式选项
 */
export const getViewModeOptions = () => {
  return [
    { value: '2D', label: '2D模式' },
    { value: '3D', label: '3D模式' }
  ]
}

/**
 * 获取缩放级别建议
 */
export const getZoomLevelSuggestions = () => {
  return [
    { level: 3, description: '世界视图' },
    { level: 6, description: '国家视图' },
    { level: 10, description: '省级视图' },
    { level: 12, description: '市级视图' },
    { level: 15, description: '区级视图' },
    { level: 18, description: '街道视图' },
    { level: 20, description: '建筑物视图' }
  ]
}

