let exists = x => typeof x !== 'undefined' && x != null
let isStr = x => typeof x === 'string'
let isBool = x => typeof x === 'boolean'
let isArr = x => Array.isArray(x)
let isObj = x => typeof x === 'object' && !isArr(x)
let isNum = x => !isNaN(x) && parseFloat(x) === x
let isInt = x => isNum(x) && parseInt(x) === parseFloat(x)

let loopUpTo = (max, fn) => {
    for (let i = 0; i < max; i++) {
        fn(i)
    }
}

let loopKeys = (obj, fn) => {
    Object.keys(obj).forEach(key => {
        let value = obj[key]
        fn(key, value)
    })
}

let uniqueList = list => {
    if (!isArr(list)) return []
    let newList = []
    list.forEach(item => {
        if (!newList.includes(item)) newList.push(item)
    })
    return newList
}

let reorderList = (list, sourceId, insertId) => {
    insertId = Math.min(Math.max(0, insertId), list.length)
    let itemToMove = list[sourceId]

    if (insertId === 0) {
        let beforeItems = list.slice(0, sourceId)
        let afterItems = list.slice(sourceId + 1)
        return [itemToMove]
            .concat(beforeItems)
            .concat(afterItems)

    } else if (insertId < sourceId) {
        let beforeItems = list.slice(0, insertId)
        let middleItems = list.slice(insertId, sourceId)
        let afterItems = list.slice(sourceId + 1)
        return beforeItems
            .concat([itemToMove])
            .concat(middleItems)
            .concat(afterItems)

    } else if (sourceId < insertId) {
        let beforeItems = list.slice(0, sourceId)
        let middleItems = list.slice(sourceId + 1, insertId)
        let afterItems = list.slice(insertId)
        return beforeItems
            .concat(middleItems)
            .concat([itemToMove])
            .concat(afterItems)
            
    } else {
        return list
    }
}

let randomInt = (min, max) => {
    return min + Math.floor(Math.random() * (max - min))
}

let randomItem = list => {
    let index = randomInt(0, list.length)
    return list[index]
}

let shuffle = list => {
    let newList = list.slice()
    for (let i = 0; i < newList.length; i++) {
        let j = ~~(Math.random() * (i + 1))
        let temp = newList[i]
        newList[i] = newList[j]
        newList[j] = temp
    }
    return newList
}

let clone = (value) => {
    if (isObj(value)) {
        return merge({}, value)
    } else if (isArr(value)) {
        return merge([], value)
    } else {
        return value
    }
}

let mergeArray = (target, source) => {
    let array = target.slice()
    source.forEach((item, i) => {
        if (!exists(array[i])) {
            array[i] = clone(item)
        } else if (isObj(item) || isArr(item)) {
            array[i] = merge(target[i], item)
        } else if (target.indexOf(item) === -1) {
            array.push(clone(item))
        }
    })
    return array
}

let mergeObject = (target, source) => {
    let obj = {}

    if (isObj(target) || isArr(target)) {
        loopKeys(target, key => {
            obj[key] = clone(target[key])
        })
    }

    if (!exists(source)) return obj

    loopKeys(source, key => {
        if ((isObj(source[key]) || isArr(source[key])) && exists(target[key])) {
            obj[key] = merge(target[key], source[key])
        } else {
            obj[key] = clone(source[key])
        }
    })

    return obj
}

let merge = (target, source) => {
    if (isArr(source)) {
        if (isArr(target)) {
            return mergeArray(target, source)
        } else {
            clone(source)
        }
    } else {
        return mergeObject(target, source)
    }
}

let deepSet = (source, path, value) => {
    if (isStr(path)) path = path.split('.')

    let target = clone(source)
    let obj = target
    path.forEach((key, i) => {
        if (!exists(obj[key])) {
            let nextKey = path[i + 1]
            if (!isInt(nextKey)) obj[key] = {}
            else obj[key] = []
        }
        if (i === path.length - 1) obj[key] = value
        else obj = obj[key]
    })
    return target
}

let deepEquals = (objA, objB) => {
    try {
        return JSON.stringify(objA) === JSON.stringify(objB)
    } catch(e) {
        return false
    }
}

let debounce = (fn, wait) => {
	let timeout
	return (...args) => {
		let later = () => {
            timeout = null
			if (fn) fn(...args)
		}
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
	}
}

let getFileData = (event, callback) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()

    reader.addEventListener(
        'load',
        () => callback(reader.result),
        false
    )

    reader.addEventListener(
        'error',
        () => callback()
    )

    reader.readAsText(file)
}

let gcd = (a, b) => {
    return !b ? a : gcd(b, a % b)
}

let lcm = (a, b) => {
    return (a * b) / gcd(a, b)
}