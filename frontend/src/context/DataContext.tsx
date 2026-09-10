import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Product, Client } from '../types'
import * as api from '../lib/api'

/* this used to hold every entity in one big set of mock arrays, now it only
   holds the two lists that get read from more than one page at once
   (Navbar's search, the product/client filter dropdowns on other list pages),
   everything else fetches what it needs directly from lib/api, see
   ProductDetails/ClientDetails for the aggregate pages, and ProductList/
   ClientList/TeamList/DeploymentsList for their own filtered fetches */

type DataContextValue = {
  products: Product[]
  clients: Client[]
  loadingProducts: boolean
  loadingClients: boolean
  productsError: string | null
  clientsError: string | null
  refetchProducts: () => Promise<void>
  refetchClients: () => Promise<void>

  addProduct: (p: Omit<Product, 'id'>) => Promise<Product>
  updateProduct: (id: number, p: Omit<Product, 'id'>) => Promise<Product>
  deleteProduct: (id: number) => Promise<void>

  addClient: (c: Omit<Client, 'id'>) => Promise<Client>
  updateClient: (id: number, c: Omit<Client, 'id'>) => Promise<Client>
  deleteClient: (id: number) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingClients, setLoadingClients] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [clientsError, setClientsError] = useState<string | null>(null)

  const refetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    setProductsError(null)
    try {
      setProducts(await api.getProducts())
    } catch (err) {
      console.error('failed to load products', err)
      setProductsError(err instanceof api.ApiError ? err.message : 'Could not reach the server')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  const refetchClients = useCallback(async () => {
    setLoadingClients(true)
    setClientsError(null)
    try {
      setClients(await api.getClients())
    } catch (err) {
      console.error('failed to load clients', err)
      setClientsError(err instanceof api.ApiError ? err.message : 'Could not reach the server')
    } finally {
      setLoadingClients(false)
    }
  }, [])

  useEffect(() => {
    refetchProducts()
    refetchClients()
  }, [refetchProducts, refetchClients])

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const created = await api.createProduct(p)
    await refetchProducts()
    return created
  }

  const updateProduct = async (id: number, p: Omit<Product, 'id'>) => {
    const updated = await api.updateProduct(id, p)
    await refetchProducts()
    return updated
  }

  const deleteProduct = async (id: number) => {
    await api.deleteProduct(id)
    await refetchProducts()
  }

  const addClient = async (c: Omit<Client, 'id'>) => {
    const created = await api.createClient(c)
    await refetchClients()
    return created
  }

  const updateClient = async (id: number, c: Omit<Client, 'id'>) => {
    const updated = await api.updateClient(id, c)
    await refetchClients()
    return updated
  }

  const deleteClient = async (id: number) => {
    await api.deleteClient(id)
    await refetchClients()
  }

  const value: DataContextValue = {
    products, clients, loadingProducts, loadingClients, productsError, clientsError, refetchProducts, refetchClients,
    addProduct, updateProduct, deleteProduct,
    addClient, updateClient, deleteClient,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
