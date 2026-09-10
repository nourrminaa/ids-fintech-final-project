// this is the one file that actually knows the backend exists, everything else
// in the app just calls the functions below and gets back plain data, same
// spirit as DataContext used to work off mockData, just real now

import type {
  Product, Client, Deployment, Module, TeamMember, User, Repository, ProductDocument, ProductResponsibility,
  ProductDetails, ClientDetails, DeploymentListItem, DashboardSummary, LoginResponse,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5015/api'
const TOKEN_KEY = 'ids_portal_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// thrown for any non 2xx response, message is whatever the backend sent back
// in its { message } body, or a generic fallback if it did not send one
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (options.body) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // 204 No Content has nothing to parse, everything else in this api is JSON
  if (response.status === 204) return undefined as T

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const message = body?.message || `Request failed with status ${response.status}`
    throw new ApiError(response.status, message)
  }

  return body as T
}

function query(params: Record<string, string | number | undefined | null>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return ''
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))
  return `?${search.toString()}`
}

// auth
export const login = (email: string, password: string) =>
  request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

// products
export const getProducts = (filters: { name?: string; lifecycleStatus?: string; technology?: string } = {}) =>
  request<Product[]>(`/products${query(filters)}`)

export const getProductDetails = (id: number) => request<ProductDetails>(`/products/${id}`)

export const createProduct = (product: Omit<Product, 'id'>) =>
  request<Product>('/products', { method: 'POST', body: JSON.stringify({ id: 0, ...product }) })

export const updateProduct = (id: number, product: Omit<Product, 'id'>) =>
  request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify({ id, ...product }) })

export const deleteProduct = (id: number) => request<void>(`/products/${id}`, { method: 'DELETE' })

export const addModule = (productId: number, module: Omit<Module, 'id' | 'productId'>) =>
  request<Module>(`/products/${productId}/modules`, { method: 'POST', body: JSON.stringify({ id: 0, productId, ...module }) })

export const deleteModule = (moduleId: number) => request<void>(`/products/modules/${moduleId}`, { method: 'DELETE' })

// Responsible Team, Repositories and Documentation on a product, all gated
// server side to admin or a team member already assigned to that product
export const addProductResponsibility = (productId: number, teamMemberId: number, responsibility: string, description: string) =>
  request<ProductResponsibility>(`/products/${productId}/responsibilities`, {
    method: 'POST',
    body: JSON.stringify({ teamMemberId, responsibility, description }),
  })

export const deleteProductResponsibility = (productId: number, responsibilityId: number) =>
  request<void>(`/products/${productId}/responsibilities/${responsibilityId}`, { method: 'DELETE' })

export const addRepository = (productId: number, repo: Omit<Repository, 'id' | 'productId'>) =>
  request<Repository>(`/products/${productId}/repositories`, { method: 'POST', body: JSON.stringify({ id: 0, productId, ...repo }) })

export const deleteRepository = (productId: number, repositoryId: number) =>
  request<void>(`/products/${productId}/repositories/${repositoryId}`, { method: 'DELETE' })

export const addDocument = (productId: number, document: Omit<ProductDocument, 'id' | 'productId'>) =>
  request<ProductDocument>(`/products/${productId}/documents`, { method: 'POST', body: JSON.stringify({ id: 0, productId, ...document }) })

export const deleteDocument = (productId: number, documentId: number) =>
  request<void>(`/products/${productId}/documents/${documentId}`, { method: 'DELETE' })

// clients
export const getClients = (filters: { companyName?: string; country?: string; productId?: number } = {}) =>
  request<Client[]>(`/clients${query(filters)}`)

export const getClientDetails = (id: number) => request<ClientDetails>(`/clients/${id}`)

export const createClient = (client: Omit<Client, 'id'>) =>
  request<Client>('/clients', { method: 'POST', body: JSON.stringify({ id: 0, ...client }) })

export const updateClient = (id: number, client: Omit<Client, 'id'>) =>
  request<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify({ id, ...client }) })

export const deleteClient = (id: number) => request<void>(`/clients/${id}`, { method: 'DELETE' })

export const addDeployment = (clientId: number, deployment: Omit<Deployment, 'id' | 'clientId'>) =>
  request<Deployment>(`/clients/${clientId}/deployments`, { method: 'POST', body: JSON.stringify({ id: 0, clientId, ...deployment }) })

export const enableModule = (clientId: number, deploymentId: number, moduleId: number) =>
  request<void>(`/clients/${clientId}/deployments/${deploymentId}/modules/${moduleId}`, { method: 'POST' })

export const disableModule = (clientId: number, deploymentId: number, moduleId: number) =>
  request<void>(`/clients/${clientId}/deployments/${deploymentId}/modules/${moduleId}`, { method: 'DELETE' })

// deployments (flat list page)
export const getDeployments = (filters: { productId?: number; clientId?: number; status?: string } = {}) =>
  request<DeploymentListItem[]>(`/deployments${query(filters)}`)

// team members
export const getTeamMembers = (filters: { fullName?: string; department?: string } = {}) =>
  request<TeamMember[]>(`/teammembers${query(filters)}`)

export const createTeamMember = (member: Omit<TeamMember, 'id'>) =>
  request<TeamMember>('/teammembers', { method: 'POST', body: JSON.stringify({ id: 0, ...member }) })

export const updateTeamMember = (id: number, member: Omit<TeamMember, 'id'>) =>
  request<TeamMember>(`/teammembers/${id}`, { method: 'PUT', body: JSON.stringify({ id, ...member }) })

export const deleteTeamMember = (id: number) => request<void>(`/teammembers/${id}`, { method: 'DELETE' })

// dashboard
export const getDashboardSummary = () => request<DashboardSummary>('/dashboard/summary')

// users (admin only)
export const getUsers = () => request<User[]>('/users')

export const createUser = (email: string, password: string, role: string, teamMemberId: number | null) =>
  request<User>('/users', { method: 'POST', body: JSON.stringify({ email, password, role, teamMemberId }) })

export const updateUser = (id: number, changes: { role?: string; isActive?: boolean; teamMemberId?: number }) =>
  request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
