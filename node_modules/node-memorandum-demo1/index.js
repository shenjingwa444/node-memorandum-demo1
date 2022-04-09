const db = require("./db.js")
const inquirer = require("inquirer")
module.exports.add = async (title) => {
  //读取之前文件的任务
  const list = await db.read()
  //添加一个 title 任务
  list.push({title, done: false})
  //存储任务到文件
  await db.write(list)
}

module.exports.clear = async () => {
  await db.write([])
}

function askForCreateTask(list) {
  inquirer
    .prompt({
      type: "input",
      name: "title",
      message: "输入任务标题",
    })
    .then((answer) => {
      list.push(
        {
          title: answer.title,
          done: false,
        }
      )
      db.write(list).then(()=>{console.log("标题输入完成")},()=>{console.log("标题输入失败")})
    })
}

function markAsDone(list, index) {
  list[index].done = true
  db.write(list).then(()=>{console.log("已完成")},()=>{console.log("标记失败")})
}

function markAsUndone(list, index) {
  list[index].done = false
  db.write(list).then(()=>{console.log("未完成")},()=>{console.log("标记失败")})
}

function updateTitle(list, index) {
  inquirer
    .prompt({
      type: "input",
      name: "title",
      message: "请输入新标题",
      default: list[index].title
    })
    .then((answer2) => {
      list[index].title = answer2.title
      db.write(list).then(()=>{console.log("更新标题成功")},()=>{console.log("更新标题失败")})
    })
}

function remove(list, index) {
  list.splice(index, 1)
  db.write(list).then(()=>{console.log("删除成功")},()=>{console.log("删除失败")})
}

function askForAction(list, index) {
  const actions = {
    markAsDone,
    markAsUndone,
    updateTitle,
    remove
  }
  inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "请选择操作",
      choices: [
        {name: "退出", value: "quit"},
        {name: "已完成", value: "markAsDone"},
        {name: "未完成", value: "markAsUndone"},
        {name: "改标题", value: "updateTitle"},
        {name: "删除", value: "remove"},
      ]
    }
  ]).then((answer2) => {
    const action = actions[answer2.action]
    action && action(list, index)
  })
}

function printTasks(list) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "index",
        message: "请选择你的操作",
        //value 必须是字符串，如果是数字可能会报错
        choices: [{name: "退出", value: "-1"}, ...list.map((task, index) => {
          return {
            name: `${task.done ? "[x]" : "[_]"} ${index + 1} - ${task.title}`, value: index.toString()
          }
        }),
          {name: "+ 创建任务", value: "-2"}
        ]
      }
    ])
    .then((answer) => {
      const index = parseInt(answer.index)
      if (index >= 0) {
        askForAction(list, index)
      } else if (index === -2) {
        askForCreateTask(list)
      }
    })
}

module.exports.showAll = async () => {
  const list = await db.read()
  printTasks(list)
}

