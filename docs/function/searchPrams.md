```js

class MyURLSearchParams {
    /**
     * @params {string} init
     */
    constructor(init) {
        this.map = new Map();
        init = init[0] === '?' ? init.slice(1) : init;
        const paramArr = init.split('&') ?? [];
        //  console.log(paramStr);
        for (let i in paramArr) {
            const [key, value] = paramArr[i].split('=');
            const curArr = this.map.get(key) || [];
            this.map.set(key, [...curArr, String(value)]);
        }
    }

    /** 
     * @params {string} name
     * @params {any} value
     */
    append (name, value) {
        this.map.get(name).push(String(value));
    }

    /**
     * @params {string} name
     */
    delete (name) {
        this.map.delete(name);
    }

    /**
     * @returns {Iterator} 
     */
    * entries () {
        for (let [key, values] of this.map) {
            for (let value of values) {
                yield [key, value];
            }
        }
    }

    /**
     * @param {(value, key) => void} callback
     */
    forEach (callback) {
        for (let [key, values] of this.map) {
            for (let value of values) {
                callback(value, key);
            }
        }
    }

    /**
     * @param {string} name
     * returns the first value of the name
     */
    get (name) {
        return this.map.has(name) ? this.map.get(name)[0] : null;
    }

    /**
     * @param {string} name
     * @return {string[]}
     * returns the value list of the name
     */
    getAll (name) {
        return this.map.get(name) ?? [];
    }

    /**
     * @params {string} name
     * @return {boolean}
     */
    has (name) {
        return !!this.map.has(name);
    }

    /**
     * @return {Iterator}
     */
    keys () {
        return this.map.keys();
    }

    /**
     * @param {string} name
     * @param {any} value
     */
    set (name, value) {
        this.map.set(name, [String(value)]);
    }

    // sor all key/value pairs based on the keys
    sort () {
        this.map = new Map([...this.map.entries()].sort())
    }

    /**
     * @return {string}
     */
    toString () {
        let paramStr = '';
        for (let [key, values] of this.map) {
            for (let value of values) {
                paramStr += `${key}=${value}&`;
            }
        }
        return paramStr.slice(0, paramStr.length - 1);
    }

    /**
     * @return {Iterator} values
     */
    * values () {
        for (let [_, values] of this.map) {
            for (const value of values) {
                yield value
            }
        }
    }
}
const params = new MyURLSearchParams('?a=1&a=2&b=2')

params.getAll()
```