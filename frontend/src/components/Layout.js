import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children, setPage }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setPage={setPage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
