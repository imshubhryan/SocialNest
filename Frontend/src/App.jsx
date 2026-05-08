import { BrowserRouter } from "react-router"
import AppRoutes from './routes'
import "./styles/globals.scss"
import { AuthProvider } from "./features/auth/auth.context" 
import { PostContextProvider } from "./features/post/post.context"

const App = () => {
  return (
    <AuthProvider>
      <PostContextProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PostContextProvider>
    </AuthProvider>
  )
}

export default App