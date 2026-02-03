import React, { useState } from "react";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import ProductPage from "./pages/ProductPage";
import TransactionPage from "./pages/TransactionPage";
import PredictionPage from "./pages/PredictionPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const token = localStorage.getItem("token");
  const [page, setPage] = useState("dashboard");

  if (!token) {
    return <LoginPage onLogin={() => window.location.reload()} />;
  }

  let content;
  switch (page) {
    case "dashboard":
      content = <DashboardPage setPage={setPage} />;
      break;
    case "products":
      content = <ProductPage />;
      break;
    case "transactions":
      content = <TransactionPage />;
      break;
    case "prediction":
      content = <PredictionPage />;
      break;
    default:
      content = <DashboardPage />;
  }

  return <Layout setPage={setPage}>{content}</Layout>;
}

export default App;
