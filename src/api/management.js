import http from '../utils/http'

export const securityConfigApi = {
  get: () => http.get('/management/security-config'),
  update: (data) => http.put('/management/security-config', data)
}

export const managementResources = {
  'system-users': {
    list: (params) => http.post('/management/users/list', params),
    create: (data) => http.post('/management/user/create', data),
    get: (username) => http.post('/management/user/detail-by-username', { username }),
    getById: (id) => http.post('/management/user/detail', { id }),
    update: (username, data) => http.post('/management/user/update', { username, ...data }),
    remove: (id) => http.post('/management/user/delete', { id })
  },
  'system-roles': {
    list: () => http.get('/management/roles'),
    create: (data) => http.post('/management/roles', data),
    get: (id) => http.get(`/management/roles/${id}`),
    update: (id, data) => http.put(`/management/roles/${id}`, data),
    remove: (id) => http.delete(`/management/roles/${id}`)
  },
  'system-menus': {
    list: () => http.get('/management/menus'),
    create: (data) => http.post('/management/menus', data),
    remove: (id) => http.delete(`/management/menus/${id}`)
  },
  'system-departments': {
    list: () => http.get('/management/departments'),
    create: (data) => http.post('/management/departments', data),
    remove: (id) => http.delete(`/management/departments/${id}`)
  },
  'system-posts': {
    list: () => http.get('/management/positions'),
    create: (data) => http.post('/management/positions', data),
    remove: (id) => http.delete(`/management/positions/${id}`)
  },
  'system-permissions': {
    list: () => http.get('/management/permissions')
  },
  'system-projects': {
    list: (params) => http.post('/management/projects/list', params),
    create: (data) => http.post('/management/projects/create', data),
    get: (id) => http.post('/management/projects/detail', { value: id }),
    update: (id, data) => http.put(`/management/projects/${id}`, data),
    remove: (id) => http.delete(`/management/projects/${id}`),
    getBindings: (id) => http.post('/management/project-bindings/detail', { value: id }),
    updateBindings: (id, data) => http.post('/management/project-bindings/update', { value: id, ...data })
  },
  'system-short-links': {
    list: (params) => http.post('/short-links/list', params),
    generateCode: (data) => http.post('/short-links/generate-code', data),
    create: (data) => http.post('/short-links/create', data)
  }
}

export const getManagementResource = (name) => managementResources[name]
