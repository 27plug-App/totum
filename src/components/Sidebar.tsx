import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  DollarSign, 
  BarChart, 
  MessageSquare, 
  Settings, 
  ClipboardCheck, 
  Shield,
  Building2,
  UserCog,
  PieChart,
  Bell,
  Clock,
  CreditCard,
  Stethoscope,
  Activity,
  Video,
  FileCheck,
  Folder,
  Home,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png'; 
import { MainHelper } from '../lib/helpers/main-helper';// Adjust the path as necessary
import { PermissionParams } from '../lib/config/permission-params';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', permission: null },
  { icon: Clock, label: 'Timesheet', path: '/timesheet', permission: null },
  
  // Clinical Section
  { type: 'section', label: 'Clinical', permission: PermissionParams.permission_manage_clinical },
  { icon: Stethoscope, label: 'Clinical Dashboard', path: '/clinical', permission: PermissionParams.permission_manage_clinical },
  { icon: Calendar, label: 'Schedule', path: '/schedule', permission: PermissionParams.permission_manage_clinical },
  { icon: ClipboardCheck, label: 'Treatment Plans', path: '/clinical/treatment-plans', permission: PermissionParams.permission_manage_clinical },
  { icon: FileCheck, label: 'Assessments', path: '/clinical/assessments', permission: PermissionParams.permission_manage_clinical },
  { icon: Activity, label: 'Outcomes', path: '/clinical/outcomes', permission: PermissionParams.permission_manage_clinical },
  { icon: Video, label: 'Telehealth', path: '/clinical/telehealth', permission: PermissionParams.permission_manage_clinical },
  { icon: FileText, label: 'Clinical Notes', path: '/clinical-notes', permission: PermissionParams.permission_manage_clinical },
  { icon: Shield, label: 'Authorizations', path: '/authorizations', permission: PermissionParams.permission_manage_authorizations },
  { icon: Folder, label: 'Documents', path: '/documents', permission: PermissionParams.permission_manage_documents },
  
  // Administrative Section
  { type: 'section', label: 'Administrative', permission: PermissionParams.permission_manage_billing },
  { icon: DollarSign, label: 'Billing', path: '/billing', permission: PermissionParams.permission_manage_billing },
  { icon: CreditCard, label: 'Payment Processing', path: '/admin/payment-processing', permission: PermissionParams.permission_manage_billing },
  { icon: Shield, label: 'Insurance Verification', path: '/admin/insurance', permission: PermissionParams.permission_manage_billing },
  { icon: FileText, label: 'Claims Management', path: '/admin/claims', permission: PermissionParams.permission_manage_billing },
  
  // Communication Section
  { type: 'section', label: 'Communication', permission: PermissionParams.permission_manage_messages },
  { icon: MessageSquare, label: 'Messages', path: '/messages', permission: null },
  
  // Analytics & Settings Section
  { type: 'section', label: 'Analytics & Settings', permission: PermissionParams.permission_manage_analytics },
  { icon: PieChart, label: 'Analytics', path: '/analytics', permission: PermissionParams.permission_manage_analytics },
  { icon: Building2, label: 'Organization', path: '/organization', permission: PermissionParams.permission_manage_organization },
  { icon: UserCog, label: 'User Management', path: '/users', permission: PermissionParams.permission_manage_users },
  //{ icon: Stethoscope, label: 'Clinical Management', path: '/clinical-management', permission: PermissionParams.permission_manage_users},
  { icon: Settings, label: 'Settings', path: '/settings', permission: null }
];

function Sidebar({ collapsed }: { collapsed: boolean}) {
  const location = useLocation();
  const { user, hasPermission, logout } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    item.type === 'section' || !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={logo}
                  alt="Totum Logo" 
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Totum</h1>
                <p className="text-sm text-gray-500">{user?.company_name}</p>
              </div>
            </div>
          </div>

          <div className="px-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {user?.getAvatar() ? (
                  <img 
                    src={user.getAvatar().url()} 
                    alt="User Avatar" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold">
                    {user?.getFirstName()?.charAt(0)}{user?.getLastName()?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.getFirstName()} {user?.getLastName()}
                </p>
                <p className="text-xs text-gray-500">{ MainHelper.getUserRole(user?.getRole() as string) }</p>
              </div>
            </div>
          </div>

          <nav className="px-4 space-y-1">
            {filteredMenuItems.map((item, index) => {

              if(item.permission !== null && !hasPermission(item.permission)){
                return null;
              }
             
              if (item.type === 'section') {
                return (
                  <div key={index} className="pt-6 pb-2">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </p>
                  </div>
                );
              } 

              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
          <button 
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg w-full"
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
        </aside>
      </div>
      
    </div>
  );
}

export default Sidebar;