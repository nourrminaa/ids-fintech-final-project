import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './shared/ProtectedRoute'
import Layout from './shared/Layout'

import Login from './auth/Login'
import Dashboard from './dashboard/Dashboard'
import ProductList from './products/ProductList'
import ProductDetails from './products/ProductDetails'
import ProductForm from './products/ProductForm'
import ClientList from './clients/ClientList'
import ClientDetails from './clients/ClientDetails'
import ClientForm from './clients/ClientForm'
import DeploymentsList from './deployments/DeploymentsList'
import TeamList from './team/TeamList'
import UserManagement from './admin/UserManagement'
import Settings from './settings/Settings'
import NotFound from './shared/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

              <Route path="/products" element={<ProtectedRoute><Layout><ProductList /></Layout></ProtectedRoute>} />
              <Route path="/products/new" element={<ProtectedRoute><Layout><ProductForm /></Layout></ProtectedRoute>} />
              <Route path="/products/:id" element={<ProtectedRoute><Layout><ProductDetails /></Layout></ProtectedRoute>} />
              <Route path="/products/:id/edit" element={<ProtectedRoute><Layout><ProductForm /></Layout></ProtectedRoute>} />

              <Route path="/clients" element={<ProtectedRoute><Layout><ClientList /></Layout></ProtectedRoute>} />
              <Route path="/clients/new" element={<ProtectedRoute><Layout><ClientForm /></Layout></ProtectedRoute>} />
              <Route path="/clients/:id" element={<ProtectedRoute><Layout><ClientDetails /></Layout></ProtectedRoute>} />
              <Route path="/clients/:id/edit" element={<ProtectedRoute><Layout><ClientForm /></Layout></ProtectedRoute>} />

              <Route path="/deployments" element={<ProtectedRoute><Layout><DeploymentsList /></Layout></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Layout><TeamList /></Layout></ProtectedRoute>} />

              <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

              <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><UserManagement /></Layout></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  )
}
