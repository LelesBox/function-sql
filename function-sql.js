var query = function () {
  function _query () {
    this.data = null
    this._where = []
    this._select = null
    this._groupBy = null
    this._having = null
    this._orderBy = null
  }
  _query.prototype.select = select
  _query.prototype.from = from
  _query.prototype.where = where
  _query.prototype.orderBy = orderBy
  _query.prototype.groupBy = groupBy
  _query.prototype.having = having
  _query.prototype.execute = execute
  _query
  return new _query()
}

function select (fn) {
  if (this._select !== null) {
    throw new Error('Duplicate SELECT')
  }
  this._select = fn
  return this
}

function from (...datasource) {
  if (this.data !== null) {
    throw new Error('Duplicate FROM')
  }
  this.data = fulljoin(...datasource)
  return this
}

function where (...fn) {
  this._where.push(fn)
  return this
}

function orderBy (fn) {
  if (this._orderBy !== null) throw new Error('Duplicate ORDERBY')
  this._orderBy = fn
  return this
}

function groupBy (...fn) {
  if (this._groupBy !== null) throw new Error('Duplicate GROUPBY')
  this._groupBy = fn
  return this
}

function having (...fn) {
  this._having = fn
  return this
}

function execute () {
  this.data = this.data || []
  if (this._where.length > 0) {
    for (let i = 0, l = this._where.length; i < l; i++) {
      this.data = this.data.filter(p => {
        return this._where[i].some(w => {
          return w(p)
        })
      })
    }
  }
  if (this._groupBy) {
    var firstGroupby = this._groupBy.shift()
    this.data = arrToObj(this.data, firstGroupby)
    this._groupBy.forEach(groupby => {
      findArrOnObj(this.data, groupby)
    })
    this.data = objToArr(this.data)
    if (this._having) {
      this.data = this.data.filter(item => {
        return this._having.some(having => {
          return having(item)
        })
      })
    }
  }
  if (this._orderBy) {
    this.data.sort(this._orderBy)
  }
  if (this._select) {
    this.data = this.data.map(p => this._select(p))
  }
  return this.data
}

function fulljoin (...arr) {
  var result = []
  if (arr.length === 1) {
    result = [...arr[0]]
  } else {
    for (let i = 0, l = arr[0].length; i < l; i++) {
      for (let j = 0, ll = arr[1].length; j < ll; j++) {
        result.push([arr[0][i], arr[1][j]])
      }
    }
    for (let i = 2, l = arr.length; i < l; i++) {
      let res = []
      for (let j = 0, ll = result.length; j < ll; j++) {
        for (let k = 0, lll = arr[i].length; k < lll; k++) {
          res.push([...result[j], arr[i][k]])
        }
      }
      result = res
    }
  }
  return result
}

function findArrOnObj (obj, fn) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (isObject(obj[key])) {
        findArrOnObj(obj[key], fn)
      } else if (isArray(obj[key])) {
        obj[key] = arrToObj(obj[key], fn)
      }
    }
  }
}

function arrToObj (arr, fn) {
  return arr.reduce((previous, current) => {
    var name = fn(current)
    if (!previous[name]) previous[name] = []
    previous[name].push(current)
    return previous
  }, {})
}

function objToArr (obj) {
  var arr = []
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var _arr = []
      if (key.match(/\d/g)) {
        _arr.push(Number(key))
      } else {
        _arr.push(key)
      }
      if (isObject(obj[key])) {
        _arr.push(objToArr(obj[key]))
      } else {
        _arr.push(obj[key])
      }
      arr.push(_arr)
    }
  }
  return arr
}

function isArray (arr) {
  return Array.isArray(arr) || toString.call(arr) === '[object Array]'
}

function isObject (obj) {
  return toString.call(obj) === '[object Object]'
}

// var g = {
//   odd: [1, 2, 3, 4, 5],
//   even: [2, 4, 6, 7]
// }
// var gg = {
//   odd: {
//     divisible: [1, 2],
//     prime: [2, 3]
//   },
//   even: {
//     prime: [1, 23, 3],
//     divisible: [1, 2]
//   }
// }

module.exports = exports = query
