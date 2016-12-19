var query = function () {
    function _query () {
      this.data = []
      this._where = null
      this._select = null
      this._groupBy = null
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
  this._select = fn
  return this
}

function from (datasource) {
  this.data = datasource
  return this
}

function where (fn) {
  this._where = fn
  return this
}

function orderBy () {}

function groupBy (...fn) {
  this._groupBy = fn
  return this
}

function having () {}

function execute () {
  if (this._where) {
    this.data = this.data.filter(p => this._where(p))
  }
  if (this._select) {
    this.data = this.data.map(p => this._select(p))
  }
  if (this._groupBy) {
    // console.log(Array.isArray(this._groupBy))
    this._groupBy.forEach(groupby => {
      this.data = this.data.
    })
  }
  return this.data
}

function objToArr (obj) {
  var arr = []
  for (var key in obj) {
    if (obj.hasOwnPorperty(key)) {
      var _arr = []
      _arr.push(key)
      obj[key].forEach(n => {
        if (toString.call(n) === '[object Object]') {
          _arr.push(objToArr(n))
        } else {
          _arr.push(n)
        }
      })
    }
  }
}

var g = {
  odd: [1,2,3,4,5],
  even: [2,4,6,7]
}
var gg = {
  odd: {
    divisible: [1,2],
    prime: [2,3]
  },
  even: {
    prime: [1,23,3],
    divisible: [1,2]
  }
}

module.exports = exports = query
