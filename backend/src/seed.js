const Bean = require('./models/Bean')
const Brewing = require('./models/Brewing')
const UserSettings = require('./models/UserSettings')

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

async function seedIfEmpty() {
  const beanCount = await Bean.countDocuments({ deleted: { $ne: true } })
  if (beanCount > 0) return false

  const beans = await Bean.insertMany([
    {
      name: '埃塞俄比亚 耶加雪菲 科契尔',
      origin: 'ethiopia',
      variety: 'heirloom',
      process: 'washed',
      roastLevel: 'light',
      roastDate: daysAgo(12),
      weight: 200,
      remainingWeight: 120,
      finished: false,
      notes: '柠檬、茉莉花、佛手柑，甜感高，余韵悠长'
    },
    {
      name: '肯尼亚 AA 涅里',
      origin: 'kenya',
      variety: 'sl28',
      process: 'washed',
      roastLevel: 'medium',
      roastDate: daysAgo(8),
      weight: 200,
      remainingWeight: 180,
      finished: false,
      notes: '黑加仑、番茄、明亮的酸质，醇厚圆润'
    },
    {
      name: '哥伦比亚 慧兰 玫瑰花园',
      origin: 'colombia',
      variety: 'caturra',
      process: 'honey',
      roastLevel: 'medium',
      roastDate: daysAgo(5),
      weight: 200,
      remainingWeight: 195,
      finished: false,
      notes: '红酒、焦糖、坚果，平衡感佳'
    },
    {
      name: '巴西 喜拉多 自然日晒',
      origin: 'brazil',
      variety: 'mundo_novo',
      process: 'natural',
      roastLevel: 'dark',
      roastDate: daysAgo(30),
      weight: 200,
      remainingWeight: 0,
      finished: true,
      notes: '巧克力、坚果、低酸，经典意式豆'
    }
  ])

  await Brewing.insertMany([
    {
      beanId: beans[0]._id,
      beanName: beans[0].name,
      method: 'pour_over',
      params: { beanWeight: 15, waterWeight: 240, ratio: 16, grindSize: '中细', waterTemp: 90, totalTime: 140, brewer: 'V60' },
      rating: 4,
      tasteTags: ['floral', 'citrus', 'honey'],
      notes: '花香明显，酸度明亮，但甜感稍弱',
      improvementDir: 'sweeter',
      isFavorite: false
    },
    {
      beanId: beans[0]._id,
      beanName: beans[0].name,
      method: 'pour_over',
      params: { beanWeight: 15, waterWeight: 225, ratio: 15, grindSize: '中细', waterTemp: 92, totalTime: 150, brewer: 'V60' },
      rating: 5,
      tasteTags: ['floral', 'citrus', 'berry', 'honey'],
      notes: '完美！甜感提升，酸度柔和，余韵悠长',
      improvementDir: '',
      isFavorite: true
    },
    {
      beanId: beans[1]._id,
      beanName: beans[1].name,
      method: 'pour_over',
      params: { beanWeight: 15, waterWeight: 240, ratio: 16, grindSize: '中粗', waterTemp: 94, totalTime: 160, brewer: 'Kalita' },
      rating: 4,
      tasteTags: ['berry', 'wine', 'chocolate'],
      notes: '醇厚圆润，黑加仑明显，但稍显平淡',
      improvementDir: 'more_acidic',
      isFavorite: false
    },
    {
      beanId: beans[3]._id,
      beanName: beans[3].name,
      method: 'espresso',
      params: { beanWeight: 18, yieldWeight: 36, ratio: 2, grindSize: '细', waterTemp: 93, totalTime: 28, machine: '辣妈 Mini' },
      rating: 5,
      tasteTags: ['chocolate', 'nutty', 'caramel'],
      notes: '经典意式，油脂丰富，平衡',
      improvementDir: '',
      isFavorite: false
    }
  ])

  await UserSettings.create({
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: ''
  })

  return true
}

module.exports = { seedIfEmpty }
