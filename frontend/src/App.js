import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PaymentForm from './components/Payment/PaymentForm';
import TransactionHistory from './components/Payment/TransactionHistory';
import MerchantManagement from './components/Admin/MerchantManagement';
import Analytics from './components/Admin/Analytics';
import Navbar from './components/Common/Navbar';
import { useSelector } from 'react-redux';
import './styles/global.css';

function App() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      isAuthenticated === true
        ? <Component {...props} />
        : <Redirect to="/login" />
    )} />
  );

  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <PrivateRoute path="/payment" component={PaymentForm} />
        <PrivateRoute path="/history" component={TransactionHistory} />
        <PrivateRoute path="/merchants" component={MerchantManagement} />
        <PrivateRoute path="/analytics" component={Analytics} />
        <Route path="/" render={() => <Redirect to={isAuthenticated ? "/payment" : "/login"} />} />
      </Switch>
    </Router>
  );
}

export default App;