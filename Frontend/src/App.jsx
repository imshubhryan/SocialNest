import { RouterProvider } from "react-router"
import {router} from './routes'
import "./style.scss"


const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App