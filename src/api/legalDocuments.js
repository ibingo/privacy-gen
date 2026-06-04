import http from '../utils/http'

export const listPrivacyPoliciesApi = (data) => http.post('/privacy-policies/list', data)
export const createPrivacyPolicyApi = (data) => http.post('/privacy-policies/create', data)
export const getPrivacyPolicyDetailApi = (policyId) => http.post('/privacy-policies/detail', { policyId })
export const updatePrivacyPolicyApi = (policyId, data) => http.post('/privacy-policies/update', { policyId, ...data })
export const publishPrivacyPolicyApi = (data) => http.post('/privacy-policies/publish', data)
export const listUserAgreementsApi = (data) => http.post('/user-agreements/list', data)
export const createUserAgreementApi = (data) => http.post('/user-agreements/create', data)
export const getUserAgreementDetailApi = (agreementId) => http.post('/user-agreements/detail', { agreementId })
export const updateUserAgreementApi = (agreementId, data) => http.post('/user-agreements/update', { agreementId, ...data })
export const publishUserAgreementApi = (data) => http.post('/user-agreements/publish', data)
