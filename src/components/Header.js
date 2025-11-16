import React, { useState } from 'react';
import { Layout, Dropdown, Menu, Badge, Button } from 'antd';
import { BellOutlined, UserOutlined, LogoutOutlined, DownOutlined, MenuOutlined } from '@ant-design/icons';
import Login from './Login';
import logo from '../assests/logo2.png';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';




const { Header } = Layout;


export default function PremiumHeader({ user, onLogin, onLogout, onMenuClick, onHamburgerClick }) {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();



  const handleLoginSuccess = (userData) => {
    onLogin(userData);
    setShowLogin(false);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleLogoutClick = () => {
    onLogout();
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: 'logout',
          label: 'Logout',
          icon: <LogoutOutlined style={{ color: 'red' }} />,
          onClick: handleLogoutClick,
        },
      ]}
    />
  );

  const shouldShowLogin = showLogin && location.pathname !== '/forgotpassword';


  return (
    <>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 24px',
          height: 64,
          background: 'linear-gradient(90deg, #1c3faa, #3a7bd5)',
          color: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}
      >
        {/* Left: Logo / Brand / Menu Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ fontSize: 18, color: '#fff' }} />}
            onClick={handleBackClick}
            style={{
              display: location.pathname === '/' ? 'none' : 'flex',
              alignItems: 'center',
              color: '#fff',
              fontWeight: 600,
            }}
          >

          </Button>



          <Link to="/Erp_Mnmjec/home">
            <img
              src={logo}
              alt="MNMJEC ERP Logo"
              style={{ height: 40, width: "100%", cursor: 'pointer', backgroundColor: '#fff', padding: 4 }}
            />
          </Link>
          {/* <Link to="/">
            <img
              src={logo}
              alt="MNMJEC ERP Logo"
              style={{ height: 60, cursor: 'pointer',  padding: 4 }}
            />
          </Link> */}

          <Link to="/Erp_Mnmjec/home" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#fff', cursor: 'pointer' }}>
              MNMJEC
            </span>
          </Link>
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: 20, color: '#fff' }} />}
            onClick={onHamburgerClick}
            onMouseEnter={onHamburgerClick}
          />

        </div>

        {/* Right: Notifications + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Notification */}
          <Badge dot>
            <BellOutlined style={{ fontSize: 20, color: '#fff', cursor: 'pointer' }} />
          </Badge>

          {/* User */}
          {user ? (
            <Dropdown overlay={userMenu} trigger={['click']}>
              <Button
                type="default"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 600,
                  color: '#1c3faa',
                  background: '#fff',
                  borderRadius: 8,
                  padding: '4px 12px',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                <UserOutlined style={{ fontSize: 16 }} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <DownOutlined style={{ fontSize: 12 }} />
              </Button>
            </Dropdown>
          ) : (
            <Button
              type="default"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
                color: '#1c3faa',
                background: '#fff',
                borderRadius: 8,
                padding: '4px 12px',
                border: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }}
              onClick={() => setShowLogin(true)}
            >
              <UserOutlined style={{ fontSize: 16 }} />
              Sign In
            </Button>
          )}
        </div>
      </Header>

      {/* Login Modal */}
      {shouldShowLogin && <Login onClose={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />}
    </>
  );
}
