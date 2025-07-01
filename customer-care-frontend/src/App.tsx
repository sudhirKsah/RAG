import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CustomerSupportPage from './components/CustomerSupportPage'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <div className="min-h-screen bg-black">
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<CustomerSupportPage />} />
            <Route path="/chat/:chatbotId" element={<CustomerSupportPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </div>
  )
}

export default App