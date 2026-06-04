import http from '../utils/http'

export const getProjects = (params) => http.post('/projects/list', params)

export const getProjectDetail = (value) => http.post('/projects/detail', { value })

export const getProjectGroups = () => http.post('/projects/groups')
