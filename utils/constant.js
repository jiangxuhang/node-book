const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ?
  'D:/nginx-1.17.8/upload/admin-upload-ebook' :
  '/root/upload/admin-upload-ebook'
const UPLOAD_URL = env === 'dev' ?
  'http://localhost:8089/admin-upload-ebook' :
  'http://localhost:8089/admin-upload-ebook'


module.exports = {
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  CODE_TOKEN_EXPIRED: -2,
  debug: true,
  PWD_SALT: 'admin_jxh_node',
  PRIVATE_KEY: 'admin_jxh_node_test',
  JWT_EXPIRED: 60 * 60, // token失效时间
  UPLOAD_PATH,
  UPLOAD_URL,
  MIME_TYPE_EPUB: 'application/epub+zip'
}