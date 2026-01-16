import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AppWrapper } from './components/common/PageMeta'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider>
                <AppWrapper>
                    <App />
                </AppWrapper>
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>
)
