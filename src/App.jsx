import './App.css'
import { CreditList } from './Components/CreditList/CreditList'
import { Hero } from './Components/Hero/Hero'
import Login from './Components/Login/Login'
import {BrowserRouter as Router,Routes,Route}from "react-router-dom"
import { Products } from './Components/Products/Products'
import { Creditlistdetail } from './Components/CreditList/Creditlistdetail'
import DetailedCategory from './Components/Products/detailedcat'
import { Outofstock } from './Components/Products/Outofstock'
import { Payment } from './Components/Payment'
import { Profile } from './Components/Profile/Profile'
import { Forgot } from './Components/Login/Forgot'
import { Update } from './Components/Login/Update'
import { History } from './Components/CreditList/History'
import { Updatestock } from './Components/Products/Updatestock'
import SalesGraph from './Components/Products/SalesGraph'
import Loader from './Components/Login/loader'

function App() {

  return (
    <>
    <Router>
      <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/hero' element={<Hero/>}/>
      <Route path="/creditlist" element={<CreditList/>}/>
      <Route path="/products" element={<Products/>}></Route>
      <Route path="/credits/:phonenumber/:username" element={<Creditlistdetail/>}></Route>
      <Route path="/detailcat/:category" element={<DetailedCategory />} />
      <Route path="/outofstock"element={<Outofstock/>}/>
      <Route path="/payment" element={<Payment/>}></Route>
      <Route path="/profile" element={<Profile/>}></Route>
      <Route path="/forgot" element={<Forgot/>}></Route>
      <Route path="/update" element={<Update/>}></Route>
      <Route path="/hist/:username/:phonenumber" element={<History/>}></Route>
      <Route path="/update/:productname" element={<Updatestock/>}></Route>
      <Route path="/SalesGraph/:productname" element={<SalesGraph/>}></Route>
      <Route path="/Loader" element={<Loader/>}></Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
