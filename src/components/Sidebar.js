import React, { useEffect, useRef } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CheckSquareOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

export default function Sidebar({ role, open, onClose }) {

  const sidebarRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  const links = [
    {
      key: '/Erp_Mnmjec/dashboard',
      label: 'Dashboard',
      icon: <DashboardOutlined />,
      roles: ['Staff', 'student', 'CA', 'HOD', 'Principal'],
    },
    {
      key: '/Erp_Mnmjec/students',
      label: 'Students',
      icon: <UserOutlined />,
      roles: ['CA', 'HOD', 'Principal'],
    },
    {
      key: '/Erp_Mnmjec/faculty',
      label: 'faculty',
      icon: <UserOutlined />,
      roles: ['HOD', 'Principal'],
    },
    {
      key: '/Erp_Mnmjec/attendance',
      label: 'Attendance',
      icon: <CheckSquareOutlined />,
      roles: ['Staff', 'student', 'CA', 'HOD'],
    },
    {
      key: '/Erp_Mnmjec/marks',
      label: 'Marks',
      icon: <CheckSquareOutlined />,
      roles: ['Staff', 'Principal', 'student','CA', 'HOD'],
    },
      {
      key: '/Erp_Mnmjec/fees',
      label: 'Fees',
      icon: <CheckSquareOutlined />,
      roles: ['Staff', 'Principal','F&A' ,'student','CA', 'HOD'],
    },
    {
      key: '/Erp_Mnmjec/late',
      label: 'Late arrival',
      icon: <FileTextOutlined />,
      roles: ['CA', 'HOD', 'Principal'],
    },
    {
      key: '/Erp_Mnmjec/reports',
      label: 'Reports',
      icon: <FileTextOutlined />,
      roles: ['CA', 'HOD', 'Principal'],
    },
    {
      key: '/Erp_Mnmjec/SecurityLateEntry',
      label: 'SecurityLateEntry',
      icon: <FileTextOutlined />,
      roles: ['Security'],
    },
  ];

  const menuItems = links
    .filter(link => link.roles.includes(role))
    .map(link => ({
      key: link.key,
      icon: link.icon,
      label: link.label,
    }));

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 transform
        ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300
      `}
    >
      {/* Header / Logo */}
      <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
        My App
      </div>

      {/* Menu */}
      <nav className="mt-4 flex flex-col">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={`
              w-full text-left px-6 py-3 hover:bg-slate-700 
              ${location.pathname === item.key ? 'bg-slate-800' : ''}
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
