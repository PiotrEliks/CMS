import { SidebarProvider, useSidebar } from '../context/SidebarContext'
import { Outlet } from 'react-router'
import AppHeader from './AppHeader'
import Backdrop from './Backdrop'
import AppSidebar from './AppSidebar'
import Loader from '../ui/Loader/Loader'

const LayoutContent: React.FC<{ loading: boolean }> = ({ loading }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()

  return (
    <div className="h-screen xl:flex overflow-hidden">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <AppHeader />
        <div className="flex-1 p-4 mx-auto w-full md:p-6 bg-white dark:bg-gray-800 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <Loader />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  )
}

const AppLayout: React.FC<{ loading: boolean }> = ({ loading }) => {
  return (
    <SidebarProvider>
      <LayoutContent loading={loading} />
    </SidebarProvider>
  )
}

export default AppLayout
