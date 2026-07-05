const db = wx.cloud.database()
const _ = db.command

const COLLECTIONS = {
  BEANS: 'beans',
  BREWINGS: 'brewings',
  USER_SETTINGS: 'user_settings'
}

function add(collection, data) {
  return db.collection(collection).add({
    data: {
      ...data,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  }).then(res => res._id)
}

function getList(collection, where = {}, orderBy = 'createdAt', desc = true) {
  let query = db.collection(collection)
  if (Object.keys(where).length > 0) {
    query = query.where(where)
  }
  query = query.orderBy(orderBy, desc ? 'desc' : 'asc')
  return query.get().then(res => res.data)
}

function getById(collection, id) {
  return db.collection(collection).doc(id).get().then(res => res.data)
}

function update(collection, id, data) {
  return db.collection(collection).doc(id).update({
    data: {
      ...data,
      updatedAt: db.serverDate()
    }
  })
}

function remove(collection, id) {
  return db.collection(collection).doc(id).remove()
}

function updateWhere(collection, where, data) {
  return db.collection(collection).where(where).update({
    data: {
      ...data,
      updatedAt: db.serverDate()
    }
  })
}

function removeWhere(collection, where) {
  return db.collection(collection).where(where).remove()
}

function getOne(collection, where = {}) {
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
