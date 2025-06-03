export const FILE_ENDPOINTS = {
  UPLOAD: '/files/upload',
  DOWNLOAD: (key) => `/files/${key}`,
  DELETE: (key) => `/files/${key}`,
  GET_INFO: (key) => `/files/${key}/info`,
  GET_PRESIGNED_URL: (key) => `/files/${key}/presigned-url`,
  GET_UPLOAD_URL: '/files/upload-url'
}; 