const COLLECTIONS = {
  BEANS: 'beans',
  BREWINGS: 'brewings',
  USER_SETTINGS: 'user_settings'
}

// 懒加载 db 实例：避免模块加载时同步调用 wx.cloud.database() 抛错导致整个页面空白
let _db = null
function getDb() {
  if (_db) return _db
  if (!wx.cloud) {
    throw new Error('当前基础库不支持云开发，请升级基础库至 2.2.3 以上')
  }
  _db = wx.cloud.database()
  return _db
}

function add(collection, data) {
  const db = getDb()
  return db.collection(collection).add({
    data: {
      ...data,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  }).then(res => res._id)
}

function getList(collection, where = {}, orderBy = 'createdAt', desc = true) {
  const db = getDb()
  let query = db.collection(collection)
  if (Object.keys(where).length > 0) {
    query = query.where(where)
  }
  query = query.orderBy(orderBy, desc ? 'desc' : 'asc')
  return query.get().then(res => res.data)
}

function getById(collection, id) {
  const db = getDb()
  return db.collection(collection).doc(id).get().then(res => res.data)
}

function update(collection, id, data) {
  const db = getDb()
  return db.collection(collection).doc(id).update({
    data: {
      ...data,
      updatedAt: db.serverDate()
    }
  })
}

function remove(collection, id) {
  const db = getDb()
  return db.collection(collection).doc(id).remove()
}

function updateWhere(collection, where, data) {
  const db = getDb()
  return db.collection(collection).where(where).update({
    data: {
      ...data,
      updatedAt: db.serverDate()
    }
  })
}

function removeWhere(collection, where) {
  const db = getDb()
  return db.collection(collection).where(where).remove()
}

function getOne(collection, where = {}) {
  const db = getDb()
  return db.collection(collection).where(where).limit(1).get().then(res => res.data[0])
}

module.exports = {
  COLLECTIONS,
  add,
  getList,
  getById,
  update,
  remove,
  updateWhere,
  removeWhere,
  getOne
}
