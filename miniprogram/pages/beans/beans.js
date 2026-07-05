const db = require('../../utils/db.js')
const { getList, add, update, remove } = db

Page({
  data: {
    beans: [],
    formVisible: false,
    editingBean: null
  },
  onShow() {
    this.loadBeans()
  },
  onPullDownRefresh() {
    this.loadBeans().then(() => wx.stopPullDownRefresh())
  },
  async loadBeans() {
    try {
      const beans = await getList(db.COLLECTIONS.BEANS)
      this.setData({ beans })
    } catch (e) {
      console.error('loadBeans', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  handleAdd() {
    this.setData({ editingBean: null, formVisible: true })
  },
  handleTap(e) {
    const id = e.currentTarget.dataset.id
    const bean = this.data.beans.find(b => b._id === id)
    if (bean) {
      this.setData({ editingBean: bean, formVisible: true })
    }
  },
  handleLongPress(e) {
    const id = e.currentTarget.dataset.id
    const bean = this.data.beans.find(b => b._id === id)
    if (!bean) return
    const itemList = ['编辑', '标记已喝完', '删除']
    if (bean.finished) {
      itemList[1] = '标记未喝完'
    }
    wx.showActionSheet({
      itemList,
      success: (res) => {
        if (res.tapIndex === 0) {
          this.setData({ editingBean: bean, formVisible: true })
        } else if (res.tapIndex === 1) {
          this.toggleFinished(bean)
        } else if (res.tapIndex === 2) {
          this.deleteBean(bean)
        }
      }
    })
  },
  async toggleFinished(bean) {
    try {
      await update(db.COLLECTIONS.BEANS, bean._id, {
        finished: !bean.finished,
        remainingWeight: !bean.finished ? 0 : (bean.remainingWeight || 0)
      })
      wx.showToast({ title: '已更新', icon: 'success' })
      this.loadBeans()
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },
  async deleteBean(bean) {
    const res = await new Promise(resolve => {
      wx.showModal({
        title: '确认删除',
        content: `删除「${bean.name}」？`,
        success: (r) => resolve(r.confirm)
      })
    })
    if (!res) return
    try {
      const brewings = await getList(db.COLLECTIONS.BREWINGS, { beanId: bean._id })
      if (brewings && brewings.length > 0) {
        await update(db.COLLECTIONS.BEANS, bean._id, { deleted: true })
        wx.showToast({ title: '已软删除（有关联记录）', icon: 'none' })
      } else {
        await remove(db.COLLECTIONS.BEANS, bean._id)
        wx.showToast({ title: '已删除', icon: 'success' })
      }
      this.loadBeans()
    } catch (e) {
      wx.showToast({ title: '删除失败', icon: 'none' })
    }
  },
  handleFormClose() {
    this.setData({ formVisible: false })
  },
  async handleFormSave(e) {
    const bean = e.detail.bean
    try {
      if (bean._id) {
        await update(db.COLLECTIONS.BEANS, bean._id, bean)
        wx.showToast({ title: '已更新', icon: 'success' })
      } else {
        await add(db.COLLECTIONS.BEANS, bean)
        wx.showToast({ title: '已添加', icon: 'success' })
      }
      this.setData({ formVisible: false })
      this.loadBeans()
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  }
})
