const Book = require('../models/Book')
const db = require('../db')
const _ = require('lodash')

function exists(book) {
  const { title, author, publisher } = book
  const sql = `select * from book where title='${title}' and 
  author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}

async function removeBook(book) {
  if (book) {
    book.reset()
    if (book.fileName) {
      const removeBookSql = `delete from book where fileName='${book.fileName}'`
      const removeContentSql = `delete from contents where fileName='${book.fileName}'`
      await db.querySql(removeBookSql)
      await db.querySql(removeContentSql)
    }
  }
}

async function insertContents(book) {
  const contents = book.getContents()
  if (contents && contents.length > 0) {
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i]
      const _content = _.pick(content, [
        'fileName',
        'id',
        'href',
        'text',
        'order',
        'level',
        'label',
        'pid',
        'navId'
      ])
      await db.insert(_content, 'contents')
    }
  }
}

function insertBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await exists(book)
        if (result) {
          await removeBook(book)
          reject(new Error('电子书已存在'))
        } else {
          await db.insert(book.toDb(), 'book')
          await insertContents(book)
          resolve()
        }
      } else {
        reject(new Error('添加的图书对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

function updateBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await getBook(book.fileName)
        if (result) {
          const model = book.toDb()
          if (+result.updateType === 0) {
            reject(new Error('内置图书不能编辑'))
          } else {
            await db.update(model, 'book', `where fileName='${book.fileName}'`)
            resolve()
          }
        }
      } else {
        reject(new Error('添加的图书对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

function getBook(fileName) {
  return new Promise(async (resolve, reject) => {
    const bookSql = `select * from book where fileName='${fileName}'`
    const contentsSql = `select * from contents where fileName='${fileName}'
    order by \`order\``
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentsSql)
    if (book) {
      book.cover = Book.genCoverUrl(book)
      book.contentsTree = Book.genContentsTree(contents)
      resolve(book)
    } else {
      reject(new Error('电子书不存在'))
    }
  })
}

async function getCategory() {
  const sql = 'select * from category order by category asc'
  const result = await db.querySql(sql)
  const categoryList = []
  result.forEach(item => {
    categoryList.push({
      label: item.categoryText,
      value: item.category,
      num: item.num
    })
  })
  return categoryList
}

async function listBook(query) {
  const { category, author, title, page = 1, pageSize = 20 } = query
  const offset = (page - 1) * pageSize
  let bookSql = 'select * from book'
  let where = 'where'
  title && (where = db.andLike(where, 'title', title))
  author && (where = db.andLike(where, 'author', author))
  category && (where = db.and(where, 'category', category))
  if (where !== 'where') {
    bookSql = `${bookSql} ${where}`
  }
  bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
  const list = await db.querySql(bookSql)
  return { list }
}

module.exports = {
  insertBook,
  getBook,
  updateBook,
  getCategory,
  listBook
}