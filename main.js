'user strict'

document.addEventListener('keydown', e => {
  if (/^[0-9]$|\./.test(e.key)) num(e.key)
  else if (/^\+|-|\*|\/$/.test(e.key)) ope(e.key)
  else if (e.key === 'Escape') clearAll()
  else if (e.key === 'Delete') cancel()
  else if (e.key === 'Backspace') backSpace()
  else if (e.key === '=') equ()
  else return
  setTimeout(() => {console.log(viewer)}, 0)
  setTimeout(() => {console.log(store.nums._q)}, 0)
  setTimeout(() => {console.log(store.opes._q)}, 0)
})

class Queue {
  constructor (length) {
    if (typeof length !== 'number') {
      throw new SyntaxError('Invalid or unexpected token')
    } else if (length <= 0) {
      throw new RangeError('Invalid queue length')
    }
    this._q = new Array(length || 0).fill('')
    Object.defineProperty(this, 'length', {
      value: length,
      writable: false
    })
  }

  get (index) {
    if (typeof index !== 'number') {
      throw new SyntaxError('Invalid or unexpected')
    } else if (index >= this.length || index < 0) {
      throw new RangeError('Invalid index')
    }
    return this._q[index]
  }

  // get indexOfLastVal () {
  //   const index = this._q.indexOf('')
  //   return (index !== -1 ? index : this.length) - 1
  // }

  // get lastVal () {
  //   const index = this.indexOfLastVal
  //   return this._q[index] || null
  // }

  // get lastIndexOfEmpty () {
  //   return this._q.lastIndexOf('')
  // }

  // get indexOfEmpty () {
  //   return this._q.indexOf('')
  // }
  // get enterableIndex () {
  //   const reversedIndex = this._q.slice().reverse().findIndex(ele => ele !== '')
  //   if (reversedIndex === -1) {
  //     return 0
  //   } else if (!reversedIndex){
  //     return -1
  //   } else {
  //     return this.length - reversedIndex
  //   }
  // }

  enqueue (val) {
    if (this._q.slice(-1)[0] === '') {
      this._q[this.length - 1] = val
      // this._q.splice(-1, 1, val)
    } else {
      this._q.splice(0, 1)
      this._q.push(val)
    }
  }

  dequeue (count = 1) {
    if (typeof count !== 'number') {
      throw new SyntaxError('Invalid or unexpected token')
    } else if (count < 1) {
      throw new RangeError('Invalid dequeue counts')
    }
    this._q.splice(0, count)
    this._q = count === 1 ? [...this._q, ''] : this._q.concat(new Array(count).fill(''))
  }
}

class Store {
  constructor () {
    this.nums = new Queue(2)
    this.opes = new Queue(2)
  }

  get num () {
    return this.nums.get(1)
  }

  set num (num) {
    this.nums.enqueue(num)
  }

  get ope () {
    return this.opes.get(1)
  }

  set ope(ope) {
    this.opes.enqueue(ope)
  }

  get formula () {
    return `${this.nums.get(0)}${this.ope}${this.nums.get(1)}`
  }

  get isCalculatable () {
    return this.nums._q.every(ele => !!ele) && this.ope
  }

  init () {
    this.nums.dequeue(this.length)
    this.opes.dequeue(this.length)
  }

  calc () {
    if (this.isCalculatable) {
      const answer = (new Function(`"use strict"; return ${this.formula}`))().toString()
      this.nums.enqueue(answer)
      this.opes.dequeue()
    } else {
      console.error("this formula is uncalclatable!")
    }
  }
}

class Viewer {
  constructor () {
    this._num = ''
    this._ope = ''
  }

  get num () {
    return this._num
  }

  set num (num) {
    if (!this._num) {
      if (num === '0') {
        this._num = ''
      } else if (num === '.') {
        this._num = '0.'
      } else {
        this._num = num
      }
    } else if (!this._num.includes('.') || num.slice(-1) !== '.') {
      this._num = num
    }
  }

  get ope () {
    return this._ope
  }

  set ope (ope) {
    this._ope = ope
  }

  get tmpFormulaBox () {
    return document.getElementById('tmpFormulaBox').innerText
  }

  set tmpFormulaBox (val) {
    document.getElementById('tmpFormulaBox').innerText= val
  }

  get answerBox () {
    return document.getElementById('answerBox').innerText
  }

  set answerBox (val) {
    document.getElementById('answerBox').innerText = val || '0'
  }
}

function num (inputNum) {
  // 確定した ope を store に送る
  if (viewer.ope) {
    store.ope = viewer.ope
    viewer.ope = ''
  }
  viewer.num += inputNum
  viewer.answerBox = viewer.num
}

function ope (inputOpe) {
  // ope が仮確定の場合か未確定の場合か
  if (viewer.ope) {
    viewer.tmpFormulaBox = viewer.tmpFormulaBox.slice(0, -1)
    viewer.tmpFormulaBox += inputOpe
  } else {
    viewer.tmpFormulaBox += (viewer.num || viewer.answerBox) + inputOpe
  }
  // num を store に送る
  store.num = viewer.num || viewer.answerBox
  viewer.num = ''

  if (store.isCalculatable) {
    store.calc()
    viewer.answerBox = store.num
  }
  viewer.ope = inputOpe
}

function equ () {
  // TODO
  if (store.num) {
    if (!store.ope) {
      store.ope = viewer.ope || store.opes.get(0)
      viewer.ope = ''
    }
    // num を store に送る
    store.num = viewer.num || store.nums.get(0) || viewer.answerBox
    viewer.num = ''
    store.calc()
    viewer.answerBox = store.num
    viewer.tmpFormulaBox = ''
  }
}

function clearAll () {
  store.init()
  viewer.num = ''
  viewer.ope = ''
  viewer.tmpFormulaBox = ''
  viewer.answerBox = ''
}

function cancel () {
  viewer.num = ''
  viewer.answerBox = viewer.num
}

function backSpace () {
  viewer.num = viewer.num.slice(0, -1)
  viewer.answerBox = viewer.num
}

function negate () {
  viewer.num = (Number(viewer.num) * -1).toString()
  viewer.answerBox = viewer.num
}

const store = new Store()
const viewer = new Viewer()
viewer.answerBox = ''
viewer.tmpFormulaBox = ''
