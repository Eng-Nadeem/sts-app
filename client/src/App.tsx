import { Route, Switch } from "wouter";
import DashboardScreen from "@/pages/DashboardScreen";
import RechargeScreen from "@/pages/RechargeScreen";
import PaymentConfirmationScreen from "@/pages/PaymentConfirmationScreen";
import ProcessingScreen from "@/pages/ProcessingScreen";
import SuccessScreen from "@/pages/SuccessScreen";
import ErrorScreen from "@/pages/ErrorScreen";
import TransactionHistoryScreen from "@/pages/TransactionHistoryScreen";
import ProfileScreen from "@/pages/ProfileScreen";
import MetersScreen from "@/pages/MetersScreen";
import DebtsScreen from "@/pages/DebtsScreen";
import WalletScreen from "@/pages/WalletScreen";
import PayDebtScreen from "@/pages/PayDebtScreen";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto pb-16 pt-1">
        <Switch>
          <Route path="/" component={DashboardScreen} />
          <Route path="/recharge" component={RechargeScreen} />
          <Route path="/payment-confirmation" component={PaymentConfirmationScreen} />
          <Route path="/processing" component={ProcessingScreen} />
          <Route path="/success" component={SuccessScreen} />
          <Route path="/error" component={ErrorScreen} />
          <Route path="/history" component={TransactionHistoryScreen} />
          <Route path="/profile" component={ProfileScreen} />
          <Route path="/meters" component={MetersScreen} />
          <Route path="/debts" component={DebtsScreen} />
          <Route path="/wallet" component={WalletScreen} />
          <Route path="/pay-debt/:id" component={PayDebtScreen} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNavigation />
    </div>
  );
}

export default App;
