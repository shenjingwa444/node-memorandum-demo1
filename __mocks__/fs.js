const db = require("../db")
const fs = jest.createMockFromModule('fs');  //将 mock 出来的 fs 模块放在 fs 中
const _fs = jest.requireActual('fs')    // 将 node 的 fs 模块放在 _fs 中；


Object.assign(fs,_fs)  //将 _fs 复制到 fs ;
let readMocks = {}
fs.setReadFileMock = (path, error, data)=>{
  readMocks[path] = [error,data]
}

//fs.readFile(path,fn)  调用 fs.readFile 时，有可能只传了两个参数，需要判断下 callback === undefined；
//fs.readFile('xx',fn)
fs.readFile = (path,options,callback)=>{  //fs 的其它属性都是复制 _fs 的，只改写了 fs.readFile();
  if(callback === undefined) callback = options
  if(path in readMocks){
    callback(...readMocks[path])    //如果是 mock 的数据，就调用 mock[path] 的第一个参数 error 和第二个参数 data;
  }else{
    _fs.readFile(path,options,callback)    //如果不是 mock 的数据，就调用 node.js 的 fs.readFile()
  }
}

let writeMocks = {}
fs.setWriteFileMock = (path,fn)=>{
  writeMocks[path] = fn
}

fs.writeFile = (path,data,options,callback) =>{
  if(path in writeMocks){
    writeMocks[path](path,data,options,callback)
  }else{
    _fs.writeFile(path,data,options,callback)
  }
}

fs.clearMocks = ()=>{
  readMocks = {}
  writeMocks = {}
}

module.exports = fs;