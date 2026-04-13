import { RouterProvider } from "react-router"
import {router} from './routes'
import "./style.scss"
import { AuthProvider } from "./features/auth/auth.context" 


const App = () => {
  return (
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App