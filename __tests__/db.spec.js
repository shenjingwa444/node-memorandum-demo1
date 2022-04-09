const db = require("../db.js")
const fs = require("fs")    //这是 node.js 的 fs 模块
jest.mock("fs")  //jest 接管了 fs 模块，后面的代码操作的额都是 mock 后的 fs ;

describe("db", () => {
  //mock 完了之后，要清除 mock ，否则测试用例之间会相互干扰；
  //afterEach() 会在每一次 it 之后都会执行 fs.clearMocks()；
  afterEach(()=>{
    fs.clearMocks()
  })
  it("can read", async () => {
    const data = [{title: "hi", done: true}]
    //因为 db.read 调用的是 fs.readFile
    //通过 fs.setReadFileMock 改写 fs.readFile
    //使得任何人访问 '/xxx' ，得到的内容都是一个数组的 JSON 序列化，fs 只能读取字符串
    fs.setReadFileMock("/xxx", null, JSON.stringify(data))
    const list = await db.read("/xxx")
    expect(list).toStrictEqual(data)
  })

//测试写文件时，因为单元测试是不能和外界打交道的，所以不能真的写文件
//而是在写文件时，不把它写到文件里面，而是写在变量里面。

  it("can write", async () => {
    let fakeFile
    fs.setWriteFileMock("/yyy", (path,data,callback) => {
      fakeFile = data
      callback(null)
    })
    const list = [{title:'写博客',done:false},{title:'做项目',done:false}]
    await db.write(list,'/yyy')
    expect(fakeFile).toBe(JSON.stringify(list)+'\n')
  })
})
