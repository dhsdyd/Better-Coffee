export const ROAST_LEVELS = [
  { value: 'light', label: '浅烘' },
  { value: 'medium', label: '中烘' },
  { value: 'dark', label: '深烘' }
]

export const PROCESSES = [
  { value: 'washed', label: '水洗' },
  { value: 'natural', label: '日晒' },
  { value: 'honey', label: '蜜处理' },
  { value: 'anaerobic', label: '厌氧发酵' },
  { value: 'wet_hulled', label: '湿剥' },
  { value: 'carbonic_mac', label: '二氧化碳浸渍' }
]

export const ORIGINS = [
  { value: 'ethiopia', label: '埃塞俄比亚', region: 'africa' },
  { value: 'kenya', label: '肯尼亚', region: 'africa' },
  { value: 'rwanda', label: '卢旺达', region: 'africa' },
  { value: 'uganda', label: '乌干达', region: 'africa' },
  { value: 'tanzania', label: '坦桑尼亚', region: 'africa' },
  { value: 'yemen', label: '也门', region: 'africa' },
  { value: 'colombia', label: '哥伦比亚', region: 'south_america' },
  { value: 'brazil', label: '巴西', region: 'south_america' },
  { value: 'peru', label: '秘鲁', region: 'south_america' },
  { value: 'bolivia', label: '玻利维亚', region: 'south_america' },
  { value: 'ecuador', label: '厄瓜多尔', region: 'south_america' },
  { value: 'guatemala', label: '危地马拉', region: 'central_america' },
  { value: 'costa_rica', label: '哥斯达黎加', region: 'central_america' },
  { value: 'panama', label: '巴拿马', region: 'central_america' },
  { value: 'honduras', label: '洪都拉斯', region: 'central_america' },
  { value: 'nicaragua', label: '尼加拉瓜', region: 'central_america' },
  { value: 'salvador', label: '萨尔瓦多', region: 'central_america' },
  { value: 'mexico', label: '墨西哥', region: 'central_america' },
  { value: 'indonesia', label: '印度尼西亚', region: 'asia' },
  { value: 'vietnam', label: '越南', region: 'asia' },
  { value: 'yunnan', label: '云南', region: 'asia' },
  { value: 'taiwan', label: '台湾', region: 'asia' },
  { value: 'india', label: '印度', region: 'asia' },
  { value: 'thailand', label: '泰国', region: 'asia' },
  { value: 'laos', label: '老挝', region: 'asia' },
  { value: 'papua_new_guinea', label: '巴布亚新几内亚', region: 'oceania' },
  { value: 'hawaii', label: '夏威夷', region: 'oceania' },
  { value: 'australia', label: '澳大利亚', region: 'oceania' }
]

export const VARIETIES = [
  { value: 'typica', label: '铁皮卡' },
  { value: 'bourbon', label: '波旁' },
  { value: 'geisha', label: '瑰夏' },
  { value: 'caturra', label: '卡杜拉' },
  { value: 'catuai', label: '卡杜艾' },
  { value: 'mundo_novo', label: '蒙多诺沃' },
  { value: 'pacamara', label: '帕卡玛拉' },
  { value: 'sl28', label: 'SL28' },
  { value: 'sl34', label: 'SL34' },
  { value: 'heirloom', label: '传家宝' },
  { value: 'jember', label: 'Jember' },
  { value: 'tim_tim', label: 'Tim Tim' },
  { value: 'maragogype', label: '马拉戈日皮' }
]

export const IMPROVEMENT_DIRS = [
  { value: 'sweeter', label: '更甜' },
  { value: 'more_acidic', label: '更酸' },
  { value: 'less_bitter', label: '减苦' },
  { value: 'more_aroma', label: '香气更足' },
  { value: 'cleaner', label: '更干净' },
  { value: 'more_body', label: '醇厚更高' },
  { value: 'more_balanced', label: '更平衡' },
  { value: 'longer_aftertaste', label: '余韵更长' }
]

export const TASTE_TAGS = [
  { value: 'floral', label: '花香' },
  { value: 'fruity', label: '果香' },
  { value: 'berry', label: '浆果' },
  { value: 'citrus', label: '柑橘' },
  { value: 'chocolate', label: '巧克力' },
  { value: 'nutty', label: '坚果' },
  { value: 'caramel', label: '焦糖' },
  { value: 'honey', label: '蜂蜜' },
  { value: 'vanilla', label: '香草' },
  { value: 'spice', label: '香料' },
  { value: 'tea', label: '茶感' },
  { value: 'tobacco', label: '烟草' },
  { value: 'wine', label: '酒香' },
  { value: 'woody', label: '木质' },
  { value: 'smoky', label: '烟熏' },
  { value: 'earthy', label: '泥土' }
]

export const AI_PROVIDERS = [
  { value: 'deepseek', label: 'DeepSeek', defaultModel: 'deepseek-chat' },
  { value: 'qwen', label: '通义千问', defaultModel: 'qwen-turbo' },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o-mini' }
]

export const BREW_METHODS = [
  { value: 'pour_over', label: '手冲' },
  { value: 'espresso', label: '意式' }
]
